/**
 * ADMIN LAYOUT
 * 
 * Layout for platform administrators
 * 
 * Features:
 * - Full platform access
 * - User management
 * - Platform analytics
 * - Moderation and enforcement
 * - System settings
 */

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import Sidebar from '@/components/layout/Sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📈',
      href: '/dashboard/admin',
      active: location.pathname === '/dashboard/admin',
    },
    {
      id: 'users',
      label: 'Users',
      icon: '👥',
      href: '/dashboard/users',
      active: location.pathname === '/dashboard/users',
    },
    {
      id: 'moderation',
      label: 'Moderation',
      icon: '🛡️',
      href: '/dashboard/moderation',
      active: location.pathname === '/dashboard/moderation',
    },
    {
      id: 'platform-analytics',
      label: 'Platform Analytics',
      icon: '📊',
      href: '/dashboard/analytics',
      active: location.pathname === '/dashboard/analytics',
    },
    {
      id: 'disputes',
      label: 'Disputes & Reports',
      icon: '⚠️',
      href: '/dashboard/disputes',
      active: location.pathname === '/dashboard/disputes',
    },
    {
      id: 'system-settings',
      label: 'System Settings',
      icon: '⚙️',
      href: '/dashboard/system-settings',
      active: location.pathname === '/dashboard/system-settings',
    },
    {
      id: 'audit-log',
      label: 'Audit Log',
      icon: '📋',
      href: '/dashboard/audit-log',
      active: location.pathname === '/dashboard/audit-log',
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: '❓',
      href: '/dashboard/help',
      active: location.pathname === '/dashboard/help',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />

      <div className="flex">
        <Sidebar
          items={navigationItems}
          onClose={() => setSidebarOpen(false)}
          title="Admin Portal"
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

export default AdminLayout;
