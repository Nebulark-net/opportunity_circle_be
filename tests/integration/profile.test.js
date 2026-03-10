import { expect } from 'chai';
import request from 'supertest';
import { app } from '../../src/app.js';
import { User } from '../../src/models/User.js';
import { UserPreference } from '../../src/models/UserPreference.js';
import { PublisherProfile } from '../../src/models/PublisherProfile.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.test' });

describe('Profile & Onboarding Integration Tests', function () {
  this.timeout(10000);
  let seekerToken;
  let publisherToken;

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/opportunity-circle-test');
    }
    
    await User.deleteMany({});
    await UserPreference.deleteMany({});
    await PublisherProfile.deleteMany({});

    // Register seeker
    await request(app).post('/api/v1/auth/register').send({
      email: 'seeker@profile.com',
      password: 'password123',
      role: 'SEEKER',
      fullName: 'Seeker Profile',
    });
    const seekerLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'seeker@profile.com',
      password: 'password123',
    });
    seekerToken = seekerLogin.body.data.accessToken;

    // Register publisher
    await request(app).post('/api/v1/auth/register').send({
      email: 'publisher@profile.com',
      password: 'password123',
      role: 'PUBLISHER',
      fullName: 'Publisher Profile',
    });
    const publisherLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'publisher@profile.com',
      password: 'password123',
    });
    publisherToken = publisherLogin.body.data.accessToken;
  });

  after(async () => {
    await mongoose.connection.close();
  });

  describe('Seeker Profile', () => {
    it('should fetch own profile', async () => {
      const res = await request(app)
        .get('/api/v1/seekers/profile')
        .set('Authorization', `Bearer ${seekerToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.data.user.email).to.equal('seeker@profile.com');
      expect(res.body.data.preferences).to.not.be.null;
    });

    it('should update profile', async () => {
      const res = await request(app)
        .patch('/api/v1/seekers/profile')
        .set('Authorization', `Bearer ${seekerToken}`)
        .send({
          bio: 'My new bio',
          location: 'New York',
        });

      expect(res.status).to.equal(200);
      expect(res.body.data.bio).to.equal('My new bio');
      expect(res.body.data.location).to.equal('New York');
    });

    it('should update preferences', async () => {
      const res = await request(app)
        .patch('/api/v1/seekers/preferences')
        .set('Authorization', `Bearer ${seekerToken}`)
        .send({
          interestedTypes: ['INTERNSHIP', 'SCHOLARSHIP'],
          weeklyDigest: false,
        });

      expect(res.status).to.equal(200);
      expect(res.body.data.interestedTypes).to.include('INTERNSHIP');
      expect(res.body.data.weeklyDigest).to.be.false;
    });

    it('should complete onboarding', async () => {
      const res = await request(app)
        .post('/api/v1/seekers/onboarding')
        .set('Authorization', `Bearer ${seekerToken}`)
        .send({
          profileData: { education: 'MIT', fieldOfStudy: 'CS' },
          preferencesData: { targetLocations: ['USA', 'UK'] },
        });

      expect(res.status).to.equal(200);
      expect(res.body.data.user.onboardingCompleted).to.be.true;
      expect(res.body.data.user.education).to.equal('MIT');
      expect(res.body.data.preferences.targetLocations).to.include('USA');
    });
  });

  describe('Publisher Profile', () => {
    it('should complete onboarding and create profile', async () => {
      const res = await request(app)
        .post('/api/v1/publishers/onboarding')
        .set('Authorization', `Bearer ${publisherToken}`)
        .send({
          userUpdate: { phoneNumber: '123456789' },
          profileData: {
            organizationName: 'Test Org',
            websiteUrl: 'https://test.org',
          },
        });

      expect(res.status).to.equal(200);
      expect(res.body.data.user.onboardingCompleted).to.be.true;
      expect(res.body.data.profile.organizationName).to.equal('Test Org');
      
      // Verify profile in DB
      const profile = await PublisherProfile.findOne({ organizationName: 'Test Org' });
      expect(profile).to.not.be.null;
    });

    it('should update publisher profile', async () => {
      const res = await request(app)
        .patch('/api/v1/publishers/profile')
        .set('Authorization', `Bearer ${publisherToken}`)
        .send({
          industry: 'Technology',
          description: 'A tech company',
        });

      expect(res.status).to.equal(200);
      expect(res.body.data.industry).to.equal('Technology');
    });
  });
});
