import React, { useState, useEffect } from 'react';
import { Brain, AlertTriangle, Shield, Activity, TrendingUp, TrendingDown, Users, Clock, Eye, Target, Zap, RefreshCw, CheckCircle, XCircle, BarChart3, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface AnomalyPattern {
  id: string;
  type: 'bid_sniper' | 'shill_bidding' | 'price_manipulation' | 'account_takeover' | 'coordinated_bidding' | 'unusual_timing' | 'rapid_bidding';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  detectedAt: Date;
  affectedUsers: string[];
  affectedAuctions: string[];
  indicators: string[];
  recommendedAction: 'monitor' | 'investigate' | 'suspend' | 'block';
  pattern: {
    frequency: number;
    timeWindow: string;
    characteristics: string[];
  };
}

interface BidAnomaly {
  id: string;
  userId: string;
  auctionId: string;
  timestamp: Date;
  amount: number;
  timing: string;
  anomalyType: string;
  confidence: number;
  context: {
    previousBids: Array<{ amount: number; timestamp: Date }>;
    userHistory: {
      totalBids: number;
      avgBidAmount: number;
      bidFrequency: number;
      accountAge: number;
    };
    auctionContext: {
      currentPrice: number;
      timeRemaining: string;
      totalBids: number;
      uniqueBidders: number;
    };
  };
}

interface AnomalyInsight {
  category: 'behavioral' | 'temporal' | 'network' | 'financial';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  trend: 'increasing' | 'stable' | 'decreasing';
  affectedUsers: number;
  affectedAuctions: number;
  timeRange: string;
}

interface DetectionRule {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  threshold: number;
  conditions: {
    minBidFrequency?: number;
    maxBidFrequency?: number;
    minAccountAge?: number;
    maxBidAmount?: number;
    timeWindow?: string;
    patternType?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'monitor' | 'investigate' | 'suspend' | 'block';
}

const AIAnomalyDetection: React.FC = () => {
  const [anomalies, setAnomalies] = useState<AnomalyPattern[]>([]);
  const [bidAnomalies, setBidAnomalies] = useState<BidAnomaly[]>([]);
  const [insights, setInsights] = useState<AnomalyInsight[]>([]);
  const [rules, setRules] = useState<DetectionRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [autoDetection, setAutoDetection] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDetectionRules();
    detectAnomalies();
    
    if (autoDetection) {
      const interval = setInterval(detectAnomalies, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [autoDetection]);

  const loadDetectionRules = () => {
    const defaultRules: DetectionRule[] = [
      {
        id: '1',
        name: 'Bid Sniping Detection',
        type: 'temporal',
        enabled: true,
        threshold: 0.95,
        conditions: {
          timeWindow: '30s',
          patternType: 'last_second',
          minBidFrequency: 1,
        },
        severity: 'high',
        action: 'investigate',
      },
      {
        id: '2',
        name: 'Shill Bidding Detection',
        type: 'behavioral',
        enabled: true,
        threshold: 0.90,
        conditions: {
          minAccountAge: 7,
          maxBidAmount: 100000,
          patternType: 'self_dealing',
        },
        severity: 'critical',
        action: 'block',
      },
      {
        id: '3',
        name: 'Rapid Bidding Detection',
        type: 'behavioral',
        enabled: true,
        threshold: 0.85,
        conditions: {
          maxBidFrequency: 10,
          timeWindow: '5m',
        },
        severity: 'medium',
        action: 'monitor',
      },
      {
        id: '4',
        name: 'Account Takeover Detection',
        type: 'network',
        enabled: true,
        threshold: 0.95,
        conditions: {
          minAccountAge: 1,
          patternType: 'location_change',
        },
        severity: 'critical',
        action: 'block',
      },
      {
        id: '5',
        name: 'Coordinated Bidding Detection',
        type: 'network',
        enabled: true,
        threshold: 0.88,
        conditions: {
          patternType: 'synchronized_timing',
        },
        severity: 'high',
        action: 'investigate',
      },
    ];
    setRules(defaultRules);
  };

  const detectAnomalies = async () => {
    try {
      setLoading(true);
      
      // Simulate AI anomaly detection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAnomalies = generateMockAnomalies();
      const mockBidAnomalies = generateMockBidAnomalies();
      const mockInsights = generateMockInsights();
      
      setAnomalies(mockAnomalies);
      setBidAnomalies(mockBidAnomalies);
      setInsights(mockInsights);
      
      // Trigger alerts for critical anomalies
      const criticalAnomalies = mockAnomalies.filter(a => a.severity === 'critical');
      if (criticalAnomalies.length > 0) {
        toast.error(`🚨 Critical anomaly detected: ${criticalAnomalies[0].type}`);
      }
      
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      toast.error('Failed to detect anomalies');
    } finally {
      setLoading(false);
    }
  };

  const generateMockAnomalies = (): AnomalyPattern[] => [
    {
      id: '1',
      type: 'bid_sniper',
      severity: 'high',
      confidence: 92,
      description: 'Multiple users placing bids in the last 5 seconds of auctions',
      detectedAt: new Date(),
      affectedUsers: ['user_123', 'user_456', 'user_789'],
      affectedAuctions: ['auction_1', 'auction_2'],
      indicators: ['Last-second bids', 'Synchronized timing', 'High frequency'],
      recommendedAction: 'investigate',
      pattern: {
        frequency: 15,
        timeWindow: '30s',
        characteristics: ['Last-second bids', 'Synchronized timing', 'High value bids'],
      },
    },
    {
      id: '2',
      type: 'shill_bidding',
      severity: 'critical',
      confidence: 96,
      description: 'Detected coordinated bidding activity to artificially inflate prices',
      detectedAt: new Date(Date.now() - 30 * 60 * 1000),
      affectedUsers: ['user_111', 'user_222'],
      affectedAuctions: ['auction_3'],
      indicators: ['Self-dealing', 'Price inflation', 'Coordinated timing'],
      recommendedAction: 'block',
      pattern: {
        frequency: 8,
        timeWindow: '2h',
        characteristics: ['Self-dealing bids', 'Circular bidding', 'Price manipulation'],
      },
    },
    {
      id: '3',
      type: 'account_takeover',
      severity: 'critical',
      confidence: 89,
      description: 'Unusual login patterns suggesting account compromise',
      detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      affectedUsers: ['user_333'],
      affectedAuctions: ['auction_4', 'auction_5'],
      indicators: ['Location change', 'Device change', 'Unusual timing'],
      recommendedAction: 'block',
      pattern: {
        frequency: 3,
        timeWindow: '24h',
        characteristics: ['Multiple locations', 'Device fingerprint changes', 'Unusual patterns'],
      },
    },
    {
      id: '4',
      type: 'rapid_bidding',
      severity: 'medium',
      confidence: 78,
      description: 'Users placing bids at unusually high frequency',
      detectedAt: new Date(Date.now() - 15 * 60 * 1000),
      affectedUsers: ['user_444', 'user_555'],
      affectedAuctions: ['auction_6'],
      indicators: ['High frequency', 'Short intervals', 'Automated patterns'],
      recommendedAction: 'monitor',
      pattern: {
        frequency: 25,
        timeWindow: '10m',
        characteristics: ['Rapid succession', 'Fixed intervals', 'Bot-like behavior'],
      },
    },
  ];

  const generateMockBidAnomalies = (): BidAnomaly[] => [
    {
      id: '1',
      userId: 'user_123',
      auctionId: 'auction_1',
      timestamp: new Date(Date.now() - 5 * 1000),
      amount: 250000,
      timing: 'last_second',
      anomalyType: 'bid_sniping',
      confidence: 94,
      context: {
        previousBids: [
          { amount: 240000, timestamp: new Date(Date.now() - 10 * 1000) },
          { amount: 235000, timestamp: new Date(Date.now() - 15 * 1000) },
        ],
        userHistory: {
          totalBids: 45,
          avgBidAmount: 180000,
          bidFrequency: 8,
          accountAge: 180,
        },
        auctionContext: {
          currentPrice: 250000,
          timeRemaining: '30s',
          totalBids: 23,
          uniqueBidders: 12,
        },
      },
    },
    {
      id: '2',
      userId: 'user_111',
      auctionId: 'auction_3',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      amount: 180000,
      timing: 'unusual',
      anomalyType: 'shill_bidding',
      confidence: 96,
      context: {
        previousBids: [
          { amount: 175000, timestamp: new Date(Date.now() - 5 * 60 * 1000) },
          { amount: 170000, timestamp: new Date(Date.now() - 10 * 60 * 1000) },
        ],
        userHistory: {
          totalBids: 12,
          avgBidAmount: 150000,
          bidFrequency: 3,
          accountAge: 5,
        },
        auctionContext: {
          currentPrice: 180000,
          timeRemaining: '1h 45m',
          totalBids: 8,
          uniqueBidders: 4,
        },
      },
    },
    {
      id: '3',
      userId: 'user_444',
      auctionId: 'auction_6',
      timestamp: new Date(Date.now() - 30 * 1000),
      amount: 95000,
      timing: 'rapid',
      anomalyType: 'rapid_bidding',
      confidence: 82,
      context: {
        previousBids: [
          { amount: 94000, timestamp: new Date(Date.now() - 35 * 1000) },
          { amount: 93000, timestamp: new Date(Date.now() - 40 * 1000) },
          { amount: 92000, timestamp: new Date(Date.now() - 45 * 1000) },
        ],
        userHistory: {
          totalBids: 67,
          avgBidAmount: 85000,
          bidFrequency: 15,
          accountAge: 90,
        },
        auctionContext: {
          currentPrice: 95000,
          timeRemaining: '2h 30m',
          totalBids: 34,
          uniqueBidders: 18,
        },
      },
    },
  ];

  const generateMockInsights = (): AnomalyInsight[] => [
    {
      category: 'behavioral',
      title: 'Bid Sniping Activity Increasing',
      description: 'Last-second bidding patterns have increased by 40% this week',
      impact: 'high',
      trend: 'increasing',
      affectedUsers: 45,
      affectedAuctions: 12,
      timeRange: 'Last 7 days',
    },
    {
      category: 'network',
      title: 'Coordinated Activity Detected',
      description: 'Multiple accounts showing synchronized bidding patterns',
      impact: 'medium',
      trend: 'stable',
      affectedUsers: 8,
      affectedAuctions: 3,
      timeRange: 'Last 24 hours',
    },
    {
      category: 'temporal',
      title: 'Peak Hour Bidding Patterns',
      description: 'Unusual bidding activity detected during peak hours',
      impact: 'low',
      trend: 'decreasing',
      affectedUsers: 23,
      affectedAuctions: 8,
      timeRange: 'Last 24 hours',
    },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await detectAnomalies();
    setRefreshing(false);
    toast.success('Anomaly detection refreshed');
  };

  const handleAction = async (anomalyId: string, action: string) => {
    try {
      // Simulate action execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Action executed: ${action} for anomaly ${anomalyId}`);
      
      // Update anomaly status
      setAnomalies(prev => prev.map(a => 
        a.id === anomalyId ? { ...a, status: action } : a
      ));
      
    } catch (error) {
      console.error('Error executing action:', error);
      toast.error('Failed to execute action');
    }
  };

  const toggleAutoDetection = () => {
    setAutoDetection(!autoDetection);
    if (!autoDetection) {
      toast('Auto-detection disabled');
    } else {
      toast.success('Auto-detection enabled');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-blue-600 bg-blue-100 border-blue-200';
    }
  };

  const getAnomalyIcon = (type: string) => {
    switch (type) {
      case 'bid_sniper': return <Target className="w-4 h-4 text-red-500" />;
      case 'shill_bidding': return <Users className="w-4 h-4 text-red-500" />;
      case 'account_takeover': return <Shield className="w-4 h-4 text-red-500" />;
      case 'coordinated_bidding': return <Activity className="w-4 h-4 text-orange-500" />;
      case 'price_manipulation': return <TrendingUp className="w-4 h-4 text-yellow-500" />;
      case 'unusual_timing': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'rapid_bidding': return <Zap className="w-4 h-4 text-purple-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getInsightIcon = (category: string) => {
    switch (category) {
      case 'behavioral': return <Users className="w-4 h-4 text-blue-500" />;
      case 'temporal': return <Clock className="w-4 h-4 text-green-500" />;
      case 'network': return <Activity className="w-4 h-4 text-purple-500" />;
      case 'financial': return <BarChart3 className="w-4 h-4 text-orange-500" />;
      default: return <Brain className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredAnomalies = selectedSeverity === 'all' 
    ? anomalies 
    : anomalies.filter(a => a.severity === selectedSeverity);

  const filteredBidAnomalies = selectedSeverity === 'all'
    ? bidAnomalies
    : bidAnomalies.filter(a => {
      const severity = a.confidence >= 90 ? 'critical' : a.confidence >= 80 ? 'high' : a.confidence >= 70 ? 'medium' : 'low';
      return severity === selectedSeverity;
    });

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
            <Brain className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
              AI Anomaly Detection
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real-time bidding pattern analysis and fraud detection
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleAutoDetection}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              autoDetection 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <Brain className="w-4 h-4" />
            {autoDetection ? 'Auto-Detection ON' : 'Auto-Detection OFF'}
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Anomaly Patterns */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Detected Anomaly Patterns
          </h4>
          <div className="flex gap-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {filteredAnomalies.length} patterns
            </span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as any)}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        <div className="space-y-3">
          {filteredAnomalies.map((anomaly, index) => (
            <motion.div
              key={anomaly.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${getSeverityColor(anomaly.severity)}`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-white dark:bg-gray-800`}>
                  {getAnomalyIcon(anomaly.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900 dark:text-white capitalize">
                      {anomaly.type.replace('_', ' ')}
                    </h5>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
                        {anomaly.severity}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {anomaly.confidence}% confidence
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    {anomaly.description}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {anomaly.affectedUsers.length} users affected
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {anomaly.affectedAuctions.length} auctions
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {anomaly.indicators.map((indicator, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                      >
                        {indicator}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-600 dark:text-400">
                      Pattern: {anomaly.pattern.frequency} occurrences in {anomaly.pattern.timeWindow}
                    </div>
                    <button
                      onClick={() => handleAction(anomaly.id, anomaly.recommendedAction)}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        anomaly.recommendedAction === 'block' ? 'bg-red-600 text-white' :
                        anomaly.recommendedAction === 'investigate' ? 'bg-orange-600 text-white' :
                        anomaly.recommendedAction === 'suspend' ? 'bg-yellow-600 text-white' :
                        'bg-blue-600 text-white'
                      }`}
                    >
                      {anomaly.recommendedAction}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Bid Anomalies */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-500" />
          Recent Bid Anomalies
        </h4>
        <div className="space-y-3">
          {filteredBidAnomalies.slice(0, 5).map((anomaly, index) => (
            <motion.div
              key={anomaly.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${getSeverityColor(
                    anomaly.confidence >= 90 ? 'critical' : 
                    anomaly.confidence >= 80 ? 'high' : 
                    anomaly.confidence >= 70 ? 'medium' : 'low'
                  )}`}>
                    {getAnomalyIcon(anomaly.anomalyType)}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {anomaly.anomalyType.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">
                      {anomaly.confidence}% confidence
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {anomaly.userId}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {anomaly.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
              
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Bid Amount:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ₹{anomaly.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Timing:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {anomaly.timing}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Auction:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {anomaly.auctionId}
                  </span>
                </div>
              </div>
              
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Context: User has {anomaly.context.userHistory.totalBids} total bids, avg ₹{anomaly.context.userHistory.avgBidAmount.toLocaleString()}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detection Rules */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Detection Rules
        </h4>
        <div className="space-y-3">
          {rules.map((rule, index) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  rule.enabled ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <div>
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                    {rule.name}
                  </h5>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {rule.type}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(rule.severity)}`}>
                  {rule.severity}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {rule.threshold}% threshold
                </span>
                <button
                  onClick={() => {
                    // Toggle rule enabled state
                    setRules(prev => prev.map(r => 
                      r.id === rule.id ? { ...r, enabled: !r.enabled } : r
                    ));
                  toast.success(`Rule ${rule.name} ${rule.enabled ? 'disabled' : 'enabled'}`);
                }}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    rule.enabled ? 'bg-gray-200 dark:bg-gray-600' : 'bg-green-600 text-white'
                  }`}
                >
                  {rule.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Anomaly Insights
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg bg-white dark:bg-gray-800`}>
                    {getInsightIcon(insight.category)}
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                      {insight.title}
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {insight.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                    insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {insight.impact}
                  impact
                  </span>
                  <span className={`text-xs text-gray-600 dark:text-gray-400 ${
                    insight.trend === 'increasing' ? 'text-green-600' :
                    insight.trend === 'decreasing' ? 'text-red-600' :
                    'text-blue-600'
                  }`}>
                    {insight.trend}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>{insight.affectedUsers} users</span>
                  <span>{insight.affectedAuctions} auctions</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnomalyDetection;
