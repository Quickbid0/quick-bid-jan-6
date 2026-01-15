import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { colors } from '../ui/design-system';

interface AppShellProps {
  children?: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Check if current route is admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Don't show shell for admin routes (they have their own layout)
  if (isAdminRoute) {
    return <Outlet />;
  }

  // Get page title from pathname
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/catalog')) return 'Auction Catalog';
    if (path.startsWith('/my/won-auctions')) return 'My Won Auctions';
    if (path.startsWith('/my/bids')) return 'My Bids';
    if (path.startsWith('/my/watchlist')) return 'My Watchlist';
    if (path.startsWith('/wallet')) return 'Wallet';
    if (path.startsWith('/seller/dashboard')) return 'Seller Dashboard';
    if (path.startsWith('/seller/analytics')) return 'Seller Analytics';
    if (path.startsWith('/seller/membership')) return 'Seller Membership';
    if (path.startsWith('/product/')) return 'Auction Details';
    return 'QuickMela';
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static
      `}>
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar 
          title={getPageTitle()}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="w-full">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
