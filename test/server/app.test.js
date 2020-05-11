const chai = require('chai');
const chaiHttp = require('chai-http');
const helper = require('../helper');

const should = chai.should();
const { config } = helper;
const app = require('../../server/app')(config);

chai.use(chaiHttp);

describe('The Application', () => {
  beforeEach(async () => helper.before());
  afterEach(async () => helper.after());
  it('should have an index route', async () => {
    const res = await chai.request(app).get('/');
    res.should.have.status(200);
  });
  it('should have an item route', async () => {
    const res = await chai.request(app).get('/items');
    res.should.have.status(200);
  });
  it('should have an order route', async () => {
    const res = await chai.request(app).get('/orders');
    res.should.have.status(200);
  });
  it('should have a registration route', async () => {
    const res = await chai.request(app).get('/users/registration');
    res.should.have.status(200);
  });
});
