const express = require('express');
const authRoute = require('./auth');
const userRoleRoute = require('./roles');
const itemsRoute = require('./items');
const ordersRoute = require('./orders');
const categoriesRoute = require('./category');
const userPaymentsRoute = require('./userpayments');

const router = express.Router();

module.exports = params => {
  router.get('/', (req, res) => {
    res.status(200).send('You are home.');
  });

  router.get('/admin_dashboard', (req, res) => {
    res.status(200).send('Admin Dashboard');
  });

  router.use('/auth', authRoute(params));
  router.use('/auth/roles', userRoleRoute(params));
  router.use('/items', itemsRoute(params));
  router.use('/orders', ordersRoute(params));
  router.use('/user-payments', userPaymentsRoute(params));
  router.use('/categories', categoriesRoute(params));

  return router;
};
