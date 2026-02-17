// Admin Launch Control Dashboard
// Comprehensive admin interface for managing launch mode, campaigns, and monitoring

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  TrendingUp,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  BarChart3,
  Zap,
  Eye,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Target,
  Award,
  Gift,
} from 'lucide-react';

interface AdminLaunchDashboardProps {
  // Props would come from parent component with API integration
}

export const AdminLaunchDashboard: React.FC<AdminLaunchDashboardProps> = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [emergencyMode, setEmergencyMode] = useState(false);

  // Mock data - in real implementation, this would come from API
  const dashboardData = {
    launchStatus: {
      isActive: true,
      campaignName: 'QuickMela Launch Week',
      startDate: '2024-01-15',
      endDate: '2024-01-21',
      daysRemaining: 3,
      healthScore: 95,
    },
    metrics: {
      totalUsers: 15420,
      newUsersToday: 234,
      activeUsers: 5432,
      totalRevenue: 1250000,
      revenueToday: 45000,
      escrowVolume: 850000,
      conversionRate: 68.5,
      averageOrderValue: 2500,
    },
    campaigns: [
      {
        id: 'launch-week-1',
        name: 'Launch Week 1',
        status: 'active',
        users: 8750,
        revenue: 285000,
        roi: 560,
        endDate: '2024-01-21',
      },
      {
        id: 'founding-members',
        name: 'Founding Members',
        status: 'completed',
        users: 2500,
        revenue: 125000,
        roi: 320,
        endDate: '2024-01-14',
      },
    ],
    featureFlags: [
      { key: 'launch_mode_active', value: true, description: 'Master launch mode switch' },
      { key: 'free_buyer_week', value: true, description: 'Free bidding for buyers' },
      { key: 'free_seller_week', value: true, description: 'Free listings for sellers' },
      { key: 'bonus_wallet_credit', value: true, description: 'Bonus credits for new users' },
      { key: 'emergency_pause', value: false, description: 'Emergency system pause' },
    ],
    alerts: [
      {
        type: 'success',
        message: 'Launch campaign performing above target',
        metric: 'revenue',
        value: '+45% vs target',
      },
      {
        type: 'warning',
        message: 'High server load detected',
        metric: 'cpu_usage',
        value: '78%',
      },
      {
        type: 'info',
        message: 'New user registrations spiking',
        metric: 'registrations',
        value: '+120% this hour',
      },
    ],
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'campaigns', label: 'Campaigns', icon: Target },
    { id: 'features', label: 'Feature Flags', icon: Settings },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'safety', label: 'Safety & Security', icon: Shield },
    { id: 'emergency', label: 'Emergency Controls', icon: AlertTriangle },
  ];

  const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <div
}
}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change && (
            <p className={`text-sm ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const FeatureFlagToggle = ({ flag }: any) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white">{flag.key.replace(/_/g, ' ').toUpperCase()}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">{flag.description}</p>
      </div>
      <button
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          flag.value ? 'bg-green-600' : 'bg-gray-200'
        }`}
        onClick={() => {
          // Toggle logic would go here
          console.log(`Toggling ${flag.key}`);
        }}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            flag.value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Zap className="h-8 w-8 text-indigo-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Launch Control Center
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    QuickMela Enterprise Launch Management
                  </p>
                </div>
              </div>

              {dashboardData.launchStatus.isActive && (
                <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    LAUNCH ACTIVE
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">Health Score</div>
                <div className={`text-lg font-bold ${
                  dashboardData.launchStatus.healthScore >= 90 ? 'text-green-600' :
                  dashboardData.launchStatus.healthScore >= 75 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {dashboardData.launchStatus.healthScore}/100
                </div>
              </div>

              <button
                onClick={() => setEmergencyMode(!emergencyMode)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  emergencyMode
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {emergencyMode ? 'Emergency Mode' : 'Normal Mode'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <Fragment mode="wait">
          {activeTab === 'overview' && (
            <div
              key="overview"
}
}
}
              className="space-y-8"
            >
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Users"
                  value={dashboardData.metrics.totalUsers.toLocaleString()}
                  change="+234 today"
                  icon={Users}
                  color="bg-blue-600"
                />
                <StatCard
                  title="Revenue Today"
                  value={`₹${dashboardData.metrics.revenueToday.toLocaleString()}`}
                  change="+12.5%"
                  icon={DollarSign}
                  color="bg-green-600"
                />
                <StatCard
                  title="Conversion Rate"
                  value={`${dashboardData.metrics.conversionRate}%`}
                  change="+5.2%"
                  icon={TrendingUp}
                  color="bg-purple-600"
                />
                <StatCard
                  title="Active Users"
                  value={dashboardData.metrics.activeUsers.toLocaleString()}
                  change="+8.3%"
                  icon={Eye}
                  color="bg-orange-600"
                />
              </div>

              {/* Launch Status */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Launch Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600 mb-2">
                      {dashboardData.launchStatus.daysRemaining}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Days Remaining</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {dashboardData.launchStatus.healthScore}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">System Health</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-2">
                      {dashboardData.campaigns.filter(c => c.status === 'active').length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Active Campaigns</div>
                  </div>
                </div>
              </div>

              {/* Alerts */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  System Alerts
                </h3>
                {dashboardData.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      alert.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : alert.type === 'warning'
                        ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                        : 'bg-blue-50 border-blue-200 text-blue-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {alert.type === 'success' && <CheckCircle className="h-5 w-5" />}
                      {alert.type === 'warning' && <AlertTriangle className="h-5 w-5" />}
                      {alert.type === 'info' && <Eye className="h-5 w-5" />}
                      <div>
                        <div className="font-medium">{alert.message}</div>
                        <div className="text-sm opacity-75">
                          {alert.metric}: {alert.value}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div
              key="campaigns"
}
}
}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Campaign Management
                </h2>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Create Campaign
                </button>
              </div>

              <div className="grid gap-6">
                {dashboardData.campaigns.map((campaign) => (
                  <div key={campaign.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {campaign.name}
                        </h3>
                        <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${
                          campaign.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            campaign.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                          }`}></div>
                          {campaign.status}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {campaign.status === 'active' && (
                          <button className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                            End Campaign
                          </button>
                        )}
                        <button className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                          Edit
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{campaign.users.toLocaleString()}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Users</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">₹{campaign.revenue.toLocaleString()}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Revenue</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{campaign.roi}%</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">ROI</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Ends</div>
                        <div className="font-medium">{new Date(campaign.endDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div
              key="features"
}
}
}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Feature Flag Management
                </h2>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Bulk Update
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Launch Mode Features
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Control which features are enabled during the launch period
                  </p>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {dashboardData.featureFlags.map((flag) => (
                    <FeatureFlagToggle key={flag.key} flag={flag} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'emergency' && (
            <div
              key="emergency"
}
}
}
              className="space-y-6"
            >
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  <h2 className="text-xl font-bold text-red-800 dark:text-red-400">
                    Emergency Controls
                  </h2>
                </div>

                <p className="text-red-700 dark:text-red-300 mb-6">
                  These controls should only be used in critical situations. All actions are logged and require confirmation.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-3 px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold">
                    <Pause className="h-5 w-5" />
                    Emergency Pause All Activity
                  </button>

                  <button className="flex items-center justify-center gap-3 px-6 py-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-semibold">
                    <RotateCcw className="h-5 w-5" />
                    Reset All Feature Flags
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  System Status
                </h3>

                <div className="space-y-4">
                  {[
                    { name: 'User Registration', status: 'operational' },
                    { name: 'Payment Processing', status: 'operational' },
                    { name: 'Auction Engine', status: 'operational' },
                    { name: 'Notification System', status: 'operational' },
                    { name: 'Analytics Pipeline', status: 'operational' },
                  ].map((system) => (
                    <div key={system.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="font-medium text-gray-900 dark:text-white">{system.name}</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          system.status === 'operational' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span className={`text-sm font-medium ${
                          system.status === 'operational' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {system.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Fragment>
      </div>
    </div>
  );
};

export default AdminLaunchDashboard;
