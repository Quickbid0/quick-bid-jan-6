/**
 * NAVIGATION CONFIGURATION
 * 
 * Centralized navigation structure for all roles
 * 
 * This solves MED-001: "Navigation items exceed 8 per role"
 * 
 * Features:
 * - Max 8 items per role (design spec)
 * - Grouped by category
 * - Feature flags for advanced items
 * - User-friendly labels
 * - Easy to maintain in one place
 */

export type UserRole = 'buyer' | 'seller' | 'dealer' | 'company' | 'admin';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  category: string;
  requiresVerification?: boolean; // Show only if verified
  advanced?: boolean; // Show only in advanced mode
  badge?: string | number; // Display badge (count, status)
  description?: string; // Tooltip text
}

export interface RoleNavigation {
  role: UserRole;
  title: string;
  items: NavItem[];
  primaryActions?: NavItem[]; // CTA buttons at top of sidebar
}

/**
 * BUYER NAVIGATION
 * 
 * Primary: Browse and participate in auctions
 * Secondary: Wallet and bid management
 * Tertiary: Account settings
 */
export const buyerNavigation: RoleNavigation = {
  role: 'buyer',
  title: 'Buyer Portal',
  primaryActions: [
    {
      id: 'browse-action',
      label: 'Search Auctions',
      icon: '🔍',
      href: '/dashboard/auctions',
      category: 'primary',
      description: 'Find vehicles to bid on',
    },
  ],
  items: [
    // BROWSING & BIDDING
    {
      id: 'browse',
      label: 'Browse Auctions',
      icon: '🏷️',
      href: '/dashboard/auctions',
      category: 'browsing',
      description: 'Find and bid on vehicles',
    },
    {
      id: 'my-bids',
      label: 'My Bids',
      icon: '📋',
      href: '/dashboard/my-bids',
      category: 'bidding',
      description: 'View your active and closed bids',
    },
    {
      id: 'watchlist',
      label: 'Watchlist',
      icon: '⭐',
      href: '/dashboard/watchlist',
      category: 'browsing',
      description: 'Vehicles you\'re interested in',
    },

    // WALLET & PAYMENTS
    {
      id: 'wallet',
      label: 'Wallet',
      icon: '💰',
      href: '/dashboard/wallet',
      category: 'payments',
      description: 'Manage your balance and payments',
    },
    {
      id: 'protected-payments',
      label: 'Protected Payments',
      icon: '🔒',
      href: '/dashboard/protected-payments',
      category: 'payments',
      requiresVerification: true,
      description: 'Escrow-protected transactions',
    },

    // ACTIVITY & HISTORY
    {
      id: 'activity',
      label: 'Activity',
      icon: '📊',
      href: '/dashboard/activity',
      category: 'activity',
      description: 'Your bidding history',
    },

    // SUPPORT
    {
      id: 'help',
      label: 'Help & Support',
      icon: '❓',
      href: '/dashboard/help',
      category: 'support',
      description: 'FAQs and customer support',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      href: '/dashboard/settings',
      category: 'account',
      description: 'Account and notification settings',
    },
  ],
};

/**
 * SELLER NAVIGATION
 * 
 * Primary: List and manage products
 * Secondary: Monitor auction performance
 * Tertiary: Payments and ratings
 */
