import { Router } from 'express';
import { getNotifications, markAsRead } from '../controllers/notificationController.js';
import { authenticateStaff } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/notifications', authenticateStaff, getNotifications);
router.patch('/notifications/:id/read', authenticateStaff, markAsRead);

export default router;
