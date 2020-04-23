const express = require('express');
const usersRoute = require('./users');
const itemsRoute = require('./items');

const router = express.Router();

module.exports = params => {
  router.get('/', (req, res) => {
    res.status(200).send('You are home.');
  });

  router.use('/users', usersRoute(params));
  router.use('/items', itemsRoute(params));
  return router;
};
