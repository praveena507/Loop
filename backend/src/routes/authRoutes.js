import { Router } from 'express';
import {
  login,
  requestPasswordResetOTP,
  resetPasswordWithOTP,
  registerAnalyst,
  customerRequestOTP,
  customerVerifyOTP
} from '../controllers/authController.js';

const router = Router();

// Staff Authentication (Admin & Analyst)
router.post('/login', login);
router.post('/register-analyst', registerAnalyst);
router.post('/forgot-password', requestPasswordResetOTP);
router.post('/reset-password', resetPasswordWithOTP);

// Customer Authentication (User Portal)
router.post('/customer-login', customerRequestOTP);
router.post('/customer-register', customerRequestOTP);
router.post('/customer-verify', customerVerifyOTP);

export default router;

