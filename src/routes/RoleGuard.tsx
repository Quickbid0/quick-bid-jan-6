/**
 * ROLE GUARD MIDDLEWARE
 * 
 * Determines which layout to render based on user role
 * Prevents users from seeing incompatible features
 * Ensures role isolation
 * 
 * Usage:
 * <RoleGuard>
 *   <Dashboard />
 * </RoleGuard>
 */

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import BuyerLayout from '@/layouts/BuyerLayout';
import SellerLayout from '@/layouts/SellerLayout';
import DealerLayout from '@/layouts/DealerLayout';
import CompanyLayout from '@/layouts/CompanyLayout';
import AdminLayout from '@/layouts/AdminLayout';

interface RoleGuardProps {
  children: React.ReactNode;
}

/**
 * ROLE GUARD
 * Wraps content in appropriate layout based on user role
 * 
 * Layout Selection:
 * Buyer    → BuyerLayout (auctions, bids, wallet)
 * Seller   → SellerLayout (listings, auctions, ratings)
 * Dealer   → DealerLayout (bulk operations, insights)
 * Company  → CompanyLayout (team, statistics, reports)
 * Admin    → AdminLayout (full platform access)
 */
export function RoleGuard({ children }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user) {
    return null; // ProtectedRoute should handle this first
  }

  const LayoutComponent = getLayoutForRole(user.role);

  return (
    <LayoutComponent>
      {children}
    </LayoutComponent>
  );
}

/**
 * Get the correct layout component for user role
 */
function getLayoutForRole(role: string): React.ComponentType<{ children: React.ReactNode }> {
  switch (role) {
    case 'buyer':
      return BuyerLayout;
    case 'seller':
      return SellerLayout;
    case 'dealer':
      return DealerLayout;
    case 'company':
      return CompanyLayout;
    case 'admin':
      return AdminLayout;
    default:
      console.warn(`Unknown role: ${role}`);
      return BuyerLayout; // Fallback to buyer layout
  }
}

/**
 * FEATURE CHECK HOOK
 * 
 * Use in components to check if feature is available for user role
 * Prevents showing incompatible UI elements
 * 
 * Example:
 * const canEditAuction = useCanAccess('editAuction');
 * {canEditAuction && <EditButton />}
 */
export function useCanAccess(feature: string): boolean {
  const { user } = useAuth();

  if (!user) return false;

  // Define which roles can access which features
  const FEATURE_MATRIX: Record<string, string[]> = {
    // Buyer features
    'browse': ['buyer', 'seller', 'dealer', 'company', 'admin'],
    'placeBid': ['buyer', 'seller', 'dealer', 'company', 'admin'],
    'myBids': ['buyer', 'seller', 'dealer', 'company', 'admin'],
    'wallet': ['buyer', 'seller', 'dealer', 'company', 'admin'],

    // Seller features
    'listProduct': ['seller', 'dealer', 'company', 'admin'],
    'manageAuctions': ['seller', 'dealer', 'company', 'admin'],
    'viewRatings': ['seller', 'dealer', 'company', 'admin'],
    'settlement': ['seller', 'dealer', 'company', 'admin'],

    // Dealer features (bulk operations)
    'bulkList': ['dealer', 'company', 'admin'],
    'insights': ['dealer', 'company', 'admin'],

    // Company features
    'teamManagement': ['company', 'admin'],
    'reports': ['company', 'admin'],

    // Admin features
    'userManagement': ['admin'],
    'analytics': ['admin'],
    'settings': ['admin'],
    'moderation': ['admin'],
  };

  const allowedRoles = FEATURE_MATRIX[feature] || [];
  return allowedRoles.includes(user.role);
}

/**
 * ROLE CHECK HOOK
 * 
 * Get current user role or check specific role
 * 
 * Example:
 * const isSeller = useRole('seller');
 * const role = useRole();
 */
export function useRole(requiredRole?: string): string | boolean {
  const { user } = useAuth();

  if (!user) return false;

  if (requiredRole) {
    return user.role === requiredRole;
  }

  return user.role;
}

export default RoleGuard;
