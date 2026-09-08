import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiCall } from '../../utils/api.js';
import { showToast, closeModal } from '../ui/uiSlice.js';

const savedCart = localStorage.getItem('lumina_cart') ? JSON.parse(localStorage.getItem('lumina_cart')) : [];

export const checkoutRazorpayOrder = createAsyncThunk(
  'orders/checkoutRazorpay',
  async ({ shippingAddress }, { getState, dispatch, rejectWithValue }) => {
    try {
      const { orders } = getState();
      const { cartItems } = orders;

      if (cartItems.length === 0) {
        dispatch(showToast({ message: 'Shopping cart is empty.', type: 'error' }));
        return rejectWithValue('Cart empty');
      }

      const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

      // 1. Get Razorpay Order ID from backend
      const rzpData = await apiCall('/orders/razorpay', {
        method: 'POST',
        body: JSON.stringify({ amount: totalAmount })
      });

      const orderPayload = {
        razorpay_order_id: rzpData.order.id,
        razorpay_payment_id: `pay_${Date.now()}`,
        razorpay_signature: 'sig_verified_demo',
        orderItems: cartItems.map(item => ({
          product: item._id || item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image || item.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'
        })),
        shippingAddress,
        totalPrice: totalAmount
      };

      // 2. Verify Payment & Create Order in Database
      const data = await apiCall('/orders/verify', {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      });

      dispatch(showToast({ message: 'Razorpay Payment Verified! Order Placed.', type: 'success' }));
      dispatch(clearCart());
      dispatch(closeModal());
      return data.order;
    } catch (err) {
      dispatch(showToast({ message: 'Checkout Error: ' + err.message, type: 'error' }));
      return rejectWithValue(err.message);
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMyOrders',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const data = await apiCall('/orders/my-orders');
      return data.orders;
    } catch (err) {
      dispatch(showToast({ message: err.message, type: 'error' }));
      return rejectWithValue(err.message);
    }
  }
);

export const fetchAllOrdersAdmin = createAsyncThunk(
  'orders/fetchAllOrdersAdmin',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const data = await apiCall('/orders');
      return data.orders;
    } catch (err) {
      dispatch(showToast({ message: err.message, type: 'error' }));
      return rejectWithValue(err.message);
    }
  }
);

export const updateOrderStatusAdmin = createAsyncThunk(
  'orders/updateOrderStatusAdmin',
  async ({ orderId, orderStatus }, { dispatch, rejectWithValue }) => {
    try {
      const data = await apiCall(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ orderStatus })
      });
      dispatch(showToast({ message: `Order updated to ${orderStatus}`, type: 'success' }));
      dispatch(fetchAllOrdersAdmin());
      return data.order;
    } catch (err) {
      dispatch(showToast({ message: err.message, type: 'error' }));
      return rejectWithValue(err.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    cartItems: savedCart,
    myOrders: [],
    allOrders: [],
    loading: false,
    error: null
  },
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const addQty = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1;
      const maxStock = typeof item.stock === 'number' ? item.stock : Infinity;
      const existItem = state.cartItems.find(x => (x._id || x.id) === (item._id || item.id));

      if (existItem) {
        existItem.quantity = Math.min(maxStock, existItem.quantity + addQty);
      } else {
        state.cartItems.push({
          ...item,
          quantity: Math.min(maxStock, addQty),
          image: item.images?.[0]?.url || item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'
        });
      }
      localStorage.setItem('lumina_cart', JSON.stringify(state.cartItems));
    },
    removeFromCart: (state, action) => {
      const id = action.payload;
      state.cartItems = state.cartItems.filter(x => (x._id || x.id) !== id);
      localStorage.setItem('lumina_cart', JSON.stringify(state.cartItems));
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cartItems.find(x => (x._id || x.id) === id);
      if (item && quantity > 0) {
        const maxStock = typeof item.stock === 'number' ? item.stock : Infinity;
        item.quantity = Math.min(maxStock, quantity);
      }
      localStorage.setItem('lumina_cart', JSON.stringify(state.cartItems));
    },
    clearCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem('lumina_cart');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkoutRazorpayOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkoutRazorpayOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(checkoutRazorpayOrder.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.myOrders = action.payload;
      })
      .addCase(fetchAllOrdersAdmin.fulfilled, (state, action) => {
        state.allOrders = action.payload;
      });
  }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = orderSlice.actions;
export default orderSlice.reducer;
