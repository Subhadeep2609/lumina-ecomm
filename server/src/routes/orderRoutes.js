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

// Respective Seller Order Fulfillment Management (Admin access blocked)
router.get('/', authorize('seller'), getAllOrders);
router.put('/:id/status', authorize('seller'), updateOrderStatus);

export default router;
