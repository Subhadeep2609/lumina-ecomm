import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmailUser, resendOtpUser } from './authSlice.js';
import { closeModal } from '../ui/uiSlice.js';
import { Mail, RefreshCw, X, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

const VerifyEmail = () => {
  const dispatch = useDispatch();
  const { activeModal } = useSelector((state) => state.ui);
  const { pendingEmailVerification, loading } = useSelector((state) => state.auth);

  const [otp, setOtp] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeModal === 'VERIFY_EMAIL') {
        dispatch(closeModal());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, dispatch]);

  if (activeModal !== 'VERIFY_EMAIL') return null;

  const emailToVerify = pendingEmailVerification || 'your_email@domain.com';

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(verifyEmailUser({ email: emailToVerify, otp }));
  };

  const handleResend = () => {
    dispatch(resendOtpUser(emailToVerify));
  };

  return (
    <div className="modal-overlay" onClick={() => dispatch(closeModal())}>
      <div
        className="modal-card max-w-[440px] w-full mx-auto bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 font-body"
        style={{ maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Mail size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black font-heading text-slate-900 leading-tight">Verify Email OTP</h2>
              <p className="text-xs text-slate-500 font-medium">Enter the 6-digit code sent to your inbox</p>
            </div>
          </div>
          <button
            onClick={() => dispatch(closeModal())}
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-1 text-xs">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
            <ShieldCheck size={16} />
            <span>Check Your Email Inbox</span>
          </div>
          <p className="text-slate-600 leading-relaxed font-medium">
            We sent a 6-digit verification code to <strong className="text-slate-900 font-semibold">{emailToVerify}</strong>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block text-center">6-Digit Verification OTP</label>
            <input
              type="text"
              required
              maxLength={6}
              className="w-full py-3 text-center text-2xl font-mono font-black tracking-[8px] bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition shadow-xs"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold rounded-xl text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            <span>{loading ? 'Verifying Code...' : 'Verify OTP & Activate Account'}</span>
          </button>
        </form>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">Didn't receive the code?</span>
          <button
            type="button"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            onClick={handleResend}
          >
            <RefreshCw size={13} /> Resend OTP Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
