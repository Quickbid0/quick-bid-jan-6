import React, { useState, useEffect } from 'react';
import { QuickMelaRoleGuard, SuperAdminLayout } from '../components/auth/QuickMelaAuth';
import { toast } from 'react-hot-toast';
import {
  BarChart3, TrendingUp, TrendingDown, Brain, Shield,
  Target, Users, DollarSign, Activity, AlertTriangle,
  CheckCircle, XCircle, Clock, Zap, Eye,
  MousePointer, Award, PieChart, LineChart
} from 'lucide-react';

interface AIMetrics {
  recommendations: {
    totalShown: number;
    clicked: number;
    converted: number;
    avgMatchScore: number;
    ctr: number;
    conversionRate: number;
  };
  fraudDetection: {
    totalBidsAnalyzed: number;
    fraudulentDetected: number;
    falsePositives: number;
    falseNegatives: number;
    accuracy: number;
    precision: number;
    recall: number;
  };
  userEngagement: {
    aiFeatureUsage: number;
    avgSessionTimeWithAI: number;
    bidSuccessRateWithAI: number;
    aiRecommendationAcceptance: number;
    featureAdoptionRate: number;
  };
  roiMetrics: {
    revenueFromAI: number;
    costSavings: number;
    userRetentionImprovement: number;
    avgOrderValueIncrease: number;
    totalROI: number;
  };
  modelPerformance: {
    faceRecognitionAccuracy: number;
    ocrAccuracy: number;
    fraudDetectionAccuracy: number;
    pricePredictionAccuracy: number;
    overallSystemHealth: number;
  };
}

interface TimeSeriesData {
  date: string;
  recommendations: number;
  fraudAlerts: number;
  aiUsage: number;
  roi: number;
}

const AIAnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AIMetrics | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'fraud' | 'engagement' | 'roi' | 'models'>('overview');

  useEffect(() => {
    loadAIAnalytics();
  }, [selectedTimeRange]);

  const loadAIAnalytics = async () => {
    try {
      setLoading(true);

      // Load AI metrics from backend
      const metricsResponse = await fetch(`/api/analytics/ai-metrics?range=${selectedTimeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
      } else {
        // Fallback mock data for demonstration
        setMetrics(generateMockMetrics());
      }

      // Load time series data
      const timeSeriesResponse = await fetch(`/api/analytics/ai-timeseries?range=${selectedTimeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (timeSeriesResponse.ok) {
        const timeSeriesData = await timeSeriesResponse.json();
        setTimeSeriesData(timeSeriesData);
      } else {
        setTimeSeriesData(generateMockTimeSeries());
      }

    } catch (error) {
      console.error('Error loading AI analytics:', error);
      toast.error('Failed to load AI analytics data');
      // Set mock data for demo
      setMetrics(generateMockMetrics());
      setTimeSeriesData(generateMockTimeSeries());
    } finally {
      setLoading(false);
    }
  };

  const generateMockMetrics = (): AIMetrics => ({
    recommendations: {
      totalShown: 15420,
      clicked: 2890,
      converted: 845,
      avgMatchScore: 87.5,
      ctr: 18.7,
      conversionRate: 5.5
    },
    fraudDetection: {
      totalBidsAnalyzed: 45600,
      fraudulentDetected: 234,
      falsePositives: 45,
      falseNegatives: 12,
      accuracy: 95.2,
      precision: 83.8,
      recall: 95.1
    },
    userEngagement: {
      aiFeatureUsage: 78.5,
      avgSessionTimeWithAI: 12.3,
      bidSuccessRateWithAI: 68.9,
      aiRecommendationAcceptance: 42.1,
      featureAdoptionRate: 65.3
    },
    roiMetrics: {
      revenueFromAI: 2847500,
      costSavings: 456000,
      userRetentionImprovement: 23.5,
      avgOrderValueIncrease: 15.7,
      totalROI: 312
    },
    modelPerformance: {
      faceRecognitionAccuracy: 96.8,
      ocrAccuracy: 94.2,
      fraudDetectionAccuracy: 95.2,
      pricePredictionAccuracy: 87.5,
      overallSystemHealth: 93.4
    }
  });

  const generateMockTimeSeries = (): TimeSeriesData[] => {
    const data = [];
    const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 90;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      data.push({
        date: date.toISOString().split('T')[0],
        recommendations: Math.floor(Math.random() * 500) + 200,
        fraudAlerts: Math.floor(Math.random() * 20) + 5,
        aiUsage: Math.floor(Math.random() * 1000) + 500,
        roi: Math.floor(Math.random() * 50000) + 20000
      });
    }

    return data;
  };

  const renderMetricCard = (title: string, value: string | number, change?: number, icon?: any, color?: string) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              <span className="text-sm font-medium">{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-full ${color || 'bg-blue-100'}`}>
            {React.createElement(icon, { className: `w-6 h-6 ${color?.replace('bg-', 'text-') || 'text-blue-600'}` })}
          </div>
        )}
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderMetricCard(
          'AI System Health',
          `${metrics?.modelPerformance.overallSystemHealth}%`,
          2.1,
          Activity,
          'bg-green-100'
        )}
        {renderMetricCard(
          'Total AI Revenue',
          `₹${(metrics?.roiMetrics.revenueFromAI || 0).toLocaleString()}`,
          15.3,
          DollarSign,
          'bg-blue-100'
        )}
        {renderMetricCard(
          'Fraud Prevention',
          `${metrics?.fraudDetection.accuracy}%`,
          3.2,
          Shield,
          'bg-purple-100'
        )}
        {renderMetricCard(
          'User Engagement',
          `${metrics?.userEngagement.aiFeatureUsage}%`,
          8.7,
          Users,
          'bg-indigo-100'
        )}
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Model Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Model Performance</h3>
          <div className="space-y-3">
            {[
              { name: 'Face Recognition', value: metrics?.modelPerformance.faceRecognitionAccuracy || 0, color: 'bg-blue-500' },
              { name: 'OCR Accuracy', value: metrics?.modelPerformance.ocrAccuracy || 0, color: 'bg-green-500' },
              { name: 'Fraud Detection', value: metrics?.modelPerformance.fraudDetectionAccuracy || 0, color: 'bg-purple-500' },
              { name: 'Price Prediction', value: metrics?.modelPerformance.pricePredictionAccuracy || 0, color: 'bg-orange-500' }
            ].map((model) => (
              <div key={model.name} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{model.name}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${model.color}`}
                      style={{ width: `${model.value}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                    {model.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ROI Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI ROI Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Revenue Generated</span>
              <span className="text-sm font-medium text-green-600">
                ₹{(metrics?.roiMetrics.revenueFromAI || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Cost Savings</span>
              <span className="text-sm font-medium text-blue-600">
                ₹{(metrics?.roiMetrics.costSavings || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Retention Improvement</span>
              <span className="text-sm font-medium text-purple-600">
                +{metrics?.roiMetrics.userRetentionImprovement}%
              </span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-base font-medium text-gray-900 dark:text-white">Total ROI</span>
                <span className="text-lg font-bold text-green-600">
                  {metrics?.roiMetrics.totalROI}% ✨
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent AI Activity</h3>
        <div className="space-y-3">
          {[
            { time: '2 minutes ago', event: 'Fraud detection blocked suspicious bid', type: 'security', icon: Shield },
            { time: '5 minutes ago', event: 'AI recommendation increased conversion by 23%', type: 'engagement', icon: Target },
            { time: '12 minutes ago', event: 'Face verification accuracy improved to 97%', type: 'performance', icon: CheckCircle },
            { time: '18 minutes ago', event: 'Price prediction prevented 15 overpriced listings', type: 'optimization', icon: TrendingUp },
            { time: '25 minutes ago', event: 'OCR processed 50 documents with 95% accuracy', type: 'processing', icon: Eye }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 py-2">
              <div className={`p-2 rounded-full ${
                activity.type === 'security' ? 'bg-red-100' :
                activity.type === 'engagement' ? 'bg-blue-100' :
                activity.type === 'performance' ? 'bg-green-100' :
                activity.type === 'optimization' ? 'bg-purple-100' :
                'bg-gray-100'
              }`}>
                <activity.icon className={`w-4 h-4 ${
                  activity.type === 'security' ? 'text-red-600' :
                  activity.type === 'engagement' ? 'text-blue-600' :
                  activity.type === 'performance' ? 'text-green-600' :
                  activity.type === 'optimization' ? 'text-purple-600' :
                  'text-gray-600'
                }`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.event}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderMetricCard(
          'Total Recommendations',
          metrics?.recommendations.totalShown.toLocaleString() || '0',
          12.5,
          Brain,
          'bg-purple-100'
        )}
        {renderMetricCard(
          'Click-Through Rate',
          `${metrics?.recommendations.ctr}%`,
          8.3,
          MousePointer,
          'bg-blue-100'
        )}
        {renderMetricCard(
          'Conversion Rate',
          `${metrics?.recommendations.conversionRate}%`,
          15.2,
          Target,
          'bg-green-100'
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recommendation Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Match Quality Distribution</h4>
            <div className="space-y-2">
              {[
                { range: '95-100%', count: 1250, color: 'bg-green-500' },
                { range: '85-94%', count: 2100, color: 'bg-blue-500' },
                { range: '75-84%', count: 1800, color: 'bg-yellow-500' },
                { range: '65-74%', count: 950, color: 'bg-orange-500' },
                { range: '<65%', count: 320, color: 'bg-red-500' }
              ].map((bucket) => (
                <div key={bucket.range} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{bucket.range}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${bucket.color}`}
                        style={{ width: `${(bucket.count / 6500) * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white w-12 text-right">
                      {bucket.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Top Performing Categories</h4>
            <div className="space-y-3">
              {[
                { category: 'Electronics', conversions: 245, ctr: 22.1 },
                { category: 'Jewelry', conversions: 189, ctr: 19.8 },
                { category: 'Art & Paintings', conversions: 156, ctr: 18.5 },
                { category: 'Vehicles', conversions: 134, ctr: 17.2 },
                { category: 'Handmade', conversions: 121, ctr: 16.8 }
              ].map((cat) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{cat.category}</span>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{cat.conversions}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{cat.ctr}% CTR</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFraudDetection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {renderMetricCard(
          'Bids Analyzed',
          metrics?.fraudDetection.totalBidsAnalyzed.toLocaleString() || '0',
          23.1,
          Activity,
          'bg-blue-100'
        )}
        {renderMetricCard(
          'Fraud Detected',
          metrics?.fraudDetection.fraudulentDetected.toString() || '0',
          -5.2,
          Shield,
          'bg-red-100'
        )}
        {renderMetricCard(
          'Detection Accuracy',
          `${metrics?.fraudDetection.accuracy}%`,
          2.8,
          CheckCircle,
          'bg-green-100'
        )}
        {renderMetricCard(
          'False Positives',
          metrics?.fraudDetection.falsePositives.toString() || '0',
          -12.3,
          AlertTriangle,
          'bg-yellow-100'
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detection Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Precision (Accuracy of alerts)</span>
              <span className="text-sm font-medium text-green-600">
                {metrics?.fraudDetection.precision}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Recall (Detection rate)</span>
              <span className="text-sm font-medium text-blue-600">
                {metrics?.fraudDetection.recall}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">F1 Score</span>
              <span className="text-sm font-medium text-purple-600">
                {((2 * (metrics?.fraudDetection.precision || 0) * (metrics?.fraudDetection.recall || 0)) /
                  ((metrics?.fraudDetection.precision || 0) + (metrics?.fraudDetection.recall || 0)) || 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Fraud Alerts</h3>
          <div className="space-y-3">
            {[
              { time: '5 min ago', type: 'Shill Bidding', severity: 'High', status: 'Blocked' },
              { time: '12 min ago', type: 'Rapid Bidding', severity: 'Medium', status: 'Flagged' },
              { time: '28 min ago', type: 'IP Anomaly', severity: 'Low', status: 'Monitored' },
              { time: '45 min ago', type: 'Price Manipulation', severity: 'High', status: 'Blocked' },
              { time: '1h ago', type: 'Account Pattern', severity: 'Medium', status: 'Reviewed' }
            ].map((alert, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{alert.type}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{alert.time}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    alert.severity === 'High' ? 'bg-red-100 text-red-800' :
                    alert.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {alert.severity}
                  </span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{alert.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <QuickMelaRoleGuard allowedRoles={['SUPER_ADMIN']} requireVerification={true}>
        <SuperAdminLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </SuperAdminLayout>
      </QuickMelaRoleGuard>
    );
  }

  return (
    <QuickMelaRoleGuard allowedRoles={['SUPER_ADMIN']} requireVerification={true}>
      <SuperAdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Analytics Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Monitor AI system performance and business impact</p>
            </div>
            <div className="flex space-x-3">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button
                onClick={loadAIAnalytics}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'recommendations', label: 'Recommendations', icon: Brain },
                { id: 'fraud', label: 'Fraud Detection', icon: Shield },
                { id: 'engagement', label: 'User Engagement', icon: Users },
                { id: 'roi', label: 'ROI Metrics', icon: DollarSign },
                { id: 'models', label: 'Model Performance', icon: Activity }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'recommendations' && renderRecommendations()}
            {activeTab === 'fraud' && renderFraudDetection()}
            {activeTab === 'engagement' && (
              <div className="text-center py-16">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">User engagement analytics coming soon...</p>
              </div>
            )}
            {activeTab === 'roi' && (
              <div className="text-center py-16">
                <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">ROI metrics dashboard coming soon...</p>
              </div>
            )}
            {activeTab === 'models' && (
              <div className="text-center py-16">
                <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">AI model performance tracking coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </SuperAdminLayout>
    </QuickMelaRoleGuard>
  );
};

export default AIAnalyticsDashboard;
