require('dotenv').config();

const mpesaConfigs = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  environment: 'sandbox',
  testMSISDN: 254708374149,
  shortCode: '600236',
  initiatorName: '	testapi236',
  lipaNaMpesaShortCode: 174379,
  lipaNaMpesaShortPass: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
  securityCredential: 'Safcom236!',
  // certPath: path.resolve('keys/myKey.cert')
};

const credentials = {
  client_key: process.env.MPESA_CONSUMER_KEY,
  client_secret: process.env.MPESA_CONSUMER_SECRET,
  initiator_password: 'Safcom236!',
  // security_credential: 'YOUR_SECURITY_CREDENTIAL',
  // certificatepath: 'keys/example.cert'
};
const environment = 'sandbox';

module.exports = { mpesaConfigs, credentials, environment };
