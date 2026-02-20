/**
 * BUYER LAYOUT
 * 
 * Clean layout for buyers to browse and participate in auctions
 * 
 * Structure:
 * - TopBar (user menu, notifications)
 * - Sidebar (navigation: Browse, My Bids, Wallet, Settings)
 * - Content area (main page)
 * 
 * Key: This WRAPS all buyer pages, ensuring sidebar/topbar always visible
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import BuyerNavigation from '@/components/navigation/BuyerNavigation';
import TopBar from '@/components/layout/TopBar';
import Sidebar from '@/components/layout/Sidebar';

interface BuyerLayoutProps {
  children: React.ReactNode;
}

export function BuyerLayout({ children }: BuyerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();
  const location = useLocation();

  // Navigation items for buyers (max 8 items per design spec)
  const navigationItems = [
    {
      id: 'browse',
      label: 'Browse Auctions',
      icon: '🏷️',
      href: '/dashboard/auctions',
      active: location.pathname === '/dashboard/auctions',
    },
    {
      id: 'my-bids',
      label: 'My Bids',
      icon: '📋',
      href: '/dashboard/my-bids',
      active: location.pathname === '/dashboard/my-bids',
    },
    {
      id: 'watchlist',
      label: 'Watchlist',
      icon: '⭐',
      href: '/dashboard/watchlist',
      active: location.pathname === '/dashboard/watchlist',
    },
    {
      id: 'wallet',
      label: 'Wallet',
      icon: '💰',
      href: '/dashboard/wallet',
      active: location.pathname === '/dashboard/wallet',
      badge: user?.wallet_balance ? `$${(user.wallet_balance / 100).toFixed(0)}` : null,
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: '📊',
      href: '/dashboard/activity',
      active: location.pathname === '/dashboard/activity',
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
      {/* LAYOUT WRAPPER - This is the fix for "navigation missing" issue */}
      <TopBar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex">
        {/* SIDEBAR - Main navigation always visible */}
        <Sidebar
          isOpen={sidebarOpen}
          items={navigationItems}
          onClose={() => setSidebarOpen(false)}
          title="Buyer Portal"
        />

        {/* MAIN CONTENT AREA */}
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'ml-64' : 'ml-20'
          } pt-16`}
        >
          <div className="p-6">
            {/* Page content goes here */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default BuyerLayout;
