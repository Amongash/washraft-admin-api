const express = require('express');
const userpayments = require('../../controllers/userpayments');

const router = express.Router();

// eslint-disable-next-line no-unused-vars
module.exports = params => {
  router.get('/', userpayments.index);
  router.post('/new', userpayments.new);

  router.get('/:paymentId', userpayments.getById);
  router.put('/:paymentId', userpayments.update);
  // router.delete('/:paymentId', userpayments.delete); *Not required

  return router;
};
