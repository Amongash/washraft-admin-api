/* eslint-disable camelcase */
require('dotenv').config();
const passport = require('passport');
const passportFacebook = require('passport-facebook');

const { getUserByProviderId, createUser } = require('../../database/user');
const ROLES = require('../../../helpers/roles');

const FacebookStrategy = passportFacebook.Strategy;

const strategy = app => {
  const strategyOptions = {
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: `${process.env.SERVER_API_URL}/auth/facebook/callback`,
    profileFields: ['id', 'displayName', 'name', 'email'],
  };

  const verifyCallback = async (req, accessToken, refreshToken, profile, done) => {
    try {
      // eslint-disable-next-line no-underscore-dangle
      const { first_name, last_name } = profile._json;
      const user = await getUserByProviderId(profile.id);
      if (user) return done(null, user);

      const createdUser = await createUser({
        providerId: profile.id,
        provider: profile.provider,
        firstName: first_name,
        lastName: last_name,
        role: ROLES.Customer,
      });

      return done(null, createdUser);
    } catch (error) {
      return done(error);
    }
  };

  passport.use(new FacebookStrategy(strategyOptions, verifyCallback));

  return app;
};

module.exports = { strategy };
