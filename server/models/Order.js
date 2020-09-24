const mongoose = require('mongoose');
const OrderItem = require('./OrderItem');
const UserPayment = require('./UserPayment');

const OrderSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalWeightQuantity: {
      type: Number,
    },
    status: {
      type: String,
      default: 'Pending',
    },
    remarks: {
      type: String,
    },
    items: [OrderItem],
    totalItems: {
      type: Number,
    },
    totalItemsPrice: {
      type: Number,
    },
    totalWeightPrice: {
      type: Number,
    },
  },
  { timestamps: true }
);

const calculateTotalItemPrice = doc => {
  const order = doc;
  let totalPrice = 0;
  order.items.map(item => {
    totalPrice += item.price * item.unit;
    return totalPrice;
  });
  order.totalItemsPrice = totalPrice;
  return order;
};

const calculateTotalItems = doc => {
  const order = doc;
  let totalItems = 0;
  order.items.map(item => {
    totalItems += item.unit;
    return totalItems;
  });
  order.totalItems = totalItems;
  return order;
};

OrderSchema.pre('save', async function preSave(next) {
  try {
    const order = this;
    if (order.items === 'undefined') return next();
    calculateTotalItemPrice(order);
    calculateTotalItems(order);
    return next();
  } catch (err) {
    return next(err);
  }
});

OrderSchema.post('save', async function postSave(doc, next) {
  try {
    const order = doc;
    if (order.status === 'Pending') {
      if (order.totalItemsPrice !== 0) {
        const payment = new UserPayment({
          userId: order.userId,
          orderId: order.id,
          amount: 0,
          remainder: order.totalItemsPrice,
        });
        await payment.save();
      }
    }

    return next();
  } catch (err) {
    return next(err);
  }
});

const Order = mongoose.model('Order', OrderSchema, 'orders');
module.exports = Order;
