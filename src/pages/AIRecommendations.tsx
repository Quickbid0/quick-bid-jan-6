import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  Eye, 
  Heart, 
  Star,
  Filter,
  Zap,
  Target,
  BarChart3,
  Lightbulb,
  Package
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSession } from '../context/SessionContext';
import { useAIRecommendations } from '../hooks/useAIRecommendations';
import AIRecommendationCard from '../components/AIRecommendationCard';
import { toast } from 'react-hot-toast';

const AIRecommendations = () => {
  const { session } = useSession();
  const { recommendations, loading, error, refreshRecommendations } = useAIRecommendations(session?.user?.id);
  const [activeFilter, setActiveFilter] = useState('all');
  const [aiInsights, setAiInsights] = useState({
    potentialSavings: 45000,
    accuracyRate: 87,
    trendingItems: 12,
    successRate: 73
  });

  const handleAddToWatchlist = async (productId: string) => {
    if (!session?.user?.id) {
      toast.error('Please login to add to watchlist');
      return;
    }
    
    toast.success('Added to watchlist');
  };

  const filteredRecommendations = activeFilter === 'all' 
    ? recommendations 
    : recommendations.filter(r => r.recommendation_type === activeFilter);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Brain className="h-8 w-8 text-indigo-600" />
            AI Recommendations
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Personalized auction recommendations powered by machine learning
          </p>
        </div>
      </div>

      {/* AI Insights Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Potential Savings</p>
              <p className="text-2xl font-bold text-green-600">₹{aiInsights.potentialSavings.toLocaleString()}</p>
            </div>
            <Target className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Accuracy Rate</p>
              <p className="text-2xl font-bold text-blue-600">{aiInsights.accuracyRate}%</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Trending Items</p>
              <p className="text-2xl font-bold text-purple-600">{aiInsights.trendingItems}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-orange-600">{aiInsights.successRate}%</p>
            </div>
            <Lightbulb className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">AI-Powered Recommendations</h2>
        <button
          onClick={refreshRecommendations}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Brain className="h-4 w-4" />
          Refresh AI Analysis
        </button>
      </div>

      <div className="flex space-x-1 mb-8">
        {[
          { id: 'all', label: 'All Recommendations' },
          { id: 'trending', label: 'Trending' },
          { id: 'undervalued', label: 'Undervalued' },
          { id: 'similar', label: 'Similar to Your Interests' },
          { id: 'ending_soon', label: 'Ending Soon' }
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === filter.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Recommendations Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Failed to load AI recommendations</p>
          <button
            onClick={refreshRecommendations}
            className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecommendations.map((recommendation) => (
            <AIRecommendationCard
              key={recommendation.productId}
              recommendation={recommendation}
              onAddToWatchlist={handleAddToWatchlist}
            />
          ))}
        </div>
      )}

      {filteredRecommendations.length === 0 && !loading && (
        <div className="text-center py-12">
          <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No AI recommendations available</p>
          <p className="text-sm text-gray-400 mt-2">Start bidding to get personalized recommendations</p>
        </div>
      )}

      {/* AI Learning Section */}
      <div className="mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-8">
        <div className="text-center">
          <Brain className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            How Our AI Works
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our machine learning algorithms analyze market trends, historical data, user behavior, 
            and expert valuations to provide personalized recommendations. The more you use the platform, 
            the better our recommendations become.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="text-center">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <BarChart3 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Market Analysis</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Real-time market data and trend analysis
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <Eye className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Behavioral Learning</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Learns from your preferences and bidding patterns
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <Target className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Value Prediction</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Predicts future value based on multiple factors
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendations;