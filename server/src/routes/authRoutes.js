import express from 'express';
import {
  register,
  verifyEmail,
  resendOtp,
  login,
  getMe,
  updateProfile,
  subscribeNewsletter,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.post('/newsletter', subscribeNewsletter);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
