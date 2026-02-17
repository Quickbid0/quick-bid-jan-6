// Enhanced Admin Panel - Gaming Excitement + Fintech Trust + SaaS Intelligence
// Premium admin experience with real-time monitoring, fraud detection, and system analytics

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Users,
  DollarSign,
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Crown,
  Star,
  Award,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Filter,
  Search,
  Settings,
  Bell,
  MessageSquare,
  Flag,
  Target,
  Globe,
  Server,
  Database,
  Wifi,
  WifiOff,
  AlertCircle,
  Info,
  Sparkles
} from 'lucide-react';

// Import enhanced design system
import { Card, Button, Container, Grid, Flex, Stack } from '../ui-system';
import { colors, getGradient, getEmotionColor } from '../ui-system/colors';
import { textStyles, getTextStyle } from '../ui-system/typography';
import { StatusBadge, TrustScore, ProgressIndicator } from '../ui-system/simplified-status';
import { OptimizedImage, LoadingSpinner } from '../ui-system/performance-mobile-trust';

// Real-time System Monitor
const SystemMonitor: React.FC = () => {
  const [systemStats, setSystemStats] = useState({
    activeUsers: 1247,
    totalRevenue: 4525000,
    activeAuctions: 89,
    serverLoad: 67,
    uptime: 99.8,
    responseTime: 145
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 20) - 10,
        activeAuctions: Math.max(0, prev.activeAuctions + Math.floor(Math.random() * 6) - 3),
        serverLoad: Math.max(0, Math.min(100, prev.serverLoad + Math.floor(Math.random() * 10) - 5)),
        responseTime: Math.max(50, prev.responseTime + Math.floor(Math.random() * 20) - 10)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getLoadColor = (load: number) => {
    if (load > 80) return 'text-red-600';
    if (load > 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">System Monitor</h3>
          <p className="text-sm text-blue-100">Real-time platform health</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-green-400">All Systems Operational</span>
        </div>
      </div>

      <Grid cols={3} gap="md">
        <div
          className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-lg"
        >
          <Users className="w-8 h-8 mx-auto mb-2 text-blue-300" />
          <div className="text-2xl font-bold">{systemStats.activeUsers.toLocaleString()}</div>
          <div className="text-sm text-blue-100">Active Users</div>
          <TrendingUp className="w-4 h-4 mx-auto mt-1 text-green-400" />
        </div>

        <div
          className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-lg"
        >
          <DollarSign className="w-8 h-8 mx-auto mb-2 text-emerald-300" />
          <div className="text-2xl font-bold">₹{(systemStats.totalRevenue / 100000).toFixed(1)}L</div>
          <div className="text-sm text-blue-100">Today's Revenue</div>
          <TrendingUp className="w-4 h-4 mx-auto mt-1 text-green-400" />
        </div>

        <div
          className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-lg"
        >
          <Target className="w-8 h-8 mx-auto mb-2 text-purple-300" />
          <div className="text-2xl font-bold">{systemStats.activeAuctions}</div>
          <div className="text-sm text-blue-100">Live Auctions</div>
          <Activity className="w-4 h-4 mx-auto mt-1 text-blue-400 animate-pulse" />
        </div>
      </Grid>

      <div className="mt-6 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm">Server Load</span>
          <span className={`text-sm font-semibold ${getLoadColor(systemStats.serverLoad)}`}>
            {systemStats.serverLoad}%
          </span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${
              systemStats.serverLoad > 80 ? 'bg-red-500' :
              systemStats.serverLoad > 60 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${systemStats.serverLoad}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">{systemStats.uptime}%</div>
            <div className="text-xs text-blue-100">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-300">{systemStats.responseTime}ms</div>
            <div className="text-xs text-blue-100">Avg Response</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// AI Fraud Detection Dashboard
const FraudDetectionDashboard: React.FC = () => {
  const [fraudAlerts, setFraudAlerts] = useState([
    {
      id: 1,
      type: 'suspicious_bidding',
      user: 'User123',
      risk: 'high',
      amount: 250000,
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      details: 'Unusual bidding pattern detected'
    },
    {
      id: 2,
      type: 'ip_anomaly',
      user: 'Bidder456',
      risk: 'medium',
      amount: 150000,
      timestamp: new Date(Date.now() - 600000), // 10 minutes ago
      details: 'Login from unusual location'
    },
    {
      id: 3,
      type: 'shill_bidding',
      user: 'Seller789',
      risk: 'high',
      amount: 500000,
      timestamp: new Date(Date.now() - 900000), // 15 minutes ago
      details: 'Multiple accounts from same IP'
    }
  ]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'suspicious_bidding': return AlertTriangle;
      case 'ip_anomaly': return Shield;
      case 'shill_bidding': return Flag;
      default: return AlertCircle;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI Fraud Detection</h3>
          <p className="text-sm text-gray-600">Real-time security monitoring</p>
        </div>
        <div className="flex items-center gap-1 text-purple-600">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-medium">AI Powered</span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {fraudAlerts.map((alert) => {
          const Icon = getTypeIcon(alert.type);
          return (
            <div
              key={alert.id}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Icon className="w-5 h-5 text-red-600" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{alert.user}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getRiskColor(alert.risk)}`}>
                        {alert.risk} risk
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{alert.details}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>₹{(alert.amount / 100000).toFixed(1)}L bid</span>
                      <span>{alert.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                    <Ban className="w-4 h-4 mr-1" />
                    Block
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">23</div>
          <div className="text-xs text-gray-500">High Risk</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">45</div>
          <div className="text-xs text-gray-500">Medium Risk</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">1,247</div>
          <div className="text-xs text-gray-500">Clean Users</div>
        </div>
      </div>
    </Card>
  );
};

// Real-time Activity Feed
const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState([
    {
      id: 1,
      type: 'bid',
      user: 'Alex Chen',
      action: 'placed a bid',
      target: 'BMW X5 2020',
      amount: 850000,
      timestamp: new Date(),
      status: 'success'
    },
    {
      id: 2,
      type: 'auction_end',
      user: 'System',
      action: 'auction ended',
      target: 'Honda City 2019',
      amount: 620000,
      timestamp: new Date(Date.now() - 120000),
      status: 'success'
    },
    {
      id: 3,
      type: 'user_registration',
      user: 'Sarah Johnson',
      action: 'joined platform',
      target: 'QuickMela',
      amount: null,
      timestamp: new Date(Date.now() - 300000),
      status: 'success'
    },
    {
      id: 4,
      type: 'fraud_alert',
      user: 'Security AI',
      action: 'detected suspicious activity',
      target: 'User ID: 789123',
      amount: null,
      timestamp: new Date(Date.now() - 600000),
      status: 'warning'
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new activities
      const newActivities = [
        {
          id: Date.now(),
          type: 'bid',
          user: ['Emma Davis', 'Raj Patel', 'Lisa Wong', 'Mike Johnson'][Math.floor(Math.random() * 4)],
          action: 'placed a bid',
          target: ['Audi A4', 'Toyota Camry', 'Ford Mustang', 'Mercedes C-Class'][Math.floor(Math.random() * 4)],
          amount: Math.floor(Math.random() * 1000000) + 200000,
          timestamp: new Date(),
          status: 'success'
        }
      ];

      setActivities(prev => [newActivities[0], ...prev.slice(0, 9)]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'bid': return DollarSign;
      case 'auction_end': return Trophy;
      case 'user_registration': return Users;
      case 'fraud_alert': return AlertTriangle;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string, status: string) => {
    if (status === 'warning') return 'text-yellow-600 bg-yellow-100';
    if (status === 'error') return 'text-red-600 bg-red-100';
    switch (type) {
      case 'bid': return 'text-blue-600 bg-blue-100';
      case 'auction_end': return 'text-emerald-600 bg-emerald-100';
      case 'user_registration': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Live Activity Feed</h3>
          <p className="text-sm text-gray-600">Real-time platform activity</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          return (
            <div
              key={activity.id}
              className={`flex items-start gap-3 p-3 bg-gray-50 rounded-lg ${getActivityColor(activity.type, activity.status)}`}
            >
              <div className="p-2 rounded-lg">
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 text-sm">{activity.user}</span>
                  <span className="text-gray-600 text-sm">{activity.action}</span>
                  <span className="font-medium text-gray-900 text-sm">{activity.target}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {activity.timestamp.toLocaleTimeString()}
                  </span>
                  {activity.amount && (
                    <span className="text-xs font-semibold text-emerald-600">
                      ₹{(activity.amount / 100000).toFixed(1)}L
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// Enhanced Admin Panel Component
export const EnhancedAdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const kpiData = [
    {
      title: "Platform Revenue",
      value: 12450000,
      change: 22,
      changeLabel: "vs last month",
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-600",
      isRealtime: true
    },
    {
      title: "Active Users",
      value: 15420,
      change: 15,
      changeLabel: "vs yesterday",
      icon: Users,
      gradient: "from-blue-500 to-indigo-600",
      isRealtime: true
    },
    {
      title: "Live Auctions",
      value: 89,
      change: -5,
      changeLabel: "vs last hour",
      icon: Target,
      gradient: "from-purple-500 to-pink-600",
      isRealtime: true
    },
    {
      title: "Fraud Prevention",
      value: 98.7,
      change: 2,
      changeLabel: "accuracy rate",
      icon: Shield,
      gradient: "from-orange-500 to-red-600"
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'auctions', label: 'Auctions', icon: Target },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <Container className="py-8">
      {/* Header */}
      <div
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Admin Control Center 🛡️
          </h1>
          <p className="text-gray-600">
            Platform health: <span className="font-semibold text-emerald-600">Excellent</span> •
            Uptime: <span className="font-semibold text-blue-600">99.9%</span> •
            Active threats: <span className="font-semibold text-red-600">0</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleRefresh}
            loading={refreshing}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>

          <Button variant="outline" className="gap-2">
            <Bell className="w-4 h-4" />
            Alerts
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div
        className="flex gap-1 mb-8 p-1 bg-gray-100 rounded-lg w-fit"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* KPI Cards */}
      <div
        className="mb-8"
      >
        <Grid cols={4} gap="md">
          {kpiData.map((kpi, index) => (
            <div
              key={kpi.title}
            >
              <Card className={`p-6 bg-gradient-to-br ${kpi.gradient} text-white relative overflow-hidden group cursor-pointer hover:scale-105 transition-transform duration-200`}>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                      <kpi.icon className="w-6 h-6" />
                    </div>
                    {kpi.isRealtime && (
                      <div
                        className="w-2 h-2 bg-green-400 rounded-full"
                      />
                    )}
                  </div>

                  <div className="mb-2">
                    <h3 className="text-sm font-medium text-white/90 mb-1">{kpi.title}</h3>
                    <div className="text-2xl font-bold">
                      {typeof kpi.value === 'number' && kpi.value > 1000 ? (
                        kpi.title.includes('Revenue') ? (
                          <span>₹{(kpi.value / 100000).toFixed(1)}L</span>
                        ) : (
                          <span>{kpi.value.toLocaleString()}</span>
                        )
                      ) : (
                        <span>{kpi.value}{kpi.title.includes('Prevention') ? '%' : ''}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {kpi.change > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-300" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-300" />
                    )}
                    <span className={`text-sm font-medium ${kpi.change > 0 ? 'text-green-300' : 'text-red-300'}`}>
                      {kpi.change > 0 ? '+' : ''}{kpi.change}{kpi.title.includes('Prevention') ? '' : '%'} {kpi.changeLabel}
                    </span>
                  </div>
                </div>

                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg" />
              </Card>
            </div>
          ))}
        </Grid>
      </div>

      {/* Main Content Based on Tab */}
      <Fragment mode="wait">
        {activeTab === 'overview' && (
          <div
            key="overview"
          >
            <Grid cols={2} gap="lg">
              <div className="space-y-6">
                <SystemMonitor />
                <FraudDetectionDashboard />
              </div>
              <div>
                <ActivityFeed />
              </div>
            </Grid>
          </div>
        )}

        {activeTab === 'users' && (
          <div
            key="users"
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
              <p className="text-gray-600">User management interface coming soon...</p>
            </Card>
          </div>
        )}

        {activeTab === 'auctions' && (
          <div
            key="auctions"
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Auction Management</h3>
              <p className="text-gray-600">Auction management interface coming soon...</p>
            </Card>
          </div>
        )}

        {activeTab === 'security' && (
          <div
            key="security"
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Center</h3>
              <p className="text-gray-600">Advanced security controls coming soon...</p>
            </Card>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div
            key="analytics"
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Analytics</h3>
              <p className="text-gray-600">Advanced analytics dashboard coming soon...</p>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div
            key="settings"
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
              <p className="text-gray-600">Platform configuration coming soon...</p>
            </Card>
          </div>
        )}
      </Fragment>
    </Container>
  );
};

export default EnhancedAdminPanel;
