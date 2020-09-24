/* eslint-disable no-underscore-dangle */
const moment = require('moment');
const { UserPayment, Order } = require('../../models');

const { lipaNaMpesaConfigs, mpesaFunctions } = require('../../config/mpesa');

/* eslint-disable consistent-return */
exports.getAll = async (req, res, next) => {
  UserPayment.find({}, (err, payments) => {
    if (err) return next(err);
    return res.json(payments);
  });
};

exports.initiate = async (req, res, next) => {
  try {
    /**
     * Set Lipa na Mpesa Service Name
     */
    req.body.service = 'STK-PUSH';
    const request = req.body;

    const phoneNumber = !request.phoneNumber ? req.user.phoneNumber : request.phoneNumber;
    // Check if order exists
    Order.findOne({ id: request.orderId, userId: req.user._id }).exec(err => {
      if (err) return next(new Error('Order does not exist.'));
      if (!(request.amount || phoneNumber || request.description)) {
        mpesaFunctions.handleError(res, 'Invalid request received');
      } else {
        const BusinessShortCode = lipaNaMpesaConfigs.shortCode; // Business Shortcode
        const CallBackURL = lipaNaMpesaConfigs.callBackURL;
        const AccountReference = lipaNaMpesaConfigs.accountReference;
        const TransactionDesc = lipaNaMpesaConfigs.transactionDescription;
        const timeStamp = moment().format('YYYYMMDDHHmmss');
        const rawPass = BusinessShortCode + lipaNaMpesaConfigs.key + timeStamp;
        // Request object
        req.mpesaTransaction = {
          BusinessShortCode,
          Password: Buffer.from(rawPass).toString('base64'),
          Timestamp: timeStamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: request.amount,
          PartyA: request.phoneNumber,
          PartyB: BusinessShortCode,
          PhoneNumber: request.phoneNumber,
          CallBackURL,
          AccountReference,
          TransactionDesc,
        };
        // console.log(` POST Req: ${JSON.stringify(req.mpesaTransaction)}`);
        next();
      }
    });
  } catch (error) {
    return next(error);
  }
};

exports.processPayment = async (req, res, next) => {
  try {
    if (req.merchantMsg.status !== '01') {
      await UserPayment.findOneAndUpdate(
        { orderId: req.body.orderId },
        { $set: { status: 'Processing' } },
        err => {
          if (err) return next(new Error('Failed to process payment for unknown reasons.'));
          console.log('Payment processed successfully.');
        }
      );
    }
    return res.json({ message: 'Awaiting payment from user.' });
  } catch (err) {
    return next(new Error('Payment failed.'));
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

exports.validation = async (req, res) => {
  return res.json(res);
};

exports.confirmation = async (req, res) => {
  return res.json(res);
};
