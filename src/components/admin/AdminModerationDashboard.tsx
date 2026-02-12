// Admin Moderation Dashboard
// Comprehensive interface for managing security, reports, appeals, and restrictions

import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { securityService } from '../../services/securityService';
import { SecurityLogs, ReportForm, AppealForm } from '../security/SecurityComponents';
import {
  Shield,
  AlertTriangle,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Ban,
  Unlock,
  TrendingUp,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ModerationStats {
  totalReports: number;
  pendingReports: number;
  activeRestrictions: number;
  pendingAppeals: number;
  totalUsers: number;
  highRiskUsers: number;
}

interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  content_type: string;
  content_id: string;
  report_reason: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
  created_at: string;
  reporter?: { email?: string };
  reported_user?: { email?: string };
}

interface Appeal {
  id: string;
  user_id: string;
  explanation: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user?: { email?: string };
}

interface Restriction {
  id: string;
  user_id: string;
  restriction_type: string;
  reason: string;
  start_at: string;
  end_at?: string;
  is_active: boolean;
  user?: { email?: string };
}

export const AdminModerationDashboard: React.FC = () => {
  const [stats, setStats] = useState<ModerationStats>({
    totalReports: 0,
    pendingReports: 0,
    activeRestrictions: 0,
    pendingAppeals: 0,
    totalUsers: 0,
    highRiskUsers: 0
  });

  const [reports, setReports] = useState<Report[]>([]);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [restrictions, setRestrictions] = useState<Restriction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reports' | 'appeals' | 'restrictions' | 'logs'>('reports');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load statistics
      await loadStats();

      // Load data based on active tab
      switch (activeTab) {
        case 'reports':
          await loadReports();
          break;
        case 'appeals':
          await loadAppeals();
          break;
        case 'restrictions':
          await loadRestrictions();
          break;
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get report stats
      const { data: reportData, error: reportError } = await supabase
        .from('content_reports')
        .select('status', { count: 'exact' });

      // Get restriction stats
      const { data: restrictionData, error: restrictionError } = await supabase
        .from('account_restrictions')
        .select('is_active', { count: 'exact' })
        .eq('is_active', true);

      // Get appeal stats
      const { data: appealData, error: appealError } = await supabase
        .from('content_appeals')
        .select('status', { count: 'exact' })
        .eq('status', 'pending');

      // Get user stats
      const { data: userData, error: userError } = await supabase
        .from('user_security_status')
        .select('risk_level', { count: 'exact' });

      // Get high-risk users
      const { data: highRiskData, error: highRiskError } = await supabase
        .from('user_security_status')
        .select('*', { count: 'exact' })
        .in('risk_level', ['high', 'critical']);

      if (reportData) {
        const totalReports = reportData.length;
        const pendingReports = reportData.filter(r => r.status === 'pending').length;

        setStats(prev => ({
          ...prev,
          totalReports,
          pendingReports,
          activeRestrictions: restrictionData?.length || 0,
          pendingAppeals: appealData?.length || 0,
          totalUsers: userData?.length || 0,
          highRiskUsers: highRiskData?.length || 0
        }));
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('content_reports')
        .select(`
          *,
          reporter:profiles!reporter_id(email),
          reported_user:profiles!reported_user_id(email)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const loadAppeals = async () => {
    try {
      const { data, error } = await supabase
        .from('content_appeals')
        .select(`
          *,
          user:profiles!user_id(email)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAppeals(data || []);
    } catch (error) {
      console.error('Error loading appeals:', error);
    }
  };

  const loadRestrictions = async () => {
    try {
      const { data, error } = await supabase
        .from('account_restrictions')
        .select(`
          *,
          user:profiles!user_id(email)
        `)
        .order('start_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setRestrictions(data || []);
    } catch (error) {
      console.error('Error loading restrictions:', error);
    }
  };

  const handleReportAction = async (reportId: string, action: 'dismiss' | 'action', notes?: string) => {
    try {
      const newStatus = action === 'dismiss' ? 'dismissed' : 'actioned';

      const { error } = await supabase
        .from('content_reports')
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      // Log admin action
      const adminId = (await supabase.auth.getUser()).data.user?.id;
      if (adminId) {
        await securityService.logAdminAction(adminId, 'review_report', {
          reportId,
          action,
          notes: notes || `${action} report`
        });
      }

      toast.success(`Report ${action === 'dismiss' ? 'dismissed' : 'actioned'}`);
      await loadReports();
      await loadStats();
    } catch (error) {
      console.error('Error handling report:', error);
      toast.error('Failed to process report');
    }
  };

  const handleAppealAction = async (appealId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      const adminId = (await supabase.auth.getUser()).data.user?.id;
      if (!adminId) return;

      const success = await securityService.reviewAppeal(appealId, adminId, action, notes);

      if (success) {
        toast.success(`Appeal ${action === 'approve' ? 'approved' : 'rejected'}`);
        await loadAppeals();
        await loadStats();
      } else {
        toast.error('Failed to process appeal');
      }
    } catch (error) {
      console.error('Error handling appeal:', error);
      toast.error('Failed to process appeal');
    }
  };

  const handleRestrictionAction = async (restrictionId: string, action: 'lift' | 'extend', notes?: string) => {
    try {
      const adminId = (await supabase.auth.getUser()).data.user?.id;
      if (!adminId) return;

      // Get restriction details
      const { data: restriction } = await supabase
        .from('account_restrictions')
        .select('user_id')
        .eq('id', restrictionId)
        .single();

      if (!restriction) return;

      if (action === 'lift') {
        const success = await securityService.liftRestriction(restriction.user_id, adminId, notes);
        if (success) {
          toast.success('Restriction lifted');
          await loadRestrictions();
          await loadStats();
        }
      } else if (action === 'extend') {
        // Extend by 24 hours
        const newEndAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const { error } = await supabase
          .from('account_restrictions')
          .update({ end_at: newEndAt.toISOString() })
          .eq('id', restrictionId);

        if (!error) {
          toast.success('Restriction extended by 24 hours');
          await loadRestrictions();
        }
      }
    } catch (error) {
      console.error('Error handling restriction:', error);
      toast.error('Failed to process restriction');
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = !searchTerm ||
      report.report_reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reporter?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reported_user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredAppeals = appeals.filter(appeal => {
    const matchesSearch = !searchTerm ||
      appeal.explanation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appeal.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || appeal.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredRestrictions = restrictions.filter(restriction => {
    const matchesSearch = !searchTerm ||
      restriction.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restriction.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Moderation Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Manage reports, appeals, and account security</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Reports</p>
              <p className="text-3xl font-bold text-red-600">{stats.pendingReports}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Restrictions</p>
              <p className="text-3xl font-bold text-orange-600">{stats.activeRestrictions}</p>
            </div>
            <Ban className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Appeals</p>
              <p className="text-3xl font-bold text-blue-600">{stats.pendingAppeals}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Risk Users</p>
              <p className="text-3xl font-bold text-purple-600">{stats.highRiskUsers}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-green-600">{stats.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-3xl font-bold text-gray-600">{stats.totalReports}</p>
            </div>
            <Eye className="h-8 w-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'reports', label: 'Reports', count: stats.pendingReports },
            { id: 'appeals', label: 'Appeals', count: stats.pendingAppeals },
            { id: 'restrictions', label: 'Restrictions', count: stats.activeRestrictions },
            { id: 'logs', label: 'Security Logs' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-red-100 text-red-800">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Filters */}
      {activeTab !== 'logs' && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="active">Active</option>
            </select>
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Content Reports</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredReports.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No reports found
              </div>
            ) : (
              filteredReports.map((report) => (
                <div key={report.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          report.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                          report.status === 'actioned' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {report.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {report.content_type} • {report.report_reason}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Reported by: {report.reporter?.email || 'Anonymous'} •
                        Against: {report.reported_user?.email || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(report.created_at).toLocaleString()}
                      </p>
                    </div>
                    {report.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReportAction(report.id, 'dismiss')}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleReportAction(report.id, 'action')}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Take Action
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'appeals' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">User Appeals</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredAppeals.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No appeals found
              </div>
            ) : (
              filteredAppeals.map((appeal) => (
                <div key={appeal.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appeal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          appeal.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {appeal.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          Appeal by: {appeal.user?.email || 'Unknown'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{appeal.explanation}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(appeal.created_at).toLocaleString()}
                      </p>
                    </div>
                    {appeal.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAppealAction(appeal.id, 'approve')}
                          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAppealAction(appeal.id, 'reject')}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'restrictions' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Account Restrictions</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredRestrictions.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No restrictions found
              </div>
            ) : (
              filteredRestrictions.map((restriction) => (
                <div key={restriction.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          restriction.is_active ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {restriction.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {restriction.restriction_type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">
                        <strong>User:</strong> {restriction.user?.email || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Reason:</strong> {restriction.reason}
                      </p>
                      <div className="text-xs text-gray-400">
                        <p>Started: {new Date(restriction.start_at).toLocaleString()}</p>
                        {restriction.end_at && (
                          <p>Ends: {new Date(restriction.end_at).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                    {restriction.is_active && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRestrictionAction(restriction.id, 'extend')}
                          className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                        >
                          Extend
                        </button>
                        <button
                          onClick={() => handleRestrictionAction(restriction.id, 'lift')}
                          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Lift
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <SecurityLogs userId="admin-view" />
      )}
    </div>
  );
};

export default AdminModerationDashboard;
