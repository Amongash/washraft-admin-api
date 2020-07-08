const mongoose = require('mongoose');

const WashCategorySchema = mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const WashCategory = mongoose.model('WashCategory', WashCategorySchema, 'washcategory');

module.exports = WashCategory;
