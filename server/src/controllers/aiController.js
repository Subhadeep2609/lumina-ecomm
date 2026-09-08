import {
  chatShoppingAssistant,
  generateProductListing,
  summarizeProduct,
  semanticSearch
} from '../services/aiService.js';
import Product from '../models/Product.js';

// @desc    Shopping AI Assistant Chat
// @route   POST /api/v1/ai/chat
// @access  Public
export const handleAiChat = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message for the AI assistant.'
      });
    }

    const response = await chatShoppingAssistant({ message, history });

    return res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('[AI Chat Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process AI chat request: ' + error.message
    });
  }
};

// @desc    AI Merchant Copilot (Generate title, description, category, price)
// @route   POST /api/v1/ai/generate-product
// @access  Private (Seller, Admin)
export const handleGenerateProduct = async (req, res) => {
  try {
    const { prompt, category, brand } = req.body;

    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a product title or concept prompt for AI generation.'
      });
    }

    const generated = await generateProductListing({ prompt, category, brand });

    return res.status(200).json({
      success: true,
      product: generated
    });
  } catch (error) {
    console.error('[AI Generate Product Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate product details with AI: ' + error.message
    });
  }
};

// @desc    AI Product Summary & Buyer Take
// @route   POST /api/v1/ai/summarize-product
// @access  Public
export const handleSummarizeProduct = async (req, res) => {
  try {
    const { productId, productData } = req.body;

    let targetProduct = productData;
    if (productId && !targetProduct) {
      targetProduct = await Product.findById(productId);
      if (!targetProduct) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
    }

    if (!targetProduct) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a productId or productData for AI summary.'
      });
    }

    const summary = await summarizeProduct(targetProduct);

    return res.status(200).json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('[AI Summarize Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate AI product summary: ' + error.message
    });
  }
};

// @desc    AI Semantic Search
// @route   POST /api/v1/ai/semantic-search
// @access  Public
export const handleSemanticSearch = async (req, res) => {
  try {
    const { query } = req.body;

    const products = await semanticSearch(query);

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('[AI Semantic Search Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to perform AI semantic search: ' + error.message
    });
  }
};
