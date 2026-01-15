// Admin Feedback Dashboard
import React, { useState, useEffect } from 'react';
import { BetaFeedbackService } from '../services/betaFeedbackService';

export const AdminFeedbackDashboard: React.FC = () => {
  const [insights, setInsights] = useState<any>(null);
  const [dropoffAnalysis, setDropoffAnalysis] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedPage, setSelectedPage] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeedbackData = async () => {
      try {
        const insightsData = BetaFeedbackService.generateInsights();
        const dropoffData = BetaFeedbackService.getDropoffAnalysis();
        
        setInsights(insightsData);
        setDropoffAnalysis(dropoffData);
      } catch (err) {
        console.error('Error loading feedback data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFeedbackData();
  }, []);

  const filteredDropoffData = dropoffAnalysis.filter(item => 
    selectedRole === 'all' || item.page.includes(selectedRole)
  ).filter(item => 
    selectedPage === 'all' || item.page === selectedPage
  );

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
          Beta User Feedback Insights
        </h1>

        {/* Key Insights */}
        {insights && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-2">User Engagement</h3>
              <p className={`text-2xl font-bold ${
                insights.userEngagementLevel === 'high' ? 'text-green-600' :
                insights.userEngagementLevel === 'medium' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {insights.userEngagementLevel.toUpperCase()}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Top Drop-off Pages</h3>
              <div className="space-y-2">
                {insights.topDropoffPages.slice(0, 3).map((page: string, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-sm text-gray-700">{page}</span>
                    <span className="text-sm text-red-600 font-medium">High</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Confusion Points</h3>
              <div className="space-y-2">
                {insights.commonConfusionPoints.slice(0, 3).map((point: string, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-sm text-gray-700">{point}</span>
                    <span className="text-sm text-orange-600 font-medium">Action Needed</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Filters</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="guest">Guest</option>
                  <option value="beta_buyer">Beta Buyer</option>
                  <option value="beta_seller">Beta Seller</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page
                </label>
                <select
                  value={selectedPage}
                  onChange={(e) => setSelectedPage(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Pages</option>
                  <option value="dashboard">Dashboard</option>
                  <option value="product">Product Detail</option>
                  <option value="wallet">Wallet</option>
                  <option value="beta-request">Beta Request</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Drop-off Analysis Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Drop-off Analysis ({filteredDropoffData.length} pages)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Events
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Abandonments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Drop-off Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDropoffData.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.page}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.totalEvents}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.abandonmentEvents}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.dropoffRate > 50 ? 'bg-red-100 text-red-800' :
                        item.dropoffRate > 25 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.dropoffRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.dropoffRate > 50 ? 'bg-red-100 text-red-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {item.dropoffRate > 50 ? 'Critical' : 'High'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Recommendations */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">
            Recommended Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">
                High Drop-off Pages
              </h4>
              <p className="text-sm text-blue-700">
                Review pages with &gt;50% drop-off rates for UX improvements.
              </p>
            </div>
            <div className="bg-white p-4 rounded border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">
                Confusion Points
              </h4>
              <p className="text-sm text-blue-700">
                Add help text or simplify workflows for common confusion areas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
