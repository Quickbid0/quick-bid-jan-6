/**
 * PROTECTED ROUTE WRAPPER
 * 
 * Ensures:
 * - User is authenticated
 * - User has correct role
 * - Layout is mounted before rendering page
 * - Direct URL access works properly
 * 
 * Usage:
 * <ProtectedRoute>
 *   <BuyerLayout>
 *     <Dashboard />
 *   </BuyerLayout>
 * </ProtectedRoute>
 */

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'buyer' | 'seller' | 'dealer' | 'company' | 'admin';
  fallback?: React.ReactNode;
}

/**
 * Core ProtectedRoute component
 * Wraps all authenticated pages
 */
export function ProtectedRoute({
  children,
  requiredRole,
  fallback = <LoadingScreen />
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [hydrated, setHydrated] = useState(!isLoading);

  // Wait for auth to hydrate from localStorage
  useEffect(() => {
    if (!isLoading) {
      setHydrated(true);
    }
  }, [isLoading]);

  // Still loading auth state
  if (!hydrated) {
    return <>{fallback}</>;
  }

  // Not authenticated → redirect to login with return URL
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Have role requirement and user role doesn't match
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // All checks passed → render children
  return <>{children}</>;
}

/**
 * LOADING SCREEN while auth is hydrating
 */
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block">
          <div className="animate-spin">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full" />
          </div>
        </div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

/**
 * UNAUTHORIZED SCREEN
 * User is logged in but doesn't have required role
 */
export function UnauthorizedScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
          <br />
          Please contact support if you believe this is a mistake.
        </p>
        <a
          href="/dashboard"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
}

export default ProtectedRoute;
