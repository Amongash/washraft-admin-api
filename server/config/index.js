require('dotenv').config();
const bunyan = require('bunyan');
const path = require('path');

const loggers = {
  development: () => bunyan.createLogger({ name: 'development', level: 'debug' }),
  production: () => bunyan.createLogger({ name: 'development', level: 'info' }),
  test: () => bunyan.createLogger({ name: 'development', level: 'fatal' }),
};

module.exports = {
  development: {
    siteName: 'washraft',
    log: loggers.development,
    data: { images: path.join(__dirname, '../data/images') },
    database: {
      dsn: process.env.DEVELOPMENT_DB_DSN,
    },
  },
  production: {
    siteName: 'washraft',
    log: loggers.production,
    data: { images: path.join(__dirname, '../data/images') },
    database: {
      dsn: process.env.PRODUCTION_DB_DSN,
    },
  },
  test: {
    siteName: 'washraft',
    log: loggers.test,
    data: { images: path.join(__dirname, '../data/images') },
    database: {
      dsn: process.env.TEST_DB_DSN,
    },
  },
};
