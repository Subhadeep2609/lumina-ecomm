import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilter, resetFilters, fetchProducts } from './productSlice.js';
import { Filter, RotateCcw, Check, Star, Truck } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Electronics',
  'Audio',
  'Fashion',
  'Home & Living',
  'Gadgets',
  'Books',
  'Accessories'
];

const FilterSidebar = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.products);

  const handleCategorySelect = (category) => {
    dispatch(setFilter({ category }));
    dispatch(fetchProducts());
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    dispatch(setFilter({ [name]: value }));
  };

  const handleApplyPrice = () => {
    dispatch(fetchProducts());
  };

  const handleInStockToggle = (e) => {
    dispatch(setFilter({ inStock: e.target.checked }));
    dispatch(fetchProducts());
  };

  const handleRatingSelect = (rating) => {
    dispatch(setFilter({ minRating: rating }));
    dispatch(fetchProducts());
  };

  const handleReset = () => {
    dispatch(resetFilters());
    dispatch(fetchProducts());
  };

  return (
    <aside className="w-full space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-5 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2 font-extrabold text-sm text-gray-900 font-heading">
            <Filter size={16} className="text-[#5B3DF5]" />
            <span>Filters</span>
          </div>
          <button
            onClick={handleReset}
            className="text-xs text-rose-600 hover:underline font-bold flex items-center gap-1"
          >
            <RotateCcw size={12} /> Clear All
          </button>
        </div>

        {/* Category Selector */}
        <div className="space-y-2">
          <span className="text-xs font-black text-slate-900 block font-heading uppercase tracking-wider">Category</span>
          <div className="space-y-1">
            {CATEGORIES.map((cat) => {
              const isSelected = (filters.category || 'All') === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition text-left ${
                    isSelected
                      ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 font-extrabold shadow-2xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat}</span>
                  {isSelected && <Check size={14} className="text-indigo-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <span className="text-xs font-black text-slate-900 block font-heading uppercase tracking-wider">Price Range ($)</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              name="minPrice"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 transition font-bold"
              placeholder="Min $"
              value={filters.minPrice}
              onChange={handlePriceChange}
            />
            <span className="text-slate-400 font-bold">-</span>
            <input
              type="number"
              name="maxPrice"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 transition font-bold"
              placeholder="Max $"
              value={filters.maxPrice}
              onChange={handlePriceChange}
            />
          </div>
          <button
            onClick={handleApplyPrice}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-extrabold text-white rounded-xl shadow-sm transition"
          >
            Apply Price Filter
          </button>
        </div>

        {/* In Stock Availability */}
        <div className="pt-3 border-t border-slate-100">
          <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={handleInStockToggle}
              className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
            />
            <Truck size={14} className="text-emerald-600" />
            <span>Exclude Out of Stock</span>
          </label>
        </div>

        {/* Customer Ratings Filter */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <span className="text-xs font-black text-slate-900 block font-heading uppercase tracking-wider">Customer Ratings</span>
          <div className="space-y-1">
            {[
              { label: 'All Ratings', value: '' },
              { label: '4★ & above', value: '4.0' },
              { label: '3★ & above', value: '3.0' }
            ].map((r) => (
              <button
                key={r.value}
                onClick={() => handleRatingSelect(r.value)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  (filters.minRating || '') === r.value
                    ? 'bg-amber-50 text-amber-800 border border-amber-200 font-extrabold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Star size={13} className="fill-amber-400 text-amber-400" />
                <span>{r.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
