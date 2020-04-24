process.env.DEBUG = 'mongo-seeding';
require('dotenv').config();
const path = require('path');
const { Seeder } = require('mongo-seeding');

const config = {
  database: process.env.DEVELOPMENT_DB_DSN,
  dropDatabase: false,
};

const seeder = new Seeder(config);
const collections = seeder.readCollectionsFromPath(
  path.resolve(path.join(__dirname, '../jsondata')),
  {
    transformers: [Seeder.Transformers.replaceDocumentIdWithUnderscoreId],
  }
);
const main = async () => {
  try {
    await seeder.import(collections);
    console.log('Success');
  } catch (err) {
    console.log('Error', err);
  }
};
main();
