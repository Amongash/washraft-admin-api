const express = require('express');
const items = require('../../controllers/items');

const router = express.Router();

// eslint-disable-next-line no-unused-vars
module.exports = params => {
  router.get('/', items.index);
  router.post('/create', items.create);

  router.get('/:itemId', items.findById);
  router.put('/:itemId', items.update);
  router.delete('/:itemId', items.destroy);

  return router;
};
