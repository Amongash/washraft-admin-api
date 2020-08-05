const express = require('express');

const c2bConfirmationRouter = express.Router();

const moment = require('moment');
const mpesaFunctions = require('../../helpers/mpesaFunctions');
const C2BTransaction = require('./c2bTransactionModel');
const CallbackURLModel = require('./c2bCallbackUrlModel');

const GENERIC_SERVER_ERROR_CODE = '01';
const CONFIRMATION_TRANSACTION_ACTION_TYPE = 'confirmation';

/**
 * Find validation request that is being confirmed by current request
 * @param req
 * @param res
 * @param next
 */
const findInitialTransaction = (req, res, next) => {
  // Invalid body request
  if (!req.body)
    mpesaFunctions.handleError(res, 'Invalid request received', GENERIC_SERVER_ERROR_CODE);

  C2BTransaction.findOne(
    {
      'validation.MSISDN': req.body.MSISDN,
      'validation.BillRefNumber': req.body.BillRefNumber,
      'validation.TransID': req.body.TransID,
    },
    (err, validatedTnx) => {
      // Check for error
      if (err)
        return mpesaFunctions.handleError(
          res,
          'Error occurred fetching initial request',
          GENERIC_SERVER_ERROR_CODE
        );

      // Initial transaction not found
      if (mpesaFunctions.isEmpty(validatedTnx))
        return mpesaFunctions.handleError(res, 'Transaction not found', GENERIC_SERVER_ERROR_CODE);

      console.log(
        'C2B Validation transaction found for %s Bill reference number %s.',
        validatedTnx.validation.MSISDN,
        validatedTnx.validation.BillRefNumber
      );
      req.body.tnxFound = true;
      return next();
    }
  );
};

/**
 * Prepare and send confirmation message to remote server
 * @param req
 * @param res
 * @param next
 */
const sendRequestToRemoteApplication = (req, res, next) => {
  // Prepare object
  const confirmationReq = {
    transactionType: req.body.TransactionType,
    action: CONFIRMATION_TRANSACTION_ACTION_TYPE,
    phone: req.body.MSISDN,
    firstName: req.body.FirstName,
    middleName: req.body.MiddleName,
    lastName: req.body.LastName,
    OrgAccountBalance: req.body.OrgAccountBalance,
    amount: req.body.TransAmount,
    accountNumber: req.body.BillRefNumber,
    transID: req.body.TransID,
    time: moment(moment(req.body.TransTime, 'YYYYMMDDHHmmss')).format('YYYY-MM-DD HH:mm:ss'),
  };

  // Find remote URL configuration from database
  CallbackURLModel.findOne(
    {
      shortCode: req.body.BusinessShortCode,
    },
    (err, remoteEndPoints) => {
      // Invalid database response
      if (mpesaFunctions.isEmpty(remoteEndPoints))
        return mpesaFunctions.handleError(
          res,
          `Pay bill ${req.body.BusinessShortCode} remote URLs not registered`,
          GENERIC_SERVER_ERROR_CODE
        );

      console.log('Confirmation Request %s', JSON.stringify(confirmationReq));
      // Forward to remote server
      return mpesaFunctions.sendCallbackMpesaTxnToAPIInitiator(
        {
          url: remoteEndPoints.merchant.confirmation,
          transaction: confirmationReq,
        },
        req,
        res,
        next
      );
    }
  );
};

/**
 * Save the confirmation request to the database.
 * @param req
 * @param res
 * @param next
 */
const saveTransaction = (req, res, next) => {
  const filter = {
    'validation.MSISDN': req.body.MSISDN,
    'validation.BillRefNumber': req.body.BillRefNumber,
    'validation.TransID': req.body.TransID,
  };
  // Update initial validation transaction
  C2BTransaction.update(filter, { $set: { confirmation: req.body } }, { upsert: true }, err => {
    if (err)
      return mpesaFunctions.handleError(
        req,
        'Unable to save validation request.',
        GENERIC_SERVER_ERROR_CODE
      );

    console.log(
      'Tnx Id: %s from %s for %s update successfully',
      req.body.TransID,
      req.body.MSISDN,
      req.body.BillRefNumber
    );
    return next();
  });
};

c2bConfirmationRouter.post(
  '/',
  findInitialTransaction,
  sendRequestToRemoteApplication,
  saveTransaction,
  (req, res, next) => {
    // Static response as customer account is already debited
    res.json({
      ResultCode: 0,
      ResultDesc: 'Transaction confirmation successful',
      ThirdPartyTransID: '',
    });
    next();
  }
);

module.exports = c2bConfirmationRouter;
