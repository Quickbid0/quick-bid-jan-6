import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import {
  LayoutDashboard,
  PackageSearch,
  Gavel,
  Wallet as WalletIcon,
  Shield,
  TrendingUp,
  Settings,
  Heart,
  Clock,
  Award
} from 'lucide-react';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  section: string;
  roles?: string[];
  badge?: string;
  priority?: 'high' | 'medium' | 'low'; // Hide low priority items
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}

// Role-based navigation structure
const getNavItemsByRole = (role: string): NavItem[] => {
  const commonItems: NavItem[] = [
    {
      label: 'Dashboard',
      to: '/dashboard',
      icon: <LayoutDashboard size={18} />,
      section: 'Marketplace',
      roles: ['buyer', 'seller', 'company', 'admin', 'superadmin'],
      priority: 'high'
    }
  ];

  const buyerItems: NavItem[] = [
    {
      label: 'Explore Auctions',
      to: '/buyer/auctions',
      icon: <PackageSearch size={18} />,
      section: 'Marketplace',
      roles: ['buyer'],
      priority: 'high'
    },
    {
      label: 'My Bids',
      to: '/buyer/bids',
      icon: <Gavel size={18} />,
      section: 'Marketplace',
      roles: ['buyer'],
      priority: 'high'
    },
    {
      label: 'Watchlist',
      to: '/buyer/watchlist',
      icon: <Heart size={18} />,
      section: 'Marketplace',
      roles: ['buyer'],
      priority: 'medium'
    },
    {
      label: 'Wallet',
      to: '/wallet',
      icon: <WalletIcon size={18} />,
      section: 'Finance',
      roles: ['buyer'],
      priority: 'high'
    },
    {
      label: 'My Orders',
      to: '/buyer/orders',
      icon: <Clock size={18} />,
      section: 'Risk',
      roles: ['buyer'],
      priority: 'medium'
    },
    {
      label: 'Referrals',
      to: '/buyer/referrals',
      icon: <Award size={18} />,
      section: 'Growth',
      roles: ['buyer'],
      priority: 'medium'
    }
  ];

  const sellerItems: NavItem[] = [
    {
      label: 'Listings',
      to: '/seller/listings',
      icon: <PackageSearch size={18} />,
      section: 'Marketplace',
      roles: ['seller'],
      priority: 'high'
    },
    {
      label: 'Orders',
      to: '/seller/orders',
      icon: <Clock size={18} />,
      section: 'Marketplace',
      roles: ['seller'],
      priority: 'high'
    },
    {
      label: 'Wallet',
      to: '/wallet',
      icon: <WalletIcon size={18} />,
      section: 'Finance',
      roles: ['seller'],
      priority: 'high'
    },
    {
      label: 'Inspection',
      to: '/seller/inspection',
      icon: <Shield size={18} />,
      section: 'Risk',
      roles: ['seller'],
      priority: 'high'
    },
    {
      label: 'Analytics',
      to: '/seller/analytics',
      icon: <TrendingUp size={18} />,
      section: 'Growth',
      roles: ['seller'],
      priority: 'medium'
    }
  ];

  const companyItems: NavItem[] = [
    {
      label: 'Bulk Upload',
      to: '/company/bulk-upload',
      icon: <PackageSearch size={18} />,
      section: 'Marketplace',
      roles: ['company'],
      priority: 'high'
    },
    {
      label: 'Inventory',
      to: '/company/inventory',
      icon: <PackageSearch size={18} />,
      section: 'Marketplace',
      roles: ['company'],
      priority: 'high'
    },
    {
      label: 'Reports',
      to: '/company/reports',
      icon: <TrendingUp size={18} />,
      section: 'Marketplace',
      roles: ['company'],
      priority: 'medium'
    },
    {
      label: 'Team',
      to: '/company/team',
      icon: <Settings size={18} />,
      section: 'System',
      roles: ['company'],
      priority: 'medium'
    },
    {
      label: 'Wallet',
      to: '/wallet',
      icon: <WalletIcon size={18} />,
      section: 'Finance',
      roles: ['company'],
      priority: 'high'
    }
  ];

  const adminItems: NavItem[] = [
    {
      label: 'Moderation',
      to: '/admin/moderation',
      icon: <Shield size={18} />,
      section: 'Risk',
      roles: ['admin', 'superadmin'],
      priority: 'high'
    },
    {
      label: 'Analytics',
      to: '/admin/analytics',
      icon: <TrendingUp size={18} />,
      section: 'Growth',
      roles: ['admin', 'superadmin'],
      priority: 'high'
    },
    {
      label: 'System',
      to: '/admin/system',
      icon: <Settings size={18} />,
      section: 'System',
      roles: ['admin', 'superadmin'],
      priority: 'high'
    }
  ];

  // Combine items based on role
  switch (role) {
    case 'buyer':
      return [...commonItems, ...buyerItems];
    case 'seller':
      return [...commonItems, ...sellerItems];
    case 'company':
      return [...commonItems, ...companyItems];
    case 'admin':
    case 'superadmin':
      return [...commonItems, ...adminItems];
    default:
      // Guest/unauthenticated users
      return [
        ...commonItems,
        {
          label: 'Explore Auctions',
          to: '/products',
          icon: <PackageSearch size={18} />,
          section: 'Marketplace',
          priority: 'high'
        },
        {
          label: 'How It Works',
          to: '/about',
          icon: <Shield size={18} />,
          section: 'Marketplace',
          priority: 'medium'
        }
      ];
  }
};

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, className }) => {
  const location = useLocation();
  const { user, loading } = useSession();

  // Determine current user role
  const currentRole = (user?.user_type || user?.role || 'guest') as string;

  // Get navigation items for current role
  const navItems = getNavItemsByRole(currentRole);

  // Filter out low priority items to reduce clutter
  const filteredItems = navItems.filter(item => item.priority !== 'low');

  // Group items by section
  const grouped = filteredItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  // Define section order for consistent display
  const sectionOrder = ['Marketplace', 'Finance', 'Risk', 'Growth', 'System'];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <aside
      className={`h-screen sticky top-0 left-0 z-20 w-64 flex-col border-r border-neutral-200 bg-white px-4 py-6 shadow-sm transition-all duration-200 ${collapsed ? 'w-20' : ''} ${className || ''}`.trim()}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="h-10 w-10 rounded-2xl bg-primary-600 text-white grid place-items-center font-bold text-sm">QM</div>
          {!collapsed && <span className="text-lg font-semibold text-neutral-900">QuickMela</span>}
        </div>
        {!collapsed && (
          <button
            type="button"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
            onClick={onToggle}
            aria-label="Collapse sidebar"
          >
            Collapse
          </button>
        )}
        {collapsed && (
          <button
            className="text-neutral-500 hover:text-neutral-900"
            onClick={onToggle}
            aria-label="Expand sidebar"
          >
            <div className="h-8 w-2 rounded-full bg-neutral-400" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="space-y-6">
        {sectionOrder.map(section => {
          const items = grouped[section];
          if (!items || items.length === 0) return null;

          return (
            <div key={section} className="space-y-2">
              {!collapsed && (
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  {section}
                </p>
              )}
              <div className="space-y-1">
                {items.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition hover:bg-neutral-100 hover:text-primary-600 ${
                      isActive(item.to)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-neutral-600'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    {item.icon}
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span className="ml-auto rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-700">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer - Trust indicator */}
      {!collapsed && (
        <div className="mt-auto">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <Shield size={14} />
              <span>Escrow Protected</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
