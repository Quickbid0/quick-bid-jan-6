import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { Menu } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileOpen(true)}
            className="p-1 hover:bg-slate-800 rounded"
          >
            <Menu size={24} />
          </button>
          <span className="font-bold text-lg">QuickAdmin</span>
        </div>
      </div>

      <div className="flex relative">
        {/* Desktop Sidebar */}
        <div className="hidden md:block sticky top-0 h-screen overflow-y-auto">
          <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
        </div>

        {/* Mobile Sidebar (Drawer) */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-64 shadow-xl">
              <AdminSidebar 
                collapsed={false} 
                onToggle={() => setMobileOpen(false)} 
                className="h-full"
              />
            </div>
          </div>
        )}

        <div className="flex-1 w-full">
          <div className="max-w-7xl mx-auto px-4 py-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

