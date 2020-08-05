const express = require('express');
const passport = require('passport');

const auth = require('../../controllers/auth');
const { signToken, getRedirectUrl } = require('../../lib/auth/utils');

const router = express.Router();

module.exports = params => {
  const { images } = params;

  router.get('/login', (req, res) => {
    // TODO Add application logic to provide the login page to the user.
    if (!req.user) {
      console.log('Login page');
      return res.json({ message: 'User has not logged in!' });
    }
    return res.json({ message: 'User is logged in.' });
  });

  router.post('/login', auth.sign_in);

  router.get('/logout', (req, res) => {
    req.logout();
    console.log('User has been logged out!');
    return res.redirect('/');
  });

  router.post('/registration', auth.registration);

  router.get('/account', auth.userAccount);

  router.get('/image/:filename', (req, res) => {
    res.type('png');
    return res.sendFile(images.filepath(req.params.filename));
  });

  router.get('/account', (req, res) => {
    return res.status(200).send();
  });

  router.get('/facebook', passport.authenticate('facebook'));

  router.get(
    '/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/auth/login' }),
    (req, res) => {
      return res
        .status(200)
        .cookie('jwt', signToken(req.user), {
          httpOnly: true,
        })
        .redirect(getRedirectUrl(req.user.role));
    }
  );

  router.get(
    '/google',
    passport.authenticate('google', {
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
    })
  );

  router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth/login' }),
    (req, res) => {
      return res
        .status(200)
        .cookie('jwt', signToken(req.user), {
          httpOnly: true,
        })
        .redirect(getRedirectUrl(req.user.role));
    }
  );

  return router;
};
