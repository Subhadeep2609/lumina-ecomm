import React from 'react';

const LoadingSpinner = ({ label = 'Loading products & assets...' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', width: '100%' }}>
      <div style={{
        width: '42px',
        height: '42px',
        border: '3px solid var(--border-color)',
        borderTop: '3px solid var(--accent-primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <span style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
        {label}
      </span>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
