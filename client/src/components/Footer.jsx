import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { showToast } from '../features/ui/uiSlice.js';
import { apiCall } from '../utils/api.js';
import { Sparkles, ShieldCheck, Truck, RefreshCw, CreditCard, Headphones, Send, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const dispatch = useDispatch();
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    try {
      const res = await apiCall('/auth/newsletter', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      setSubscribed(true);
      setEmail('');
      dispatch(showToast({ message: res.message || 'VIP Membership Activated! Promo code LUMINA15 sent.', type: 'success' }));
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Subscription failed', type: 'error' }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-20 md:pb-12 px-4 mt-20 text-xs border-t border-slate-800 font-body">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Top Newsletter Strip */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-3xl p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />

          <div className="space-y-1 text-center lg:text-left relative z-10">
            <h3 className="text-xl md:text-2xl font-black text-white font-heading tracking-tight drop-shadow-sm">
              Join Lumina VIP Market Club
            </h3>
            <p className="text-slate-200 text-xs font-normal max-w-lg">
              Get secret 15% discount promo codes (`LUMINA15`), flash sale alerts, and exclusive tech drops delivered straight to your inbox.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex items-center gap-2 max-w-md relative z-10">
            {subscribed ? (
              <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 px-5 py-3.5 rounded-2xl flex items-center gap-2 font-bold text-xs shadow-md">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <span>VIP Membership Activated! Code <strong>LUMINA15</strong> sent to your inbox.</span>
              </div>
            ) : (
              <div className="flex w-full bg-slate-900/90 border border-slate-700/90 rounded-2xl p-1.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition shadow-inner">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="bg-transparent px-3 py-2 text-white placeholder-slate-400 outline-none text-xs w-full font-medium"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Subscribing...
                    </>
                  ) : (
                    <>
                      Subscribe <Send size={13} />
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Multi-column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pt-4">
          {/* Column 1 & 2: Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5 text-xl font-extrabold font-heading text-white">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
                <Sparkles size={20} />
              </div>
              <span>Lumina<span className="text-indigo-400">Market</span></span>
            </div>
            <p className="text-slate-400 leading-relaxed font-normal max-w-sm">
              The premier next-generation marketplace. Curating authentic top-tier electronics, wearables, smart audio, and designer lifestyle products with instant express delivery.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-300 font-bold">
              <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-emerald-400 flex items-center gap-1.5">
                <Truck size={13} /> Free Express Shipping
              </span>
              <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-indigo-400 flex items-center gap-1.5">
                <ShieldCheck size={13} /> 100% Genuine Guarantee
              </span>
            </div>
          </div>

          {/* Column 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-white font-heading">Explore Catalog</h4>
            <ul className="space-y-2.5 font-medium">
              <li><Link to="/products" className="hover:text-indigo-400 transition flex items-center gap-1">Products Marketplace</Link></li>
              <li><Link to="/products?category=Electronics" className="hover:text-indigo-400 transition">Smart Electronics</Link></li>
              <li><Link to="/products?category=Audio" className="hover:text-indigo-400 transition">High-Fidelity Audio</Link></li>
              <li><Link to="/products?category=Wearables" className="hover:text-indigo-400 transition">Wearables & Watches</Link></li>
              <li><Link to="/products?category=Fashion" className="hover:text-indigo-400 transition">Urban Fashion</Link></li>
            </ul>
          </div>

          {/* Column 4: Platform & Support */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-white font-heading">Support & Info</h4>
            <ul className="space-y-2.5 font-medium">
              <li><Link to="/about" className="hover:text-indigo-400 transition">Platform Specs & Tech Stack</Link></li>
              <li><Link to="/cart" className="hover:text-indigo-400 transition">Shopping Bag & Checkout</Link></li>
              <li><Link to="/wishlist" className="hover:text-indigo-400 transition">Saved Wishlist</Link></li>
              <li><Link to="/orders" className="hover:text-indigo-400 transition">Track Active Orders</Link></li>
              <li><Link to="/seller/orders" className="hover:text-amber-400 text-amber-300 transition">Merchant Portal</Link></li>
            </ul>
          </div>

          {/* Column 5: Payment Security & Contact */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-white font-heading">Payment & Security</h4>
            <p className="text-slate-400 leading-relaxed font-normal">
              Encrypted 256-bit SSL transaction processing with instant refund protection.
            </p>
            <div className="pt-1 flex flex-wrap gap-2 text-[10px] font-bold text-slate-300">
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg">VISA</span>
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg">MasterCard</span>
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg">Apple Pay</span>
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg">PayPal</span>
              <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg">Stripe</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} LuminaMarket Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Security Audit</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
