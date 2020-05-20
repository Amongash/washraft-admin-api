const express = require('express');
const orders = require('../../controllers/orders');

const router = express.Router();

module.exports = () => {
  router.get('/', orders.index); // list all orders
  router.post('/create', orders.addNewOrder); // create an order

  router.get('/:orderId', orders.getById); // retrieve by Order ID
  router.get('/users/:userId', orders.getByUserId); // retrieve all orders for the specified user
  router.put('/:orderId', orders.update); // update an order
  router.delete('/:orderId', orders.delete); // delete an order

  return router;
};
