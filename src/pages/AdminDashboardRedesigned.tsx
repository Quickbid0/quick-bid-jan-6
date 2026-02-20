import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Shield,
  Activity,
  UserCheck,
  FileText,
  Clock,
  BarChart3,
  ChevronRight,
  Settings,
  AlertTriangle,
  Zap,
  DollarSign,
  Package,
  Server
} from 'lucide-react';
import { KPICard, StatusBadge, ActionMenu, DataTable } from '@/components/design-system/EnhancedComponents';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * REDESIGNED ADMIN DASHBOARD
 * 
 * Key Features:
 * - Critical alerts section (prominent)
 * - System health monitoring
 * - Business KPIs
 * - Pending approvals queue
 * - Dispute management
 * - User management
 * - Analytics & reports
 * - Mobile optimized
 */

interface AdminStats {
  totalUsers: number;
  activeAuctions: number;
  monthlyGMV: number;
  completedAuctions: number;
  systemHealth: number; // percentage
  criticalAlerts: number;
  pendingApprovals: number;
}

interface CriticalAlert {
  id: string;
  type: 'dispute' | 'fraud' | 'outage' | 'compliance';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium';
  createdAt: string;
  actions?: string[];
}

interface PendingApproval {
  id: string;
  type: 'seller' | 'product' | 'auction' | 'user';
  title: string;
  submittedBy: string;
  submittedAt: string;
  priority: 'high' | 'medium' | 'low';
}

interface SystemHealth {
  component: string;
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
}

