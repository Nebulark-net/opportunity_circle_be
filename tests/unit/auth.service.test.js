import { expect } from 'chai';
import { processOAuthLogin } from '../../src/services/auth.service.js';
import { User } from '../../src/models/User.js';
import { OAuthAccount } from '../../src/models/OAuthAccount.js';
import { UserPreference } from '../../src/models/UserPreference.js';
import mongoose from 'mongoose';

describe('Auth Service - processOAuthLogin', () => {
  const oauthData = {
    provider: 'GOOGLE',
    providerUserId: 'google123',
    email: 'test@example.com',
    fullName: 'Test User',
    profilePhotoUrl: 'http://example.com/photo.jpg',
  };

  it('should create a new user with a specified role', async () => {
    const dataWithRole = { ...oauthData, role: 'PUBLISHER' };
    const result = await processOAuthLogin(dataWithRole);

    expect(result.user.email).to.equal(oauthData.email);
    expect(result.user.role).to.equal('PUBLISHER');
    expect(result.pendingRole).to.be.false;

    const userInDb = await User.findOne({ email: oauthData.email });
    expect(userInDb.role).to.equal('PUBLISHER');

    const oauthAccount = await OAuthAccount.findOne({ userId: userInDb._id });
    expect(oauthAccount.provider).to.equal('GOOGLE');
  });

  it('should create a new user with default role and pendingRole flag if no role is provided', async () => {
    const result = await processOAuthLogin(oauthData);

    expect(result.user.role).to.equal('SEEKER'); // Default role
    expect(result.pendingRole).to.be.true;

    const userInDb = await User.findOne({ email: oauthData.email });
    expect(userInDb.role).to.equal('SEEKER');
  });

  it('should initialize preferences if the new user is a SEEKER', async () => {
    const result = await processOAuthLogin({ ...oauthData, role: 'SEEKER' });
    
    const preference = await UserPreference.findOne({ userId: result.user._id });
    expect(preference).to.exist;
  });

  it('should link to an existing user if the email matches', async () => {
    // Create existing user with password
    const existingUser = await User.create({
      email: oauthData.email,
      fullName: 'Existing User',
      password: 'password123',
      role: 'PUBLISHER',
    });

    const result = await processOAuthLogin(oauthData);

    expect(result.user._id.toString()).to.equal(existingUser._id.toString());
    expect(result.user.role).to.equal('PUBLISHER'); // Should keep existing role
    
    const oauthAccount = await OAuthAccount.findOne({ userId: existingUser._id });
    expect(oauthAccount).to.exist;
  });

  it('should log in an existing OAuth user', async () => {
    // Setup existing OAuth user
    const user = await User.create({
      email: oauthData.email,
      fullName: oauthData.fullName,
      role: 'PUBLISHER',
      isOAuthUser: true,
    });

    await OAuthAccount.create({
      userId: user._id,
      provider: 'GOOGLE',
      providerUserId: oauthData.providerUserId,
    });

    const result = await processOAuthLogin(oauthData);

    expect(result.user._id.toString()).to.equal(user._id.toString());
    expect(result.pendingRole).to.be.false;
  });
});
