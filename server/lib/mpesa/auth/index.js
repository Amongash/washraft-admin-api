/* eslint-disable no-console */
const moment = require('moment');
const request = require('request');

const {
  mpesaConfigs,
  lipaNaMpesaConfigs,
  validationConfirmConfigs,
} = require('../../../config/mpesa');

const STK_PUSH = 'STK-PUSH';
const C2B_URL_REGISTRATION_SERVICE_NAME = 'C2B-URL-REGISTRATION';
const TOKEN_INVALIDITY_WINDOW = 240;
const GENERIC_SERVER_ERROR_CODE = '01';

// Authentication model
const Token = require('./tokenModel');

const mpesaFunctions = require('../helpers/mpesaFunctions');

/**
 * Check token validity. Token validity window is set to 240 seconds
 * @param service tokenObject
 */
const isTokenValid = service => {
  const tokenAge =
    moment.duration(moment(new Date()).diff(service.lastUpdated)).asSeconds() +
    TOKEN_INVALIDITY_WINDOW;
  return tokenAge < service.timeout;
};

/**
 * Create new instance or update existing token instance
 * @param req
 * @param res
 * @param serviceName
 * @param newInstance
 * @param next
 */
const setNewToken = (req, res, serviceName, newInstance, next) => {
  let { consumerKey, consumerSecret } = mpesaConfigs;

  let token = {};
  const { authenticationUrl } = mpesaConfigs;

  // Load consumer keys and secrets for each service
  switch (serviceName) {
    case STK_PUSH: {
      consumerKey = lipaNaMpesaConfigs.consumerKey;
      consumerSecret = lipaNaMpesaConfigs.consumerSecret;
      break;
    }
    case C2B_URL_REGISTRATION_SERVICE_NAME: {
      consumerKey = validationConfirmConfigs.consumerKey;
      consumerSecret = validationConfirmConfigs.consumerSecret;
      break;
    }
    default:
      next();
  }
  // Combine consumer key with the secret
  const auth = `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}`;

  const requestOptions = {
    url: authenticationUrl,
    headers: { Authorization: auth },
  };

  request(requestOptions, (error, response, body) => {
    // Process successful token response
    const tokenResp = JSON.parse(body);

    // Check if response contains error
    if (!error || !tokenResp.errorCode) {
      const newToken = {
        lastUpdated: moment().format('YYYY-MM-DD HH:mm:ss'),
        accessToken: tokenResp.access_token,
        timeout: tokenResp.expires_in,
        service: serviceName,
      };

      if (newInstance) {
        // Create new access token for M-Pesa service
        token = new Token(newToken);
        // Save service token
        token.save(err => {
          if (err) {
            mpesaFunctions.handleError(res, `Unable to save token. Service: ${serviceName}`);
          } else {
            req.transactionToken = token.accessToken;
          }
          next();
        });
      } else {
        // Update existing access token
        const conditions = { service: serviceName };
        const options = { multi: true };
        // Update existing token
        Token.updateOne(conditions, newToken, options, (err, record) => {
          if (err) {
            mpesaFunctions.handleError(res, `Unable to update token. Service: ${serviceName}`);
          } else if (record) {
            req.transactionToken = newToken.accessToken;
          }
          next();
        });
      }
    } else {
      // Body is empty
      mpesaFunctions.handleError(
        res,
        (tokenResp.errorMessage ? tokenResp.errorMessage : 'Failed Auth token processing') ||
          error.getMessage(),
        GENERIC_SERVER_ERROR_CODE
      );
    }
  });
};

const fetchToken = (req, res, next) => {
  const serviceName = req.body.service;
  Token.findOne({})
    .where('service')
    .equals(serviceName)
    .exec((err, records) => {
      if (!err) {
        if (records) {
          //    Record exists : update
          if (isTokenValid(records)) {
            console.log(`Current Token is still valid: ${serviceName}`);
            req.transactionToken = records.accessToken;
            next();
          } else {
            console.log(`Current Token is invalid: ${serviceName}`);
            // Token is invalid, resetting
            setNewToken(req, res, serviceName, false, next);
          }
        } else {
          //    Record does not exist: Create
          console.log(`Record does not exist: ${serviceName}`);
          setNewToken(req, res, serviceName, true, next);
        }
      } else {
        mpesaFunctions.handleError(res, 'Error occurred updating token', GENERIC_SERVER_ERROR_CODE);
      }
    });
};

module.exports = fetchToken;
