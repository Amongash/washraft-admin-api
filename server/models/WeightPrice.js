const mongoose = require('mongoose');

const WeightPriceSchema = mongoose.Schema(
  {
    unit: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const WeightPrice = mongoose.model('WeightPrice', WeightPriceSchema, 'weightPrices');
module.exports = WeightPrice;
