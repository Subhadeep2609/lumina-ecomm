import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from './authSlice.js';
import { closeModal, openModal } from '../ui/uiSlice.js';
import { User, Mail, Lock, X, Sparkles, UserCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const dispatch = useDispatch();
  const { activeModal } = useSelector((state) => state.ui);
  const { loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

  const [showPassword, setShowPassword] = useState(false);

  if (activeModal !== 'REGISTER') return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser(formData));
  };

  return (
    <div className="modal-overlay" onClick={() => dispatch(closeModal())}>
      <div
        className="modal-card max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 font-body"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black font-heading text-slate-900">Create Lumina Account</h2>
              <p className="text-xs text-slate-500 font-medium">Verification OTP code will be sent to your email</p>
            </div>
          </div>

          <button
            onClick={() => dispatch(closeModal())}
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Full Name</label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition font-medium"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition font-medium"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition font-medium"
                placeholder="•••••••• (Min 6 characters)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition p-1 rounded-lg"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Role Selection Cards: Buyer & Seller ONLY */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-gray-700 block">Account Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition duration-200 cursor-pointer ${
                  formData.role === 'user'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm scale-[1.02]'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setFormData({ ...formData, role: 'user' })}
              >
                <UserCheck size={20} className="mb-1 text-blue-600" />
                <span>Buyer (Consumer)</span>
              </button>

              <button
                type="button"
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition duration-200 cursor-pointer ${
                  formData.role === 'seller'
                    ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-sm scale-[1.02]'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setFormData({ ...formData, role: 'seller' })}
              >
                <Sparkles size={20} className="mb-1 text-purple-600" />
                <span>Seller (Merchant)</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#5B3DF5] hover:bg-[#4c31cf] text-white font-extrabold rounded-xl text-sm shadow-md shadow-[#5B3DF5]/20 flex items-center justify-center gap-2 transition"
          >
            <span>{loading ? 'Sending OTP Email...' : 'Register & Verify Email'}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-gray-500 font-medium">
          Already have an account?{' '}
          <button
            onClick={() => dispatch(openModal({ modal: 'LOGIN' }))}
            className="text-[#5B3DF5] font-extrabold hover:underline"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
