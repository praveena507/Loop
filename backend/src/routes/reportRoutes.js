import { Router } from 'express';
import { getAnalytics } from '../controllers/reportController.js';
import { authenticateStaff } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/reports', authenticateStaff, getAnalytics);
router.get('/reports/:id', authenticateStaff, getAnalytics);

export default router;
