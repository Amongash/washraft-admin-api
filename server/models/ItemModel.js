const mongoose = require('mongoose');

const ItemSchema = mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      min: 5,
      max: 12,
      trim: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Item', ItemSchema);
