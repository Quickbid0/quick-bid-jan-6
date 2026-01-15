import React, { useState, useEffect } from 'react';
import { Brain, Users, TrendingUp, TrendingDown, Activity, Clock, Eye, Target, BarChart3, PieChart, LineChart, Zap, RefreshCw, Filter, Calendar, MousePointer, Heart, ShoppingBag, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface UserBehaviorData {
  userId: string;
  userName: string;
  email: string;
  joinDate: Date;
  lastActive: Date;
  totalSessions: number;
  avgSessionDuration: number;
  totalBids: number;
  totalWins: number;
  totalSpent: number;
  favoriteCategories: string[];
  browsingPatterns: {
    mostViewedCategories: Array<{ category: string; views: number; avgTimeSpent: number }>;
    peakActivityHours: Array<{ hour: number; activity: number }>;
    deviceUsage: Array<{ device: string; percentage: number }>;
    searchPatterns: Array<{ query: string; frequency: number; category: string }>;
  };
  engagementMetrics: {
    clickThroughRate: number;
    conversionRate: number;
    bounceRate: number;
    retentionRate: number;
    satisfactionScore: number;
  };
  predictiveInsights: {
    churnRisk: 'low' | 'medium' | 'high';
    lifetimeValue: number;
    nextPurchaseProbability: number;
    preferredAuctionTypes: string[];
    priceSensitivity: 'low' | 'medium' | 'high';
  };
}

interface BehaviorPattern {
  id: string;
  name: string;
  description: string;
  type: 'browsing' | 'bidding' | 'searching' | 'engagement' | 'conversion';
  frequency: number;
  impact: 'high' | 'medium' | 'low';
  usersAffected: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  recommendations: string[];
  confidence: number;
}

interface UserSegment {
  id: string;
  name: string;
  description: string;
  size: number;
  characteristics: string[];
  behaviors: string[];
  value: number;
  growthRate: number;
  retentionRate: number;
  color: string;
}

interface BehaviorInsight {
  category: 'engagement' | 'retention' | 'conversion' | 'satisfaction';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommendation: string;
  confidence: number;
  expectedImpact: number;
  timeframe: string;
}

interface FunnelData {
  stage: string;
  users: number;
  conversionRate: number;
  dropoffRate: number;
  avgTimeSpent: number;
}

const AIUserBehaviorAnalytics: React.FC = () => {
  const [userBehaviorData, setUserBehaviorData] = useState<UserBehaviorData[]>([]);
  const [patterns, setPatterns] = useState<BehaviorPattern[]>([]);
  const [segments, setSegments] = useState<UserSegment[]>([]);
  const [insights, setInsights] = useState<BehaviorInsight[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoAnalysis, setAutoAnalysis] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');

  useEffect(() => {
    loadBehaviorData();
    
    if (autoAnalysis) {
      const interval = setInterval(() => {
        analyzeBehavior();
      }, 300000); // Analyze every 5 minutes
      return () => clearInterval(interval);
    }
  }, [autoAnalysis, selectedTimeRange]);

  const loadBehaviorData = async () => {
    try {
      setLoading(true);
      
      // Simulate loading behavior data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockUserData = generateMockUserData();
      const mockPatterns = generateMockPatterns();
      const mockSegments = generateMockSegments();
      const mockInsights = generateMockInsights();
      const mockFunnelData = generateMockFunnelData();
      
      setUserBehaviorData(mockUserData);
      setPatterns(mockPatterns);
      setSegments(mockSegments);
      setInsights(mockInsights);
      setFunnelData(mockFunnelData);
      
    } catch (error) {
      console.error('Error loading behavior data:', error);
      toast.error('Failed to load behavior data');
    } finally {
      setLoading(false);
    }
  };

  const generateMockUserData = (): UserBehaviorData[] => [
    {
      userId: '1',
      userName: 'John Doe',
      email: 'john@example.com',
      joinDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
      totalSessions: 245,
      avgSessionDuration: 12.5,
      totalBids: 89,
      totalWins: 23,
      totalSpent: 456000,
      favoriteCategories: ['Electronics', 'Automobiles'],
      browsingPatterns: {
        mostViewedCategories: [
          { category: 'Electronics', views: 156, avgTimeSpent: 4.2 },
          { category: 'Automobiles', views: 98, avgTimeSpent: 6.8 },
          { category: 'Home & Lifestyle', views: 45, avgTimeSpent: 3.1 },
        ],
        peakActivityHours: [
          { hour: 10, activity: 85 },
          { hour: 14, activity: 92 },
          { hour: 20, activity: 78 },
        ],
        deviceUsage: [
          { device: 'Desktop', percentage: 65 },
          { device: 'Mobile', percentage: 35 },
        ],
        searchPatterns: [
          { query: 'wireless headphones', frequency: 12, category: 'Electronics' },
          { query: 'vintage watches', frequency: 8, category: 'Jewelry' },
        ],
      },
      engagementMetrics: {
        clickThroughRate: 78,
        conversionRate: 26,
        bounceRate: 32,
        retentionRate: 85,
        satisfactionScore: 4.2,
      },
      predictiveInsights: {
        churnRisk: 'low',
        lifetimeValue: 1250000,
        nextPurchaseProbability: 87,
        preferredAuctionTypes: ['Timed', 'Live'],
        priceSensitivity: 'medium',
      },
    },
    {
      userId: '2',
      userName: 'Jane Smith',
      email: 'jane@example.com',
      joinDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      lastActive: new Date(Date.now() - 30 * 60 * 60 * 1000),
      totalSessions: 156,
      avgSessionDuration: 18.3,
      totalBids: 67,
      totalWins: 19,
      totalSpent: 234000,
      favoriteCategories: ['Fashion', 'Home & Lifestyle'],
      browsingPatterns: {
        mostViewedCategories: [
          { category: 'Fashion', views: 189, avgTimeSpent: 5.6 },
          { category: 'Home & Lifestyle', views: 134, avgTimeSpent: 4.2 },
          { category: 'Handmade & Creative', views: 67, avgTimeSpent: 7.1 },
        ],
        peakActivityHours: [
          { hour: 9, activity: 72 },
          { hour: 13, activity: 88 },
          { hour: 19, activity: 95 },
        ],
        deviceUsage: [
          { device: 'Mobile', percentage: 78 },
          { device: 'Desktop', percentage: 22 },
        ],
        searchPatterns: [
          { query: 'designer bags', frequency: 15, category: 'Fashion' },
          { query: 'home decor', frequency: 11, category: 'Home & Lifestyle' },
        ],
      },
      engagementMetrics: {
        clickThroughRate: 82,
        conversionRate: 31,
        bounceRate: 28,
        retentionRate: 91,
        satisfactionScore: 4.5,
      },
      predictiveInsights: {
        churnRisk: 'low',
        lifetimeValue: 890000,
        nextPurchaseProbability: 92,
        preferredAuctionTypes: ['Buy Now', 'Timed'],
        priceSensitivity: 'high',
      },
    },
  ];

  const generateMockPatterns = (): BehaviorPattern[] => [
    {
      id: '1',
      name: 'Weekend Bidding Surge',
      description: 'Users show 45% more bidding activity on weekends',
      type: 'bidding',
      frequency: 78,
      impact: 'high',
      usersAffected: 1245,
      trend: 'increasing',
      recommendations: [
        'Schedule high-value auctions for weekends',
        'Increase marketing spend on Friday-Saturday',
        'Optimize mobile experience for weekend users',
      ],
      confidence: 94,
    },
    {
      id: '2',
      name: 'Mobile First Behavior',
      description: '68% of users primarily use mobile devices',
      type: 'browsing',
      frequency: 82,
      impact: 'high',
      usersAffected: 3421,
      trend: 'stable',
      recommendations: [
        'Prioritize mobile UI improvements',
        'Implement mobile-specific features',
        'Optimize page load speed for mobile',
      ],
      confidence: 96,
    },
    {
      id: '3',
      name: 'Evening Peak Hours',
      description: 'Peak activity between 8-10 PM',
      type: 'engagement',
      frequency: 91,
      impact: 'medium',
      usersAffected: 2890,
      trend: 'stable',
      recommendations: [
        'Schedule notifications for evening hours',
        'Run promotional campaigns during peak times',
        'Ensure server capacity for evening traffic',
      ],
      confidence: 88,
    },
  ];

  const generateMockSegments = (): UserSegment[] => [
    {
      id: '1',
      name: 'Power Bidders',
      description: 'High-value users who bid frequently',
      size: 892,
      characteristics: ['High bid frequency', 'High average bid value', 'Low price sensitivity'],
      behaviors: ['Daily active', 'Multiple categories', 'Quick decision making'],
      value: 4560000,
      growthRate: 12,
      retentionRate: 94,
      color: 'bg-purple-500',
    },
    {
      id: '2',
      name: 'Weekend Shoppers',
      description: 'Users who primarily shop on weekends',
      size: 2341,
      characteristics: ['Weekend activity', 'Mobile-first', 'Price sensitive'],
      behaviors: ['Browse-heavy', 'Compare prices', 'Longer sessions'],
      value: 2340000,
      growthRate: 8,
      retentionRate: 76,
      color: 'bg-blue-500',
    },
    {
      id: '3',
      name: 'Casual Browsers',
      description: 'Users who browse but rarely bid',
      size: 5678,
      characteristics: ['Low bid frequency', 'High bounce rate', 'Short sessions'],
      behaviors: ['Search-heavy', 'Category exploration', 'Window shopping'],
      value: 890000,
      growthRate: -5,
      retentionRate: 45,
      color: 'bg-gray-500',
    },
  ];

  const generateMockInsights = (): BehaviorInsight[] => [
    {
      category: 'engagement',
      title: 'Mobile engagement gap identified',
      description: 'Mobile users have 23% lower conversion rates despite higher traffic',
      impact: 'high',
      actionable: true,
      recommendation: 'Optimize mobile checkout flow and reduce friction points',
      confidence: 91,
      expectedImpact: 18,
      timeframe: '2 weeks',
    },
    {
      category: 'retention',
      title: 'New user retention declining',
      description: '30-day retention rate dropped by 12% this quarter',
      impact: 'high',
      actionable: true,
      recommendation: 'Implement onboarding flow and welcome campaigns',
      confidence: 87,
      expectedImpact: 25,
      timeframe: '1 month',
    },
    {
      category: 'conversion',
      title: 'Cart abandonment high on weekends',
      description: 'Weekend cart abandonment rate is 45% higher than weekdays',
      impact: 'medium',
      actionable: true,
      recommendation: 'Implement weekend-specific retargeting campaigns',
      confidence: 83,
      expectedImpact: 15,
      timeframe: '3 weeks',
    },
  ];

  const generateMockFunnelData = (): FunnelData[] => [
    { stage: 'Visit', users: 10000, conversionRate: 100, dropoffRate: 0, avgTimeSpent: 2.1 },
    { stage: 'Browse', users: 7500, conversionRate: 75, dropoffRate: 25, avgTimeSpent: 8.3 },
    { stage: 'Search', users: 5200, conversionRate: 52, dropoffRate: 30.7, avgTimeSpent: 4.2 },
    { stage: 'View Product', users: 3100, conversionRate: 31, dropoffRate: 40.4, avgTimeSpent: 12.5 },
    { stage: 'Place Bid', users: 1800, conversionRate: 18, dropoffRate: 41.9, avgTimeSpent: 6.8 },
    { stage: 'Win Auction', users: 450, conversionRate: 4.5, dropoffRate: 75, avgTimeSpent: 3.2 },
  ];

  const analyzeBehavior = async () => {
    try {
      // Simulate AI behavior analysis
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Behavior analysis completed');
      
    } catch (error) {
      console.error('Error analyzing behavior:', error);
      toast.error('Failed to analyze behavior');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBehaviorData();
    setRefreshing(false);
    toast.success('Behavior data refreshed');
  };

  const toggleAutoAnalysis = () => {
    setAutoAnalysis(!autoAnalysis);
    toast(`${autoAnalysis ? 'Disabled' : 'Enabled'} auto-analysis`);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getChurnRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'engagement': return <Eye className="w-4 h-4 text-blue-500" />;
      case 'retention': return <Users className="w-4 h-4 text-green-500" />;
      case 'conversion': return <Target className="w-4 h-4 text-purple-500" />;
      case 'satisfaction': return <Heart className="w-4 h-4 text-red-500" />;
      default: return <Brain className="w-4 h-4 text-gray-500" />;
    }
  };

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
          <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI User Behavior Analytics
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Advanced user behavior analysis and insights
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={toggleAutoAnalysis}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              autoAnalysis 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <Brain className="w-4 h-4" />
            {autoAnalysis ? 'Auto-Analysis ON' : 'Auto-Analysis OFF'}
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

      {/* User Segments */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <PieChart className="w-4 h-4" />
          User Segments
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {segments.map((segment, index) => (
            <motion.div
              key={segment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${segment.color}`}></div>
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    {segment.name}
                  </h5>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {segment.size} users
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                {segment.description}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Value</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ₹{(segment.value / 1000).toFixed(0)}K
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Growth</span>
                  <span className={`font-medium ${segment.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {segment.growthRate > 0 ? '+' : ''}{segment.growthRate}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Retention</span>
                  <span className="font-medium text-blue-600">{segment.retentionRate}%</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Avg Value</span>
                  <span className="font-medium text-purple-600">
                    ₹{(segment.value / segment.size).toFixed(0)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Behavior Patterns */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Behavior Patterns
        </h4>
        <div className="space-y-3">
          {patterns.map((pattern, index) => (
            <motion.div
              key={pattern.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getImpactColor(pattern.impact)}`}>
                    {getTrendIcon(pattern.trend)}
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      {pattern.name}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {pattern.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(pattern.impact)}`}>
                    {pattern.impact}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {pattern.confidence}% confidence
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                  <span>{pattern.usersAffected} users</span>
                  <span>{pattern.frequency}% frequency</span>
                  <span className="capitalize">{pattern.type}</span>
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(pattern.trend)}
                  <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                    {pattern.trend}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {pattern.recommendations.slice(0, 2).map((rec, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs"
                  >
                    {rec}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Conversion Funnel
        </h4>
        <div className="space-y-2">
          {funnelData.map((stage, index) => (
            <motion.div
              key={stage.stage}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="w-24 text-sm font-medium text-gray-900 dark:text-white">
                {stage.stage}
              </div>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stage.conversionRate}%` }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {stage.users.toLocaleString()} ({stage.conversionRate}%)
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {stage.avgTimeSpent}s
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* User Behavior Details */}
      {userBehaviorData.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            User Behavior Details
          </h4>
          <div className="space-y-4">
            {userBehaviorData.slice(0, 2).map((user, index) => (
              <motion.div
                key={user.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      {user.userName}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getChurnRiskColor(user.predictiveInsights.churnRisk)}`}>
                    {user.predictiveInsights.churnRisk} churn risk
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-3">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Sessions</span>
                    <span className="font-medium text-gray-900 dark:text-white">{user.totalSessions}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Bids</span>
                    <span className="font-medium text-gray-900 dark:text-white">{user.totalBids}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Wins</span>
                    <span className="font-medium text-green-600">{user.totalWins}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Spent</span>
                    <span className="font-medium text-purple-600">₹{(user.totalSpent / 1000).toFixed(0)}K</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">CTR</span>
                    <span className="font-medium text-blue-600">{user.engagementMetrics.clickThroughRate}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Conversion</span>
                    <span className="font-medium text-green-600">{user.engagementMetrics.conversionRate}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Retention</span>
                    <span className="font-medium text-purple-600">{user.engagementMetrics.retentionRate}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">LTV</span>
                    <span className="font-medium text-orange-600">₹{(user.predictiveInsights.lifetimeValue / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights */}
      {insights.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Insights
          </h4>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-white dark:bg-gray-800`}>
                    {getCategoryIcon(insight.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {insight.title}
                      </h5>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                          {insight.impact}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {insight.confidence}% confidence
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      {insight.description}
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3 mb-3">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                        Recommendation:
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {insight.recommendation}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>Expected impact: +{insight.expectedImpact}%</span>
                      <span>Timeframe: {insight.timeframe}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIUserBehaviorAnalytics;
