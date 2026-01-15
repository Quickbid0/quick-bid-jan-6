// UX Guard Component - Centralized Access Control (TypeScript Fixed)
import React, { useState, useEffect } from 'react';
import { BetaUserService } from '../services/betaUserService';
import { UserRole, AccessConfig } from '../design-system/types';

interface UXGuardProps {
  children: React.ReactNode;
  role?: UserRole;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

export const UXGuard: React.FC<UXGuardProps> = ({
  children,
  role,
  fallback,
  loadingComponent
}) => {
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [loading, setLoading] = useState(true);
  const [accessConfig, setAccessConfig] = useState<AccessConfig>({
    canBrowse: false,
    canBid: false,
    canSell: false,
    canViewAnalytics: false,
    canManageUsers: false,
    canAccessAdmin: false
  });

  useEffect(() => {
    const determineUserRole = async (): Promise<void> => {
      try {
        const userId = localStorage.getItem('sb-user-id') || 'guest';
        
        // Check for demo session first
        const demoSession = localStorage.getItem('demo-session');
        if (demoSession) {
          const demoData = JSON.parse(demoSession);
          const demoRole = demoData.user?.user_metadata?.role;
          setUserRole(`demo_${demoRole}` as UserRole);
          return;
        }

        // Check beta access
        const betaRole = await BetaUserService.getUserRole(userId);
        setUserRole(betaRole as UserRole);
      } catch (error) {
        console.error('Error determining user role:', error);
        setUserRole('guest');
      } finally {
        setLoading(false);
      }
    };

    determineUserRole();
  }, []);

  useEffect(() => {
    const getAccessConfig = (role: UserRole): AccessConfig => {
      switch (role) {
        case 'guest':
          return {
            canBrowse: true,
            canBid: false,
            canSell: false,
            canViewAnalytics: false,
            canManageUsers: false,
            canAccessAdmin: false,
            blockedMessage: 'Sign up to place bids and access all features',
            blockedCTA: 'Request Beta Access'
          };

        case 'demo_buyer':
        case 'beta_buyer':
          return {
            canBrowse: true,
            canBid: true,
            canSell: false,
            canViewAnalytics: true,
            canManageUsers: false,
            canAccessAdmin: false,
            blockedMessage: role.startsWith('demo') ? 'Demo mode - bidding is simulated' : undefined
          };

        case 'demo_seller':
        case 'beta_seller':
          return {
            canBrowse: true,
            canBid: false,
            canSell: true,
            canViewAnalytics: true,
            canManageUsers: false,
            canAccessAdmin: false,
            blockedMessage: role.startsWith('demo') ? 'Demo mode - selling is simulated' : undefined
          };

        case 'demo_admin':
        case 'admin':
          return {
            canBrowse: true,
            canBid: false,
            canSell: false,
            canViewAnalytics: true,
            canManageUsers: true,
            canAccessAdmin: true,
            blockedMessage: role.startsWith('demo') ? 'Demo mode - admin actions are read-only' : undefined
          };

        default:
          return {
            canBrowse: false,
            canBid: false,
            canSell: false,
            canViewAnalytics: false,
            canManageUsers: false,
            canAccessAdmin: false,
            blockedMessage: 'Access denied'
          };
      }
    };

    if (role) {
      setAccessConfig(getAccessConfig(role));
    }
  }, [role]);

  if (loading) {
    return <>{loadingComponent || <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}</>;
  }

  // Check if user has required role
  if (role && userRole !== role) {
    return <>{fallback || <AccessDenied config={accessConfig} />}</>;
  }

  return <>{children}</>;
};

// Access Denied Component
interface AccessDeniedProps {
  config: AccessConfig;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ config }) => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
      <div className="text-yellow-800">
        <svg className="h-12 w-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 2.502-3.33V4.67C19.414 3.667 18.042 3 16.586 3H7.414c-1.456 0-2.828.667-2.828 1.67v6.66c0 1.667 1.372 3.33 2.828 3.33h8.172z" />
        </svg>
        <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
        <p className="mb-4">{config.blockedMessage || 'You do not have permission to access this feature.'}</p>
        
        {config.blockedCTA && (
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            {config.blockedCTA}
          </button>
        )}
      </div>
    </div>
  );
};

// Hook for checking permissions
export const usePermissions = (requiredRole?: UserRole) => {
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [permissions, setPermissions] = useState<AccessConfig>({
    canBrowse: false,
    canBid: false,
    canSell: false,
    canViewAnalytics: false,
    canManageUsers: false,
    canAccessAdmin: false
  });

  useEffect(() => {
    const determinePermissions = async (): Promise<void> => {
      try {
        const userId = localStorage.getItem('sb-user-id') || 'guest';
        
        // Check for demo session
        const demoSession = localStorage.getItem('demo-session');
        if (demoSession) {
          const demoData = JSON.parse(demoSession);
          const demoRole = demoData.user?.user_metadata?.role;
          const role = `demo_${demoRole}` as UserRole;
          setUserRole(role);
          
          const config: AccessConfig = {
            canBrowse: true,
            canBid: role === 'demo_buyer',
            canSell: role === 'demo_seller',
            canViewAnalytics: ['demo_buyer', 'demo_seller', 'demo_admin'].includes(role),
            canManageUsers: role === 'demo_admin',
            canAccessAdmin: role === 'demo_admin'
          };
          setPermissions(config);
          return;
        }

        // Check beta access
        const betaRole = await BetaUserService.getUserRole(userId);
        setUserRole(betaRole as UserRole);
        
        const config: AccessConfig = {
          canBrowse: true, // All authenticated users can browse
          canBid: await BetaUserService.canUserBid(userId),
          canSell: await BetaUserService.canUserSell(userId),
          canViewAnalytics: betaRole === 'admin', // Only admins can view analytics
          canManageUsers: betaRole === 'admin',
          canAccessAdmin: betaRole === 'admin'
        };
        setPermissions(config);
      } catch (error) {
        console.error('Error determining permissions:', error);
      }
    };

    determinePermissions();
  }, []);

  return { userRole, permissions };
};
