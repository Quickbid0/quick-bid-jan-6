import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  TrendingUp, 
  Star, 
  Clock, 
  Eye, 
  Heart,
  Bookmark,
  Share2,
  Filter,
  ChevronRight,
  Zap,
  Target,
  Award,
  Gavel
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface Product {
  id: string;
  title: string;
  currentPrice: number;
  originalPrice?: number;
  imageUrl: string;
  category: string;
  endTime: string;
  bidCount: number;
  views: number;
  rating?: number;
  seller: {
    name: string;
    rating: number;
    verified: boolean;
  };
  tags: string[];
  matchScore?: number;
  recommendationReason?: string;
}

interface SmartRecommendationsProps {
  userId?: string;
  category?: string;
  maxItems?: number;
  showReasoning?: boolean;
}

const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  userId,
  category,
  maxItems = 6,
  showReasoning = true
}) => {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'trending' | 'ending-soon' | 'best-value'>('all');

  // Sample recommendation data with AI-powered insights
  const sampleRecommendations: Product[] = [
    {
      id: '1',
      title: 'iPhone 14 Pro Max - Excellent Condition',
      currentPrice: 45000,
      originalPrice: 65000,
      imageUrl: '/images/products/iphone-14-pro.jpg',
      category: 'electronics',
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      bidCount: 23,
      views: 342,
      rating: 4.8,
      seller: {
        name: 'TechStore Pro',
        rating: 4.9,
        verified: true
      },
      tags: ['smartphone', 'apple', 'premium'],
      matchScore: 95,
      recommendationReason: 'Based on your recent iPhone searches and budget preferences'
    },
    {
      id: '2',
      title: 'Vintage Rolex Submariner 1960',
      currentPrice: 850000,
      originalPrice: 1200000,
      imageUrl: '/images/products/rolex-submariner.jpg',
      category: 'watches',
      endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      bidCount: 45,
      views: 189,
      rating: 4.9,
      seller: {
        name: 'Luxury Timepieces',
        rating: 4.8,
        verified: true
      },
      tags: ['luxury', 'vintage', 'investment'],
      matchScore: 88,
      recommendationReason: 'High-value investment piece matching your watch collection'
    },
    {
      id: '3',
      title: 'MacBook Pro 16" M1 Max - Like New',
      currentPrice: 120000,
      originalPrice: 180000,
      imageUrl: '/images/products/macbook-pro.jpg',
      category: 'electronics',
      endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      bidCount: 18,
      views: 256,
      rating: 4.7,
      seller: {
        name: 'Apple Certified',
        rating: 4.9,
        verified: true
      },
      tags: ['laptop', 'apple', 'professional'],
      matchScore: 82,
      recommendationReason: 'Professional laptop matching your work needs'
    },
    {
      id: '4',
      title: 'Sony A7R IV Camera Kit',
      currentPrice: 185000,
      originalPrice: 250000,
      imageUrl: '/images/products/sony-a7r4.jpg',
      category: 'electronics',
      endTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      bidCount: 12,
      views: 167,
      rating: 4.6,
      seller: {
        name: 'Pro Photo Gear',
        rating: 4.7,
        verified: true
      },
      tags: ['camera', 'photography', 'professional'],
      matchScore: 78,
      recommendationReason: 'Photography equipment based on your browsing history'
    },
    {
      id: '5',
      title: 'Antique Persian Rug - Handmade',
      currentPrice: 45000,
      originalPrice: 65000,
      imageUrl: '/images/products/persian-rug.jpg',
      category: 'furniture',
      endTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      bidCount: 8,
      views: 89,
      rating: 4.5,
      seller: {
        name: 'Heritage Homes',
        rating: 4.6,
        verified: true
      },
      tags: ['antique', 'handmade', 'luxury'],
      matchScore: 72,
      recommendationReason: 'Home decor matching your interior design interests'
    },
    {
      id: '6',
      title: 'Tesla Model 3 2022 - Low Miles',
      currentPrice: 2500000,
      originalPrice: 3200000,
      imageUrl: '/images/products/tesla-model3.jpg',
      category: 'vehicles',
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      bidCount: 34,
      views: 567,
      rating: 4.8,
      seller: {
        name: 'Auto Elite',
        rating: 4.8,
        verified: true
      },
      tags: ['electric', 'tesla', 'modern'],
      matchScore: 68,
      recommendationReason: 'Electric vehicle matching your eco-friendly preferences'
    }
  ];

  useEffect(() => {
    // Simulate AI recommendation engine
    const loadRecommendations = async () => {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let filtered = sampleRecommendations;
      
      // Apply category filter if specified
      if (category) {
        filtered = filtered.filter(p => p.category === category);
      }
      
      // Apply additional filters
      switch (filter) {
        case 'trending':
          filtered = filtered.filter(p => p.views > 200);
          break;
        case 'ending-soon':
          filtered = filtered.filter(p => {
            const endTime = new Date(p.endTime);
            const now = new Date();
            return (endTime.getTime() - now.getTime()) < 6 * 60 * 60 * 1000; // Less than 6 hours
          });
          break;
        case 'best-value':
          filtered = filtered.filter(p => p.originalPrice && p.currentPrice < p.originalPrice * 0.7);
          break;
      }
      
      // Sort by match score
      filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      
      setRecommendations(filtered.slice(0, maxItems));
      setLoading(false);
    };

    loadRecommendations();
  }, [category, filter, maxItems]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatTimeLeft = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff < 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  const handleSave = (productId: string) => {
    toast.success('Item saved to your collection');
  };

  const handleShare = (productId: string) => {
    toast.success('Link copied to clipboard');
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-40 bg-gray-200 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
            <p className="text-sm text-gray-600">Personalized picks for you</p>
          </div>
        </div>
        
        {/* Filter Options */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All</option>
            <option value="trending">Trending</option>
            <option value="ending-soon">Ending Soon</option>
            <option value="best-value">Best Value</option>
          </select>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            {/* Match Score Badge */}
            {showReasoning && product.matchScore && (
              <div className="absolute top-3 left-3 z-10">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchScoreColor(product.matchScore)}`}>
                  {product.matchScore}% Match
                </div>
              </div>
            )}

            {/* Product Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Quick Actions */}
              <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleSave(product.id)}
                  className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                >
                  <Bookmark className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleShare(product.id)}
                  className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                >
                  <Share2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Discount Badge */}
              {product.originalPrice && product.currentPrice < product.originalPrice && (
                <div className="absolute bottom-3 left-3">
                  <div className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-medium">
                    {Math.round((1 - product.currentPrice / product.originalPrice) * 100)}% OFF
                  </div>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4 space-y-3">
              {/* Title */}
              <div>
                <h4 className="font-medium text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {product.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  {product.seller.verified && (
                    <div className="flex items-center gap-1">
                      <Award className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-600">Verified</span>
                    </div>
                  )}
                  <span className="text-xs text-gray-500">{product.seller.name}</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(product.currentPrice)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Gavel className="w-3 h-3" />
                    <span>{product.bidCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{product.views}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeLeft(product.endTime)}</span>
                </div>
              </div>

              {/* Recommendation Reason */}
              {showReasoning && product.recommendationReason && (
                <div className="p-2 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Target className="w-3 h-3 text-blue-600 mt-0.5" />
                    <p className="text-xs text-blue-700">{product.recommendationReason}</p>
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {product.tags.slice(0, 3).map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <Link
                to={`/product/${product.id}`}
                className="flex items-center justify-center w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors group-hover:bg-indigo-700"
              >
                View Auction
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {recommendations.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
          <p className="text-gray-600">Start browsing to get personalized recommendations</p>
        </div>
      )}

      {/* AI Insights */}
      {recommendations.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-purple-900 mb-1">AI Insights</h4>
              <p className="text-sm text-purple-700">
                Our AI analyzed your browsing history, bid patterns, and preferences to curate these recommendations. 
                Items with higher match scores are more likely to interest you.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartRecommendations;
