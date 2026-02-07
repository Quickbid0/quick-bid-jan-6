import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  TrendingUp, 
  Clock, 
  Package,
  ArrowRight,
  Star,
  Eye,
  Users,
  Wallet,
  ShoppingCart,
  Gavel,
  Activity,
  DollarSign,
  BarChart3,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const DashboardFixed = () => {
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Sample data for dashboard
  const [stats] = useState({
    activeBids: 12,
    totalSpent: 45600,
    savedAmount: 2300,
    successRate: 78,
    watchlistItems: 24,
    listedItems: 8,
    totalViews: 1250
  });

  const [trendingProducts] = useState([
    {
      id: '1',
      title: 'iPhone 14 Pro Max - Excellent Condition',
      image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80',
      current_price: 65000,
      bid_count: 23,
      end_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      category: 'Electronics'
    },
    {
      id: '2', 
      title: 'MacBook Pro 16" - M1 Max',
      image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
      current_price: 120000,
      bid_count: 18,
      end_date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      category: 'Electronics'
    },
    {
      id: '3',
      title: 'Vintage Rolex Submariner',
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      current_price: 850000,
      bid_count: 45,
      end_date: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      category: 'Watches'
    },
    {
      id: '4',
      title: 'Sony A7R IV Camera Body',
      image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
      current_price: 185000,
      bid_count: 12,
      end_date: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      category: 'Electronics'
    }
  ]);

  const [endingSoon] = useState([
    {
      id: '5',
      title: 'Tesla Model 3 Long Range',
      image_url: 'https://images.unsplash.com/photo-1617654112368-307921291f42?auto=format&fit=crop&w=600&q=80',
      current_price: 2800000,
      bid_count: 67,
      end_date: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
      category: 'Vehicles'
    },
    {
      id: '6',
      title: 'Diamond Ring 2 Carat',
      image_url: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac84?auto=format&fit=crop&w=600&q=80',
      current_price: 450000,
      bid_count: 34,
      end_date: new Date(Date.now() + 0.5 * 60 * 60 * 1000).toISOString(),
      category: 'Jewelry'
    }
  ]);

  const [newListings] = useState([
    {
      id: '7',
      title: 'Gaming PC - RTX 4090',
      image_url: 'https://images.unsplash.com/photo-1587202372748-b99e150069c2?auto=format&fit=crop&w=600&q=80',
      current_price: 95000,
      bid_count: 8,
      end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      category: 'Electronics'
    },
    {
      id: '8',
      title: 'Designer Handbag Collection',
      image_url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80',
      current_price: 75000,
      bid_count: 15,
      end_date: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
      category: 'Fashion'
    }
  ]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatTimeLeft = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    
    if (diff < 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="w-full space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to QuickMela!</h1>
            <p className="text-indigo-100 text-lg">Discover amazing deals and place winning bids</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => navigate('/buyer/auctions')}
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors flex items-center gap-2"
            >
              <Gavel className="w-5 h-5" />
              Browse Auctions
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Bids</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeBids}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Gavel className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalSpent)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Watchlist</p>
              <p className="text-2xl font-bold text-gray-900">{stats.watchlistItems}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Eye className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Trending Auctions */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Trending Auctions</h2>
              <p className="text-gray-600">Hot deals everyone's bidding on</p>
            </div>
          </div>
          <Link 
            to="/buyer/auctions" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            View All <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {trendingProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="aspect-square bg-gray-100">
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    {product.bid_count}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Current Bid</p>
                    <p className="text-lg font-bold text-gray-900">{formatPrice(product.current_price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Ends in</p>
                    <p className="text-sm font-medium text-orange-600">{formatTimeLeft(product.end_date)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Ending Soon */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-red-600 to-red-500 rounded-full shadow-lg">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ending Soon</h2>
            <p className="text-gray-600">Last chance to place your bids</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {endingSoon.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="flex">
                <div className="w-32 h-32 bg-gray-100 flex-shrink-0">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
                      {product.category}
                    </span>
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <Clock className="w-4 h-4" />
                      {formatTimeLeft(product.end_date)}
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Current Bid</p>
                      <p className="text-lg font-bold text-gray-900">{formatPrice(product.current_price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Bids</p>
                      <p className="text-sm font-medium text-gray-900">{product.bid_count}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* New Listings */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">New Listings</h2>
            <p className="text-gray-600">Fresh auctions just added</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {newListings.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="aspect-video bg-gray-100">
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    {product.bid_count}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Starting Bid</p>
                    <p className="text-lg font-bold text-gray-900">{formatPrice(product.current_price)}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/product/${product.id}`);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    Place Bid
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/buyer/auctions')}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <Gavel className="w-6 h-6 text-indigo-600" />
            <span className="text-sm font-medium">Browse</span>
          </button>
          <button
            onClick={() => navigate('/watchlist')}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <Eye className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium">Watchlist</span>
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <Users className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium">Profile</span>
          </button>
          <button
            onClick={() => navigate('/wallet')}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <Wallet className="w-6 h-6 text-orange-600" />
            <span className="text-sm font-medium">Wallet</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardFixed;
