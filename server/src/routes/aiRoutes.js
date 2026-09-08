import express from 'express';
import {
  handleAiChat,
  handleGenerateProduct,
  handleSummarizeProduct,
  handleSemanticSearch
} from '../controllers/aiController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public AI Shopping Assistant Chat
router.post('/chat', handleAiChat);

// Public AI Semantic Product Search
router.post('/semantic-search', handleSemanticSearch);

// Public Product Quick Insights / Summary
router.post('/summarize-product', handleSummarizeProduct);

// Seller & Admin AI Product Copilot
router.post('/generate-product', protect, authorize('seller', 'admin'), handleGenerateProduct);

export default router;
