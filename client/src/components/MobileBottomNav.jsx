import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { openModal } from '../features/ui/uiSlice.js';
import { Home, Grid, Heart, ShoppingBag, User } from 'lucide-react';

const MobileBottomNav = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.orders);
  const { wishlistItems } = useSelector((state) => state.wishlist);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const isSellerOrAdmin = isAuthenticated && (user?.role === 'seller' || user?.role === 'admin');

  const navLinkStyle = ({ isActive }) =>
    `flex flex-col items-center justify-center py-1.5 flex-1 text-[10px] font-bold transition ${
      isActive ? 'text-indigo-600 font-black' : 'text-slate-500 hover:text-slate-900'
    }`;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg flex items-center justify-around font-body">
      <NavLink to="/" className={navLinkStyle}>
        <Home size={18} />
        <span>Home</span>
      </NavLink>

      <NavLink to="/products" className={navLinkStyle}>
        <Grid size={18} />
        <span>Catalog</span>
      </NavLink>

      {!isSellerOrAdmin && (
        <>
          <NavLink to="/wishlist" className={navLinkStyle}>
            <div className="relative">
              <Heart size={18} className={wishlistItems.length > 0 ? 'fill-rose-500 text-rose-500' : ''} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </div>
            <span>Wishlist</span>
          </NavLink>

          <NavLink to="/cart" className={navLinkStyle}>
            <div className="relative">
              <ShoppingBag size={18} />
              {isAuthenticated && user?.role === 'user' && totalCartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-indigo-600 text-white text-[9px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </div>
            <span>Cart</span>
          </NavLink>
        </>
      )}

      {user?.role === 'admin' && (
        <NavLink to="/admin" className={navLinkStyle}>
          <User size={18} />
          <span>Admin</span>
        </NavLink>
      )}

      {!isAuthenticated ? (
        <button className="flex flex-col items-center justify-center py-1.5 flex-1 text-[10px] font-bold text-gray-500" onClick={() => dispatch(openModal({ modal: 'LOGIN' }))}>
          <User size={18} />
          <span>Account</span>
        </button>
      ) : (
        <NavLink to="/orders" className={navLinkStyle}>
          <User size={18} />
          <span>Account</span>
        </NavLink>
      )}
    </div>
  );
};

export default MobileBottomNav;
