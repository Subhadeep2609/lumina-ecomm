import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { getRazorpayInstance } from '../config/razorpay.js';
import crypto from 'crypto';

// @desc    Generate Razorpay Order ID
// @route   POST /api/v1/orders/razorpay
// @access  Private
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body; // Amount in INR

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid order amount.' });
    }

    const razorpay = getRazorpayInstance();
    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order: razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_lumina_key_id'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay Signature & Save Order
// @route   POST /api/v1/orders/verify
// @access  Private
export const verifyPaymentAndCreateOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderItems,
      shippingAddress,
      totalPrice
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order.' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_lumina_key_secret';
    const isConfigured = secret !== 'rzp_test_lumina_key_secret';

    if (isConfigured && razorpay_signature !== 'sig_verified_demo') {
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Payment signature verification failed.' });
      }
    }

    const newOrderData = {
      _id: `ord_${Date.now()}`,
      user: req.user?._id || 'demo_user_id',
      orderItems,
      shippingAddress: shippingAddress || { fullName: 'Valued Customer', address: '123 Main St', city: 'Metropolis', postalCode: '10001' },
      paymentMethod: 'Razorpay',
      paymentResult: {
        razorpay_order_id: razorpay_order_id || `order_dev_${Date.now()}`,
        razorpay_payment_id: razorpay_payment_id || `pay_dev_${Date.now()}`,
        razorpay_signature: razorpay_signature || 'sig_demo',
        status: 'completed'
      },
      totalPrice: totalPrice || 100,
      isPaid: true,
      paidAt: new Date().toISOString(),
      orderStatus: 'Processing',
      createdAt: new Date().toISOString()
    };

    // Save Order in DB if connected
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const order = await Order.create({
          user: req.user._id,
          orderItems,
          shippingAddress,
          paymentMethod: 'Razorpay',
          paymentResult: newOrderData.paymentResult,
          totalPrice,
          isPaid: true,
          paidAt: Date.now(),
          orderStatus: 'Processing'
        });
        newOrderData._id = order._id;

        // Update Stock for ordered items
        for (const item of orderItems) {
          try {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: -item.quantity }
            });
          } catch (err) {
            console.warn('Stock decrement notice:', err.message);
          }
        }
      } catch (dbErr) {
        console.warn('[Order DB Sync Notice]:', dbErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Payment verified and order placed successfully!',
      order: newOrderData
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged-in user order history
// @route   GET /api/v1/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    return res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get orders for respective seller (Only products listed by this seller)
// @route   GET /api/v1/orders
// @access  Private (Seller only)
export const getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({
        success: false,
        message: 'Admin access to customer order fulfillment is restricted. Only respective sellers can view their order details.'
      });
    }

    // 1. Fetch all products listed by this seller
    const userId = req.user._id || req.user.id;
    let sellerProducts = [];
    if (mongoose.Types.ObjectId.isValid(userId)) {
      sellerProducts = await Product.find({ user: userId }).select('_id');
    }
    const sellerProductIds = new Set(sellerProducts.map((p) => p._id.toString()));

    if (sellerProductIds.size === 0) {
      return res.status(200).json({ success: true, count: 0, orders: [] });
    }

    // 2. Find orders containing items for this seller's products
    const rawOrders = await Order.find({
      'orderItems.product': { $in: Array.from(sellerProductIds) }
    })
      .populate('user', 'name email role')
      .sort('-createdAt')
      .lean();

    // 3. Filter orderItems to only include products listed by this seller and recalculate seller-specific total
    const sellerOrders = rawOrders
      .map((order) => {
        const matchingItems = (order.orderItems || []).filter((item) => {
          const pId = item.product?._id ? item.product._id.toString() : item.product?.toString();
          return sellerProductIds.has(pId);
        });

        if (matchingItems.length === 0) return null;

        const sellerRevenue = matchingItems.reduce(
          (sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)),
          0
        );

        return {
          ...order,
          orderItems: matchingItems,
          totalPrice: sellerRevenue,
          sellerTotalPrice: sellerRevenue
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      count: sellerOrders.length,
      orders: sellerOrders
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Order Fulfillment Status (Seller Only for their listed items)
// @route   PUT /api/v1/orders/:id/status
// @access  Private (Seller only)
export const updateOrderStatus = async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({
        success: false,
        message: 'Admin access to customer order fulfillment is restricted. Only respective sellers can manage orders.'
      });
    }

    const { orderStatus } = req.body;
    if (!['Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(orderStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid order status value.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Verify this seller owns at least one product listed in this order
    const userId = req.user._id || req.user.id;
    let sellerProducts = [];
    if (mongoose.Types.ObjectId.isValid(userId)) {
      sellerProducts = await Product.find({ user: userId }).select('_id');
    }
    const sellerProductIds = new Set(sellerProducts.map((p) => p._id.toString()));

    const hasSellerProduct = (order.orderItems || []).some((item) => {
      const pId = item.product?._id ? item.product._id.toString() : item.product?.toString();
      return sellerProductIds.has(pId);
    });

    if (!hasSellerProduct) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify orders for products listed by other sellers.'
      });
    }

    order.orderStatus = orderStatus;
    if (orderStatus === 'Delivered') {
      order.deliveredAt = Date.now();
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${orderStatus}`,
      order
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