export default function RedesignedAdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 12450,
    activeAuctions: 1240,
    monthlyGMV: 2490000,
    completedAuctions: 3450,
    systemHealth: 99.9,
    criticalAlerts: 3,
    pendingApprovals: 34
  });

  const [criticalAlerts, setCriticalAlerts] = useState<CriticalAlert[]>([
    {
      id: '1',
      type: 'dispute',
      title: 'High-value Dispute',
      description: 'Buyer dispute on 3 auctions (₹1,50,000 total value)',
      severity: 'critical',
      createdAt: '30 mins ago',
      actions: ['Resolve', 'Escalate']
    },
    {
      id: '2',
      type: 'fraud',
      title: 'Fraud Alert - Multiple Bids',
      description: 'Suspicious account bidding from 5 different IPs (Same location)',
      severity: 'high',
      createdAt: '2 hours ago',
      actions: ['Investigate', 'Suspend']
    },
    {
      id: '3',
      type: 'compliance',
      title: 'Compliance Check',
      description: 'Seller not verified - 8 auctions pending approval',
      severity: 'high',
      createdAt: '4 hours ago',
      actions: ['Verify', 'Block']
    }
  ]);

  const [systemComponents, setSystemComponents] = useState<SystemHealth[]>([
    { component: 'API Server', status: 'healthy', uptime: 99.95 },
    { component: 'Database', status: 'healthy', uptime: 100 },
    { component: 'Payment Gateway', status: 'healthy', uptime: 99.5 },
    { component: 'File Storage', status: 'healthy', uptime: 100 }
  ]);

  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([
    {
      id: '1',
      type: 'seller',
      title: 'Premium Seller Verification',
      submittedBy: 'Raj Kumar',
      submittedAt: '2 hours ago',
      priority: 'high'
    },
    {
      id: '2',
      type: 'product',
      title: 'Electronic Device - Safety Check',
      submittedBy: 'Priya Electronics',
      submittedAt: '3 hours ago',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'auction',
      title: 'Luxury Watch Auction',
      submittedBy: 'XYZ Dealer',
      submittedAt: '5 hours ago',
      priority: 'low'
    }
  ]);

  const [businessMetrics] = useState([
    { label: 'Daily GMV', value: '₹8.2L', trend: '+5%' },
    { label: 'New Users', value: '312', trend: '+12%' },
    { label: 'Conversion Rate', value: '3.4%', trend: '+0.5%' },
    { label: 'Avg Bid Value', value: '₹4,200', trend: '-2%' }
  ]);

  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 text-sm mt-1">Platform management & monitoring</p>
            </div>
            <div className="flex gap-3">
              <Link to="/admin/users">
                <Button className="bg-gray-600 hover:bg-gray-700 text-white">
                  <Users className="w-4 h-4 mr-2" />
                  Users
                </Button>
              </Link>
              <Link to="/admin/settings">
                <Button className="bg-gray-600 hover:bg-gray-700 text-white">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* System Status Bar */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">System Status</p>
                  <p className="text-xs text-gray-700">All systems operational ({stats.systemHealth}% uptime)</p>
                </div>
              </div>
            </div>
            {stats.criticalAlerts > 0 && (
              <div className="flex items-center gap-2 bg-red-100 border border-red-300 px-4 py-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-600">{stats.criticalAlerts} Critical Alerts</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* SECTION 1: CRITICAL ALERTS - HERO SECTION */}
        {stats.criticalAlerts > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl font-bold text-red-600">Critical Alerts</h2>
            </div>

            <div className="space-y-3">
              {criticalAlerts.map(alert => (
                <Card
                  key={alert.id}
                  className={`p-4 border-l-4 border-red-500 bg-red-50 hover:shadow-md transition-shadow ${
                    alert.severity === 'critical' ? 'ring-2 ring-red-200' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <h3 className="font-bold text-gray-900">{alert.title}</h3>
                        <StatusBadge
                          status={alert.severity === 'critical' ? 'error' : 'warning'}
                          label={alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                          size="sm"
                        />
                      </div>
                      <p className="text-sm text-gray-700 ml-8 mb-2">{alert.description}</p>
                      <p className="text-xs text-gray-600 ml-8">{alert.createdAt}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {alert.actions?.map(action => (
                        <Button
                          key={action}
                          className="bg-red-600 hover:bg-red-700 text-white text-sm py-1 h-8 px-3"
                        >
                          {action}
                        </Button>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 2: BUSINESS METRICS & SYSTEM HEALTH */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total GMV (Today)"
            value={`₹${(stats.monthlyGMV / 100000).toFixed(1)}L`}
            icon={DollarSign}
            color="green"
            trend={5}
            trendDirection="up"
            comparison="vs yesterday"
          />
          <KPICard
            title="Active Auctions"
            value={stats.activeAuctions}
            icon={Package}
            color="blue"
            subtext="Live listings"
          />
          <KPICard
            title="Completed Auctions"
            value={stats.completedAuctions}
            icon={CheckCircle}
            color="green"
            comparison="This month"
          />
          <KPICard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="purple"
            subtext="Active & inactive"
            trend={8}
            trendDirection="up"
          />
        </div>

        {/* SECTION 3: SYSTEM HEALTH MONITORING */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">System Health Monitoring</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemComponents.map(item => (
              <div key={item.component} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-900">{item.component}</span>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      item.status === 'healthy'
                        ? 'bg-green-500'
                        : item.status === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                  />
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                  <div className="bg-green-500 h-full" style={{ width: `${item.uptime}%` }} />
                </div>
                <p className="text-sm text-gray-600">Uptime: {item.uptime}%</p>
              </div>
            ))}
          </div>
        </Card>

        {/* SECTION 4: PENDING APPROVALS & OPERATIONAL ITEMS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Approvals */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Pending Approvals</h2>
                <p className="text-sm text-gray-600 mt-1">{stats.pendingApprovals} items to review</p>
              </div>
              <Link to="/admin/approvals" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {pendingApprovals.map(approval => (
                <Card key={approval.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge
                          status={approval.priority === 'high' ? 'error' : approval.priority === 'medium' ? 'warning' : 'info'}
                          label={approval.type.charAt(0).toUpperCase() + approval.type.slice(1)}
                          size="sm"
                        />
                      </div>
                      <h3 className="font-semibold text-gray-900">{approval.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">{approval.submittedBy} • {approval.submittedAt}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-1 h-8">
                      Approve
                    </Button>
                    <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-1 h-8">
                      Reject
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Daily Business Metrics */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Today's Metrics</h3>
            <div className="space-y-4">
              {businessMetrics.map((metric, idx) => (
                <div key={idx} className="pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 font-semibold">{metric.label}</span>
                    <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {metric.trend}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* SECTION 5: RECENT DISPUTES & SUPPORT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Disputes */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Recent Disputes</h3>
              <Link to="/admin/disputes" className="text-xs text-blue-600 hover:text-blue-700 font-semibold">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {[
                { id: 1, buyer: 'Priya K.', seller: 'TechStore', amount: 15000, status: 'open', days: 2 },
                { id: 2, buyer: 'Amit S.', seller: 'Fashion Hub', amount: 4500, status: 'open', days: 1 },
                { id: 3, buyer: 'Raj M.', seller: 'Electronics', amount: 32000, status: 'resolved', days: 0 }
              ].map(dispute => (
                <div key={dispute.id} className="pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{dispute.buyer} vs {dispute.seller}</p>
                      <p className="text-xs text-gray-600">₹{dispute.amount.toLocaleString('en-IN')}</p>
                    </div>
                    <StatusBadge
                      status={dispute.status === 'open' ? 'warning' : 'success'}
                      label={dispute.status === 'open' ? dispute.days + 'd old' : 'Resolved'}
                      size="sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Category Performance */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Top Categories</h3>
              <Link to="/admin/analytics" className="text-xs text-blue-600 hover:text-blue-700 font-semibold">
                View Analytics →
              </Link>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Electronics', value: 45, color: 'bg-blue-500' },
                { name: 'Fashion', value: 32, color: 'bg-purple-500' },
                { name: 'Vehicles', value: 28, color: 'bg-green-500' },
                { name: 'Home & Garden', value: 18, color: 'bg-amber-500' }
              ].map((cat, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-gray-900">{cat.name}</span>
                      <span className="text-xs text-gray-600">{cat.value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className={`h-full ${cat.color}`} style={{ width: `${cat.value}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
