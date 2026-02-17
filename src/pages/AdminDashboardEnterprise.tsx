import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Shield,
  AlertTriangle,
  Activity,
  Settings,
  UserCheck,
  FileText,
  CreditCard,
  Eye,
  Ban,
  CheckCircle,
  Clock,
  Zap,
  Server,
  Database,
  Globe
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock admin data
const mockAdminData = {
  platformMetrics: {
    totalGMV: 250000000, // ₹25Cr
    monthlyGMV: 85000000, // ₹8.5Cr
    activeUsers: 125000,
    totalAuctions: 4500,
    activeAuctions: 285,
    totalDealers: 3200,
    verifiedDealers: 2100,
    totalBuyers: 92000,
    verifiedBuyers: 78000
  },
  revenueMetrics: {
    commissionRevenue: 12500000, // ₹1.25Cr
    subscriptionRevenue: 2400000, // ₹24L
    loanReferralRevenue: 1800000, // ₹18L
    totalRevenue: 16700000 // ₹1.67Cr
  },
  riskAlerts: [
    {
      id: 1,
      type: 'high',
      title: 'Suspicious Bidding Pattern',
      description: 'User ID 45678 placed 50 bids in 2 minutes',
      timestamp: '2024-02-15 14:30',
      status: 'unresolved'
    },
    {
      id: 2,
      type: 'medium',
      title: 'Dealer Verification Pending',
      description: '45 dealers waiting for KYC approval for 7+ days',
      timestamp: '2024-02-15 12:15',
      status: 'unresolved'
    },
    {
      id: 3,
      type: 'low',
      title: 'Payment Gateway Timeout',
      description: '3 payment failures in last hour',
      timestamp: '2024-02-15 11:45',
      status: 'resolved'
    }
  ],
  systemHealth: {
    apiResponseTime: 245, // ms
    serverUptime: 99.8,
    databaseConnections: 85,
    errorRate: 0.02,
    activeSessions: 1250
  },
  recentActivity: [
    {
      id: 1,
      type: 'auction_created',
      message: 'New auction created: BMW X5 by Dealer ID 1234',
      timestamp: '2 min ago'
    },
    {
      id: 2,
      type: 'user_registered',
      message: 'New dealer registered: Premium Motors',
      timestamp: '5 min ago'
    },
    {
      id: 3,
      type: 'payment_completed',
      message: 'Auction won: ₹12.5L payment processed',
      timestamp: '8 min ago'
    },
    {
      id: 4,
      type: 'verification_approved',
      message: 'Dealer verification approved: AutoHub Ltd',
      timestamp: '12 min ago'
    }
  ]
};

const AdminDashboardEnterprise: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-IN').format(value);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'auctions', label: 'Auctions', icon: Activity },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System', icon: Settings }
  ];

  const getRiskColor = (type: string) => {
    switch (type) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'auction_created': return <Activity className="h-4 w-4" />;
      case 'user_registered': return <UserCheck className="h-4 w-4" />;
      case 'payment_completed': return <CreditCard className="h-4 w-4" />;
      case 'verification_approved': return <CheckCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Enterprise Admin Dashboard</h1>
              <p className="text-gray-600">Platform management & oversight</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                System Healthy
              </div>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Dashboard Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Platform Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div
}
}
}
              >
                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-full">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total GMV</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockAdminData.platformMetrics.totalGMV)}</p>
                      <p className="text-sm text-green-600 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +18% from last month
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <div
}
}
}
              >
                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Users</p>
                      <p className="text-2xl font-bold text-gray-900">{formatNumber(mockAdminData.platformMetrics.activeUsers)}</p>
                      <p className="text-sm text-blue-600">+5% from last week</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div
}
}
}
              >
                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Activity className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Auctions</p>
                      <p className="text-2xl font-bold text-gray-900">{mockAdminData.platformMetrics.activeAuctions}</p>
                      <p className="text-sm text-purple-600">12 ending soon</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div
}
}
}
              >
                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-orange-100 rounded-full">
                      <Shield className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Verified Dealers</p>
                      <p className="text-2xl font-bold text-gray-900">{formatNumber(mockAdminData.platformMetrics.verifiedDealers)}</p>
                      <p className="text-sm text-orange-600">65% of total</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div
}
}
}
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Commissions</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(mockAdminData.revenueMetrics.commissionRevenue)}</p>
                    <p className="text-xs text-gray-500">75% of revenue</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Subscriptions</p>
                    <p className="text-xl font-bold text-blue-600">{formatCurrency(mockAdminData.revenueMetrics.subscriptionRevenue)}</p>
                    <p className="text-xs text-gray-500">14% of revenue</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Loan Referrals</p>
                    <p className="text-xl font-bold text-purple-600">{formatCurrency(mockAdminData.revenueMetrics.loanReferralRevenue)}</p>
                    <p className="text-xs text-gray-500">11% of revenue</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(mockAdminData.revenueMetrics.totalRevenue)}</p>
                    <p className="text-xs text-green-600">+22% MoM</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Risk Alerts & System Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Risk Alerts */}
              <div
}
}
}
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                    Risk Alerts
                  </h3>
                  <div className="space-y-3">
                    {mockAdminData.riskAlerts.map((alert) => (
                      <div key={alert.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`p-1 rounded-full ${getRiskColor(alert.type)}`}>
                          <AlertTriangle className="h-3 w-3" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{alert.title}</p>
                          <p className="text-sm text-gray-600">{alert.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{alert.timestamp}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            alert.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {alert.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View All Alerts
                  </Button>
                </Card>
              </div>

              {/* System Health */}
              <div
}
}
}
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Server className="h-5 w-5 mr-2 text-blue-500" />
                    System Health
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">API Response Time</span>
                      <span className="font-medium">{mockAdminData.systemHealth.apiResponseTime}ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Server Uptime</span>
                      <span className="font-medium text-green-600">{mockAdminData.systemHealth.serverUptime}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">DB Connections</span>
                      <span className="font-medium">{mockAdminData.systemHealth.databaseConnections}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Error Rate</span>
                      <span className="font-medium text-green-600">{mockAdminData.systemHealth.errorRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Sessions</span>
                      <span className="font-medium">{formatNumber(mockAdminData.systemHealth.activeSessions)}</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">All systems operational</p>
                  </div>
                </Card>
              </div>
            </div>

            {/* Recent Activity */}
            <div
}
}
}
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {mockAdminData.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-1 bg-blue-100 rounded-full">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab !== 'overview' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {tabs.find(tab => tab.id === activeTab)?.label} Management
            </h3>
            <p className="text-gray-600 mt-2">
              This section provides detailed management tools for {tabs.find(tab => tab.id === activeTab)?.label.toLowerCase()}.
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline">View All</Button>
              <Button variant="outline">Create New</Button>
              <Button variant="outline">Analytics</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardEnterprise;
