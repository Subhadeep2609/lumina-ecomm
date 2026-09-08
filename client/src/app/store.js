import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import productReducer from '../features/products/productSlice.js';
import uiReducer from '../features/ui/uiSlice.js';
import orderReducer from '../features/orders/orderSlice.js';
import wishlistReducer from '../features/wishlist/wishlistSlice.js';
import aiReducer from '../features/ai/aiSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    ui: uiReducer,
    orders: orderReducer,
    wishlist: wishlistReducer,
    ai: aiReducer
  }
});
