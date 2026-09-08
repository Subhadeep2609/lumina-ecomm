import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Truck, ArrowRight } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 pt-4 px-4 font-body">
      {/* Hero Header */}
      <div className="text-center space-y-4 py-12 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-xs font-black text-indigo-300 uppercase tracking-wider relative z-10">
          <Sparkles size={14} className="text-amber-400" /> ABOUT LUMINAMARKET
        </div>
        <h1 className="text-3xl md:text-5xl font-black font-heading tracking-tight relative z-10 text-white">
          Reinventing How the World <span className="gradient-text">Shops Online</span>
        </h1>
        <p className="text-sm md:text-base text-slate-100 max-w-2xl mx-auto leading-relaxed font-medium relative z-10">
          LuminaMarket connects thousands of shoppers with verified merchant sellers, authentic product catalogs, transparent pricing, and instant express delivery.
        </p>
      </div>

      {/* Impact Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-1">
          <h3 className="text-3xl font-black text-indigo-600 font-heading">1M+</h3>
          <p className="text-xs font-black text-slate-800">Happy Shoppers</p>
        </div>
        <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-1">
          <h3 className="text-3xl font-black text-amber-500 font-heading">50,000+</h3>
          <p className="text-xs font-black text-slate-800">Verified Products</p>
        </div>
        <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-1">
          <h3 className="text-3xl font-black text-emerald-600 font-heading">99.8%</h3>
          <p className="text-xs font-black text-slate-800">On-Time Express Delivery</p>
        </div>
        <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-1">
          <h3 className="text-3xl font-black text-purple-600 font-heading">4.9 ★</h3>
          <p className="text-xs font-black text-slate-800">Customer Rating</p>
        </div>
      </div>

      {/* Core Promises */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black font-heading text-slate-900">Why Millions Trust LuminaMarket</h2>
          <p className="text-xs text-slate-500 font-medium">Built around quality, security, and customer delight</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white border border-slate-200/90 rounded-3xl space-y-3 shadow-2xs flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <ShieldCheck size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-base text-slate-900 font-heading">100% Genuine Guarantee</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                We partner directly with verified merchant sellers to ensure every product shipped is 100% authentic with zero counterfeit items.
              </p>
            </div>
          </div>

          <div className="p-6 bg-white border border-slate-200/90 rounded-3xl space-y-3 shadow-2xs flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
              <Truck size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-base text-slate-900 font-heading">Free Express Shipping</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Our logistics network provides fast express shipping on all orders over $50 with real-time package tracking.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Banner */}
      <div className="p-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl text-white space-y-4 text-center shadow-xl">
        <h2 className="text-2xl md:text-3xl font-black font-heading">Ready to Experience Smarter Shopping?</h2>
        <p className="text-xs md:text-sm text-indigo-100 max-w-lg mx-auto font-medium">
          Discover thousands of verified products or start selling on LuminaMarket's next-generation platform.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link
            to="/products"
            className="px-7 py-3.5 bg-white text-slate-950 font-extrabold text-xs rounded-2xl hover:bg-indigo-50 transition shadow-md inline-flex items-center gap-2 active:scale-95"
          >
            Browse Products Catalog <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
