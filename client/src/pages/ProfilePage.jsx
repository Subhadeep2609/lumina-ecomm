import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile } from '../features/auth/authSlice.js';
import { showToast, openModal } from '../features/ui/uiSlice.js';
import { apiCall } from '../utils/api.js';
import { User, Mail, Phone, MapPin, ShieldCheck, Camera, Sparkles, Save, CheckCircle2, Store, ShoppingBag, Heart, Loader2, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80'
];

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const { cartItems } = useSelector((state) => state.orders);
  const { products } = useSelector((state) => state.products);

  const [activeTab, setActiveTab] = useState('personal');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const isSeller = user?.role === 'seller';
  const isAdmin = user?.role === 'admin';
  const sellerProducts = (isSeller || isAdmin)
    ? products.filter((p) => !p.user || p.user === user.id || p.user?._id === user.id || p.user?.email === user.email)
    : [];
  const totalUnits = sellerProducts.reduce((acc, p) => acc + (p.stock || 0), 0);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    avatarUrl: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '+1 (555) 019-2834',
        bio: user.bio || 'LuminaMarket Enthusiast & Merchant',
        avatarUrl: user.avatar?.url || SAMPLE_AVATARS[0],
        street: user.shippingAddress?.street || '742 Evergreen Terrace',
        city: user.shippingAddress?.city || 'Springfield',
        state: user.shippingAddress?.state || 'NY',
        postalCode: user.shippingAddress?.postalCode || '10001',
        country: user.shippingAddress?.country || 'United States'
      });
    }
  }, [user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4 font-body">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100 shadow-2xs">
          <User size={32} />
        </div>
        <h2 className="text-2xl font-black font-heading text-slate-900">Sign In to Access Your Profile</h2>
        <p className="text-xs text-slate-500 font-medium">Please sign in to view and manage your account profile and shipping details.</p>
        <button
          onClick={() => dispatch(openModal({ modal: 'LOGIN' }))}
          className="px-6 py-3 bg-indigo-600 text-white font-extrabold rounded-2xl text-xs hover:bg-indigo-700 transition shadow-md shadow-indigo-600/20 active:scale-95"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  // Cloudinary Avatar Upload Handler
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    const data = new FormData();
    data.append('image', file);

    try {
      const res = await apiCall('/upload', {
        method: 'POST',
        body: data
      });

      setFormData((prev) => ({ ...prev, avatarUrl: res.url }));
      dispatch(showToast({ message: 'Custom profile avatar uploaded successfully!', type: 'success' }));
    } catch (err) {
      dispatch(showToast({ message: 'Avatar upload failed: ' + err.message, type: 'error' }));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const profilePayload = {
      name: formData.name,
      avatarUrl: formData.avatarUrl,
      phone: formData.phone,
      bio: formData.bio,
      shippingAddress: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country
      }
    };

    dispatch(updateUserProfile(profilePayload));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 pt-4 px-4 font-body">
      {/* Header Profile Cover Banner */}
      <div className="relative bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-xl overflow-hidden">
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          {/* Avatar Container with Upload Hover */}
          <div className="relative group">
            <div className="w-28 h-28 rounded-3xl overflow-hidden ring-4 ring-indigo-500/40 bg-slate-900 shadow-2xl">
              <img src={formData.avatarUrl || user.avatar?.url} alt={user.name} className="w-full h-full object-cover" />
            </div>

            <input
              type="file"
              accept="image/*"
              id="avatarFileInputCover"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <label
              htmlFor="avatarFileInputCover"
              className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition rounded-3xl flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer"
            >
              {uploadingAvatar ? <Loader2 size={18} className="animate-spin text-indigo-400" /> : <Camera size={20} />}
              <span className="mt-1">Upload Photo</span>
            </label>
          </div>

          {/* User Info Overview */}
          <div className="space-y-2 text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl md:text-3xl font-black font-heading tracking-tight">{user.name}</h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 size={13} /> Verified
              </span>
              <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                user.role === 'admin'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : user.role === 'seller'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
              }`}>
                {user.role} Account
              </span>
            </div>

            <p className="text-xs text-slate-100 font-bold flex items-center justify-center md:justify-start gap-1.5">
              <Mail size={14} className="text-indigo-300" /> {user.email}
            </p>
            <p className="text-xs text-slate-200 leading-relaxed max-w-xl italic font-medium">
              "{formData.bio}"
            </p>
          </div>

          {/* Account Quick Stats (Conditioned for Buyer vs Seller) */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0">
            {isSeller || isAdmin ? (
              <>
                <div className="p-3 bg-white/10 border border-white/20 rounded-2xl text-center backdrop-blur-md">
                  <span className="text-[10px] text-slate-200 font-extrabold block uppercase tracking-wider">Listed Products</span>
                  <span className="text-xl font-black text-purple-300 font-heading">{sellerProducts.length}</span>
                </div>
                <div className="p-3 bg-white/10 border border-white/20 rounded-2xl text-center backdrop-blur-md">
                  <span className="text-[10px] text-slate-200 font-extrabold block uppercase tracking-wider">Stock Units</span>
                  <span className="text-xl font-black text-emerald-300 font-heading">{totalUnits}</span>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 bg-white/10 border border-white/20 rounded-2xl text-center backdrop-blur-md">
                  <span className="text-[10px] text-slate-200 font-extrabold block uppercase tracking-wider">Cart Items</span>
                  <span className="text-xl font-black text-indigo-300 font-heading">{cartItems.length}</span>
                </div>
                <div className="p-3 bg-white/10 border border-white/20 rounded-2xl text-center backdrop-blur-md">
                  <span className="text-[10px] text-slate-200 font-extrabold block uppercase tracking-wider">Wishlist</span>
                  <span className="text-xl font-black text-rose-300 font-heading">{wishlistItems.length}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200/90 gap-4 sm:gap-6 text-xs font-bold text-slate-500 font-heading overflow-x-auto no-scrollbar whitespace-nowrap">
        <button
          className={`pb-3 transition flex items-center gap-1.5 shrink-0 ${
            activeTab === 'personal' ? 'text-indigo-600 border-b-2 border-indigo-600 font-black' : 'hover:text-slate-900'
          }`}
          onClick={() => setActiveTab('personal')}
        >
          <User size={15} /> Personal Details
        </button>
        <button
          className={`pb-3 transition flex items-center gap-1.5 shrink-0 ${
            activeTab === 'shipping' ? 'text-indigo-600 border-b-2 border-indigo-600 font-black' : 'hover:text-slate-900'
          }`}
          onClick={() => setActiveTab('shipping')}
        >
          <MapPin size={15} /> Shipping & Delivery
        </button>
        <button
          className={`pb-3 transition flex items-center gap-1.5 shrink-0 ${
            activeTab === 'shortcuts' ? 'text-indigo-600 border-b-2 border-indigo-600 font-black' : 'hover:text-slate-900'
          }`}
          onClick={() => setActiveTab('shortcuts')}
        >
          <ShieldCheck size={15} /> Account Security & Actions
        </button>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === 'personal' && (
          <div className="p-4 sm:p-6 md:p-8 bg-white border border-slate-200/90 rounded-3xl space-y-5 sm:space-y-6 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold font-heading text-slate-900">Personal Profile Details</h3>
              <span className="text-xs text-slate-400 font-medium">Update your name, bio, phone and custom avatar</span>
            </div>

            {/* Custom Avatar Upload Box & Sample Preset Picker */}
            <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-heading">
                  <Camera size={16} className="text-indigo-600" /> Custom User Profile Picture (Avatar)
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">Cloudinary Media Upload</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 bg-white shrink-0 shadow-2xs">
                  <img src={formData.avatarUrl || user.avatar?.url} alt="Avatar Preview" className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      id="customAvatarUploadInput"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                    <label
                      htmlFor="customAvatarUploadInput"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 transition shadow-sm active:scale-95"
                    >
                      {uploadingAvatar ? <Loader2 size={15} className="animate-spin text-white" /> : <UploadCloud size={15} />}
                      <span>{uploadingAvatar ? 'Uploading Picture...' : 'Upload Custom Profile Picture'}</span>
                    </label>

                    {formData.avatarUrl && (
                      <span className="text-[11px] text-emerald-600 font-black flex items-center gap-1">
                        <CheckCircle2 size={13} /> Custom Photo Set
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-semibold block">Or paste image URL directly:</span>
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 font-medium"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.avatarUrl}
                      onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Presets */}
              <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Or select sample avatar preset:</span>
                <div className="flex items-center gap-3">
                  {SAMPLE_AVATARS.map((url, i) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatarUrl: url })}
                      className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition ${
                        formData.avatarUrl === url ? 'border-indigo-600 ring-2 ring-indigo-500/20 scale-105' : 'border-slate-200 hover:border-indigo-400'
                      }`}
                    >
                      <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block font-heading">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition font-bold"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block font-heading">Email Address (Read Only)</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed font-medium"
                    value={formData.email}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block font-heading">Contact Phone Number</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition font-semibold"
                    placeholder="+1 (555) 019-2834"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block font-heading">Account Role</label>
                <input
                  type="text"
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-700 uppercase font-black"
                  value={user.role}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block font-heading">Personal Bio / Merchant Headline</label>
              <textarea
                rows={3}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 transition font-medium resize-none leading-relaxed"
                placeholder="Write a brief intro about yourself or your merchant store..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="p-4 sm:p-6 md:p-8 bg-white border border-slate-200/90 rounded-3xl space-y-5 sm:space-y-6 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold font-heading text-slate-900">Default Shipping Address</h3>
              <span className="text-xs text-slate-400 font-medium">Used for express checkout and order delivery</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block font-heading">Street Address</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 font-medium"
                  placeholder="e.g. 742 Evergreen Terrace"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block font-heading">City</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 font-medium"
                    placeholder="Springfield"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block font-heading">State / Region</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 font-medium"
                    placeholder="NY"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block font-heading">Postal / ZIP Code</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 font-mono font-bold"
                    placeholder="10001"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block font-heading">Country</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 font-medium"
                  placeholder="United States"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shortcuts' && (
          <div className="p-4 sm:p-6 md:p-8 bg-white border border-slate-200/90 rounded-3xl space-y-5 sm:space-y-6 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold font-heading text-slate-900">Account Security & Role Navigation</h3>
              <span className="text-xs text-slate-400 font-medium">Quick links based on your account role ({user.role})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to={user.role === 'seller' || user.role === 'admin' ? '/seller/orders' : '/orders'}
                className="p-5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-2xl flex items-center gap-3 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 font-heading">My Orders & Fulfillment</h4>
                  <p className="text-xs text-slate-500">Track current purchases or fulfill seller orders</p>
                </div>
              </Link>

              {user.role === 'seller' && (
                <Link
                  to="/cart"
                  className="p-5 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 rounded-2xl flex items-center gap-3 transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                    <Store size={20} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 font-heading">Seller Listed Products</h4>
                    <p className="text-xs text-slate-500">Manage your active catalog inventory</p>
                  </div>
                </Link>
              )}

              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="p-5 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-2xl flex items-center gap-3 transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 font-heading">Admin Control Center</h4>
                    <p className="text-xs text-slate-500">Manage system roles, products and users</p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Submit Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{loading ? 'Saving Changes...' : 'Save Profile Details'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
