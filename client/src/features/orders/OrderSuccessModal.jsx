import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowRight, Sparkles, MapPin, Package } from 'lucide-react';

const OrderSuccessModal = ({ order, onClose }) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!order) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onClose) onClose();
          navigate('/products');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [order, navigate, onClose]);

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg animate-fadeIn font-body">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 space-y-6 text-center border border-slate-100 animate-scaleUp">
        {/* Celebration Animated Icon */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping"></div>
          <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30 relative">
            <CheckCircle2 size={48} className="animate-bounce" />
          </div>
        </div>

        {/* Header Text */}
        <div className="space-y-2">
          <span className="px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5">
            <Sparkles size={13} /> Payment & Order Confirmed
          </span>
          <h2 className="text-2xl md:text-3xl font-black font-heading text-slate-900 tracking-tight">
            Order Placed Successfully!
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Thank you for your purchase! We have received your order and are preparing it for shipment.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left text-xs space-y-2.5">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
            <span className="text-slate-500 font-bold">Order ID</span>
            <span className="font-mono font-black text-slate-900">{order._id || order.id || 'ORD-98231'}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-bold">Payment Method</span>
            <span className="font-extrabold text-emerald-600 flex items-center gap-1">
              ✓ Razorpay Verified
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-bold">Total Paid</span>
            <span className="font-black text-slate-900 font-heading text-sm">${order.totalPrice ? order.totalPrice.toFixed(2) : '750.00'}</span>
          </div>
        </div>

        {/* Live Redirect Countdown Banner */}
        <div className="p-3.5 bg-indigo-50 border border-indigo-200/70 rounded-2xl text-indigo-900 text-xs font-bold flex items-center justify-center gap-2">
          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-xs animate-pulse">
            {countdown}
          </span>
          <span>Redirecting to products page in {countdown} second{countdown !== 1 ? 's' : ''}...</span>
        </div>

        {/* Immediate Redirect Button */}
        <button
          onClick={() => {
            if (onClose) onClose();
            navigate('/products');
          }}
          className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition active:scale-95"
        >
          <ShoppingBag size={16} /> View Products Now <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default OrderSuccessModal;
