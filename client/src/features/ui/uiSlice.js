import { createSlice } from '@reduxjs/toolkit';

const initialTheme = localStorage.getItem('lumina_theme') || 'dark';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: initialTheme,
    toast: null, // { message, type: 'success' | 'error' | 'info' }
    activeModal: null, // 'LOGIN' | 'REGISTER' | 'VERIFY_EMAIL' | 'PRODUCT_DETAIL' | 'PRODUCT_FORM' | null
    selectedProductForEdit: null,
    selectedProductForView: null
  },
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('lumina_theme', action.payload);
      document.documentElement.setAttribute('data-theme', action.payload);
    },
    showToast: (state, action) => {
      state.toast = {
        id: Date.now(),
        message: action.payload.message,
        type: action.payload.type || 'info'
      };
    },
    clearToast: (state) => {
      state.toast = null;
    },
    openModal: (state, action) => {
      state.activeModal = action.payload.modal;
      if (action.payload.product) {
        state.selectedProductForEdit = action.payload.product;
        state.selectedProductForView = action.payload.product;
      }
    },
    closeModal: (state) => {
      state.activeModal = null;
      state.selectedProductForEdit = null;
      state.selectedProductForView = null;
    }
  }
});

export const { setTheme, showToast, clearToast, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;
