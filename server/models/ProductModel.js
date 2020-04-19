const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema(
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

module.exports = mongoose.model('Product', ProductSchema);
