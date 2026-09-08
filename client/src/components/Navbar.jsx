import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../features/auth/authSlice.js';
import { openModal } from '../features/ui/uiSlice.js';
import { setFilter, fetchProducts } from '../features/products/productSlice.js';
import { clearCart } from '../features/orders/orderSlice.js';
import { Sparkles, MapPin, Search, Heart, ShoppingBag, User, LogOut, Shield, Store, Package, X, Command, Flame, Home, Grid, Info, Bot } from 'lucide-react';
import { openChat, sendAiMessage } from '../features/ai/aiSlice.js';

const CATEGORIES = [
  'All Categories',
  'Electronics',
  'Mobiles',
  'Laptops',
  'Fashion',
  'Home & Kitchen',
  'Beauty',
  'Gaming',
  'Sports',
  'Accessories',
  'Deals'
];

const SUGGESTIONS = ['Aura ANC Headphones', 'Smartwatch Pro', 'Gaming Laptop', 'Wireless Earbuds', 'Leather Jacket'];

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { filters } = useSelector((state) => state.products);
  const { cartItems } = useSelector((state) => state.orders);
  const { wishlistItems } = useSelector((state) => state.wishlist);

  const [searchFocused, setSearchFocused] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const isProductsPage = location.pathname === '/products';

  // Keyboard shortcut listener for ⌘ K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('mainSearchInput');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchChange = (e) => {
    dispatch(setFilter({ keyword: e.target.value }));
    dispatch(fetchProducts());
  };

  const handleCategoryClick = (cat) => {
    const categoryName = cat === 'All Categories' ? 'All' : cat;
    dispatch(setFilter({ category: categoryName }));
    dispatch(fetchProducts());
  };

  const handleLaunchAiSearch = (customQuery) => {
    const q = customQuery || filters.keyword;
    dispatch(openChat());
    if (q && q.trim()) {
      dispatch(sendAiMessage({ message: `I'm looking for "${q}". What are the best options in the catalog?` }));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    setAccountMenuOpen(false);
    navigate('/');
  };

  const mainNavLinkStyle = ({ isActive }) =>
    `text-xs font-bold flex items-center gap-1.5 py-2 px-3.5 rounded-xl transition-all ${
      isActive ? 'bg-indigo-600/10 text-indigo-600 font-extrabold shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const isHomePage = location.pathname === '/';
  const isBuyerOrGuest = !isAuthenticated || user?.role === 'user';
  const showTopBar = isHomePage && isBuyerOrGuest;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-xs">
      {/* Top Announcement Bar (Homepage Buyer/Guest Only, Address Only) */}
      {showTopBar && (
        <div className="bg-slate-950 text-white text-[11px] py-1.5 px-4 font-medium tracking-wide">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <MapPin size={13} className="text-amber-400" /> Deliver to <strong className="text-white font-semibold">New York (10001)</strong>
            </span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition duration-300">
            <Sparkles size={22} className="animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold font-heading text-slate-900 tracking-tight leading-none">
              Lumina<span className="text-indigo-600">Market</span>
            </span>
            <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mt-0.5">Premium E-Commerce</span>
          </div>
        </Link>

        {/* Explicit Page Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          <NavLink to="/" className={mainNavLinkStyle}>
            <Home size={15} /> Home
          </NavLink>
          <NavLink to="/products" className={mainNavLinkStyle}>
            <Grid size={15} /> Catalog
          </NavLink>
          <NavLink to="/about" className={mainNavLinkStyle}>
            <Info size={15} /> About Us
          </NavLink>
        </nav>

        {/* Large Search Bar */}
        <div className="relative flex-1 max-w-xl mx-2 hidden md:block">
          <div className={`flex items-center bg-slate-100/90 border rounded-xl px-3.5 py-2 transition-all duration-200 ${
            searchFocused ? 'border-indigo-600 bg-white ring-4 ring-indigo-600/10 shadow-md' : 'border-slate-200 hover:border-slate-300'
          }`}>
            <Search size={18} className="text-slate-400 mr-2 shrink-0" />
            <input
              id="mainSearchInput"
              type="text"
              className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none font-medium"
              placeholder="Search premium tech, fashion, wearables, audio..."
              value={filters.keyword}
              onChange={handleSearchChange}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            />
            {filters.keyword ? (
              <button onClick={() => { dispatch(setFilter({ keyword: '' })); dispatch(fetchProducts()); }} className="text-slate-400 hover:text-slate-600 p-0.5">
                <X size={16} />
              </button>
            ) : (
              <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono font-bold text-slate-400 bg-slate-200/80 px-1.5 py-0.5 rounded border border-slate-300">
                <Command size={10} /> K
              </span>
            )}

            <button
              type="button"
              onClick={() => handleLaunchAiSearch()}
              className="ml-1 px-2.5 py-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 text-indigo-700 border border-indigo-200/80 rounded-lg text-[11px] font-black flex items-center gap-1 transition shrink-0"
              title="Ask Lumina AI Assistant"
            >
              <Sparkles size={12} className="text-indigo-600" />
              <span>Ask AI</span>
            </button>
          </div>

          {/* Search Suggestions Overlay */}
          {searchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50 space-y-3 animation-slideUp">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Flame size={14} className="text-rose-500" /> Trending Searches
                </span>
                <span className="text-[10px] text-indigo-600 font-normal">Press ENTER to search</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((sug) => (
                  <button
                    key={sug}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-xs font-semibold text-slate-700 rounded-xl transition-all"
                    onClick={() => {
                      dispatch(setFilter({ keyword: sug }));
                      dispatch(fetchProducts());
                      navigate('/products');
                    }}
                  >
                    {sug}
                  </button>
                ))}
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">Looking for customized gift or audio gear advice?</span>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); handleLaunchAiSearch(); }}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-black flex items-center gap-1.5 transition shadow-2xs"
                >
                  <Bot size={13} />
                  <span>Ask Lumina AI</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Actions: Wishlist, Cart, Account */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Hide Wishlist for Sellers and Admins */}
          {(!isAuthenticated || (user?.role !== 'seller' && user?.role !== 'admin')) && (
            <Link
              to="/wishlist"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 transition relative p-2 rounded-xl hover:bg-slate-100"
              title="Wishlist"
            >
              <div className="relative">
                <Heart size={20} className={wishlistItems.length > 0 ? 'fill-rose-500 text-rose-500' : 'text-slate-700'} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                    {wishlistItems.length}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline-block">Wishlist</span>
            </Link>
          )}

          {/* Cart / Console Link (For Admin -> /admin, For Seller -> /cart Listed Products) */}
          {user?.role === 'admin' ? (
            <Link
              to="/admin"
              className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md shadow-rose-600/20 active:scale-95"
            >
              <Shield size={18} />
              <span>Admin Control</span>
            </Link>
          ) : user?.role === 'seller' ? (
            <Link
              to="/cart"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md shadow-purple-600/20 active:scale-95"
            >
              <Store size={18} />
              <span>Listed Products</span>
            </Link>
          ) : (
            <Link
              to="/cart"
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md shadow-indigo-600/20 active:scale-95"
            >
              <div className="relative">
                <ShoppingBag size={18} />
                {isAuthenticated && user?.role === 'user' && totalCartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center ring-2 ring-indigo-700 animate-bounce">
                    {totalCartCount}
                  </span>
                )}
              </div>
              <span>Cart</span>
            </Link>
          )}

          {/* User Account / Auth Dropdown */}
          <div className="relative">
            {isAuthenticated && user ? (
              <button
                className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 transition"
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              >
                <img src={user.avatar?.url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"} alt={user.name} className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/30" />
                <span className="text-xs font-bold text-slate-800 hidden sm:inline-block">{user.name.split(' ')[0]}</span>
                <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-lg border ${
                  user.role === 'admin'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : user.role === 'seller'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                  {user.role}
                </span>
              </button>
            ) : (
              <button
                className="text-xs font-bold px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
                onClick={() => dispatch(openModal({ modal: 'LOGIN' }))}
              >
                <User size={16} />
                <span>Account</span>
              </button>
            )}

            {/* Account Dropdown Menu */}
            {accountMenuOpen && isAuthenticated && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-xs space-y-1">
                <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                  <p className="font-extrabold text-slate-900">{user.name}</p>
                  <p className="text-slate-500 text-[11px] truncate">{user.email}</p>
                </div>

                <Link to="/profile" className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 font-bold text-indigo-600" onClick={() => setAccountMenuOpen(false)}>
                  <User size={15} /> My Profile & Details
                </Link>

                {user.role === 'user' && (
                  <Link to="/orders" className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 font-semibold text-slate-700" onClick={() => setAccountMenuOpen(false)}>
                    <Package size={15} className="text-indigo-600" /> My Orders
                  </Link>
                )}

                {(user.role === 'seller' || user.role === 'admin') && (
                  <Link to="/seller/orders" className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 font-semibold text-purple-700" onClick={() => setAccountMenuOpen(false)}>
                    <Store size={15} /> Manage Orders
                  </Link>
                )}

                {user.role === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 font-semibold text-rose-600" onClick={() => setAccountMenuOpen(false)}>
                    <Shield size={15} /> Admin Dashboard
                  </Link>
                )}

                <button
                  className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 hover:bg-rose-50 text-rose-600 font-bold border-t border-slate-100"
                  onClick={handleLogout}
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Navigation Bar ONLY ON PRODUCTS PAGE */}
      {isProductsPage && (
        <div className="border-t border-slate-100 bg-slate-50/80">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 text-xs font-semibold text-slate-600">
            {CATEGORIES.map((cat) => {
              const isSelected = (filters.category || 'All Categories') === (cat === 'All Categories' ? 'All' : cat);
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-extrabold shadow-sm'
                      : 'hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
