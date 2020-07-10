const { User } = require('../../../models');

exports.createUser = async req => {
  try {
    const { providerId, provider, firstName, lastName, email, password, role } = req;
    const existingUser = await User.findOne({ email });
    // check to see if there's already a user with that email
    if (existingUser) {
      return Promise.reject(new Error('That email is already taken.'));
    }

    //  We're not logged in, so we're creating a brand new user.
    // create the user
    console.log('Creating a new user.');

    const savedUser = User.create({
      providerId,
      provider,
      firstName,
      lastName,
      email,
      password,
      role,
    });

    if (savedUser) {
      return Promise.resolve(savedUser);
    }
    return true;
  } catch (error) {
    console.log('Failure creating a new user.');
    return Promise.reject(new Error('Unknown reason for failure'));
  }
};
