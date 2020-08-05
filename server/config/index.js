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
    dockerDatabase: {
      dsn: `mongodb://mongo/${process.env.DEVELOPMENT_DB_NAME}`,
    },
    hostDatabase: {
      dsn: 'mongodb://127.0.0.1:27017/development',
    },
  },
  production: {
    siteName: 'washraft',
    log: loggers.production,
    data: { images: path.join(__dirname, '../data/images') },
    database: {
      dsn: `mongodb://mongo/${process.env.PRODUCTION_DB_NAME}`,
    },
  },
  test: {
    siteName: 'washraft',
    log: loggers.test,
    data: { images: path.join(__dirname, '../data/images') },
    database: {
      dsn: `mongodb://mongo/${process.env.TEST_DB_NAME}`,
    },
  },
};
