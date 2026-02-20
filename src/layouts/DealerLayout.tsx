/**
 * DEALER LAYOUT
 * 
 * Layout for dealers (high-volume sellers)
 * 
 * Features:
 * - Bulk operations for multiple listings
 * - Advanced analytics and insights
 * - Inventory management
 * 
 * Navigation items tailored for bulk operations
 */

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import Sidebar from '@/components/layout/Sidebar';

interface DealerLayoutProps {
  children: React.ReactNode;
}

export function DealerLayout({ children }: DealerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const navigationItems = [
    {
      id: 'inventory',
      label: 'Inventory',
      icon: '📦',
      href: '/dashboard/inventory',
      active: location.pathname === '/dashboard/inventory',
    },
    {
      id: 'bulk-list',
      label: 'Bulk List Products',
      icon: '📝',
      href: '/dashboard/bulk-list',
      active: location.pathname === '/dashboard/bulk-list',
    },
    {
      id: 'my-auctions',
      label: 'Active Auctions',
      icon: '🏷️',
      href: '/dashboard/my-auctions',
      active: location.pathname === '/dashboard/my-auctions',
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: '📊',
      href: '/dashboard/insights',
      active: location.pathname === '/dashboard/insights',
    },
    {
      id: 'settlement',
      label: 'Settlement',
      icon: '💸',
      href: '/dashboard/settlement',
      active: location.pathname === '/dashboard/settlement',
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: '📈',
      href: '/dashboard/performance',
      active: location.pathname === '/dashboard/performance',
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: '❓',
      href: '/dashboard/help',
      active: location.pathname === '/dashboard/help',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      href: '/dashboard/settings',
      active: location.pathname === '/dashboard/settings',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />

      <div className="flex">
        <Sidebar
          items={navigationItems}
          onClose={() => setSidebarOpen(false)}
          title="Dealer Portal"
        />

        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'ml-64' : 'ml-20'
          } pt-16`}
        >
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DealerLayout;
