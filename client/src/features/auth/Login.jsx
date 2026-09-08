import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, loadUser } from './authSlice.js';
import { closeModal, openModal, showToast } from '../ui/uiSlice.js';
import { apiCall } from '../../utils/api.js';
import { Mail, Lock, X, Sparkles, ArrowRight, UserCheck, Store, Shield, KeyRound, Loader2, CheckCircle2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import GoogleAuthButton from '../../components/GoogleAuthButton.jsx';

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
  const [isAdminMode, setIsAdminMode] = useState(false);

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
    setIsAdminMode(false);
    setIsForgotPassword(false);
    setResetStep(1);
    dispatch(closeModal());
  };

  useEffect(() => {
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
        className="modal-card max-w-[440px] w-full mx-auto bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 font-body"
        style={{ maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md ${
                isAdminMode
                  ? 'bg-gradient-to-tr from-amber-600 to-rose-600 shadow-amber-500/20'
                  : isForgotPassword
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 shadow-emerald-500/20'
                  : 'bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-indigo-500/20'
              }`}
            >
              {isAdminMode ? <Shield size={20} /> : isForgotPassword ? <KeyRound size={20} /> : <Sparkles size={20} />}
            </div>
            <div>
              <h2 className="text-xl font-black font-heading text-slate-900 leading-tight">
                {isAdminMode
                  ? 'Admin Portal'
                  : isForgotPassword
                  ? 'Reset Password'
                  : 'Welcome Back'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isAdminMode
                  ? 'Administrative access & controls'
                  : isForgotPassword
                  ? resetStep === 1
                    ? 'Enter email for password reset OTP'
                    : 'Enter 6-digit OTP code & new password'
                  : 'Sign in to access your account'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            aria-label="Close modal"
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
                      placeholder="you@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold rounded-xl text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {resetLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                  <span>{resetLoading ? 'Sending OTP Code...' : 'Send Verification OTP'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
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
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {resetLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  <span>{resetLoading ? 'Updating Password...' : 'Save Password & Sign In'}</span>
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
                className="text-xs font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={14} /> Back to Sign In
              </button>
            </div>
          </div>
        ) : (
          /* REGULAR LOGIN FLOW */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Options: Discreet Admin vs Buyer/Seller */}
            {isAdminMode ? (
              <div className="flex items-center justify-between p-2.5 bg-amber-50/80 border border-amber-200 rounded-2xl">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <Shield size={16} className="text-amber-600" />
                  <span>Admin Access Mode</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminMode(false);
                    setFormData({ ...formData, role: 'user' });
                  }}
                  className="text-[11px] font-bold text-amber-700 hover:text-amber-900 hover:underline cursor-pointer"
                >
                  Switch to Buyer
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block font-heading">Sign In Role Option</label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'user' })}
                    className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      formData.role === 'user'
                        ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UserCheck size={14} /> <span>Buyer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'seller' })}
                    className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      formData.role === 'seller'
                        ? 'bg-white text-purple-600 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Store size={14} /> <span>Seller</span>
                  </button>
                </div>
              </div>
            )}

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
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
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
              className={`w-full py-3 text-white font-extrabold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer ${
                isAdminMode
                  ? 'bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 shadow-amber-600/20'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-indigo-600/20'
              }`}
            >
              <span>{loading ? 'Authenticating...' : isAdminMode ? 'Sign In as Admin' : 'Sign In'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>

            {/* Google OAuth Section */}
            {!isAdminMode && (
              <>
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200/90"></div>
                  </div>
                  <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                    <span className="bg-white px-3 text-slate-400 font-bold">Or continue with</span>
                  </div>
                </div>

                <GoogleAuthButton role={formData.role || 'user'} />
              </>
            )}
          </form>
        )}

        {/* Footer */}
        <div className="space-y-2 pt-2 border-t border-slate-100 text-center">
          <div className="text-xs text-slate-500 font-medium">
            Don't have an account?{' '}
            <button
              onClick={() => dispatch(openModal({ modal: 'REGISTER' }))}
              className="text-indigo-600 font-extrabold hover:underline cursor-pointer"
            >
              Create an Account
            </button>
          </div>

          {/* Discreet Admin Portal Link */}
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={() => {
                const nextAdmin = !isAdminMode;
                setIsAdminMode(nextAdmin);
                setFormData((prev) => ({ ...prev, role: nextAdmin ? 'admin' : 'user' }));
              }}
              className="text-[11px] text-slate-400 hover:text-slate-600 transition flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              <Shield size={12} className={isAdminMode ? 'text-amber-600' : 'text-slate-400'} />
              <span>{isAdminMode ? 'Back to Buyer Sign In' : 'Admin Portal'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
