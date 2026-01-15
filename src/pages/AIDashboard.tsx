import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, TrendingUp, Shield, Bot, Target, BarChart3, Activity, Zap, Settings, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AIRecommendations from '../components/ai/AIRecommendations';
import AIPricePrediction from '../components/ai/AIPricePrediction';
import AIChatbot from '../components/ai/AIChatbot';
import AIBiddingAssistant from '../components/ai/AIBiddingAssistant';
import AIFraudDetection from '../components/ai/AIFraudDetection';

interface AIMetrics {
  totalPredictions: number;
  accuracy: number;
  fraudDetected: number;
  recommendationsGenerated: number;
  userSatisfaction: number;
  processingTime: number;
  modelVersion: string;
  lastUpdated: Date;
}

const AIDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AIMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'recommendations' | 'predictions' | 'fraud' | 'assistant'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/ai/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeframe: '24h',
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch AI metrics');
      
      const data = await response.json();
      setMetrics(data.metrics);
    } catch (error) {
      console.error('Error fetching AI metrics:', error);
      // Use mock data for demo
      setMetrics(getMockMetrics());
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMetrics();
    setRefreshing(false);
    toast.success('AI metrics refreshed');
  };

  const getMockMetrics = (): AIMetrics => ({
    totalPredictions: 15420,
    accuracy: 94.2,
    fraudDetected: 234,
    recommendationsGenerated: 8934,
    userSatisfaction: 87.5,
    processingTime: 1.2,
    modelVersion: '2.1.0',
    lastUpdated: new Date(),
  });

  const getMetricIcon = (key: string) => {
    switch (key) {
      case 'totalPredictions': return <Target className="w-5 h-5" />;
      case 'accuracy': return <TrendingUp className="w-5 h-5" />;
      case 'fraudDetected': return <Shield className="w-5 h-5" />;
      case 'recommendationsGenerated': return <Sparkles className="w-5 h-5" />;
      case 'userSatisfaction': return <Bot className="w-5 h-5" />;
      case 'processingTime': return <Activity className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getMetricLabel = (key: string) => {
    switch (key) {
      case 'totalPredictions': return 'Total Predictions';
      case 'accuracy': return 'Accuracy';
      case 'fraudDetected': return 'Fraud Detected';
      case 'recommendationsGenerated': return 'Recommendations';
      case 'userSatisfaction': return 'User Satisfaction';
      case 'processingTime': return 'Avg Processing Time';
      default: return key;
    }
  };

  const getMetricValue = (key: string, value: any) => {
    switch (key) {
      case 'accuracy':
      case 'userSatisfaction':
        return `${value}%`;
      case 'processingTime':
        return `${value}s`;
      case 'totalPredictions':
      case 'fraudDetected':
      case 'recommendationsGenerated':
        return value.toLocaleString();
      default:
        return value;
    }
  };

  const getMetricColor = (key: string, value: any) => {
    switch (key) {
      case 'accuracy':
      case 'userSatisfaction':
        return value >= 90 ? 'text-green-600' : value >= 80 ? 'text-yellow-600' : 'text-red-600';
      case 'processingTime':
        return value <= 1 ? 'text-green-600' : value <= 2 ? 'text-yellow-600' : 'text-red-600';
      default:
        return 'text-gray-900 dark:text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse">
              <Brain className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                AI Intelligence Center
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Advanced AI-powered auction intelligence and automation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Model v{metrics?.modelVersion}</span>
              <span>•</span>
              <span>Updated: {metrics?.lastUpdated.toLocaleTimeString()}</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
              <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-8 p-1 bg-white dark:bg-gray-800 rounded-lg w-fit shadow-sm">
          {(['overview', 'recommendations', 'predictions', 'fraud', 'assistant'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeView === view
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                {view === 'overview' && <BarChart3 className="w-4 h-4" />}
                {view === 'recommendations' && <Sparkles className="w-4 h-4" />}
                {view === 'predictions' && <Target className="w-4 h-4" />}
                {view === 'fraud' && <Shield className="w-4 h-4" />}
                {view === 'assistant' && <Bot className="w-4 h-4" />}
                <span className="capitalize">{view}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {activeView === 'overview' && metrics && (
            <div className="space-y-8">
              {/* Metrics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Object.entries(metrics).filter(([key]) => key !== 'modelVersion' && key !== 'lastUpdated').map(([key, value], index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          {getMetricIcon(key)}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {getMetricLabel(key)}
                          </p>
                        </div>
                      </div>
                      <Zap className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      <span className={getMetricColor(key, value)}>
                        {getMetricValue(key, value)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                          style={{ 
                            width: key === 'accuracy' || key === 'userSatisfaction' 
                              ? `${value}%` 
                              : key === 'processingTime' 
                              ? `${Math.max(0, 100 - (value * 50))}%`
                              : '75%'
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* AI Features Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI Performance Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm opacity-90">Total AI Actions</p>
                      <p className="text-2xl font-bold">
                        {(metrics.totalPredictions + metrics.recommendationsGenerated + metrics.fraudDetected).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm opacity-90">Success Rate</p>
                      <p className="text-2xl font-bold">
                        {metrics.accuracy}%
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    AI Model Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Version</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {metrics.modelVersion}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Health</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Optimal
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Last Training</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        2 days ago
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveView('recommendations')}
                    className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                  >
                    <Sparkles className="w-5 h-5 text-purple-600 mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Generate Recommendations
                    </p>
                  </button>
                  <button
                    onClick={() => setActiveView('predictions')}
                    className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <Target className="w-5 h-5 text-blue-600 mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Price Predictions
                    </p>
                  </button>
                  <button
                    onClick={() => setActiveView('fraud')}
                    className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <Shield className="w-5 h-5 text-red-600 mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Fraud Detection
                    </p>
                  </button>
                  <button
                    onClick={() => setActiveView('assistant')}
                    className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  >
                    <Bot className="w-5 h-5 text-green-600 mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      AI Assistant
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeView === 'recommendations' && <AIRecommendations />}
          {activeView === 'predictions' && <AIPricePrediction productId="demo-product" />}
          {activeView === 'fraud' && <AIFraudDetection />}
          {activeView === 'assistant' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                AI Assistant
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The AI chatbot is available in the bottom-right corner of your screen.
              </p>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
                <Bot className="w-8 h-8 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click the chat icon in the bottom-right corner to start a conversation with the AI assistant.
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* AI Chatbot */}
        <AIChatbot />
      </div>
    </div>
  );
};

export default AIDashboard;
