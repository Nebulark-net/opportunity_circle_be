import { Router } from 'express';
import {
  getDashboardStats,
  getMyOpportunities,
  updateProfile,
  getMyProfile,
  completeOnboarding,
  getOpportunityApplications,
  updateApplicationStatus,
} from '../controllers/publisher.controller.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const profileUpdateSchema = z.object({
  body: z.object({
    organizationName: z.string().optional(),
    organizationLogo: z.string().url().optional(),
    websiteUrl: z.string().url().optional(),
    industry: z.string().optional(),
    description: z.string().optional(),
  }),
});

router.use(verifyJWT);
router.use(authorizeRoles('PUBLISHER', 'ADMIN'));

router.route('/profile').get(getMyProfile).patch(validate(profileUpdateSchema), updateProfile);
router.route('/onboarding').post(completeOnboarding);

router.route('/dashboard/stats').get(getDashboardStats);
router.route('/opportunities').get(getMyOpportunities);
router.route('/opportunities/:opportunityId/applications').get(getOpportunityApplications);
router.route('/applications/:applicationId/status').patch(updateApplicationStatus);

export default router;
