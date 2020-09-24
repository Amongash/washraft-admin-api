const express = require('express');
const {
  getAll,
  getById,
  getByUserId,
  processPayment,
  initiate,
} = require('../../controllers/userpayments');
const {
  bootstrapRequest,
  auth,
  postTransaction,
  processResponse,
  fetchTransaction,
  updateTransaction,
  forwardRequestToRemoteClient,
} = require('../../lib/mpesa/api/lipanampesa/lipaNaMPesa');

const router = express.Router();

// eslint-disable-next-line no-unused-vars
module.exports = params => {
  router.get('/', getAll);

  router.get('/id/:paymentId', getById);
  router.get('/userId/:userId', getByUserId);

  // router.delete('/:paymentId', delete); *Not required

  router.post('/pay', initiate, auth, postTransaction, processResponse, processPayment);
  router.post(
    '/lipaNaMpesaService/callback',
    fetchTransaction,
    updateTransaction,
    forwardRequestToRemoteClient,
    (req, res) => {
      res.json({
        ResultCode: 0,
        ResultDesc: 'The service request is processed successfully.',
      });
    }
  );

  return router;
};
