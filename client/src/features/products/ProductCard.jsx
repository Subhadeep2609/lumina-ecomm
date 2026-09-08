import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { openModal, showToast } from '../ui/uiSlice.js';
import { deleteProduct } from './productSlice.js';
import { addToCart } from '../orders/orderSlice.js';
import { toggleWishlist } from '../wishlist/wishlistSlice.js';
import { Star, Eye, Edit3, Trash2, ShoppingBag, Heart, Truck, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const { cartItems } = useSelector((state) => state.orders);

  const id = product._id || product.id;
  const isWishlisted = wishlistItems.some((item) => (item._id || item.id) === id);
  const inCart = cartItems?.find((x) => (x._id || x.id) === id)?.quantity || 0;
  const isStockExhausted = product.stock <= 0 || inCart >= product.stock;

  const mainImage =
    product.images && product.images.length > 0
      ? product.images[0].url
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';

  const isOwnerOrAdmin =
    isAuthenticated &&
    user &&
    (user.role === 'admin' || (user.role === 'seller' && (product.user === user.id || product.user?._id === user.id)));

  const price = Number(product.price);
  const mrpPrice = (price * 1.25).toFixed(2);
  const discountPercent = 20;

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${product.title}"?`)) {
      dispatch(deleteProduct(id));
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      dispatch(showToast({ message: 'Please sign in to a Buyer account to add products to your cart.', type: 'info' }));
      dispatch(openModal({ modal: 'LOGIN' }));
      return;
    }
    if (user?.role !== 'user') {
      dispatch(showToast({ message: 'Only Buyer accounts can add products to cart.', type: 'error' }));
      return;
    }
    dispatch(addToCart(product));
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      dispatch(showToast({ message: 'Please sign in to a Buyer account to save items to wishlist.', type: 'info' }));
      dispatch(openModal({ modal: 'LOGIN' }));
      return;
    }
    if (user?.role !== 'user') {
      dispatch(showToast({ message: 'Only Buyer accounts can use wishlist.', type: 'error' }));
      return;
    }
    dispatch(toggleWishlist(product));
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden flex flex-col group card-hover-effect border-slate-200 hover:border-indigo-500/40 relative">
      {/* Image Container */}
      <div
        className="relative w-full h-48 sm:h-52 overflow-hidden bg-slate-50 cursor-pointer"
        onClick={() => dispatch(openModal({ modal: 'PRODUCT_DETAIL', product }))}
      >
        <img
          src={mainImage}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-108 transition duration-500"
          loading="lazy"
        />

        {/* Discount Badge */}
        <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 px-2 sm:px-2.5 py-1 rounded-xl text-[10px] font-black uppercase bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md">
          -{discountPercent}% OFF
        </span>

        {/* Wishlist Heart Toggle Button (Hidden for Sellers and Admins) */}
        {(!isAuthenticated || (user?.role !== 'seller' && user?.role !== 'admin')) && (
          <button
            onClick={handleToggleWishlist}
            className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-9 h-9 rounded-full bg-white/95 backdrop-blur-md text-slate-700 hover:text-rose-500 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition duration-200"
            title="Save to Wishlist"
            aria-label="Save to Wishlist"
          >
            <Heart size={16} className={isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-600'} />
          </button>
        )}

        {/* Quick View Floating Action */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 hidden sm:flex justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch(openModal({ modal: 'PRODUCT_DETAIL', product }));
            }}
            className="px-4 py-2 bg-white/95 backdrop-blur-md text-slate-900 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5 hover:bg-indigo-600 hover:text-white transition"
          >
            <Eye size={14} /> Quick View
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-3.5 sm:p-4.5 flex flex-col flex-1 space-y-2 sm:space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold text-indigo-600 tracking-wider text-[11px] uppercase">{product.brand || 'Lumina'}</span>
          <div className="flex items-center gap-1 text-amber-600 font-black bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span>{product.rating || 4.8}</span>
            <span className="text-slate-600 font-bold text-[10px]">({product.numReviews || 94})</span>
          </div>
        </div>

        <h3
          className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition cursor-pointer line-clamp-1 font-heading"
          onClick={() => dispatch(openModal({ modal: 'PRODUCT_DETAIL', product }))}
        >
          {product.title}
        </h3>

        <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed font-medium">
          {product.description}
        </p>

        {/* Pricing */}
        <div className="pt-2 border-t border-slate-100 space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-slate-900 font-heading">${price.toFixed(2)}</span>
            <span className="text-xs text-slate-400 line-through font-mono">${mrpPrice}</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <Truck size={13} /> Free Express Delivery
            </span>
          </div>
        </div>

        {/* Actions (Add to Cart hidden for sellers) */}
        <div className="pt-2 flex items-center gap-2 mt-auto">
          {user?.role === 'seller' || user?.role === 'admin' ? (
            <button
              className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95"
              onClick={() => dispatch(openModal({ modal: 'PRODUCT_DETAIL', product }))}
            >
              <Eye size={14} /> View Details
            </button>
          ) : (
            <button
              className="flex-1 py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              onClick={handleAddToCart}
              disabled={isStockExhausted}
            >
              <ShoppingBag size={14} />
              <span>
                {product.stock <= 0
                  ? 'Out of Stock'
                  : inCart >= product.stock
                  ? 'Max in Cart'
                  : 'Add to Cart'}
              </span>
            </button>
          )}

          {isOwnerOrAdmin && (
            <div className="flex items-center gap-1">
              <button
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition"
                onClick={() => dispatch(openModal({ modal: 'PRODUCT_FORM', product }))}
                title="Edit Product"
              >
                <Edit3 size={14} />
              </button>
              <button
                className="p-2 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 transition"
                onClick={handleDelete}
                title="Delete Product"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
