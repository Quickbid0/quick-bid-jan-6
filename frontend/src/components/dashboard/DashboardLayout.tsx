// src/components/dashboard/DashboardLayout.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Bell, Search, Menu, X } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  user,
  notifications,
  onNotificationClick,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = getNavigationItems(user.role);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Mobile Menu */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>

              <div className="ml-4 md:ml-0">
                <h1 className="text-xl font-bold text-gray-900">QuickMela</h1>
              </div>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="w-full relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search auctions, vehicles..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <NotificationBell
                notifications={notifications}
                onClick={onNotificationClick}
              />

              {/* User Menu */}
              <div className="relative">
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user.name}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          md:translate-x-0 md:static md:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1 rounded-md text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  isActive={location.pathname === item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                />
              ))}
            </nav>

            {/* User Info Footer */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user.role.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// Navigation Items by Role
const getNavigationItems = (role: string) => {
  const commonItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'Home' },
    { name: 'Auctions', path: '/auctions', icon: 'Search' },
  ];

  const roleSpecificItems = {
    buyer: [
      { name: 'My Bids', path: '/bids', icon: 'Tag' },
      { name: 'Watchlist', path: '/watchlist', icon: 'Heart' },
      { name: 'Wallet', path: '/wallet', icon: 'Wallet' },
    ],
    seller: [
      { name: 'My Auctions', path: '/auctions/my', icon: 'Package' },
      { name: 'Sold Items', path: '/sales', icon: 'DollarSign' },
      { name: 'Analytics', path: '/analytics', icon: 'BarChart3' },
    ],
    company_owner: [
      { name: 'Bulk Upload', path: '/company/bulk-upload', icon: 'Upload' },
      { name: 'Inventory', path: '/company/inventory', icon: 'Package' },
      { name: 'Team', path: '/company/team', icon: 'Users' },
      { name: 'Analytics', path: '/company/analytics', icon: 'BarChart3' },
    ],
    admin: [
      { name: 'Approvals', path: '/admin/approvals', icon: 'CheckCircle' },
      { name: 'Users', path: '/admin/users', icon: 'Users' },
      { name: 'Analytics', path: '/admin/analytics', icon: 'BarChart3' },
      { name: 'Settings', path: '/admin/settings', icon: 'Settings' },
    ],
  };

  return [...commonItems, ...(roleSpecificItems[role as keyof typeof roleSpecificItems] || [])];
};

// Navigation Item Component
const NavItem: React.FC<{
  item: any;
  isActive: boolean;
  onClick: () => void;
}> = ({ item, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
      ${isActive
        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }
    `}
  >
    <span className="mr-3">{item.icon}</span>
    {item.name}
  </button>
);

export default DashboardLayout;
