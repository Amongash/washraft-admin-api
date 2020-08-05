const express = require('express');

const stkPushRouter = express.Router();
const moment = require('moment');

// Lipa Na M-pesa model
const properties = require('nconf');
const LipaNaMpesa = require('./lipaNaMPesaTnxModel');

const auth = require('../../auth');
const mpesaFunctions = require('../../helpers/mpesaFunctions');
// Then load properties from a designated file.

properties.file({ file: '../../../../config/properties.json' });

const LIPA_NA_MPESA_SERVICE_NAME = 'STK-PUSH';
const GENERIC_SERVER_ERROR_CODE = '01';

/**
 * Build request object
 * @param req
 * @param res
 * @param next
 */
const bootstrapRequest = (req, res, next) => {
  req.body.service = LIPA_NA_MPESA_SERVICE_NAME;
  const request = req.body;

  console.log('===========', request.phoneNumber);
  /** **************************
     {"amount":"5","phoneNumber":"2547******","callBackURL":"http://some-url","accountReference":"123456","description":"school fees"}
     ****************************** */
  if (
    !(
      request.amount ||
      request.phoneNumber ||
      request.callBackURL ||
      request.accountReference ||
      request.description
    )
  ) {
    mpesaFunctions.handleError(res, 'Invalid request received');
  } else {
    const BusinessShortCode = properties.get('lipaNaMpesa:shortCode');
    const timeStamp = moment().format('YYYYMMDDHHmmss');
    const rawPass = BusinessShortCode + properties.get('lipaNaMpesa:key') + timeStamp;
    // Request object
    req.mpesaTransaction = {
      BusinessShortCode,
      Password: Buffer.from(rawPass).toString('base64'),
      Timestamp: timeStamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: request.amount,
      PartyA: request.phoneNumber,
      PartyB: BusinessShortCode,
      PhoneNumber: request.phoneNumber,
      CallBackURL: properties.get('lipaNaMpesa:callBackURL'),
      AccountReference: request.accountReference,
      TransactionDesc: request.description,
    };
    console.log(` POST Req: ${JSON.stringify(req.mpesaTransaction)}`);
    next();
  }
};

/**
 * Post transaction to Mpesa
 */
const postTransaction = (req, res, next) => {
  // Set url, AUTH token and transaction
  mpesaFunctions.sendMpesaTxnToSafaricomAPI(
    {
      url: properties.get('lipaNaMpesa:processRequest'),
      auth: `Bearer ${req.transactionToken}`,
      transaction: req.mpesaTransaction,
    },
    req,
    res,
    next
  );
};

const processResponse = (req, res, next) => {
  // Prepare external response message
  console.log('Process response');
  req.merchantMsg = {
    status: req.transactionResp.ResponseCode === '0' ? '00' : req.transactionResp.ResponseCode,
    message: req.transactionResp.ResponseDescription,
    merchantRequestId: req.transactionResp.MerchantRequestID,
    checkoutRequestId: req.transactionResp.CheckoutRequestID,
  };
  // Prepare persistence object
  const transaction = new LipaNaMpesa({
    request: req.body,
    mpesaInitRequest: req.mpesaTransaction,
    mpesaInitResponse: req.transactionResp,
  });
  // Persist transaction object
  transaction.save(err => {
    if (err) {
      mpesaFunctions.handleError(
        res,
        `Unable to persist lipa na mpesa transaction ${err.message}`,
        GENERIC_SERVER_ERROR_CODE
      );
    } else {
      next();
    }
  });
};

/**
 * Use this API to initiate online payment on behalf of a customer
 */

stkPushRouter.post(
  '/process',
  bootstrapRequest,
  auth,
  postTransaction,
  processResponse,
  (req, res) => {
    // Check processing status
    res.json(req.merchantMsg);
  }
);

/**
 * Process callback request from safaricom
 * @param req
 * @param res
 * @param next
 */
const fetchTransaction = (req, res, next) => {
  console.log('Fetch initial transaction request...');
  // Check validity of message
  if (!req.body) {
    mpesaFunctions.handleError(res, 'Invalid message received');
  }

  const query = LipaNaMpesa.findOne({
    'mpesaInitResponse.MerchantRequestID': req.body.Body.stkCallback.MerchantRequestID,
    'mpesaInitResponse.CheckoutRequestID': req.body.Body.stkCallback.CheckoutRequestID,
  });

  // execute the query at a later time
  query.exec((err, lipaNaMPesaTransaction) => {
    // handle error
    if (err || !lipaNaMPesaTransaction) {
      mpesaFunctions.handleError(res, 'Initial Mpesa transaction not found');
    }
    console.log('Initial transaction request found...');
    // Add transaction to req body
    req.lipaNaMPesaTransaction = lipaNaMPesaTransaction;
    next();
  });
};

const updateTransaction = (req, res, next) => {
  console.log('update Transaction Callback...');

  const conditions = {
    'mpesaInitResponse.MerchantRequestID': req.body.Body.stkCallback.MerchantRequestID,
    'mpesaInitResponse.CheckoutRequestID': req.body.Body.stkCallback.CheckoutRequestID,
  };

  const options = { multi: true };

  // Set callback request to existing transaction
  req.lipaNaMPesaTransaction.mpesaCallback = req.body.Body;
  // Update existing transaction
  LipaNaMpesa.update(conditions, req.lipaNaMPesaTransaction, options, err => {
    if (err) {
      mpesaFunctions.handleError(res, 'Unable to update transaction');
    }
    next();
  });
};

/**
 * Fetch reference number from Mpesa callback 'Item' array
 * @param item
 * @returns {*}
 */
const fetchMpesaReferenceNumber = item => {
  if (item) {
    if (item.length) {
      for (let i = 0; i < item.length; i += 1)
        if (item[i].Name === 'MpesaReceiptNumber') return item[i].Value;
    }
  }
  return '';
};

/**
 * Forward request to transaction initiator via callback
 * @param req
 * @param res
 * @param next
 */
const forwardRequestToRemoteClient = (req, res, next) => {
  console.log('Send request to originator..');
  // Forward request to remote server
  mpesaFunctions.sendCallbackMpesaTxnToAPIInitiator(
    {
      url: req.lipaNaMPesaTransaction.mpesaInitRequest.CallBackURL,
      transaction: {
        status:
          req.lipaNaMPesaTransaction.mpesaCallback.stkCallback.ResultCode === 0
            ? '00'
            : req.lipaNaMPesaTransaction.mpesaCallback.stkCallback.ResultCode,
        message: req.lipaNaMPesaTransaction.mpesaCallback.stkCallback.ResultDesc,
        merchantRequestId: req.lipaNaMPesaTransaction.merchantRequestId,
        checkoutRequestId: req.lipaNaMPesaTransaction.checkoutRequestId,
        mpesaReference: fetchMpesaReferenceNumber(
          req.lipaNaMPesaTransaction.mpesaCallback.stkCallback.CallbackMetadata.Item
        ),
      },
    },
    req,
    res,
    next
  );
};

stkPushRouter.post(
  '/callback',
  fetchTransaction,
  updateTransaction,
  forwardRequestToRemoteClient,
  (req, res) => {
    res.json({
      ResultCode: 0,
      ResultDesc: 'The service request is processed successfully.',
    });
  }
);

module.exports = stkPushRouter;
