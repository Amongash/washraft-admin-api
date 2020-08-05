/* eslint-disable import/no-extraneous-dependencies */
const faker = require('faker');
const isDocker = require('is-docker');
const mongodb = require('../lib/database/mongoose');
const { User, Order } = require('../models');
const { createUser } = require('../lib/database/user');
const { hashPassword } = require('../lib/auth/utils');
const config = require('../config')[process.env.NODE_ENV || 'development'];

const createFakeUser = async () => {
  try {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const newUser = await createUser({
      email: faker.internet.email(firstName, lastName),
      password: await hashPassword('password123'),
      firstName,
      lastName,
      role: 'Customer',
    });
    // visual feedback always feels nice!
    console.log(newUser.email);

    if (newUser) return Promise.resolve(newUser);
    return true;
  } catch (error) {
    return Promise.reject(error);
  }
};

// eslint-disable-next-line consistent-return
const createFakeUserOrders = async () => {
  try {
    const orders = [];
    /**
     * Get the count of all users
     * */
    User.countDocuments().exec((err, count) => {
      /*
       * Get a random entry
       */
      const random = Math.floor(Math.random() * count);
      /**
       * query all users
       * fetch one
       * offset by our random #
       */
      User.findOne()
        .skip(random)
        .exec(async (_err, result) => {
          for (let i = 0; i < 3; i += 1) {
            const newOrder = {
              // eslint-disable-next-line no-underscore-dangle
              userId: result._id,
              totalQuantity: faker.random.number(20),
              remarks: faker.lorem.sentence(6),
              status: 'pending',
              items: {
                type: faker.lorem.word(),
                unit: faker.random.number(10),
                price: faker.finance.amount(10, 50),
              },
            };

            orders.push(newOrder);
            /**
             * visual feedback always feels nice!
             * */

            console.log(newOrder.remarks);
          }
          const createdOrders = await Order.create(orders);
          if (createdOrders) return Promise.resolve(createdOrders);
        });
    });
  } catch (error) {
    return Promise.reject(error);
  }
};
/**
 * Set Database
 */
function setDatabase() {
  if (isDocker()) {
    return config.dockerDatabase.dsn;
  }
  return config.hostDatabase.dsn;
}
const database = setDatabase();

/**
 * connect to the database server
 */
mongodb.connect(database).then(async (err, client) => {
  try {
    /**
     * create a few fake users
     */
    for (let user = 0; user < 10; user += 1) {
      createFakeUser();
    }

    /**
     * make a bunch of orders
     */
    for (let i = 0; i < 10; i += 1) {
      createFakeUserOrders();
    }
    client.close();
    return process.exit();
  } catch (error) {
    return err;
  }
});
