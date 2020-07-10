/* eslint-disable camelcase */
const passport = require('passport');
const passportGoogle = require('passport-google-oauth');

const { getUserByProviderId, createUser } = require('../../database/user');
const ROLES = require('../../../helpers/roles');

const GoogleStrategy = passportGoogle.OAuth2Strategy;

const strategy = app => {
  const strategyOptions = {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_API_URL}/auth/google/callback`,
  };

  const verifyCallback = async (accessToken, refreshToken, profile, done) => {
    try {
      // eslint-disable-next-line no-underscore-dangle
      const { given_name, family_name, email, email_verified } = profile._json;

      const user = await getUserByProviderId(profile.id);
      if (user) return done(null, user);

      if (email_verified) {
        const createdUser = await createUser({
          provider: profile.provider,
          providerId: profile.id,
          firstName: given_name,
          lastName: family_name,
          email,
          password: null,
          role: ROLES.Customer,
        });

        return done(null, createdUser);
      }

      return done(null);
    } catch (error) {
      return done(error);
    }
  };

  passport.use(new GoogleStrategy(strategyOptions, verifyCallback));

  return app;
};

module.exports = { strategy };
