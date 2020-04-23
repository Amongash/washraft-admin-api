const Item = require('../../models/ItemModel');

exports.index = async (req, res, next) => {
  Item.find({}).exec((err, items) => {
    if (err) return next(err);
    return res.json(items);
  });
};

exports.create = async (req, res, next) => {
  try {
    const item = new Item({
      type: req.body.type,
      description: req.body.description,
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

exports.findById = async (req, res, next) => {
  const { itemId } = req.params;
  console.log(itemId);
  await Item.findById(itemId).exec((err, item) => {
    if (err) return next(err);
    console.log(`Item: `, item);
    return res.json(item);
  });
};

exports.update = async (req, res) => {
  return res.json('Item updated successfully');
};

exports.destroy = async (req, res) => {
  return res.json('Item deleted successfully');
};
