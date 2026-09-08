import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { openModal } from '../features/ui/uiSlice.js';
import { Home, Grid, Heart, ShoppingBag, User, Store, Shield, Package, UserCircle } from 'lucide-react';

const MobileBottomNav = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.orders);
  const { wishlistItems } = useSelector((state) => state.wishlist);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const navLinkStyle = ({ isActive }) =>
    `flex flex-col items-center justify-center py-1 flex-1 text-[10px] font-bold transition active:scale-95 ${
      isActive ? 'text-indigo-600 font-black' : 'text-slate-500 hover:text-slate-900'
    }`;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 px-1 py-1 shadow-lg flex items-center justify-around font-body safe-bottom-padding">
      <NavLink to="/" className={navLinkStyle}>
        <Home size={19} />
        <span>Home</span>
      </NavLink>

      <NavLink to="/products" className={navLinkStyle}>
        <Grid size={19} />
        <span>Catalog</span>
      </NavLink>

      {/* Role-Specific Mid and End Actions */}
      {(!isAuthenticated || user?.role === 'user') && (
        <>
          <NavLink to="/wishlist" className={navLinkStyle}>
            <div className="relative">
              <Heart size={19} className={wishlistItems.length > 0 ? 'fill-rose-500 text-rose-500' : ''} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-1 ring-white">
                  {wishlistItems.length}
                </span>
              )}
            </div>
            <span>Wishlist</span>
          </NavLink>

          <NavLink to="/cart" className={navLinkStyle}>
            <div className="relative">
              <ShoppingBag size={19} />
              {isAuthenticated && totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-indigo-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-1 ring-white">
                  {totalCartCount}
                </span>
              )}
            </div>
            <span>Cart</span>
          </NavLink>

          {isAuthenticated ? (
            <NavLink to="/orders" className={navLinkStyle}>
              <Package size={19} />
              <span>Orders</span>
            </NavLink>
          ) : (
            <button
              className="flex flex-col items-center justify-center py-1 flex-1 text-[10px] font-bold text-slate-500 hover:text-slate-900 active:scale-95"
              onClick={() => dispatch(openModal({ modal: 'LOGIN' }))}
            >
              <User size={19} />
              <span>Sign In</span>
            </button>
          )}
        </>
      )}

      {/* Seller Specific Tabs */}
      {isAuthenticated && user?.role === 'seller' && (
        <>
          <NavLink to="/cart" className={navLinkStyle}>
            <Store size={19} />
            <span>Store</span>
          </NavLink>

          <NavLink to="/seller/orders" className={navLinkStyle}>
            <Package size={19} />
            <span>Orders</span>
          </NavLink>

          <NavLink to="/profile" className={navLinkStyle}>
            <UserCircle size={19} />
            <span>Profile</span>
          </NavLink>
        </>
      )}

      {/* Admin Specific Tabs */}
      {isAuthenticated && user?.role === 'admin' && (
        <>
          <NavLink to="/admin" className={navLinkStyle}>
            <Shield size={19} />
            <span>Admin</span>
          </NavLink>

          <NavLink to="/profile" className={navLinkStyle}>
            <UserCircle size={19} />
            <span>Profile</span>
          </NavLink>
        </>
      )}
    </div>
  );
};

export default MobileBottomNav;
