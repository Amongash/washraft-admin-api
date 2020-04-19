const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalQuantity: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    status: {
      type: String,
    },
    remarks: {
      type: String,
    },
    invoiceNo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
    },
    orderItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderItem',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