export const sellerNavigation: RoleNavigation = {
  role: 'seller',
  title: 'Seller Portal',
  primaryActions: [
    {
      id: 'list-action',
      label: 'List New Product',
      icon: '➕',
      href: '/dashboard/list-product',
      category: 'primary',
      description: 'Create a new auction',
    },
  ],
  items: [
    // PRODUCT MANAGEMENT
    {
      id: 'list-product',
      label: 'List Product',
      icon: '📝',
      href: '/dashboard/list-product',
      category: 'management',
      description: 'Create and manage listings',
    },
    {
      id: 'my-auctions',
      label: 'My Auctions',
      icon: '🏷️',
      href: '/dashboard/my-auctions',
      category: 'management',
      description: 'View your active auctions',
    },

    // PERFORMANCE & ANALYTICS
    {
      id: 'analytics',
      label: 'Performance',
      icon: '📊',
      href: '/dashboard/analytics',
      category: 'insights',
      description: 'Views, bids, and sales data',
    },
    {
      id: 'ratings',
      label: 'Ratings & Reviews',
      icon: '⭐',
      href: '/dashboard/ratings',
      category: 'reputation',
      description: 'Your seller reputation',
    },

    // PAYMENTS
    {
      id: 'settlement',
      label: 'Settlement',
      icon: '💸',
      href: '/dashboard/settlement',
      category: 'payments',
      description: 'Earnings and payouts',
    },
    {
      id: 'protected-sales',
      label: 'Protected Sales',
      icon: '🔒',
      href: '/dashboard/protected-sales',
      category: 'payments',
      requiresVerification: true,
      description: 'Escrow-protected sales',
    },

    // SUPPORT
    {
      id: 'help',
      label: 'Help & Support',
      icon: '❓',
      href: '/dashboard/help',
      category: 'support',
      description: 'Seller resources and support',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      href: '/dashboard/settings',
      category: 'account',
      description: 'Store and account settings',
    },
  ],
};

/**
 * DEALER NAVIGATION
 * 
 * Primary: Bulk operations
 * Secondary: Inventory and insights
 * Tertiary: Performance metrics
 */
export const dealerNavigation: RoleNavigation = {
  role: 'dealer',
  title: 'Dealer Portal',
  primaryActions: [
    {
      id: 'bulk-action',
      label: 'Bulk List',
      icon: '📦',
      href: '/dashboard/bulk-list',
      category: 'primary',
      description: 'List multiple vehicles',
    },
  ],
  items: [
    // INVENTORY
    {
      id: 'inventory',
      label: 'Inventory',
      icon: '📦',
      href: '/dashboard/inventory',
      category: 'management',
      description: 'Your vehicle inventory',
    },
    {
      id: 'bulk-list',
      label: 'Bulk Operations',
      icon: '📝',
      href: '/dashboard/bulk-list',
      category: 'management',
      description: 'List multiple vehicles at once',
    },

    // ACTIVE BUSINESS
    {
      id: 'my-auctions',
      label: 'Active Auctions',
      icon: '🏷️',
      href: '/dashboard/my-auctions',
      category: 'operations',
      description: 'Your active sales',
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: '💡',
      href: '/dashboard/insights',
      category: 'insights',
      description: 'Market trends and analysis',
    },

    // PERFORMANCE
    {
      id: 'performance',
      label: 'Performance',
      icon: '📊',
      href: '/dashboard/performance',
      category: 'insights',
      description: 'Sales metrics and reports',
    },
    {
      id: 'settlement',
      label: 'Settlement',
      icon: '💸',
      href: '/dashboard/settlement',
      category: 'payments',
      description: 'Earnings and payouts',
    },

    // SUPPORT
    {
      id: 'help',
      label: 'Help & Support',
      icon: '❓',
      href: '/dashboard/help',
      category: 'support',
      description: 'Dealer resources and support',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      href: '/dashboard/settings',
      category: 'account',
      description: 'Account settings',
    },
  ],
};

/**
 * COMPANY NAVIGATION
 * 
 * Primary: Team collaboration
 * Secondary: Shared inventory
 * Tertiary: Reports and compliance
 */
export const companyNavigation: RoleNavigation = {
  role: 'company',
  title: 'Company Portal',
  items: [
    // TEAM
    {
      id: 'team',
      label: 'Team',
      icon: '👥',
      href: '/dashboard/team',
      category: 'management',
      description: 'Manage team members',
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: '📦',
      href: '/dashboard/inventory',
      category: 'management',
      description: 'Company-wide inventory',
    },

    // OPERATIONS
    {
      id: 'auctions',
      label: 'Active Auctions',
      icon: '🏷️',
      href: '/dashboard/auctions',
      category: 'operations',
      description: 'All company auctions',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: '📊',
      href: '/dashboard/reports',
      category: 'insights',
      description: 'Sales and performance reports',
    },

    // FINANCE
    {
      id: 'settlement',
      label: 'Settlement',
      icon: '💸',
      href: '/dashboard/settlement',
      category: 'payments',
      description: 'Company earnings',
    },
    {
      id: 'compliance',
      label: 'Compliance',
      icon: '✅',
      href: '/dashboard/compliance',
      category: 'admin',
      description: 'Compliance and KYC',
    },

    // SUPPORT
    {
      id: 'help',
      label: 'Help & Support',
      icon: '❓',
      href: '/dashboard/help',
      category: 'support',
      description: 'Company-level support',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      href: '/dashboard/settings',
      category: 'account',
      description: 'Company settings',
    },
  ],
};

