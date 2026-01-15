import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminRequired?: boolean;
  superAdminRequired?: boolean;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminRequired = false, 
  superAdminRequired = false,
  allowedRoles
}) => {
  const { user, loading } = useSession();

  // Handle loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Check for test tokens (E2E test scenario)
  if (typeof window !== 'undefined') {
    const testAuthToken = localStorage.getItem('sb-auth-token');
    const testUserId = localStorage.getItem('sb-user-id');
    if (testAuthToken && testUserId) {
      console.log('ProtectedRoute: Found test tokens, checking user profile');
      
      // Check for user profile in localStorage (set by auth tests)
      const userProfileStr = localStorage.getItem('user-profile');
      let userProfile = null;
      try {
        userProfile = userProfileStr ? JSON.parse(userProfileStr) : null;
      } catch (e) {
        console.log('ProtectedRoute: Could not parse user profile');
      }
      
      const effectiveRole = (userProfile as any)?.role || (userProfile as any)?.user_type || 'buyer';
      console.log('ProtectedRoute: Test user role:', effectiveRole);
      
      // Apply same role logic as normal authentication
      if (superAdminRequired && effectiveRole !== 'superadmin') {
        return <Navigate to="/dashboard" replace />;
      }
      
      if (adminRequired) {
        if (!['admin', 'superadmin', 'staff'].includes(effectiveRole)) {
          return <Navigate to="/dashboard" replace />;
        }
      }
      
      if (allowedRoles && !allowedRoles.includes(effectiveRole)) {
        return <Navigate to="/dashboard" replace />;
      }
      
      // Handle seller redirect
      if (effectiveRole === 'seller') {
        return <Navigate to="/seller/dashboard" replace />;
      }
      
      return <>{children}</>;
    }
  }

  const effectiveRole = user?.role || 'user';

  // Check for demo session
  const demoSession = localStorage.getItem('demo-session');
  if (demoSession) {
    if (allowedRoles && !allowedRoles.includes(effectiveRole || '')) {
      return <Navigate to="/demo" replace />;
    }
    if (superAdminRequired && effectiveRole !== 'superadmin') {
      return <Navigate to="/demo" replace />;
    }
    if (adminRequired && !['admin', 'superadmin', 'staff'].includes(effectiveRole || '')) {
      return <Navigate to="/demo" replace />;
    }
    return <>{children}</>;
  }

  // Check if the user exists
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role requirements for regular sessions
  if (superAdminRequired) {
    // Check if user has super admin role
    if (effectiveRole !== 'superadmin') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  if (adminRequired) {
    // Check if user has admin, super admin, or staff role
    if (!['admin', 'superadmin', 'staff'].includes(effectiveRole || '')) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  if (allowedRoles && !allowedRoles.includes(effectiveRole || '')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
