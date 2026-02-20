/**
 * COMPANY LAYOUT
 * 
 * Layout for company accounts (multiple team members)
 * 
 * Features:
 * - Team management
 * - Shared inventory and reports
 * - Company-level analytics
 * - Compliance and reporting
 */

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import Sidebar from '@/components/layout/Sidebar';

interface CompanyLayoutProps {
  children: React.ReactNode;
}

export function CompanyLayout({ children }: CompanyLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const navigationItems = [
    {
      id: 'team',
      label: 'Team',
      icon: '👥',
      href: '/dashboard/team',
      active: location.pathname === '/dashboard/team',
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: '📦',
      href: '/dashboard/inventory',
      active: location.pathname === '/dashboard/inventory',
    },
    {
      id: 'auctions',
      label: 'Active Auctions',
      icon: '🏷️',
      href: '/dashboard/auctions',
      active: location.pathname === '/dashboard/auctions',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: '📊',
      href: '/dashboard/reports',
      active: location.pathname === '/dashboard/reports',
    },
    {
      id: 'settlement',
      label: 'Settlement',
      icon: '💸',
      href: '/dashboard/settlement',
      active: location.pathname === '/dashboard/settlement',
    },
    {
      id: 'compliance',
      label: 'Compliance',
      icon: '✅',
      href: '/dashboard/compliance',
      active: location.pathname === '/dashboard/compliance',
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
          title="Company Portal"
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

export default CompanyLayout;