/**
 * ADMIN NAVIGATION
 * 
 * Primary: Platform monitoring
 * Secondary: User management
 * Tertiary: System administration
 * 
 * Note: Admins get more items since they manage entire platform
 */
export const adminNavigation: RoleNavigation = {
  role: 'admin',
  title: 'Admin Portal',
  items: [
    // MONITORING
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📈',
      href: '/dashboard/admin',
      category: 'monitoring',
      description: 'Platform overview',
    },
    {
      id: 'users',
      label: 'Users',
      icon: '👥',
      href: '/dashboard/users',
      category: 'management',
      description: 'Manage platform users',
    },

    // TRUST & SAFETY
    {
      id: 'moderation',
      label: 'Moderation',
      icon: '🛡️',
      href: '/dashboard/moderation',
      category: 'safety',
      description: 'Content moderation',
    },
    {
      id: 'disputes',
      label: 'Disputes',
      icon: '⚠️',
      href: '/dashboard/disputes',
      category: 'safety',
      description: 'Dispute resolution',
    },

    // ANALYTICS
    {
      id: 'analytics',
      label: 'Analytics',
      icon: '📊',
      href: '/dashboard/analytics',
      category: 'insights',
      description: 'Platform metrics',
    },
    {
      id: 'audit-log',
      label: 'Audit Log',
      icon: '📋',
      href: '/dashboard/audit-log',
      category: 'admin',
      description: 'System activity log',
    },

    // SYSTEM
    {
      id: 'settings',
      label: 'System Settings',
      icon: '⚙️',
      href: '/dashboard/system-settings',
      category: 'admin',
      description: 'Platform configuration',
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: '❓',
      href: '/dashboard/help',
      category: 'support',
      description: 'Admin resources',
    },
  ],
};

/**
 * GET NAVIGATION FOR ROLE
 * 
 * Usage:
 * const navConfig = getNavigationForRole('seller');
 * navConfig.items.forEach(item => renderNavItem(item));
 */
export function getNavigationForRole(role: UserRole): RoleNavigation {
  switch (role) {
    case 'buyer':
      return buyerNavigation;
    case 'seller':
      return sellerNavigation;
    case 'dealer':
      return dealerNavigation;
    case 'company':
      return companyNavigation;
    case 'admin':
      return adminNavigation;
    default:
      return buyerNavigation; // fallback
  }
}

/**
 * FILTER NAVIGATION ITEMS
 * 
 * Applies visibility rules:
 * - requiresVerification: only show if user.verified
 * - advanced: only show if user preferences allow
 * 
 * Usage:
 * const visibleItems = filterNavigation(items, user.verified, showAdvanced);
 */
export function filterNavigationItems(
  items: NavItem[],
  isVerified: boolean = false,
  showAdvanced: boolean = false
): NavItem[] {
  return items.filter(item => {
    // Hide if requires verification and not verified
    if (item.requiresVerification && !isVerified) {
      return false;
    }

    // Hide if advanced and not enabled
    if (item.advanced && !showAdvanced) {
      return false;
    }

    return true;
  });
}

/**
 * GROUP NAVIGATION ITEMS BY CATEGORY
 * 
 * Usage:
 * const grouped = groupNavigationByCategory(items);
 * // Returns { browsing: [...], payments: [...] }
 */
export function groupNavigationByCategory(items: NavItem[]): Record<string, NavItem[]> {
  return items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);
}

export default {
  buyerNavigation,
  sellerNavigation,
  dealerNavigation,
  companyNavigation,
  adminNavigation,
  getNavigationForRole,
  filterNavigationItems,
  groupNavigationByCategory,
};
