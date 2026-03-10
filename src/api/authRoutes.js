import { Router } from 'express';
import passport from 'passport';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  oauthSuccess,
} from '../controllers/auth.controller.js';
import { verifyJWT } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['SEEKER', 'PUBLISHER']),
    fullName: z.string(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string(),
    password: z.string().min(6),
  }),
});

router.route('/register').post(validate(registerSchema), registerUser);
router.route('/login').post(validate(loginSchema), loginUser);
router.route('/forgot-password').post(validate(forgotPasswordSchema), forgotPassword);
router.route('/reset-password').post(validate(resetPasswordSchema), resetPassword);

// OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), oauthSuccess);

router.get('/linkedin', passport.authenticate('linkedin', { scope: ['r_emailaddress', 'r_liteprofile'] }));
router.get('/linkedin/callback', passport.authenticate('linkedin', { session: false }), oauthSuccess);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { session: false }), oauthSuccess);

// secured routes
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/refresh-token').post(refreshAccessToken);

export default router;
