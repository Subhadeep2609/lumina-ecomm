import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts, setFilter } from '../features/products/productSlice.js';
import ProductCard from '../features/products/ProductCard.jsx';
import { ProductSkeleton } from '../components/SkeletonLoader.jsx';
import { 
  Sparkles, ArrowRight, Truck, RefreshCw, ShieldCheck, CreditCard, 
  Flame, Tag, Layers, Star, Zap, Laptop, Smartphone, Headphones, 
  Watch, Shirt, Home as HomeIcon, CheckCircle2, UserCheck, MessageSquare, Gift
} from 'lucide-react';

const CATEGORY_CARDS = [
  { name: 'Mobiles', icon: Smartphone, count: '140+ Models', color: 'from-blue-500 to-indigo-600', query: 'Electronics' },
  { name: 'Laptops', icon: Laptop, count: '85+ Models', color: 'from-indigo-600 to-purple-600', query: 'Electronics' },
  { name: 'Audio', icon: Headphones, count: '95+ Products', color: 'from-purple-500 to-pink-600', query: 'Audio' },
  { name: 'Wearables', icon: Watch, count: '70+ Products', color: 'from-amber-500 to-orange-600', query: 'Accessories' },
  { name: 'Fashion', icon: Shirt, count: '220+ Styles', color: 'from-rose-500 to-red-600', query: 'Fashion' },
  { name: 'Home Setup', icon: HomeIcon, count: '160+ Items', color: 'from-emerald-500 to-teal-600', query: 'Home & Living' }
];

const BRANDS = ['Apple', 'Samsung', 'Sony', 'Nike', 'Adidas', 'HP', 'Dell', 'Lenovo', 'OnePlus', 'boAt', 'Canon', 'LG'];

