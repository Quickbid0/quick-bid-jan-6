import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

/**
 * FIX 22: Mobile Sidebar Overlay (Responsive — 320px)
 * - At 320px width, sidebar doesn't overlap and has proper backdrop
 * - Prevents sidebar from covering content on small screens
 */

interface MobileSidebarProps {
  children?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  children,
  isOpen = false,
  onClose,
}) => {
  return (
    <>
      {/* Mobile Menu Button - visible < 1024px */}
      <button
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white border border-gray-200 shadow-sm"
        onClick={() => {
          /* Toggle state in parent */
        }}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-gray-700" />
        ) : (
          <Menu className="w-5 h-5 text-gray-700" />
        )}
      </button>

      {/* Backdrop - click to close */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity"
          onClick={onClose}
          role="presentation"
        />
      )}

      {/* Sidebar - slides in on mobile */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white z-40 lg:relative lg:z-auto shadow-xl transition-transform transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } lg:shadow-none`}
      >
        {children}
      </aside>
    </>
  );
};

// Hook to manage mobile sidebar state
export const useMobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
};
