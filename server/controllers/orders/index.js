/* eslint-disable no-underscore-dangle */
const { Order } = require('../../models');

// const OrderStatus = require('../../models/OrderStatusModel');

exports.index = async (req, res, next) => {
  Order.find({}, (err, orders) => {
    if (err) return next(err);
    return res.json(orders);
  });
};

// eslint-disable-next-line consistent-return
exports.addNewOrder = async (req, res, next) => {
  try {
    const orderItems = [
      {
        type: 'shirt',
        unit: 5,
        price: 100,
      },
      {
        type: 'shirt',
        unit: 10,
        price: 50,
      },
    ];

    //TODO Remove hardcoded order items and use posted order items

    // const { orderItems } = req.body;

    console.log(orderItems);
    const order = new Order({
      userId: req.user._id,
      totalQuantity: req.body.totalQuantity,
      status: req.body.status,
      remarks: req.body.remarks,
      items: orderItems,
    });
    // eslint-disable-next-line consistent-return
    await order.save((err, items) => {
      if (err) return next(err);
      console.log(items);
      return res.json({ Success: true });
    });
  } catch (err) {
    return next(err);
  }
};

// eslint-disable-next-line consistent-return
exports.getByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params.userId;
    const fields = 'totalQuantity remarks status items';
    await Order.find(userId, fields, (err, order) => {
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
        if (err) return next(new Error('Failed to update order for unknown reasons'));
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
      if (err) return next(new Error('Failed to delete order for unknown reasons'));
      return res.json({ message: 'Order deleted successfully' });
    });
  } catch (err) {
    return next(err);
  }
};
