const express = require('express');

const router = express.Router();

// eslint-disable-next-line no-unused-vars
module.exports = params => {
  router.get('/', (req, res) => {
    return res.json({ data: 'You are home', errors: [] });
  });
  return router;
};
