// Admin Controls Page for Real Products and Users
import React, { useState, useEffect } from 'react';
import { AdminService, AdminMetrics } from '../services/adminService';
import { ProductService } from '../services/productService';
import { UserAccessService } from '../services/userAccessService';

export const AdminControls: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [targetId, setTargetId] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const [metricsData, approvalsData, logData] = await Promise.all([
          AdminService.getAdminMetrics(),
          AdminService.getPendingApprovals(),
          AdminService.getActivityLog()
        ]);

        setMetrics(metricsData);
        setPendingApprovals(approvalsData);
        setActivityLog(logData);
      } catch (err) {
        console.error('Error loading admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  const handleAdminAction = async () => {
    if (!selectedAction || !targetId || !reason) {
      alert('Please fill in all fields');
      return;
    }

    const adminId = localStorage.getItem('sb-user-id') || 'admin';

    try {
      switch (selectedAction) {
        case 'approve_product':
          await AdminService.approveProduct(targetId, adminId, reason);
          break;
        case 'reject_product':
          await AdminService.rejectProduct(targetId, adminId, reason);
          break;
        case 'disable_product':
          await AdminService.disableProduct(targetId, adminId, reason);
          break;
        case 'approve_seller':
          await AdminService.approveSeller(targetId, adminId, reason);
          break;
        case 'rollback':
          await AdminService.rollbackToMockData(adminId, reason);
          break;
      }

      // Refresh data
      const [metricsData, approvalsData, logData] = await Promise.all([
        AdminService.getAdminMetrics(),
        AdminService.getPendingApprovals(),
        AdminService.getActivityLog()
      ]);

      setMetrics(metricsData);
      setPendingApprovals(approvalsData);
      setActivityLog(logData);

      // Clear form
      setSelectedAction('');
      setTargetId('');
      setReason('');
      
      alert('Action completed successfully');
    } catch (err) {
      alert('Error performing action: ' + (err as Error).message);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Admin Controls
        </h1>

        {/* Metrics Dashboard */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalProducts}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Real Products</h3>
              <p className="text-2xl font-bold text-green-600">{metrics.realProducts}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Beta Users</h3>
              <p className="text-2xl font-bold text-blue-600">{metrics.betaUsers}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Pending Approvals</h3>
              <p className="text-2xl font-bold text-yellow-600">{metrics.pendingApprovals}</p>
            </div>
          </div>
        )}

        {/* Admin Actions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Admin Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action
                </label>
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an action</option>
                  <option value="approve_product">Approve Product</option>
                  <option value="reject_product">Reject Product</option>
                  <option value="disable_product">Disable Product</option>
                  <option value="approve_seller">Approve Seller</option>
                  <option value="rollback">Rollback to Mock Data</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target ID
                </label>
                <input
                  type="text"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  placeholder="Product ID or User ID"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Reason for this action"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  onClick={handleAdminAction}
                  disabled={!selectedAction || !targetId || !reason}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Execute Action
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Pending Approvals ({pendingApprovals.length})
            </h2>
          </div>
          <div className="p-6">
            {pendingApprovals.length === 0 ? (
              <p className="text-gray-500">No pending approvals</p>
            ) : (
              <div className="space-y-4">
                {pendingApprovals.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-500">{item.type}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedAction('approve_product');
                            setTargetId(item.id);
                            setReason('Approved via admin panel');
                          }}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAction('reject_product');
                            setTargetId(item.id);
                            setReason('Rejected via admin panel');
                          }}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Activity Log</h2>
          </div>
          <div className="p-6">
            {activityLog.length === 0 ? (
              <p className="text-gray-500">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {activityLog.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{item.action}</h4>
                        <p className="text-sm text-gray-500">{item.targetId}</p>
                        <p className="text-xs text-gray-400">{item.reason}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
