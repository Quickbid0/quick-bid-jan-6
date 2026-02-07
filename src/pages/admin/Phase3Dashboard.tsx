// 📊 PHASE 3 WEEKLY MEASUREMENT SYSTEM
// src/pages/admin/Phase3Dashboard.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  Users, 
  Shield, 
  DollarSign, 
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Activity,
  Eye,
  Zap,
  Award,
  RefreshCw
} from 'lucide-react';
import Phase3RetentionService from '../../services/phase3Retention.service';
import CoreLoopService from '../../services/coreLoop.service';

interface Phase3Metrics {
  northStar: {
    type: 'repeat_transaction_rate';
    target: 'buyers' | 'sellers';
    threshold: number;
    current: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    status: 'on_track' | 'needs_attention' | 'critical';
  };
  coreLoops: {
    buyerLoop: any;
    sellerLoop: any;
  };
  trust: {
    verifiedSellerCompletionRate: number;
    disputesPer100Auctions: number;
    disputeResolutionRate: number;
    trustScoreTrend: 'improving' | 'declining' | 'stable';
  };
  revenue: {
    revenuePerCompletedAuction: number;
    commissionDropOffRate: number;
    averageOrderValue: number;
    revenueGrowthRate: number;
  };
  retention: {
    repeatBidderRate: number;
    repeatSellerRate: number;
    timeBetweenFirstAndSecondAction: {
      buyers: number;
      sellers: number;
    };
    userRetentionRate: number;
  };
  insights: any[];
  recommendations: any[];
}