const TESTIMONIALS = [
  {
    name: 'Sarah Jenkins',
    role: 'Verified Buyer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    comment: 'LuminaMarket delivered my Smartwatch Pro within 18 hours! Incredible packaging and authentic product quality.',
    rating: 5,
    product: 'Smartwatch Pro'
  },
  {
    name: 'David Chen',
    role: 'Tech Enthusiast',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    comment: 'Best deal on active noise cancelling headphones. Seamless checkout and prompt email updates.',
    rating: 5,
    product: 'Aura ANC Headphones'
  },
  {
    name: 'Elena Rostova',
    role: 'Frequent Shopper',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    comment: 'The buyer protection and return policy gave me 100% confidence. Will definitely shop here again!',
    rating: 5,
    product: 'Designer Wear'
  }
];

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products: productList, loading: productLoading } = useSelector((state) => state.products);

  const [activeTab, setActiveTab] = useState('All');
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  // Countdown timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const displayedProducts = productList || [];
  const heroImage = (displayedProducts.length > 0 && displayedProducts[0].images?.[0]?.url)
    ? displayedProducts[0].images[0].url
    : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';

  const filteredTrending = activeTab === 'All'
    ? displayedProducts.slice(0, 8)
    : displayedProducts.filter((p) => (p.category || '').toLowerCase().includes(activeTab.toLowerCase())).slice(0, 8);

  const handleBrandClick = (brand) => {
    dispatch(setFilter({ keyword: brand }));
    navigate('/products');
  };

  return (
    <div className="space-y-16 pb-20 pt-4 font-body">
      {/* Dynamic Hero Banner */}
      <section className="relative overflow-hidden bg-slate-900 rounded-3xl border border-slate-800 text-white p-8 md:p-14 shadow-2xl">
        {/* Background Decorative Glow Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl -z-0 pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* Left Column Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-xs font-black text-indigo-300 tracking-wider uppercase">
              <Sparkles size={14} className="text-amber-400 animate-spin" /> EXCLUSIVE TECH & LIFESTYLE DROPS
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-heading tracking-tight leading-tight">
                Next-Gen Shopping. <br />
                <span className="gradient-text">Unmatched Prices.</span>
              </h1>
              <p className="text-slate-100 text-sm md:text-base max-w-xl leading-relaxed font-medium">
                Discover flagship smartphones, high-fidelity audio, smart wearables, and urban essentials backed by Lumina 100% Buyer Guarantee.
              </p>
            </div>

            {/* Countdown Badge */}
            <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/80 backdrop-blur-md px-4 py-2.5 rounded-2xl w-fit">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Zap size={16} className="fill-amber-400" /> Flash Deal Countdown:
              </div>
              <div className="flex items-center gap-1 font-mono font-black text-xs text-white">
                <span className="bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">{String(timeLeft.hours).padStart(2, '0')}h</span> :
                <span className="bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">{String(timeLeft.minutes).padStart(2, '0')}m</span> :
                <span className="bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">{String(timeLeft.seconds).padStart(2, '0')}s</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/products"
                className="px-7 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold text-sm rounded-2xl transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95"
              >
                Shop Full Catalog <ArrowRight size={18} />
              </Link>
              <Link
                to="/products?category=Deals"
                className="px-7 py-4 bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700 font-extrabold text-sm rounded-2xl transition active:scale-95 flex items-center gap-2"
              >
                <Flame size={18} className="text-rose-500" /> Hot Deals
              </Link>
            </div>

            {/* Trust highlights */}
            <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-300 pt-4 border-t border-slate-800">
              <span className="flex items-center gap-1.5 text-emerald-400"><CheckCircle2 size={15} /> Free Shipping Over $50</span>
              <span className="flex items-center gap-1.5 text-indigo-300"><CheckCircle2 size={15} /> 30-Day Money Back</span>
              <span className="flex items-center gap-1.5 text-amber-400"><CheckCircle2 size={15} /> 100% Authentic</span>
            </div>
          </div>

          {/* Right Column Product Card Showcase */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md bg-gradient-to-b from-slate-800 to-slate-950 border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4 group">
              <div className="relative w-full h-72 rounded-2xl overflow-hidden bg-slate-900">
                <img
                  src={heroImage}
                  alt="Featured Flagship Product"
                  className="w-full h-full object-cover group-hover:scale-108 transition duration-700"
                />
                <div className="absolute top-3 left-3 bg-rose-600 text-white font-black text-xs px-3 py-1 rounded-xl shadow-lg flex items-center gap-1">
                  <Flame size={14} /> 35% OFF TODAY
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md text-emerald-400 font-extrabold text-xs px-3 py-1.5 rounded-xl border border-emerald-500/30">
                  ⚡ Express In Stock
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span className="font-bold text-indigo-400">FEATURED SPOTLIGHT</span>
                  <span className="flex items-center gap-1 text-amber-400 font-bold"><Star size={12} className="fill-amber-400" /> 4.9 (240+ reviews)</span>
                </div>
                <h3 className="text-lg font-black text-white font-heading truncate">
                  {displayedProducts.length > 0 ? displayedProducts[0].title : 'Aura ANC Wireless Headphones'}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl flex items-center gap-4 shadow-2xs hover:border-indigo-500/30 transition">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Truck size={24} />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 font-heading">Free Express Delivery</h4>
            <p className="text-xs text-slate-500 font-medium">Free shipping on orders over $50</p>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl flex items-center gap-4 shadow-2xs hover:border-indigo-500/30 transition">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <RefreshCw size={24} />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 font-heading">30-Day Easy Returns</h4>
            <p className="text-xs text-slate-500 font-medium">Hassle-free 100% money back</p>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl flex items-center gap-4 shadow-2xs hover:border-indigo-500/30 transition">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 font-heading">Verified Merchants</h4>
            <p className="text-xs text-slate-500 font-medium">100% authentic genuine items</p>
          </div>
        </div>
      </section>

      {/* Category Icons Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-black font-heading text-slate-900 tracking-tight">
              Shop by Category
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-medium">
              Explore our handpicked collection across major categories
            </p>
          </div>
          <Link to="/products" className="text-xs font-extrabold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            Browse All <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORY_CARDS.map((cat) => {
            const IconComp = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/products?category=${cat.query}`}
                className="p-5 bg-white border border-slate-200/80 rounded-2xl hover:border-indigo-500 hover:shadow-lg transition-all duration-300 text-center space-y-3 group"
              >
                <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center font-bold text-xl group-hover:scale-110 transition duration-300 shadow-md`}>
                  <IconComp size={26} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition font-heading">{cat.name}</h4>
                  <span className="text-[11px] text-slate-400 font-semibold block">{cat.count}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Flash Sale Spotlight Section */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Flame size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-black font-heading text-slate-900">Flash Sale Spotlight</h2>
              <p className="text-xs text-slate-500 font-medium">Limited stock available at deep discounts</p>
            </div>
          </div>
          <Link to="/products" className="text-xs font-extrabold text-indigo-600 hover:underline flex items-center gap-1">
            View All Flash Deals <ArrowRight size={14} />
          </Link>
        </div>

        {productLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {displayedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p._id || p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Trending Products Tabs Grid */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black font-heading text-slate-900 tracking-tight">
              Trending Products
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-medium">Top rated choices loved by thousands of shoppers</p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold text-slate-600">
            {['All', 'Electronics', 'Fashion', 'Home', 'Accessories'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activeTab === tab ? 'bg-white text-indigo-600 shadow-sm font-extrabold' : 'hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {productLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredTrending.map((p) => (
              <ProductCard key={p._id || p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Bento Grid Featured Collections */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-heading text-slate-900 tracking-tight">
            Featured Collections
          </h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium">Curated collections designed for your lifestyle</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Card 1 */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-between h-72 shadow-xl group">
            <div className="space-y-2 z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-400/20">
                AUDIO ESSENTIALS
              </span>
              <h3 className="text-2xl font-black font-heading">Immersive Sound Gear</h3>
              <p className="text-xs text-slate-300 max-w-xs font-normal">Active noise cancellation, studio clarity, 40h battery life.</p>
            </div>
            <button
              onClick={() => { dispatch(setFilter({ category: 'Audio' })); navigate('/products'); }}
              className="z-10 px-5 py-2.5 bg-white text-slate-950 font-extrabold text-xs rounded-xl w-fit flex items-center gap-1.5 hover:bg-indigo-50 transition"
            >
              Explore Audio <ArrowRight size={14} />
            </button>
            <div className="absolute right-[-20px] bottom-[-20px] w-48 h-48 opacity-25 group-hover:scale-110 transition duration-500 pointer-events-none">
              <Headphones size={180} />
            </div>
          </div>

          {/* Bento Card 2 */}
          <div className="bg-gradient-to-br from-purple-900 via-slate-900 to-slate-950 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-between h-72 shadow-xl group">
            <div className="space-y-2 z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-400/20">
                SMART WEARABLES
              </span>
              <h3 className="text-2xl font-black font-heading">Fitness & Smartwatches</h3>
              <p className="text-xs text-slate-300 max-w-xs font-normal">Track health, heart rate, workouts, and stay connected on the go.</p>
            </div>
            <button
              onClick={() => { dispatch(setFilter({ category: 'Accessories' })); navigate('/products'); }}
              className="z-10 px-5 py-2.5 bg-white text-slate-950 font-extrabold text-xs rounded-xl w-fit flex items-center gap-1.5 hover:bg-purple-50 transition"
            >
              Shop Watches <ArrowRight size={14} />
            </button>
            <div className="absolute right-[-20px] bottom-[-20px] w-48 h-48 opacity-25 group-hover:scale-110 transition duration-500 pointer-events-none">
              <Watch size={180} />
            </div>
          </div>

          {/* Bento Card 3 */}
          <div className="bg-gradient-to-br from-rose-900 via-slate-900 to-slate-950 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-between h-72 shadow-xl group">
            <div className="space-y-2 z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-400/20">
                URBAN FASHION
              </span>
              <h3 className="text-2xl font-black font-heading">Modern Apparel</h3>
              <p className="text-xs text-slate-300 max-w-xs font-normal">Premium cotton hoodies, sleek leather jackets, and streetwear.</p>
            </div>
            <button
              onClick={() => { dispatch(setFilter({ category: 'Fashion' })); navigate('/products'); }}
              className="z-10 px-5 py-2.5 bg-white text-slate-950 font-extrabold text-xs rounded-xl w-fit flex items-center gap-1.5 hover:bg-rose-50 transition"
            >
              View Fashion <ArrowRight size={14} />
            </button>
            <div className="absolute right-[-20px] bottom-[-20px] w-48 h-48 opacity-25 group-hover:scale-110 transition duration-500 pointer-events-none">
              <Shirt size={180} />
            </div>
          </div>
        </div>
      </section>

      {/* Verified Customer Reviews & Social Proof */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 text-white space-y-8 shadow-xl">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1 text-amber-400 text-xs font-extrabold">
            <Star size={14} className="fill-amber-400" />
            <Star size={14} className="fill-amber-400" />
            <Star size={14} className="fill-amber-400" />
            <Star size={14} className="fill-amber-400" />
            <Star size={14} className="fill-amber-400" />
            <span className="ml-1 text-white">4.9 / 5.0 Rating</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black font-heading tracking-tight">
            Loved by Thousands of Shoppers
          </h2>
          <p className="text-xs text-slate-400 font-medium">Real reviews from verified buyers who shop on LuminaMarket</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="p-6 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4 shadow-lg flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{t.comment}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-800/80">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30" />
                <div>
                  <h4 className="font-bold text-xs text-white flex items-center gap-1">
                    {t.name} <UserCheck size={12} className="text-emerald-400" />
                  </h4>
                  <p className="text-[10px] text-slate-400">{t.role} • {t.product}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by Brand Pills */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xs">
        <h2 className="text-xl md:text-2xl font-black font-heading text-slate-900 text-center tracking-tight">
          Featured Partner Brands
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 text-center">
          {BRANDS.map((brand) => (
            <div
              key={brand}
              onClick={() => handleBrandClick(brand)}
              className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-500/40 rounded-2xl font-extrabold text-xs text-slate-700 cursor-pointer transition hover:text-indigo-600 hover:scale-105 shadow-2xs"
            >
              {brand}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
