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
    totalItemUnits: {
      type: Number,
    },
    totalUnitPrice: {
      type: Number,
    },
    totalKgPrice: {
      type: Number,
    },
  },
  { timestamps: true }
);

const calculateTotalOrderPrice = doc => {
  const order = doc;
  let totalPrice = 0;
  order.items.map(item => {
    totalPrice += item.price * item.unit;
    return totalPrice;
  });
  order.totalUnitPrice = totalPrice;
  return order;
};

OrderSchema.pre('save', async function preSave(next) {
  try {
    const order = this;
    if (order.items === 'undefined') return next();
    calculateTotalOrderPrice(order);
    return next();
  } catch (err) {
    return next(err);
  }
});

OrderSchema.post('save', async function postSave(doc, next) {
  try {
    const order = doc;
    if (order.status !== 'Pending') return next();
    if (order.totalPricePerItem || order.totalKgPrice !== 0) {
      const payment = new UserPayment({
        userId: order.userId,
        orderId: order.id,
        paid: 0,
        remainder: order.totalUnitPrice,
      });
      await payment.save();
    }
    return next();
  } catch (err) {
    return next(err);
  }
});

const Order = mongoose.model('Order', OrderSchema, 'orders');
module.exports = Order;
