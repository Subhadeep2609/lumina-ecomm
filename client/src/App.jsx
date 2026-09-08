import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './features/auth/authSlice.js';
import Navbar from './components/Navbar.jsx';
import MobileBottomNav from './components/MobileBottomNav.jsx';
import Footer from './components/Footer.jsx';
import Toast from './components/Toast.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import HomePage from './pages/HomePage.jsx';
import ProductList from './features/products/ProductList.jsx';
import CartPage from './pages/CartPage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AdminDashboard from './features/admin/AdminDashboard.jsx';
import OrderHistory from './features/orders/OrderHistory.jsx';
import SellerOrdersPage from './pages/SellerOrdersPage.jsx';

// Modals
import Login from './features/auth/Login.jsx';
import Register from './features/auth/Register.jsx';
import VerifyEmail from './features/auth/VerifyEmail.jsx';
import ProductDetailModal from './features/products/ProductDetailModal.jsx';
import ProductFormModal from './features/products/ProductFormModal.jsx';
import CartDrawer from './features/orders/CartDrawer.jsx';
import LuminaAIAssistant from './features/ai/LuminaAIAssistant.jsx';

const App = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(loadUser());
    }
  }, [dispatch, token]);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen flex flex-col bg-[#F7F8FC] text-gray-900 font-body pb-14 md:pb-0">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Buyer Only Route */}
            <Route
              path="/orders"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <OrderHistory />
                </ProtectedRoute>
              }
            />

            {/* Seller & Admin Order Fulfillment Route */}
            <Route
              path="/seller/orders"
              element={
                <ProtectedRoute allowedRoles={['seller', 'admin']}>
                  <SellerOrdersPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Only Dashboard Route */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        <Footer />
        <MobileBottomNav />

        {/* Global Notifications & Modals */}
        <Toast />
        <Login />
        <Register />
        <VerifyEmail />
        <ProductDetailModal />
        <ProductFormModal />
        <CartDrawer />
        <LuminaAIAssistant />
      </div>
    </Router>
  );
};

export default App;
