import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser, getSettings, getAuditLogs, assignComplaint, resendAnalystCredentials } from '../controllers/adminController.js';
import { authenticateStaff, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all admin endpoints with authenticateStaff and requireAdmin
router.use(authenticateStaff, requireAdmin);

router.get('/users', getUsers);
router.post('/users', createUser);
router.patch('/users/:id', updateUser);
router.post('/users/:id/resend-credentials', resendAnalystCredentials);
router.delete('/users/:id', deleteUser);
router.post('/complaints/:id/assign', assignComplaint);
router.get('/settings', getSettings);
router.get('/audit-logs', getAuditLogs);
router.post('/seed', async (req, res) => {
  try {
    const { seed135Complaints } = await import('../scripts/seed135Complaints.js');
    await seed135Complaints();
    res.json({ success: true, message: '135 Enterprise complaints and 11 analysts seeded successfully.' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;

