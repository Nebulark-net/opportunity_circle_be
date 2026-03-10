import { Router } from 'express';
import {
  createResource,
  getAllResources,
  getResourceById,
  updateResource,
  deleteResource,
} from '../controllers/resource.controller.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const i18nSchema = z.object({
  en: z.string(),
  fr: z.string().optional(),
});

const resourceSchema = z.object({
  body: z.object({
    title: i18nSchema,
    type: z.enum(['INTERVIEW_PREP', 'RESUME_TEMPLATE', 'CAREER_GUIDE', 'SKILL_WORKSHOP', 'ARTICLE', 'VIDEO']),
    description: i18nSchema.optional(),
    contentUrl: z.string().url().optional(),
    thumbnailUrl: z.string().url().optional(),
    isDownloadable: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const updateResourceSchema = z.object({
  body: z.object({
    title: i18nSchema.optional(),
    type: z.enum(['INTERVIEW_PREP', 'RESUME_TEMPLATE', 'CAREER_GUIDE', 'SKILL_WORKSHOP', 'ARTICLE', 'VIDEO']).optional(),
    description: i18nSchema.optional(),
    contentUrl: z.string().url().optional(),
    thumbnailUrl: z.string().url().optional(),
    isDownloadable: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

router.route('/').get(getAllResources);
router.route('/:id').get(getResourceById);

// Secured routes
router.route('/').post(verifyJWT, authorizeRoles('PUBLISHER', 'ADMIN'), validate(resourceSchema), createResource);
router.route('/:id').patch(verifyJWT, authorizeRoles('PUBLISHER', 'ADMIN'), validate(updateResourceSchema), updateResource);
router.route('/:id').delete(verifyJWT, authorizeRoles('PUBLISHER', 'ADMIN'), deleteResource);

export default router;
