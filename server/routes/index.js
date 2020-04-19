const express = require('express');
const connectEnsureLogin = require('connect-ensure-login');
const usersRoute = require('./users');

const router = express.Router();

module.exports = params => {
  router.get(
    '/',
    //  connectEnsureLogin.ensureLoggedIn(),
    (req, res) => {
      res.status(200);
    }
  );

  // router.get('/settings', (req, res) => {
  //   res.render('layout', { pageTitle: 'Settings', template: 'settings' });
  // });

  router.use('/users', usersRoute(params));
  return router;
};
