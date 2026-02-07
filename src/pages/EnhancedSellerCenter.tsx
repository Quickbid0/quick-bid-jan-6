import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  BarChart3, TrendingUp, Package, Plus, Edit, Trash2,
  Eye, DollarSign, Clock, Users, CheckCircle, XCircle,
  Upload, Download, Filter, Search, Calendar, Star,
  AlertTriangle, Settings, Target, Activity, Copy,
  BookOpen, HelpCircle, MessageSquare
} from 'lucide-react';

interface SellerListing {
  id: string;
  title: string;
  category: string;
  status: 'draft' | 'active' | 'ended' | 'sold';
  current_price: number;
  starting_price: number;
  views: number;
  bids: number;
  end_date: string;
  image_url: string;
}

interface SellerAnalytics {
  totalListings: number;
  activeListings: number;
  totalViews: number;
  totalBids: number;
  totalRevenue: number;
  averageBidCount: number;
  successRate: number;
  topPerformingCategory: string;
  recentActivity: Array<{
    type: 'bid' | 'view' | 'sold';
    listing: string;
    amount?: number;
    timestamp: Date;
  }>;
}

const EnhancedSellerCenter = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'listings' | 'analytics' | 'bulk' | 'tools'>('dashboard');
  const [listings, setListings] = useState<SellerListing[]>([]);
  const [analytics, setAnalytics] = useState<SellerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadSellerData();
    }
  }, [user]);

  const loadSellerData = async () => {
    try {
      setLoading(true);

      // Load seller listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('auctions')
        .select(`
          id,
          title,
          category,
          status,
          current_price,
          starting_price,
          views,
          bids,
          end_date,
          product:products(image_url)
        `)
        .eq('seller_id', user?.id);

      if (listingsError) {
        console.error('Error loading listings:', listingsError);
      } else {
        const formattedListings = (listingsData || []).map((listing: any) => ({
          id: listing.id,
          title: listing.title,
          category: listing.category || 'General',
          status: listing.status || 'active',
          current_price: listing.current_price || 0,
          starting_price: listing.starting_price || 0,
          views: listing.views || 0,
          bids: listing.bids || 0,
          end_date: listing.end_date,
          image_url: listing.product?.image_url || '/placeholder.jpg'
        }));
        setListings(formattedListings);
      }

      // Load analytics data
      const analyticsData = await generateAnalytics(listingsData || []);
      setAnalytics(analyticsData);

    } catch (error) {
      console.error('Error loading seller data:', error);
      toast.error('Failed to load seller data');
    } finally {
      setLoading(false);
    }
  };

  const generateAnalytics = (listingsData: any[]): SellerAnalytics => {
    const totalListings = listingsData.length;
    const activeListings = listingsData.filter((l: any) => l.status === 'active').length;
    const totalViews = listingsData.reduce((sum: number, l: any) => sum + (l.views || 0), 0);
    const totalBids = listingsData.reduce((sum: number, l: any) => sum + (l.bids || 0), 0);
    const totalRevenue = listingsData.reduce((sum: number, l: any) => sum + (l.current_price || 0), 0);
    const averageBidCount = totalListings > 0 ? totalBids / totalListings : 0;
    const successRate = totalListings > 0 ? (activeListings / totalListings) * 100 : 0;

    // Calculate top performing category
    const categoryStats: Record<string, { count: number; revenue: number }> = {};
    
    listingsData.forEach((listing: any) => {
      const category = listing.category || 'General';
      if (!categoryStats[category]) {
        categoryStats[category] = { count: 0, revenue: 0 };
      }
      categoryStats[category].count++;
      categoryStats[category].revenue += listing.current_price || 0;
    });

    const topCategory = Object.entries(categoryStats)
      .sort(([, a]: [string, { count: number; revenue: number }], [, b]: [string, { count: number; revenue: number }]) => b.revenue - a.revenue)[0]?.[0] || 'None';

    // Generate recent activity (mock data for demo)
    const recentActivity = [
      { type: 'bid' as const, listing: 'Vintage Rolex', amount: 125000, timestamp: new Date(Date.now() - 1000 * 60 * 30) },
      { type: 'view' as const, listing: 'BMW X5', timestamp: new Date(Date.now() - 1000 * 60 * 60) },
      { type: 'sold' as const, listing: 'iPhone 15 Pro', amount: 85000, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) }
    ];

    return {
      totalListings,
      activeListings,
      totalViews,
      totalBids,
      totalRevenue,
      averageBidCount,
      successRate,
      topPerformingCategory: topCategory,
      recentActivity
    };
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleBulkAction = async (action: 'delete' | 'pause' | 'activate') => {
    if (selectedListings.length === 0) {
      toast.error('Please select listings first');
      return;
    }

    try {
      if (action === 'delete') {
        const { error } = await supabase
          .from('auctions')
          .delete()
          .in('id', selectedListings);

        if (error) throw error;
        toast.success(`Deleted ${selectedListings.length} listings`);
      } else {
        const newStatus = action === 'pause' ? 'paused' : 'active';
        const { error } = await supabase
          .from('auctions')
          .update({ status: newStatus })
          .in('id', selectedListings);

        if (error) throw error;
        toast.success(`${action === 'pause' ? 'Paused' : 'Activated'} ${selectedListings.length} listings`);
      }

      setSelectedListings([]);
      loadSellerData();
    } catch (error) {
      console.error('Bulk action failed:', error);
      toast.error('Bulk action failed');
    }
  };

  const duplicateListing = async (listingId: string) => {
    try {
      const listing = listings.find(l => l.id === listingId);
      if (!listing) return;

      const { data, error } = await supabase
        .from('auctions')
        .insert({
          seller_id: user?.id,
          title: `${listing.title} (Copy)`,
          category: listing.category,
          starting_price: listing.starting_price,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Listing duplicated successfully');
      loadSellerData();
    } catch (error) {
      console.error('Duplicate listing failed:', error);
      toast.error('Failed to duplicate listing');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seller Center</h1>
          <p className="text-gray-600 mt-2">Manage your listings, track performance, and grow your sales</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'listings', label: 'My Listings', icon: Package },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'bulk', label: 'Bulk Operations', icon: Settings },
                { id: 'tools', label: 'Advanced Tools', icon: Target }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && analytics && (
          <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Listings</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalListings}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Listings</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.activeListings}</p>
                  </div>
                  <Activity className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-yellow-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.successRate.toFixed(1)}%</p>
                  </div>
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {analytics.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          activity.type === 'bid' ? 'bg-green-100' :
                          activity.type === 'sold' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          {activity.type === 'bid' && <TrendingUp className="w-4 h-4 text-green-600" />}
                          {activity.type === 'sold' && <CheckCircle className="w-4 h-4 text-blue-600" />}
                          {activity.type === 'view' && <Eye className="w-4 h-4 text-gray-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{activity.listing}</p>
                          <p className="text-sm text-gray-500">
                            {activity.type === 'bid' && `New bid: ${formatCurrency(activity.amount || 0)}`}
                            {activity.type === 'sold' && `Sold for: ${formatCurrency(activity.amount || 0)}`}
                            {activity.type === 'view' && 'New view'}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {activity.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="bg-white rounded-lg shadow-sm border">
            {/* Search and Filters */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search listings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="ended">Ended</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
                <button
                  onClick={() => window.location.href = '/add-product'}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Listing
                </button>
              </div>
            </div>

            {/* Listings Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedListings(filteredListings.map(l => l.id));
                          } else {
                            setSelectedListings([]);
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Listing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredListings.map((listing) => (
                    <tr key={listing.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedListings.includes(listing.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedListings([...selectedListings, listing.id]);
                            } else {
                              setSelectedListings(selectedListings.filter(id => id !== listing.id));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={listing.image_url}
                            alt={listing.title}
                            className="w-10 h-10 rounded-lg object-cover mr-3"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{listing.title}</div>
                            <div className="text-sm text-gray-500">{listing.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(listing.current_price)}</div>
                        <div className="text-xs text-gray-500">Started: {formatCurrency(listing.starting_price)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          listing.status === 'active' ? 'bg-green-100 text-green-800' :
                          listing.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                          listing.status === 'ended' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {listing.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{listing.views} views</div>
                        <div className="text-sm text-gray-500">{listing.bids} bids</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => window.location.href = `/edit-listing/${listing.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => duplicateListing(listing.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {/* Delete listing */}}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedListings.length > 0 && (
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    {selectedListings.length} listings selected
                  </span>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleBulkAction('activate')}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Activate
                    </button>
                    <button
                      onClick={() => handleBulkAction('pause')}
                      className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                    >
                      Pause
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && analytics && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Performance Overview */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Views</span>
                    <span className="font-semibold">{analytics.totalViews.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Bids</span>
                    <span className="font-semibold">{analytics.totalBids}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Bids per Listing</span>
                    <span className="font-semibold">{analytics.averageBidCount.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Top Category</span>
                    <span className="font-semibold">{analytics.topPerformingCategory}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => window.location.href = '/add-product'}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Listing
                  </button>
                  <button
                    onClick={() => setActiveTab('tools')}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Advanced Tools
                  </button>
                  <button
                    onClick={() => window.open('/seller/analytics', '_blank')}
                    className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Detailed Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bulk' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Operations</h3>
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Bulk Import Listings</h4>
                  <p className="text-gray-600 mb-4">Upload a CSV file to create multiple listings at once</p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Choose CSV File
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Update Prices</h4>
                  <p className="text-sm text-gray-600 mb-3">Apply price changes to multiple listings</p>
                  <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                    Update Prices
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Schedule Auctions</h4>
                  <p className="text-sm text-gray-600 mb-3">Set start/end times for multiple auctions</p>
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                    Schedule Auctions
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Listing Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Star className="w-5 h-5 text-yellow-500 mr-2" />
                    <h4 className="font-medium text-gray-900">AI Title Generator</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Generate compelling titles using AI</p>
                  <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700">
                    Generate Title
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <DollarSign className="w-5 h-5 text-green-500 mr-2" />
                    <h4 className="font-medium text-gray-900">Price Optimizer</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Get AI-powered pricing recommendations</p>
                  <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                    Optimize Price
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Eye className="w-5 h-5 text-blue-500 mr-2" />
                    <h4 className="font-medium text-gray-900">Listing Preview</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">See how your listing appears to buyers</p>
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                    Preview Listing
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Calendar className="w-5 h-5 text-orange-500 mr-2" />
                    <h4 className="font-medium text-gray-900">Auction Scheduler</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Schedule auctions for optimal timing</p>
                  <button className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700">
                    Schedule Auction
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 mb-1">Seller Guide</h4>
                  <p className="text-sm text-gray-600">Learn best practices</p>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <HelpCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 mb-1">FAQ</h4>
                  <p className="text-sm text-gray-600">Common questions</p>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <MessageSquare className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-900 mb-1">Support</h4>
                  <p className="text-sm text-gray-600">Get help from experts</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedSellerCenter;
