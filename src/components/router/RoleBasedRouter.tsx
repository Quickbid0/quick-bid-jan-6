import React, { ReactNode } from 'react';
import { COLORS, SPACING } from '../../config/designTokens';

interface RoleConfig {
  routes?: ReactNode;
  sidebar?: ReactNode;
  notFound?: ReactNode;
}

interface RoleBasedRouterProps {
  userId?: string;
  userRole?: 'BUYER' | 'SELLER' | 'ADMIN' | 'COMPANY';
  buyerConfig?: RoleConfig;
  sellerConfig?: RoleConfig;
  adminConfig?: RoleConfig;
  companyConfig?: RoleConfig;
  fallback?: ReactNode;
  loading?: boolean;
}

/**
 * RoleBasedRouter - Routes users to role-specific experiences
 * 
 * Ensures:
 * - Buyers see only auction/bidding features
 * - Sellers see inventory/listing management
 * - Admins see system controls
 * - Companies see corporate features
 * 
 * No backend changes needed - all role logic is frontend
 */
export const RoleBasedRouter: React.FC<RoleBasedRouterProps> = ({
  userId,
  userRole = 'BUYER',
  buyerConfig,
  sellerConfig,
  adminConfig,
  companyConfig,
  fallback,
  loading = false,
}) => {
  const normalizedRole = userRole.toUpperCase() as 'BUYER' | 'SELLER' | 'ADMIN' | 'COMPANY';

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontSize: '16px',
          color: COLORS.gray[600],
        }}
      >
        <div
          style={{
            animation: 'spin 1s linear infinite',
            marginRight: SPACING[2],
          }}
        >
          ⏳
        </div>
        Loading your dashboard...
      </div>
    );
  }

  if (!userId) {
    return fallback || <div>Please log in to continue</div>;
  }

  const roleConfigs = {
    BUYER: buyerConfig,
    SELLER: sellerConfig,
    ADMIN: adminConfig,
    COMPANY: companyConfig,
  };

  const config = roleConfigs[normalizedRole];

  if (!config) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          textAlign: 'center',
          padding: SPACING[6],
        }}
      >
        <h2 style={{ color: COLORS.gray[900], marginBottom: SPACING[2] }}>
          Role not configured
        </h2>
        <p style={{ color: COLORS.gray[600] }}>
          Your role "{normalizedRole}" does not have a configured experience yet.
        </p>
      </div>
    );
  }

  return <>{config.routes}</>;
};

/**
 * Hook to detect role from authentication context
 * Usage: const { role, userId } = useUserRole();
 */
export const useUserRole = () => {
  const [role, setRole] = React.useState<'BUYER' | 'SELLER' | 'ADMIN' | 'COMPANY'>('BUYER');
  const [userId, setUserId] = React.useState<string>();

  React.useEffect(() => {
    // Get from localStorage or auth context
    const storedRole = localStorage.getItem('userRole') as 'BUYER' | 'SELLER' | 'ADMIN' | 'COMPANY' | null;
    const storedUserId = localStorage.getItem('userId');

    if (storedRole) setRole(storedRole);
    if (storedUserId) setUserId(storedUserId);
  }, []);

  return { role, userId };
};
