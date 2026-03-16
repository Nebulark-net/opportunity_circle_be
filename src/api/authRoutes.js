import { Router } from 'express';
import passport from 'passport';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getCurrentUser,
  oauthSuccess,
  updateUserRole,
} from '../controllers/auth.controller.js';
import { verifyJWT } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['SEEKER', 'PUBLISHER', 'ADMIN']),
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

const verifyEmailSchema = z.object({
  query: z.object({
    token: z.string(),
  }),
});

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication management
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullName
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               fullName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [SEEKER, PUBLISHER, ADMIN]
 *             example:
 *               email: john@example.com
 *               password: password123
 *               fullName: John Doe
 *               role: SEEKER
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       409:
 *         description: User already exists
 */
router.route('/register').post(validate(registerSchema), registerUser);
router.route('/login').post(validate(loginSchema), loginUser);
router.route('/forgot-password').post(validate(forgotPasswordSchema), forgotPassword);
router.route('/reset-password').post(validate(resetPasswordSchema), resetPassword);

/**
 * @swagger
 * /api/v1/auth/verify-email:
 *   get:
 *     summary: Verify user email
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The verification token sent via email
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
router.route('/verify-email').get(validate(verifyEmailSchema), verifyEmail);

// OAuth Routes
router.get('/google', (req, res, next) => {
  const { role } = req.query;
  const state = role ? Buffer.from(JSON.stringify({ role })).toString('base64') : undefined;
  
  passport.authenticate('google', { 
    scope: 'profile email', 
    state,
    prompt: 'select_account'
  })(req, res, next);
});

router.get('/github', (req, res, next) => {
  const { role } = req.query;
  const state = role ? Buffer.from(JSON.stringify({ role })).toString('base64') : undefined;
  
  passport.authenticate('github', { 
    scope: 'user:email', 
    state 
  })(req, res, next);
});

router.get('/:provider/callback', (req, res, next) => {
  const { provider } = req.params;
  passport.authenticate(provider, { session: false }, (err, user, info) => {
    if (err || !user) {
      // Handle authentication failure
      const message = info?.message || 'Authentication failed';
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(message)}`);
    }
    req.user = user;
    next();
  })(req, res, next);
}, oauthSuccess);

// Catch-all for legacy/broken callback URLs with 'undefined'
router.get('/:provider/undefined/oauth-callback', (req, res) => {
  const { provider } = req.params;
  const queryString = req.url.split('?')[1] ? `?${req.url.split('?')[1]}` : '';
  res.redirect(`/api/v1/auth/${provider}/callback${queryString}`);
});

// secured routes
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/me').get(verifyJWT, getCurrentUser);
router.route('/me/role').patch(verifyJWT, updateUserRole);

export default router;
