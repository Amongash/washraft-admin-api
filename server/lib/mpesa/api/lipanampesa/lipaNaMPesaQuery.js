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
  console.log('Restructruring mpesa transaction...');
  const timeStamp = moment().format('YYYYMMDDHHmmss');

  if (req.lipaNaMPesaTransaction) {
    const tnx = req.lipaNaMPesaTransaction.mpesaInitRequest;
    const rawPass = tnx.BusinessShortCode + lipaNaMpesaConfigs.key + timeStamp;
    req.mpesaTransaction = {
      BusinessShortCode: tnx.BusinessShortCode,
      Password: Buffer.from(rawPass, 'utf8').toString('base64'),
      Timestamp: timeStamp,
      CheckoutRequestID: req.body.checkoutRequestId,
    };
    req.tnxFoundLocally = true;
    next();
  } else {
    console.log('Query safaricom');
    // Query
    const BusinessShortCode = lipaNaMpesaConfigs.shortCode;

    const rawPass = BusinessShortCode + lipaNaMpesaConfigs.key + timeStamp;

    req.mpesaTransaction = {
      BusinessShortCode,
      Password: Buffer.from(rawPass, 'utf8').toString('base64'),
      Timestamp: timeStamp,
      CheckoutRequestID: req.body.checkoutRequestId,
    };
    console.log(`Req obj created:`, req.mpesaTransaction);
  }
};

const querySafaricomForRecord = (req, res, next) => {
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
};

lipaNaMpesaQueryRouter.post(
  '/',
  queryDBForRecord,
  confirmSourceOfTrnx,
  auth,
  querySafaricomForRecord,
  result
);

module.exports = lipaNaMpesaQueryRouter;
