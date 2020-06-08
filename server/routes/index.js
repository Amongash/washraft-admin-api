const express = require('express');
const usersRoute = require('./users');
const itemsRoute = require('./items');
const ordersRoute = require('./orders');
const categoriesRoute = require('./category');
const userPaymentsRoute = require('./userpayments');

const router = express.Router();

module.exports = params => {
  router.get('/', (req, res) => {
    res.status(200).send('You are home.');
  });

  router.use('/users', usersRoute(params));
  router.use('/items', itemsRoute(params));
  router.use('/orders', ordersRoute(params));
  router.use('/user-payments', userPaymentsRoute(params));
  router.use('/categories', categoriesRoute(params));

  return router;
};
