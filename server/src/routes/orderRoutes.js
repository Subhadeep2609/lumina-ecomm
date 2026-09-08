import express from 'express';
import {
  createRazorpayOrder,
  verifyPaymentAndCreateOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/razorpay', createRazorpayOrder);
router.post('/verify', verifyPaymentAndCreateOrder);
router.get('/my-orders', getMyOrders);

// Admin & Seller Management
router.get('/', authorize('admin', 'seller'), getAllOrders);
router.put('/:id/status', authorize('admin', 'seller'), updateOrderStatus);

export default router;
