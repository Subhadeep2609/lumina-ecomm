import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmailUser, resendOtpUser } from './authSlice.js';
import { closeModal } from '../ui/uiSlice.js';
import { Mail, RefreshCw, X, ShieldCheck, ArrowRight } from 'lucide-react';

const VerifyEmail = () => {
  const dispatch = useDispatch();
  const { activeModal } = useSelector((state) => state.ui);
  const { pendingEmailVerification, loading } = useSelector((state) => state.auth);

  const [otp, setOtp] = useState('');

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
        className="modal-card max-w-md w-full bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center">
              <Mail size={20} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold font-heading text-gray-900">Verify Email OTP</h2>
              <p className="text-xs text-gray-500">Security code dispatched via Nodemailer</p>
            </div>
          </div>
          <button onClick={() => dispatch(closeModal())} className="p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 bg-cyan-50/50 border border-cyan-100 rounded-2xl space-y-1.5 text-xs">
          <div className="flex items-center gap-2 text-cyan-700 font-bold text-sm">
            <ShieldCheck size={16} />
            <span>Check Your Email Inbox</span>
          </div>
          <p className="text-gray-600 leading-relaxed">
            We sent a 6-digit verification code to <strong className="text-gray-900 font-mono">{emailToVerify}</strong>.
            Please copy the code from your email inbox and enter it below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block text-center">Enter 6-Digit Security OTP</label>
            <input
              type="text"
              required
              maxLength={6}
              className="w-full py-3 text-center text-2xl font-black tracking-[8px] bg-gray-50 border border-gray-200 rounded-2xl text-[#5B3DF5] outline-none focus:bg-white focus:border-[#5B3DF5] focus:ring-2 focus:ring-[#5B3DF5]/20 transition font-mono shadow-sm"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full py-3.5 bg-[#5B3DF5] hover:bg-[#4c31cf] text-white font-extrabold rounded-xl text-sm shadow-md shadow-[#5B3DF5]/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <span>{loading ? 'Verifying Code...' : 'Verify OTP & Activate Account'}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
          <span className="text-gray-500 font-medium">Didn't receive the code?</span>
          <button
            type="button"
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl flex items-center gap-1 transition"
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
