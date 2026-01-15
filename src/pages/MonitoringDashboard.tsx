import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Server, 
  Database, 
  Wifi, 
  Shield, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Clock, 
  Users, 
  Package, 
  DollarSign,
  BarChart3,
  Settings,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import PerformanceMonitor from '../components/PerformanceMonitor';
import HealthCheck from '../components/HealthCheck';

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalProducts: number;
  activeAuctions: number;
  totalBids: number;
  revenue: number;
  serverLoad: number;
  memoryUsage: number;
  networkLatency: number;
  errorRate: number;
  uptime: number;
}

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

const MonitoringDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    totalProducts: 0,
    activeAuctions: 0,
    totalBids: 0,
    revenue: 0,
    serverLoad: 0,
    memoryUsage: 0,
    networkLatency: 0,
    errorRate: 0,
    uptime: 0
  });

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');

  const timeRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];

  const fetchMetrics = async () => {
    try {
      setIsRefreshing(true);
      
      // Simulate API call to fetch metrics
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - in production, this would come from your backend
      const mockMetrics: SystemMetrics = {
        totalUsers: Math.floor(Math.random() * 10000) + 50000,
        activeUsers: Math.floor(Math.random() * 1000) + 5000,
        totalProducts: Math.floor(Math.random() * 1000) + 10000,
        activeAuctions: Math.floor(Math.random() * 100) + 500,
        totalBids: Math.floor(Math.random() * 10000) + 50000,
        revenue: Math.floor(Math.random() * 100000) + 500000,
        serverLoad: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        networkLatency: Math.random() * 200 + 50,
        errorRate: Math.random() * 5,
        uptime: Math.random() * 100
      };
      
      setMetrics(mockMetrics);
      
      // Generate some sample alerts
      const sampleAlerts: Alert[] = [];
      if (mockMetrics.serverLoad > 80) {
        sampleAlerts.push({
          id: Date.now().toString(),
          type: 'warning',
          title: 'High Server Load',
          message: `Server load is at ${mockMetrics.serverLoad.toFixed(1)}%`,
          timestamp: new Date(),
          acknowledged: false
        });
      }
      
      if (mockMetrics.errorRate > 2) {
        sampleAlerts.push({
          id: (Date.now() + 1).toString(),
          type: 'error',
          title: 'High Error Rate',
          message: `Error rate is at ${mockMetrics.errorRate.toFixed(2)}%`,
          timestamp: new Date(),
          acknowledged: false
        });
      }
      
      if (mockMetrics.networkLatency > 150) {
        sampleAlerts.push({
          id: (Date.now() + 2).toString(),
          type: 'warning',
          title: 'High Network Latency',
          message: `Network latency is ${mockMetrics.networkLatency.toFixed(0)}ms`,
          timestamp: new Date(),
          acknowledged: false
        });
      }
      
      setAlerts(sampleAlerts);
      
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast.error('Failed to fetch system metrics');
    } finally {
      setIsRefreshing(false);
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      )
    );
    toast.success('Alert acknowledged');
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      default:
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchMetrics();
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-purple-600" />
            System Monitoring Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Real-time monitoring of system performance and health
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex gap-2">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700"
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                autoRefresh
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Auto Refresh
            </button>
            
            <button
              onClick={fetchMetrics}
              disabled={isRefreshing}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(metrics.totalUsers)}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Total Users</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              {formatNumber(metrics.activeUsers)} active
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(metrics.totalProducts)}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Total Products</p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              {metrics.activeAuctions} active auctions
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(metrics.revenue)}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Total Revenue</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {formatNumber(metrics.totalBids)} total bids
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.uptime.toFixed(1)}%
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">System Uptime</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Last 30 days
            </p>
          </motion.div>
        </div>

        {/* System Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <PerformanceMonitor />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Server className="w-5 h-5 text-purple-600" />
                System Resources
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Server Load</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {metrics.serverLoad.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-colors ${
                        metrics.serverLoad > 80 ? 'bg-red-600' : 
                        metrics.serverLoad > 60 ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${metrics.serverLoad}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {metrics.memoryUsage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-colors ${
                        metrics.memoryUsage > 80 ? 'bg-red-600' : 
                        metrics.memoryUsage > 60 ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${metrics.memoryUsage}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Network Latency</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {metrics.networkLatency.toFixed(0)}ms
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-colors ${
                        metrics.networkLatency > 150 ? 'bg-red-600' : 
                        metrics.networkLatency > 100 ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${Math.min((metrics.networkLatency / 200) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Error Rate</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {metrics.errorRate.toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-colors ${
                        metrics.errorRate > 2 ? 'bg-red-600' : 
                        metrics.errorRate > 1 ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${Math.min((metrics.errorRate / 5) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Health Check and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <HealthCheck />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-purple-600" />
                System Alerts
              </h3>
              
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No active alerts
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`border rounded-lg p-4 ${getAlertColor(alert.type)} ${
                        alert.acknowledged ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getAlertIcon(alert.type)}
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {alert.title}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {alert.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {alert.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        
                        {!alert.acknowledged && (
                          <button
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="px-3 py-1 text-xs bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            Acknowledge
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringDashboard;
