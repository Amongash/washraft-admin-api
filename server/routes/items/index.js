const express = require('express');
const PaymentModel = require('../../models/PaymentModel');

const router = express.Router();

function redirectIfNotLoggedIn(req, res, next) {
  if (!req.user) return res.redirect('/users');
  return next();
}

module.exports = () => {
  // const { images } = params;

  router.get('/', redirectIfNotLoggedIn, (req, res) => {
    res.status(200).send('payment');
  });

  router.post('/', redirectIfNotLoggedIn, async (req, res, next) => {
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
