const mongoose = require('mongoose');
const OrderItem = require('./OrderItem');

const OrderSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalQuantity: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
    },
    remarks: {
      type: String,
    },
    items: [OrderItem],
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', OrderSchema, 'orders');
module.exports = Order;
