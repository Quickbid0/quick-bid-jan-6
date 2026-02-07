import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUnifiedAuth } from '../context/UnifiedAuthContext';
import { storageService } from '../services/storageService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminRequired?: boolean;
  allowedRoles?: ('admin' | 'seller' | 'buyer')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminRequired = false, 
  allowedRoles
}) => {
  const { user, loading } = useUnifiedAuth();

  // Handle loading state - WAIT for auth session to be restored
  if (loading) {
    console.log('🔐 AUTH: ProtectedRoute - waiting for auth session to restore');
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Check for demo session - SINGLE SOURCE OF TRUTH
  const demoSession = storageService.getDemoSession();
  if (demoSession) {
    const effectiveRole = demoSession.user?.user_metadata?.user_type || user?.role || 'buyer';
    console.log('🔐 AUTH: ProtectedRoute - demo session detected, role:', effectiveRole);
    
    if (adminRequired && effectiveRole !== 'admin') {
      console.log('🔐 AUTH: ProtectedRoute - admin required but user is', effectiveRole, 'redirecting to /unauthorized');
      return <Navigate to="/unauthorized" replace />;
    }
    
    if (allowedRoles && !allowedRoles.includes(effectiveRole)) {
      console.log('🔐 AUTH: ProtectedRoute - role', effectiveRole, 'not in allowed roles', allowedRoles, 'redirecting to /unauthorized');
      return <Navigate to="/unauthorized" replace />;
    }
    
    console.log('🔐 AUTH: ProtectedRoute - demo session access granted for role:', effectiveRole);
    return <>{children}</>;
  }

  // Check if user exists - REDIRECT TO LOGIN, NOT 404
  if (!user) {
    console.log('🔐 AUTH: ProtectedRoute - no user found, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  const effectiveRole = user.role;
  console.log('🔐 AUTH: ProtectedRoute - regular session, role:', effectiveRole);

  // Check role requirements for regular sessions
  if (adminRequired && effectiveRole !== 'admin') {
    console.log('🔐 AUTH: ProtectedRoute - admin required but user is', effectiveRole, 'redirecting to /unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(effectiveRole)) {
    console.log('🔐 AUTH: ProtectedRoute - role', effectiveRole, 'not in allowed roles', allowedRoles, 'redirecting to /unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('🔐 AUTH: ProtectedRoute - access granted for role:', effectiveRole);
  return <>{children}</>;
};

export default ProtectedRoute;
