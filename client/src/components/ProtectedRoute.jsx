import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading, authChecked } = useSelector((state) => state.auth);

  if (loading && !authChecked) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '2.5rem', background: 'var(--bg-card)', border: '1px solid var(--accent-rose)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
        <ShieldAlert size={48} color="#f43f5e" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Access Denied (RBAC)</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Your user account role (<strong>{user.role}</strong>) does not have sufficient permissions to view this route.
        </p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
