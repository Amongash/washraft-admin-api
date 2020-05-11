const Order = require('../../models/OrderModel');
// const OrderOrder = require('../../models/OrderOrderModel');
// const OrderStatus = require('../../models/OrderStatusModel');

exports.index = async (req, res, next) => {
  Order.find({}, (err, orders) => {
    if (err) return next(err);
    return res.json(orders);
  });
};

exports.addNewOrder = async (req, res, next) => {
  try {
    console.log(req.user.id);
    const order = new Order({
      userId: req.user.id,
      totalQuantity: req.body.totalQuantity,
      status: req.body.status,
      remarks: req.body.remarks,
    });

    const savedOrder = await order.save();
    if (savedOrder) {
      console.log(`Order has been saved`, savedOrder);
      return res.json('Success: true');
    }
    return next(new Error('Failed to save order for unknown reasons'));
  } catch (err) {
    return next(err);
  }
};

// eslint-disable-next-line consistent-return
exports.getById = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    await Order.findById(orderId, (err, order) => {
      if (err) return next(new Error('Failed to retrieve order for unknown reasons'));
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
