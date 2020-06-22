const express = require('express');
const roles = require('../../controllers/roles');

const router = express.Router();

// eslint-disable-next-line no-unused-vars
module.exports = params => {
  router.get('/', roles.index);
  router.post('/add', roles.add);
  //   router.post('/users/roles/:role', roles.getByRole);
  //   router.put('/users/roles/:roleId', roles.update);
  //   router.delete('/users/roles:roleId', roles.delete);

  return router;
};
