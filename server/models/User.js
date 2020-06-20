const mongoose = require('mongoose');
const emailValidator = require('email-validator');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

const UserSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      // required: true,
      minlength: 2,
    },
    lastName: {
      type: String,
      // required: true,
      minlength: 2,
    },
    phoneNumber: {
      type: Number,
      // required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      index: { unique: true },
      minlength: 3,
    },
    local: {
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: { unique: true },
        validate: {
          validator: emailValidator.validate,
          message: props => `${props.value} is not a valid email address!`,
        },
      },
      password: {
        type: String,
        required: true,
        trim: true,
        index: { unique: true },
        minlength: 8,
      },
    },
    facebook: {
      id: String,
      token: String,
      email: String,
      name: String,
    },
    twitter: {
      id: String,
      token: String,
      displayName: String,
      username: String,
    },
    google: {
      id: String,
      token: String,
      email: String,
      name: String,
    },
    // email: {
    //   type: String,
    //   required: true,
    //   trim: true,
    //   lowercase: true,
    //   index: { unique: true },
    //   validate: {
    //     validator: emailValidator.validate,
    //     message: props => `${props.value} is not a valid email address!`,
    //   },
    // },
    // password: {
    //   type: String,
    //   required: true,
    //   trim: true,
    //   index: { unique: true },
    //   minlength: 8,
    // },
    image: {
      type: String,
    },
    address: {
      type: String,
      unique: true,
    },
    tag: {
      type: String,
      // required: true,
    },
  },
  { timestamps: true }
);
UserSchema.pre('save', async function preSave(next) {
  const user = this;
  if (!user.isModified('password')) return next();
  try {
    const hash = await bcrypt.hash(user.password, SALT_ROUNDS);
    user.password = hash;
    return next();
  } catch (err) {
    return next(err);
  }
});

UserSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model('User', UserSchema, 'users');
module.exports = User;
