import { Router } from 'express';
import {
  getDashboardStats,
  getMyOpportunities,
  updateProfile,
  getMyProfile,
  completeOnboarding,
  getOpportunityApplications,
  updateApplicationStatus,
  getAllApplicants,
  uploadOpportunityImage,
} from '../controllers/publisher.controller.js';
import {
  createOpportunity,
  updateOpportunity,
  deleteOpportunity
} from '../controllers/opportunity.controller.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { upload } from '../middleware/multer.js';
import { z } from 'zod';

const router = Router();

const profileUpdateSchema = z.object({
  body: z.object({
    // Publisher org fields
    organizationName: z.string().optional(),
    organizationLogo: z.string().url().optional(),
    websiteUrl: z.string().url().optional().or(z.literal('')).or(z.undefined()),
    industry: z.string().optional(),
    description: z.string().optional(),
    // Generic user fields publishers can also update
    fullName: z.string().optional(),
    phoneNumber: z.string().optional(),
    country: z.string().optional(),
    location: z.string().optional(),
  }),
});

router.use(verifyJWT);
router.use(authorizeRoles('PUBLISHER', 'ADMIN'));

router.route('/profile').get(getMyProfile).patch(upload.single('profilePhoto'), validate(profileUpdateSchema), updateProfile);
router.route('/onboarding').post(completeOnboarding);

router.route('/upload-image').post(upload.single('image'), uploadOpportunityImage);

router.route('/dashboard/stats').get(getDashboardStats);
router.route('/opportunities').get(getMyOpportunities).post(createOpportunity);
router.route('/opportunities/:id').patch(updateOpportunity).delete(deleteOpportunity);
router.route('/applicants').get(getAllApplicants);
router.route('/opportunities/:opportunityId/applications').get(getOpportunityApplications);
router.route('/applications/:applicationId/status').patch(updateApplicationStatus);

export default router;
