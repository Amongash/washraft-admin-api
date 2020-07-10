const express = require('express');
const users = require('../../controllers/users');

const router = express.Router();

// eslint-disable-next-line no-unused-vars
module.exports = params => {
  router.get('/', users.index);
  return router;
};
