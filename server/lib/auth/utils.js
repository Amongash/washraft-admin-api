const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const ROLES = require('../../helpers/roles');
const UserModel = require('../../models').User;

const setup = () => {
  // eslint-disable-next-line no-underscore-dangle
  passport.serializeUser((user, done) => done(null, user._id));

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await UserModel.findById(id).exec();
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  });
};

const signToken = user => {
  return jwt.sign({ data: user }, process.env.JWT_SECRET, {
    expiresIn: 604800,
  });
};

const hashPassword = async password => {
  if (!password) {
    throw new Error('Password was not provided');
  }

  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const verifyPassword = async (candidate, actual) => {
  return bcrypt.compare(candidate, actual);
};

const checkIsInRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.redirect('/login');
  }

  const hasRole = roles.find(role => req.user.role === role);
  if (!hasRole) {
    return res.redirect('/login');
  }

  return next();
};

const getRedirectUrl = role => {
  console.log(role);
  switch (role) {
    case ROLES.Admin:
      return '/admin-dashboard';
    case ROLES.Customer:
      return '/customer-dashboard';
    default:
      return '/';
  }
};

// export { setup, signToken, hashPassword, verifyPassword, checkIsInRole, getRedirectUrl }

module.exports = {
  initialize: passport.initialize(),
  session: passport.session(),
  setUser: (req, res, next) => {
    res.locals.user = req.user;
    return next();
  },
  setup,
  signToken,
  hashPassword,
  verifyPassword,
  checkIsInRole,
  getRedirectUrl,
};
