import { Router } from 'express';
import passport from 'passport';
import { AuthErrors } from '../utils/authErrors.js';
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

const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.enum(['SEEKER', 'PUBLISHER']),
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
 * /api/auth/register:
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
 * /api/auth/verify-email:
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
    if (err) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=${AuthErrors.PROVIDER_FAILURE}`);
    }
    if (!user) {
      // Map Passport info message to our AuthErrors
      const errorKey = info?.message || 'AUTH_CANCELED';
      const errorCode = AuthErrors[errorKey] || AuthErrors.AUTH_CANCELED;
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=${errorCode}`);
    }
    req.user = user;
    next();
  })(req, res, next);
}, oauthSuccess);

// Catch-all for legacy/broken callback URLs with 'undefined'
router.get('/:provider/undefined/oauth-callback', (req, res) => {
  const { provider } = req.params;
  const queryString = req.url.split('?')[1] ? `?${req.url.split('?')[1]}` : '';
  res.redirect(`/api/auth/${provider}/callback${queryString}`);
});

// secured routes
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/me').get(verifyJWT, getCurrentUser);
/**
 * @swagger
 * /api/auth/me/role:
 *   patch:
 *     summary: Update user role
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [SEEKER, PUBLISHER]
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Invalid role
 *       401:
 *         description: Unauthorized
 */
router.route('/me/role').patch(verifyJWT, validate(updateUserRoleSchema), updateUserRole);

export default router;
