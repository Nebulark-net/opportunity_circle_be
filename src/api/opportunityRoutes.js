import { Router } from 'express';
import {
  getAllOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  updateOpportunityStatus,
} from '../controllers/opportunity.controller.js';
import { verifyJWT, authorizeRoles, optionalJWT } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const i18nSchema = z.object({
  en: z.string(),
  fr: z.string().optional(),
});

const opportunitySchema = z.object({
  body: z.object({
    type: z.enum(['INTERNSHIP', 'SCHOLARSHIP', 'FELLOWSHIP', 'EVENT', 'WORKSHOP']),
    title: i18nSchema,
    organizationName: z.string(),
    description: i18nSchema,
    location: z.string(),
    educationLevel: z.enum(['UNDERGRADUATE', 'GRADUATE', 'PHD', 'ANY']).optional(),
    fundingType: z.enum(['FULLY_FUNDED', 'NON_FUNDED', 'PARTIALLY_FUNDED', 'N/A']).optional(),
    specificRequirements: i18nSchema.optional(),
    deadline: z.string().datetime(),
    applyUrl: z.string().url().optional(),
    imageUrl: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const updateOpportunitySchema = z.object({
  body: z.object({
    type: z.enum(['INTERNSHIP', 'SCHOLARSHIP', 'FELLOWSHIP', 'EVENT', 'WORKSHOP']).optional(),
    title: i18nSchema.optional(),
    organizationName: z.string().optional(),
    description: i18nSchema.optional(),
    location: z.string().optional(),
    educationLevel: z.enum(['UNDERGRADUATE', 'GRADUATE', 'PHD', 'ANY']).optional(),
    fundingType: z.enum(['FULLY_FUNDED', 'NON_FUNDED', 'PARTIALLY_FUNDED', 'N/A']).optional(),
    specificRequirements: i18nSchema.optional(),
    deadline: z.string().datetime().optional(),
    applyUrl: z.string().url().optional(),
    imageUrl: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
    status: z.enum(['DRAFT', 'PENDING', 'ACTIVE', 'EXPIRED', 'ARCHIVED']).optional(),
  }),
});

const statusUpdateSchema = z.object({
  body: z.object({
    status: z.enum(['DRAFT', 'PENDING', 'ACTIVE', 'EXPIRED', 'ARCHIVED']),
  }),
});

router.route('/').get(optionalJWT, getAllOpportunities);
router.route('/:id').get(optionalJWT, getOpportunityById);

// secured routes
router.route('/').post(verifyJWT, authorizeRoles('PUBLISHER', 'ADMIN'), validate(opportunitySchema), createOpportunity);
router.route('/:id').patch(verifyJWT, authorizeRoles('PUBLISHER', 'ADMIN'), validate(updateOpportunitySchema), updateOpportunity);
router.route('/:id').delete(verifyJWT, authorizeRoles('PUBLISHER', 'ADMIN'), deleteOpportunity);

// Admin only routes
router.route('/:id/status').patch(verifyJWT, authorizeRoles('ADMIN'), validate(statusUpdateSchema), updateOpportunityStatus);

export default router;
