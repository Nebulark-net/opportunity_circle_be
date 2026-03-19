import { Router } from 'express';
import {
  submitApplication,
  getMyApplications,
  getOpportunityApplications,
  updateApplicationStatus,
} from '../controllers/application.controller.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const applicationSchema = z.object({
  body: z.object({
    opportunityId: z.string(),
    notes: z.string().optional(),
  }),
});

const statusUpdateSchema = z.object({
  body: z.object({
    status: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'WITHDRAWN']),
    notes: z.string().optional(),
  }),
});

// Seeker routes
router.route('/').post(verifyJWT, authorizeRoles('SEEKER', 'ADMIN'), validate(applicationSchema), submitApplication);
router.route('/my').get(verifyJWT, authorizeRoles('SEEKER', 'ADMIN'), getMyApplications);

// Publisher/Admin routes
router.route('/opportunity/:opportunityId').get(verifyJWT, authorizeRoles('PUBLISHER', 'ADMIN'), getOpportunityApplications);
router.route('/:id/status').patch(verifyJWT, authorizeRoles('PUBLISHER', 'ADMIN'), validate(statusUpdateSchema), updateApplicationStatus);

export default router;
