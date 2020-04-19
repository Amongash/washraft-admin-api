const mongoose = require('mongoose');

const OrderItemSchema = mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    unit: {
      type: Number,
      required: true,
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model('OrderItem', OrderItemSchema);
