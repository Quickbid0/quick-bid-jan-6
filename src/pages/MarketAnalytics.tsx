import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Activity,
  DollarSign,
  Package,
  Users,
  Calendar,
  Target,
  Zap,
  Eye,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MarketAnalytics = () => {
  const [timeframe, setTimeframe] = useState('30d');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  const marketData = {
    totalVolume: 15600000,
    totalTransactions: 1247,
    averagePrice: 12500,
    topCategory: 'Vehicles',
    growthRate: 23.5,
    activeUsers: 2340
  };

  const trendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Market Volume (₹)',
      data: [2100000, 2800000, 3200000, 2900000, 3800000, 4200000],
      borderColor: '#4F46E5',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const categoryData = {
    labels: ['Vehicles', 'Art & Collectibles', 'Electronics', 'Jewelry', 'Antiques', 'Others'],
    datasets: [{
      data: [35, 25, 15, 12, 8, 5],
      backgroundColor: [
        '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'
      ]
    }]
  };

  const priceAnalysis = {
    labels: ['Under ₹10K', '₹10K-50K', '₹50K-1L', '₹1L-5L', '₹5L-25L', 'Above ₹25L'],
    datasets: [{
      label: 'Number of Items',
      data: [450, 320, 180, 120, 80, 25],
      backgroundColor: 'rgba(79, 70, 229, 0.6)',
      borderColor: '#4F46E5',
      borderWidth: 1
    }]
  };

  const performanceMetrics = {
    labels: ['Conversion Rate', 'User Engagement', 'Bid Success Rate', 'Seller Satisfaction', 'Platform Growth'],
    datasets: [{
      label: 'Current Period',
      data: [85, 78, 92, 88, 95],
      backgroundColor: 'rgba(79, 70, 229, 0.2)',
      borderColor: '#4F46E5',
      pointBackgroundColor: '#4F46E5'
    }]
  };

  const insights = [
    {
      title: 'Vehicle Auctions Leading',
      description: 'Seized vehicles from banks and NBFCs show highest transaction volume',
      trend: '+35%',
      color: 'text-green-600'
    },
    {
      title: 'Creative Market Growing',
      description: 'Handmade and artistic items gaining popularity among collectors',
      trend: '+28%',
      color: 'text-blue-600'
    },
    {
      title: 'B2B Adoption Rising',
      description: 'Corporate bulk uploads increasing month over month',
      trend: '+42%',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Market Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive market insights and trends</p>
        </div>
        <div className="flex gap-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 3 Months</option>
            <option value="1y">Last Year</option>
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Categories</option>
            <option value="vehicles">Vehicles</option>
            <option value="art">Art & Collectibles</option>
            <option value="electronics">Electronics</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Volume</p>
              <p className="text-2xl font-bold text-green-600">₹{(marketData.totalVolume / 1000000).toFixed(1)}M</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Transactions</p>
              <p className="text-2xl font-bold text-blue-600">{marketData.totalTransactions}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Price</p>
              <p className="text-2xl font-bold text-purple-600">₹{marketData.averagePrice.toLocaleString()}</p>
            </div>
            <Target className="h-8 w-8 text-purple-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Growth Rate</p>
              <p className="text-2xl font-bold text-green-600">+{marketData.growthRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="text-2xl font-bold text-orange-600">{marketData.activeUsers}</p>
            </div>
            <Users className="h-8 w-8 text-orange-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Top Category</p>
              <p className="text-2xl font-bold text-indigo-600">{marketData.topCategory}</p>
            </div>
            <Package className="h-8 w-8 text-indigo-500" />
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Market Volume Trend</h2>
          <div className="h-64">
            <Line
              data={trendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
              }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Category Distribution</h2>
          <div className="h-64">
            <Doughnut
              data={categoryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Price Range Analysis</h2>
          <div className="h-64">
            <Bar
              data={priceAnalysis}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
              }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
          <div className="h-64">
            <Radar
              data={performanceMetrics}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
              }}
            />
          </div>
        </div>
      </div>

      {/* Market Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Market Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 border rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{insight.title}</h3>
                <span className={`text-sm font-medium ${insight.color}`}>
                  {insight.trend}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{insight.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketAnalytics;