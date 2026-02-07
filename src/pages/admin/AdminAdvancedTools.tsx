import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Users, 
  Package, 
  DollarSign,
  Activity,
  BarChart3,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Ban,
  Crown,
  Zap,
  Target,
  TrendingUp,
  Clock,
  Calendar,
  Filter,
  Search,
  Bell,
  Mail,
  MessageSquare,
  FileText,
  Database,
  Server,
  Wifi,
  HardDrive,
  Cpu,
  Monitor,
  Smartphone,
  Globe,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  UserCheck,
  UserX,
  AlertCircle,
  Info,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalAuctions: number;
  activeAuctions: number;
  totalRevenue: number;
  todayRevenue: number;
  serverLoad: number;
  memoryUsage: number;
  diskSpace: number;
  bandwidth: number;
  errorRate: number;
  responseTime: number;
}

interface SecurityAlert {
  id: string;
  type: 'suspicious' | 'fraud' | 'spam' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  user?: string;
  timestamp: string;
  status: 'open' | 'investigating' | 'resolved';
  actions: string[];
}

interface UserActivity {
  id: string;
  user: string;
  action: string;
  details: string;
  timestamp: string;
  ip: string;
  location: string;
  device: string;
  risk: 'low' | 'medium' | 'high';
}

interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  source: string;
  details?: string;
}

const AdminAdvancedTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    totalUsers: 12450,
    activeUsers: 3420,
    totalAuctions: 8934,
    activeAuctions: 234,
    totalRevenue: 28450000,
    todayRevenue: 450000,
    serverLoad: 65,
    memoryUsage: 78,
    diskSpace: 45,
    bandwidth: 82,
    errorRate: 0.2,
    responseTime: 245
  });

  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([
    {
      id: '1',
      type: 'fraud',
      severity: 'high',
      title: 'Suspicious Bidding Pattern',
      description: 'User detected with unusual bidding behavior across multiple auctions',
      user: 'user123@example.com',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      status: 'investigating',
      actions: ['Suspend Account', 'Review Bids', 'Contact User']
    },
    {
      id: '2',
      type: 'security',
      severity: 'critical',
      title: 'Multiple Failed Login Attempts',
      description: 'Detected brute force attack on admin accounts',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      status: 'open',
      actions: ['Block IP', 'Enable 2FA', 'Notify Admins']
    },
    {
      id: '3',
      type: 'spam',
      severity: 'medium',
      title: 'Fake Listings Detected',
      description: 'Multiple suspicious product listings from new seller accounts',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'open',
      actions: ['Review Listings', 'Verify Sellers', 'Remove Content']
    }
  ]);

  const [userActivities, setUserActivities] = useState<UserActivity[]>([
    {
      id: '1',
      user: 'admin@quickmela.com',
      action: 'Login',
      details: 'Admin login from new device',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      ip: '192.168.1.100',
      location: 'Mumbai, India',
      device: 'Chrome on Windows',
      risk: 'low'
    },
    {
      id: '2',
      user: 'suspicious@example.com',
      action: 'Bid Placement',
      details: 'Unusually high bid amount placed',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      ip: '10.0.0.1',
      location: 'Unknown',
      device: 'Unknown',
      risk: 'high'
    }
  ]);

  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([
    {
      id: '1',
      level: 'error',
      message: 'Database connection failed',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      source: 'database',
      details: 'Connection timeout after 30 seconds'
    },
    {
      id: '2',
      level: 'warning',
      message: 'High memory usage detected',
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      source: 'server',
      details: 'Memory usage at 85%'
    },
    {
      id: '3',
      level: 'info',
      message: 'New user registration spike',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      source: 'auth',
      details: '50 new users in last hour'
    }
  ]);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        activeUsers: Math.max(3000, prev.activeUsers + Math.floor(Math.random() * 100) - 50),
        serverLoad: Math.max(20, Math.min(90, prev.serverLoad + Math.floor(Math.random() * 10) - 5)),
        responseTime: Math.max(100, Math.min(500, prev.responseTime + Math.floor(Math.random() * 50) - 25))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleSecurityAction = (alertId: string, action: string) => {
    toast.success(`Action "${action}" executed for alert ${alertId}`);
    setSecurityAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'resolved' as const }
          : alert
      )
    );
  };

  const handleUserAction = (userId: string, action: string) => {
    toast.success(`Action "${action}" executed for user ${userId}`);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'monitoring', label: 'Monitoring', icon: Monitor },
    { id: 'users', label: 'User Activity', icon: Users },
    { id: 'logs', label: 'System Logs', icon: FileText },
    { id: 'tools', label: 'Tools', icon: Settings }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Advanced Admin Tools</h1>
            <p className="text-gray-300">Comprehensive system management and monitoring</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 border-b-2 transition-colors whitespace-nowrap ${
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Users</p>
                      <p className="text-2xl font-bold">{formatNumber(systemMetrics.totalUsers)}</p>
                      <p className="text-blue-100 text-sm">{formatNumber(systemMetrics.activeUsers)} active</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Total Revenue</p>
                      <p className="text-2xl font-bold">{formatPrice(systemMetrics.totalRevenue)}</p>
                      <p className="text-green-100 text-sm">{formatPrice(systemMetrics.todayRevenue)} today</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Active Auctions</p>
                      <p className="text-2xl font-bold">{formatNumber(systemMetrics.activeAuctions)}</p>
                      <p className="text-purple-100 text-sm">of {formatNumber(systemMetrics.totalAuctions)} total</p>
                    </div>
                    <Package className="w-8 h-8 text-purple-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Server Load</p>
                      <p className="text-2xl font-bold">{systemMetrics.serverLoad}%</p>
                      <p className="text-orange-100 text-sm">{systemMetrics.responseTime}ms avg</p>
                    </div>
                    <Server className="w-8 h-8 text-orange-200" />
                  </div>
                </div>
              </div>

              {/* System Health */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Cpu className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium">CPU Usage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${systemMetrics.serverLoad}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{systemMetrics.serverLoad}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <HardDrive className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium">Memory</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-600 h-2 rounded-full" 
                          style={{ width: `${systemMetrics.memoryUsage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{systemMetrics.memoryUsage}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium">Disk Space</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${systemMetrics.diskSpace}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{systemMetrics.diskSpace}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Security Alerts</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  <Shield className="w-4 h-4" />
                  Run Security Scan
                </button>
              </div>

              <div className="space-y-4">
                {securityAlerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{alert.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                              {alert.severity}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              alert.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {alert.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                          {alert.user && (
                            <p className="text-sm text-gray-500">User: {alert.user}</p>
                          )}
                          <p className="text-xs text-gray-400">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {alert.status !== 'resolved' && (
                      <div className="mt-3 flex items-center gap-2">
                        {alert.actions.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => handleSecurityAction(alert.id, action)}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">System Monitoring</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Performance Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Response Time</span>
                      <span className="text-sm font-medium">{systemMetrics.responseTime}ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Error Rate</span>
                      <span className="text-sm font-medium">{systemMetrics.errorRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Bandwidth</span>
                      <span className="text-sm font-medium">{systemMetrics.bandwidth}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                      <RefreshCw className="w-4 h-4" />
                      Restart Server
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                      <Database className="w-4 h-4" />
                      Clear Cache
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                      <Download className="w-4 h-4" />
                      Export Logs
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                      <Shield className="w-4 h-4" />
                      Security Scan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">User Activity Monitor</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">User</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Action</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Details</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">IP/Location</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Risk</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userActivities.map((activity) => (
                      <tr key={activity.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-gray-900">{activity.user}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">{activity.action}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">{activity.details}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm text-gray-600">{activity.ip}</p>
                            <p className="text-xs text-gray-500">{activity.location}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(activity.risk)}`}>
                            {activity.risk}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleUserAction(activity.id, 'View Details')}
                              className="text-indigo-600 hover:text-indigo-800 text-sm"
                            >
                              View
                            </button>
                            {activity.risk === 'high' && (
                              <button 
                                onClick={() => handleUserAction(activity.id, 'Block User')}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Block
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">System Logs</h3>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {systemLogs.map((log) => (
                  <div key={log.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getLogLevelColor(log.level)}`}>
                          {log.level === 'critical' && <XCircle className="w-4 h-4" />}
                          {log.level === 'error' && <AlertCircle className="w-4 h-4" />}
                          {log.level === 'warning' && <AlertTriangle className="w-4 h-4" />}
                          {log.level === 'info' && <Info className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{log.message}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLogLevelColor(log.level)}`}>
                              {log.level}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Source: {log.source}</span>
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                          {log.details && (
                            <p className="text-sm text-gray-500 mt-2">{log.details}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Admin Tools</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button className="flex flex-col items-center gap-3 p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <Users className="w-8 h-8 text-blue-600" />
                  <span className="font-medium">User Management</span>
                  <span className="text-sm text-gray-600">Manage user accounts</span>
                </button>
                
                <button className="flex flex-col items-center gap-3 p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <Package className="w-8 h-8 text-green-600" />
                  <span className="font-medium">Auction Control</span>
                  <span className="text-sm text-gray-600">Manage auctions</span>
                </button>
                
                <button className="flex flex-col items-center gap-3 p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <DollarSign className="w-8 h-8 text-purple-600" />
                  <span className="font-medium">Payment Admin</span>
                  <span className="text-sm text-gray-600">Handle payments</span>
                </button>
                
                <button className="flex flex-col items-center gap-3 p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <Shield className="w-8 h-8 text-red-600" />
                  <span className="font-medium">Security Center</span>
                  <span className="text-sm text-gray-600">Security settings</span>
                </button>
                
                <button className="flex flex-col items-center gap-3 p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <BarChart3 className="w-8 h-8 text-orange-600" />
                  <span className="font-medium">Analytics</span>
                  <span className="text-sm text-gray-600">View analytics</span>
                </button>
                
                <button className="flex flex-col items-center gap-3 p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <Settings className="w-8 h-8 text-gray-600" />
                  <span className="font-medium">System Settings</span>
                  <span className="text-sm text-gray-600">Configure system</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAdvancedTools;
