import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Plus, 
  BarChart3, 
  Package, 
  DollarSign,
  TrendingUp,
  Users,
  Star,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  Upload,
  Settings,
  Award,
  Shield,
  Calendar,
  Trophy,
  Camera,
  FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SellerCenter = () => {
  const [stats, setStats] = useState({
    totalProducts: 45,
    activeAuctions: 12,
    totalRevenue: 1250000,
    avgPrice: 27777,
    successRate: 87,
    totalViews: 15420,
    conversionRate: 12.5,
    customerRating: 4.8
  });

  const [recentProducts, setRecentProducts] = useState([
    {
      id: '1',
      title: 'Vintage Camera Collection',
      image_url: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?auto=format&fit=crop&w=400&q=80',
      current_price: 15000,
      status: 'active',
      views: 89,
      bids: 5,
      time_left: '2d 5h',
      category: 'Electronics'
    },
    {
      id: '2',
      title: 'Handmade Pottery Set',
      image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=400&q=80',
      current_price: 2500,
      status: 'sold',
      views: 156,
      bids: 12,
      time_left: 'Ended',
      category: 'Handmade'
    },
    {
      id: '3',
      title: 'Antique Wooden Chest',
      image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80',
      current_price: 8500,
      status: 'active',
      views: 234,
      bids: 8,
      time_left: '5d 12h',
      category: 'Antiques'
    },
    {
      id: '4',
      title: 'Contemporary Oil Painting',
      image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=400&q=80',
      current_price: 35000,
      status: 'pending',
      views: 67,
      bids: 0,
      time_left: 'Pending Approval',
      category: 'Art'
    }
  ]);

  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Revenue',
      data: [85000, 120000, 95000, 140000, 180000, 210000],
      borderColor: '#4F46E5',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const categoryData = {
    labels: ['Electronics', 'Art', 'Antiques', 'Jewelry', 'Handmade', 'Others'],
    datasets: [{
      label: 'Sales by Category',
      data: [12, 8, 15, 6, 4, 3],
      backgroundColor: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280']
    }]
  };

  const performanceData = {
    labels: ['Views', 'Bids', 'Sales', 'Rating', 'Response'],
    datasets: [{
      label: 'Performance Metrics',
      data: [85, 78, 87, 96, 92],
      backgroundColor: 'rgba(79, 70, 229, 0.2)',
      borderColor: '#4F46E5',
      pointBackgroundColor: '#4F46E5'
    }]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Seller Center</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">Manage your products and track performance</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Link
            to="/add-product"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Product
          </Link>
          <Link
            to="/bulk-upload"
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Upload className="h-5 w-5" />
            Bulk Upload
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalProducts}</p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Auctions</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeAuctions}</p>
            </div>
            <Clock className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-600">₹{(stats.totalRevenue / 100000).toFixed(1)}L</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Price</p>
              <p className="text-2xl font-bold text-orange-600">₹{stats.avgPrice.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Success Rate</p>
              <p className="text-2xl font-bold text-red-600">{stats.successRate}%</p>
            </div>
            <Star className="h-8 w-8 text-red-500"  />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Views</p>
              <p className="text-2xl font-bold text-cyan-600">{stats.totalViews.toLocaleString()}</p>
            </div>
            <Eye className="h-8 w-8 text-cyan-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Conversion</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.conversionRate}%</p>
            </div>
            <BarChart3 className="h-8 w-8 text-indigo-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rating</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.customerRating}</p>
            </div>
            <Award className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Revenue Trend</h2>
          <div className="h-64">
            <Line
              data={salesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, grid: { display: false } },
                  x: { grid: { display: false } }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Sales by Category</h2>
          <div className="h-64">
            <Bar
              data={categoryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, grid: { display: false } },
                  x: { grid: { display: false } }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Link
          to="/add-product"
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="text-center">
            <div className="p-3 bg-indigo-100 rounded-lg inline-block mb-3">
              <Plus className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Add Product</h3>
            <p className="text-sm text-gray-500">List a new item</p>
          </div>
        </Link>

        <Link
          to="/seller/analytics"
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="text-center">
            <div className="p-3 bg-green-100 rounded-lg inline-block mb-3">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Analytics</h3>
            <p className="text-sm text-gray-500">View insights</p>
          </div>
        </Link>

        <Link
          to="/bulk-upload"
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="text-center">
            <div className="p-3 bg-purple-100 rounded-lg inline-block mb-3">
              <Upload className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Bulk Upload</h3>
            <p className="text-sm text-gray-500">Upload multiple</p>
          </div>
        </Link>

        <Link
          to="/profile"
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="text-center">
            <div className="p-3 bg-orange-100 rounded-lg inline-block mb-3">
              <Settings className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Settings</h3>
            <p className="text-sm text-gray-500">Manage profile</p>
          </div>
        </Link>
      </div>

      {/* Recent Products */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Products</h2>
            <Link
              to="/products"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {recentProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-16 h-16 rounded-lg object-cover shadow-md"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white text-lg">{product.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {product.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {product.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {product.bids} bids
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {product.time_left}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600 text-xl">₹{product.current_price.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    {product.status === 'active' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : product.status === 'sold' ? (
                      <Trophy className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm text-gray-500 ml-1 capitalize">{product.status}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Performance Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <h3 className="font-medium text-blue-800 dark:text-blue-200">Best Category</h3>
            </div>
            <p className="text-blue-600 dark:text-blue-300 font-semibold">
              Electronics (45% of sales)
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Star className="h-6 w-6 text-green-600" />
              <h3 className="font-medium text-green-800 dark:text-green-200">Top Rated</h3>
            </div>
            <p className="text-green-600 dark:text-green-300 font-semibold">
              4.8/5 customer rating
            </p>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="h-6 w-6 text-yellow-600" />
              <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Avg Views</h3>
            </div>
            <p className="text-yellow-600 dark:text-yellow-300 font-semibold">
              {Math.round(stats.totalViews / stats.totalProducts)} per item
            </p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Award className="h-6 w-6 text-purple-600" />
              <h3 className="font-medium text-purple-800 dark:text-purple-200">Success Rate</h3>
            </div>
            <p className="text-purple-600 dark:text-purple-300 font-semibold">
              {stats.successRate}% sold
            </p>
          </div>
        </div>
      </div>

      {/* Seller Tips */}
      <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center mb-8">Seller Success Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-xl mb-4 inline-block">
              <Camera className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="font-semibold mb-2">High-Quality Photos</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Use multiple high-resolution images from different angles
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-xl mb-4 inline-block">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Detailed Descriptions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Provide comprehensive details about condition and history
            </p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-xl mb-4 inline-block">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Build Trust</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Maintain high ratings and respond quickly to questions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerCenter;