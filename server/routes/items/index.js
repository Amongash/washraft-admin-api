const express = require('express');
const items = require('../../controllers/items');

const router = express.Router();

// eslint-disable-next-line no-unused-vars
module.exports = params => {
  router.get('/', items.index);
  router.post('/create', items.addNewItem);

  router.get('/:itemId', items.getById);
  router.put('/:itemId', items.update);
  router.delete('/:itemId', items.delete);

  return router;
};
