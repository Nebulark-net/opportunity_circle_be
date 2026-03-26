import { Router } from 'express';
import { getMyNotifications, markAsRead, markAllAsRead } from '../controllers/notification.controller.js';
import { verifyJWT } from '../middleware/auth.js';

const router = Router();

router.use(verifyJWT);

router.route('/').get(getMyNotifications);
router.route('/mark-all-read').patch(markAllAsRead);
router.route('/:id/read').patch(markAsRead);

export default router;
