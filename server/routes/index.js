const express = require('express');
const usersRoute = require('./users');

const router = express.Router();

module.exports = params => {
  router.get('/', (req, res) => {
    res.status(200).send('You are home.');
  });

  router.use('/users', usersRoute(params));
  return router;
};
