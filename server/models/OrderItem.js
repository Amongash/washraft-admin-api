const mongoose = require('mongoose');

const OrderItem = mongoose.Schema(
  {
    itemType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ItemPrice',
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
