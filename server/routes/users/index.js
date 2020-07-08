const express = require('express');
const cors = require('cors');
const passport = require('passport');
const { User } = require('../../models');
const middlewares = require('../middlewares');

const router = express.Router();

module.exports = params => {
  const { images } = params;

  router.get('/redirect/', async (req, res, next) => {
    if (req.user) {
      console.log('User is logged in!');
      return res.redirect('/');
    }
    if (!req.user) {
      console.log('Incorrect Username or password');
      // return res.json('Incorrect Username or password');
      return res.status(422).send({ error: "Incorrect Username or password" });
    }

    return next();
  });

  router.get('/login', (req, res) => {
    // TODO Add application logic to provide the login page to the user.
    if (!req.user) {
      console.log('Login page');
      return res.json('Login page');
    }
    return res.redirect('/');
  });

  router.options('/login', cors());
  router.post(
    '/login', (req, res, next) => {
      passport.authenticate('local',
        (err, user, info) => {
          if (err) {
            return next(err);
          }

          if (!user) {
            return res.status(422).send({ error: "Incorrect Username or password" });
          }

          req.logIn(user, function(err) {
            if (err) {
              return next(err);
            }
            return res.status(200).send({
              firstName: user.firstName,
              lastName: user.lastName,
              username: user.username
            });
          });

        })(req, res, next);
    }
  );

  router.get('/logout', (req, res) => {
    req.logout();
    console.log('User has been logged out!');
    return res.redirect('/');
  });

  router.get('/registration', (req, res) => {
    return res.redirect('/users/redirect');
  });

  router.options('/registration', cors());
  router.post(
    '/registration',
    middlewares.upload.single('image'),
    middlewares.handleImage(images),
    async (req, res, next) => {
      try {
        const user = new User({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          username: req.body.username,
          'local.email': req.body.email,
          'local.password': req.body.password,
          phoneNumber: req.body.phoneNumber,
          address: req.body.address,
          tag: req.body.tag,
        });
        if (req.file && req.file.storeFilename) {
          user.image = req.file.storeFilename;
        }

        const savedUser = await user.save();

        if (savedUser) {
          console.log(`User has been created`, savedUser);
          return res.json('Success: true');
        }
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
    async (req, res, next) => {
      if (req.user) return next();
      return res.status(401).end();
    }
    // (req, res) => res.render('users/account', { user: req.user })
  );

  router.get('/image/:filename', (req, res) => {
    res.type('png');
    return res.sendFile(images.filepath(req.params.filename));
  });

  router.get('/account', (req, res) => {
    return res.status(200).send();
  });

  return router;
};
