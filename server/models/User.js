const mongoose = require('mongoose');

const UserSchema = mongoose.Schema(
  {
    providerId: {
      type: String,
    },
    provider: { type: String },
    firstName: {
      type: String,
      required: true,
      minlength: 2,
    },
    lastName: {
      type: String,
      required: true,
      minlength: 2,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      index: { unique: true },
    },
    password: {
      type: String,
      trim: true,
      index: { unique: true },
      minlength: 8,
    },

    image: {
      type: String,
    },
    address: {
      type: String,
      // unique: true,
    },
    role: {
      type: String,
      // required: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', UserSchema, 'users');
module.exports = User;
