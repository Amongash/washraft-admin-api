const LocalStrategy = require('passport-local').Strategy;
// const FacebookStrategy = require('passport-facebook').Strategy;
// const TwitterStrategy = require('passport-twitter').Strategy;
// const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// load up the user model
const { User } = require('../models');

// load the auth variables
// const configAuth = require('./auth'); // use this one for testing

// module.exports = {
//   setUser: (req, res, next) => {
//     res.locals.user = req.user;
//     return next();
//   },
// };

module.exports = passport => {
  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser((user, done) => done(null, user.id));

  // used to serialize the user for the session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).exec();
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  });

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  passport.use(
    'local',
    new LocalStrategy(
      {
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true, // allows us to pass in the req from our route (consts us check if a user is logged in or not)
      },
      async (req, email, password, done) => {
        try {
          const user = await User.findOne({ 'local.email': email }).exec();
          // if no user is found, return the message
          if (!user) {
            return done(null, false, { message: 'No user found.' });
          }

          const passwordOK = await user.comparePassword(password);
          if (!passwordOK) {
            return done(null, false, { message: 'Invalid username or password' });
          }
          // all is well, return user
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  passport.use(
    'local-signup',
    new LocalStrategy(
      {
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true, // allows us to pass in the req from our route (consts us check if a user is logged in or not)
      },
      async (req, res, done) => {
        try {
          const existingUser = User.findOne({ 'local.email': req.email });

          // check to see if there's already a user with that email
          if (existingUser) return done(null, false, { message: 'That email is already taken.' });

          //  If we're logged in, we're connecting a new local account.
          if (req.user) {
            const { user } = req;
            user.local.email = email;
            user.local.password = password;
            user.save(err => {
              if (err) throw err;
              return done(null, user);
            });
          }
          //  We're not logged in, so we're creating a brand new user.
          else {
            // create the user
            const user = new User({
              'local.email': req.email,
              'local.password': req.password,
            });

            const newUser = await user.save();

            if (newUser) {
              console.log(`User has been created`, newUser);
              return res.json('Success: true');
            }
          }
        } catch (err) {
          return done(err);
        }
        return done();
      }
    )
  );

  // =========================================================================
  // FACEBOOK ================================================================
  // =========================================================================
  //   passport.use(
  //     new FacebookStrategy(
  //       {
  //         clientID: configAuth.facebookAuth.clientID,
  //         clientSecret: configAuth.facebookAuth.clientSecret,
  //         callbackURL: configAuth.facebookAuth.callbackURL,
  //         passReqToCallback: true, // allows us to pass in the req from our route (consts us check if a user is logged in or not)
  //       },
  //       function(req, token, refreshToken, profile, done) {
  //         // asynchronous
  //         process.nextTick(function() {
  //           // check if the user is already logged in
  //           if (!req.user) {
  //             User.findOne({ 'facebook.id': profile.id }, function(err, user) {
  //               if (err) return done(err);

  //               if (user) {
  //                 // if there is a user id already but no token (user was linked at one point and then removed)
  //                 if (!user.facebook.token) {
  //                   user.facebook.token = token;
  //                   user.facebook.name = `${profile.name.givenName} ${profile.name.familyName}`;
  //                   user.facebook.email = profile.emails[0].value;

  //                   user.save(function(err) {
  //                     if (err) throw err;
  //                     return done(null, user);
  //                   });
  //                 }

  //                 return done(null, user); // user found, return that user
  //               }
  //               // if there is no user, create them
  //               const newUser = new User();

  //               newUser.facebook.id = profile.id;
  //               newUser.facebook.token = token;
  //               newUser.facebook.name = `${profile.name.givenName} ${profile.name.familyName}`;
  //               newUser.facebook.email = profile.emails[0].value;

  //               newUser.save(function(err) {
  //                 if (err) throw err;
  //                 return done(null, newUser);
  //               });
  //             });
  //           } else {
  //             // user already exists and is logged in, we have to link accounts
  //             const { user } = req; // pull the user out of the session

  //             user.facebook.id = profile.id;
  //             user.facebook.token = token;
  //             user.facebook.name = `${profile.name.givenName} ${profile.name.familyName}`;
  //             user.facebook.email = profile.emails[0].value;

  //             user.save(function(err) {
  //               if (err) throw err;
  //               return done(null, user);
  //             });
  //           }
  //         });
  //       }
  //     )
  //   );

  // =========================================================================
  // TWITTER =================================================================
  // =========================================================================
  //   passport.use(
  //     new TwitterStrategy(
  //       {
  //         consumerKey: configAuth.twitterAuth.consumerKey,
  //         consumerSecret: configAuth.twitterAuth.consumerSecret,
  //         callbackURL: configAuth.twitterAuth.callbackURL,
  //         passReqToCallback: true, // allows us to pass in the req from our route (consts us check if a user is logged in or not)
  //       },
  //       function(req, token, tokenSecret, profile, done) {
  //         // asynchronous
  //         process.nextTick(function() {
  //           // check if the user is already logged in
  //           if (!req.user) {
  //             User.findOne({ 'twitter.id': profile.id }, function(err, user) {
  //               if (err) return done(err);

  //               if (user) {
  //                 // if there is a user id already but no token (user was linked at one point and then removed)
  //                 if (!user.twitter.token) {
  //                   user.twitter.token = token;
  //                   user.twitter.username = profile.username;
  //                   user.twitter.displayName = profile.displayName;

  //                   user.save(function(err) {
  //                     if (err) throw err;
  //                     return done(null, user);
  //                   });
  //                 }

  //                 return done(null, user); // user found, return that user
  //               }
  //               // if there is no user, create them
  //               const newUser = new User();

  //               newUser.twitter.id = profile.id;
  //               newUser.twitter.token = token;
  //               newUser.twitter.username = profile.username;
  //               newUser.twitter.displayName = profile.displayName;

  //               newUser.save(function(err) {
  //                 if (err) throw err;
  //                 return done(null, newUser);
  //               });
  //             });
  //           } else {
  //             // user already exists and is logged in, we have to link accounts
  //             const { user } = req; // pull the user out of the session

  //             user.twitter.id = profile.id;
  //             user.twitter.token = token;
  //             user.twitter.username = profile.username;
  //             user.twitter.displayName = profile.displayName;

  //             user.save(function(err) {
  //               if (err) throw err;
  //               return done(null, user);
  //             });
  //           }
  //         });
  //       }
  //     )
  //   );

  // =========================================================================
  // GOOGLE ==================================================================
  // =========================================================================
  //   passport.use(
  //     new GoogleStrategy(
  //       {
  //         clientID: configAuth.googleAuth.clientID,
  //         clientSecret: configAuth.googleAuth.clientSecret,
  //         callbackURL: configAuth.googleAuth.callbackURL,
  //         passReqToCallback: true, // allows us to pass in the req from our route (consts us check if a user is logged in or not)
  //       },
  //       function(req, token, refreshToken, profile, done) {
  //         // asynchronous
  //         process.nextTick(function() {
  //           // check if the user is already logged in
  //           if (!req.user) {
  //             User.findOne({ 'google.id': profile.id }, function(err, user) {
  //               if (err) return done(err);

  //               if (user) {
  //                 // if there is a user id already but no token (user was linked at one point and then removed)
  //                 if (!user.google.token) {
  //                   user.google.token = token;
  //                   user.google.name = profile.displayName;
  //                   user.google.email = profile.emails[0].value; // pull the first email

  //                   user.save(function(err) {
  //                     if (err) throw err;
  //                     return done(null, user);
  //                   });
  //                 }

  //                 return done(null, user);
  //               }
  //               const newUser = new User();

  //               newUser.google.id = profile.id;
  //               newUser.google.token = token;
  //               newUser.google.name = profile.displayName;
  //               newUser.google.email = profile.emails[0].value; // pull the first email

  //               newUser.save(function(err) {
  //                 if (err) throw err;
  //                 return done(null, newUser);
  //               });
  //             });
  //           } else {
  //             // user already exists and is logged in, we have to link accounts
  //             const { user } = req; // pull the user out of the session

  //             user.google.id = profile.id;
  //             user.google.token = token;
  //             user.google.name = profile.displayName;
  //             user.google.email = profile.emails[0].value; // pull the first email

  //             user.save(function(err) {
  //               if (err) throw err;
  //               return done(null, user);
  //             });
  //           }
  //         });
  //       }
  //     )
  //   );
};
