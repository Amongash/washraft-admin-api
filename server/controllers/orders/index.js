/* eslint-disable no-underscore-dangle */
const { Order } = require('../../models');

// const OrderStatus = require('../../models/OrderStatusModel');
function isJson(item) {
  item = typeof item !== 'string' ? JSON.stringify(item) : item;

  try {
    item = JSON.parse(item);
  } catch (e) {
    return false;
  }

  if (typeof item === 'object' && item !== null) {
    return true;
  }

  return false;
}

exports.index = async (req, res, next) => {
  Order.find({}, (err, orders) => {
    if (err) return next(err);
    return res.json(orders);
  });
};

// eslint-disable-next-line consistent-return
exports.addNewOrder = async (req, res, next) => {
  try {
    let { orderItems } = req.body;
    orderItems = !isJson(orderItems) ? JSON.parse(orderItems) : orderItems;
    if (req.user) {
      const order = new Order({
        userId: req.user._id,
        totalWeightQuantity: req.body.totalWeightQuantity,
        status: req.body.status,
        remarks: req.body.remarks,
        items: orderItems,
      });
      const savedOrder = await order.save();
      if (savedOrder) return res.json({ success: true, message: 'Order received successfully.' });
      return next();
    }
    return res.json({ Error: 'Unable to create order' });
  } catch (err) {
    return next(err);
  }
};

// eslint-disable-next-line consistent-return
exports.getByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params.userId;
    const select = 'totalWeightQuantity totalWeightPrice totalItemUnits remarks status items';
    await Order.find(userId, select, (err, order) => {
      if (err) return next(err);
      console.log(`Order: `, order);
      return res.json(order);
    });
  } catch (err) {
    return next(err);
  }
};

// eslint-disable-next-line consistent-return
exports.getById = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    await Order.findById(orderId).exec((err, order) => {
      if (err) return next(err);
      console.log(`Order: `, order);
      return res.json(order);
    });
  } catch (err) {
    return next(err);
  }
};

// eslint-disable-next-line consistent-return
exports.update = async (req, res, next) => {
  try {
    // TODO Update orders and order items.

    await Order.findOneAndUpdate(
      { _id: req.params.orderId },
      req.body,
      { new: true },
      (err, order) => {
        if (err) return next(new Error('Failed to update order for unknown reasons.'));
        console.log(`Order: `, order);
        return res.json(order);
      }
    );
  } catch (err) {
    return next(err);
  }
};

// eslint-disable-next-line consistent-return
exports.delete = async (req, res, next) => {
  try {
    await Order.deleteOne({ _id: req.params.orderId }, err => {
      if (err) return next(new Error('Failed to delete order for unknown reasons.'));
      return res.json({ message: 'Order deleted successfully.' });
    });
  } catch (err) {
    return next(err);
  }
};
