const { User } = require('../../../models');

const getUserById = id => {
  return User.findById(id).exec();
};

const getUserByEmail = email => {
  return User.findOne({ email }).exec();
};

const getUserByProviderId = providerId => {
  return User.findOne({ providerId }).exec();
};

module.exports = { getUserById, getUserByEmail, getUserByProviderId };
