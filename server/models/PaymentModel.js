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

module.exports = mongoose.model('Payment', PaymentSchema);
