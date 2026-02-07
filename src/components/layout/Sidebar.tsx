import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import {
  LayoutDashboard,
  PackageSearch,
  Gavel,
  Users,
  Wallet as WalletIcon,
  Rocket,
  Package,
  Archive,
  Settings,
  Star,
  Search
} from 'lucide-react';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  section: string;
  roles?: string[]; // Allowed roles. If undefined, allowed for everyone including guests.
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}

const navItems: NavItem[] = [
  { 
    label: 'Dashboard', 
    to: '/dashboard', 
    icon: <LayoutDashboard size={18} />, 
    section: 'Core',
    roles: ['buyer', 'seller', 'company', 'admin', 'superadmin']
  },
  { 
    label: 'Catalog', 
    to: '/catalog', 
    icon: <PackageSearch size={18} />, 
    section: 'Catalog' 
    // Publicly accessible
  },
  { 
    label: 'Saved Searches', 
    to: '/advanced-search', 
    icon: <Search size={18} />, 
    section: 'Catalog',
    roles: ['buyer', 'seller', 'company']
  },
  { 
    label: 'Products', 
    to: '/products', 
    icon: <Package size={18} />, 
    section: 'Catalog',
    roles: ['seller', 'company', 'admin', 'superadmin']
  },
  { 
    label: 'Auctions', 
    to: '/live-auction', 
    icon: <Gavel size={18} />, 
    section: 'Commerce',
    roles: ['buyer', 'seller', 'company', 'admin']
  },
  { 
    label: 'My Orders', 
    to: '/my/orders', 
    icon: <Archive size={18} />, 
    section: 'Commerce',
    roles: ['buyer', 'company']
  },
  { 
    label: 'Growth Services', 
    to: '/campaigns', 
    icon: <Rocket size={18} />, 
    section: 'Growth',
    roles: ['seller', 'company']
  },
  { 
    label: 'For Businesses', 
    to: '/business-solutions', 
    icon: <Users size={18} />, 
    section: 'Growth',
    roles: ['company', 'admin']
  },
  { 
    label: 'Invest • Earn', 
    to: '/invest', 
    icon: <WalletIcon size={18} />, 
    section: 'Finance',
    roles: ['buyer', 'company']
  },
  { 
    label: 'Top Sellers', 
    to: '/top-sellers', 
    icon: <Star size={18} />, 
    section: 'Finance'
    // Public
  },
  { 
    label: 'Admin', 
    to: '/admin', 
    icon: <Settings size={18} />, 
    section: 'Admin',
    roles: ['admin', 'superadmin']
  },
];

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, className }) => {
  const location = useLocation();
  const { user, loading } = useSession();

  // Determine current user role; prefer normalized user_type ('buyer' | 'seller' | 'company')
  const currentRole = (user?.user_type || user?.role || 'guest') as string;

  // Filter items based on role
  const filteredItems = navItems.filter(item => {
    if (!item.roles) return true; // Public
    return item.roles.includes(currentRole);
  });

  const computedItems = filteredItems.map((item) => {
    if (item.label === 'Dashboard') {
      const to =
        currentRole === 'buyer' ? '/buyer/dashboard' :
        currentRole === 'seller' ? '/seller/dashboard' :
        currentRole === 'company' ? '/company/dashboard' :
        item.to;
      return { ...item, to };
    }
    return item;
  });

  const grouped = computedItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <aside
      className={`h-screen sticky top-0 left-0 z-20 w-64 flex-col border-r border-gray-200 bg-white/70 px-4 py-6 shadow-sm backdrop-blur backdrop-filter transition-all duration-200 dark:border-gray-800 dark:bg-gray-900/90 ${collapsed ? 'w-20' : ''} ${className || ''}`.trim()}
    >
      <div className="flex items-center justify-between mb-6">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white grid place-items-center font-bold">QM</div>
          {!collapsed && <span className="text-lg font-semibold text-gray-900 dark:text-white">QuickMela</span>}
        </div>
        {!collapsed && (
          <button
            type="button"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            onClick={onToggle}
            aria-label="Collapse sidebar"
          >
            Collapse
          </button>
        )}
        {collapsed && (
          <button className="text-gray-500 hover:text-gray-900" onClick={onToggle} aria-label="Expand sidebar">
            <div className="h-8 w-2 rounded-full bg-gray-400" />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([section, items]) => (
          <div key={section} className="space-y-2">
            {!collapsed && <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">{section}</p>}
            <div className="space-y-1">
              {items.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-gray-800 ${
                    isActive(item.to) ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-700/20' : 'text-gray-600 dark:text-gray-300'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  {item.icon}
                  {!collapsed && item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-3 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800">
          {!collapsed && (
            <>
              <p className="font-semibold text-gray-900 dark:text-white">Need a boost?</p>
              <p className="text-xs">Access growth boosters, marketing campaigns, and verified buyers.</p>
            </>
          )}
          {collapsed && <p>Need a boost?</p>}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
