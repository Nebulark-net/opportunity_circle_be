import { expect } from 'chai';
import request from 'supertest';
import { app } from '../../src/app.js';
import { User } from '../../src/models/User.js';
import { Resource } from '../../src/models/Resource.js';
import { SavedItem } from '../../src/models/SavedItem.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.test' });

describe('Resource Integration Tests', function () {
  this.timeout(10000);
  let accessToken;
  let userId;
  let resourceId;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/opportunity-circle-test');
    }
    await User.deleteMany({});
    await Resource.deleteMany({});
    await SavedItem.deleteMany({});

    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'seeker@test.com',
        password: 'password123',
        role: 'SEEKER',
        fullName: 'Seeker Test',
      });
    
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'seeker@test.com',
        password: 'password123',
      });

    accessToken = loginRes.body.data.accessToken;
    userId = loginRes.body.data.user._id;

    const resource = await Resource.create({
      publisherId: userId,
      title: { en: 'Career Guide' },
      type: 'CAREER_GUIDE',
      description: { en: 'Content' },
    });
    resourceId = resource._id;
  });

  after(async () => {
    await mongoose.connection.close();
  });

  it('should toggle save a resource', async () => {
    const res = await request(app)
      .post('/api/v1/seekers/toggle-save')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        itemId: resourceId,
        itemType: 'RESOURCE',
      });

    expect(res.status).to.equal(200);
    expect(res.body.data.saved).to.be.true;
  });

  it('should fetch my saved items', async () => {
    const res = await request(app)
      .get('/api/v1/seekers/saved-items')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).to.equal(200);
    expect(res.body.data).to.be.an('array');
    expect(res.body.data.length).to.equal(1);
  });
});
