require('dotenv').config();

const mpesaConfigs = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  authenticationUrl:
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
  environment: 'sandbox',
  testMSISDN: 254708374149,
  shortCode: '600236',
  initiatorName: '	testapi236',
  lipaNaMpesaShortCode: 174379,
  lipaNaMpesaShortPass: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
  securityCredential: 'Safcom236!',
  // certPath: path.resolve('keys/myKey.cert')
};

const lipaNaMpesaConfigs = {
  processRequest: 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
  queryRequest: 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
  key: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
  shortCode: '174379',
  consumerKey: 'H65FlGErvyuFvsajRekG9zcRdnQ30kHO',
  consumerSecret: '2ARcZPg7Gc8gWFBd',
  callBackURL: 'http://134.122.91.17/payments/lipaNaMpesaService/callback',
  transactionDescription: 'Laundry Payment',
  accountReference: 'Washraft Laundry',
};

const validationConfirmConfigs = {
  registerURLs: 'https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl',
  consumerKey: '3uHElGTxJIBqf3LfcUJ8UJPYmV8sX25s',
  consumerSecret: 'PbhGFEm9Adu0VA7g',
  shortCode: '600236',
  confirmationURL: 'http://134.122.91.17/payments/payBill/confirmation',
  validationURL: 'http://134.122.91.17/payments/account/validation',
  responseType: 'Completed',
};

module.exports = {
  mpesaConfigs,
  lipaNaMpesaConfigs,
  validationConfirmConfigs,
};
