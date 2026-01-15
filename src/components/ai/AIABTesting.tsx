import React, { useState, useEffect } from 'react';
import { Brain, Beaker, BarChart3, TrendingUp, TrendingDown, Users, Target, Zap, RefreshCw, Settings, Play, Pause, CheckCircle, XCircle, AlertTriangle, Clock, Eye, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  type: 'ui' | 'pricing' | 'content' | 'feature' | 'algorithm';
  hypothesis: string;
  variants: Array<{
    id: string;
    name: string;
    description: string;
    traffic: number;
    metrics: {
      conversions: number;
      views: number;
      conversionRate: number;
      revenue: number;
      engagement: number;
    };
  }>;
  targetAudience: string;
  startDate?: Date;
  endDate?: Date;
  duration: number;
  confidence: number;
  significance: number;
  winner?: string;
  insights: string[];
  aiOptimized: boolean;
}

interface TestVariation {
  id: string;
  testName: string;
  variation: string;
  metrics: {
    conversionRate: number;
    revenuePerUser: number;
    engagementTime: number;
    bounceRate: number;
    satisfaction: number;
  };
  improvement: number;
  confidence: number;
  recommendation: 'implement' | 'test_further' | 'discard';
}

interface TestInsight {
  category: 'performance' | 'user_behavior' | 'conversion' | 'engagement';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommendation: string;
  confidence: number;
  expectedLift: number;
  timeframe: string;
}

interface TestPattern {
  id: string;
  name: string;
  description: string;
  pattern: string;
  frequency: number;
  successRate: number;
  averageLift: number;
  recommendedFor: string[];
  confidence: number;
}

