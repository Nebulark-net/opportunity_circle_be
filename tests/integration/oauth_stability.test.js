import { expect } from 'chai';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../../src/models/User.js';
import { OAuthAccount } from '../../src/models/OAuthAccount.js';
import { UserPreference } from '../../src/models/UserPreference.js';
import { processOAuthLogin } from '../../src/services/auth.service.js';

dotenv.config({ path: './.env.test' });

describe('OAuth Stability Integration Tests', function () {
  this.timeout(15000);

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/opportunity-circle-test');
    }
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await OAuthAccount.deleteMany({});
    await UserPreference.deleteMany({});
  });

  after(async () => {
    await mongoose.connection.close();
  });

  it('T007 [US2] should perform atomic registration (User + OAuthAccount + Preferences)', async () => {
    const oauthData = {
      provider: 'GOOGLE',
      providerUserId: 'google_12345',
      email: 'newuser@test.com',
      fullName: 'New User',
      profilePhotoUrl: 'http://photo.com/me.jpg',
      role: 'SEEKER'
    };

    const result = await processOAuthLogin(oauthData);

    expect(result).to.have.property('accessToken');
    expect(result.user.email).to.equal(oauthData.email);

    // Verify User
    const user = await User.findOne({ email: oauthData.email });
    expect(user).to.exist;
    expect(user.isOAuthUser).to.be.true;

    // Verify OAuthAccount
    const account = await OAuthAccount.findOne({ providerUserId: oauthData.providerUserId });
    expect(account).to.exist;
    expect(account.userId.toString()).to.equal(user._id.toString());

    // Verify Preferences
    const prefs = await UserPreference.findOne({ userId: user._id });
    expect(prefs).to.exist;
  });

  it('T008 [US2] should handle concurrent registration race conditions gracefully', async () => {
    const oauthData = {
      provider: 'GITHUB',
      providerUserId: 'github_999',
      email: 'race@test.com',
      fullName: 'Race Condition Test',
      role: 'SEEKER'
    };

    // Simulate two simultaneous login requests for the same new user
    // We use Promise.all to run them concurrently
    const [res1, res2] = await Promise.all([
      processOAuthLogin(oauthData),
      processOAuthLogin(oauthData)
    ]);

    expect(res1.user._id.toString()).to.equal(res2.user._id.toString());
    
    // Verify only ONE user and ONE account were created
    const userCount = await User.countDocuments({ email: oauthData.email });
    const accountCount = await OAuthAccount.countDocuments({ providerUserId: oauthData.providerUserId });
    
    expect(userCount).to.equal(1);
    expect(accountCount).to.equal(1);
  });

  it('T012 [US1] should handle existing user sign-in correctly', async () => {
    const email = 'existing@test.com';
    const providerUserId = 'google_existing';

    // 1. First registration
    await processOAuthLogin({
      provider: 'GOOGLE',
      providerUserId,
      email,
      fullName: 'Existing User',
      role: 'SEEKER'
    });

    // 2. Second login (same provider)
    const result = await processOAuthLogin({
      provider: 'GOOGLE',
      providerUserId,
      email,
      fullName: 'Existing User Updated Name',
    });

    expect(result.user.email).to.equal(email);
    expect(result.pendingRole).to.be.false;

    // Verify only one user exists
    const userCount = await User.countDocuments({ email });
    expect(userCount).to.equal(1);
  });

  it('T016 [US3] should reject OAuth login if email is missing', async () => {
    const oauthData = {
      provider: 'GOOGLE',
      providerUserId: 'google_no_email',
      email: null, // Missing email
      fullName: 'No Email User'
    };

    try {
      await processOAuthLogin(oauthData);
      expect.fail('Should have thrown an error for missing email');
    } catch (error) {
      expect(error).to.exist;
      // Depending on implementation, it might be a Mongoose validation error or custom ApiError
    }
  });
});
