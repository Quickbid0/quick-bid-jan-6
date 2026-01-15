import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Sparkles, Clock, Star, ArrowRight, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useSession } from '../../context/SessionContext';
import { Link } from 'react-router-dom';

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  image: string;
  confidence: number;
  reason: string;
  trending: boolean;
  timeSensitive: boolean;
  matchScore: number;
}

interface AIInsight {
  type: 'trending' | 'price_drop' | 'new_listing' | 'ending_soon';
  title: string;
  description: string;
  products: string[];
}

const AIRecommendations: React.FC = () => {
  const { user } = useSession();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'personalized' | 'trending' | 'insights'>('personalized');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRecommendations();
    fetchInsights();
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          userPreferences: {
            categories: getUserCategories(),
            priceRange: getUserPriceRange(),
            recentViews: getRecentViews(),
            biddingHistory: getBiddingHistory(),
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch recommendations');
      
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
      // Fallback to mock data
      setRecommendations(getMockRecommendations());
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/ai/market-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeframe: '7d',
          categories: getUserCategories(),
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch insights');
      
      const data = await response.json();
      setInsights(data.insights || []);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      // Fallback to mock data
      setInsights(getMockInsights());
    }
  };

  const refreshRecommendations = async () => {
    setRefreshing(true);
    await fetchRecommendations();
    setRefreshing(false);
    toast.success('AI recommendations refreshed!');
  };

  const getUserCategories = (): string[] => {
    // Extract from user behavior or preferences
    return ['Vehicles', 'Electronics', 'Jewelry'];
  };

  const getUserPriceRange = () => {
    return { min: 10000, max: 500000 };
  };

  const getRecentViews = (): string[] => {
    // Get recently viewed product IDs
    return [];
  };

  const getBiddingHistory = (): any[] => {
    // Get user's bidding history
    return [];
  };

  const getMockRecommendations = (): AIRecommendation[] => [
    {
      id: '1',
      title: '2021 Mercedes-Benz C-Class',
      description: 'Luxury sedan with low mileage, perfect condition',
      category: 'Vehicles',
      price: 2800000,
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400',
      confidence: 92,
      reason: 'Based on your interest in premium vehicles',
      trending: true,
      timeSensitive: false,
      matchScore: 95,
    },
    {
      id: '2',
      title: 'Vintage Rolex Submariner',
      description: '1960s classic timepiece, collector\'s item',
      category: 'Jewelry & Watches',
      price: 450000,
      image: 'https://images.unsplash.com/photo-1547996160-9e6e7288a9f3?w=400',
      confidence: 88,
      reason: 'Matches your luxury watch preferences',
      trending: false,
      timeSensitive: true,
      matchScore: 89,
    },
    {
      id: '3',
      title: 'MacBook Pro M1 2020',
      description: 'High-performance laptop for professionals',
      category: 'Electronics',
      price: 85000,
      image: 'https://images.unsplash.com/photo-1517336712830-c9662b7e77b1?w=400',
      confidence: 85,
      reason: 'Popular in your preferred electronics category',
      trending: true,
      timeSensitive: false,
      matchScore: 87,
    },
  ];

  const getMockInsights = (): AIInsight[] => [
    {
      type: 'trending',
      title: 'Vintage Watches Surge',
      description: '40% increase in vintage watch auctions this week',
      products: ['Rolex Submariner', 'Omega Seamaster'],
    },
    {
      type: 'price_drop',
      title: 'Electronics Price Drop',
      description: 'Average prices down 15% for laptops',
      products: ['MacBook Pro', 'Dell XPS'],
    },
    {
      type: 'ending_soon',
      title: 'High-Value Auctions Ending',
      description: '3 premium vehicles ending in next 24 hours',
      products: ['BMW 5 Series', 'Mercedes C-Class'],
    },
  ];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trending': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'price_drop': return <ArrowRight className="w-4 h-4 text-blue-500 rotate-90" />;
      case 'new_listing': return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'ending_soon': return <Clock className="w-4 h-4 text-red-500" />;
      default: return <Brain className="w-4 h-4 text-gray-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 80) return 'text-blue-600 bg-blue-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI Recommendations
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Personalized insights powered by machine learning
            </p>
          </div>
        </div>
        <button
          onClick={refreshRecommendations}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
        {(['personalized', 'trending', 'insights'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
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
      <AnimatePresence mode="wait">
        {activeTab === 'personalized' && (
          <motion.div
            key="personalized"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ))
            ) : (
              recommendations.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      {item.trending && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Trending
                        </span>
                      )}
                      {item.timeSensitive && (
                        <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Ending Soon
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(item.confidence)}`}>
                        {item.confidence}% Match
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        {item.category}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₹{item.price.toLocaleString()}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {item.matchScore}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          {item.reason}
                        </p>
                      </div>
                    </div>
                    
                    <Link
                      to={`/product/${item.id}`}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all text-center block"
                    >
                      View Details
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'trending' && (
          <motion.div
            key="trending"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Trending Now
            </h2>
            <div className="space-y-4">
              {recommendations.filter(r => r.trending).map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <img src={item.image} alt={item.title} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">₹{item.price.toLocaleString()}</p>
                    <p className="text-xs text-green-600">+12% this week</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {insight.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {insight.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {insight.products.map((product, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-sm rounded-full"
                    >
                      {product}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIRecommendations;
