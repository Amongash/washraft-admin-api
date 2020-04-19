const mongoose = require('mongoose');

const OrderStatusSchema = mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OrderItem', OrderStatusSchema);
