import { Router } from 'express';
import { getMyNotifications, markAsRead } from '../controllers/notification.controller.js';
import { verifyJWT } from '../middleware/auth.js';

const router = Router();

router.use(verifyJWT);

router.route('/').get(getMyNotifications);
router.route('/:id/read').patch(markAsRead);

export default router;
