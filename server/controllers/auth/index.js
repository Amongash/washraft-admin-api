const { body, validationResult } = require('express-validator');
const { verifyPassword, hashPassword, getRedirectUrl } = require('../../lib/auth/utils');
const { login } = require('../../lib/auth/strategies/jwt');
const { createUser, getUserByEmail } = require('../../lib/database/user');

exports.sign_in = async (req, res, next) => {
  const authenticationError = () => {
    return res.status(500).json({ success: false, data: 'Authentication error!' });
  };

  try {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);

    if (user) {
      if (!(await verifyPassword(password, user.password))) {
        console.error('Passwords do not match');
        return authenticationError();
      }
      const token = await login(req, user);

      return res
        .status(200)
        .cookie('jwt', token, {
          httpOnly: true,
        })
        .redirect(getRedirectUrl(user.role));
    }
    return res.status(500).json({ success: false, data: 'User does not exist!' });
  } catch (error) {
    console.error('Log in error', error);
    return next(error);
  }
};

exports.registration = async (req, res, next) => {
  try {
    const { providerId, provider, firstName, lastName, email, password, role } = req.body;
    body(email).isEmail();
    body(password).isLength({ min: 5, max: 20 });

    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Login Failure: '.errors);
      return res.status(422).json({ errors: errors.array() });
    }

    if (req.user) {
      const { user } = req;
      user.email = email;
      user.password = password;
      user.save(err => {
        if (err) throw err;
        return user;
      });
    }

    const user = await createUser(
      {
        providerId,
        provider,
        firstName,
        lastName,
        email,
        password: await hashPassword(password),
        role,
      },
      res
    );

    if (!user) {
      return res.status(500).json({ success: false, data: 'Email is already taken' });
    }

    const token = await login(req, user);

    if (!token) {
      return res.status(500).json({ success: false, data: 'Authentication error!' });
    }

    return res
      .status(200)
      .cookie('jwt', token, {
        httpOnly: true,
      })
      .json({
        success: true,
        data: getRedirectUrl(user.role),
      });
  } catch (error) {
    console.error('Registration error', error);
    return next(error);
  }
};

exports.userAccount = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).end();
  }
  return next();
  // res.render('users/account', { user: req.user })
};
