// 📊 USAGE ANALYTICS DASHBOARD
// src/pages/admin/UsageAnalytics.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import UsageTrackingService from '../../services/usageTracking.service';
import { UsageMetrics } from '../../services/usageTracking.service';

const UsageAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const usageTracker = new UsageTrackingService();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await usageTracker.collectMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    
    // Refresh metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Usage Analytics</h1>
          <p className="text-gray-600">Real-time user behavior and platform metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">1,247</div>
            <div className="text-sm text-green-600">+12.5% from last month</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Active Auctions</h3>
              <Activity className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">89</div>
            <div className="text-sm text-green-600">+8.2% from last week</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
              <DollarSign className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">₹2.4M</div>
            <div className="text-sm text-green-600">+15.3% from last month</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Conversion Rate</h3>
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">24.7%</div>
            <div className="text-sm text-green-600">+2.1% from last week</div>
          </div>
        </div>

        {/* Placeholder for Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Activity Chart</h2>
            <div className="h-64 flex items-center justify-center text-gray-500">
              Chart visualization would be displayed here
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h2>
            <div className="h-64 flex items-center justify-center text-gray-500">
              Revenue chart would be displayed here
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Auction Performance</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-sm font-medium">87.3%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg. Duration</span>
                <span className="text-sm font-medium">5.2 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg. Bids</span>
                <span className="text-sm font-medium">12.4</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Analytics</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-sm font-medium">94.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg. Processing</span>
                <span className="text-sm font-medium">2.3s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Volume</span>
                <span className="text-sm font-medium">₹1.8M</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Engagement</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Daily Active</span>
                <span className="text-sm font-medium">342</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Session Duration</span>
                <span className="text-sm font-medium">8.7 min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Return Rate</span>
                <span className="text-sm font-medium">68.4%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center text-sm text-gray-500 mt-8">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}