const AIABTesting: React.FC = () => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [variations, setVariations] = useState<TestVariation[]>([]);
  const [insights, setInsights] = useState<TestInsight[]>([]);
  const [patterns, setPatterns] = useState<TestPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoOptimization, setAutoOptimization] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'draft' | 'running' | 'completed' | 'paused'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'ui' | 'pricing' | 'content' | 'feature' | 'algorithm'>('all');

  useEffect(() => {
    loadTestData();
    
    if (autoOptimization) {
      const interval = setInterval(() => {
        optimizeTests();
      }, 300000); // Optimize every 5 minutes
      return () => clearInterval(interval);
    }
  }, [autoOptimization]);

  const loadTestData = async () => {
    try {
      setLoading(true);
      
      // Simulate loading test data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockTests = generateMockTests();
      const mockVariations = generateMockVariations();
      const mockInsights = generateMockInsights();
      const mockPatterns = generateMockPatterns();
      
      setTests(mockTests);
      setVariations(mockVariations);
      setInsights(mockInsights);
      setPatterns(mockPatterns);
      
    } catch (error) {
      console.error('Error loading test data:', error);
      toast.error('Failed to load test data');
    } finally {
      setLoading(false);
    }
  };

  const generateMockTests = (): ABTest[] => [
    {
      id: '1',
      name: 'Homepage Hero Section',
      description: 'Test different hero section layouts and CTAs',
      status: 'running',
      type: 'ui',
      hypothesis: 'A more visual hero section with product recommendations will increase engagement',
      variants: [
        {
          id: 'control',
          name: 'Current Design',
          description: 'Existing hero section with text-heavy layout',
          traffic: 50,
          metrics: {
            conversions: 245,
            views: 1200,
            conversionRate: 20.4,
            revenue: 48900,
            engagement: 65,
          },
        },
        {
          id: 'variant_a',
          name: 'Visual Design',
          description: 'Image-heavy layout with product recommendations',
          traffic: 50,
          metrics: {
            conversions: 298,
            views: 1200,
            conversionRate: 24.8,
            revenue: 59600,
            engagement: 78,
          },
        },
      ],
      targetAudience: 'All users',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      duration: 14,
      confidence: 95,
      significance: 0.05,
      winner: 'variant_a',
      insights: [
        'Visual design shows 21.6% conversion lift',
        'Engagement time increased by 45%',
        'Mobile users respond better to visual design',
      ],
      aiOptimized: true,
    },
    {
      id: '2',
      name: 'Pricing Display',
      description: 'Test different pricing display formats',
      status: 'completed',
      type: 'pricing',
      hypothesis: 'Showing price per day instead of total price will increase conversions',
      variants: [
        {
          id: 'control',
          name: 'Total Price',
          description: 'Show total auction price',
          traffic: 33,
          metrics: {
            conversions: 156,
            views: 800,
            conversionRate: 19.5,
            revenue: 31200,
            engagement: 58,
          },
        },
        {
          id: 'variant_b',
          name: 'Daily Price',
          description: 'Show equivalent daily price',
          traffic: 33,
          metrics: {
            conversions: 189,
            views: 800,
            conversionRate: 23.6,
            revenue: 37800,
            engagement: 62,
          },
        },
        {
          id: 'variant_c',
          name: 'Price Range',
          description: 'Show price range with average',
          traffic: 34,
          metrics: {
            conversions: 178,
            views: 800,
            conversionRate: 22.3,
            revenue: 35600,
            engagement: 61,
          },
        },
      ],
      targetAudience: 'New users',
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      duration: 7,
      confidence: 92,
      significance: 0.05,
      winner: 'variant_b',
      insights: [
        'Daily price format shows 21% conversion lift',
        'Price range format shows 14% lift',
        'New users prefer price breakdown',
      ],
      aiOptimized: true,
    },
    {
      id: '3',
      name: 'Search Algorithm',
      description: 'Test different search ranking algorithms',
      status: 'running',
      type: 'algorithm',
      hypothesis: 'AI-powered search ranking will improve user satisfaction',
      variants: [
        {
          id: 'control',
          name: 'Current Algorithm',
          description: 'Basic keyword matching',
          traffic: 50,
          metrics: {
            conversions: 89,
            views: 450,
            conversionRate: 19.8,
            revenue: 17800,
            engagement: 45,
          },
        },
        {
          id: 'variant_a',
          name: 'AI Algorithm',
          description: 'Machine learning ranking with personalization',
          traffic: 50,
          metrics: {
            conversions: 112,
            views: 450,
            conversionRate: 24.9,
            revenue: 22400,
            engagement: 67,
          },
        },
      ],
      targetAudience: 'Power users',
      startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      duration: 10,
      confidence: 88,
      significance: 0.05,
      insights: [
        'AI algorithm shows 25.8% conversion lift',
        'Search engagement increased by 49%',
        'User satisfaction scores improved',
      ],
      aiOptimized: true,
    },
  ];

  const generateMockVariations = (): TestVariation[] => [
    {
      id: '1',
      testName: 'Homepage Hero Section',
      variation: 'Visual Design',
      metrics: {
        conversionRate: 24.8,
        revenuePerUser: 49.67,
        engagementTime: 145,
        bounceRate: 32,
        satisfaction: 4.2,
      },
      improvement: 21.6,
      confidence: 95,
      recommendation: 'implement',
    },
    {
      id: '2',
      testName: 'Pricing Display',
      variation: 'Daily Price',
      metrics: {
        conversionRate: 23.6,
        revenuePerUser: 47.25,
        engagementTime: 89,
        bounceRate: 28,
        satisfaction: 4.1,
      },
      improvement: 21.0,
      confidence: 92,
      recommendation: 'implement',
    },
    {
      id: '3',
      testName: 'Search Algorithm',
      variation: 'AI Algorithm',
      metrics: {
        conversionRate: 24.9,
        revenuePerUser: 49.80,
        engagementTime: 167,
        bounceRate: 25,
        satisfaction: 4.5,
      },
      improvement: 25.8,
      confidence: 88,
      recommendation: 'implement',
    },
  ];

  const generateMockInsights = (): TestInsight[] => [
    {
      category: 'conversion',
      title: 'Visual content outperforms text-heavy designs',
      description: 'Tests show consistent 20%+ lift for visual-heavy layouts',
      impact: 'high',
      actionable: true,
      recommendation: 'Prioritize visual design in all user-facing components',
      confidence: 94,
      expectedLift: 22,
      timeframe: '2 weeks',
    },
    {
      category: 'user_behavior',
      title: 'Price breakdown increases trust',
      description: 'Users convert 21% more when price is broken down',
      impact: 'high',
      actionable: true,
      recommendation: 'Implement price breakdown across all pricing displays',
      confidence: 91,
      expectedLift: 18,
      timeframe: '1 week',
    },
    {
      category: 'engagement',
      title: 'AI personalization drives engagement',
      description: 'AI-powered features show 25%+ engagement improvements',
      impact: 'medium',
      actionable: true,
      recommendation: 'Expand AI personalization to more features',
      confidence: 87,
      expectedLift: 25,
      timeframe: '3 weeks',
    },
  ];

  const generateMockPatterns = (): TestPattern[] => [
    {
      id: '1',
      name: 'Visual Design Pattern',
      description: 'Visual-heavy layouts consistently outperform text-heavy ones',
      pattern: 'Visual content > Text content',
      frequency: 8,
      successRate: 85,
      averageLift: 22.5,
      recommendedFor: ['Homepage', 'Product pages', 'Landing pages'],
      confidence: 92,
    },
    {
      id: '2',
      name: 'Price Transparency Pattern',
      description: 'Price breakdown increases conversion rates',
      pattern: 'Price breakdown > Total price',
      frequency: 5,
      successRate: 80,
      averageLift: 19.8,
      recommendedFor: ['Pricing pages', 'Product listings', 'Checkout'],
      confidence: 88,
    },
    {
      id: '3',
      name: 'AI Personalization Pattern',
      description: 'AI-powered features show consistent improvements',
      pattern: 'AI personalization > Static content',
      frequency: 6,
      successRate: 78,
      averageLift: 24.3,
      recommendedFor: ['Search', 'Recommendations', 'Content'],
      confidence: 85,
    },
  ];

  const optimizeTests = async () => {
    try {
      // Simulate AI optimization
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('A/B test optimization completed');
      
    } catch (error) {
      console.error('Error optimizing tests:', error);
      toast.error('Failed to optimize tests');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTestData();
    setRefreshing(false);
    toast.success('Test data refreshed');
  };

  const toggleAutoOptimization = () => {
    setAutoOptimization(!autoOptimization);
    toast(`${autoOptimization ? 'Disabled' : 'Enabled'} auto-optimization`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ui': return 'text-purple-600 bg-purple-100';
      case 'pricing': return 'text-green-600 bg-green-100';
      case 'content': return 'text-blue-600 bg-blue-100';
      case 'feature': return 'text-orange-600 bg-orange-100';
      case 'algorithm': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'implement': return 'text-green-600 bg-green-100';
      case 'test_further': return 'text-yellow-600 bg-yellow-100';
      case 'discard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return <BarChart3 className="w-4 h-4 text-blue-500" />;
      case 'user_behavior': return <Users className="w-4 h-4 text-green-500" />;
      case 'conversion': return <Target className="w-4 h-4 text-purple-500" />;
      case 'engagement': return <Eye className="w-4 h-4 text-orange-500" />;
      default: return <Brain className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredTests = tests.filter(test => {
    const statusMatch = selectedStatus === 'all' || test.status === selectedStatus;
    const typeMatch = selectedType === 'all' || test.type === selectedType;
    return statusMatch && typeMatch;
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
          <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
            <Beaker className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI A/B Testing System
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Intelligent testing and optimization platform
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleAutoOptimization}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              autoOptimization 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <Brain className="w-4 h-4" />
            {autoOptimization ? 'Auto-Optimization ON' : 'Auto-Optimization OFF'}
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

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
          >
            <option value="all">All Types</option>
            <option value="ui">UI</option>
            <option value="pricing">Pricing</option>
            <option value="content">Content</option>
            <option value="feature">Feature</option>
            <option value="algorithm">Algorithm</option>
          </select>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredTests.length} tests
        </div>
      </div>

      {/* Active Tests */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Active A/B Tests
        </h4>
        <div className="space-y-4">
          {filteredTests.map((test, index) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(test.status)}`}>
                    {test.status === 'running' ? <Play className="w-4 h-4" /> :
                     test.status === 'completed' ? <CheckCircle className="w-4 h-4" /> :
                     test.status === 'paused' ? <Pause className="w-4 h-4" /> :
                     <Settings className="w-4 h-4" />}
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      {test.name}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {test.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                    {test.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(test.type)}`}>
                    {test.type}
                  </span>
                  {test.aiOptimized && (
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                      AI Optimized
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Hypothesis: {test.hypothesis}
                </p>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Target: {test.targetAudience} | Duration: {test.duration} days | 
                  Confidence: {test.confidence}% | Significance: {(test.significance * 100).toFixed(0)}%
                </div>
              </div>
              
              <div className="space-y-2 mb-3">
                {test.variants.map((variant, variantIndex) => (
                  <div key={variant.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        variant.id === test.winner ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {variant.name}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">
                          {variant.description}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-right">
                        <span className="text-gray-600 dark:text-gray-400">CR</span>
                        <span className="font-medium text-green-600">{variant.metrics.conversionRate}%</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-600 dark:text-gray-400">Revenue</span>
                        <span className="font-medium text-blue-600">₹{(variant.metrics.revenue / 1000).toFixed(1)}K</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-600 dark:text-gray-400">Traffic</span>
                        <span className="font-medium text-gray-900 dark:text-white">{variant.traffic}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {test.winner && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded p-3 mb-3">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                    Winner: {test.variants.find(v => v.id === test.winner)?.name}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {test.insights.map((insight, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs"
                      >
                        {insight}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>
                  {test.startDate && `Started: ${test.startDate.toLocaleDateString()}`}
                  {test.endDate && ` | Ended: ${test.endDate.toLocaleDateString()}`}
                </span>
                <div className="flex items-center gap-2">
                  {test.status === 'running' && (
                    <button className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded">
                      Pause
                    </button>
                  )}
                  {test.status === 'paused' && (
                    <button className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                      Resume
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Test Variations Performance */}
      {variations.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Variation Performance
          </h4>
          <div className="space-y-3">
            {variations.map((variation, index) => (
              <motion.div
                key={variation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      {variation.testName} - {variation.variation}
                    </h5>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRecommendationColor(variation.recommendation)}`}>
                        {variation.recommendation.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {variation.confidence}% confidence
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-green-600">
                      +{variation.improvement}%
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">lift</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-5 gap-4 text-xs">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Conv. Rate</span>
                    <span className="font-medium text-green-600">{variation.metrics.conversionRate}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Revenue/User</span>
                    <span className="font-medium text-blue-600">₹{variation.metrics.revenuePerUser.toFixed(0)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Engagement</span>
                    <span className="font-medium text-purple-600">{variation.metrics.engagementTime}s</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Bounce Rate</span>
                    <span className="font-medium text-red-600">{variation.metrics.bounceRate}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Satisfaction</span>
                    <span className="font-medium text-yellow-600">{variation.metrics.satisfaction}/5</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Test Patterns */}
      {patterns.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Successful Patterns
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {patterns.map((pattern, index) => (
              <motion.div
                key={pattern.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    {pattern.name}
                  </h5>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {pattern.confidence}% confidence
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {pattern.description}
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2 mb-3">
                  <p className="text-xs font-medium text-blue-800 dark:text-blue-200">
                    {pattern.pattern}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
                    <span className="font-medium text-green-600">{pattern.successRate}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Avg Lift</span>
                    <span className="font-medium text-purple-600">+{pattern.averageLift}%</span>
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
            <Target className="w-4 h-4" />
            AI Testing Insights
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
                      <span>Expected lift: +{insight.expectedLift}%</span>
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

export default AIABTesting;
