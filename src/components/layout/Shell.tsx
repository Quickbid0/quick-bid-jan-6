import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface ShellProps {
  title: string;
  breadcrumb?: string;
  children: React.ReactNode;
}

const Shell: React.FC<ShellProps> = ({ title, breadcrumb, children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Admin routes handle their own layout
  if (location.pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="hidden md:flex">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((prev) => !prev)}
        />
      </div>

      <div className="flex flex-1 flex-col">
        <TopBar
          title={title}
          breadcrumb={breadcrumb}
          onMenuClick={() => setMobileOpen((prev) => !prev)}
        />
        <main id="main" className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl space-y-10">{children}</div>
        </main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-64 bg-white shadow-xl dark:bg-gray-900">
            <Sidebar
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
              className="h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Shell;
