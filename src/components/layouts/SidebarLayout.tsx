/**
 * Responsive Sidebar Drawer
 * Desktop: Regular sidebar (pushes content)
 * Mobile: Overlay drawer (click hamburger to open)
 * 
 * Usage:
 *   import { SidebarLayout } from './layouts/SidebarLayout';
 *   
 *   <SidebarLayout
 *     sidebar={<YourSidebarContent />}
 *     content={<YourPageContent />}
 *   />
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export interface SidebarLayoutProps {
  sidebar: React.ReactNode;
  content: React.ReactNode;
  className?: string;
}

export function SidebarLayout({ sidebar, content, className = '' }: SidebarLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close drawer when clicking outside
  const handleBackdropClick = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close drawer when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [content]);

  return (
    <div className={`flex min-h-screen bg-gray-50 ${className}`}>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-6 left-4 z-40 p-2 hover:bg-gray-200 rounded-lg"
        aria-label="Open sidebar"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Desktop Sidebar - Always visible, pushes content */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col sticky top-0 h-screen overflow-y-auto">
        {sidebar}
      </aside>

      {/* Mobile Sidebar - Overlay drawer, appears on top */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white z-40 flex flex-col border-r border-gray-200 overflow-y-auto md:hidden shadow-lg">
            {/* Close Button */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Menu</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
                aria-label="Close sidebar"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto">
              {sidebar}
            </div>
          </aside>
        </>
      )}

      {/* Main Content - Responsive margins */}
      <main className="flex-1 w-full md:w-auto overflow-hidden">
        {content}
      </main>
    </div>
  );
}
