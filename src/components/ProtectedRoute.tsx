import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/UnifiedAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminRequired?: boolean;
  allowedRoles?: ('admin' | 'seller' | 'buyer' | 'superadmin')[];
}

/**
 * FIX R-01: Guest Redirect on /dashboard
 * FIX R-02: Buyer Can Access /create-auction via Direct URL
 * - Shows spinner while auth is loading — never render blank page
 * - Redirects unauthenticated users to /login
 * - Redirects unauthorized users to /unauthorized
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminRequired = false,
  allowedRoles,
}) => {
  const { user, loading } = useAuth();

  // ✅ FIX R-01: Show spinner while auth loads — never flash blank content
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ Step 1: Redirect if no user logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Step 2: Role-based access control
  const userRole = user.role;

  // FIX R-02: Role-based route protection
  if (adminRequired && !['admin', 'superadmin'].includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Access granted
  return <>{children}</>;
};

export default ProtectedRoute;

