import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

const SalesProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useSession();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const demoSession = typeof window !== 'undefined' ? localStorage.getItem('demo-session') : null;
  const demoRole = typeof window !== 'undefined' ? localStorage.getItem('demo-user-role') : null;
  if (demoSession && demoRole === 'sales') {
    return <>{children}</>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role || user?.user_type || '';
  const hasSalesRole = role === 'sales';

  if (!hasSalesRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default SalesProtectedRoute;