const Phase3Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<Phase3Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'northstar' | 'coreloops' | 'weekly'>('northstar');
  const [singleQuestionAnswer, setSingleQuestionAnswer] = useState<any>(null);
  
  const phase3Service = new Phase3RetentionService();
  const coreLoopService = new CoreLoopService();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        
        // Generate current week's report
        const currentMetrics = phase3Service.generateWeeklyReport();
        setMetrics(currentMetrics);
        
        // Answer the single question
        const answer = phase3Service.answerTheSingleQuestion();
        setSingleQuestionAnswer(answer);
        
      } catch (error) {
        console.error('Failed to fetch Phase 3 metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Phase 3 Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!metrics || !singleQuestionAnswer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🎯</div>
          <p className="text-gray-600">Failed to load Phase 3 data</p>
        </div>
      </div>
    );
  }

  const { northStar, coreLoops, trust, revenue, retention } = metrics;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎯 Phase 3: Retention & Scale Signals</h1>
          <p className="text-gray-600">Prove users come back without being pushed</p>
        </div>

        {/* The Single Question */}
        <div className={`bg-white rounded-lg shadow p-6 mb-8 border-2 ${
          singleQuestionAnswer.answer ? 'border-green-200' : 'border-red-200'
        }`}>
          <div className="flex items-center mb-4">
            <Target className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">THE SINGLE QUESTION</h3>
          </div>
          <div className="text-lg font-medium text-gray-900 mb-2">
            "Will users return and transact again without incentives?"
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`text-2xl font-bold mr-3 ${
                singleQuestionAnswer.answer ? 'text-green-600' : 'text-red-600'
              }`}>
                {singleQuestionAnswer.answer ? 'YES' : 'NO'}
              </div>
              <div className="text-sm text-gray-600">
                Confidence: {singleQuestionAnswer.confidence.toFixed(1)}%
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              singleQuestionAnswer.answer ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {singleQuestionAnswer.answer ? 'Ready for Phase 4' : 'Continue Phase 3'}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">{singleQuestionAnswer.reasoning}</p>
        </div>

        {/* North Star Metric */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center mb-4">
            <Award className="w-6 h-6 text-purple-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">NORTH STAR METRIC</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {northStar.current.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Current Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {northStar.threshold}%
              </div>
              <div className="text-sm text-gray-600">Target</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 capitalize">
                {northStar.target}
              </div>
              <div className="text-sm text-gray-600">Target Group</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                northStar.status === 'on_track' ? 'text-green-600' :
                northStar.status === 'needs_attention' ? 'text-orange-600' : 'text-red-600'
              }`}>
                {northStar.status.replace('_', ' ')}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setSelectedTab('northstar')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'northstar'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  North Star
                </div>
              </button>
              <button
                onClick={() => setSelectedTab('coreloops')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'coreloops'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Core Loops
                </div>
              </button>
              <button
                onClick={() => setSelectedTab('weekly')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'weekly'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Weekly Metrics
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {selectedTab === 'northstar' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 North Star Details</h3>
                
                {/* Repeat Transaction Rate */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-3">👤 Repeat Buyers</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">Repeat Rate</span>
                        <span className="text-sm font-medium text-blue-900">
                          {retention.repeatBidderRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-blue-700">Time to Return</span>
                        <span className="text-sm font-medium text-blue-900">
                          {retention.timeBetweenFirstAndSecondAction.buyers} days
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-3">🏪 Repeat Sellers</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-green-700">Repeat Rate</span>
                        <span className="text-sm font-medium text-green-900">
                          {retention.repeatSellerRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-green-700">Time to Return</span>
                        <span className="text-sm font-medium text-green-900">
                          {retention.timeBetweenFirstAndSecondAction.sellers} days
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress towards target */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">📈 Progress to Target</h4>
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                    <div 
                      className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(northStar.current, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{northStar.current.toFixed(1)}% Complete</span>
                    <span>{northStar.threshold}% Target</span>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'coreloops' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Core Loop Analysis</h3>
                
                {/* Buyer Loop */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="font-medium text-blue-900 mb-4">👤 Buyer Loop</h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <Eye className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-blue-900">Discovery</div>
                      <div className="text-xs text-blue-700">
                        {coreLoops.buyerLoop.auctionDiscovery?.completionRate || 85}% complete
                      </div>
                    </div>
                    <div className="text-center">
                      <Zap className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-blue-900">Bid Placed</div>
                      <div className="text-xs text-blue-700">
                        {coreLoops.buyerLoop.bidPlaced?.successRate || 95}% success
                      </div>
                    </div>
                    <div className="text-center">
                      <CheckCircle className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-blue-900">Outcome Clear</div>
                      <div className="text-xs text-blue-700">
                        {coreLoops.buyerLoop.outcomeClear?.clarityScore || 90}% clarity
                      </div>
                    </div>
                    <div className="text-center">
                      <DollarSign className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-blue-900">Wallet Updated</div>
                      <div className="text-xs text-blue-700">
                        {coreLoops.buyerLoop.walletUpdated?.updateSuccessRate || 97}% success
                      </div>
                    </div>
                    <div className="text-center">
                      <RefreshCw className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-blue-900">Return</div>
                      <div className="text-xs text-blue-700">
                        {coreLoops.buyerLoop.return?.returnRate || 28}% return
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seller Loop */}
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="font-medium text-green-900 mb-4">🏪 Seller Loop</h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <Eye className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-green-900">Created</div>
                      <div className="text-xs text-green-700">
                        {coreLoops.sellerLoop.auctionCreated?.successRate || 90}% success
                      </div>
                    </div>
                    <div className="text-center">
                      <Activity className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-green-900">Bids Received</div>
                      <div className="text-xs text-green-700">
                        {coreLoops.sellerLoop.bidsReceived?.averageBidsPerAuction || 4.5} avg bids
                      </div>
                    </div>
                    <div className="text-center">
                      <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-green-900">Sale Completed</div>
                      <div className="text-xs text-green-700">
                        {coreLoops.sellerLoop.saleCompleted?.completionRate || 75}% complete
                      </div>
                    </div>
                    <div className="text-center">
                      <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-green-900">Earnings Visible</div>
                      <div className="text-xs text-green-700">
                        {coreLoops.sellerLoop.earningsVisible?.clarityScore || 92}% clarity
                      </div>
                    </div>
                    <div className="text-center">
                      <RefreshCw className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-green-900">Return</div>
                      <div className="text-xs text-green-700">
                        {coreLoops.sellerLoop.return?.returnRate || 22}% return
                      </div>
                    </div>
                  </div>
                </div>

                {/* Core Loop Improvements */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">🔧 Core Loop Improvements</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">High Impact - Low Effort</h5>
                      <div className="space-y-1">
                        <div className="flex items-center text-xs">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                          <span>Clearer auction end messages</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                          <span>Stronger winner confirmation</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                          <span>Better seller earnings visibility</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Trust Enhancements</h5>
                      <div className="space-y-1">
                        <div className="flex items-center text-xs">
                          <Shield className="w-3 h-3 text-blue-500 mr-2" />
                          <span>"Verified seller" badges</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <Shield className="w-3 h-3 text-blue-500 mr-2" />
                          <span>"Admin protected" indicators</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <Shield className="w-3 h-3 text-blue-500 mr-2" />
                          <span>Dispute resolution status</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'weekly' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Weekly Metrics</h3>
                
                {/* Trust Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <div className="flex items-center mb-4">
                      <Shield className="w-8 h-8 text-blue-600 mr-3" />
                      <h2 className="text-lg font-semibold text-gray-900">Trust</h2>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Verified Sellers</span>
                        <span className="text-sm font-medium text-gray-900">
                          {trust.verifiedSellerCompletionRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Disputes/100 Auctions</span>
                        <span className={`text-sm font-medium ${
                          trust.disputesPer100Auctions <= 3 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {trust.disputesPer100Auctions}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Resolution Rate</span>
                        <span className="text-sm font-medium text-gray-900">
                          {trust.disputeResolutionRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <div className="flex items-center mb-4">
                      <DollarSign className="w-8 h-8 text-green-600 mr-3" />
                      <h2 className="text-lg font-semibold text-gray-900">Revenue</h2>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Revenue/Auction</span>
                        <span className="text-sm font-medium text-gray-900">
                          ${revenue.revenuePerCompletedAuction.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Commission Drop-off</span>
                        <span className={`text-sm font-medium ${
                          revenue.commissionDropOffRate <= 10 ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {revenue.commissionDropOffRate}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Revenue Growth</span>
                        <span className={`text-sm font-medium ${
                          revenue.revenueGrowthRate >= 10 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {revenue.revenueGrowthRate}%
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <div className="flex items-center mb-4">
                      <RotateCcw className="w-8 h-8 text-purple-600 mr-3" />
                      <h2 className="text-lg font-semibold text-gray-900">Retention</h2>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Repeat Buyers</span>
                        <span className={`text-sm font-medium ${
                          retention.repeatBidderRate >= 30 ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {retention.repeatBidderRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Repeat Sellers</span>
                        <span className={`text-sm font-medium ${
                          retention.repeatSellerRate >= 30 ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {retention.repeatSellerRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">User Retention</span>
                        <span className="text-sm font-medium text-gray-900">
                          {retention.userRetentionRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Phase 3 Status */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                    <h3 className="font-medium text-yellow-900">Phase 3 Status</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-2">🎯 Ready for Phase 4 When:</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• 30–40% repeat usage (buyers or sellers)</li>
                        <li>• Consistent weekly revenue growth</li>
                        <li>• Disputes &lt; 2–3%</li>
                        <li>• Clear pattern in user feedback</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-2">🚫 What NOT to Do Now:</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• New monetization models</li>
                        <li>• Subscriptions + commission together</li>
                        <li>• AI trust scoring</li>
                        <li>• Advanced analytics dashboards</li>
                        <li>• Feature requests from loud users</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center text-sm text-gray-500 mt-8">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default Phase3Dashboard;
