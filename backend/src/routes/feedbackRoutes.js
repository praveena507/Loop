import express from 'express';
import { submitComplaintFeedback, getFeedbackQualityInsights } from '../controllers/feedbackController.js';
import { authenticateStaff, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: Submit user feedback after resolution
router.post('/submit', submitComplaintFeedback);

// Admin: Get feedback and quality insights
router.get('/insights', authenticateStaff, requireAdmin, getFeedbackQualityInsights);

export default router;
