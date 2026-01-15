import React, { useState } from 'react';
import { Bell, Settings, Search, ChevronDown, Menu, LogOut, User } from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import { toast } from 'react-hot-toast';

interface TopBarProps {
  title: string;
  breadcrumb?: string;
  onMenuClick?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ title, breadcrumb, onMenuClick }) => {
  const { user } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    localStorage.removeItem('demo-session');
    localStorage.removeItem('demo-user-role');
    localStorage.removeItem('demo-user-id');
    localStorage.removeItem('demo-user-name');
    window.dispatchEvent(new CustomEvent('demo-logout'));
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Logout failed');
    } else {
      toast.success('Logged out');
      navigate('/');
    }
  };

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white/80 px-6 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button
            className="md:hidden rounded-full p-2 text-gray-500 hover:text-gray-900 dark:text-gray-300"
            onClick={onMenuClick}
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>
        )}
        <div className="space-y-1">
          {breadcrumb && <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">{breadcrumb}</p>}
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>
            <span className="text-xs text-gray-500">Live</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 focus-within:border-indigo-500 focus-within:text-indigo-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search products..."
            className="w-52 bg-transparent text-sm focus:outline-none"
          />
        </div>
        {!!user && (
          <>
            <button className="rounded-full bg-gray-100 p-2 text-gray-500 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-400">
              <Bell size={18} />
            </button>
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span>Profile</span>
                <ChevronDown size={16} />
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-44 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 z-50"
                  role="menu"
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    <User size={16} />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      const isAdmin = ['admin', 'superadmin'].includes(user?.role);
                      navigate(isAdmin ? '/admin/settings' : '/profile');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    <Settings size={16} />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default TopBar;
