// backend/tests/identify.test.js

const request = require('supertest');
const app = require('../server'); // Your Express app
const Contact = require('../models/Contact');

jest.mock('../models/Contact'); // Mock your MongoDB model

describe('/identify route', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Reset mocks between tests
  });

  it('should return 400 if no email and phoneNumber provided', async () => {
    const res = await request(app).post('/identify').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      'error',
      'Either email or phone number must be provided'
    );
  });

  it('should create new contact if none found', async () => {
  Contact.find.mockReturnValue({
    sort: jest.fn().mockResolvedValue([])
  });

  Contact.prototype.save = jest.fn().mockImplementation(function () {
    this._id = 'abc123';
    this.email = 'test@example.com';
    this.phoneNumber = '1234567890';
    return Promise.resolve(this);
  });

  const res = await request(app)
    .post('/identify')
    .send({ email: 'test@example.com', phoneNumber: '1234567890' });

  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty('contact');
  expect(res.body.contact.primaryContactId).toBe('abc123');
  expect(res.body.contact.emails).toEqual(['test@example.com']);
  expect(res.body.contact.phoneNumbers).toEqual(['1234567890']);
  expect(res.body.contact.secondaryContactIds).toEqual([]);
});


});

