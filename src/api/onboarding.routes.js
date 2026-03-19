import { Router } from 'express';
import { saveOnboardingStep, getOnboardingData } from '../controllers/onboarding.controller.js';
import { verifyJWT } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const onboardingSchema = z.object({
  body: z.object({
    interests: z.array(z.string()).optional(),
    preferences: z.object({
      fieldOfStudy: z.string().optional(),
      targetLocations: z.array(z.string()).optional(),
      employeeType: z.string().optional(),
    }).optional(),
    isCompleted: z.boolean().optional(),
  }),
});

// Protected routes
router.use(verifyJWT);

/**
 * @swagger
 * tags:
 *   name: Onboarding
 *   description: User onboarding management
 */

/**
 * @swagger
 * /api/v1/onboarding:
 *   post:
 *     summary: Save onboarding step data
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *               preferences:
 *                 type: object
 *                 properties:
 *                   fieldOfStudy:
 *                     type: string
 *                   targetLocations:
 *                     type: array
 *                     items:
 *                       type: string
 *                   employeeType:
 *                     type: string
 *               isCompleted:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Data saved successfully
 */
router.route('/').post(validate(onboardingSchema), saveOnboardingStep);

/**
 * @swagger
 * /api/v1/onboarding:
 *   get:
 *     summary: Get user onboarding data
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data retrieved successfully
 */
router.route('/').get(getOnboardingData);

export default router;
