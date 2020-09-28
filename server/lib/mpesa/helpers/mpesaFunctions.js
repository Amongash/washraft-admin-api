/* eslint-disable no-console */
const request = require('request');

// Lipa Na M-pesa model
const LipaNaMpesa = require('../api/lipanampesa/lipaNaMPesaTnxModel');

const GENERIC_SERVER_ERROR_CODE = '01';

/**
 * Handle errors
 * @param res
 * @param message
 * @param code
 */
const handleError = (res, message, code) => {
  // Transaction failed
  res.send({
    status: code || GENERIC_SERVER_ERROR_CODE,
    message,
  });
};

/**
 * Handle Http responses
 * @param responseData
 * @param req
 * @param res
 * @param next
 */
// eslint-disable-next-line consistent-return
const httpResponseBodyProcessor = (responseData, req, res, next) => {
  console.log(`HttpResponseBodyProcessor: ${JSON.stringify(responseData)}`);
  if (responseData.body) {
    if (responseData.body.ResponseCode === '0') {
      console.log(`POST Resp: ${JSON.stringify(responseData.body)}`);
      // Successful processing
      req.transactionResp = responseData.body;
      next();
    } else if (responseData.body.ResponseDescription === 'success') {
      console.log(`POST Resp: ${JSON.stringify(responseData.body)}`);
      // Successful processing
      req.transactionResp = responseData.body;
      next();
    } else {
      return handleError(
        res,
        'Invalid remote response',
        responseData.body.errorCode || GENERIC_SERVER_ERROR_CODE
      );
    }
  } else {
    console.log(`Error occurred: ${JSON.stringify(responseData.body)}`);
    return handleError(
      res,
      'Invalid remote response',
      responseData.body.errorCode || GENERIC_SERVER_ERROR_CODE
    );
  }
};

/**
 * Send all transaction requests to safaricom
 * @param txnDetails
 * @param req
 * @param res
 * @param next
 */
const sendMpesaTxnToSafaricomAPI = (txnDetails, req, res, next) => {
  request(
    {
      method: 'POST',
      url: txnDetails.url,
      headers: {
        Authorization: txnDetails.auth,
      },
      json: txnDetails.transaction,
    },
    (error, response, body) => {
      httpResponseBodyProcessor(
        {
          body,
          error,
        },
        req,
        res,
        next
      );
    }
  );
};

/**
 * Send requests to API initiators
 * @param txnDetails
 * @param req
 * @param res
 * @param next
 */
const sendCallbackMpesaTxnToAPIInitiator = (txnDetails, req, res, next) => {
  console.log(`Requesting: ${JSON.stringify(txnDetails)}`);
  request(
    {
      method: 'POST',
      url: txnDetails.url,
      json: txnDetails.transaction,
    },
    (error, response, body) => {
      httpResponseBodyProcessor(
        {
          body,
          error,
        },
        req,
        res,
        next
      );
    }
  );
};

/**
 * Query database for lipa Na Mpesa transaction
 * @param req
 * @param res
 * @param next
 * @param keys
 */
const fetchLipaNaMpesaTransaction = (keys, req, res, next) => {
  console.log('Fetch initial transaction request...');
  // Check validity of message
  if (!req.body) {
    handleError(res, 'Invalid message received');
  }

  const query = LipaNaMpesa.findOne({
    'mpesaInitResponse.MerchantRequestID': keys.MerchantRequestID,
    'mpesaInitResponse.CheckoutRequestID': keys.CheckoutRequestID,
  });

  // execute the query at a later time
  query.exec((err, lipaNaMPesaTransaction) => {
    // handle error
    if (err) {
      handleError(res, 'Lipa Mpesa transaction not found');
    } else if (!lipaNaMPesaTransaction) {
      console.log('Lipa Mpesa transaction not found');
      next();
    } else {
      console.log('Transaction request found...');
      // Add transaction to req body
      req.lipaNaMPesaTransaction = lipaNaMPesaTransaction;
      next();
    }
  });
};

const isEmpty = val => {
  return val === undefined && val === null && val.length <= 0;
};

// Export model
module.exports = {
  isEmpty,
  handleError,
  sendMpesaTxnToSafaricomAPI,
  sendCallbackMpesaTxnToAPIInitiator,
  fetchLipaNaMpesa: fetchLipaNaMpesaTransaction,
};
