import { expect } from 'chai';
import request from 'supertest';
import { app } from '../../src/app.js';
import { User } from '../../src/models/User.js';
import { Opportunity } from '../../src/models/Opportunity.js';
import { PublisherProfile } from '../../src/models/PublisherProfile.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.test' });

describe('Opportunity Integration Tests', function () {
  this.timeout(10000);
  let accessToken;
  let publisherId;

  before(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/opportunity-circle-test');
    }
    
    // Cleanup
    await User.deleteMany({});
    await Opportunity.deleteMany({});

    // Create a publisher
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'publisher@test.com',
        password: 'password123',
        role: 'PUBLISHER',
        fullName: 'Pub Test',
      });
    
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'publisher@test.com',
        password: 'password123',
      });

    accessToken = loginRes.body.data.accessToken;
    publisherId = loginRes.body.data.user._id;

    await PublisherProfile.create({
      userId: publisherId,
      organizationName: 'Test Publisher',
    });
  });

  after(async () => {
    await mongoose.connection.close();
  });

  it('should create a new opportunity', async () => {
    const res = await request(app)
      .post('/api/v1/opportunities')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        type: 'INTERNSHIP',
        title: { en: 'Test Internship' },
        organizationName: 'Test Organization',
        description: { en: 'This is a test' },
        location: 'Remote',
        deadline: new Date(Date.now() + 86400000).toISOString(),
      });

    expect(res.status).to.equal(201);
    expect(res.body.data.title.en).to.equal('Test Internship');
  });

  it('should fetch all active opportunities', async () => {
    const res = await request(app).get('/api/v1/opportunities');
    expect(res.status).to.equal(200);
    expect(res.body.data.opportunities).to.be.an('array');
  });
});
