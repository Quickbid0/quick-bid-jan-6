import React, { useEffect, useState } from 'react';
import { QuickMelaRoleGuard, SellerLayout } from '../components/auth/QuickMelaAuth';
import { toast } from 'react-hot-toast';
import {
  Package, Gavel, TrendingUp, DollarSign, Plus, Eye, Edit,
  BarChart3, Clock, CheckCircle, AlertCircle, Star
} from 'lucide-react';

interface SellerStats {
  totalProducts: number;
  activeAuctions: number;
  completedAuctions: number;
  totalEarnings: number;
  averageRating: number;
  totalSales: number;
}

interface Product {
  id: string;
  title: string;
  category: string;
  status: string;
  images: string[];
  createdAt: string;
  handmadeRating?: number;
}

interface Auction {
  id: string;
  title: string;
  productId: string;
  currentBid: number;
  status: string;
  endTime: string;
  bidders: number;
  totalBids: number;
}

const SellerDashboard: React.FC = () => {
  const [stats, setStats] = useState<SellerStats>({
    totalProducts: 0,
    activeAuctions: 0,
    completedAuctions: 0,
    totalEarnings: 0,
    averageRating: 0,
    totalSales: 0
  });

  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [activeAuctions, setActiveAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchSellerData();
  }, []);

  const fetchSellerData = async () => {
    try {
      setLoading(true);

      // Fetch seller statistics
      const statsResponse = await fetch('/api/seller/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch recent products
      const productsResponse = await fetch('/api/seller/products?limit=5', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setRecentProducts(productsData);
      }

      // Fetch active auctions
      const auctionsResponse = await fetch('/api/seller/auctions/active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (auctionsResponse.ok) {
        const auctionsData = await auctionsResponse.json();
        setActiveAuctions(auctionsData);
      }

    } catch (error) {
      console.error('Error loading seller dashboard data:', error);
      toast.error('Failed to load dashboard data');

      // Mock data for development
      setStats({
        totalProducts: 12,
        activeAuctions: 5,
        completedAuctions: 28,
        totalEarnings: 45000,
        averageRating: 4.7,
        totalSales: 34
      });

      setRecentProducts([
        { id: '1', title: 'Handmade Ceramic Vase', category: 'Art', status: 'APPROVED', images: [], createdAt: '2024-01-10', handmadeRating: 95 },
        { id: '2', title: 'Vintage Leather Bag', category: 'Fashion', status: 'PENDING', images: [], createdAt: '2024-01-08' },
        { id: '3', title: 'Custom Oil Painting', category: 'Art', status: 'APPROVED', images: [], createdAt: '2024-01-05', handmadeRating: 92 }
      ]);

      setActiveAuctions([
        { id: '1', title: 'Handmade Ceramic Vase', productId: '1', currentBid: 2500, status: 'ACTIVE', endTime: '2024-01-20T10:00:00Z', bidders: 8, totalBids: 23 },
        { id: '2', title: 'Custom Oil Painting', productId: '3', currentBid: 8500, status: 'ACTIVE', endTime: '2024-01-18T15:30:00Z', bidders: 12, totalBids: 45 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-green-600 bg-green-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'REJECTED': return 'text-red-600 bg-red-100';
      case 'ACTIVE': return 'text-blue-600 bg-blue-100';
      case 'COMPLETED': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <QuickMelaRoleGuard allowedRoles={['SELLER']} requireVerification={true}>
        <SellerLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </SellerLayout>
      </QuickMelaRoleGuard>
    );
  }

  return (
    <QuickMelaRoleGuard allowedRoles={['SELLER']} requireVerification={true}>
      <SellerLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage your products and auctions</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2">
                <Gavel className="w-4 h-4" />
                <span>Create Auction</span>
              </button>
            </div>
          </div>

          {/* Seller Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                  <p className="text-sm text-green-600">+3 this month</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Gavel className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Auctions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeAuctions}</p>
                  <p className="text-sm text-blue-600">{activeAuctions.length} running now</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">₹{stats.totalEarnings.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+₹12,000 this month</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                  <p className="text-sm text-green-600">⭐⭐⭐⭐⭐</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Products */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Products</h2>
              <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                View All Products
              </button>
            </div>
            <div className="space-y-4">
              {recentProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Package className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{product.title}</h3>
                      <p className="text-sm text-gray-600">{product.category}</p>
                      <p className="text-xs text-gray-500">Added: {new Date(product.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {product.handmadeRating && (
                      <div className="text-sm text-green-600 font-medium">
                        Handmade: {product.handmadeRating}%
                      </div>
                    )}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                    <div className="flex space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-800 p-1">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-800 p-1">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Auctions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Active Auctions</h2>
              <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                Manage Auctions
              </button>
            </div>
            <div className="space-y-4">
              {activeAuctions.map((auction) => (
                <div key={auction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{auction.title}</h3>
                    <div className="flex items-center space-x-6 mt-1">
                      <span className="text-sm text-gray-600">
                        Current Bid: ₹{auction.currentBid.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-600">
                        {auction.bidders} bidders
                      </span>
                      <span className="text-sm text-gray-600">
                        {auction.totalBids} total bids
                      </span>
                      <span className={`text-sm ${
                        new Date(auction.endTime) < new Date(Date.now() + 60 * 60 * 1000)
                          ? 'text-red-600 font-medium'
                          : 'text-gray-600'
                      }`}>
                        Ends: {new Date(auction.endTime).toLocaleDateString()} {new Date(auction.endTime).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                      View Details
                    </button>
                    <button className="text-orange-600 hover:text-orange-800 text-sm font-medium">
                      Extend Time
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Analytics & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Analytics</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Success Rate</span>
                  <span className="text-sm font-bold text-green-600">87%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Average Sale Price</span>
                  <span className="text-sm font-bold text-gray-900">₹8,250</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Response Time</span>
                  <span className="text-sm font-bold text-blue-600">&lt; 2 hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Buyer Satisfaction</span>
                  <span className="text-sm font-bold text-purple-600">4.8/5.0</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center">
                  <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Upload Product</p>
                </button>

                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center">
                  <Gavel className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Start Auction</p>
                </button>

                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center">
                  <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">View Analytics</p>
                </button>

                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center">
                  <DollarSign className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Wallet & Payouts</p>
                </button>
              </div>
            </div>
          </div>

          {/* Notifications/Alerts */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Important Updates</p>
                <ul className="mt-1 space-y-1">
                  <li>• Your auction "Handmade Ceramic Vase" ends in 2 hours</li>
                  <li>• 3 new bids on "Custom Oil Painting" in the last hour</li>
                  <li>• Product approval: "Vintage Leather Bag" is now live</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </SellerLayout>
    </QuickMelaRoleGuard>
  );
};

export default SellerDashboard;
