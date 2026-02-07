import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Eye, 
  Trophy, 
  ShoppingCart, 
  Search, 
  Wallet, 
  DollarSign, 
  Calendar, 
  Users, 
  MessageCircle, 
  Settings, 
  LogOut, 
  Menu, 
  User, 
  TrendingUp,
  Receipt,
  X,
  ChevronDown,
  Clock,
  Video,
  BarChart3,
  CalendarDays
} from 'lucide-react';

interface BuyerLayoutProps {
  children?: React.ReactNode;
}

const BuyerLayout: React.FC<BuyerLayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, logout } = useSession();

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle swipe gestures for mobile menu
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && !isMobileMenuOpen) {
      // Swipe left to open menu
      setIsMobileMenuOpen(true);
    } else if (isRightSwipe && isMobileMenuOpen) {
      // Swipe right to close menu
      setIsMobileMenuOpen(false);
    }
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <div 
      className="min-h-screen bg-gray-50"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Buyer Sidebar */}
      <motion.div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:block ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        initial={false}
        animate={{ x: isMobileMenuOpen || !isMobile ? 0 : -256 }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">QuickMela</h2>
                <p className="text-xs text-gray-500">Buyer Dashboard</p>
              </div>
            </div>
            {isMobile && (
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <Link
              to="/buyer/dashboard"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <LayoutDashboard className="w-5 h-5 mr-3" />
              Dashboard
            </Link>
            
            {/* Auctions Section */}
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Auctions
              </div>
              <Link
                to="/buyer/auctions"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Package className="w-5 h-5 mr-3" />
                Browse Auctions
              </Link>
              
              <Link
                to="/live-auction"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Video className="w-5 h-5 mr-3" />
                Live Auctions
              </Link>
              
              <Link
                to="/timed-auction"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Clock className="w-5 h-5 mr-3" />
                Timed Auctions
              </Link>
              
              <Link
                to="/tender-auction"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Gavel className="w-5 h-5 mr-3" />
                Tender Auctions
              </Link>
              
              <Link
                to="/auction-calendar"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Calendar className="w-5 h-5 mr-3" />
                Auction Calendar
              </Link>
            </div>
            
            {/* My Activity Section */}
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                My Activity
              </div>
              <Link
                to="/my-bids"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <TrendingUp className="w-5 h-5 mr-3" />
                My Bids
              </Link>
              
              <Link
                to="/transaction-history"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Receipt className="w-5 h-5 mr-3" />
                Transaction History
              </Link>
              
              <Link
                to="/watchlist"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Eye className="w-5 h-5 mr-3" />
                My Watchlist
              </Link>
              
              <Link
                to="/my/wins"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Trophy className="w-5 h-5 mr-3" />
                My Won Auctions
              </Link>
              
              <Link
                to="/my/orders"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <ShoppingCart className="w-5 h-5 mr-3" />
                My Orders
              </Link>
              
              <Link
                to="/buyer/saved-searches"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Search className="w-5 h-5 mr-3" />
                My Saved Searches
              </Link>
            </div>
            
            {/* Finance Section */}
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Finance
              </div>
              <Link
                to="/wallet"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Wallet className="w-5 h-5 mr-3" />
                Wallet & Add Funds
              </Link>
              
              <Link
                to="/invest"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <DollarSign className="w-5 h-5 mr-3" />
                Invest Dashboard
              </Link>
            </div>
            
            {/* Community Section */}
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Community
              </div>
              <Link
                to="/events"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <CalendarDays className="w-5 h-5 mr-3" />
                Events
              </Link>
              
              <Link
                to="/top-sellers"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Users className="w-5 h-5 mr-3" />
                Top Sellers
              </Link>
              
              <Link
                to="/support"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <MessageCircle className="w-5 h-5 mr-3" />
                Support Chat
              </Link>
            </div>
          </nav>
          
          {/* User Section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Buyer User</p>
                <p className="text-xs text-gray-500">buyer@example.com</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <Link
                to="/profile"
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </Link>
              
              <button className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full">
                <LogOut className="w-4 h-4 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Main Content */}
      <div className="lg:pl-64 pl-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b">
          <h1 className="text-lg font-semibold">QuickMela</h1>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="max-w-full overflow-x-hidden">
          {children || <Outlet />}
        </div>
      </div>
    </div>
  );
};

export default BuyerLayout;
