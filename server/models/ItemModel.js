const mongoose = require('mongoose');

const ItemSchema = mongoose.Schema(
  {
    type: {
      type: String,
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model('Item', ItemSchema);
