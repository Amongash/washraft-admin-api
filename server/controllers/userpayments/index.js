const { UserPayment } = require('../../models');

/* eslint-disable consistent-return */
exports.index = async (req, res, next) => {
  UserPayment.find({}, (err, payments) => {
    if (err) return next(err);
    return res.json(payments);
  });
};

exports.new = async (req, res, next) => {
  try {
    const payment = new UserPayment({
      // eslint-disable-next-line no-underscore-dangle
      userId: req.user._id,
      paid: req.body.paid,
      remainder: req.body.remainder,
    });
    const savedPayment = await payment.save();
    if (savedPayment) {
      console.log(`UserPayment has been saved`, savedPayment);
      return res.json('Success: true');
    }
    return next(new Error('Failed to save payment for unknown reasons'));
  } catch (err) {
    return next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    await UserPayment.findById(paymentId, (err, payment) => {
      if (err) return next(new Error('Failed to retrieve payment for unknown reasons'));
      console.log(`UserPayment: `, payment);
      return res.json(payment);
    });
  } catch (err) {
    return next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    await UserPayment.findOneAndUpdate(
      { _id: req.params.paymentId },
      req.body,
      { new: true },
      (err, payment) => {
        if (err) return next(new Error('Failed to update payment for unknown reasons'));
        console.log(`UserPayment: `, payment);
        return res.json(payment);
      }
    );
  } catch (err) {
    return next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await UserPayment.deleteOne({ _id: req.params.paymentId }, err => {
      if (err) return next(new Error('Failed to delete payment for unknown reasons'));
      return res.json({ message: 'UserPayment deleted successfully' });
    });
  } catch (err) {
    return next(err);
  }
};
