import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats/summary', protect, authorize('admin', 'seller'), getProductStats);

router
  .route('/')
  .get(getProducts)
  .post(protect, authorize('seller', 'admin'), createProduct);

router
  .route('/:id')
  .get(getProductById)
  .put(protect, authorize('seller', 'admin'), updateProduct)
  .delete(protect, authorize('seller', 'admin'), deleteProduct);

export default router;
