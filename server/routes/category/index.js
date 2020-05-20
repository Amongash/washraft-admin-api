const express = require('express');
const washCategory = require('../../controllers/washcategory');

const router = express.Router();

// eslint-disable-next-line no-unused-vars
module.exports = params => {
  router.get('/', washCategory.index); // list all wash categories
  router.get('/:washCategoryId', washCategory.getById); // retrieve specific wash category by its ID
  router.post('/create', washCategory.AddNewWashCategory); // add a new wash category
  router.put('/:washCategoryId', washCategory.update); // update wash category by its ID
  router.delete('/:washCategoryId', washCategory.delete); // delete specified wash category
  return router;
};
