import { expect } from 'chai';
import request from 'supertest';
import { app } from '../../src/app.js';
import { User } from '../../src/models/User.js';
import { Opportunity } from '../../src/models/Opportunity.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.test' });

describe('Guest-to-Applicant Journey Integration Tests', function () {
  this.timeout(10000);
  let opportunityId;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/opportunity-circle-test');
    }
    
    await User.deleteMany({});
    await Opportunity.deleteMany({});

    // Create a publisher and an opportunity
    const publisher = await User.create({
      email: 'pub@guest.com',
      password: 'password123',
      role: 'PUBLISHER',
      fullName: 'Pub Guest',
    });

    const opportunity = await Opportunity.create({
      publisherId: publisher._id,
      type: 'INTERNSHIP',
      title: { en: 'Guest Test Opportunity' },
      organizationName: 'Guest Org',
      description: { en: 'This is a test for guests' },
      location: 'Remote',
      deadline: new Date(Date.now() + 86400000),
      status: 'ACTIVE',
    });

    opportunityId = opportunity._id;
  });

  after(async () => {
    await mongoose.connection.close();
  });

  it('should allow guest to view opportunities', async () => {
    const res = await request(app).get('/api/v1/opportunities');
    expect(res.status).to.equal(200);
    expect(res.body.data.opportunities).to.be.an('array');
    expect(res.body.data.opportunities[0].title.en).to.equal('Guest Test Opportunity');
  });

  it('should allow guest to view a single opportunity', async () => {
    const res = await request(app).get(`/api/v1/opportunities/${opportunityId}`);
    expect(res.status).to.equal(200);
    expect(res.body.data.title.en).to.equal('Guest Test Opportunity');
  });

  it('should return 401 when guest tries to apply without token', async () => {
    const res = await request(app)
      .post(`/api/v1/seekers/opportunities/${opportunityId}/apply`)
      .send({
        notes: 'I want to apply as a guest',
      });

    // Should return 401 because verifyJWT is used on seeker routes
    expect(res.status).to.equal(401);
  });

  it('should return 403 when guest tries to apply with a non-seeker token', async () => {
    // Login as publisher
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'pub@guest.com',
        password: 'password123',
      });
    
    const publisherToken = loginRes.body.data.accessToken;

    const res = await request(app)
      .post(`/api/v1/seekers/opportunities/${opportunityId}/apply`)
      .set('Authorization', `Bearer ${publisherToken}`)
      .send({
        notes: 'I want to apply as a publisher',
      });

    // Should return 403 because authorizeRoles('SEEKER') is used
    expect(res.status).to.equal(403);
  });
});
