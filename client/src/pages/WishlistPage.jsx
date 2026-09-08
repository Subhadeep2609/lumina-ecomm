import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromWishlist } from '../features/wishlist/wishlistSlice.js';
import { addToCart } from '../features/orders/orderSlice.js';
import { openModal } from '../features/ui/uiSlice.js';
import { Heart, Trash2, ShoppingBag, ArrowRight, Sparkles, Store, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated && (user?.role === 'seller' || user?.role === 'admin')) {
    const isSeller = user?.role === 'seller';
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-6 font-body">
        <div className="p-8 bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-2xs">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border ${
            isSeller ? 'bg-purple-50 text-purple-600 border-purple-200/60' : 'bg-rose-50 text-rose-600 border-rose-200/60'
          }`}>
            <Store size={32} />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-black font-heading text-slate-900">
              Wishlist Disabled for {isSeller ? 'Sellers' : 'Administrators'}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {isSeller
                ? 'Merchant seller accounts do not have shopper wishlist capabilities. Access your listed products below!'
                : 'System administrator accounts do not have buyer wishlist capabilities. Access the Admin Control Center below!'}
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              to={isSeller ? "/cart" : "/admin"}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-extrabold rounded-2xl text-xs hover:from-indigo-700 hover:to-indigo-800 transition shadow-md active:scale-95"
            >
              {isSeller ? 'My Listed Products' : 'Admin Control Dashboard'}
            </Link>
            <button
              onClick={() => dispatch(openModal({ modal: 'PRODUCT_FORM' }))}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-2xl text-xs transition flex items-center gap-1.5"
            >
              <PlusCircle size={15} /> Add New Product
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleMoveAllToCart = () => {
    wishlistItems.forEach((item) => {
      dispatch(addToCart(item));
      dispatch(removeFromWishlist(item._id || item.id));
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 pt-4 px-4 font-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200/60 shadow-2xs">
            <Heart size={24} className="fill-rose-500" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black font-heading text-slate-900 tracking-tight">Saved Wishlist</h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium">Keep track of your favorite items and move them to cart anytime</p>
          </div>
        </div>

        {wishlistItems.length > 0 && (
          <button
            onClick={handleMoveAllToCart}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition active:scale-95"
          >
            <ShoppingBag size={15} /> Move All to Cart ({wishlistItems.length})
          </button>
        )}
      </div>

      {wishlistItems.length === 0 ? (
        <div className="py-20 text-center bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-2xs">
          <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-rose-400">
            <Heart size={40} className="fill-rose-100" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-xl font-extrabold text-slate-900 font-heading">Your wishlist is empty</h3>
            <p className="text-xs text-slate-500 font-medium">
              Click the heart icon on any product to save it to your wishlist for quick access later.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-indigo-600 text-white font-extrabold rounded-2xl text-xs hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            Explore Catalog <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((product) => {
            const id = product._id || product.id;
            const mainImage = (product.images && product.images.length > 0) ? product.images[0].url : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
            const price = Number(product.price);

            return (
              <div key={id} className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between space-y-3.5 shadow-2xs card-hover-effect border-slate-200 hover:border-indigo-500/40">
                <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                  <img src={mainImage} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <button
                    onClick={() => dispatch(removeFromWishlist(id))}
                    className="absolute top-2.5 right-2.5 p-2 bg-white/90 backdrop-blur-md text-rose-600 rounded-full hover:bg-rose-50 shadow-md transition"
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider font-heading">{product.brand || product.category}</span>
                  <h4 className="font-extrabold text-sm text-slate-900 truncate font-heading">{product.title}</h4>
                  <span className="text-base font-black text-slate-900 font-heading block">${price.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => {
                    dispatch(addToCart(product));
                    dispatch(removeFromWishlist(id));
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-2xs active:scale-95"
                >
                  <ShoppingBag size={15} /> Move to Cart
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
