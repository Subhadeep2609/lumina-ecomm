import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiCall } from '../../utils/api';
import { showToast, closeModal } from '../ui/uiSlice';

// Async Thunk: Fetch Products with dynamic combined filter/search/sort/pagination query string
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const { products } = getState();
      const { filters, page, limit } = products;

      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);

      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.category && filters.category !== 'All') params.append('category', filters.category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.inStock) params.append('inStock', 'true');
      if (filters.minRating) params.append('minRating', filters.minRating);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);

      const queryString = params.toString();
      const data = await apiCall(`/products?${queryString}`);
      return data;
    } catch (err) {
      dispatch(showToast({ message: err.message, type: 'error' }));
      return rejectWithValue(err.message);
    }
  }
);

// Async Thunk: Create Product (Seller / Admin)
export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { dispatch, rejectWithValue }) => {
    try {
      const data = await apiCall('/products', {
        method: 'POST',
        body: JSON.stringify(productData)
      });
      dispatch(showToast({ message: 'Product published successfully!', type: 'success' }));
      dispatch(closeModal());
      dispatch(fetchProducts());
      return data.product;
    } catch (err) {
      dispatch(showToast({ message: err.message, type: 'error' }));
      return rejectWithValue(err.message);
    }
  }
);

// Async Thunk: Update Product
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }, { dispatch, rejectWithValue }) => {
    try {
      const data = await apiCall(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
      });
      dispatch(showToast({ message: 'Product updated successfully!', type: 'success' }));
      dispatch(closeModal());
      dispatch(fetchProducts());
      return data.product;
    } catch (err) {
      dispatch(showToast({ message: err.message, type: 'error' }));
      return rejectWithValue(err.message);
    }
  }
);

// Async Thunk: Delete Product
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await apiCall(`/products/${id}`, { method: 'DELETE' });
      dispatch(showToast({ message: 'Product deleted successfully', type: 'success' }));
      dispatch(fetchProducts());
      return id;
    } catch (err) {
      dispatch(showToast({ message: err.message, type: 'error' }));
      return rejectWithValue(err.message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    totalProducts: 0,
    totalPages: 1,
    page: 1,
    limit: 8,
    filters: {
      keyword: '',
      category: 'All',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      minRating: '',
      sortBy: 'newest'
    },
    loading: false,
    error: null
  },
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1; // Reset to page 1 on filter update
    },
    resetFilters: (state) => {
      state.filters = {
        keyword: '',
        category: 'All',
        minPrice: '',
        maxPrice: '',
        inStock: false,
        minRating: '',
        sortBy: 'newest'
      };
      state.page = 1;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
      state.page = 1;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.totalProducts = action.payload.totalProducts;
        state.totalPages = action.payload.totalPages;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setFilter, resetFilters, setPage, setLimit } = productSlice.actions;
export default productSlice.reducer;
