// 🎯 PHASE 2: TRUST & REVENUE DASHBOARD
// src/pages/admin/Phase2Dashboard.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  DollarSign, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Award,
  Gavel,
  CreditCard,
  Star,
  BarChart3,
  Target
} from 'lucide-react';
import TrustService from '../../services/trust.service';
import MonetizationService from '../../services/monetization.service';

interface TrustMetrics {
  totalSellers: number;
  verifiedSellers: number;
  verificationRate: number;
  badgeDistribution: Record<string, number>;
  averageTrustScore: number;
  pendingVerifications: number;
  activeDisputes: number;
  resolvedDisputes: number;
  disputeResolutionRate: number;
}

interface MonetizationMetrics {
  totalRevenue: number;
  revenueByType: {
    subscription: number;
    commission: number;
    featured: number;
  };
  activeSubscriptions: number;
  subscriptionRevenue: number;
  commissionRevenue: number;
  featuredRevenue: number;
  averageOrderValue: number;
  willingnessToPay: number;
  pricingDropOffRate: number;
}

const Phase2Dashboard: React.FC = () => {
  const [trustMetrics, setTrustMetrics] = useState<TrustMetrics | null>(null);
  const [monetizationMetrics, setMonetizationMetrics] = useState<MonetizationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'trust' | 'monetization'>('trust');
  
  const trustService = new TrustService();
  const monetizationService = new MonetizationService();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        
        const trustData = trustService.getTrustMetrics();
        const monetizationData = monetizationService.getMonetizationMetrics();
        
        setTrustMetrics(trustData);
        setMonetizationMetrics(monetizationData);
      } catch (error) {
        console.error('Failed to fetch Phase 2 metrics:', error);
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
          <p className="mt-4 text-gray-600">Loading Phase 2 Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!trustMetrics || !monetizationMetrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🎯</div>
          <p className="text-gray-600">Failed to load Phase 2 data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎯 Phase 2: Trust & Revenue Dashboard</h1>
          <p className="text-gray-600">Make users feel safe + start monetization</p>
        </div>

        {/* Phase 2 Objective */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center mb-2">
            <Target className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-medium text-blue-900">Phase 2 Objective</h3>
          </div>
          <p className="text-sm text-blue-800">
            Make users feel safe + start monetization
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setSelectedTab('trust')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'trust'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Trust Features
                </div>
              </button>
              <button
                onClick={() => setSelectedTab('monetization')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'monetization'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Monetization
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {selectedTab === 'trust' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🛡️ Trust Features</h3>
                
                {/* Trust Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <div className="flex items-center mb-4">
                      <Users className="w-8 h-8 text-blue-600 mr-3" />
                      <h2 className="text-lg font-semibold text-gray-900">Total Sellers</h2>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{trustMetrics.totalSellers}</div>
                    <div className="text-sm text-gray-500">Registered sellers</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <div className="flex items-center mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                      <h2 className="text-lg font-semibold text-gray-900">Verified Sellers</h2>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{trustMetrics.verifiedSellers}</div>
                    <div className="text-sm text-gray-500">Verified accounts</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <div className="flex items-center mb-4">
                      <Award className="w-8 h-8 text-purple-600 mr-3" />
                      <h2 className="text-lg font-semibold text-gray-900">Verification Rate</h2>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">{trustMetrics.verificationRate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-500">Sellers verified</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <div className="flex items-center mb-4">
                      <Star className="w-8 h-8 text-yellow-600 mr-3" />
                      <h2 className="text-lg font-semibold text-gray-900">Avg Trust Score</h2>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">{trustMetrics.averageTrustScore.toFixed(1)}</div>
                    <div className="text-sm text-gray-500">Out of 100</div>
                  </motion.div>
                </div>

                {/* Badge Distribution */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                  <h4 className="font-medium text-gray-900 mb-4">🏆 Badge Distribution</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">{trustMetrics.badgeDistribution.none}</div>
                      <div className="text-sm text-gray-600">None</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{trustMetrics.badgeDistribution.verified}</div>
                      <div className="text-sm text-blue-600">Verified</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{trustMetrics.badgeDistribution.trusted}</div>
                      <div className="text-sm text-green-600">Trusted</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{trustMetrics.badgeDistribution.premium}</div>
                      <div className="text-sm text-purple-600">Premium</div>
                    </div>
                  </div>
                </div>

                {/* Dispute Resolution */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h4 className="font-medium text-gray-900 mb-4">⚖️ Dispute Resolution</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{trustMetrics.activeDisputes}</div>
                      <div className="text-sm text-orange-600">Active Disputes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{trustMetrics.resolvedDisputes}</div>
                      <div className="text-sm text-green-600">Resolved Disputes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{trustMetrics.disputeResolutionRate.toFixed(1)}%</div>
                      <div className="text-sm text-blue-600">Resolution Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'monetization' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Monetization</h3>
                
                {/* Revenue Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <div className="flex items-center mb-4">
                      <DollarSign className="w-8 h-8 text-green-600 mr-3" />
                      <h2 className="text-lg font-semibold text-gray-900">Total Revenue</h2>
                    </div>
                    <div className="text-2xl font-bold text-green-600">${monetizationMetrics.totalRevenue.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">All revenue streams</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <div className="flex items-center mb-4">
                      <CreditCard className="w-8 h-8 text-blue-600 mr-3" />
                      <h2 className="text-lg font-semibold text-gray-900">Active Subscriptions</h2>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{monetizationMetrics.activeSubscriptions}</div>
                    <div className="text-sm text-gray-500">Paying subscribers</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <div className="flex items-center mb-4">
                      <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
                      <h2 className="text-lg font-semibold text-gray-900">Avg Order Value</h2>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">${monetizationMetrics.averageOrderValue.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">Per transaction</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-lg shadow p-6"
                  >
                    <div className="flex items-center mb-4">
                      <Target className="w-8 h-8 text-orange-600 mr-3" />
                      <h2 className="text-lg font-semibold text-gray-900">Willingness to Pay</h2>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">{monetizationMetrics.willingnessToPay}%</div>
                    <div className="text-sm text-gray-500">User willingness</div>
                  </motion.div>
                </div>

                {/* Revenue Breakdown */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                  <h4 className="font-medium text-gray-900 mb-4">📊 Revenue Breakdown</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">${monetizationMetrics.revenueByType.subscription.toFixed(2)}</div>
                      <div className="text-sm text-blue-600">Subscription Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">${monetizationMetrics.revenueByType.commission.toFixed(2)}</div>
                      <div className="text-sm text-green-600">Commission Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">${monetizationMetrics.revenueByType.featured.toFixed(2)}</div>
                      <div className="text-sm text-purple-600">Featured Revenue</div>
                    </div>
                  </div>
                </div>

                {/* Pricing Metrics */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h4 className="font-medium text-gray-900 mb-4">💸 Pricing Metrics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{monetizationMetrics.pricingDropOffRate}%</div>
                      <div className="text-sm text-orange-600">Pricing Drop-off Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{monetizationMetrics.willingnessToPay}%</div>
                      <div className="text-sm text-blue-600">Willingness to Pay</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Phase 2 Strategy */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <div className="flex items-center mb-2">
            <Target className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="font-medium text-green-900">Phase 2 Strategy</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-green-800 mb-2">🛡️ Trust Features (HIGH ROI, LOW COMPLEXITY)</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Seller verification badge (manual is fine)</li>
                <li>• Auction status clarity (Live / Ended / Cancelled)</li>
                <li>• Clear winner confirmation</li>
                <li>• Admin-backed dispute resolution</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-800 mb-2">💰 Monetization (CHOOSE ONE FIRST)</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Seller subscription</li>
                <li>• Commission per completed auction</li>
                <li>• Featured auctions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* What to Measure */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-medium text-blue-900">What to Measure</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">🛡️ Trust Metrics</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Verification rate</li>
                <li>• Trust score distribution</li>
                <li>• Dispute resolution rate</li>
                <li>• User confidence levels</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">💰 Monetization Metrics</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Willingness to pay</li>
                <li>• Drop-off after pricing shown</li>
                <li>• Revenue per user</li>
                <li>• Conversion to paid plans</li>
              </ul>
            </div>
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

export default Phase2Dashboard;
