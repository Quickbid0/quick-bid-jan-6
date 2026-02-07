import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { toast } from 'react-hot-toast';
import {
  BarChart3, TrendingUp, Users, DollarSign, Activity,
  Calendar, MapPin, Clock, Target, Award, Eye, ShoppingCart,
  RefreshCw, Download, Filter, TrendingDown, AlertTriangle
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalAuctions: number;
    activeAuctions: number;
    totalRevenue: number;
    totalBids: number;
  };
  userMetrics: {
    dailyRegistrations: Array<{ date: string; count: number }>;
    userRetention: number;
    topLocations: Array<{ location: string; count: number }>;
    userTypes: { buyers: number; sellers: number; admins: number };
  };
  auctionMetrics: {
    auctionSuccessRate: number;
    averageAuctionDuration: number;
    topCategories: Array<{ category: string; count: number; revenue: number }>;
    biddingActivity: Array<{ hour: number; bids: number }>;
  };
  financialMetrics: {
    totalGMV: number;
    platformCommission: number;
    paymentSuccessRate: number;
    refundRate: number;
    revenueByMonth: Array<{ month: string; revenue: number }>;
  };
  performanceMetrics: {
    averagePageLoadTime: number;
    apiResponseTime: number;
    errorRate: number;
    uptime: number;
  };
}

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch analytics data from backend APIs
      const [overviewRes, userMetricsRes, auctionMetricsRes, financialMetricsRes, performanceRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/analytics/overview?period=${timeRange}`),
        fetch(`${import.meta.env.VITE_API_URL}/api/analytics/users?period=${timeRange}`),
        fetch(`${import.meta.env.VITE_API_URL}/api/analytics/auctions?period=${timeRange}`),
        fetch(`${import.meta.env.VITE_API_URL}/api/analytics/financial?period=${timeRange}`),
        fetch(`${import.meta.env.VITE_API_URL}/api/analytics/performance?period=${timeRange}`)
      ]);

      const analyticsData: AnalyticsData = {
        overview: overviewRes.ok ? await overviewRes.json() : getMockOverview(),
        userMetrics: userMetricsRes.ok ? await userMetricsRes.json() : getMockUserMetrics(),
        auctionMetrics: auctionMetricsRes.ok ? await auctionMetricsRes.json() : getMockAuctionMetrics(),
        financialMetrics: financialMetricsRes.ok ? await financialMetricsRes.json() : getMockFinancialMetrics(),
        performanceMetrics: performanceRes.ok ? await performanceRes.json() : getMockPerformanceMetrics()
      };

      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics data');
      setAnalytics(getMockAnalytics());
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
    toast.success('Analytics data refreshed');
  };

  const exportData = () => {
    if (!analytics) return;

    const dataStr = JSON.stringify(analytics, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `quickmela-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Mock data functions for when backend is not available
  const getMockOverview = () => ({
    totalUsers: 1250,
    activeUsers: 890,
    totalAuctions: 450,
    activeAuctions: 67,
    totalRevenue: 875000,
    totalBids: 3200
  });

  const getMockUserMetrics = () => ({
    dailyRegistrations: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      count: Math.floor(Math.random() * 20) + 5
    })),
    userRetention: 78.5,
    topLocations: [
      { location: 'Mumbai', count: 234 },
      { location: 'Delhi', count: 198 },
      { location: 'Bangalore', count: 156 },
      { location: 'Pune', count: 134 },
      { location: 'Chennai', count: 98 }
    ],
    userTypes: { buyers: 890, sellers: 234, admins: 15 }
  });

  const getMockAuctionMetrics = () => ({
    auctionSuccessRate: 82.3,
    averageAuctionDuration: 45.6,
    topCategories: [
      { category: 'Vehicles', count: 145, revenue: 450000 },
      { category: 'Electronics', count: 98, revenue: 180000 },
      { category: 'Collectibles', count: 67, revenue: 120000 },
      { category: 'Jewelry', count: 43, revenue: 95000 },
      { category: 'Art', count: 32, revenue: 78000 }
    ],
    biddingActivity: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      bids: Math.floor(Math.random() * 50) + 10
    }))
  });

  const getMockFinancialMetrics = () => ({
    totalGMV: 875000,
    platformCommission: 87500,
    paymentSuccessRate: 94.2,
    refundRate: 3.1,
    revenueByMonth: Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      revenue: Math.floor(Math.random() * 50000) + 25000
    }))
  });

  const getMockPerformanceMetrics = () => ({
    averagePageLoadTime: 2.3,
    apiResponseTime: 145,
    errorRate: 1.2,
    uptime: 99.7
  });

  const getMockAnalytics = (): AnalyticsData => ({
    overview: getMockOverview(),
    userMetrics: getMockUserMetrics(),
    auctionMetrics: getMockAuctionMetrics(),
    financialMetrics: getMockFinancialMetrics(),
    performanceMetrics: getMockPerformanceMetrics()
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const getChangeIndicator = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0,
      icon: change >= 0 ? TrendingUp : TrendingDown,
      color: change >= 0 ? 'text-green-600' : 'text-red-600'
    };
  };

  if (loading || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">Comprehensive platform insights and performance metrics</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              {/* Export Button */}
              <button
                onClick={exportData}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.overview.totalUsers)}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+12.5%</span>
              <span className="text-gray-500 ml-1">vs last period</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Auctions</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.activeAuctions}</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+8.2%</span>
              <span className="text-gray-500 ml-1">vs last period</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.overview.totalRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+15.3%</span>
              <span className="text-gray-500 ml-1">vs last period</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.auctionMetrics.auctionSuccessRate}%</p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+2.1%</span>
              <span className="text-gray-500 ml-1">vs last period</span>
            </div>
          </div>
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Registration Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Registrations Trend</h3>
            <Line
              data={{
                labels: analytics.userMetrics.dailyRegistrations.slice(0, 14).map(day =>
                  new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                ),
                datasets: [{
                  label: 'New Registrations',
                  data: analytics.userMetrics.dailyRegistrations.slice(0, 14).map(day => day.count),
                  borderColor: 'rgb(59, 130, 246)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  tension: 0.4,
                  fill: true,
                }],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 0, 0, 0.1)' },
                  },
                  x: {
                    grid: { display: false },
                  },
                },
              }}
            />
          </motion.div>

          {/* Revenue by Month */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Revenue</h3>
            <Bar
              data={{
                labels: analytics.financialMetrics.revenueByMonth.map(item => item.month),
                datasets: [{
                  label: 'Revenue (₹)',
                  data: analytics.financialMetrics.revenueByMonth.map(item => item.revenue),
                  backgroundColor: 'rgba(16, 185, 129, 0.8)',
                  borderColor: 'rgba(16, 185, 129, 1)',
                  borderWidth: 1,
                }],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `₹${(Number(value) / 1000).toFixed(0)}K`,
                    },
                  },
                },
              }}
            />
          </motion.div>

          {/* Category Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Distribution</h3>
            <Doughnut
              data={{
                labels: analytics.auctionMetrics.topCategories.map(cat => cat.category),
                datasets: [{
                  data: analytics.auctionMetrics.topCategories.map(cat => cat.count),
                  backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 101, 101, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                  ],
                  borderWidth: 2,
                  borderColor: '#ffffff',
                }],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                    labels: {
                      padding: 20,
                      usePointStyle: true,
                    },
                  },
                },
              }}
            />
          </motion.div>

          {/* Bidding Activity by Hour */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bidding Activity by Hour</h3>
            <Bar
              data={{
                labels: analytics.auctionMetrics.biddingActivity.map(hour =>
                  `${hour.hour}:00`
                ),
                datasets: [{
                  label: 'Bids',
                  data: analytics.auctionMetrics.biddingActivity.map(hour => hour.bids),
                  backgroundColor: 'rgba(139, 92, 246, 0.8)',
                  borderColor: 'rgba(139, 92, 246, 1)',
                  borderWidth: 1,
                }],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: { beginAtZero: true },
                },
              }}
            />
          </motion.div>
        </div>

        {/* Top Locations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Locations</h3>
          <div className="space-y-4">
            {analytics.userMetrics.topLocations.map((location, index) => (
              <motion.div
                key={location.location}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">{location.location}</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{location.count} users</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-3 mr-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${(location.count / analytics.userMetrics.topLocations[0].count) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[3rem] text-right">
                    {((location.count / analytics.userMetrics.topLocations.reduce((sum, loc) => sum + loc.count, 0)) * 100).toFixed(1)}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Page Load</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.performanceMetrics.averagePageLoadTime}s</p>
              </div>
              <Clock className="w-8 h-8 text-indigo-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">API Response</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.performanceMetrics.apiResponseTime}ms</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Error Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.performanceMetrics.errorRate}%</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.performanceMetrics.uptime}%</p>
              </div>
              <Award className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.financialMetrics.totalGMV)}</p>
              <p className="text-sm text-gray-600">Total GMV</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(analytics.financialMetrics.platformCommission)}</p>
              <p className="text-sm text-gray-600">Platform Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{analytics.financialMetrics.paymentSuccessRate}%</p>
              <p className="text-sm text-gray-600">Payment Success</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{analytics.financialMetrics.refundRate}%</p>
              <p className="text-sm text-gray-600">Refund Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
