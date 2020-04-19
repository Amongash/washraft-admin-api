const express = require('express');
const ProductModel = require('../../models/ProductModel');

const router = express.Router();

module.exports = () => {
  // const { images } = params;

  router.get('/', (req, res) => {
    res.status(200).send('payment');
  });

  router.post('/', async (req, res, next) => {
    try {
      const payment = new PaymentModel({
        amountPaid: req.body.amountPaid,
      });

      const savedPayment = await payment.save();

      if (savedPayment) return res.json('Success: true');
      return next(new Error('Failed to save payment for unknown reasons'));
    } catch (err) {
      return next(err);
    }
  });

  return router;
};
