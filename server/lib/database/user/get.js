const { User } = require('../../../models');

async function getUserById(id) {
  return User.findById(id).exec();
}

async function getUserByEmail(email) {
  return User.findOne({ email }).exec();
}

async function getUserByProviderId(providerId) {
  return User.findOne({ providerId }).exec();
}

module.export = { getUserById, getUserByEmail, getUserByProviderId };
