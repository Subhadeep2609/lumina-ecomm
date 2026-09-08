import React from 'react';
import { useDispatch } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import { googleAuthUser } from '../features/auth/authSlice.js';
import { showToast } from '../features/ui/uiSlice.js';

const GoogleAuthButton = ({ role = 'user' }) => {
  const dispatch = useDispatch();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleSuccess = (credentialResponse) => {
    if (credentialResponse?.credential) {
      dispatch(googleAuthUser({ credential: credentialResponse.credential, role }));
    } else {
      dispatch(showToast({ message: 'Google credential missing from response', type: 'error' }));
    }
  };

  const handleError = () => {
    dispatch(showToast({ message: 'Google sign-in was cancelled or encountered an error', type: 'error' }));
  };

  // Graceful fallback button if VITE_GOOGLE_CLIENT_ID is not yet configured in .env
  if (!clientId || clientId === 'dummy_client_id_for_preview') {
    return (
      <button
        type="button"
        onClick={() =>
          dispatch(
            showToast({
              message: 'Google Client ID not set in .env. Please configure VITE_GOOGLE_CLIENT_ID.',
              type: 'info'
            })
          )
        }
        className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 flex items-center justify-center gap-3 transition shadow-xs hover:border-slate-300 active:scale-[0.99]"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>
    );
  }

  return (
    <div className="w-full flex justify-center google-auth-container">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        theme="outline"
        size="large"
        shape="pill"
        text="continue_with"
        width="380"
      />
    </div>
  );
};

export default GoogleAuthButton;
