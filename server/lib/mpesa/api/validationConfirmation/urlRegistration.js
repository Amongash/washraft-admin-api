const express = require('express');

const c2bRegistrationRouter = express.Router();

// Then load properties from a designated file.
const properties = require('nconf');

const auth = require('../../auth');
const mpesaFunctions = require('../../helpers/mpesaFunctions');

const GENERIC_SERVER_ERROR_CODE = '01';

properties.file({ file: 'config/properties.json' });

const CallbackURLModel = require('./c2bCallbackUrlModel');

const C2B_URL_REGISTRATION_SERVICE_NAME = 'C2B-URL-REGISTRATION';

/**
 * Save merchant call backs to database
 * @param req
 * @param res
 * @param next
 */
const registerMerchantCallBackUrl = (req, res, next) => {
  if (mpesaFunctions.isEmpty(req.body))
    return mpesaFunctions.handleError(res, 'Invalid request received', '01');

  // Check initial registration
  const query = CallbackURLModel.findOne({
    shortCode: req.body.shortCode,
  });

  // Execute query
  query.exec((err, callbackURLs) => {
    // handle error
    if (err)
      return mpesaFunctions.handleError(
        res,
        `Error fetching url registration object ${err.message}`,
        GENERIC_SERVER_ERROR_CODE
      );

    //  New record
    const newRecord = {
      shortCode: req.body.shortCode,
      merchant: {
        confirmation: req.body.confirmationURL,
        validation: req.body.validationURL,
      },
    };

    if (callbackURLs) {
      console.log('Updating C2B Urls to local database');
      //    Update record
      const filter = {
        shortCode: req.body.shortCode,
      };
      const options = { multi: true };
      CallbackURLModel.update(filter, newRecord, options, function(err) {
        if (err)
          return mpesaFunctions.handleError(
            res,
            `Unable to update transaction ${err.message}`,
            GENERIC_SERVER_ERROR_CODE
          );

        next();
      });
    } else {
      console.log('Saving C2B Urls to local database');
      const callbackUrl = new CallbackURLModel(newRecord);
      //  Save new record
      callbackUrl.save(error => {
        if (error) return mpesaFunctions.handleError(res, error.message, GENERIC_SERVER_ERROR_CODE);
      });
    }
    return next();
  });
};

/**
 * Save API request to
 * @param req
 * @param res
 * @param next
 */
const registerAPICallBackUrl = function(req, res, next) {
  //    Prepare request object
  const URLsRegistrationObject = {
    ValidationURL: properties.get('validationConfirm:validationURL'),
    ConfirmationURL: properties.get('validationConfirm:confirmationURL'),
    ResponseType: properties.get('validationConfirm:responseType'),
    ShortCode: properties.get('validationConfirm:shortCode'),
  };

  // Set url, AUTH token and transaction
  mpesaFunctions.sendMpesaTxnToSafaricomAPI(
    {
      url: properties.get('validationConfirm:registerURLs'),
      auth: `Bearer ${req.transactionToken}`,
      transaction: URLsRegistrationObject,
    },
    req,
    res,
    next
  );
};

const setServiceName = function(req, res, next) {
  req.body.service = C2B_URL_REGISTRATION_SERVICE_NAME;
  next();
};

/**
 * API Service call back URL set up.
 * Safaricom will use the end point to send Validation and Confirmation requests
 */
c2bRegistrationRouter.put(
  '/register/safaricom',
  setServiceName,
  auth,
  registerAPICallBackUrl,
  function(req, res, next) {
    res.json({
      status: '00',
      message:
        req.transactionResp.ResponseDescription || 'API Service URLs registered successfully',
    });
  }
);

/**
 * Merchant call back registration URL
 */
c2bRegistrationRouter.post(
  '/register/merchant',
  setServiceName,
  registerMerchantCallBackUrl,
  function(req, res, next) {
    res.json({
      status: '00',
      message: `Merchant URLs registration successful for pay bill ${req.body.shortCode}`,
    });
  }
);

module.exports = c2bRegistrationRouter;
