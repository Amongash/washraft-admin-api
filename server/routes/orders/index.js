const express = require('express');
const orders = require('../../controllers/orders');

const router = express.Router();

module.exports = () => {
  // const { images } = params;

  router.get('/', orders.index);
  router.post('/create', orders.addNewOrder);

  router.get('/:orderId', orders.getById);
  router.put('/:orderId', orders.update);
  router.delete('/:orderId', orders.delete);

  return router;
};
