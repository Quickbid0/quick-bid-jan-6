import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu, X, Sun, Moon, Gavel, LogOut, LayoutDashboard, Wallet as WalletIcon,
  PackageSearch, Info, Clock, Timer, Calendar, Settings, Users, ShieldCheck, Video,
  ChevronDown, Search, Truck, Trophy, Rocket, Plus, HelpCircle, Brain, Shield,
  Activity, TrendingUp, DollarSign
} from 'lucide-react';
import Avatar from 'react-avatar';
import { supabase, isSupabaseConfigured } from '../config/supabaseClient';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from './NotificationBell';
import { useSession } from '../context/SessionContext';

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
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, loading: sessionLoading } = useSession();

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
    
    // Trigger demo logout event
    window.dispatchEvent(new CustomEvent('demo-logout'));

    if (!isSupabaseConfigured) {
      toast.success('Logged out successfully');
      navigate('/');
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Logout failed');
    } else {
      toast.success('Logged out successfully');
      navigate('/');
    }
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
    {
      label: 'Dashboard',
      to: userRole === 'seller' ? '/seller/dashboard' : userRole === 'buyer' ? '/buyer/dashboard' : '/dashboard',
      icon: <LayoutDashboard size={16} />,
    },
    {
      label: 'AI Intelligence',
      to: '/ai-dashboard',
      icon: <Brain size={16} />,
    },
    {
      label: 'My Orders',
      to: '/my/orders',
      icon: <PackageSearch size={16} />,
    },
    {
      label: 'My Wins',
      to: '/my/won-auctions',
      icon: <Trophy size={16} />,
    },
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
    {
      label: 'Insurance',
      icon: <Shield size={16} />,
      submenu: [
        { label: 'Insurance Dashboard', to: '/finance/insurance/dashboard', icon: <Shield size={16} /> },
        { label: 'Apply for Insurance', to: '/finance/insurance/apply', icon: <Shield size={16} /> },
        { label: 'File Claim', to: '/finance/insurance/dashboard', icon: <Shield size={16} /> },
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

  if (userRole === 'admin' || userRole === 'superadmin') {
    menuItems.push({
      label: 'Admin',
      icon: <Settings size={16} />,
      submenu: [
        { label: 'Admin Dashboard', to: '/admin', icon: <LayoutDashboard size={16} /> },
        { label: 'System Monitoring', to: '/monitoring', icon: <Activity size={16} /> },
        { label: 'User Management', to: '/admin/users', icon: <Users size={16} /> },
        { label: 'Product Verification', to: '/admin/verify-products', icon: <PackageSearch size={16} /> },
        { label: 'Sales Dashboard', to: '/admin/sales', icon: <TrendingUp size={16} /> },
        { label: 'Sales Leads', to: '/admin/sales/leads', icon: <Users size={16} /> },
        { label: 'Banners', to: '/admin/banners', icon: <Info size={16} /> },
        { label: 'Finance Leads', to: '/admin/finance-leads', icon: <DollarSign size={16} /> },
        { label: 'System Settings', to: '/admin/system-settings', icon: <Settings size={16} /> },
        {
          label: 'Finance & Growth',
          submenu: [
            { label: 'Seller Earnings', to: '/admin/seller-earnings', icon: <WalletIcon size={16} /> },
            { label: 'Win Payments', to: '/admin/win-payments', icon: <ShieldCheck size={16} /> },
            { label: 'Campaigns', to: '/admin/campaigns', icon: <Rocket size={16} /> },
            { label: 'Analytics', to: '/admin/analytics', icon: <LayoutDashboard size={16} /> },
            { label: 'Fees', to: '/admin/fees', icon: <WalletIcon size={16} /> },
          ],
        },
        {
          label: 'Platform Control',
          submenu: [
            { label: 'Content Moderation', to: '/admin/content-moderation', icon: <ShieldCheck size={16} /> },
            { label: 'System Settings', to: '/admin/settings', icon: <Settings size={16} /> },
            { label: 'Deposits & Tokens', to: '/admin/deposit-policies', icon: <WalletIcon size={16} /> },
            { label: 'Security & Risk', to: '/admin/ai-reports', icon: <ShieldCheck size={16} /> },
            {
              label: 'Incident Response & Breach Handling',
              to: '/legal/incident-response-breach-handling-cybersecurity-crisis-management-policy',
              icon: <ShieldCheck size={16} />,
            },
            {
              label: 'AML & Financial Integrity',
              to: '/legal/aml-financial-integrity-policy',
              icon: <ShieldCheck size={16} />,
            },
            {
              label: 'Audit, Logging & Compliance',
              to: '/legal/audit-logging-monitoring-compliance-review-regulatory-reporting-policy',
              icon: <ShieldCheck size={16} />,
            },
          ],
        },
      ],
    });
  }

  if (userRole === 'superadmin') {
    menuItems.push({
      label: 'Super Admin',
      to: '/super-admin',
      icon: <ShieldCheck size={16} />,
    });
  }

  const renderMenuItem = (item: MenuItem, isMobile: boolean = false) => {
    if (item.submenu) {
      return (
        <div
          className="relative"
          onMouseEnter={() => !isMobile && setActiveSubmenu(item.label)}
          onMouseLeave={() => !isMobile && setActiveSubmenu(null)}
        >
          <button
            onClick={() => isMobile && setActiveSubmenu(activeSubmenu === item.label ? null : item.label)}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
          >
            {item.icon}
            {item.label}
            <ChevronDown className={`h-4 w-4 transition-transform ${activeSubmenu === item.label ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {activeSubmenu === item.label && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`${isMobile ? 'pl-4' : 'absolute left-0 top-full min-w-[200px]'} bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50`}
              >
                {item.submenu.map((subItem) => (
                  <Link
                    key={subItem.label}
                    to={subItem.to || '#'}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    {subItem.icon}
                    {subItem.label}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <Link
        to={item.to || '#'}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
        onClick={() => setIsOpen(false)}
      >
        {item.icon}
        {item.label}
      </Link>
    );
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-6">
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              <Gavel className="w-7 h-7 text-primary-600 dark:text-primary-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">QuickMela</span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 justify-center space-x-4">
            {menuItems.map((item) => (
              <React.Fragment key={item.label}>
                {renderMenuItem(item)}
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={toggleDarkMode}
              className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 p-2"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun size={18} className="sm:w-5 sm:h-5" /> : <Moon size={18} className="sm:w-5 sm:h-5" />}
            </button>

            {user ? (
              <>
                <NotificationBell />
                <Link to="/profile" className="hidden sm:block">
                  {profileUrl ? (
                    <img
                      src={profileUrl}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border border-gray-300"
                    />
                  ) : (
                    <Avatar
                      name={userName || 'User'}
                      size="32"
                      round={true}
                      textSizeRatio={2}
                    />
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 p-2 hidden sm:block"
                  aria-label="Logout"
                >
                  <LogOut size={18} className="sm:w-5 sm:h-5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/invest"
                  className="hidden lg:inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-primary-600 text-primary-600 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-300 dark:hover:bg-primary-950/40"
                >
                  Invest
                </Link>
                <Link
                  to="/login"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Register
                </Link>
                <Link to="/company/register" className="bg-secondary-600 text-white px-4 py-2 rounded-lg hover:bg-secondary-700">
                  Company Registration
                </Link>
              </>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setIsOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 right-0 w-80 max-w-[85%] bg-white dark:bg-gray-900 shadow-2xl md:hidden flex flex-col z-50"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              ref={drawerRef}
            >
              <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
                <Link to="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                  <Gavel className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">QuickMela</span>
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                  aria-label="Close menu"
                >
                  <X size={22} />
                </button>
              </div>
              <div className="p-4 space-y-1 overflow-y-auto flex-1">
                {menuItems.map((item) => (
                  <React.Fragment key={item.label}>
                    {renderMenuItem(item, true)}
                  </React.Fragment>
                ))}
              </div>
              <div className="p-4 border-t dark:border-gray-800">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="btn btn-ghost w-full"
                  >
                    Logout
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" className="btn btn-ghost flex-1" onClick={() => setIsOpen(false)}>Login</Link>
                    <Link to="/register" className="btn btn-primary flex-1" onClick={() => setIsOpen(false)}>Register</Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
