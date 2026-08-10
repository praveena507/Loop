import { Router } from 'express';
import { getAuditLogs } from '../controllers/adminController.js';
import { authenticateStaff, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/admin/audit-logs', authenticateStaff, requireAdmin, getAuditLogs);

export default router;
