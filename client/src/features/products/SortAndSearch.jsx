import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilter, fetchProducts, resetFilters } from './productSlice';
import { ArrowUpDown, SlidersHorizontal, X } from 'lucide-react';

const SORT_OPTIONS = [
  { label: 'Newest Arrivals', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Highest Rated', value: 'rating_desc' },
  { label: 'Alphabetical: A-Z', value: 'name_asc' },
  { label: 'Oldest First', value: 'oldest' }
];

const SortAndSearch = () => {
  const dispatch = useDispatch();
  const { filters, totalProducts, page, limit } = useSelector((state) => state.products);

  const handleSortChange = (e) => {
    dispatch(setFilter({ sortBy: e.target.value }));
    dispatch(fetchProducts());
  };

  const activeFilterTags = [];
  if (filters.keyword) activeFilterTags.push({ key: 'keyword', label: `Search: "${filters.keyword}"` });
  if (filters.category && filters.category !== 'All') activeFilterTags.push({ key: 'category', label: `Category: ${filters.category}` });
  if (filters.minPrice || filters.maxPrice) activeFilterTags.push({ key: 'price', label: `Price: $${filters.minPrice || 0} - $${filters.maxPrice || '∞'}` });
  if (filters.inStock) activeFilterTags.push({ key: 'inStock', label: 'In Stock Only' });
  if (filters.minRating) activeFilterTags.push({ key: 'minRating', label: `Rating: ${filters.minRating}+ Stars` });

  const removeSingleFilter = (key) => {
    if (key === 'keyword') dispatch(setFilter({ keyword: '' }));
    if (key === 'category') dispatch(setFilter({ category: 'All' }));
    if (key === 'price') dispatch(setFilter({ minPrice: '', maxPrice: '' }));
    if (key === 'inStock') dispatch(setFilter({ inStock: false }));
    if (key === 'minRating') dispatch(setFilter({ minRating: '' }));
    dispatch(fetchProducts());
  };

  return (
    <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: 'var(--bg-card)', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Showing <strong style={{ color: 'var(--text-main)' }}>{totalProducts}</strong> products matching current parameters
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            <ArrowUpDown size={16} color="#6366f1" />
            <span>Sort By:</span>
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', height: '38px', padding: '0 2rem 0 0.75rem', fontSize: '0.875rem' }}
            value={filters.sortBy}
            onChange={handleSortChange}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filter Tags */}
      {activeFilterTags.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Active Filters:</span>
          {activeFilterTags.map((tag) => (
            <span
              key={tag.key}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid var(--accent-primary)',
                color: 'var(--text-main)',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              {tag.label}
              <X
                size={12}
                style={{ cursor: 'pointer', color: 'var(--accent-rose)' }}
                onClick={() => removeSingleFilter(tag.key)}
              />
            </span>
          ))}
          <button
            onClick={() => {
              dispatch(resetFilters());
              dispatch(fetchProducts());
            }}
            style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export default SortAndSearch;
