import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, TrendingUp, Target, Clock, Heart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface AIRecommendationCardProps {
  recommendation: {
    productId: string;
    title: string;
    description: string;
    image_url: string;
    current_price: number;
    predicted_value: number;
    confidence_score: number;
    recommendation_type: 'trending' | 'undervalued' | 'similar' | 'ending_soon';
    reasons: string[];
  };
  onAddToWatchlist?: (productId: string) => void;
}

const AIRecommendationCard: React.FC<AIRecommendationCardProps> = ({ 
  recommendation, 
  onAddToWatchlist 
}) => {
  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'trending':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'undervalued':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'similar':
        return <Heart className="h-4 w-4 text-purple-500" />;
      case 'ending_soon':
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <Brain className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'trending':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'undervalued':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'similar':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ending_soon':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const potentialGain = recommendation.predicted_value - recommendation.current_price;
  const gainPercentage = ((potentialGain / recommendation.current_price) * 100).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative">
        <img
          src={recommendation.image_url}
          alt={recommendation.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getRecommendationColor(recommendation.recommendation_type)}`}>
            {getRecommendationIcon(recommendation.recommendation_type)}
            {recommendation.recommendation_type.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center">
          <Brain className="h-3 w-3 mr-1" />
          {recommendation.confidence_score}% AI Match
        </div>
        {potentialGain > 0 && (
          <div className="absolute bottom-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
            +{gainPercentage}% Potential
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {recommendation.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {recommendation.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-500">Current Price</p>
            <p className="font-semibold text-lg">₹{recommendation.current_price.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">AI Predicted</p>
            <p className="font-semibold text-green-600">₹{recommendation.predicted_value.toLocaleString()}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">AI Insights:</p>
          <div className="space-y-1">
            {recommendation.reasons.slice(0, 2).map((reason, index) => (
              <p key={index} className="text-xs text-gray-600 dark:text-gray-300 flex items-center">
                <div className="w-1 h-1 bg-indigo-500 rounded-full mr-2"></div>
                {reason}
              </p>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            to={`/product/${recommendation.productId}`}
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg text-center text-sm hover:bg-indigo-700"
          >
            View Details
          </Link>
          {onAddToWatchlist && (
            <button
              onClick={() => onAddToWatchlist(recommendation.productId)}
              className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm hover:bg-gray-200"
            >
              <Heart className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AIRecommendationCard;