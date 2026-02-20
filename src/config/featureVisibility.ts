/**
 * FEATURE VISIBILITY & ACCESS CONTROL
 * 
 * Controls which features are visible to which users
 * 
 * This solves: Hiding advanced features from new users
 * while showing them to experienced users and all admins
 * 
 * Features can be hidden based on:
 * - User verification status
 * - User age (account age)
 * - User role
 * - Admin settings
 * - Beta testing groups
 */

export interface FeatureVisibility {
  id: string;
  name: string;
  description: string;
  enabled: boolean; // Master toggle
  roles: {
    buyer?: boolean;
    seller?: boolean;
    dealer?: boolean;
    company?: boolean;
    admin?: boolean;
  };
  requiresVerification?: boolean;
  minAccountAgeHours?: number; // Hide until account is X hours old
  experimentalOnly?: boolean; // Only show in experimental/beta mode
  beta?: boolean; // Mark as beta feature
}

/**
 * FEATURE VISIBILITY SETTINGS
 * 
 * Core features (always available once logged in):
 * - Basic browsing, bidding, profile settings
 * 
 * Standard features (available to all verified users):
 * - Advanced payment options, bulk operations
 * 
 * Advanced features (hidden from new/unverified users):
 * - International shipping, premium seller tools
 * 
 * Experimental features (opt-in, for beta testing):
 * - New UI, beta features
 */
export const FEATURE_VISIBILITY: Record<string, FeatureVisibility> = {
  // CORE FEATURES - Always visible to logged-in users
  BROWSE_AUCTIONS: {
    id: 'browse_auctions',
    name: 'Browse Auctions',
    description: 'View and search available items',
    enabled: true,
    roles: {
      buyer: true,
      seller: true,
      dealer: true,
      company: true,
      admin: true,
    },
  },

  PLACE_BID: {
    id: 'place_bid',
    name: 'Place Bid',
    description: 'Participate in auctions',
    enabled: true,
    roles: {
      buyer: true,
      seller: true,
      dealer: true,
      company: true,
      admin: true,
    },
  },

  LIST_PRODUCT: {
    id: 'list_product',
    name: 'List Product',
    description: 'Create auctions',
    enabled: true,
    roles: {
      seller: true,
      dealer: true,
      company: true,
      admin: true,
    },
  },

  // STANDARD FEATURES - Requires verification
  PROTECTED_PAYMENTS: {
    id: 'protected_payments',
    name: 'Protected Payments',
    description: 'Use escrow service',
    enabled: true,
    roles: {
      buyer: true,
      seller: true,
      dealer: true,
      company: true,
      admin: true,
    },
    requiresVerification: true,
  },

  INTERNATIONAL_SHIPPING: {
    id: 'international_shipping',
    name: 'International Shipping',
    description: 'Ship items internationally',
    enabled: false, // Coming soon
    roles: {
      seller: true,
      dealer: true,
      company: true,
      admin: true,
    },
    requiresVerification: true,
  },

  // ADVANCED FEATURES - Hidden from new users
  BULK_OPERATIONS: {
    id: 'bulk_operations',
    name: 'Bulk Operations',
    description: 'List multiple items at once',
    enabled: true,
    roles: {
      dealer: true,
      company: true,
      admin: true,
    },
    minAccountAgeHours: 24 * 7, // 1 week old account
  },

  PREMIUM_SELLER_TOOLS: {
    id: 'premium_seller_tools',
    name: 'Premium Seller Tools',
    description: 'Advanced seller features',
    enabled: true,
    roles: {
      seller: true,
      dealer: true,
      company: true,
      admin: true,
    },
    minAccountAgeHours: 24 * 30, // 30 days
    requiresVerification: true,
  },

  // ADMIN FEATURES
  USER_MANAGEMENT: {
    id: 'user_management',
    name: 'User Management',
    description: 'Manage platform users',
    enabled: true,
    roles: {
      admin: true,
    },
  },

  MODERATION_TOOLS: {
    id: 'moderation_tools',
    name: 'Moderation Tools',
    description: 'Monitor and moderate content',
    enabled: true,
    roles: {
      admin: true,
    },
  },
};

/**
 * USER FEATURE ACCESS
 */
export interface UserFeatureAccess {
  userId: string;
  role: 'buyer' | 'seller' | 'dealer' | 'company' | 'admin';
  verified: boolean;
  accountAgeHours: number;
  betaOptIn: boolean;
}

/**
 * CHECK IF USER CAN ACCESS FEATURE
 */
export function canAccessFeature(
  featureId: string,
  user: UserFeatureAccess
): boolean {
  const feature = FEATURE_VISIBILITY[featureId];

  if (!feature || !feature.enabled) {
    return false;
  }

  // Check role permission
  const roleAllowed = feature.roles[user.role];
  if (!roleAllowed) {
    return false;
  }

  // Check verification requirement
  if (feature.requiresVerification && !user.verified) {
    return false;
  }

  // Check account age requirement
  if (feature.minAccountAgeHours && user.accountAgeHours < feature.minAccountAgeHours) {
    return false;
  }

  // Check if experimental feature
  if (feature.experimentalOnly && !user.betaOptIn) {
    return false;
  }

  return true;
}

/**
 * GET FEATURE UNLOCK STATUS
 */
export function getFeatureStatus(
  featureId: string,
  user: UserFeatureAccess
): {
  available: boolean;
  reason?: string;
  daysUntilAvailable?: number;
} {
  const feature = FEATURE_VISIBILITY[featureId];

  if (!feature) {
    return { available: false, reason: 'Feature not found' };
  }

  if (!feature.enabled) {
    return { available: false, reason: 'Feature coming soon' };
  }

  const roleAllowed = feature.roles[user.role];
  if (!roleAllowed) {
    return { available: false, reason: 'Not available for your role' };
  }

  if (feature.requiresVerification && !user.verified) {
    return { available: false, reason: 'Verify your identity to unlock' };
  }

  if (feature.minAccountAgeHours && user.accountAgeHours < feature.minAccountAgeHours) {
    const daysUntil = Math.ceil(
      (feature.minAccountAgeHours - user.accountAgeHours) / 24
    );
    return {
      available: false,
      reason: `Available in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
      daysUntilAvailable: daysUntil,
    };
  }

  return { available: true };
}

export default {
  FEATURE_VISIBILITY,
  canAccessFeature,
  getFeatureStatus,
};
