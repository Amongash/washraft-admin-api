const express = require('express');
const passport = require('passport');
const UserModel = require('../../models/UserModel');
const middlewares = require('../middlewares');

const router = express.Router();

function redirectIfLoggedIn(req, res, next) {
  if (req.user) return res.redirect('/');
  return next();
}

module.exports = params => {
  const { images } = params;

  router.get('/login', redirectIfLoggedIn, (req, res) => {
    res.json('login');
    // res.render('users/login', { error: req.query.error })
  });

  router.post(
    '/login',
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/users/login?error=true',
    })
  );

  router.get('/logout', (req, res) => {
    req.logout();
    return res.redirect('/');
  });

  router.get('/registration', redirectIfLoggedIn, (req, res) => {
    res.json();
    // res.render('users/registration', { success: req.query.success })
  });

  router.post(
    '/registration',
    middlewares.upload.single('image'),
    middlewares.handleImage(images),
    async (req, res, next) => {
      try {
        const user = new UserModel({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          phoneNumber: req.body.phoneNumber,
          address: req.body.address,
          tag: req.body.tag,
        });
        if (req.file && req.file.storeFilename) {
          user.image = req.file.storeFilename;
        }

        const savedUser = await user.save();

        if (savedUser) return res.json('Success: true');
        return next(new Error('Failed to save user for unknown reasons'));
      } catch (err) {
        if (req.file && req.file.storeFilename) {
          await images.delete(req.file.storeFilename);
        }
        return next(err);
      }
    }
  );

  router.get(
    '/account',
    (req, res, next) => {
      if (req.user) return next();
      return res.status(401).end();
    }
    // (req, res) => res.render('users/account', { user: req.user })
  );

  router.get('/image/:filename', (req, res) => {
    res.type('png');
    return res.sendFile(images.filepath(req.params.filename));
  });

  router.get('/:id', async (req, res, next) => {
    try {
    } catch (err) {
      return next();
    }
  });

  return router;
};
