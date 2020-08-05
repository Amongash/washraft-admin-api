const passport = require('passport');
const passportJWT = require('passport-jwt');

const { getUserById } = require('../../database/user');
const { signToken } = require('../utils');

const JWTStrategy = passportJWT.Strategy;

const strategy = () => {
  const strategyOptions = {
    jwtFromRequest: req => req.cookies.jwt,
    secretOrKey: process.env.JWT_SECRET,
    passReqToCallback: true,
  };

  const verifyCallback = async (req, jwtPayload, cb) => {
    try {
      // eslint-disable-next-line no-underscore-dangle
      const user = await getUserById(jwtPayload.data._id);
      req.user = user;
      return cb(null, user);
    } catch (error) {
      return cb(error);
    }
  };

  passport.use(new JWTStrategy(strategyOptions, verifyCallback));
};

const login = (req, user) => {
  return new Promise((resolve, reject) => {
    req.login(user, { session: false }, err => {
      if (err) {
        return reject(err);
      }

      return resolve(signToken(user));
    });
  });
};

module.exports = { strategy, login };
