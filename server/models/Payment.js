const mongoose = require('mongoose');

const PaymentSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    amountRemaining: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model('Payment', PaymentSchema, 'payments');
module.exports = Payment;
