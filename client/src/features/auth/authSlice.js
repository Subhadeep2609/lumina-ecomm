import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiCall } from '../../utils/api';
import { showToast, openModal, closeModal } from '../ui/uiSlice';

// Clear legacy localStorage token from previous auth implementation
localStorage.removeItem('lumina_token');
const savedUser = localStorage.getItem('lumina_user') ? JSON.parse(localStorage.getItem('lumina_user')) : null;

// Async Thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const data = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      dispatch(showToast({ message: data.message, type: 'success' }));
      dispatch(openModal({ modal: 'VERIFY_EMAIL' }));
      return data;
    } catch (err) {
      dispatch(showToast({ message: err.message, type: 'error' }));
      return rejectWithValue(err.message);
    }
  }
);

export const verifyEmailUser = createAsyncThunk(
  'auth/verifyEmail',
  async ({ email, otp }, { dispatch, rejectWithValue }) => {
    try {
      const data = await apiCall('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email, otp })
      });
      localStorage.setItem('lumina_user', JSON.stringify(data.user));
      dispatch(showToast({ message: data.message, type: 'success' }));
      dispatch(closeModal());
      return data;
    } catch (err) {
      dispatch(showToast({ message: err.message, type: 'error' }));
      return rejectWithValue(err.message);
    }
  }
);

export const resendOtpUser = createAsyncThunk(
  'auth/resendOtp',
  async (email, { dispatch, rejectWithValue }) => {
    try {
      const data = await apiCall('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      dispatch(showToast({ message: data.message, type: 'success' }));
      return data;
    } catch (err) {
      dispatch(showToast({ message: err.message, type: 'error' }));
      return rejectWithValue(err.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      localStorage.setItem('lumina_user', JSON.stringify(data.user));
      dispatch(showToast({ message: data.message, type: 'success' }));
      dispatch(closeModal());
      return data;
    } catch (err) {
      if (err.data && err.data.needsVerification) {
        dispatch(showToast({ message: err.message, type: 'info' }));
        dispatch(openModal({ modal: 'VERIFY_EMAIL' }));
      } else {
        dispatch(showToast({ message: err.message, type: 'error' }));
      }
      return rejectWithValue(err.message);
    }
  }
);

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiCall('/auth/me');
      localStorage.setItem('lumina_user', JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      localStorage.removeItem('lumina_user');
      return rejectWithValue(err.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    try {
      await apiCall('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Backend logout response error:', err);
    } finally {
      dispatch(logout());
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { dispatch, rejectWithValue }) => {
    try {
      const data = await apiCall('/auth/update-profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
      localStorage.setItem('lumina_user', JSON.stringify(data.user));
      dispatch(showToast({ message: data.message || 'Profile updated successfully!', type: 'success' }));
      return data.user;
    } catch (err) {
      dispatch(showToast({ message: err.message, type: 'error' }));
      return rejectWithValue(err.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: savedUser,
    token: null,
    isAuthenticated: Boolean(savedUser),
    authChecked: false,
    pendingEmailVerification: null,
    loading: false,
    error: null,
    testOtp: null
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.authChecked = true;
      localStorage.removeItem('lumina_user');
      localStorage.removeItem('lumina_token');
    },
    setPendingVerificationEmail: (state, action) => {
      state.pendingEmailVerification = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingEmailVerification = action.payload.email;
        state.testOtp = action.payload.testOtp;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify Email
      .addCase(verifyEmailUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyEmailUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.authChecked = true;
        state.user = action.payload.user;
        state.token = null;
        state.pendingEmailVerification = null;
        state.testOtp = null;
      })
      .addCase(verifyEmailUser.rejected, (state, action) => {
        state.loading = false;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.authChecked = true;
        state.user = action.payload.user;
        state.token = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.authChecked = true;
      })
      .addCase(loadUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.authChecked = true;
      })
      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state) => {
        state.loading = false;
      });
  }
});

export const { logout, setPendingVerificationEmail } = authSlice.actions;
export default authSlice.reducer;
