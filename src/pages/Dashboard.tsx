import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { useSession } from '../context/SessionContext';
import { 
  Search, 
  MapPin, 
  TrendingUp, 
  Clock, 
  Zap, 
  Package,
  ArrowRight,
  Star,
  Heart,
  Eye,
  Users,
  Shield,
  Award,
  ChevronRight,
  Home,
  Grid,
  List,
  Filter,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AuctionCard from '../components/AuctionCard';
import useWalletBalance from '../hooks/useWalletBalance';
import { useAIRecommendations } from '../hooks/useAIRecommendations';

interface DashboardStats {
  activeBids: number;
  totalSpent: number;
  savedAmount: number;
  successRate: number;
  watchlistItems: number;
  listedItems: number;
  totalViews: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    activeBids: 0,
    totalSpent: 0,
    savedAmount: 0,
    successRate: 0,
    watchlistItems: 0,
    listedItems: 0,
    totalViews: 0
  });

  const [activeBids, setActiveBids] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([
    {
      id: '1',
      title: 'Sample Trending Product 1',
      image_url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80',
      current_price: 15000,
      bid_count: 12
    },
    {
      id: '2', 
      title: 'Sample Trending Product 2',
      image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
      current_price: 25000,
      bid_count: 8
    }
  ]);
  const [endingSoon, setEndingSoon] = useState([
    {
      id: '3',
      title: 'Sample Ending Soon Product',
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      current_price: 18000,
      bid_count: 15,
      end_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
    }
  ]);
  const [newListings, setNewListings] = useState([
    {
      id: '4',
      title: 'Sample New Listing',
      image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
      current_price: 8000,
      bid_count: 3
    }
  ]);
  const [recommended, setRecommended] = useState([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const navigate = useNavigate();

  const { balance: walletBalance, loading: walletLoading } = useWalletBalance(userId);
  const { recommendations } = useAIRecommendations(userId);

  useEffect(() => {
    const getUserSession = async () => {
      try {
        console.log('🔐 AUTH: Dashboard - checking user session');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) console.error('Dashboard: session error', error);
        
        if (session?.user) {
          setUserId(session.user.id);
          console.log('Dashboard: userId set', session.user.id);

          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, name, email, role, user_type, is_verified')
              .eq('id', session.user.id)
              .single();
            
            if (error) console.error('Dashboard: profile error', error);
            setUserProfile(profile);

            // Validate role
            const userRole = profile?.role || profile?.user_type || 'buyer';
            const validRoles = ['admin', 'seller', 'buyer'];
            
            if (!validRoles.includes(userRole)) {
              console.error('🔐 AUTH: Dashboard - Invalid role detected:', userRole);
              // Don't redirect, let ProtectedRoute handle it
              setLoading(false);
              return;
            }
            
            console.log('🔐 AUTH: Dashboard - User role validated:', userRole);
            
            // Only redirect sellers to their specific dashboard, NOT buyers
            if (userRole === 'seller') {
              console.log('🔐 AUTH: Dashboard - Redirecting seller to /seller/dashboard');
              navigate('/seller/dashboard', { replace: true });
              return;
            }
            
            // Set loading to false after successful authentication
            setLoading(false);
          } catch (e) {
            console.error('Dashboard: profile exception', e);
            setLoading(false);
          }
        } else {
          // No session found, set loading to false and let ProtectedRoute handle redirect
          console.log('🔐 AUTH: Dashboard - No session found, letting ProtectedRoute handle redirect');
          setLoading(false);
        }
      } catch (e) {
        console.error('Dashboard: session exception', e);
        // Check if we have demo session
        if (typeof window !== 'undefined') {
          const demoSession = localStorage.getItem('demo-session');
          if (demoSession) {
            console.log('🔐 AUTH: Dashboard - Demo session found, proceeding');
            const session = JSON.parse(demoSession);
            setUserId(session.user.id);
            
            // Validate demo role
            const userRole = session.user.user_metadata.role;
            const validRoles = ['admin', 'seller', 'buyer'];
            
            if (!validRoles.includes(userRole)) {
              console.error('🔐 AUTH: Dashboard - Invalid demo role:', userRole);
              setLoading(false);
              return;
            }
            
            console.log('🔐 AUTH: Dashboard - Demo role validated:', userRole);
            
            // Handle seller redirect for demo scenario
            if (userRole === 'seller') {
              console.log('🔐 AUTH: Dashboard - Redirecting demo seller to /seller/dashboard');
              navigate('/seller/dashboard', { replace: true });
              return;
            }
            
            setLoading(false);
          } else {
            console.log('🔐 AUTH: Dashboard - No demo session, letting ProtectedRoute handle redirect');
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      }
    };
    getUserSession();
  }, [navigate]);

  useEffect(() => {
    let mounted = true;
    if (userId) {
      console.log('Dashboard: userId set, fetching data');
      // fetchDashboardData(mounted);
    }
    return () => { mounted = false; };
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div data-testid="dashboard-spinner" className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Global Navigation Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 data-testid="dashboard-logo" className="text-2xl font-bold text-indigo-600">QuickMela</h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearchOverlay(true)}
                  placeholder="Search for anything..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowLocationModal(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectedCity}</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowSearchOverlay(!showSearchOverlay)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Search className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      <AnimatePresence>
        {showSearchOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSearchOverlay(false)}
          >
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                  <Search className="h-6 w-6 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Search</h3>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, categories, brands..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* Trending Auctions */}
        {trendingProducts.length > 0 && (
          <section data-testid="trending-section">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <TrendingUp className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Trending Auctions</h2>
                  <p className="text-gray-600 dark:text-gray-400">Hot deals everyone's bidding on</p>
                </div>
              </div>
              <Link 
                to="/catalog?sort=trending" 
                className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              >
                View All <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
              {trendingProducts.slice(0, 8).map((product) => (
                <div key={product.id} className="flex-none w-80">
                  <AuctionCard
                    variant="live"
                    id={product.id}
                    title={product.title}
                    image={product.image_url}
                    currentBid={product.current_price}
                    bidCount={product.bid_count}
                    onPrimaryAction={() => navigate(`/product/${product.id}`)}
                    onClick={() => navigate(`/product/${product.id}`)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Ending Soon */}
        {endingSoon.length > 0 && (
          <section data-testid="ending-soon-section">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Ending Soon</h2>
                  <p className="text-gray-600 dark:text-gray-400">Last chance to place your bids</p>
                </div>
              </div>
              <Link 
                to="/catalog?filter=ending_soon" 
                className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              >
                View All <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
              {endingSoon.slice(0, 8).map((product) => (
                <div key={product.id} className="flex-none w-80">
                  <AuctionCard
                    variant="live"
                    id={product.id}
                    title={product.title}
                    image={product.image_url}
                    currentBid={product.current_price}
                    bidCount={product.bid_count}
                    timeRemaining={product.end_date}
                    onPrimaryAction={() => navigate(`/product/${product.id}`)}
                    onClick={() => navigate(`/product/${product.id}`)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* New Listings */}
        {newListings.length > 0 && (
          <section data-testid="new-listings-section">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">New Listings</h2>
                  <p className="text-gray-600 dark:text-gray-400">Fresh items just listed</p>
                </div>
              </div>
              <Link 
                to="/catalog?sort=newest" 
                className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              >
                View All <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
              {newListings.slice(0, 8).map((product) => (
                <div key={product.id} className="flex-none w-80">
                  <AuctionCard
                    variant="catalog"
                    id={product.id}
                    title={product.title}
                    image={product.image_url}
                    currentBid={product.current_price}
                    bidCount={product.bid_count}
                    onPrimaryAction={() => navigate(`/product/${product.id}`)}
                    onClick={() => navigate(`/product/${product.id}`)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
