import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, loadUser } from './authSlice.js';
import { closeModal, openModal, showToast } from '../ui/uiSlice.js';
import { apiCall } from '../../utils/api.js';
import { Mail, Lock, X, Sparkles, ArrowRight, UserCheck, Store, Shield, KeyRound, Loader2, CheckCircle2, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const dispatch = useDispatch();
  const { activeModal } = useSelector((state) => state.ui);
  const { loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user'
  });

  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password States
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Request OTP, 2: Submit OTP & New Password
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleClose = () => {
    setFormData({ email: '', password: '', role: 'user' });
    setIsForgotPassword(false);
    setResetStep(1);
    dispatch(closeModal());
  };

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeModal === 'LOGIN') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal]);

  if (activeModal !== 'LOGIN') return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(result)) {
      handleClose();
    }
  };

  // Step 1: Send Reset OTP Code
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!resetEmail) return;

    setResetLoading(true);
    try {
      const res = await apiCall('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: resetEmail })
      });
      dispatch(showToast({ message: res.message || 'OTP code sent to email!', type: 'success' }));
      setResetStep(2);
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to send reset code', type: 'error' }));
    } finally {
      setResetLoading(false);
    }
  };

  // Step 2: Reset Password with OTP & New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail || !resetOtp || !newPassword) return;

    setResetLoading(true);
    try {
      const res = await apiCall('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: resetEmail,
          otp: resetOtp,
          newPassword
        })
      });

      if (res.success || res.token) {
        dispatch(loadUser());
      }

      dispatch(showToast({ message: res.message || 'Password reset successfully!', type: 'success' }));
      dispatch(closeModal());
      setIsForgotPassword(false);
      setResetStep(1);
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Password reset failed', type: 'error' }));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-card max-w-md w-full bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 font-body"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              {isForgotPassword ? <KeyRound size={20} /> : <Sparkles size={20} />}
            </div>
            <div>
              <h2 className="text-xl font-black font-heading text-slate-900">
                {isForgotPassword ? 'Reset Your Password' : 'Sign In to LuminaMarket'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isForgotPassword
                  ? resetStep === 1
                    ? 'Enter email to receive password reset OTP'
                    : 'Enter 6-digit OTP code and new password'
                  : 'Access your account, orders and wishlist'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORGOT PASSWORD FLOW */}
        {isForgotPassword ? (
          <div className="space-y-4">
            {resetStep === 1 ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Account Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition font-medium"
                      placeholder="Enter your registered email..."
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold rounded-2xl text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
                >
                  {resetLoading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
                  <span>{resetLoading ? 'Sending Reset OTP...' : 'Send Password Reset Code'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                  <span>OTP code sent to <strong>{resetEmail}</strong></span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">6-Digit Verification OTP</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    className="w-full text-center px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-mono font-black text-slate-900 tracking-widest outline-none focus:bg-white focus:border-indigo-600"
                    placeholder="123456"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">New Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 transition font-medium"
                      placeholder="At least 6 characters..."
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                      title={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-2xl text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
                >
                  {resetLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  <span>{resetLoading ? 'Updating Password...' : 'Save New Password & Sign In'}</span>
                </button>
              </form>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setResetStep(1);
                }}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
              >
                <ArrowLeft size={14} /> Back to Sign In
              </button>
            </div>
          </div>
        ) : (
          /* REGULAR LOGIN FLOW */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role-Based Sign-In Options (Buyer, Seller, Admin) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block font-heading">Sign In Role Option</label>
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
                {[
                  { id: 'user', label: 'Buyer', icon: UserCheck, activeColor: 'text-indigo-600' },
                  { id: 'seller', label: 'Seller', icon: Store, activeColor: 'text-purple-600' },
                  { id: 'admin', label: 'Admin', icon: Shield, activeColor: 'text-rose-600' }
                ].map((r) => {
                  const IconComp = r.icon;
                  const isSelected = (formData.role || 'user') === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: r.id })}
                      className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition ${
                        isSelected
                          ? `bg-white ${r.activeColor} shadow-sm border border-slate-200/80`
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <IconComp size={14} /> <span>{r.label}</span>
                    </button>
                  );
                })}
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
                  placeholder="xyz@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setResetEmail(formData.email || '');
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition font-medium"
                  placeholder="••••••••"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold rounded-2xl text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        )}

        {/* Footer Toggle */}
        <div className="text-center pt-2 text-xs text-slate-500 font-medium">
          Don't have an account?{' '}
          <button
            onClick={() => dispatch(openModal({ modal: 'REGISTER' }))}
            className="text-indigo-600 font-extrabold hover:underline"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
