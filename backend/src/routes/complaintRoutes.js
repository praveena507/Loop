import { Router } from 'express';
import {
  createComplaint,
  trackComplaint,
  getStaffComplaints,
  getStaffComplaintById,
  recordComplaintAction,
  resolveComplaintAndRespond,
  createDepartmentRequest,
  submitDepartmentReport,
  reviewDepartmentReport
} from '../controllers/complaintController.js';
import { authenticateStaff } from '../middleware/authMiddleware.js';

const router = Router();

// Public Customer Routes
router.post('/complaints', createComplaint);
router.get('/complaints/track', trackComplaint);

// Department Report Submission (Department action)
router.post('/staff/department-requests/:requestId/report', authenticateStaff, submitDepartmentReport);

// Staff Protected Routes
router.get('/staff/complaints', authenticateStaff, getStaffComplaints);
router.get('/staff/complaints/:id', authenticateStaff, getStaffComplaintById);
router.post('/staff/complaints/:id/action', authenticateStaff, recordComplaintAction);
router.post('/staff/complaints/:id/department-request', authenticateStaff, createDepartmentRequest);
router.post('/staff/complaints/:id/review-department-report', authenticateStaff, reviewDepartmentReport);
router.post('/staff/complaints/:id/response', authenticateStaff, resolveComplaintAndRespond);
router.post('/staff/complaints/:id/resolve', authenticateStaff, resolveComplaintAndRespond);

export default router;
