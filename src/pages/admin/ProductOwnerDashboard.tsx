// 🎯 PRODUCT OWNER DASHBOARD
// src/pages/admin/ProductOwnerDashboard.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  ShoppingCart, 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Target,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import ProductOwnerService, { SuccessMetrics, FrictionPoint } from '../../services/productOwner.service';

interface WeeklyReport {
  metrics: SuccessMetrics;
  frictionPoints: FrictionPoint[];
  topIssues: string[];
  recommendations: string[];
}

const ProductOwnerDashboard: React.FC = () => {
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'metrics' | 'friction' | 'insights'>('metrics');
  const productOwnerService = new ProductOwnerService();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const report = productOwnerService.getWeeklyReport();
        setWeeklyReport(report);
      } catch (error) {
        console.error('Failed to fetch product owner report:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchReport, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Product Owner Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!weeklyReport) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🎯</div>
          <p className="text-gray-600">Failed to load Product Owner data</p>
        </div>
      </div>
    );
  }

  const { metrics, frictionPoints, topIssues, recommendations } = weeklyReport;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎯 Product Owner Dashboard</h1>
          <p className="text-gray-600">Core User Journeys & Success Metrics</p>
        </div>

        {/* Core User Journeys */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Buyer Journey */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center mb-4">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-lg font-semibold text-gray-900">Buyer Journey</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Bid Rate</span>
                <span className={`text-sm font-medium ${
                  metrics.buyer.bidRate >= 20 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metrics.buyer.bidRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Time to First Bid</span>
                <span className="text-sm font-medium text-gray-900">
                  {metrics.buyer.timeToFirstBid.toFixed(1)}min
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Drop-off Before Bidding</span>
                <span className={`text-sm font-medium ${
                  metrics.buyer.dropOffBeforeBidding <= 30 ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {metrics.buyer.dropOffBeforeBidding.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center">
                {metrics.buyer.bidRate >= 20 ? (
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500 mr-2" />
                )}
                <span className="text-sm text-gray-600">
                  {metrics.buyer.bidRate >= 20 ? 'On Track' : 'Needs Attention'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Seller Journey */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center mb-4">
              <ShoppingCart className="w-8 h-8 text-green-600 mr-3" />
              <h2 className="text-lg font-semibold text-gray-900">Seller Journey</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Product Add Rate</span>
                <span className={`text-sm font-medium ${
                  metrics.seller.productAddRate >= 30 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metrics.seller.productAddRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Time to First Auction</span>
                <span className="text-sm font-medium text-gray-900">
                  {metrics.seller.timeToFirstAuction.toFixed(1)}min
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Auction Completion</span>
                <span className={`text-sm font-medium ${
                  metrics.seller.auctionCompletionRate >= 60 ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {metrics.seller.auctionCompletionRate.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center">
                {metrics.seller.productAddRate >= 30 ? (
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500 mr-2" />
                )}
                <span className="text-sm text-gray-600">
                  {metrics.seller.productAddRate >= 30 ? 'Healthy' : 'Needs Improvement'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Admin Journey */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center mb-4">
              <Shield className="w-8 h-8 text-purple-600 mr-3" />
              <h2 className="text-lg font-semibold text-gray-900">Platform Health</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Demo → Real Conversion</span>
                <span className={`text-sm font-medium ${
                  metrics.platform.demoToRealConversion >= 10 ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {metrics.platform.demoToRealConversion.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Failed Action Rate</span>
                <span className={`text-sm font-medium ${
                  metrics.platform.failedActionRate <= 30 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metrics.platform.failedActionRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Support Tickets/100 Users</span>
                <span className={`text-sm font-medium ${
                  metrics.platform.supportTicketRate <= 5 ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {metrics.platform.supportTicketRate.toFixed(1)}
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center">
                {metrics.platform.demoToRealConversion >= 10 && 
                 metrics.platform.failedActionRate <= 30 && 
                 metrics.platform.supportTicketRate <= 5 ? (
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
                )}
                <span className="text-sm text-gray-600">
                  {metrics.platform.demoToRealConversion >= 10 && 
                   metrics.platform.failedActionRate <= 30 && 
                   metrics.platform.supportTicketRate <= 5 ? 'Stable' : 'Monitor'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setSelectedTab('metrics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'metrics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Success Metrics
                </div>
              </button>
              <button
                onClick={() => setSelectedTab('friction')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'friction'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Friction Points
                </div>
              </button>
              <button
                onClick={() => setSelectedTab('insights')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'insights'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Insights & Actions
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {selectedTab === 'metrics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Success Metrics</h3>
                
                {/* Buyer Metrics Detail */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3">👤 Buyer Metrics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {metrics.buyer.bidRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-blue-700">Bid Rate</div>
                      <div className="text-xs text-blue-600">
                        Target: 20% • {metrics.buyer.bidRate >= 20 ? '✅ On Track' : '❌ Needs Work'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {metrics.buyer.timeToFirstBid.toFixed(1)}min
                      </div>
                      <div className="text-sm text-blue-700">Time to First Bid</div>
                      <div className="text-xs text-blue-600">
                        Target: &lt;10min • {metrics.buyer.timeToFirstBid <= 10 ? '✅ Good' : '⚠️ Slow'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {metrics.buyer.dropOffBeforeBidding.toFixed(1)}%
                      </div>
                      <div className="text-sm text-blue-700">Drop-off Before Bidding</div>
                      <div className="text-xs text-blue-600">
                        Target: &lt;30% • {metrics.buyer.dropOffBeforeBidding <= 30 ? '✅ Good' : '⚠️ High'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seller Metrics Detail */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-3">🧑‍💼 Seller Metrics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {metrics.seller.productAddRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-green-700">Product Add Rate</div>
                      <div className="text-xs text-green-600">
                        Target: 30% • {metrics.seller.productAddRate >= 30 ? '✅ Good' : '❌ Low'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {metrics.seller.timeToFirstAuction.toFixed(1)}min
                      </div>
                      <div className="text-sm text-green-700">Time to First Auction</div>
                      <div className="text-xs text-green-600">
                        Target: &lt;15min • {metrics.seller.timeToFirstAuction <= 15 ? '✅ Good' : '⚠️ Slow'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {metrics.seller.auctionCompletionRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-green-700">Auction Completion</div>
                      <div className="text-xs text-green-600">
                        Target: 60% • {metrics.seller.auctionCompletionRate >= 60 ? '✅ Good' : '❌ Low'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Platform Metrics Detail */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-3">👑 Platform Metrics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {metrics.platform.demoToRealConversion.toFixed(1)}%
                      </div>
                      <div className="text-sm text-purple-700">Demo → Real Conversion</div>
                      <div className="text-xs text-purple-600">
                        Target: 10% • {metrics.platform.demoToRealConversion >= 10 ? '✅ Good' : '⚠️ Low'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {metrics.platform.failedActionRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-purple-700">Failed Action Rate</div>
                      <div className="text-xs text-purple-600">
                        Target: &lt;30% • {metrics.platform.failedActionRate <= 30 ? '✅ Good' : '❌ High'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {metrics.platform.supportTicketRate.toFixed(1)}
                      </div>
                      <div className="text-sm text-purple-700">Support Tickets/100 Users</div>
                      <div className="text-xs text-purple-600">
                        Target: &lt;5 • {metrics.platform.supportTicketRate <= 5 ? '✅ Good' : '⚠️ High'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'friction' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">⚠️ Friction Points</h3>
                
                {frictionPoints.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">No friction points identified</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {frictionPoints.map((point, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`border rounded-lg p-4 ${
                          point.impact === 'high' ? 'border-red-200 bg-red-50' :
                          point.impact === 'medium' ? 'border-orange-200 bg-orange-50' :
                          'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="font-medium text-gray-900">{point.step}</span>
                              <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                                point.impact === 'high' ? 'bg-red-200 text-red-800' :
                                point.impact === 'medium' ? 'bg-orange-200 text-orange-800' :
                                'bg-gray-200 text-gray-800'
                              }`}>
                                {point.impact}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{point.description}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <span className="mr-4">Type: {point.type}</span>
                              <span>Frequency: {point.frequency} times</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'insights' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Insights & Actions</h3>
                
                {/* Top Issues */}
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-3">🚨 Top Issues</h4>
                  <ul className="space-y-2">
                    {topIssues.map((issue, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        <span className="text-sm text-red-700">{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3">💡 Recommendations</h4>
                  <ul className="space-y-2">
                    {recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span className="text-sm text-blue-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weekly Checklist */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-3">✅ Weekly Checklist</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm text-green-700">Metrics reviewed</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm text-green-700">Top complaints reviewed</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-orange-500 mr-2" />
                      <span className="text-sm text-orange-700">Buyer flow walkthrough (pending)</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-orange-500 mr-2" />
                      <span className="text-sm text-orange-700">Seller flow walkthrough (pending)</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-orange-500 mr-2" />
                      <span className="text-sm text-orange-700">Remove 1 friction point (pending)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Owner Decision Rule */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Target className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="font-medium text-yellow-900">Product Owner Decision Rule</h3>
          </div>
          <p className="text-sm text-yellow-800">
            "Does this help a real user complete an auction faster, safer, or with more confidence?"
          </p>
          <p className="text-sm text-yellow-700 mt-1">
            If ❌ → backlog | If ✅ → prioritize
          </p>
        </div>

        {/* Last Updated */}
        <div className="text-center text-sm text-gray-500 mt-8">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default ProductOwnerDashboard;
