const { Mpesa } = require('mpesa-api');
const { mpesaConfigs, credentials, environment } = require('../../config/mpesa');
const { UserPayment } = require('../../models');

const mpesa = new Mpesa(credentials, environment);

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
      console.log(`Payment has been saved`, savedPayment);
      return res.json({ success: 'false', message: 'Payment saved successfully.' });
    }
    return next(new Error('Failed to save payment for unknown reasons.'));
  } catch (err) {
    return next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    await UserPayment.findById(paymentId, (err, payment) => {
      if (err) return next(new Error('Failed to retrieve payment for unknown reasons.'));
      console.log(`Retrieved Payment: `, payment);
      return res.json(payment);
    });
  } catch (err) {
    return next(err);
  }
};

exports.getByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    await UserPayment.find({ userId }, (err, payment) => {
      if (err) return next(new Error('Failed to retrieve payment for unknown reasons.'));
      console.log(`Retrieved User Payment: `, payment);
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
        if (err) return next(new Error('Failed to update payment for unknown reasons.'));
        console.log(`Updated Payment: `, payment);
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
      return res.json({ message: 'Payment deleted successfully.' });
    });
  } catch (err) {
    return next(err);
  }
};

exports.validation = async (req, res, next) => {
  return res.json(res);
};

exports.confirmation = async (req, res, next) => {
  return res.json(res);
};

exports.test = async (req, res, next) => {
  mpesa
    .c2bRegister({
      ShortCode: mpesaConfigs.shortCode,
      ResponseType: 'Completed',
      ConfirmationURL: 'http://localhost/payments/confirmation',
      ValidationURL: 'http://localhost/payments/validation',
    })
    .then(response => {
      // Do something with the response
      // eg
      console.log(response);
    })
    .catch(error => {
      // Do something with the error;
      // eg
      console.error(error);
    });
};
