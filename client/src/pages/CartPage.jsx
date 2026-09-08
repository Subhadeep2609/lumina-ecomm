import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, updateQuantity, checkoutRazorpayOrder } from '../features/orders/orderSlice.js';
import { toggleWishlist } from '../features/wishlist/wishlistSlice.js';
import { openModal } from '../features/ui/uiSlice.js';
import { deleteProduct, fetchProducts } from '../features/products/productSlice.js';
import { ShoppingBag, Trash2, Plus, Minus, CreditCard, MapPin, ArrowRight, ShieldCheck, Tag, Heart, CheckCircle2, Truck, Sparkles, Store, Edit3, PlusCircle, Package, Eye } from 'lucide-react';
import RazorpayPaymentModal from '../features/orders/RazorpayPaymentModal.jsx';
import OrderSuccessModal from '../features/orders/OrderSuccessModal.jsx';
import { Link } from 'react-router-dom';

const CartPage = () => {
  const dispatch = useDispatch();
  const { cartItems, loading } = useSelector((state) => state.orders);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { products } = useSelector((state) => state.products);

  const [completedOrder, setCompletedOrder] = useState(null);

  useEffect(() => {
    if (user?.role === 'seller' || user?.role === 'admin') {
      dispatch(fetchProducts());
    }
  }, [dispatch, user]);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: 'Alex Vance',
    address: '742 Evergreen Terrace',
    city: 'Springfield',
    postalCode: '10001',
    phone: '+1 (555) 019-2834'
  });

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const isSeller = isAuthenticated && user?.role === 'seller';
  const sellerProducts = isSeller
    ? products.filter((p) => !p.user || p.user === user.id || p.user?._id === user.id || p.user?.email === user.email)
    : [];

  const subtotalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const freeShippingThreshold = 50;
  const progressPercent = Math.min(100, (subtotalAmount / freeShippingThreshold) * 100);

  let discountRate = 0;
  if (appliedCoupon === 'LUMINA15') discountRate = 0.15;
  if (appliedCoupon === 'SAVE10') discountRate = 0.10;

  const discountAmount = subtotalAmount * discountRate;
  const totalAmount = Math.max(0, subtotalAmount - discountAmount);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (code === 'LUMINA15' || code === 'SAVE10') {
      setAppliedCoupon(code);
      setCouponError('');
    } else {
      setCouponError('Invalid code. Try "LUMINA15" or "SAVE10"');
    }
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      dispatch(openModal({ modal: 'LOGIN' }));
      return;
    }
    dispatch(openModal({ modal: 'RAZORPAY_PAYMENT' }));
  };

  // If user is NOT authenticated, show Sign In Guard!
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-6 font-body">
        <div className="p-8 bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-200/60">
            <ShoppingBag size={32} />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-black font-heading text-slate-900">Sign In to View Your Cart</h2>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Cart and purchasing capabilities are reserved exclusively for signed-in Buyer accounts. Please sign in or create an account to start shopping!
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => dispatch(openModal({ modal: 'LOGIN' }))}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold rounded-2xl text-xs transition shadow-md active:scale-95"
            >
              Sign In to Continue
            </button>
            <Link
              to="/products"
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-2xl text-xs transition"
            >
              Explore Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If user is an Admin, show Admin Console Guard!
  if (user?.role === 'admin') {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-6 font-body">
        <div className="p-8 bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200/60">
            <ShieldCheck size={32} />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-black font-heading text-slate-900">Cart & Purchasing Disabled for Admins</h2>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Administrator accounts manage platform users, inventory catalog, and global customer orders. Access the Admin Control Dashboard below!
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              to="/admin"
              className="px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-extrabold rounded-2xl text-xs transition shadow-md active:scale-95"
            >
              Open Admin Control Dashboard
            </Link>
            <Link
              to="/products"
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-2xl text-xs transition"
            >
              View Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If user is a Seller, show Listed Products Manager!
  if (isSeller) {
    const totalUnits = sellerProducts.reduce((acc, p) => acc + (p.stock || 0), 0);
    const totalInventoryValue = sellerProducts.reduce((acc, p) => acc + (Number(p.price) * (p.stock || 0)), 0);

    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-20 pt-4 px-4 font-body">
        {/* Seller Console Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/60 shadow-2xs">
              <Store size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black font-heading text-slate-900 tracking-tight">
                Seller Console — Products Listed by Me
              </h1>
              <p className="text-xs md:text-sm text-slate-500 font-medium">
                Manage your active store inventory, update prices, and list new products
              </p>
            </div>
          </div>

          <button
            onClick={() => dispatch(openModal({ modal: 'PRODUCT_FORM' }))}
            className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition active:scale-95 shrink-0"
          >
            <PlusCircle size={16} /> List New Product
          </button>
        </div>

        {/* Inventory Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
              <Package size={22} />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-extrabold uppercase block">Active Listings</span>
              <h3 className="text-2xl font-black text-slate-900 font-heading">{sellerProducts.length} Products</h3>
            </div>
          </div>

          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-extrabold uppercase block">Stock Units Available</span>
              <h3 className="text-2xl font-black text-emerald-600 font-heading">{totalUnits} Units</h3>
            </div>
          </div>

          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
              <Store size={22} />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-extrabold uppercase block">Total Inventory Value</span>
              <h3 className="text-2xl font-black text-slate-900 font-heading">${totalInventoryValue.toFixed(2)}</h3>
            </div>
          </div>
        </div>

        {/* Products Grid / Table */}
        {sellerProducts.length === 0 ? (
          <div className="py-16 text-center bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-2xs">
            <div className="w-20 h-20 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center mx-auto text-purple-500">
              <Store size={40} />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-xl font-extrabold text-slate-900 font-heading">You haven't listed any products yet</h3>
              <p className="text-xs text-slate-500 font-medium">
                Start selling on LuminaMarket today! You can list multiple products across tech, fashion, audio, and gadgets.
              </p>
            </div>
            <button
              onClick={() => dispatch(openModal({ modal: 'PRODUCT_FORM' }))}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-extrabold rounded-2xl text-xs hover:from-indigo-700 hover:to-indigo-800 transition shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              <PlusCircle size={16} /> List Your First Product
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold font-heading text-slate-900">Your Product Inventory</h3>
              <button
                onClick={() => dispatch(openModal({ modal: 'PRODUCT_FORM' }))}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                + Add Another Product
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sellerProducts.map((p) => {
                const id = p._id || p.id;
                const mainImage = (p.images && p.images.length > 0) ? p.images[0].url : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
                return (
                  <div key={id} className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between space-y-3.5 shadow-2xs hover:border-indigo-500/40 transition">
                    <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                      <img src={mainImage} alt={p.title} className="w-full h-full object-cover" />
                      <span className="absolute top-2.5 left-2.5 px-2 py-1 rounded-lg text-[10px] font-black uppercase bg-indigo-600 text-white">
                        {p.category}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase text-indigo-600 font-heading">{p.brand || 'Lumina Genuine'}</span>
                      <h4 className="font-extrabold text-sm text-slate-900 truncate font-heading">{p.title}</h4>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-lg font-black text-slate-900 font-heading">${Number(p.price).toFixed(2)}</span>
                        <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${p.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {p.stock > 0 ? `${p.stock} In Stock` : 'Out of Stock'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => dispatch(openModal({ modal: 'PRODUCT_FORM', product: p }))}
                        className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 transition"
                      >
                        <Edit3 size={14} /> Edit Listing
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Remove "${p.title}" from store?`)) {
                            dispatch(deleteProduct(id));
                          }
                        }}
                        className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-xs rounded-xl flex items-center justify-center transition"
                        title="Delete Product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 pt-4 px-4 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200/60 shadow-2xs">
            <ShoppingBag size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black font-heading text-slate-900 tracking-tight">Shopping Bag & Checkout</h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium">Review your items, apply promo codes, and complete your order</p>
          </div>
        </div>

        {cartItems.length > 0 && (
          <Link to="/products" className="text-xs font-extrabold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            Continue Shopping <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="py-20 text-center bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-2xs">
          <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center mx-auto text-slate-400">
            <ShoppingBag size={40} />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-xl font-extrabold text-slate-900 font-heading">Your shopping bag is empty</h3>
            <p className="text-xs text-slate-500 font-medium">
              Explore our marketplace catalog for flagship phones, audio gear, and exclusive deals.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-extrabold rounded-2xl text-xs hover:from-indigo-700 hover:to-indigo-800 transition shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            Explore Products Catalog <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-5">
            {/* Free Shipping Progress Indicator Bar */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white space-y-2 shadow-md">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5 text-slate-200">
                  <Truck size={16} className="text-emerald-400" />
                  {subtotalAmount >= freeShippingThreshold ? (
                    <span className="text-emerald-400 font-extrabold">🎉 You unlocked FREE Express Delivery!</span>
                  ) : (
                    <span>Add ${(freeShippingThreshold - subtotalAmount).toFixed(2)} more for <strong>FREE Delivery</strong></span>
                  )}
                </span>
                <span className="font-mono text-[11px] text-slate-400">${subtotalAmount.toFixed(2)} / ${freeShippingThreshold}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold font-heading text-slate-900">Bag Items ({cartItems.length})</h3>
            </div>

            <div className="space-y-3.5">
              {cartItems.map((item) => {
                const id = item._id || item.id;
                return (
                  <div key={id} className="p-4.5 bg-white border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs hover:border-indigo-500/30 transition">
                    <div className="flex items-center gap-4">
                      <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded-xl bg-slate-50 border border-slate-200 shrink-0" />
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">{item.brand || 'Lumina Genuine'}</span>
                        <h4 className="font-extrabold text-sm text-slate-900 font-heading max-w-xs truncate">{item.title}</h4>
                        <span className="text-base font-black text-slate-900 font-heading block">${Number(item.price).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Quantity Toggles */}
                      <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button
                          className="p-1.5 text-slate-600 hover:bg-white rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          onClick={() => dispatch(updateQuantity({ id, quantity: Math.max(1, item.quantity - 1) }))}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-xs font-black w-8 text-center text-slate-900">{item.quantity}</span>
                        <button
                          className="p-1.5 text-slate-600 hover:bg-white rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          onClick={() => dispatch(updateQuantity({ id, quantity: item.quantity + 1 }))}
                          disabled={typeof item.stock === 'number' && item.quantity >= item.stock}
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          dispatch(toggleWishlist(item));
                          dispatch(removeFromCart(id));
                        }}
                        className="p-2 text-slate-400 hover:text-rose-500 transition"
                        title="Save to Wishlist"
                      >
                        <Heart size={18} />
                      </button>

                      <button
                        onClick={() => dispatch(removeFromCart(id))}
                        className="p-2 text-slate-400 hover:text-rose-600 transition"
                        title="Remove Item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sticky Order Summary Panel */}
          <div className="lg:col-span-1">
            <div className="p-6 bg-white border border-slate-200/90 rounded-3xl space-y-6 sticky top-24 shadow-sm">
              <h3 className="text-lg font-black font-heading text-slate-900 border-b border-slate-100 pb-3">Order Summary</h3>

              {/* Promo Code Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                  <Tag size={14} className="text-indigo-600" /> Apply Coupon Code
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter LUMINA15"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs outline-none font-bold uppercase"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                  />
                  <button type="submit" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition">
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 pt-1">
                    <CheckCircle2 size={13} /> Code {appliedCoupon} applied ({discountRate * 100}% OFF)
                  </p>
                )}
                {couponError && <p className="text-[11px] font-bold text-rose-500 pt-1">{couponError}</p>}
              </form>

              <form onSubmit={handleCheckout} className="space-y-4">
                <div className="space-y-2.5 text-xs">
                  <span className="font-extrabold text-slate-800 flex items-center gap-1">
                    <MapPin size={14} className="text-indigo-600" /> Delivery Address
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs outline-none font-medium"
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Street Address"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs outline-none font-medium"
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="City"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs outline-none font-medium"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    />
                    <input
                      type="text"
                      required
                      placeholder="ZIP Code"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs outline-none font-medium"
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    />
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600 font-medium">
                  <div className="flex justify-between">
                    <span>Items Subtotal:</span>
                    <span className="font-extrabold text-slate-900">${subtotalAmount.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Coupon Discount:</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Estimated Shipping:</span>
                    <span className="text-emerald-600 font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-100">
                    <span>Total Payable:</span>
                    <span className="text-indigo-600 text-xl font-heading">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 text-xs transition active:scale-95 disabled:opacity-50"
                >
                  <CreditCard size={16} />
                  <span>{loading ? 'Processing Checkout...' : 'Proceed to Secure Checkout'}</span>
                </button>
              </form>

              <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1 pt-1 font-medium">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>256-bit SSL Encrypted Transaction</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Razorpay Gateway Payment Modal & Success Modal */}
      <RazorpayPaymentModal
        shippingAddress={shippingAddress}
        totalAmount={totalAmount}
        onSuccess={(orderData) => setCompletedOrder(orderData)}
      />
      <OrderSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
      />
    </div>
  );
};

export default CartPage;
