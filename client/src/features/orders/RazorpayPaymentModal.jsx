import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal, showToast } from '../ui/uiSlice.js';
import { checkoutRazorpayOrder } from './orderSlice.js';
import { X, CreditCard, ShieldCheck, Lock, Smartphone, Building2, Check, ArrowRight, Sparkles } from 'lucide-react';

const RazorpayPaymentModal = ({ shippingAddress, totalAmount, onSuccess }) => {
  const dispatch = useDispatch();
  const { activeModal } = useSelector((state) => state.ui);
  const { loading } = useSelector((state) => state.orders);

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'upi' | 'netbanking'
  const [upiId, setUpiId] = useState('alex@okaxis');
  const [selectedBank, setSelectedBank] = useState('hdfc');
  const [cardDetails, setCardDetails] = useState({
    number: '4111 1111 1111 1111',
    expiry: '12/30',
    cvv: '123',
    name: shippingAddress?.fullName || 'Alex Vance'
  });

  if (activeModal !== 'RAZORPAY_PAYMENT') return null;

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    try {
      const resultAction = await dispatch(checkoutRazorpayOrder({ shippingAddress })).unwrap();
      dispatch(closeModal());
      if (onSuccess) {
        onSuccess(resultAction);
      }
    } catch (err) {
      dispatch(showToast({ message: 'Payment processing failed: ' + (err || 'Unknown error'), type: 'error' }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn font-body">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-scaleUp max-h-[94vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Razorpay Authentic Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-4 sm:p-6 relative">
          <button
            onClick={() => dispatch(closeModal())}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-xl tracking-tighter">
              <span className="text-blue-300 font-serif">R</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-200 block">Razorpay Secure Checkout</span>
              <h2 className="text-lg sm:text-xl font-black font-heading text-white">LuminaMarket Store</h2>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-blue-200 font-medium">Total Amount Payable</span>
            <span className="text-xl sm:text-2xl font-black text-white font-heading">${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Methods Tabs */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div className="flex rounded-2xl bg-slate-100 p-1 font-extrabold text-[11px] sm:text-xs">
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
                paymentMethod === 'card' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard size={15} /> Card
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('upi')}
              className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
                paymentMethod === 'upi' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone size={15} /> UPI / GPay
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('netbanking')}
              className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition ${
                paymentMethod === 'netbanking' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 size={15} /> Net Banking
            </button>
          </div>

          {/* Card Form */}
          {paymentMethod === 'card' && (
            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Card Number (Dummy Test Card)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    Visa
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Cardholder Name</label>
                <input
                  type="text"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                />
              </div>
            </div>
          )}

          {/* UPI Form */}
          {paymentMethod === 'upi' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-extrabold">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 transition">
                  <span className="block text-indigo-600 text-sm">GPay</span>
                  <span className="text-[10px] text-slate-400 font-medium">Instant</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 transition">
                  <span className="block text-purple-600 text-sm">PhonePe</span>
                  <span className="text-[10px] text-slate-400 font-medium">Instant</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 transition">
                  <span className="block text-blue-600 text-sm">Paytm</span>
                  <span className="text-[10px] text-slate-400 font-medium">Instant</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">UPI ID / VPA</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. username@okaxis"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                />
              </div>
            </div>
          )}

          {/* Netbanking Form */}
          {paymentMethod === 'netbanking' && (
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Select Popular Bank</label>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((bank) => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() => setSelectedBank(bank)}
                    className={`p-3 rounded-xl border text-left transition ${
                      selectedBank === bank ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-extrabold' : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    {bank}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Security Banner */}
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200/60 rounded-xl text-emerald-700 text-xs font-semibold">
            <Lock size={15} className="shrink-0" />
            <span>256-bit SSL Encrypted & Secured by Razorpay Payment Gateway</span>
          </div>

          {/* Action Submit Button */}
          <button
            onClick={handleSubmitPayment}
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Processing Payment...
              </span>
            ) : (
              <>
                <ShieldCheck size={16} /> Pay ${totalAmount.toFixed(2)} via Razorpay <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RazorpayPaymentModal;
