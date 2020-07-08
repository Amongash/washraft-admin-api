require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const createError = require('http-errors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const routes = require('./routes');
const ImageService = require('./services/ImageService');

require('./lib/passport')(passport);

module.exports = config => {
  const app = express();
  app.use(helmet());
  app.use(compression());
  // Added cors to handle cross origin requests from the client
  app.use(cors());
  // const log = config.log();
  const images = new ImageService(config.data.images);

  // app.set('view engine', 'ejs');
  // app.set('views', path.join(__dirname, '../server/views'));

  app.locals.siteName = config.siteName;
  // app.use(express.static(path.join(__dirname, '../public')));
  app.get('/favicon.ico', (req, res) => res.sendStatus(204));

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cookieParser());

  app.use(
    session({
      secret: 'very secret 12345',
      resave: true,
      saveUninitialized: false,
      store: new MongoStore({ mongooseConnection: mongoose.connection }),
    })
  );

  // mongoose.set('debug', (collectionName, method, query, doc) => {
  //   console.log(`${collectionName}.${method}`, JSON.stringify(query), doc);
  // });

  if (app.get('env') === 'production') {
    app.set('trust proxy', 'loopback');
  }

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(async (req, res, next) => {
    res.locals.user = req.user;
    return next();
  });

  app.use('/', routes({ images }));

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    // log.info(next());
    next(createError(404));
  });

  if (app.get('env') === 'development') {
    app.locals.pretty = true;
  }

  return app;
};
