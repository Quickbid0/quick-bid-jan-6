// Beta User Management Dashboard
import React, { useState, useEffect } from 'react';
import { BetaUserService, BetaUser, BetaUserRequest } from '../services/betaUserService';

export const BetaUserManagement: React.FC = () => {
  const [betaUsers, setBetaUsers] = useState<BetaUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<BetaUserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'users' | 'requests'>('users');
  const [stats, setStats] = useState({
    total: 0,
    buyers: 0,
    sellers: 0,
    admins: 0,
    active: 0
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, requestsData, statsData] = await Promise.all([
          BetaUserService.getAllBetaUsers(),
          BetaUserService.getPendingBetaRequests(),
          Promise.resolve(BetaUserService.getBetaUserStats())
        ]);

        setBetaUsers(usersData);
        setPendingRequests(requestsData);
        setStats(statsData);
      } catch (err) {
        console.error('Error loading beta user data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleApproveRequest = async (requestId: string, permissions: ('bid' | 'sell' | 'admin')[]) => {
    try {
      const adminId = localStorage.getItem('sb-user-id') || 'admin';
      await BetaUserService.approveBetaUser(requestId, adminId, permissions);
      
      // Reload data
      const [usersData, requestsData, statsData] = await Promise.all([
        BetaUserService.getAllBetaUsers(),
        BetaUserService.getPendingBetaRequests(),
        Promise.resolve(BetaUserService.getBetaUserStats())
      ]);

      setBetaUsers(usersData);
      setPendingRequests(requestsData);
      setStats(statsData);
      
      alert('Beta user approved successfully');
    } catch (err) {
      alert('Error approving beta user: ' + (err as Error).message);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const adminId = localStorage.getItem('sb-user-id') || 'admin';
      await BetaUserService.rejectBetaUser(requestId, adminId, reason);
      
      // Reload data
      const [usersData, requestsData, statsData] = await Promise.all([
        BetaUserService.getAllBetaUsers(),
        BetaUserService.getPendingBetaRequests(),
        Promise.resolve(BetaUserService.getBetaUserStats())
      ]);

      setBetaUsers(usersData);
      setPendingRequests(requestsData);
      setStats(statsData);
      
      alert('Beta request rejected');
    } catch (err) {
      alert('Error rejecting beta request: ' + (err as Error).message);
    }
  };

  const handleRevokeAccess = async (userId: string) => {
    if (!confirm('Are you sure you want to revoke beta access for this user?')) {
      return;
    }

    try {
      const adminId = localStorage.getItem('sb-user-id') || 'admin';
      await BetaUserService.revokeBetaAccess(userId, adminId);
      
      // Reload data
      const [usersData, requestsData, statsData] = await Promise.all([
        BetaUserService.getAllBetaUsers(),
        BetaUserService.getPendingBetaRequests(),
        Promise.resolve(BetaUserService.getBetaUserStats())
      ]);

      setBetaUsers(usersData);
      setPendingRequests(requestsData);
      setStats(statsData);
      
      alert('Beta access revoked');
    } catch (err) {
      alert('Error revoking beta access: ' + (err as Error).message);
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
          Beta User Management
        </h1>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Beta Users</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Beta Buyers</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.buyers}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Beta Sellers</h3>
            <p className="text-2xl font-bold text-green-600">{stats.sellers}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Beta Admins</h3>
            <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Active This Week</h3>
            <p className="text-2xl font-bold text-orange-600">{stats.active}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setSelectedTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Beta Users ({betaUsers.length})
              </button>
              <button
                onClick={() => setSelectedTab('requests')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'requests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending Requests ({pendingRequests.length})
              </button>
            </nav>
          </div>

          {/* Beta Users Tab */}
          {selectedTab === 'users' && (
            <div className="p-6">
              {betaUsers.length === 0 ? (
                <p className="text-gray-500">No beta users yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Permissions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Approved
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Active
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {betaUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.betaRole === 'admin' ? 'bg-purple-100 text-purple-800' :
                              user.betaRole === 'seller' ? 'bg-green-100 text-green-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {user.betaRole}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {user.permissions.map((permission) => (
                                <span key={permission} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                                  {permission}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.approvedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.lastActive).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleRevokeAccess(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Revoke Access
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Pending Requests Tab */}
          {selectedTab === 'requests' && (
            <div className="p-6">
              {pendingRequests.length === 0 ? (
                <p className="text-gray-500">No pending beta requests</p>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{request.name}</h4>
                          <p className="text-sm text-gray-500">{request.email}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Wants to join as:</strong> {request.requestedRole}
                          </p>
                          <p className="text-sm text-gray-600 mt-2">
                            <strong>Reason:</strong> {request.requestReason}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            Requested: {new Date(request.requestedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleApproveRequest(request.id, 
                              request.requestedRole === 'seller' ? ['bid', 'sell'] : ['bid']
                            )}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
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
          )}
        </div>
      </div>
    </div>
  );
};
