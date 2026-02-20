/**
 * SELLER LAYOUT
 * 
 * Layout for sellers to manage auctions and view ratings
 * 
 * Structure:
 * - TopBar (user menu, notifications)
 * - Sidebar (navigation: List Product, My Auctions, Ratings, Settlement, Settings)
 * - Content area (main page)
 * 
 * Key: Hides buyer-only features, shows seller-specific features
 */

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import TopBar from '@/components/layout/TopBar';
import Sidebar from '@/components/layout/Sidebar';

interface SellerLayoutProps {
  children: React.ReactNode;
}

export function SellerLayout({ children }: SellerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();
  const location = useLocation();

  // Navigation items for sellers (max 8 items per design spec)
  const navigationItems = [
    {
      id: 'list-product',
      label: 'List Product',
      icon: '📝',
      href: '/dashboard/list-product',
      active: location.pathname === '/dashboard/list-product',
    },
    {
      id: 'my-auctions',
      label: 'My Auctions',
      icon: '🏷️',
      href: '/dashboard/my-auctions',
      active: location.pathname === '/dashboard/my-auctions',
    },
    {
      id: 'browse',
      label: 'Browse Other Auctions',
      icon: '🔍',
      href: '/dashboard/browse-auctions',
      active: location.pathname === '/dashboard/browse-auctions',
    },
    {
      id: 'ratings',
      label: 'Ratings & Reviews',
      icon: '⭐',
      href: '/dashboard/ratings',
      active: location.pathname === '/dashboard/ratings',
    },
    {
      id: 'settlement',
      label: 'Settlement',
      icon: '💸',
      href: '/dashboard/settlement',
      active: location.pathname === '/dashboard/settlement',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: '📊',
      href: '/dashboard/analytics',
      active: location.pathname === '/dashboard/analytics',
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
      {/* LAYOUT WRAPPER - This fixes "navigation missing" issue */}
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
          title="Seller Portal"
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

export default SellerLayout;
