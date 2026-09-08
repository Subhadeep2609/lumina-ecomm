import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal, openModal, showToast } from '../ui/uiSlice.js';
import { deleteProduct } from './productSlice.js';
import { addToCart } from '../orders/orderSlice.js';
import { toggleWishlist } from '../wishlist/wishlistSlice.js';
import { X, Star, Package, Edit3, Trash2, Tag, Truck, ShieldCheck, ShoppingBag, Heart, MapPin, CheckCircle2, Share2, Plus, Minus, Sparkles, Bot, Loader2, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../../utils/api.js';
import { openChat, sendAiMessage } from '../ai/aiSlice.js';

const ProductDetailModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { activeModal, selectedProductForView } = useSelector((state) => state.ui);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const { cartItems } = useSelector((state) => state.orders);

  const [pincode, setPincode] = useState('10001');
  const [activeTab, setActiveTab] = useState('description');
  const [quantity, setQuantity] = useState(1);
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingAiSummary, setLoadingAiSummary] = useState(false);

  const isOpen = activeModal === 'PRODUCT_DETAIL' && Boolean(selectedProductForView);
  const product = selectedProductForView || {};
  const id = product._id || product.id || '';
  const stock = typeof product.stock === 'number' ? product.stock : 0;
  const isWishlisted = wishlistItems.some((item) => (item._id || item.id) === id);

  const existingCartItem = cartItems?.find((item) => (item._id || item.id) === id);
  const inCartQty = existingCartItem ? existingCartItem.quantity : 0;
  const maxAddable = Math.max(0, stock - inCartQty);

  React.useEffect(() => {
    if (!isOpen) return;
    if (maxAddable > 0) {
      setQuantity((prev) => Math.min(Math.max(1, prev), maxAddable));
    } else {
      setQuantity(0);
    }
  }, [isOpen, id, maxAddable]);

  if (!isOpen) return null;

  const isOwnerOrAdmin =
    isAuthenticated &&
    user &&
    (user.role === 'admin' || (user.role === 'seller' && (product.user === user.id || product.user?._id === user.id)));

  const mainImage =
    product.images && product.images.length > 0
      ? product.images[0].url
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';

  const price = Number(product.price);
  const mrpPrice = (price * 1.25).toFixed(2);
  const savingsAmount = (price * 0.25).toFixed(2);

  const handleDelete = () => {
    if (window.confirm(`Delete product "${product.title}"?`)) {
      dispatch(deleteProduct(id));
      dispatch(closeModal());
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      dispatch(showToast({ message: 'Please sign in to a Buyer account to add products to your cart.', type: 'info' }));
      dispatch(openModal({ modal: 'LOGIN' }));
      return;
    }
    if (user?.role !== 'user') {
      dispatch(showToast({ message: 'Only Buyer accounts can add products to cart.', type: 'error' }));
      return;
    }
    if (maxAddable <= 0) {
      dispatch(showToast({ message: `All available stock (${stock} units) is already in your cart.`, type: 'error' }));
      return;
    }
    const qtyToAdd = Math.min(quantity, maxAddable);
    dispatch(addToCart({ ...product, quantity: qtyToAdd }));
    dispatch(showToast({ message: `Added ${qtyToAdd} "${product.title}" to your cart.`, type: 'success' }));
    dispatch(closeModal());
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      dispatch(showToast({ message: 'Please sign in to a Buyer account to purchase products.', type: 'info' }));
      dispatch(openModal({ modal: 'LOGIN' }));
      return;
    }
    if (user?.role !== 'user') {
      dispatch(showToast({ message: 'Only Buyer accounts can make purchases.', type: 'error' }));
      return;
    }
    if (inCartQty >= stock) {
      dispatch(closeModal());
      navigate('/cart');
      return;
    }
    const qtyToAdd = Math.min(quantity, maxAddable);
    dispatch(addToCart({ ...product, quantity: qtyToAdd }));
    dispatch(closeModal());
    navigate('/cart');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'ai_take' && !aiSummary && !loadingAiSummary) {
      fetchAiSummary();
    }
  };

  const fetchAiSummary = async () => {
    setLoadingAiSummary(true);
    try {
      const res = await apiCall('/ai/summarize-product', {
        method: 'POST',
        body: JSON.stringify({
          productId: id,
          productData: product
        })
      });
      setAiSummary(res.summary);
    } catch (err) {
      console.warn('AI summary error:', err);
    } finally {
      setLoadingAiSummary(false);
    }
  };

  const handleAskAiAboutItem = () => {
    dispatch(closeModal());
    dispatch(openChat());
    dispatch(sendAiMessage({ message: `Can you give me a personalized breakdown of "${product.title}"? Is it worth buying?` }));
  };

  return (
    <div className="modal-overlay" onClick={() => dispatch(closeModal())}>
      <div
        className="modal-card max-w-4xl w-full bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl space-y-5 sm:space-y-6 max-h-[92vh] overflow-y-auto font-body"
        style={{ maxWidth: '900px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar: Category, SKU, Stock, Close */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-200/60">
              {product.category}
            </span>
            <span className="text-[11px] sm:text-xs text-slate-400 font-mono font-bold">• SKU #{id.slice(-6).toUpperCase()}</span>
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                In Stock ({product.stock} left)
              </span>
            ) : (
              <span className="text-[10px] sm:text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200/60">
                Out of Stock
              </span>
            )}
          </div>
          <button
            onClick={() => dispatch(closeModal())}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* Left: Image & Trust Badges */}
          <div className="space-y-3">
            <div className="w-full aspect-square max-h-72 sm:max-h-none sm:h-80 md:h-88 rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-50 relative group flex items-center justify-center">
              <img
                src={mainImage}
                alt={product.title}
                className="w-full h-full object-contain p-4 group-hover:scale-105 transition duration-500"
              />
              {(!isAuthenticated || user?.role !== 'seller') && (
                <button
                  onClick={() => dispatch(toggleWishlist(product))}
                  className="absolute top-3 right-3 p-2.5 bg-white/95 backdrop-blur-md rounded-full shadow-md text-slate-600 hover:text-rose-500 transition active:scale-95"
                  aria-label="Wishlist"
                >
                  <Heart size={18} className={isWishlisted ? 'fill-rose-500 text-rose-500' : ''} />
                </button>
              )}
            </div>

            {/* Micro Trust Bar */}
            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 font-semibold pt-1">
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                <Truck size={16} className="text-indigo-600 mb-1" />
                <span>Fast Express</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                <ShieldCheck size={16} className="text-emerald-600 mb-1" />
                <span>100% Genuine</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                <Package size={16} className="text-amber-600 mb-1" />
                <span>7-Day Return</span>
              </div>
            </div>
          </div>

          {/* Right: Details, Pricing & Action */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3.5">
              <div>
                <span className="text-xs font-black uppercase text-indigo-600 tracking-wider font-heading">
                  {product.brand || 'Lumina'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 mt-0.5 leading-snug">
                  {product.title}
                </h2>
              </div>

              {/* Ratings */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1 text-amber-700 font-black bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/70">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  <span>{product.rating || 4.8}</span>
                </div>
                <span className="text-slate-400 font-semibold">(142 Verified Ratings)</span>
              </div>

              {/* Price & Savings Card */}
              <div className="p-4 bg-gradient-to-br from-slate-50 to-indigo-50/20 border border-slate-200/80 rounded-2xl space-y-1.5">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 font-heading tracking-tight">
                    ${price.toFixed(2)}
                  </span>
                  <span className="text-base text-slate-400 line-through font-mono font-medium">
                    ${mrpPrice}
                  </span>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100/90 border border-emerald-300/70 px-2.5 py-1 rounded-lg uppercase tracking-wide whitespace-nowrap shadow-2xs">
                    20% OFF
                  </span>
                </div>
                <p className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  <span>You Save: ${savingsAmount} <span className="text-slate-400 font-normal">(Includes all taxes)</span></span>
                </p>
              </div>

              {/* Quantity Counter (Hidden for Sellers & Admins) */}
              {user?.role !== 'seller' && user?.role !== 'admin' && (
                <div className="space-y-1.5 py-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-700">Quantity</span>
                      {inCartQty > 0 && (
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
                          {inCartQty} in cart
                        </span>
                      )}
                    </div>
                    <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-2xs">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1 || maxAddable <= 0}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-l-xl transition active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-4 font-black text-slate-900 text-xs min-w-[2.5rem] text-center">
                        {maxAddable <= 0 ? 0 : quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(maxAddable, q + 1))}
                        disabled={quantity >= maxAddable || maxAddable <= 0}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-r-xl transition active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {stock > 0 && maxAddable > 0 && quantity >= maxAddable && (
                    <p className="text-[11px] text-amber-600 font-bold text-right">
                      Max available stock reached ({stock} in stock)
                    </p>
                  )}
                  {stock > 0 && maxAddable <= 0 && (
                    <p className="text-[11px] text-rose-600 font-bold text-right">
                      All {stock} available units are already in your cart
                    </p>
                  )}
                </div>
              )}

              {/* Pincode & Delivery */}
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-slate-700 font-heading">Delivery & Stock Availability</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 flex-1 shadow-2xs focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition">
                    <MapPin size={15} className="text-slate-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      className="w-full text-xs text-slate-800 outline-none font-medium bg-transparent"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="Enter ZIP code"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-xl font-bold text-xs shrink-0">
                    <Truck size={14} className="text-emerald-600" />
                    <span>Free Express</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2 pt-3">
              {user?.role === 'seller' || user?.role === 'admin' ? (
                <div className="flex gap-2.5">
                  {isOwnerOrAdmin && (
                    <>
                      <button
                        className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                        onClick={() => dispatch(openModal({ modal: 'PRODUCT_FORM', product }))}
                      >
                        <Edit3 size={15} /> Edit Listing
                      </button>
                      <button
                        className="flex-1 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                        onClick={handleDelete}
                      >
                        <Trash2 size={15} /> Delete Listing
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                  <button
                    className="flex-1 py-3 sm:py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-black rounded-xl shadow-md hover:shadow-lg text-xs flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    onClick={handleAddToCart}
                    disabled={stock <= 0 || maxAddable <= 0}
                  >
                    <ShoppingBag size={16} />
                    <span>
                      {stock <= 0
                        ? 'Out of Stock'
                        : maxAddable <= 0
                        ? `All ${stock} in Cart`
                        : 'Add to Cart'}
                    </span>
                  </button>

                  <button
                    className="flex-1 py-3 sm:py-3.5 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-xl shadow-md hover:shadow-lg text-xs flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    onClick={handleBuyNow}
                    disabled={stock <= 0}
                  >
                    <Zap size={16} className="fill-slate-950" />
                    <span>{maxAddable <= 0 && inCartQty >= stock ? 'View in Cart' : 'Buy Now'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs: Overview, Specs & Lumina AI Insights */}
        <div className="pt-4 border-t border-slate-100 space-y-3.5">
          {/* Segmented Tab Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60 text-xs font-bold text-slate-600 overflow-x-auto no-scrollbar max-w-full">
              <button
                className={`px-3 sm:px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'description'
                    ? 'bg-white text-indigo-600 shadow-sm font-extrabold'
                    : 'hover:text-slate-900'
                }`}
                onClick={() => handleTabChange('description')}
              >
                Overview
              </button>
              <button
                className={`px-3 sm:px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'specs'
                    ? 'bg-white text-indigo-600 shadow-sm font-extrabold'
                    : 'hover:text-slate-900'
                }`}
                onClick={() => handleTabChange('specs')}
              >
                Specifications
              </button>
              <button
                className={`px-3 sm:px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'ai_take'
                    ? 'bg-white text-purple-700 shadow-sm font-black'
                    : 'text-purple-700 hover:text-purple-900'
                }`}
                onClick={() => handleTabChange('ai_take')}
              >
                <Sparkles size={13} className="text-amber-500 fill-amber-400" />
                <span>Lumina AI Insights</span>
              </button>
            </div>

            <button
              onClick={handleAskAiAboutItem}
              className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 border border-indigo-200/80 rounded-xl text-xs font-extrabold transition shadow-2xs active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <Bot size={15} className="text-indigo-600" />
              <span>Ask AI Assistant</span>
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'description' && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
              <div className="space-y-1">
                <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider font-heading">About This Product</h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {product.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-slate-200/70">
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span className="font-semibold">Brand new original retail packaging</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span className="font-semibold">Zero-contact doorstep courier dispatch</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span className="font-semibold">Full 1-Year manufacturer warranty coverage</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span className="font-semibold">Hassle-free 7-day replacement policy</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Specifications */}
          {activeTab === 'specs' && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-200/70">
                  <span className="font-semibold text-slate-500">Brand</span>
                  <span className="font-black text-indigo-600">{product.brand || 'Lumina'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200/70">
                  <span className="font-semibold text-slate-500">Category</span>
                  <span className="font-bold text-slate-800">{product.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200/70">
                  <span className="font-semibold text-slate-500">Stock Availability</span>
                  <span className="font-black text-emerald-700">{product.stock} Units In Stock</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200/70">
                  <span className="font-semibold text-slate-500">SKU Reference</span>
                  <span className="font-mono font-bold text-slate-700">#{id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200/70">
                  <span className="font-semibold text-slate-500">Warranty Support</span>
                  <span className="font-bold text-slate-800">1 Year Official Lumina Care</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200/70">
                  <span className="font-semibold text-slate-500">Shipping Mode</span>
                  <span className="font-bold text-emerald-700">Free Express Air Courier</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Lumina AI Insights */}
          {activeTab === 'ai_take' && (
            <div className="bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-slate-50 p-5 rounded-2xl border border-indigo-200/80 space-y-4">
              {loadingAiSummary ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3 text-indigo-600 text-xs font-bold">
                  <Loader2 size={24} className="animate-spin text-indigo-600" />
                  <span>Synthesizing Lumina AI Product Analysis...</span>
                </div>
              ) : aiSummary ? (
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-4 pb-3 border-b border-indigo-100">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1.5 font-heading">
                        <Sparkles size={13} className="text-amber-500 fill-amber-400" /> AI Executive Summary
                      </span>
                      <p className="text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed">
                        {aiSummary.quickTake}
                      </p>
                    </div>
                    {aiSummary.verdict && (
                      <span className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 rounded-xl text-xs font-black shrink-0 shadow-2xs">
                        {aiSummary.verdict}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2 bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs">
                      <span className="font-black text-emerald-700 flex items-center gap-1.5 font-heading">
                        <CheckCircle2 size={14} className="text-emerald-600" /> Key Strengths
                      </span>
                      <ul className="space-y-1.5 text-slate-700">
                        {aiSummary.pros?.map((pro, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-1.5 text-[11px] leading-normal font-medium">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2 bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs">
                      <span className="font-black text-indigo-900 flex items-center gap-1.5 font-heading">
                        <Zap size={14} className="text-amber-500 fill-amber-400" /> Ideal Target Buyer
                      </span>
                      <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                        {aiSummary.bestFor}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <Sparkles size={28} className="mx-auto text-indigo-500 fill-indigo-200" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-700">Instant AI Product Insights</p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Get an AI-generated breakdown of key strengths, target audience, and buying recommendations.
                    </p>
                  </div>
                  <button
                    onClick={fetchAiSummary}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition hover:shadow-lg active:scale-95 cursor-pointer"
                  >
                    Generate AI Breakdown
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
