import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Activity, DollarSign, Users, Clock, Eye, Brain, RefreshCw, Calendar, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface MarketTrend {
  category: string;
  trend: 'rising' | 'falling' | 'stable';
  change: number;
  volume: number;
  avgPrice: number;
  prediction: number;
  confidence: number;
}

interface TopCategory {
  name: string;
  value: number;
  percentage: number;
  color: string;
  trend: 'up' | 'down' | 'stable';
}

interface MarketInsight {
  type: 'opportunity' | 'risk' | 'trend' | 'alert';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
  actionable: boolean;
  suggestedAction?: string;
}

interface PriceIndex {
  date: string;
  index: number;
  categories: {
    [key: string]: number;
  };
}

interface CompetitorAnalysis {
  name: string;
  marketShare: number;
  avgPrice: number;
  volume: number;
  growth: number;
}

const AIMarketInsights: React.FC = () => {
  const [trends, setTrends] = useState<MarketTrend[]>([]);
  const [topCategories, setTopCategories] = useState<TopCategory[]>([]);
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [priceIndex, setPriceIndex] = useState<PriceIndex[]>([]);
  const [competitors, setCompetitors] = useState<CompetitorAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMarketInsights();
  }, [timeframe]);

  const fetchMarketInsights = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/ai/market-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeframe,
          includePredictions: true,
          includeCompetitors: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch market insights');
      
      const data = await response.json();
      setTrends(data.trends || []);
      setTopCategories(data.topCategories || []);
      setInsights(data.insights || []);
      setPriceIndex(data.priceIndex || []);
      setCompetitors(data.competitors || []);
    } catch (error) {
      console.error('Error fetching market insights:', error);
      // Use mock data for demo
      setTrends(getMockTrends());
      setTopCategories(getMockTopCategories());
      setInsights(getMockInsights());
      setPriceIndex(getMockPriceIndex());
      setCompetitors(getMockCompetitors());
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMarketInsights();
    setRefreshing(false);
    toast.success('Market insights refreshed');
  };

  const getMockTrends = (): MarketTrend[] => [
    {
      category: 'Vehicles',
      trend: 'rising',
      change: 12.5,
      volume: 1250,
      avgPrice: 2850000,
      prediction: 3200000,
      confidence: 87,
    },
    {
      category: 'Electronics',
      trend: 'stable',
      change: 2.3,
      volume: 2100,
      avgPrice: 85000,
      prediction: 87000,
      confidence: 92,
    },
    {
      category: 'Jewelry',
      trend: 'falling',
      change: -5.8,
      volume: 450,
      avgPrice: 125000,
      prediction: 118000,
      confidence: 78,
    },
    {
      category: 'Real Estate',
      trend: 'rising',
      change: 8.7,
      volume: 180,
      avgPrice: 15000000,
      prediction: 16300000,
      confidence: 83,
    },
  ];

  const getMockTopCategories = (): TopCategory[] => [
    { name: 'Vehicles', value: 45000000, percentage: 35, color: '#8B5CF6', trend: 'up' },
    { name: 'Electronics', value: 32000000, percentage: 25, color: '#3B82F6', trend: 'stable' },
    { name: 'Jewelry', value: 22000000, percentage: 17, color: '#10B981', trend: 'down' },
    { name: 'Real Estate', value: 18000000, percentage: 14, color: '#F59E0B', trend: 'up' },
    { name: 'Others', value: 11000000, percentage: 9, color: '#6B7280', trend: 'stable' },
  ];

  const getMockInsights = (): MarketInsight[] => [
    {
      type: 'opportunity',
      title: 'Luxury Vehicle Surge',
      description: 'Premium car category showing 25% growth with increasing demand',
      impact: 'high',
      timeframe: 'Next 30 days',
      actionable: true,
      suggestedAction: 'Increase inventory in luxury vehicles category',
    },
    {
      type: 'risk',
      title: 'Electronics Price Drop',
      description: 'Consumer electronics showing declining prices due to oversupply',
      impact: 'medium',
      timeframe: 'Next 14 days',
      actionable: true,
      suggestedAction: 'Adjust pricing strategy for electronics',
    },
    {
      type: 'trend',
      title: 'Vintage Items Rising',
      description: 'Collectible and vintage items gaining popularity among millennials',
      impact: 'medium',
      timeframe: 'Next 60 days',
      actionable: true,
      suggestedAction: 'Source more vintage and collectible items',
    },
  ];

  const getMockPriceIndex = (): PriceIndex[] => [
    { date: '2024-01-01', index: 100, categories: { Vehicles: 100, Electronics: 100, Jewelry: 100 } },
    { date: '2024-01-07', index: 102, categories: { Vehicles: 105, Electronics: 98, Jewelry: 103 } },
    { date: '2024-01-14', index: 104, categories: { Vehicles: 108, Electronics: 99, Jewelry: 105 } },
    { date: '2024-01-21', index: 103, categories: { Vehicles: 107, Electronics: 101, Jewelry: 101 } },
    { date: '2024-01-28', index: 106, categories: { Vehicles: 112, Electronics: 103, Jewelry: 103 } },
  ];

  const getMockCompetitors = (): CompetitorAnalysis[] => [
    { name: 'AuctionPro', marketShare: 28, avgPrice: 95000, volume: 1200, growth: 5.2 },
    { name: 'BidMaster', marketShare: 22, avgPrice: 87000, volume: 950, growth: -2.1 },
    { name: 'QuickWin', marketShare: 18, avgPrice: 102000, volume: 780, growth: 8.7 },
    { name: 'Others', marketShare: 32, avgPrice: 78000, volume: 1400, growth: 1.5 },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'falling': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising': return 'text-green-600 bg-green-100';
      case 'falling': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'risk': return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'trend': return <Activity className="w-5 h-5 text-blue-500" />;
      default: return <Brain className="w-5 h-5 text-purple-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'risk': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'trend': return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      default: return 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20';
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
          <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Market Insights
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real-time market analysis and predictions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Market Trends */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Category Trends
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {trends.map((trend, index) => (
            <motion.div
              key={trend.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-gray-900 dark:text-white">
                  {trend.category}
                </h5>
                {getTrendIcon(trend.trend)}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Change</span>
                  <span className={`text-sm font-medium ${trend.change > 0 ? 'text-green-600' : trend.change < 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                    {trend.change > 0 ? '+' : ''}{trend.change}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Volume</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {trend.volume.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Avg Price</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ₹{trend.avgPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Prediction</span>
                  <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    ₹{trend.prediction.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">AI Confidence</span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {trend.confidence}%
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Top Categories by Volume
          </h4>
          <div className="space-y-3">
            {topCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {category.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${category.percentage}%`,
                        backgroundColor: category.color
                      }}
                    />
                  </div>
                </div>
                <div className={`p-1 rounded ${category.trend === 'up' ? 'bg-green-100' : category.trend === 'down' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                  {category.trend === 'up' ? <TrendingUp className="w-3 h-3 text-green-600" /> :
                   category.trend === 'down' ? <TrendingDown className="w-3 h-3 text-red-600" /> :
                   <Activity className="w-3 h-3 text-yellow-600" />}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Market Insights */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Insights & Opportunities
          </h4>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white dark:bg-gray-800">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {insight.title}
                      </h5>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                        insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {insight.impact} impact
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {insight.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {insight.timeframe}
                      </span>
                      {insight.actionable && (
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">
                          Actionable
                        </span>
                      )}
                    </div>
                    {insight.suggestedAction && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Suggested Action:
                        </p>
                        <p className="text-xs font-medium text-gray-900 dark:text-white">
                          {insight.suggestedAction}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Price Index Chart */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Market Price Index
        </h4>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-5 gap-4">
            {priceIndex.map((point, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {new Date(point.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {point.index}
                </div>
                <div className="text-xs text-gray-500">
                  Base: 100
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Competitor Analysis */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Competitor Analysis
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3">Platform</th>
                <th className="pb-3">Market Share</th>
                <th className="pb-3">Avg Price</th>
                <th className="pb-3">Volume</th>
                <th className="pb-3">Growth</th>
              </tr>
            </thead>
            <tbody>
              {competitors.map((competitor, index) => (
                <motion.tr
                  key={competitor.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-gray-100 dark:border-gray-700"
                >
                  <td className="py-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {competitor.name}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${competitor.marketShare}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {competitor.marketShare}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="text-sm text-gray-900 dark:text-white">
                      ₹{competitor.avgPrice.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {competitor.volume.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`text-sm font-medium ${
                      competitor.growth > 0 ? 'text-green-600' :
                      competitor.growth < 0 ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {competitor.growth > 0 ? '+' : ''}{competitor.growth}%
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AIMarketInsights;
