const mongoose = require('mongoose');

const UserPaymentSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    paid: {
      type: Number,
      required: true,
    },
    remainder: {
      type: Number,
    },
  },
  { timestamps: true }
);

const UserPayment = mongoose.model('UserPayment', UserPaymentSchema, 'userpayments');
module.exports = UserPayment;
