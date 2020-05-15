const { Item } = require('../../models');

exports.index = async (req, res, next) => {
  Item.find({}, (err, items) => {
    if (err) return next(err);
    return res.json(items);
  });
};

exports.addNewItem = async (req, res, next) => {
  try {
    const item = new Item({
      type: req.body.type,
      description: req.body.description,
      price: req.body.price,
    });
    const savedItem = await item.save();
    if (savedItem) {
      console.log(`Item has been saved`, savedItem);
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
    await Item.findById(itemId, (err, item) => {
      if (err) return next(new Error('Failed to retrieve item for unknown reasons'));
      console.log(`Item: `, item);
      return res.json(item);
    });
  } catch (err) {
    return next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    await Item.findOneAndUpdate(
      { _id: req.params.itemId },
      req.body,
      { new: true },
      (err, item) => {
        if (err) return next(new Error('Failed to update item for unknown reasons'));
        console.log(`Item: `, item);
        return res.json(item);
      }
    );
  } catch (err) {
    return next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await Item.deleteOne({ _id: req.params.itemId }, err => {
      if (err) return next(new Error('Failed to delete item for unknown reasons'));
      return res.json({ message: 'Item deleted successfully' });
    });
  } catch (err) {
    return next(err);
  }
};
