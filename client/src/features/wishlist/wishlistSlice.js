import { createSlice } from '@reduxjs/toolkit';

const initialWishlist = JSON.parse(localStorage.getItem('lumina_wishlist')) || [];

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    wishlistItems: initialWishlist
  },
  reducers: {
    toggleWishlist: (state, action) => {
      const product = action.payload;
      const id = product._id || product.id;
      const index = state.wishlistItems.findIndex((item) => (item._id || item.id) === id);

      if (index >= 0) {
        state.wishlistItems.splice(index, 1);
      } else {
        state.wishlistItems.push(product);
      }
      localStorage.setItem('lumina_wishlist', JSON.stringify(state.wishlistItems));
    },
    removeFromWishlist: (state, action) => {
      const id = action.payload;
      state.wishlistItems = state.wishlistItems.filter((item) => (item._id || item.id) !== id);
      localStorage.setItem('lumina_wishlist', JSON.stringify(state.wishlistItems));
    },
    clearWishlist: (state) => {
      state.wishlistItems = [];
      localStorage.removeItem('lumina_wishlist');
    }
  }
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
