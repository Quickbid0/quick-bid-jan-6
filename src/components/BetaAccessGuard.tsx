// Beta Access Guard Component
import React, { useState, useEffect } from 'react';
import { BetaUserService } from '../services/betaUserService';

interface BetaAccessGuardProps {
  children: React.ReactNode;
  requiredRole?: 'buyer' | 'seller' | 'admin';
  fallback?: React.ReactNode;
  showUpgradeCTA?: boolean;
}

export const BetaAccessGuard: React.FC<BetaAccessGuardProps> = ({
  children,
  requiredRole,
  fallback,
  showUpgradeCTA = true
}) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [userRole, setUserRole] = useState<'guest' | 'beta_buyer' | 'beta_seller' | 'admin'>('guest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const userId = localStorage.getItem('sb-user-id') || 'guest';
        const role = await BetaUserService.getUserRole(userId);
        setUserRole(role);

        let access = false;
        switch (requiredRole) {
          case 'buyer':
            access = await BetaUserService.canUserBid(userId);
            break;
          case 'seller':
            access = await BetaUserService.canUserSell(userId);
            break;
          case 'admin':
            access = role === 'admin';
            break;
          default:
            access = role !== 'guest';
        }

        setHasAccess(access);
      } catch (err) {
        console.error('Error checking beta access:', err);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [requiredRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  // Custom fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default fallback based on user role
  if (userRole === 'guest') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <div className="text-yellow-800">
          <svg className="h-12 w-12 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-medium mb-2">Beta Access Required</h3>
          <p className="mb-4">This feature is available to beta users only.</p>
          {showUpgradeCTA && (
            <button
              onClick={() => window.location.href = '/beta-request'}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Request Beta Access
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="text-red-800">
        <svg className="h-12 w-12 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <h3 className="text-lg font-medium mb-2">Access Denied</h3>
        <p>You don't have permission to access this feature.</p>
      </div>
    </div>
  );
};
