import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts, setFilter } from './productSlice.js';
import ProductCard from './ProductCard.jsx';
import FilterSidebar from './FilterSidebar.jsx';
import { ProductSkeleton } from '../../components/SkeletonLoader.jsx';
import { openModal } from '../ui/uiSlice.js';
import { Sparkles, Grid, ArrowUpDown, PackageOpen, PlusCircle, ShieldCheck, Truck, RefreshCw, CreditCard, Award, Filter, SlidersHorizontal } from 'lucide-react';

const ProductList = () => {
  const dispatch = useDispatch();
  const { products, loading, filters, totalProducts } = useSelector((state) => state.products);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch, filters.category, filters.sort, filters.page]);

  const handleSortChange = (e) => {
    dispatch(setFilter({ sort: e.target.value }));
    dispatch(fetchProducts());
  };

  const isSellerOrAdmin = isAuthenticated && user && (user.role === 'admin' || user.role === 'seller');

  const activeFilterCount =
    (filters.category && filters.category !== 'All' ? 1 : 0) +
    (filters.keyword ? 1 : 0) +
    (filters.minPrice || filters.maxPrice ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.minRating ? 1 : 0);

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 pt-1 sm:pt-2 font-body">
      {/* Authentic E-Commerce Catalog Header Banner */}
      <section className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-8 md:p-10 shadow-xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-[11px] sm:text-xs font-black text-indigo-300 uppercase tracking-wider">
            <Sparkles size={13} className="text-amber-400" /> EXPLORE MARKETPLACE CATALOG
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-heading tracking-tight leading-tight">
            Discover Premium Products & <span className="gradient-text">Exclusive Offers</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-100 leading-relaxed max-w-2xl font-medium">
            Shop authentic smartphones, laptops, high-end audio gear, wearables, and apparel from verified LuminaMarket merchants with express delivery.
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-bold pt-1">
            <span className="px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl text-emerald-400 flex items-center gap-1.5">
              <Truck size={14} /> Free Express Delivery
            </span>
            <span className="px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl text-indigo-300 flex items-center gap-1.5">
              <Award size={14} /> Lumina Buyer Guarantee
            </span>
            <span className="px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl text-amber-400 flex items-center gap-1.5">
              <RefreshCw size={14} /> 30-Day Money Back
            </span>
          </div>
        </div>
      </section>

      {/* Main Grid & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 items-start">
        {/* Desktop Filter Sidebar (Left Column: hidden on mobile/tablet, shown on desktop) */}
        <div className="hidden lg:block lg:col-span-1 sticky top-24">
          <FilterSidebar />
        </div>

        {/* Product Catalog Grid (Right Column on desktop, full width on mobile/tablet) */}
        <div className="col-span-1 lg:col-span-3 space-y-5">
          {/* Controls Bar: Results Count, Mobile Filter Trigger & Sorting */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              {/* Mobile/Tablet Filter Trigger Button */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-extrabold active:scale-95 transition"
              >
                <Filter size={14} className="text-indigo-600" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Grid size={15} className="text-indigo-600 hidden sm:inline-block" />
                <span>
                  Showing <strong className="text-slate-900 font-extrabold">{totalProducts || products.length}</strong> products
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-bold hidden sm:flex items-center gap-1">
                <ArrowUpDown size={14} /> Sort By:
              </span>
              <select
                className="bg-slate-50 border border-slate-200 text-slate-900 font-extrabold text-xs px-2.5 sm:px-3.5 py-2 rounded-xl outline-none focus:border-indigo-600 cursor-pointer"
                value={filters.sort || '-createdAt'}
                onChange={handleSortChange}
                aria-label="Sort products by"
              >
                <option value="-createdAt">Newest Arrivals</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <ProductSkeleton />
              <ProductSkeleton />
              <ProductSkeleton />
              <ProductSkeleton />
              <ProductSkeleton />
              <ProductSkeleton />
            </div>
          ) : products.length === 0 ? (
            /* Empty State */
            <div className="py-16 text-center bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xs">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-200/60">
                <PackageOpen size={36} />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-xl font-extrabold text-slate-900 font-heading">No Products Found</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  We couldn't find any products matching your current search parameters or category filter. Try clearing filters!
                </p>
              </div>

              {isSellerOrAdmin ? (
                <button
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold text-xs rounded-xl shadow-md inline-flex items-center gap-2 transition"
                  onClick={() => dispatch(openModal({ modal: 'PRODUCT_FORM' }))}
                >
                  <PlusCircle size={16} /> Add Product
                </button>
              ) : (
                <button
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md inline-flex items-center gap-2 transition"
                  onClick={() => dispatch(setFilter({ category: 'All', keyword: '' }))}
                >
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            /* Product Cards Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {products.map((p) => (
                <ProductCard key={p._id || p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Off-Canvas Slide-Over Mobile & Tablet Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-[100] flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs sm:max-w-sm bg-white h-full shadow-2xl z-10 overflow-y-auto animate-slide-left p-4">
            <FilterSidebar isMobileDrawer onCloseMobile={() => setMobileFilterOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
