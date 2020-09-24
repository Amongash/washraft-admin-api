const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { User } = require('../../models');

const SALT_ROUNDS = 10;

const setup = () => {
  // eslint-disable-next-line no-underscore-dangle
  passport.serializeUser((user, done) => done(null, user._id));

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).exec();
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

  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

const verifyPassword = async (candidate, actual) => {
  return bcrypt.compare(candidate, actual);
};

const checkIsInRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.redirect('/auth/login');
  }

  const hasRole = roles.find(role => req.user.role === role);
  if (!hasRole) {
    return res.redirect('/');
  }

  return next();
};

const getRedirectUrl = role => {
  if (role) console.log(`Logged in as:`, role);
  switch (role) {
    case 'Admin':
      return '/admin-dashboard';
    case 'Customer':
      return '/customer-dashboard';
    case 'PUStaff':
      return '/pustaff-dashboard';
    case 'DOStaff':
      return '/dostaff-dashboard';
    case 'LStaff':
      return '/lstaff-dashboard';
    default:
      return '/';
  }
};

// If user is not present redirect to login page
const ensureAuthenticated = (req, res, next) => {
  if (!req.user) return res.redirect('/auth/login');
  return next();
};

const redirectIfLoggedIn = (req, res, next) => {
  if (req.user) return res.redirect('/auth/account');
  return next();
};

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
  ensureAuthenticated,
  redirectIfLoggedIn,
};
