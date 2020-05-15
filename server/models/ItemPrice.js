const mongoose = require('mongoose');

const ItemPriceSchema = mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      min: 5,
      max: 12,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const ItemPrice = mongoose.model('ItemPrice', ItemPriceSchema, 'itemprices');
module.exports = ItemPrice;
