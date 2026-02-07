import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Zap, 
  BarChart3, 
  Activity,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface AIInsight {
  id: string;
  type: 'recommendation' | 'prediction' | 'alert' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  timestamp: string;
}

interface AIMetrics {
  totalInsights: number;
  accuracyRate: number;
  opportunitiesIdentified: number;
  riskAlerts: number;
}

export default function AIDashboard() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [metrics, setMetrics] = useState<AIMetrics>({
    totalInsights: 0,
    accuracyRate: 0,
    opportunitiesIdentified: 0,
    riskAlerts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate AI data loading
    setTimeout(() => {
      const mockInsights: AIInsight[] = [
        {
          id: '1',
          type: 'opportunity',
          title: 'High-Demand Vehicle Category Detected',
          description: 'SUVs in Mumbai region showing 23% higher bid activity. Consider listing similar vehicles.',
          confidence: 87,
          actionable: true,
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          type: 'prediction',
          title: 'Price Prediction Alert',
          description: '2022 Honda City likely to sell for ₹8.5-9.2L based on market analysis.',
          confidence: 92,
          actionable: false,
          timestamp: new Date().toISOString()
        },
        {
          id: '3',
          type: 'alert',
          title: 'Unusual Bidding Pattern',
          description: 'Rapid bidding detected on auction #1234. Monitor for potential fraud.',
          confidence: 78,
          actionable: true,
          timestamp: new Date().toISOString()
        },
        {
          id: '4',
          type: 'recommendation',
          title: 'Optimal Listing Time',
          description: 'Best time to list luxury vehicles is 7-9 PM on weekdays for maximum visibility.',
          confidence: 85,
          actionable: true,
          timestamp: new Date().toISOString()
        }
      ];

      setInsights(mockInsights);
      setMetrics({
        totalInsights: mockInsights.length,
        accuracyRate: 86.5,
        opportunitiesIdentified: 12,
        riskAlerts: 3
      });
      setLoading(false);
    }, 1500);
  }, []);

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'opportunity': return <Target className="w-5 h-5 text-green-500" />;
      case 'prediction': return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'alert': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'recommendation': return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      default: return <Brain className="w-5 h-5 text-gray-500" />;
    }
  };

  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'opportunity': return 'border-green-200 bg-green-50';
      case 'prediction': return 'border-blue-200 bg-blue-50';
      case 'alert': return 'border-red-200 bg-red-50';
      case 'recommendation': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">AI is analyzing your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">AI Intelligence Dashboard</h1>
                <p className="text-gray-600 mt-1">Smart insights powered by machine learning</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                AI Active
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {metrics.accuracyRate}% Accuracy
              </span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Insights</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalInsights}</p>
              </div>
              <Brain className="w-8 h-8 text-indigo-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Accuracy Rate</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.accuracyRate}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Opportunities</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.opportunitiesIdentified}</p>
              </div>
              <Target className="w-8 h-8 text-yellow-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Risk Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.riskAlerts}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </motion.div>
        </div>

        {/* AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Latest AI Insights</h2>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border rounded-lg p-4 ${getInsightColor(insight.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{insight.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{insight.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-4">
                          <span className="text-xs text-gray-500">
                            Confidence: {insight.confidence}%
                          </span>
                          {insight.actionable && (
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-medium">
                              Actionable
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(insight.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* AI Activity Feed */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Activity Feed</h2>
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  <span className="font-medium text-gray-900">Real-time Processing</span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">Market analysis completed</span>
                  <span className="text-xs text-gray-500 ml-auto">2 min ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">New opportunity detected</span>
                  <span className="text-xs text-gray-500 ml-auto">5 min ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Price prediction updated</span>
                  <span className="text-xs text-gray-500 ml-auto">8 min ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-gray-600">Risk assessment completed</span>
                  <span className="text-xs text-gray-500 ml-auto">12 min ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
