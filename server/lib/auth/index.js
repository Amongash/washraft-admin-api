import * as utils from './utils';
import * as strategies from './strategies';

const pipe = (...functions) => args => functions.reduce((arg, fn) => fn(arg), args);

exports.initialiseAuthentication = app => {
  utils.setup();
  pipe(strategies.JWTStrategy, strategies.FacebookStrategy, strategies.GoogleStrategy)(app);
};

exports = { utils, strategies };
