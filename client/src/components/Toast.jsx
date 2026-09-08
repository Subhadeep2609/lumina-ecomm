import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearToast } from '../features/ui/uiSlice';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = () => {
  const dispatch = useDispatch();
  const { toast } = useSelector((state) => state.ui);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        dispatch(clearToast());
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toast, dispatch]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="toast-container">
      <div className={`toast ${isSuccess ? 'toast-success' : isError ? 'toast-error' : ''}`}>
        {isSuccess && <CheckCircle size={20} color="#10b981" />}
        {isError && <AlertCircle size={20} color="#f43f5e" />}
        {!isSuccess && !isError && <Info size={20} color="#38bdf8" />}
        <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500 }}>{toast.message}</span>
        <button
          onClick={() => dispatch(clearToast())}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
