const mongoose = require('mongoose');

const tokenRepository = mongoose.Schema({
  lastUpdated: String,
  accessToken: String,
  timeout: String,
  service: String,
});

const Token = mongoose.model('tokens', tokenRepository);
module.exports = Token;
