import { Router } from 'express';
import {
  createMentor,
  getMentors,
  linkMentorToWorkshop,
} from '../controllers/mentor.controller.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const mentorSchema = z.object({
  body: z.object({
    name: z.string(),
    description: z.string().optional(),
    photoUrl: z.string().url().optional(),
    designation: z.string().optional(),
    organization: z.string().optional(),
  }),
});

const linkSchema = z.object({
  body: z.object({
    opportunityId: z.string(),
    mentorId: z.string(),
  }),
});

router.route('/').get(getMentors);

// Secured routes
router.route('/').post(verifyJWT, authorizeRoles('ADMIN', 'PUBLISHER'), validate(mentorSchema), createMentor);
router.route('/link').post(verifyJWT, authorizeRoles('ADMIN', 'PUBLISHER'), validate(linkSchema), linkMentorToWorkshop);

export default router;
