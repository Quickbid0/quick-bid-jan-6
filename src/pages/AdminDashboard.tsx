import React, { useState, useEffect } from 'react';
import { QuickMelaRoleGuard, AdminLayout } from '../components/auth/QuickMelaAuth';
import { toast } from 'react-hot-toast';
import {
  Users, Gavel, DollarSign, TrendingUp, Shield, Settings,
  Eye, CheckCircle, XCircle, Clock, BarChart3, Activity,
  UserCheck, Wallet, FileText, AlertTriangle
} from 'lucide-react';

interface AdminStats {
  totalSellers: number;
  activeAuctions: number;
  pendingApprovals: number;
  monthlyRevenue: number;
  totalUsers: number;
  completedAuctions: number;
}

interface PendingApproval {
  id: string;
  type: 'seller' | 'product' | 'auction';
  name?: string;
  title?: string;
  seller?: string;
  status: string;
  submittedAt: string;
}

interface RecentAuction {
  id: string;
  title: string;
  currentBid: number;
  bidders: number;
  timeLeft: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalSellers: 0,
    activeAuctions: 0,
    pendingApprovals: 0,
    monthlyRevenue: 0,
    totalUsers: 0,
    completedAuctions: 0
  });

  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [recentAuctions, setRecentAuctions] = useState<RecentAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchBranchData();
  }, []);

  const fetchBranchData = async () => {
    try {
      setLoading(true);

      // Fetch branch statistics
      const statsResponse = await fetch('/api/admin/branch-stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch pending approvals
      const approvalsResponse = await fetch('/api/admin/pending-approvals', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (approvalsResponse.ok) {
        const approvalsData = await approvalsResponse.json();
        setPendingApprovals(approvalsData);
      }

      // Fetch recent auctions
      const auctionsResponse = await fetch('/api/admin/recent-auctions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (auctionsResponse.ok) {
        const auctionsData = await auctionsResponse.json();
        setRecentAuctions(auctionsData);
      }

    } catch (error) {
      console.error('Error loading admin dashboard data:', error);
      toast.error('Failed to load dashboard data');

      // Mock data for development
      setStats({
        totalSellers: 45,
        activeAuctions: 23,
        pendingApprovals: 8,
        monthlyRevenue: 125000,
        totalUsers: 156,
        completedAuctions: 89
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (id: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/admin/approve/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        toast.success(`${action === 'approve' ? 'Approved' : 'Rejected'} successfully`);
        fetchBranchData(); // Refresh data
      } else {
        toast.error(`Failed to ${action}`);
      }
    } catch (error) {
      console.error(`Approval action failed:`, error);
      toast.error('Action failed');
    }
  };

  if (loading) {
    return (
      <QuickMelaRoleGuard allowedRoles={['ADMIN']} requireVerification={true}>
        <AdminLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </AdminLayout>
      </QuickMelaRoleGuard>
    );
  }

  return (
    <QuickMelaRoleGuard allowedRoles={['ADMIN']} requireVerification={true}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Branch Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage local operations and oversee sellers</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Approve Sellers
              </button>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                Branch Settings
              </button>
            </div>
          </div>

          {/* Branch Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Sellers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSellers}</p>
                  <p className="text-sm text-green-600">+12% this month</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Gavel className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Auctions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeAuctions}</p>
                  <p className="text-sm text-blue-600">5 ending soon</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
                  <p className="text-sm text-orange-600">Requires attention</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{stats.monthlyRevenue.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+18% vs last month</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Pending Approvals</h2>
              <span className="text-sm text-gray-500">{pendingApprovals.length} items need review</span>
            </div>
            <div className="space-y-4">
              {pendingApprovals.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      item.type === 'seller' ? 'bg-blue-500' :
                      item.type === 'product' ? 'bg-green-500' : 'bg-purple-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.type === 'seller' ? item.name :
                         item.type === 'product' ? item.title : item.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.type === 'seller' ? 'Seller Registration' :
                         item.type === 'product' ? `Seller: ${item.seller}` : `Seller: ${item.seller}`}
                      </p>
                      <p className="text-xs text-gray-500">Submitted: {item.submittedAt}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApproval(item.id, 'approve')}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproval(item.id, 'reject')}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Reject
                    </button>
                    <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Auctions Monitor */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Active Auctions Monitor</h2>
              <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                View All Auctions
              </button>
            </div>
            <div className="space-y-4">
              {recentAuctions.map((auction) => (
                <div key={auction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{auction.title}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-600">
                        Current Bid: ₹{auction.currentBid.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-600">
                        {auction.bidders} bidders
                      </span>
                      <span className={`text-sm ${
                        auction.timeLeft.includes('m') && parseInt(auction.timeLeft) < 60
                          ? 'text-red-600 font-medium'
                          : 'text-gray-600'
                      }`}>
                        Time Left: {auction.timeLeft}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                      Monitor
                    </button>
                    {auction.timeLeft.includes('m') && parseInt(auction.timeLeft) < 30 && (
                      <button className="text-orange-600 hover:text-orange-800 text-sm font-medium">
                        Extend Time
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Branch Performance & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Branch Performance</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Seller Satisfaction</span>
                  <span className="text-sm font-bold text-green-600">94%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Average Auction Time</span>
                  <span className="text-sm font-bold text-gray-900">3.2 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Dispute Resolution</span>
                  <span className="text-sm font-bold text-blue-600">98% resolved</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Branch Efficiency</span>
                  <span className="text-sm font-bold text-purple-600">87%</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center">
                  <UserCheck className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Add New Seller</p>
                </button>

                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center">
                  <Gavel className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Create Auction</p>
                </button>

                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center">
                  <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Branch Reports</p>
                </button>

                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center">
                  <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Support Center</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </QuickMelaRoleGuard>
  );
};

export default AdminDashboard;
