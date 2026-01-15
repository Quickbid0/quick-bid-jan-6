import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Brain, Activity, Target, DollarSign, Clock, BarChart3, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface PricePrediction {
  currentPrice: number;
  predictedPrice: number;
  confidence: number;
  timeToAuctionEnd: string;
  priceRange: {
    min: number;
    max: number;
  };
  factors: {
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
    description: string;
  }[];
  trend: 'rising' | 'falling' | 'stable';
  recommendation: 'bid_now' | 'wait' | 'monitor';
}

interface MarketData {
  category: string;
  avgPrice: number;
  priceChange: number;
  volume: number;
  competition: 'low' | 'medium' | 'high';
}

const AIPricePrediction: React.FC<{ productId: string }> = ({ productId }) => {
  const [prediction, setPrediction] = useState<PricePrediction | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPricePrediction();
    fetchMarketData();
  }, [productId]);

  const fetchPricePrediction = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/ai/price-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          includeHistoricalData: true,
          includeMarketFactors: true,
          predictionHorizon: 'auction_end',
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch price prediction');
      
      const data = await response.json();
      setPrediction(data.prediction);
    } catch (error) {
      console.error('Error fetching price prediction:', error);
      setError('Unable to fetch AI price prediction');
      // Use mock data for demo
      setPrediction(getMockPrediction());
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketData = async () => {
    try {
      const response = await fetch('/api/ai/market-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          timeframe: '30d',
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch market data');
      
      const data = await response.json();
      setMarketData(data.marketData);
    } catch (error) {
      console.error('Error fetching market data:', error);
      // Use mock data for demo
      setMarketData(getMockMarketData());
    }
  };

  const getMockPrediction = (): PricePrediction => ({
    currentPrice: 250000,
    predictedPrice: 285000,
    confidence: 87,
    timeToAuctionEnd: '2h 15m',
    priceRange: {
      min: 260000,
      max: 310000,
    },
    factors: [
      {
        name: 'Market Demand',
        impact: 'positive',
        weight: 0.35,
        description: 'High demand in this category (+15%)',
      },
      {
        name: 'Seasonal Trends',
        impact: 'positive',
        weight: 0.25,
        description: 'Peak season for this item type (+12%)',
      },
      {
        name: 'Competition',
        impact: 'negative',
        weight: 0.20,
        description: 'High bidder activity (-8%)',
      },
      {
        name: 'Item Condition',
        impact: 'positive',
        weight: 0.20,
        description: 'Excellent condition (+10%)',
      },
    ],
    trend: 'rising',
    recommendation: 'bid_now',
  });

  const getMockMarketData = (): MarketData => ({
    category: 'Vehicles',
    avgPrice: 275000,
    priceChange: 8.5,
    volume: 156,
    competition: 'high',
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'falling': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'bid_now': return 'bg-green-100 text-green-800 border-green-200';
      case 'wait': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const priceChange = prediction ? 
    ((prediction.predictedPrice - prediction.currentPrice) / prediction.currentPrice * 100) : 0;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
          <Brain className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!prediction) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Price Prediction
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Machine learning powered forecast
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Confidence:</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {prediction.confidence}%
          </span>
        </div>
      </div>

      {/* Price Prediction */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Current Price</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{prediction.currentPrice.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Predicted Price</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{prediction.predictedPrice.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            {getTrendIcon(prediction.trend)}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {priceChange > 0 ? '+' : ''}{priceChange.toFixed(1)}%
            </span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {prediction.trend === 'rising' ? 'Rising' : prediction.trend === 'falling' ? 'Falling' : 'Stable'}
          </p>
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Expected Price Range
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            ₹{prediction.priceRange.min.toLocaleString()} - ₹{prediction.priceRange.max.toLocaleString()}
          </span>
        </div>
        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            style={{
              left: `${((prediction.currentPrice - prediction.priceRange.min) / (prediction.priceRange.max - prediction.priceRange.min)) * 100}%`,
              width: `${((prediction.predictedPrice - prediction.currentPrice) / (prediction.priceRange.max - prediction.priceRange.min)) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Influencing Factors */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Influencing Factors
        </h4>
        <div className="space-y-2">
          {prediction.factors.map((factor, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(factor.impact)}`}>
                  {factor.impact}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {factor.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {factor.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600 dark:text-gray-400">Weight</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {(factor.weight * 100).toFixed(0)}%
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div className={`p-4 rounded-lg border ${getRecommendationColor(prediction.recommendation)}`}>
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5" />
          <div>
            <p className="font-semibold">
              {prediction.recommendation === 'bid_now' ? 'Bid Now' : 
               prediction.recommendation === 'wait' ? 'Wait for Better Price' : 
               'Monitor Auction'}
            </p>
            <p className="text-sm opacity-80">
              {prediction.recommendation === 'bid_now' 
                ? 'AI suggests placing a bid soon as prices are likely to rise'
                : prediction.recommendation === 'wait'
                ? 'AI predicts prices may drop, consider waiting'
                : 'Market conditions are uncertain, monitor closely'}
            </p>
          </div>
        </div>
      </div>

      {/* Market Context */}
      {marketData && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Market Context
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Category</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{marketData.category}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Avg Price</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                ₹{marketData.avgPrice.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">30d Change</p>
              <p className={`text-sm font-medium ${marketData.priceChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {marketData.priceChange > 0 ? '+' : ''}{marketData.priceChange}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Competition</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                {marketData.competition}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPricePrediction;
