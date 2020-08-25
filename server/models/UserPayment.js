const mongoose = require('mongoose');

const UserPaymentSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    remainder: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      default: 'Pending',
    },
  },
  { timestamps: true }
);

UserPaymentSchema.pre('save', async function preSave(next) {
  try {
    const payment = this;
    if (this.paid !== 0) return next();
    payment.paymentStatus = false;
    return next();
  } catch (err) {
    return next(err);
  }
});

const UserPayment = mongoose.model('UserPayment', UserPaymentSchema, 'userpayments');
module.exports = UserPayment;
