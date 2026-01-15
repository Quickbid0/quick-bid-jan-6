import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, TrendingUp, Clock, Star, ArrowRight, X, RefreshCw, Heart, Eye, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface WidgetRecommendation {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  confidence: number;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
  timeLeft?: string;
  bidCount?: number;
  rating?: number;
}

interface WidgetConfig {
  type: 'carousel' | 'grid' | 'list' | 'sidebar';
  maxItems: number;
  showReasoning: boolean;
  showUrgency: boolean;
  autoRefresh: boolean;
  refreshInterval?: number;
}

interface AIRecommendationWidgetsProps {
  userId?: string;
  category?: string;
  widgetType?: 'personal' | 'trending' | 'ending-soon' | 'similar' | 'new-arrivals';
  config?: Partial<WidgetConfig>;
  className?: string;
  onProductClick?: (productId: string) => void;
}

const AIRecommendationWidgets: React.FC<AIRecommendationWidgetsProps> = ({
  userId,
  category,
  widgetType = 'personal',
  config = {},
  className = '',
  onProductClick
}) => {
  const [recommendations, setRecommendations] = useState<WidgetRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const defaultConfig: WidgetConfig = {
    type: 'carousel',
    maxItems: 5,
    showReasoning: true,
    showUrgency: true,
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
  };

  const widgetConfig = { ...defaultConfig, ...config };

  useEffect(() => {
    fetchRecommendations();
    
    if (widgetConfig.autoRefresh && widgetConfig.refreshInterval) {
      const interval = setInterval(fetchRecommendations, widgetConfig.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [userId, category, widgetType]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      
      // Simulate AI recommendation API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockRecommendations = generateMockRecommendations();
      setRecommendations(mockRecommendations);
      
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const generateMockRecommendations = (): WidgetRecommendation[] => {
    const baseRecommendations = [
      {
        id: '1',
        title: 'Premium Wireless Headphones',
        description: 'Noise-cancelling headphones with superior sound quality',
        price: 12500,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        category: 'Electronics',
        confidence: 94,
        reason: 'Based on your recent audio purchases',
        urgency: 'medium' as const,
        timeLeft: '2h 15m',
        bidCount: 12,
        rating: 4.5,
      },
      {
        id: '2',
        title: 'Vintage Leather Watch',
        description: 'Classic timepiece with genuine leather strap',
        price: 35000,
        image: 'https://images.unsplash.com/photo-1523275335684-37898d6bdaf7?w=400',
        category: 'Jewelry',
        confidence: 89,
        reason: 'Matches your interest in luxury accessories',
        urgency: 'high' as const,
        timeLeft: '45m',
        bidCount: 8,
        rating: 4.7,
      },
      {
        id: '3',
        title: 'Smart Home Security Camera',
        description: '4K resolution with night vision and motion detection',
        price: 8500,
        image: 'https://images.unsplash.com/photo-1558618047-3c8c5ca472c1?w=400',
        category: 'Electronics',
        confidence: 87,
        reason: 'Popular in your area and similar to your preferences',
        urgency: 'low' as const,
        timeLeft: '1d 3h',
        bidCount: 5,
        rating: 4.3,
      },
      {
        id: '4',
        title: 'Organic Cotton T-Shirt',
        description: 'Sustainable fashion with comfortable fit',
        price: 1200,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9a17ab6?w=400',
        category: 'Fashion',
        confidence: 82,
        reason: 'Eco-friendly products trending in your network',
        urgency: 'low' as const,
        timeLeft: '3d 12h',
        bidCount: 3,
        rating: 4.1,
      },
      {
        id: '5',
        title: 'Professional Camera Lens',
        description: 'High-quality lens for professional photography',
        price: 45000,
        image: 'https://images.unsplash.com/photo-1519904981063-b0c4dd652f78?w=400',
        category: 'Electronics',
        confidence: 91,
        reason: 'Complements your existing camera equipment',
        urgency: 'medium' as const,
        timeLeft: '5h 30m',
        bidCount: 15,
        rating: 4.6,
      },
    ];

    // Filter and sort based on widget type
    let filtered = baseRecommendations;
    
    if (category) {
      filtered = filtered.filter(r => r.category === category);
    }
    
    switch (widgetType) {
      case 'trending':
        return filtered.sort((a, b) => b.bidCount - a.bidCount).slice(0, widgetConfig.maxItems);
      case 'ending-soon':
        return filtered.sort((a, b) => {
          const timeA = parseInt(a.timeLeft?.split('h')[0] || '999');
          const timeB = parseInt(b.timeLeft?.split('h')[0] || '999');
          return timeA - timeB;
        }).slice(0, widgetConfig.maxItems);
      case 'new-arrivals':
        return filtered.slice(0, widgetConfig.maxItems);
      case 'similar':
        return filtered.slice(0, widgetConfig.maxItems);
      default:
        return filtered.slice(0, widgetConfig.maxItems);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRecommendations();
    setRefreshing(false);
    toast.success('Recommendations refreshed');
  };

  const handleDismiss = (id: string) => {
    setDismissed(prev => new Set(prev).add(id));
    toast.success('Recommendation dismissed');
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 80) return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  };

  const visibleRecommendations = recommendations.filter(r => !dismissed.has(r.id));

  const renderCarousel = () => (
    <div className="relative">
      <div className="overflow-hidden">
        <div className="flex gap-4 transition-transform duration-300 ease-in-out">
          {visibleRecommendations.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-32 object-cover rounded-t-lg"
                />
                <button
                  onClick={() => handleDismiss(item.id)}
                  className="absolute top-2 right-2 p-1 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                </button>
                {widgetConfig.showUrgency && (
                  <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(item.urgency)}`}>
                    {item.urgency}
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-1 truncate">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                  {item.description}
                </p>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ₹{item.price.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {item.rating}
                    </span>
                  </div>
                </div>
                
                {widgetConfig.showReasoning && (
                  <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                    <p className="text-blue-800 dark:text-blue-200">
                      {item.reason}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {item.bidCount} bids
                    </span>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {item.timeLeft}
                  </span>
                </div>
                
                <Link
                  to={`/product/${item.id}`}
                  onClick={() => onProductClick?.(item.id)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors text-center text-sm font-medium flex items-center justify-center gap-1"
                >
                  View Details
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {visibleRecommendations.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
        >
          <div className="relative">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-40 object-cover rounded-t-lg"
            />
            <button
              onClick={() => handleDismiss(item.id)}
              className="absolute top-2 right-2 p-1 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            </button>
            {widgetConfig.showUrgency && (
              <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(item.urgency)}`}>
                {item.urgency}
              </div>
            )}
          </div>
          
          <div className="p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
              {item.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {item.description}
            </p>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                ₹{item.price.toLocaleString()}
              </span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.rating}
                </span>
              </div>
            </div>
            
            {widgetConfig.showReasoning && (
              <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                <p className="text-blue-800 dark:text-blue-200">
                  {item.reason}
                </p>
              </div>
            )}
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.bidCount} bids
                </span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {item.timeLeft}
              </span>
            </div>
            
            <Link
              to={`/product/${item.id}`}
              onClick={() => onProductClick?.(item.id)}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors text-center text-sm font-medium flex items-center justify-center gap-1"
            >
              View Details
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderSidebar = () => (
    <div className="space-y-4">
      {visibleRecommendations.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="flex gap-3 p-3">
            <img
              src={item.image}
              alt={item.title}
              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                  {item.title}
                </h4>
                <button
                  onClick={() => handleDismiss(item.id)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  ₹{item.price.toLocaleString()}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {item.rating}
                  </span>
                </div>
              </div>
              
              {widgetConfig.showReasoning && (
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs mb-2">
                  <p className="text-blue-800 dark:text-blue-200 line-clamp-2">
                    {item.reason}
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>{item.bidCount} bids</span>
                <span>{item.timeLeft}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderList = () => (
    <div className="space-y-3">
      {visibleRecommendations.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="flex gap-4 p-4">
            <img
              src={item.image}
              alt={item.title}
              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {item.description}
                  </p>
                </div>
                <button
                  onClick={() => handleDismiss(item.id)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ₹{item.price.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.rating}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Eye className="w-3 h-3" />
                    <span>{item.bidCount} bids</span>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {item.timeLeft}
                  </span>
                </div>
                
                <Link
                  to={`/product/${item.id}`}
                  onClick={() => onProductClick?.(item.id)}
                  className="px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded hover:from-purple-700 hover:to-blue-700 transition-colors text-sm"
                >
                  View
                </Link>
              </div>
              
              {widgetConfig.showReasoning && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                  <p className="text-blue-800 dark:text-blue-200">
                    {item.reason}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse">
            <Brain className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
          </div>
        </div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
              {widgetType.replace('-', ' ')} Recommendations
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI-powered suggestions for you
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {widgetConfig.autoRefresh && (
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Auto-refresh</span>
            </div>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {visibleRecommendations.length > 0 ? (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {widgetConfig.type === 'carousel' && renderCarousel()}
            {widgetConfig.type === 'grid' && renderGrid()}
            {widgetConfig.type === 'sidebar' && renderSidebar()}
            {widgetConfig.type === 'list' && renderList()}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No recommendations available
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIRecommendationWidgets;
