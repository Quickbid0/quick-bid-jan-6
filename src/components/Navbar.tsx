import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu, X, Sun, Moon, Gavel, LogOut, LayoutDashboard, Wallet as WalletIcon,
  PackageSearch, Info, Clock, Timer, Calendar, Settings, Users, ShieldCheck, Video,
  ChevronDown, Search, Truck, Trophy, Rocket, Plus, HelpCircle, Brain, Shield,
  Activity, TrendingUp, DollarSign, Heart, Package, BarChart3, Car, Home
} from 'lucide-react';
import Avatar from 'react-avatar';
import { supabase, isSupabaseConfigured } from '../config/supabaseClient';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from './NotificationBell';
import { useSession } from '../context/SessionContext';
import LanguageSwitcher from './LanguageSwitcher';

interface MenuItem {
  label: string;
  to?: string;
  icon?: React.ReactNode;
  submenu?: MenuItem[];
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [userRole, setUserRole] = useState('user');
  const [profileUrl, setProfileUrl] = useState(null);
  const [userName, setUserName] = useState('');
  const [dropdownStates, setDropdownStates] = useState<Record<string, boolean>>({});
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, loading: sessionLoading } = useSession();

  // Cars24/Spinny inspired navigation structure
  const buyerMenuItems: MenuItem[] = [
    { label: 'Browse Cars', to: '/buyer/auctions', icon: <Car className="w-4 h-4" /> },
    { label: 'Live Auctions', to: '/live-auction', icon: <Gavel className="w-4 h-4" /> },
    { label: 'My Bids', to: '/my-bids', icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Won Auctions', to: '/my-wins', icon: <Trophy className="w-4 h-4" /> },
    { label: 'Wallet', to: '/wallet', icon: <WalletIcon className="w-4 h-4" /> },
    { label: 'Orders', to: '/my-orders', icon: <Package className="w-4 h-4" /> },
  ];

  const sellerMenuItems: MenuItem[] = [
    { label: 'Dashboard', to: '/seller/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'List Vehicle', to: '/add-product', icon: <Plus className="w-4 h-4" /> },
    { label: 'My Listings', to: '/seller/analytics', icon: <PackageSearch className="w-4 h-4" /> },
    { label: 'Earnings', to: '/seller/analytics', icon: <DollarSign className="w-4 h-4" /> },
    { label: 'Membership', to: '/seller/membership', icon: <Shield className="w-4 h-4" /> },
  ];

  useEffect(() => {
    // Close on Escape and trap focus when drawer is open
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }
      if (e.key === 'Tab' && drawerRef.current) {
        const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
          'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!first || !last) return;
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey) {
          if (active === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (active === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    // Move focus into drawer when it opens
    if (isOpen && drawerRef.current) {
      const focusable = drawerRef.current.querySelector<HTMLElement>('a, button');
      focusable?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (sessionLoading) return;
    if (user) {
      setUserRole(user.role || user.user_type || 'user');
      setUserName(user.name || '');
      // @ts-ignore
      setProfileUrl((user as any).avatar_url || null);
    } else {
      const demoSession = localStorage.getItem('demo-session');
      const demoRole = localStorage.getItem('demo-user-role') || 'user';
      const demoName = localStorage.getItem('demo-user-name') || 'Demo User';
      if (demoSession) {
        setUserRole(demoRole);
        setUserName(demoName);
      } else {
        setUserRole('user');
        setUserName('');
        setProfileUrl(null);
      }
    }
  }, [user, sessionLoading]);

  // React to demo login/logout events so nav updates immediately when using demo accounts
  useEffect(() => {
    const handleDemoLogin = (event: Event) => {
      const custom = event as CustomEvent<any>;
      const demoSession = custom.detail || JSON.parse(localStorage.getItem('demo-session') || 'null');
      if (!demoSession) return;
      const demoRole = localStorage.getItem('demo-user-role') || 'user';
      const demoName = localStorage.getItem('demo-user-name') || demoSession.user?.user_metadata?.name || 'Demo User';
      const avatar = demoSession.user?.user_metadata?.avatar_url || null;
      setUserRole(demoRole);
      setUserName(demoName);
      setProfileUrl(avatar);
    };

    const handleDemoLogout = () => {
      setUserRole('user');
      setUserName('');
      setProfileUrl(null);
    };

    window.addEventListener('demo-login', handleDemoLogin as EventListener);
    window.addEventListener('demo-logout', handleDemoLogout);

    return () => {
      window.removeEventListener('demo-login', handleDemoLogin as EventListener);
      window.removeEventListener('demo-logout', handleDemoLogout);
    };
  }, []);

  const toggleDarkMode = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

  const handleLogout = async () => {
    // Clear demo session
    localStorage.removeItem('demo-session');
    localStorage.removeItem('demo-user-role');
    localStorage.removeItem('demo-user-id');
    localStorage.removeItem('demo-user-name');
    
    // Clear backend auth tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Trigger demo logout event
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
    
    toast.success('Logged out successfully');
    navigate('/');
  };

  const growthServices: MenuItem[] = [
    { label: 'Campaigns Hub', to: '/campaigns', icon: <Rocket size={16} /> },
    { label: 'Create Campaign', to: '/campaigns/new', icon: <Plus size={16} /> },
    { label: 'Marketing Services', to: '/marketing', icon: <Info size={16} /> },
    { label: 'Sales Support', to: '/sales', icon: <Users size={16} /> },
    { label: 'Launch Campaigns', to: '/campaigns/launch', icon: <Rocket size={16} /> },
    { label: 'Sales Support Hub', to: '/support/sales', icon: <HelpCircle size={16} /> },
  ];

  const menuItems: MenuItem[] = user ? [
    // Dashboard - Role-specific
    {
      label: 'Dashboard',
      to: userRole === 'seller' ? '/seller/dashboard' : userRole === 'buyer' ? '/buyer/dashboard' : '/dashboard',
      icon: <LayoutDashboard size={16} />,
    },
    
    // AI Intelligence - Available to all roles
    {
      label: 'AI Intelligence',
      to: '/ai-dashboard',
      icon: <Brain size={16} />,
    },
    
    // Buyer-specific items
    ...(userRole === 'buyer' ? [
      {
        label: 'My Orders',
        to: '/buyer/orders',
        icon: <PackageSearch size={16} />,
      },
      {
        label: 'My Won Auctions',
        to: '/buyer/wins',
        icon: <Trophy size={16} />,
      },
      {
        label: 'Watchlist',
        to: '/buyer/watchlist',
        icon: <Heart size={16} />,
      },
      {
        label: 'Saved Searches',
        to: '/buyer/saved-searches',
        icon: <Search size={16} />,
      }
    ] : []),
    
    // Seller-specific items
    ...(userRole === 'seller' ? [
      {
        label: 'My Listings',
        to: '/seller/dashboard',
        icon: <Package size={16} />,
      },
      {
        label: 'Seller Analytics',
        to: '/seller/analytics',
        icon: <BarChart3 size={16} />,
      },
      {
        label: 'Create Auction',
        to: '/add-product',
        icon: <Plus size={16} />,
      }
    ] : []),
    {
      label: 'Insurance',
      icon: <Shield size={16} />,
      submenu: [
        { label: 'Insurance Dashboard', to: '/finance/insurance/dashboard', icon: <Shield size={16} /> },
        { label: 'Apply for Insurance', to: '/finance/insurance/apply', icon: <Shield size={16} /> },
        { label: 'File Claim', to: '/finance/insurance/claim', icon: <Shield size={16} /> },
      ],
    },
    {
      label: 'Help & Trust',
      icon: <Info size={16} />,
      submenu: [
        { label: 'Trust & Safety', to: '/trust-safety', icon: <ShieldCheck size={16} /> },
        { label: 'FAQ', to: '/faq', icon: <Info size={16} /> },
        { label: 'Help Center', to: '/help', icon: <Info size={16} /> },
        {
          label: 'Legal & Compliance',
          icon: <ShieldCheck size={16} />,
          submenu: [
            { label: 'Terms & Conditions', to: '/legal/terms-and-conditions', icon: <ShieldCheck size={16} /> },
            { label: 'Privacy Policy', to: '/legal/privacy-policy', icon: <ShieldCheck size={16} /> },
            { label: 'Refund & Dispute Policy', to: '/legal/refund-cancellation-dispute', icon: <ShieldCheck size={16} /> },
            { label: 'Wallet & Deposit Policy', to: '/legal/wallet-deposit-investment', icon: <ShieldCheck size={16} /> },
            { label: 'Buyer Policy', to: '/legal/buyer-policy', icon: <ShieldCheck size={16} /> },
            { label: 'Seller Policy', to: '/legal/seller-policy', icon: <ShieldCheck size={16} /> },
            {
              label: 'Security & AML Policy',
              to: '/legal/security-authentication-passwordprotection-accesscontrol-encryption-policy',
              icon: <ShieldCheck size={16} />,
            },
          ],
        },
        { label: 'Contact Us', to: '/contactus', icon: <Info size={16} /> },
      ],
    },
    {
      label: 'Growth Services',
      icon: <Video size={16} />,
      submenu: growthServices,
    },
    {
      label: 'For Businesses',
      to: '/business-solutions',
      icon: <Users size={16} />,
    },
    {
      label: 'Invest • Earn Returns',
      to: '/invest',
      icon: <WalletIcon size={16} />,
    },
    {
      label: 'Investor Pitch',
      to: '/investor-pitch',
      icon: <LayoutDashboard size={16} />,
    },
  ] : [
    { label: 'Home', to: '/' },
    {
      label: 'Browse',
      icon: <PackageSearch size={16} />, 
      submenu: [
        { label: 'Catalog', to: '/catalog', icon: <PackageSearch size={16} /> },
        { label: 'Advanced Search', to: '/advanced-search', icon: <Search size={16} /> },
        { label: 'Seized Vehicles', to: '/seized-vehicles', icon: <Gavel size={16} /> },
      ],
    },
    {
      label: 'Auctions',
      icon: <Gavel size={16} />, 
      submenu: [
        { label: 'Live Auctions', to: '/live-auction', icon: <Video size={16} /> },
        { label: 'Timed Auctions', to: '/timed-auction', icon: <Timer size={16} /> },
        { label: 'Tender Auctions', to: '/tender-auction', icon: <Clock size={16} /> },
        { label: 'Auction Calendar', to: '/auction-calendar', icon: <Calendar size={16} /> },
      ],
    },
  ];

  const renderMenuItem = (item: MenuItem, isMobile: boolean = false) => {
    if (item.submenu) {
      const isDropdownOpen = dropdownStates[item.label] || false;
      
      return (
        <div 
          className="relative group"
          onMouseEnter={() => !isMobile && setDropdownStates(prev => ({ ...prev, [item.label]: true }))}
          onMouseLeave={() => !isMobile && setDropdownStates(prev => ({ ...prev, [item.label]: false }))}
        >
          <button
            onClick={() => {
              if (isMobile) {
                setDropdownStates(prev => ({ ...prev, [item.label]: !prev[item.label] }));
              }
            }}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded transition-colors"
          >
            {item.icon}
            {item.label}
            <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Desktop dropdown - positioned to be visible */}
          <div className={`absolute left-0 top-full mt-1 min-w-[220px] transition-all duration-200 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 z-[70] border border-gray-200 dark:border-gray-700 ${
            isDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
          } group-hover:opacity-100 group-hover:visible group-hover:translate-y-0`}>
            <div className="py-1" onMouseEnter={() => !isMobile && setDropdownStates(prev => ({ ...prev, [item.label]: true }))} onMouseLeave={() => !isMobile && setDropdownStates(prev => ({ ...prev, [item.label]: false }))}>
              {item.submenu.map((subItem) => (
                <Link
                  key={subItem.label}
                  to={subItem.to || '#'}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  onClick={() => {
                    setIsOpen(false);
                    setDropdownStates({});
                  }}
                >
                  {subItem.icon}
                  {subItem.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile dropdown */}
          {isMobile && (
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pl-4 mt-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  {item.submenu.map((subItem) => (
                    <Link
                      key={subItem.label}
                      to={subItem.to || '#'}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      onClick={() => {
                        setIsOpen(false);
                        setDropdownStates({});
                      }}
                    >
                      {subItem.icon}
                      {subItem.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      );
    }

    return (
      <Link
        to={item.to || '#'}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded transition-colors"
        onClick={() => setIsOpen(false)}
      >
        {item.icon}
        {item.label}
      </Link>
    );
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-[50]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Cars24/Spinny style */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                <Gavel className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  QuickMela
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">India's Trusted Auction Platform</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Cars24/Spinny inspired */}
          <div className="hidden lg:flex flex-1 items-center justify-center space-x-8">
            {userRole === 'buyer' && (
              <>
                <Link to="/buyer/auctions" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                  Browse Cars
                </Link>
                <Link to="/live-auction" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                  Live Auctions
                </Link>
                <Link to="/my-bids" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                  My Bids
                </Link>
                <Link to="/my-wins" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                  Won Auctions
                </Link>
              </>
            )}
            
            {userRole === 'seller' && (
              <>
                <Link to="/seller/dashboard" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                  Dashboard
                </Link>
                <Link to="/add-product" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                  List Vehicle
                </Link>
                <Link to="/seller/analytics" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                  My Listings
                </Link>
                <Link to="/seller/membership" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                  Membership
                </Link>
              </>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <LanguageSwitcher variant="minimal" />

            {/* Wallet - Always visible for authenticated users */}
            {user && (
              <Link to="/wallet" className="flex items-center space-x-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                <WalletIcon className="w-4 h-4" />
                <span className="font-medium">Wallet</span>
              </Link>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <>
                {/* Notifications */}
                <NotificationBell />
                
                {/* Profile */}
                <div className="relative group">
                  <Link to="/profile" className="flex items-center">
                    {profileUrl ? (
                      <img
                        src={profileUrl}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Link>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              /* Auth Buttons - Cars24/Spinny style */
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu Drawer - Cars24/Spinny style */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: '0%' }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: '0%' }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-white dark:bg-gray-900 shadow-xl overflow-y-auto"
              ref={drawerRef}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                    <Gavel className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">QuickMela</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Mobile Menu Items */}
              <div className="p-4 space-y-4">
                {userRole === 'buyer' && buyerMenuItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to || '#'}
                    className="flex items-center space-x-3 p-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
                
                {userRole === 'seller' && sellerMenuItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to || '#'}
                    className="flex items-center space-x-3 p-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
                
                {!user && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      to="/login"
                      className="flex items-center justify-center p-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors mb-3"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center justify-center p-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
