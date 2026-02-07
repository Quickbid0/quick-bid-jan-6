import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { toast } from 'react-hot-toast';
import {
  Users, Gavel, DollarSign, TrendingUp, Shield, Settings,
  Eye, CheckCircle, XCircle, Clock, BarChart3, Activity,
  UserCheck, Wallet, FileText, AlertTriangle
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  activeAuctions: number;
  totalRevenue: number;
  pendingPayments: number;
  completedAuctions: number;
  reportedIssues: number;
}

interface Auction {
  id: string;
  title: string;
  status: string;
  current_price: number;
  end_date: string;
  seller: { full_name: string };
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  type: string;
  user: { full_name: string };
  created_at: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeAuctions: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    completedAuctions: 0,
    reportedIssues: 0
  });
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load stats from backend APIs
      const [usersRes, auctionsRes, paymentsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats/users`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats/auctions`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats/payments`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        })
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setStats(prev => ({ ...prev, totalUsers: usersData.count || 0 }));
      }

      if (auctionsRes.ok) {
        const auctionsData = await auctionsRes.json();
        setStats(prev => ({
          ...prev,
          activeAuctions: auctionsData.active || 0,
          completedAuctions: auctionsData.completed || 0
        }));
        setAuctions(auctionsData.auctions || []);
      }

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        setStats(prev => ({
          ...prev,
          totalRevenue: paymentsData.totalRevenue || 0,
          pendingPayments: paymentsData.pending || 0
        }));
        setPayments(paymentsData.payments || []);
      }

    } catch (error) {
      console.error('Error loading admin dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAuctionAction = async (auctionId: string, action: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/auctions/${auctionId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        toast.success(`Auction ${action} successful`);
        loadDashboardData(); // Refresh data
      } else {
        toast.error(`Failed to ${action} auction`);
      }
    } catch (error) {
      console.error(`Error ${action} auction:`, error);
      toast.error('Action failed');
    }
  };

  const handlePaymentAction = async (paymentId: string, action: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/payments/${paymentId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        toast.success(`Payment ${action} successful`);
        loadDashboardData(); // Refresh data
      } else {
        toast.error(`Failed to ${action} payment`);
      }
    } catch (error) {
      console.error(`Error ${action} payment:`, error);
      toast.error('Action failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage auctions, payments, and users</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Gavel className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Auctions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeAuctions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'auctions', label: 'Auctions', icon: Gavel },
                { id: 'payments', label: 'Payments', icon: Wallet },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'reports', label: 'Reports', icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          {activeTab === 'overview' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">System Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>{stats.completedAuctions} auctions completed this week</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="w-4 h-4 text-blue-500 mr-2" />
                      <span>{stats.totalUsers} active users</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <DollarSign className="w-4 h-4 text-yellow-500 mr-2" />
                      <span>₹{stats.totalRevenue.toLocaleString()} revenue generated</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">System Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Activity className="w-4 h-4 text-green-500 mr-2" />
                      <span>All systems operational</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Shield className="w-4 h-4 text-blue-500 mr-2" />
                      <span>Security systems active</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <TrendingUp className="w-4 h-4 text-purple-500 mr-2" />
                      <span>Performance monitoring enabled</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'auctions' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Auction Management</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Auction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Seller
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Bid
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {auctions.map((auction) => (
                      <tr key={auction.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{auction.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{auction.seller?.full_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">₹{auction.current_price.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            auction.status === 'active' ? 'bg-green-100 text-green-800' :
                            auction.status === 'ended' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {auction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {auction.status === 'active' && (
                            <button
                              onClick={() => handleAuctionAction(auction.id, 'pause')}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              Pause
                            </button>
                          )}
                          <button
                            onClick={() => handleAuctionAction(auction.id, 'end')}
                            className="text-red-600 hover:text-red-900"
                          >
                            End
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Management</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{payment.user?.full_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">₹{payment.amount.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{payment.type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {payment.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handlePaymentAction(payment.id, 'approve')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handlePaymentAction(payment.id, 'reject')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">User Management</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
                  <div className="text-sm text-yellow-700">
                    User management features are being implemented. Basic user statistics are shown above.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Reports & Analytics</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex">
                  <BarChart3 className="w-5 h-5 text-blue-400 mr-2" />
                  <div className="text-sm text-blue-700">
                    Advanced reporting and analytics features are being implemented.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
