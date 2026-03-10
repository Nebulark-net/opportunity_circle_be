import { expect } from 'chai';
import request from 'supertest';
import { app } from '../../src/app.js';
import { User } from '../../src/models/User.js';
import { PublisherProfile } from '../../src/models/PublisherProfile.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.test' });

describe('Publisher Integration Tests', function () {
  this.timeout(10000);
  let accessToken;
  let userId;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/opportunity-circle-test');
    }
    await User.deleteMany({});
    await PublisherProfile.deleteMany({});

    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'org@test.com',
        password: 'password123',
        role: 'PUBLISHER',
        fullName: 'Org Admin',
      });
    
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'org@test.com',
        password: 'password123',
      });

    accessToken = loginRes.body.data.accessToken;
    userId = loginRes.body.data.user._id;

    await PublisherProfile.create({
      userId,
      organizationName: 'Test Org',
    });
  });

  after(async () => {
    await mongoose.connection.close();
  });

  it('should fetch publisher dashboard stats', async () => {
    const res = await request(app)
      .get('/api/v1/publishers/dashboard/stats')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).to.equal(200);
    expect(res.body.data).to.have.property('totalListings');
  });
});
