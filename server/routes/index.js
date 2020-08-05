const express = require('express');
const passport = require('passport');
const authRoute = require('./auth');
const userRoleRoute = require('./roles');
const itemsRoute = require('./items');
const ordersRoute = require('./orders');
const categoriesRoute = require('./category');
const userPaymentsRoute = require('./userpayments');
const ROLES = require('../helpers/roles');
const lipaNaMpesa = require('../lib/mpesa/api/lipanampesa/lipaNaMPesa');
const lipaNaMpesaQuery = require('../lib/mpesa/api/lipanampesa/lipaNaMPesaQuery');
const c2b = require('../lib/mpesa/api/validationConfirmation/urlRegistration');
const c2bValidation = require('../lib/mpesa/api/validationConfirmation/c2bValidation');
const c2bConfirmation = require('../lib/mpesa/api/validationConfirmation/c2bConfirmation');
const { utils } = require('../lib/auth');

const router = express.Router();

module.exports = params => {
  router.get('/', (req, res) => {
    res.status(200).send('You are home.');
  });

  router.use(
    '/admin-dashboard',
    passport.authenticate('jwt', { failureRedirect: '/auth/login' }),
    utils.checkIsInRole(ROLES.Admin)
  );

  router.use('/auth', authRoute(params));
  router.use('/auth/roles', userRoleRoute(params));
  router.use('/items', itemsRoute(params));
  router.use('/orders', ordersRoute(params));
  router.use('/payments', userPaymentsRoute(params));
  router.use('/categories', categoriesRoute(params));
  // STK PUSH
  router.use('/stkpush', lipaNaMpesa);
  router.use('/stkpush/query', lipaNaMpesaQuery);

  // C2B CONFIRMATION & VALIDATION
  router.use('/c2b', c2b);
  router.use('/c2b/validate', c2bValidation);
  router.use('/c2b/confirm', c2bConfirmation);

  return router;
};
