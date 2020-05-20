const mongoose = require('mongoose');

const OrderItem = mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    unit: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: false }
);

module.exports = OrderItem;
