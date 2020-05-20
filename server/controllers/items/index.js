/* eslint-disable consistent-return */
const { ItemPrice } = require('../../models');

exports.index = async (req, res, next) => {
  ItemPrice.find({}, (err, items) => {
    if (err) return next(err);
    return res.json(items);
  });
};

exports.addNewItem = async (req, res, next) => {
  try {
    const item = new ItemPrice({
      type: req.body.type,
      price: req.body.price,
    });
    const savedItem = await item.save();
    if (savedItem) {
      console.log(`ItemPrice has been saved`, savedItem);
      return res.json('Success: true');
    }
    return next(new Error('Failed to save item for unknown reasons'));
  } catch (err) {
    return next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    await ItemPrice.findById(itemId, (err, item) => {
      if (err) return next(new Error('Failed to retrieve item for unknown reasons'));
      console.log(`ItemPrice: `, item);
      return res.json(item);
    });
  } catch (err) {
    return next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    await ItemPrice.findOneAndUpdate(
      { _id: req.params.itemId },
      req.body,
      { new: true },
      (err, item) => {
        if (err) return next(new Error('Failed to update item for unknown reasons'));
        console.log(`ItemPrice: `, item);
        return res.json(item);
      }
    );
  } catch (err) {
    return next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await ItemPrice.deleteOne({ _id: req.params.itemId }, err => {
      if (err) return next(new Error('Failed to delete item for unknown reasons'));
      return res.json({ message: 'ItemPrice deleted successfully' });
    });
  } catch (err) {
    return next(err);
  }
};
