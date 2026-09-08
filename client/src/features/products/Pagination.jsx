import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPage, setLimit, fetchProducts } from './productSlice';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = () => {
  const dispatch = useDispatch();
  const { page, totalPages, totalProducts, limit } = useSelector((state) => state.products);

  if (totalProducts === 0) return null;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(setPage(newPage));
      dispatch(fetchProducts());
    }
  };

  const handleLimitChange = (e) => {
    dispatch(setLimit(Number(e.target.value)));
    dispatch(fetchProducts());
  };

  // Generate page numbers array
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination-container">
      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Page <strong style={{ color: 'var(--text-main)' }}>{page}</strong> of <strong>{totalPages}</strong>
      </div>

      {/* Page Number Buttons */}
      <div className="pagination-pages">
        <button
          className="page-btn"
          disabled={page === 1}
          onClick={() => handlePageChange(page - 1)}
          title="Previous Page"
        >
          <ChevronLeft size={18} />
        </button>

        {pages.map((p) => (
          <button
            key={p}
            className={`page-btn ${p === page ? 'active' : ''}`}
            onClick={() => handlePageChange(p)}
          >
            {p}
          </button>
        ))}

        <button
          className="page-btn"
          disabled={page === totalPages}
          onClick={() => handlePageChange(page + 1)}
          title="Next Page"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Items Per Page Limit Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <span>Per Page:</span>
        <select
          className="form-select"
          style={{ width: 'auto', padding: '0.2rem 1.8rem 0.2rem 0.6rem', fontSize: '0.85rem' }}
          value={limit}
          onChange={handleLimitChange}
        >
          <option value={4}>4</option>
          <option value={8}>8</option>
          <option value={12}>12</option>
          <option value={16}>16</option>
        </select>
      </div>
    </div>
  );
};

export default Pagination;
