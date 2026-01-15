import React, { useState, useEffect } from 'react';
import { Brain, MessageSquare, ThumbsUp, ThumbsDown, Meh, Star, TrendingUp, TrendingDown, BarChart3, Users, Eye, Filter, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface ReviewData {
  id: string;
  text: string;
  rating: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  aspects: {
    aspect: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
  }[];
  keywords: string[];
  timestamp: Date;
  reviewer: string;
  helpful: number;
}

interface SentimentSummary {
  overall: {
    positive: number;
    negative: number;
    neutral: number;
    averageRating: number;
    totalReviews: number;
  };
  trends: {
    period: string;
    positive: number;
    negative: number;
    neutral: number;
  }[];
  aspects: {
    aspect: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    frequency: number;
    avgRating: number;
  }[];
  keywords: {
    word: string;
    frequency: number;
    sentiment: 'positive' | 'negative' | 'neutral';
  }[];
}

interface SentimentAlert {
  type: 'positive_spike' | 'negative_spike' | 'trend_change' | 'issue_detected';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  actionable: boolean;
  suggestedAction?: string;
}

const AISentimentAnalysis: React.FC<{
  productId?: string;
  category?: string;
  timeframe?: '7d' | '30d' | '90d';
}> = ({ productId = 'demo-product', category = 'Electronics', timeframe = '30d' }) => {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [summary, setSummary] = useState<SentimentSummary | null>(null);
  const [alerts, setAlerts] = useState<SentimentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSentiment, setSelectedSentiment] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    analyzeSentiment();
  }, [productId, timeframe]);

  const analyzeSentiment = async () => {
    try {
      setLoading(true);
      
      // Simulate AI sentiment analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockReviews = generateMockReviews();
      const mockSummary = generateMockSummary();
      const mockAlerts = generateMockAlerts();
      
      setReviews(mockReviews);
      setSummary(mockSummary);
      setAlerts(mockAlerts);
      
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      toast.error('Failed to analyze sentiment data');
    } finally {
      setLoading(false);
    }
  };

  const generateMockReviews = (): ReviewData[] => [
    {
      id: '1',
      text: 'Absolutely love this product! The quality is exceptional and it exceeded my expectations. Highly recommend!',
      rating: 5,
      sentiment: 'positive',
      confidence: 94,
      aspects: [
        { aspect: 'quality', sentiment: 'positive', confidence: 96 },
        { aspect: 'value', sentiment: 'positive', confidence: 92 },
        { aspect: 'performance', sentiment: 'positive', confidence: 90 },
      ],
      keywords: ['love', 'quality', 'exceptional', 'recommend'],
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      reviewer: 'John Doe',
      helpful: 23,
    },
    {
      id: '2',
      text: 'Product is okay but the price is too high for what you get. Expected better quality at this price point.',
      rating: 2,
      sentiment: 'negative',
      confidence: 87,
      aspects: [
        { aspect: 'price', sentiment: 'negative', confidence: 92 },
        { aspect: 'quality', sentiment: 'negative', confidence: 78 },
        { aspect: 'value', sentiment: 'negative', confidence: 85 },
      ],
      keywords: ['expensive', 'disappointed', 'quality', 'price'],
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      reviewer: 'Jane Smith',
      helpful: 15,
    },
    {
      id: '3',
      text: 'It works as described. Nothing special but does the job. Average product for average price.',
      rating: 3,
      sentiment: 'neutral',
      confidence: 82,
      aspects: [
        { aspect: 'functionality', sentiment: 'neutral', confidence: 88 },
        { aspect: 'value', sentiment: 'neutral', confidence: 75 },
      ],
      keywords: ['works', 'average', 'functional'],
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      reviewer: 'Bob Johnson',
      helpful: 8,
    },
    {
      id: '4',
      text: 'Outstanding performance and build quality! This is exactly what I needed. Customer service was also very helpful.',
      rating: 5,
      sentiment: 'positive',
      confidence: 96,
      aspects: [
        { aspect: 'performance', sentiment: 'positive', confidence: 98 },
        { aspect: 'quality', sentiment: 'positive', confidence: 94 },
        { aspect: 'service', sentiment: 'positive', confidence: 90 },
      ],
      keywords: ['outstanding', 'performance', 'quality', 'service'],
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      reviewer: 'Alice Brown',
      helpful: 31,
    },
  ];

  const generateMockSummary = (): SentimentSummary => ({
    overall: {
      positive: 65,
      negative: 20,
      neutral: 15,
      averageRating: 4.2,
      totalReviews: 1247,
    },
    trends: [
      { period: 'Week 1', positive: 70, negative: 15, neutral: 15 },
      { period: 'Week 2', positive: 68, negative: 18, neutral: 14 },
      { period: 'Week 3', positive: 65, negative: 20, neutral: 15 },
      { period: 'Week 4', positive: 62, negative: 23, neutral: 15 },
    ],
    aspects: [
      { aspect: 'quality', sentiment: 'positive', frequency: 45, avgRating: 4.5 },
      { aspect: 'price', sentiment: 'negative', frequency: 28, avgRating: 3.2 },
      { aspect: 'service', sentiment: 'positive', frequency: 22, avgRating: 4.7 },
      { aspect: 'performance', sentiment: 'positive', frequency: 38, avgRating: 4.3 },
    ],
    keywords: [
      { word: 'excellent', frequency: 45, sentiment: 'positive' },
      { word: 'quality', frequency: 38, sentiment: 'positive' },
      { word: 'expensive', frequency: 32, sentiment: 'negative' },
      { word: 'good', frequency: 28, sentiment: 'positive' },
      { word: 'disappointed', frequency: 15, sentiment: 'negative' },
    ],
  });

  const generateMockAlerts = (): SentimentAlert[] => [
    {
      type: 'negative_spike',
      title: 'Negative sentiment spike detected',
      description: 'Negative reviews increased by 15% in the last 3 days',
      severity: 'medium',
      timestamp: new Date(),
      actionable: true,
      suggestedAction: 'Investigate recent quality issues or customer service problems',
    },
    {
      type: 'trend_change',
      title: 'Sentiment trend changing',
      description: 'Overall sentiment declining from positive to neutral',
      severity: 'low',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      actionable: true,
      suggestedAction: 'Monitor customer feedback and address concerns proactively',
    },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await analyzeSentiment();
    setRefreshing(false);
    toast.success('Sentiment analysis refreshed');
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp className="w-4 h-4 text-green-500" />;
      case 'negative': return <ThumbsDown className="w-4 h-4 text-red-500" />;
      default: return <Meh className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'positive_spike': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'negative_spike': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'trend_change': return <BarChart3 className="w-4 h-4 text-yellow-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'medium': return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
      default: return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
    }
  };

  const filteredReviews = selectedSentiment === 'all' 
    ? reviews 
    : reviews.filter(review => review.sentiment === selectedSentiment);

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
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Sentiment Analysis
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Customer review sentiment and insights
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => {
              // Handle timeframe change
              analyzeSentiment();
            }}
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

      {/* Sentiment Summary */}
      {summary && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Overall Sentiment</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-green-600 dark:text-green-400">Positive</span>
                <ThumbsUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {summary.overall.positive}%
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                {Math.round(summary.overall.positive * summary.overall.totalReviews / 100)} reviews
              </p>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-red-600 dark:text-red-400">Negative</span>
                <ThumbsDown className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                {summary.overall.negative}%
              </p>
              <p className="text-xs text-red-700 dark:text-red-300">
                {Math.round(summary.overall.negative * summary.overall.totalReviews / 100)} reviews
              </p>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-yellow-600 dark:text-yellow-400">Neutral</span>
                <Meh className="w-4 h-4 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                {summary.overall.neutral}%
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                {Math.round(summary.overall.neutral * summary.overall.totalReviews / 100)} reviews
              </p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-600 dark:text-blue-400">Avg Rating</span>
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
              </div>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {summary.overall.averageRating}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {summary.overall.totalReviews} total reviews
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sentiment Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Sentiment Alerts
          </h4>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${getAlertColor(alert.severity)}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-white dark:bg-gray-800`}>
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {alert.title}
                      </h5>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {alert.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {alert.timestamp.toLocaleString()}
                      </span>
                      {alert.actionable && (
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">
                          Actionable
                        </span>
                      )}
                    </div>
                    {alert.suggestedAction && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Suggested Action:
                        </p>
                        <p className="text-xs font-medium text-gray-900 dark:text-white">
                          {alert.suggestedAction}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg w-fit">
          {(['all', 'positive', 'negative', 'neutral'] as const).map((sentiment) => (
            <button
              key={sentiment}
              onClick={() => setSelectedSentiment(sentiment)}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                selectedSentiment === sentiment
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                {getSentimentIcon(sentiment)}
                <span className="capitalize">{sentiment}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getSentimentColor(review.sentiment)}`}>
                  {getSentimentIcon(review.sentiment)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {review.reviewer}
                    </span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {review.timestamp.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(review.sentiment)}`}>
                  {review.confidence}% confidence
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {review.helpful} helpful
                </span>
              </div>
            </div>
            
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              {review.text}
            </p>
            
            {/* Aspects */}
            <div className="flex flex-wrap gap-2 mb-3">
              {review.aspects.map((aspect, i) => (
                <span
                  key={i}
                  className={`px-2 py-1 rounded text-xs ${
                    aspect.sentiment === 'positive' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    aspect.sentiment === 'negative' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                  }`}
                >
                  {aspect.aspect}: {aspect.sentiment}
                </span>
              ))}
            </div>
            
            {/* Keywords */}
            <div className="flex flex-wrap gap-1">
              {review.keywords.map((keyword, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs"
                >
                  #{keyword}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Key Insights */}
      {summary && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Key Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Top Aspects</h5>
              <div className="space-y-2">
                {summary.aspects.slice(0, 3).map((aspect, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {aspect.aspect}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        aspect.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                        aspect.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {aspect.sentiment}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {aspect.frequency} mentions
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Top Keywords</h5>
              <div className="flex flex-wrap gap-2">
                {summary.keywords.slice(0, 5).map((keyword, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      keyword.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                      keyword.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {keyword.word} ({keyword.frequency})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISentimentAnalysis;
