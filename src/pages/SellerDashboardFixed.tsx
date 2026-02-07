import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  Plus,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Trophy,
  Search,
  Store,
  Info,
  Upload,
  Settings,
  Star,
  ShoppingCart,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SellerStats {
  totalProducts: number;
  activeAuctions: number;
  totalRevenue: number;
  totalViews: number;
  conversionRate: number;
  avgPrice: number;
  pendingOrders: number;
  completedOrders: number;
}

interface Product {
  id: string;
  title: string;
  current_price: number;
  bid_count: number;
  end_date: string;
  status: string;
  views: number;
  category: string;
}

export default function SellerDashboardFixed() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<SellerStats>({
    totalProducts: 24,
    activeAuctions: 8,
    totalRevenue: 1856000,
    totalViews: 15420,
    conversionRate: 68,
    avgPrice: 45000,
    pendingOrders: 5,
    completedOrders: 19
  });

  const [recentProducts] = useState<Product[]>([
    {
      id: '1',
      title: 'iPhone 14 Pro Max - Excellent',
      current_price: 65000,
      bid_count: 23,
      end_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      views: 342,
      category: 'Electronics'
    },
    {
      id: '2',
      title: 'MacBook Pro 16" M1 Max',
      current_price: 120000,
      bid_count: 18,
      end_date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      views: 256,
      category: 'Electronics'
    },
    {
      id: '3',
      title: 'Vintage Rolex Submariner',
      current_price: 850000,
      bid_count: 45,
      end_date: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      views: 189,
      category: 'Watches'
    },
    {
      id: '4',
      title: 'Sony A7R IV Camera',
      current_price: 185000,
      bid_count: 12,
      end_date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      status: 'ended',
      views: 167,
      category: 'Electronics'
    }
  ]);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatTimeLeft = (endDate: string) => {
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

  const filteredProducts = recentProducts.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Seller Dashboard</h1>
            <p className="text-purple-100 text-lg">Manage your auctions and track performance</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/add-product')}
              className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
            <button
              onClick={() => navigate('/bulk-upload')}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-400 transition-colors"
            >
              <Upload className="w-5 h-5" />
              Bulk Upload
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Auctions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeAuctions}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Views</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Eye className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Orders</p>
              <p className="text-xl font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Orders</p>
              <p className="text-xl font-bold text-gray-900">{stats.completedOrders}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recent Products</h2>
            <p className="text-gray-600">Manage your auction listings</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={() => navigate('/add-product')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add New
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Product</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Current Bid</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Bids</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Views</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{product.title}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{product.category}</span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{formatPrice(product.current_price)}</p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{product.bid_count}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{product.views}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      product.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.status === 'active' ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                          Active
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-gray-500 rounded-full mr-1"></div>
                          Ended
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        View
                      </button>
                      <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/add-product')}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <Plus className="w-6 h-6 text-indigo-600" />
            <span className="text-sm font-medium">Add Product</span>
          </button>
          <button
            onClick={() => navigate('/bulk-upload')}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <Upload className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium">Bulk Upload</span>
          </button>
          <button
            onClick={() => navigate('/seller/analytics')}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <BarChart3 className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium">Analytics</span>
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
          >
            <Settings className="w-6 h-6 text-orange-600" />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>
      </div>

      {/* Performance Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Seller Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Add high-quality images to increase views by 40%</li>
              <li>• Set competitive starting prices to attract more bidders</li>
              <li>• Respond to buyer questions quickly to build trust</li>
              <li>• Use bulk upload for multiple products to save time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
