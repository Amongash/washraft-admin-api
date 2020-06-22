const utils = require('./utils');

const { JWTStrategy, LocalStrategy } = require('./strategies');

const strategies = { JWTStrategy, LocalStrategy };

const pipe = (...functions) => args => functions.reduce((arg, fn) => fn(arg), args);

const initialiseAuthentication = app => {
  utils.setup();
  pipe(strategies.JWTStrategy, strategies.LocalStrategy)(app);
};

export { utils, initialiseAuthentication, strategies };
