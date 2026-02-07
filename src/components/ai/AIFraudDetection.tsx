import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Eye, Activity, TrendingUp, Users, Clock, FileText, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface FraudSignal {
  id: string;
  type: 'behavioral' | 'transactional' | 'network' | 'content';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  confidence: number;
  timestamp: Date;
  entityId: string;
  entityType: 'user' | 'auction' | 'bid' | 'product';
  indicators: string[];
  recommendedAction: 'monitor' | 'investigate' | 'suspend' | 'block';
}

interface RiskScore {
  overall: number;
  behavioral: number;
  transactional: number;
  network: number;
  content: number;
  trend: 'improving' | 'stable' | 'deteriorating';
  lastUpdated: Date;
}

interface FraudPattern {
  pattern: string;
  frequency: number;
  riskLevel: string;
  description: string;
  affectedEntities: string[];
}

const AIFraudDetection: React.FC = () => {
  const [signals, setSignals] = useState<FraudSignal[]>([]);
  const [riskScore, setRiskScore] = useState<RiskScore | null>(null);
  const [patterns, setPatterns] = useState<FraudPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSignal, setSelectedSignal] = useState<FraudSignal | null>(null);
  const [activeTab, setActiveTab] = useState<'signals' | 'patterns' | 'analytics'>('signals');

  useEffect(() => {
    fetchFraudSignals();
    fetchRiskScore();
    fetchFraudPatterns();
  }, []);

  const fetchFraudSignals = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/ai/fraud-detection/signals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeframe: '24h',
          includeHistorical: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch fraud signals');
      
      const data = await response.json();
      setSignals(data.signals || []);
    } catch (error) {
      console.error('Error fetching fraud signals:', error);
      // Use mock data for demo
      setSignals(getMockSignals());
    } finally {
      setLoading(false);
    }
  };

  const fetchRiskScore = async () => {
    try {
      const response = await fetch('/api/ai/fraud-detection/risk-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeframe: '7d',
          includeTrends: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch risk score');
      
      const data = await response.json();
      setRiskScore(data.riskScore);
    } catch (error) {
      console.error('Error fetching risk score:', error);
      // Use mock data for demo
      setRiskScore(getMockRiskScore());
    }
  };

  const fetchFraudPatterns = async () => {
    try {
      const response = await fetch('/api/ai/fraud-detection/patterns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeframe: '30d',
          minFrequency: 3,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch fraud patterns');
      
      const data = await response.json();
      setPatterns(data.patterns || []);
    } catch (error) {
      console.error('Error fetching fraud patterns:', error);
      // Use mock data for demo
      setPatterns(getMockPatterns());
    }
  };

  const getMockSignals = (): FraudSignal[] => [
    {
      id: '1',
      type: 'behavioral',
      severity: 'high',
      title: 'Unusual Bidding Pattern',
      description: 'User placing bids at maximum amount consistently across multiple auctions',
      confidence: 87,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      entityId: 'user_123',
      entityType: 'user',
      indicators: ['Rapid bidding', 'Max amount bids', 'Multiple auctions'],
      recommendedAction: 'investigate',
    },
    {
      id: '2',
      type: 'network',
      severity: 'medium',
      title: 'Suspicious Network Activity',
      description: 'Multiple accounts originating from same IP address',
      confidence: 72,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      entityId: 'network_456',
      entityType: 'user',
      indicators: ['Shared IP', 'Similar behavior', 'Coordinated activity'],
      recommendedAction: 'monitor',
    },
    {
      id: '3',
      type: 'transactional',
      severity: 'critical',
      title: 'Payment Anomaly Detected',
      description: 'Unusual payment pattern with high-value transactions',
      confidence: 94,
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      entityId: 'payment_789',
      entityType: 'bid',
      indicators: ['High value', 'Unusual timing', 'Rapid succession'],
      recommendedAction: 'suspend',
    },
    {
      id: '4',
      type: 'content',
      severity: 'low',
      title: 'Suspicious Product Description',
      description: 'Product description contains potentially misleading information',
      confidence: 65,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      entityId: 'product_101',
      entityType: 'product',
      indicators: ['Misleading claims', 'Stock photos', 'Vague details'],
      recommendedAction: 'investigate',
    },
  ];

  const getMockRiskScore = (): RiskScore => ({
    overall: 72,
    behavioral: 68,
    transactional: 85,
    network: 45,
    content: 62,
    trend: 'deteriorating',
    lastUpdated: new Date(),
  });

  const getMockPatterns = (): FraudPattern[] => [
    {
      pattern: 'Bid Sniping',
      frequency: 23,
      riskLevel: 'medium',
      description: 'Last-second bidding to win auctions',
      affectedEntities: ['user_123', 'user_456', 'user_789'],
    },
    {
      pattern: 'Shill Bidding',
      frequency: 8,
      riskLevel: 'high',
      description: 'Fake bids to artificially increase prices',
      affectedEntities: ['user_234', 'user_567'],
    },
    {
      pattern: 'Account Takeover',
      frequency: 3,
      riskLevel: 'critical',
      description: 'Unauthorized access to user accounts',
      affectedEntities: ['user_890', 'user_345'],
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'monitor': return 'text-blue-600 bg-blue-100';
      case 'investigate': return 'text-yellow-600 bg-yellow-100';
      case 'suspend': return 'text-orange-600 bg-orange-100';
      case 'block': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'behavioral': return <Users className="w-4 h-4" />;
      case 'transactional': return <TrendingUp className="w-4 h-4" />;
      case 'network': return <Activity className="w-4 h-4" />;
      case 'content': return <FileText className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const handleSignalAction = async (signalId: string, action: string) => {
    try {
      const response = await fetch('/api/ai/fraud-detection/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signalId,
          action,
        }),
      });

      if (!response.ok) throw new Error('Failed to execute action');
      
      toast.success(`Action executed: ${action}`);
      // Refresh signals
      fetchFraudSignals();
    } catch (error) {
      console.error('Error executing action:', error);
      toast.error('Failed to execute action');
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
            <Shield className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Fraud Detection
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real-time fraud monitoring and prevention
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Last updated:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Risk Score Overview */}
      {riskScore && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Overall Risk Score</h4>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {riskScore.overall}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                riskScore.trend === 'improving' ? 'bg-green-100 text-green-800' :
                riskScore.trend === 'stable' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {riskScore.trend}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Behavioral</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${riskScore.behavioral}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Transactional</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${riskScore.transactional}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Network</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full"
                  style={{ width: `${riskScore.network}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Content</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${riskScore.content}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg w-fit">
        {(['signals', 'patterns', 'analytics'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === tab
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'signals' && (
        <div className="space-y-4">
          {signals.map((signal, index) => (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedSignal?.id === signal.id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setSelectedSignal(signal)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getSeverityColor(signal.severity)}`}>
                    {getTypeIcon(signal.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {signal.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {signal.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(signal.severity)}`}>
                    {signal.severity}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {signal.confidence}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                  <span>Type: {signal.type}</span>
                  <span>Entity: {signal.entityType}</span>
                  <span>ID: {signal.entityId}</span>
                  <span>{signal.timestamp.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(signal.recommendedAction)}`}>
                    {signal.recommendedAction}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {signal.indicators.map((indicator, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                  >
                    {indicator}
                  </span>
                ))}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSignalAction(signal.id, 'investigate');
                  }}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                >
                  Investigate
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSignalAction(signal.id, 'suspend');
                  }}
                  className="px-3 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 transition-colors"
                >
                  Suspend
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSignalAction(signal.id, 'block');
                  }}
                  className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                >
                  Block
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'patterns' && (
        <div className="space-y-4">
          {patterns.map((pattern, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {pattern.pattern}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {pattern.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    pattern.riskLevel === 'critical' ? 'bg-red-100 text-red-800' :
                    pattern.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                    pattern.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {pattern.riskLevel}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {pattern.frequency} occurrences
                  </span>
                </div>
              </div>
              
              <div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Affected Entities:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {pattern.affectedEntities.map((entity, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                    >
                      {entity}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Detection Accuracy</h4>
              <div className="text-2xl font-bold text-green-600">94.2%</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">+2.3% from last week</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">False Positives</h4>
              <div className="text-2xl font-bold text-yellow-600">3.8%</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">-1.2% from last week</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Response Time</h4>
              <div className="text-2xl font-bold text-blue-600">1.2s</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Average detection time</p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">AI Model Performance</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Behavioral Analysis</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">92%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Network Analysis</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">88%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Content Analysis</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">95%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Transaction Analysis</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">97%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIFraudDetection;
