import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { processOAuthLogin } from '../services/auth.service.js';
import logger from '../utils/logger.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'missing-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'missing-secret',
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/v1/auth/google/callback`,
      passReqToCallback: true,
      scope: ['profile', 'email'],
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        let state = {};
        if (req.query.state) {
          try {
            state = JSON.parse(Buffer.from(req.query.state, 'base64').toString('ascii'));
          } catch (e) {
            logger.warn('Failed to parse OAuth state:', e);
          }
        }
        const result = await processOAuthLogin({
          provider: 'GOOGLE',
          providerUserId: profile.id,
          email: profile.emails[0].value,
          fullName: profile.displayName,
          profilePhotoUrl: profile.photos[0]?.value,
          role: state.role,
        });
        return done(null, result);
      } catch (error) {
        logger.error('Google OAuth Error:', error);
        return done(error, null);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || 'missing-id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'missing-secret',
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/v1/auth/github/callback`,
      passReqToCallback: true,
      scope: ['user:email'],
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        let state = {};
        if (req.query.state) {
          try {
            state = JSON.parse(Buffer.from(req.query.state, 'base64').toString('ascii'));
          } catch (e) {
            logger.warn('Failed to parse OAuth state:', e);
          }
        }
        const result = await processOAuthLogin({
          provider: 'GITHUB',
          providerUserId: profile.id,
          email: profile.emails[0].value,
          fullName: profile.displayName || profile.username,
          profilePhotoUrl: profile.photos[0]?.value,
          role: state.role,
        });
        return done(null, result);
      } catch (error) {
        logger.error('GitHub OAuth Error:', error);
        return done(error, null);
      }
    }
  )
);

export default passport;
