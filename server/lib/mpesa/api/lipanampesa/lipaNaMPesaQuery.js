const express = require('express');

const lipaNaMpesaQueryRouter = express.Router();
const moment = require('moment');
const auth = require('../../auth');

const { lipaNaMpesaConfigs } = require('../../../../config/mpesa');
const mpesaFunctions = require('../../helpers/mpesaFunctions');

const LIPA_NA_MPESA_SERVICE_NAME = 'STK-PUSH';

const queryDBForRecord = (req, res, next) => {
  req.body.service = LIPA_NA_MPESA_SERVICE_NAME;
  // Check validity of request
  if (!req.body) {
    mpesaFunctions.handleError(res, 'Invalid message received');
  }

  // Fetch from database
  mpesaFunctions.fetchLipaNaMpesa(
    {
      MerchantRequestID: req.body.merchantRequestId,
      CheckoutRequestID: req.body.checkoutRequestId,
    },
    req,
    res,
    next
  );
};

const confirmSourceOfTrnx = (req, res, next) => {
  // If transaction is not found, query safaricom for result
  if (req.lipaNaMPesaTransaction) {
    req.tnxFoundLocally = true;
    next();
  } else {
    console.log('Query safaricom');
    // Query
    const BusinessShortCode = lipaNaMpesaConfigs.shortCode;
    const timeStamp = moment().format('YYYYMMDDHHmmss');
    const rawPass = BusinessShortCode + lipaNaMpesaConfigs.key + timeStamp;

    req.mpesaTransaction = {
      BusinessShortCode,
      Password: Buffer.from(rawPass, 'utf8').toString('base64'),
      Timestamp: timeStamp,
      CheckoutRequestID: req.body.checkoutRequestId,
    };
    console.log('Req obj created');
    // Add auth token then send to safaricom
    auth(req, res, next);
  }
};

const querySafaricomForRecord = (req, res, next) => {
  // Set url, AUTH token and transaction
  mpesaFunctions.sendMpesaTxnToSafaricomAPI(
    {
      url: lipaNaMpesaConfigs.queryRequest,
      auth: `Bearer ${req.transactionToken}`,
      transaction: req.mpesaTransaction,
    },
    req,
    res,
    next
  );
};

const result = (req, res, next) => {
  if (req.transactionResp) console.log(req.transactionResp);

  if (req.tnxFoundLocally) {
    res.json({
      merchantRequestId: req.lipaNaMPesaTransaction.mpesaInitResponse.MerchantRequestID,
      checkoutRequestId: req.lipaNaMPesaTransaction.mpesaInitResponse.CheckoutRequestID,
      message: req.lipaNaMPesaTransaction.mpesaInitResponse.ResponseDescription,
      status:
        req.lipaNaMPesaTransaction.mpesaInitResponse.ResponseCode === '0'
          ? '00'
          : req.lipaNaMPesaTransaction.mpesaInitResponse.ResponseCode,
    });
  } else {
    res.json({
      merchantRequestId: req.body.merchantRequestId,
      checkoutRequestId: req.body.checkoutRequestId,
      message: req.statusMessage,
      status: req.code,
    });
  }
  next();
};

lipaNaMpesaQueryRouter.post(
  '/',
  queryDBForRecord,
  confirmSourceOfTrnx,
  querySafaricomForRecord,
  result
);

module.exports = lipaNaMpesaQueryRouter;
