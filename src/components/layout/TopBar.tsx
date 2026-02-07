import React, { useState, useEffect, useRef } from 'react';
import { Bell, Settings, Search, ChevronDown, Menu, User, LogOut, Package } from 'lucide-react';
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
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close menu when scrolling
  useEffect(() => {
    const handleScroll = () => {
      setMenuOpen(false);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('demo-session');
    localStorage.removeItem('demo-user-role');
    localStorage.removeItem('demo-user-id');
    localStorage.removeItem('demo-user-name');
    
    // Clear backend auth tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    window.dispatchEvent(new CustomEvent('demo-logout'));
    
    try {
      // Call backend logout API
      const response = await fetch('http://localhost:4011/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        console.log('✅ Backend logout successful');
      } else {
        console.log('⚠️ Backend logout failed, but continuing with client-side logout');
      }
    } catch (error) {
      console.log('⚠️ Backend logout error, but continuing with client-side logout:', error);
    }
    
    toast.success('Logged out');
    navigate('/');
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
      <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
        {/* Browse Auctions Button - Responsive */}
        <button
          onClick={() => navigate('/buyer/auctions')}
          className="hidden sm:flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm text-sm"
        >
          <Package size={16} />
          <span className="hidden lg:inline">Browse Auctions</span>
          <span className="sm:hidden lg:hidden">Browse</span>
        </button>

        {/* Mobile Browse Button */}
        <button
          onClick={() => navigate('/buyer/auctions')}
          className="sm:hidden p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
          aria-label="Browse Auctions"
        >
          <Package size={18} />
        </button>

        {/* Search - Responsive */}
        <div className="hidden sm:flex relative items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 focus-within:border-indigo-500 focus-within:text-indigo-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search products..."
            className="w-24 sm:w-32 lg:w-52 bg-transparent text-sm focus:outline-none"
          />
        </div>

        {/* Mobile Search Button */}
        <button className="sm:hidden p-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
          <Search size={18} className="text-gray-600 dark:text-gray-300" />
        </button>
        {!!user && (
          <>
            <button className="rounded-full bg-gray-100 p-2 text-gray-500 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-400">
              <Bell size={18} />
            </button>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span>Profile</span>
                <ChevronDown size={16} className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-44 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 z-[9999]"
                  role="menu"
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <User size={16} />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      const isAdmin = ['admin', 'superadmin'].includes(user?.role);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Settings size={16} />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700 transition-colors"
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
