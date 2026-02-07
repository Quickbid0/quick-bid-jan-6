import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  DollarSign, 
  Eye,
  Clock,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Target,
  Zap,
  Award,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  ShoppingCart,
  Heart,
  Star,
  MessageSquare,
  Share2,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  PieChart,
  LineChart,
  MapPin,
  CreditCard,
  Wallet,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalRevenue: number;
    totalAuctions: number;
    conversionRate: number;
    avgOrderValue: number;
  };
  trends: {
    users: Array<{ date: string; count: number }>;
    revenue: Array<{ date: string; amount: number }>;
    auctions: Array<{ date: string; count: number }>;
  };
  demographics: {
    ageGroups: Array<{ range: string; percentage: number }>;
    gender: Array<{ type: string; percentage: number }>;
    locations: Array<{ city: string; users: number; revenue: number }>;
  };
  behavior: {
    deviceUsage: Array<{ device: string; percentage: number }>;
    peakHours: Array<{ hour: number; activity: number }>;
    popularCategories: Array<{ category: string; views: number; bids: number }>;
    userRetention: Array<{ period: string; percentage: number }>;
  };
  financial: {
    revenueStreams: Array<{ source: string; amount: number; percentage: number }>;
    paymentMethods: Array<{ method: string; count: number; percentage: number }>;
    topSellers: Array<{ name: string; revenue: number; auctions: number }>;
    averageBidValues: Array<{ category: string; avgBid: number }>;
  };
}

const EnhancedAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);

  // Sample analytics data
  const sampleData: AnalyticsData = {
    overview: {
      totalUsers: 15420,
      activeUsers: 3420,
      totalRevenue: 28450000,
      totalAuctions: 8934,
      conversionRate: 12.5,
      avgOrderValue: 45000
    },
    trends: {
      users: [
        { date: '2024-01-01', count: 12000 },
        { date: '2024-01-07', count: 12800 },
        { date: '2024-01-14', count: 13500 },
        { date: '2024-01-21', count: 14200 },
        { date: '2024-01-28', count: 14800 },
        { date: '2024-02-04', count: 15420 }
      ],
      revenue: [
        { date: '2024-01-01', amount: 2000000 },
        { date: '2024-01-07', amount: 2200000 },
        { date: '2024-01-14', amount: 2400000 },
        { date: '2024-01-21', amount: 2600000 },
        { date: '2024-01-28', amount: 2700000 },
        { date: '2024-02-04', amount: 2845000 }
      ],
      auctions: [
        { date: '2024-01-01', count: 1200 },
        { date: '2024-01-07', count: 1350 },
        { date: '2024-01-14', count: 1420 },
        { date: '2024-01-21', count: 1500 },
        { date: '2024-01-28', count: 1600 },
        { date: '2024-02-04', count: 1680 }
      ]
    },
    demographics: {
      ageGroups: [
        { range: '18-24', percentage: 15 },
        { range: '25-34', percentage: 35 },
        { range: '35-44', percentage: 28 },
        { range: '45-54', percentage: 15 },
        { range: '55+', percentage: 7 }
      ],
      gender: [
        { type: 'Male', percentage: 58 },
        { type: 'Female', percentage: 40 },
        { type: 'Other', percentage: 2 }
      ],
      locations: [
        { city: 'Mumbai', users: 3200, revenue: 8500000 },
        { city: 'Delhi', users: 2800, revenue: 7200000 },
        { city: 'Bangalore', users: 2400, revenue: 6800000 },
        { city: 'Chennai', users: 1800, revenue: 3500000 },
        { city: 'Kolkata', users: 1500, revenue: 2450000 }
      ]
    },
    behavior: {
      deviceUsage: [
        { device: 'Desktop', percentage: 45 },
        { device: 'Mobile', percentage: 40 },
        { device: 'Tablet', percentage: 15 }
      ],
      peakHours: [
        { hour: 0, activity: 20 },
        { hour: 6, activity: 35 },
        { hour: 12, activity: 80 },
        { hour: 18, activity: 95 },
        { hour: 21, activity: 70 }
      ],
      popularCategories: [
        { category: 'Electronics', views: 45000, bids: 12000 },
        { category: 'Vehicles', views: 38000, bids: 8500 },
        { category: 'Jewelry', views: 32000, bids: 6800 },
        { category: 'Watches', views: 28000, bids: 5200 },
        { category: 'Furniture', views: 24000, bids: 4200 }
      ],
      userRetention: [
        { period: 'Day 1', percentage: 100 },
        { period: 'Day 7', percentage: 75 },
        { period: 'Day 30', percentage: 45 },
        { period: 'Day 90', percentage: 25 }
      ]
    },
    financial: {
      revenueStreams: [
        { source: 'Commission Fees', amount: 14225000, percentage: 50 },
        { source: 'Listing Fees', amount: 5680000, percentage: 20 },
        { source: 'Premium Features', amount: 4267500, percentage: 15 },
        { source: 'Advertising', amount: 2845000, percentage: 10 },
        { source: 'Other', amount: 1422500, percentage: 5 }
      ],
      paymentMethods: [
        { method: 'Credit Card', count: 8500, percentage: 60 },
        { method: 'Debit Card', count: 3500, percentage: 25 },
        { method: 'UPI', count: 1400, percentage: 10 },
        { method: 'Net Banking', count: 700, percentage: 5 }
      ],
      topSellers: [
        { name: 'TechStore Pro', revenue: 2500000, auctions: 45 },
        { name: 'Luxury Timepieces', revenue: 2200000, auctions: 38 },
        { name: 'Auto Elite', revenue: 1800000, auctions: 32 },
        { name: 'Heritage Homes', revenue: 1500000, auctions: 28 }
      ],
      averageBidValues: [
        { category: 'Vehicles', avgBid: 2500000 },
        { category: 'Jewelry', avgBid: 850000 },
        { category: 'Watches', avgBid: 450000 },
        { category: 'Electronics', avgBid: 35000 },
        { category: 'Furniture', avgBid: 25000 }
      ]
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setData(sampleData);
      setLoading(false);
    };

    loadData();
  }, [timeRange]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    } else if (current < previous) {
      return <ArrowDownRight className="w-4 h-4 text-red-600" />;
    }
    return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'demographics', label: 'Demographics', icon: Users },
    { id: 'behavior', label: 'User Behavior', icon: Activity },
    { id: 'financial', label: 'Financial', icon: DollarSign }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Enhanced Analytics</h1>
            <p className="text-indigo-100">Comprehensive insights and performance metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-indigo-400 rounded-lg bg-indigo-500 text-white focus:ring-2 focus:ring-indigo-300"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-5 h-5 text-blue-200" />
                    {getTrendIcon(data.overview.totalUsers, 14000)}
                  </div>
                  <p className="text-blue-100 text-xs">Total Users</p>
                  <p className="text-xl font-bold">{formatNumber(data.overview.totalUsers)}</p>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-5 h-5 text-green-200" />
                    {getTrendIcon(data.overview.activeUsers, 3000)}
                  </div>
                  <p className="text-green-100 text-xs">Active Users</p>
                  <p className="text-xl font-bold">{formatNumber(data.overview.activeUsers)}</p>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-5 h-5 text-purple-200" />
                    {getTrendIcon(data.overview.totalRevenue, 25000000)}
                  </div>
                  <p className="text-purple-100 text-xs">Total Revenue</p>
                  <p className="text-xl font-bold">{formatPrice(data.overview.totalRevenue)}</p>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="w-5 h-5 text-orange-200" />
                    {getTrendIcon(data.overview.totalAuctions, 8000)}
                  </div>
                  <p className="text-orange-100 text-xs">Total Auctions</p>
                  <p className="text-xl font-bold">{formatNumber(data.overview.totalAuctions)}</p>
                </div>

                <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="w-5 h-5 text-pink-200" />
                    {getTrendIcon(data.overview.conversionRate, 10)}
                  </div>
                  <p className="text-pink-100 text-xs">Conversion Rate</p>
                  <p className="text-xl font-bold">{data.overview.conversionRate}%</p>
                </div>

                <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <ShoppingCart className="w-5 h-5 text-teal-200" />
                    {getTrendIcon(data.overview.avgOrderValue, 40000)}
                  </div>
                  <p className="text-teal-100 text-xs">Avg Order Value</p>
                  <p className="text-xl font-bold">{formatPrice(data.overview.avgOrderValue)}</p>
                </div>
              </div>

              {/* Trend Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">User Growth</h4>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">User growth chart</p>
                      <p className="text-sm text-gray-400">+{formatNumber(data.overview.totalUsers - 12000)} this period</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Revenue Trends</h4>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Revenue chart</p>
                      <p className="text-sm text-gray-400">{formatPrice(data.overview.totalRevenue)} total</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Auction Activity</h4>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Auction distribution</p>
                      <p className="text-sm text-gray-400">{formatNumber(data.overview.totalAuctions)} total</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'demographics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Age Groups */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Age Distribution</h4>
                  <div className="space-y-3">
                    {data.demographics.ageGroups.map((group) => (
                      <div key={group.range} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{group.range}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-indigo-600 h-2 rounded-full" 
                              style={{ width: `${group.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{group.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gender Distribution */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Gender Distribution</h4>
                  <div className="space-y-3">
                    {data.demographics.gender.map((gender) => (
                      <div key={gender.type} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{gender.type}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full" 
                              style={{ width: `${gender.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{gender.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Geographic Distribution */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 lg:col-span-2">
                  <h4 className="font-medium text-gray-900 mb-4">Top Locations</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">City</th>
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Users</th>
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Revenue</th>
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Avg per User</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.demographics.locations.map((location) => (
                          <tr key={location.city} className="border-b border-gray-100">
                            <td className="py-2 px-4">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium">{location.city}</span>
                              </div>
                            </td>
                            <td className="py-2 px-4 text-sm text-gray-600">{formatNumber(location.users)}</td>
                            <td className="py-2 px-4 text-sm text-gray-600">{formatPrice(location.revenue)}</td>
                            <td className="py-2 px-4 text-sm text-gray-600">
                              {formatPrice(location.revenue / location.users)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'behavior' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Device Usage */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Device Usage</h4>
                  <div className="space-y-3">
                    {data.behavior.deviceUsage.map((device) => (
                      <div key={device.device} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {device.device === 'Desktop' && <Monitor className="w-4 h-4 text-gray-600" />}
                          {device.device === 'Mobile' && <Smartphone className="w-4 h-4 text-gray-600" />}
                          {device.device === 'Tablet' && <Tablet className="w-4 h-4 text-gray-600" />}
                          <span className="text-sm text-gray-600">{device.device}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${device.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{device.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popular Categories */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Popular Categories</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Category</th>
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Views</th>
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Bids</th>
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Conversion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.behavior.popularCategories.map((category) => (
                          <tr key={category.category} className="border-b border-gray-100">
                            <td className="py-2 px-4 text-sm font-medium">{category.category}</td>
                            <td className="py-2 px-4 text-sm text-gray-600">{formatNumber(category.views)}</td>
                            <td className="py-2 px-4 text-sm text-gray-600">{formatNumber(category.bids)}</td>
                            <td className="py-2 px-4 text-sm text-gray-600">
                              {((category.bids / category.views) * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Peak Hours */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Peak Activity Hours</h4>
                  <div className="space-y-2">
                    {data.behavior.peakHours.map((hour) => (
                      <div key={hour.hour} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{hour.hour}:00</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-600 h-2 rounded-full" 
                              style={{ width: `${hour.activity}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{hour.activity}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* User Retention */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">User Retention</h4>
                  <div className="space-y-2">
                    {data.behavior.userRetention.map((period) => (
                      <div key={period.period} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{period.period}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${period.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{period.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="space-y-6">
              {/* Revenue Streams */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Revenue Streams</h4>
                <div className="space-y-3">
                  {data.financial.revenueStreams.map((stream) => (
                    <div key={stream.source} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">{stream.source}</span>
                          <span className="text-sm text-gray-600">{formatPrice(stream.amount)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${stream.percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{stream.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Methods */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Payment Methods</h4>
                  <div className="space-y-3">
                    {data.financial.paymentMethods.map((method) => (
                      <div key={method.method} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {method.method === 'Credit Card' && <CreditCard className="w-4 h-4 text-gray-600" />}
                          {method.method === 'Debit Card' && <CreditCard className="w-4 h-4 text-gray-600" />}
                          {method.method === 'UPI' && <Wallet className="w-4 h-4 text-gray-600" />}
                          {method.method === 'Net Banking' && <Globe className="w-4 h-4 text-gray-600" />}
                          <span className="text-sm text-gray-600">{method.method}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{formatNumber(method.count)}</span>
                          <span className="text-sm font-medium">{method.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Sellers */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Top Sellers</h4>
                  <div className="space-y-3">
                    {data.financial.topSellers.map((seller, index) => (
                      <div key={seller.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-medium text-indigo-600">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium">{seller.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatPrice(seller.revenue)}</p>
                          <p className="text-xs text-gray-500">{seller.auctions} auctions</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Average Bid Values */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Average Bid Values by Category</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.financial.averageBidValues.map((category) => (
                    <div key={category.category} className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-900">{category.category}</p>
                      <p className="text-lg font-bold text-indigo-600">{formatPrice(category.avgBid)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-purple-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-purple-900 mb-2">AI-Powered Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-purple-700">
              <div>
                <p className="font-medium">📈 Growth Opportunity</p>
                <p>Mobile users show 23% higher conversion rates. Consider mobile-first optimizations.</p>
              </div>
              <div>
                <p className="font-medium">🎯 Target Audience</p>
                <p>25-34 age group represents 35% of users but 45% of revenue. Focus marketing here.</p>
              </div>
              <div>
                <p className="font-medium">💰 Revenue Optimization</p>
                <p>Electronics category has highest bid-to-view ratio. Expand this category.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAnalytics;
