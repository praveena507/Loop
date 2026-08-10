import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser, getSettings, getAuditLogs } from '../controllers/adminController.js';
import { authenticateStaff, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all admin endpoints with authenticateStaff and requireAdmin
router.use(authenticateStaff, requireAdmin);

router.get('/users', getUsers);
router.post('/users', createUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/settings', getSettings);
router.get('/audit-logs', getAuditLogs);

export default router;
