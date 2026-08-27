import express from 'express';
import { getDepartments, createOrUpdateDepartment, getDepartmentQueue } from '../controllers/departmentController.js';
import { authenticateStaff, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / Staff: Get list of active departments
router.get('/', getDepartments);

// Admin: Manage departments
router.post('/manage', authenticateStaff, requireAdmin, createOrUpdateDepartment);

// Department Case Queue
router.get('/queue', authenticateStaff, getDepartmentQueue);

export default router;
