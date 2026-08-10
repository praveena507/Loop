import { Router } from 'express';
import { login, requestPasswordResetOTP, resetPasswordWithOTP } from '../controllers/authController.js';

const router = Router();

router.post('/login', login);
router.post('/forgot-password', requestPasswordResetOTP);
router.post('/reset-password', resetPasswordWithOTP);

export default router;
