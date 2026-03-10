import { expect } from 'chai';
import request from 'supertest';
import { app } from '../../src/app.js';
import { User } from '../../src/models/User.js';
import { UserPreference } from '../../src/models/UserPreference.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.test' });

describe('Authentication Integration Tests', function () {
  this.timeout(10000);

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/opportunity-circle-test');
    }
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await UserPreference.deleteMany({});
  });

  after(async () => {
    await mongoose.connection.close();
  });

  it('should register a new seeker successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'seeker@test.com',
        password: 'password123',
        role: 'SEEKER',
        fullName: 'Seeker Test',
      });

    expect(res.status).to.equal(201);
    expect(res.body.data.email).to.equal('seeker@test.com');
    expect(res.body.data.role).to.equal('SEEKER');
    expect(res.body.data).to.not.have.property('password');

    // Verify preferences were created
    const preferences = await UserPreference.findOne({ userId: res.body.data._id });
    expect(preferences).to.not.be.null;
  });

  it('should login a registered user', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@test.com',
        password: 'password123',
        role: 'SEEKER',
        fullName: 'Test User',
      });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@test.com',
        password: 'password123',
      });

    expect(res.status).to.equal(200);
    expect(res.body.data).to.have.property('accessToken');
    expect(res.body.data).to.have.property('refreshToken');
    expect(res.body.data.user.email).to.equal('test@test.com');
  });

  it('should fail login with incorrect password', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@test.com',
        password: 'password123',
        role: 'SEEKER',
        fullName: 'Test User',
      });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@test.com',
        password: 'wrongpassword',
      });

    expect(res.status).to.equal(401);
  });

  it('should logout a user', async () => {
    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'logout@test.com',
        password: 'password123',
        role: 'SEEKER',
        fullName: 'Logout User',
      });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'logout@test.com',
        password: 'password123',
      });

    const accessToken = loginRes.body.data.accessToken;

    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect(res.status).to.equal(200);
    
    // Verify refresh token is cleared in DB
    const user = await User.findOne({ email: 'logout@test.com' });
    expect(user.refreshToken).to.be.undefined;
  });

  it('should refresh access token', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'refresh@test.com',
        password: 'password123',
        role: 'SEEKER',
        fullName: 'Refresh User',
      });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'refresh@test.com',
        password: 'password123',
      });

    const refreshToken = loginRes.body.data.refreshToken;

    const res = await request(app)
      .post('/api/v1/auth/refresh-token')
      .send({ refreshToken });

    expect(res.status).to.equal(200);
    expect(res.body.data).to.have.property('accessToken');
    expect(res.body.data).to.have.property('refreshToken');
  });
});
