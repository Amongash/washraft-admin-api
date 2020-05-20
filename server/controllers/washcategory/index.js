/* eslint-disable consistent-return */
const { WashCategory } = require('../../models');

exports.index = async (req, res, next) => {
  WashCategory.find()
    .select('category items')
    .populate('items', 'type, price')
    .exec((err, categories) => {
      if (err) return next(err);
      return res.json(categories);
    });
};

exports.AddNewWashCategory = async (req, res, next) => {
  try {
    const washcategory = new WashCategory({
      category: req.body.category,
      items: req.body.items,
    });
    const savedItem = await washcategory.save();
    if (savedItem) {
      console.log(`WashCategory has been saved`, savedItem);
      return res.json('Success: true');
    }
    return next(new Error('Failed to save washcategory for unknown reasons'));
  } catch (err) {
    return next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { washCategoryId } = req.params;
    await WashCategory.findById(washCategoryId)
      .select('category items')
      .populate('items', 'type, price')
      .exec((err, category) => {
        if (err) return next(new Error('Failed to retrieve washcategory for unknown reasons'));
        console.log(`WashCategory: `, category);
        return res.json(category);
      });
  } catch (err) {
    return next(err);
  }
};

exports.update = async (req, res, next) => {
  // TODO Update wash category
  try {
    await WashCategory.findOneAndUpdate(
      { _id: req.params.washCategoryId },
      req.body,
      { new: true },
      (err, washcategory) => {
        if (err) return next(new Error('Failed to update washcategory for unknown reasons'));
        console.log(`WashCategory: `, washcategory);
        return res.json(washcategory);
      }
    );
  } catch (err) {
    return next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await WashCategory.deleteOne({ _id: req.params.washCategoryId }, err => {
      if (err) return next(new Error('Failed to delete washcategory for unknown reasons'));
      return res.json({ message: 'WashCategory deleted successfully' });
    });
  } catch (err) {
    return next(err);
  }
};
