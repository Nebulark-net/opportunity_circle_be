import { Router } from 'express';
import {
  getCmsPage,
  updateCmsPage,
  getAllCmsPages,
} from '../controllers/cms.controller.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const i18nSchema = z.object({
  en: z.string().optional(),
  fr: z.string().optional(),
});

const cmsUpdateSchema = z.object({
  body: z.object({
    title: i18nSchema.optional(),
    mainHeading: i18nSchema.optional(),
    heroImageUrl: z.string().url().optional(),
    metaData: z.any().optional(),
  }),
});

router.route('/').get(getAllCmsPages);
router.route('/:pageKey').get(getCmsPage);

// Secured routes (Admin only)
router.route('/:pageKey').patch(verifyJWT, authorizeRoles('ADMIN'), validate(cmsUpdateSchema), updateCmsPage);

export default router;
