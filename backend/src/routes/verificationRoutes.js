import { Router } from 'express';
import { sendVerification, verifyCode, resendCode } from '../controllers/verificationController.js';

const router = Router();

router.post('/send', sendVerification);
router.post('/verify', verifyCode);
router.post('/resend', resendCode);

export default router;
