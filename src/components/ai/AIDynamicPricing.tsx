import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Zap, Brain, Activity, DollarSign, Clock, Users, Target, AlertTriangle, CheckCircle, Settings, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface PricingFactor {
  name: string;
  weight: number;
  currentValue: number;
  trend: 'up' | 'down' | 'stable';
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

interface PricingRecommendation {
  action: 'increase' | 'decrease' | 'maintain' | 'dynamic';
  suggestedPrice: number;
  confidence: number;
  expectedImpact: {
    revenue: number;
    demand: number;
    competition: number;
  };
  reasoning: string;
  urgency: 'low' | 'medium' | 'high';
  timeToImplement: string;
}

interface MarketCondition {
  demand: 'high' | 'medium' | 'low';
  competition: 'intense' | 'moderate' | 'low';
  seasonality: 'peak' | 'normal' | 'off-peak';
  priceElasticity: number;
  marketSaturation: number;
}

interface PricingStrategy {
  name: string;
  description: string;
  aggressiveness: 'conservative' | 'moderate' | 'aggressive';
  riskLevel: 'low' | 'medium' | 'high';
  expectedROI: number;
  conditions: string[];
}

const AIDynamicPricing: React.FC<{
  productId?: string;
  currentPrice?: number;
  category?: string;
  onPriceUpdate?: (newPrice: number) => void;
}> = ({ productId = 'demo-product', currentPrice = 100000, category = 'Electronics', onPriceUpdate }) => {
  const [factors, setFactors] = useState<PricingFactor[]>([]);
  const [recommendation, setRecommendation] = useState<PricingRecommendation | null>(null);
  const [marketCondition, setMarketCondition] = useState<MarketCondition | null>(null);
  const [strategies, setStrategies] = useState<PricingStrategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('moderate');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoPricing, setAutoPricing] = useState(false);
  const [priceHistory, setPriceHistory] = useState<Array<{ date: string; price: number; event: string }>>([]);

  useEffect(() => {
    analyzePricing();
    loadPricingStrategies();
  }, [productId, currentPrice, category]);

  const analyzePricing = async () => {
    try {
      setIsAnalyzing(true);
      
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockFactors = generateMockFactors();
      const mockRecommendation = generateMockRecommendation();
      const mockMarketCondition = generateMockMarketCondition();
      
      setFactors(mockFactors);
      setRecommendation(mockRecommendation);
      setMarketCondition(mockMarketCondition);
      
    } catch (error) {
      console.error('Error analyzing pricing:', error);
      toast.error('Failed to analyze pricing data');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateMockFactors = (): PricingFactor[] => [
    {
      name: 'Market Demand',
      weight: 0.30,
      currentValue: 85,
      trend: 'up',
      impact: 'positive',
      description: 'High demand in this category (+15% from last week)',
    },
    {
      name: 'Competitor Pricing',
      weight: 0.25,
      currentValue: 72,
      trend: 'stable',
      impact: 'neutral',
      description: 'Competitors pricing similar to current levels',
    },
    {
      name: 'Seasonal Trends',
      weight: 0.20,
      currentValue: 90,
      trend: 'up',
      impact: 'positive',
      description: 'Peak season for this product type (+20% demand)',
    },
    {
      name: 'User Engagement',
      weight: 0.15,
      currentValue: 78,
      trend: 'up',
      impact: 'positive',
      description: 'Increasing user interest and page views',
    },
    {
      name: 'Inventory Levels',
      weight: 0.10,
      currentValue: 45,
      trend: 'down',
      impact: 'negative',
      description: 'Low stock levels creating urgency',
    },
  ];

  const generateMockRecommendation = (): PricingRecommendation => ({
    action: 'increase',
    suggestedPrice: Math.round(currentPrice * 1.12),
    confidence: 87,
    expectedImpact: {
      revenue: 15.2,
      demand: -5.8,
      competition: 8.3,
    },
    reasoning: 'Market demand is high and seasonal trends indicate optimal pricing window. Competitor analysis shows room for premium pricing.',
    urgency: 'high',
    timeToImplement: 'Immediate',
  });

  const generateMockMarketCondition = (): MarketCondition => ({
    demand: 'high',
    competition: 'moderate',
    seasonality: 'peak',
    priceElasticity: 0.8,
    marketSaturation: 0.65,
  });

  const loadPricingStrategies = () => {
    const strategies: PricingStrategy[] = [
      {
        name: 'conservative',
        description: 'Safe pricing with minimal risk',
        aggressiveness: 'conservative',
        riskLevel: 'low',
        expectedROI: 8.5,
        conditions: ['Stable market', 'Low competition', 'Price-sensitive customers'],
      },
      {
        name: 'moderate',
        description: 'Balanced approach for optimal returns',
        aggressiveness: 'moderate',
        riskLevel: 'medium',
        expectedROI: 15.2,
        conditions: ['Moderate competition', 'Growing demand', 'Flexible pricing'],
      },
      {
        name: 'aggressive',
        description: 'Maximum profit with higher risk',
        aggressiveness: 'aggressive',
        riskLevel: 'high',
        expectedROI: 25.8,
        conditions: ['High demand', 'Low competition', 'Premium positioning'],
      },
    ];
    setStrategies(strategies);
  };

  const handleStrategyChange = (strategy: string) => {
    setSelectedStrategy(strategy);
    // Re-analyze with new strategy
    analyzePricing();
  };

  const implementRecommendation = () => {
    if (!recommendation) return;
    
    onPriceUpdate?.(recommendation.suggestedPrice);
    
    // Add to price history
    const newEntry = {
      date: new Date().toISOString(),
      price: recommendation.suggestedPrice,
      event: `AI ${recommendation.action} recommendation applied`
    };
    setPriceHistory(prev => [...prev, newEntry]);
    
    toast.success(`Price updated to ₹${recommendation.suggestedPrice.toLocaleString()}`);
  };

  const toggleAutoPricing = () => {
    setAutoPricing(!autoPricing);
    if (!autoPricing) {
      toast.success('Auto-pricing enabled - AI will adjust prices automatically');
    } else {
      toast('Auto-pricing disabled');
    }
  };

  const getFactorColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'increase': return 'text-green-600 bg-green-100 border-green-200';
      case 'decrease': return 'text-red-600 bg-red-100 border-red-200';
      case 'maintain': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-purple-600 bg-purple-100 border-purple-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  if (isAnalyzing) {
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
          <div className="p-2 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Dynamic Pricing Engine
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Intelligent pricing optimization based on market analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleAutoPricing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              autoPricing 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <Zap className="w-4 h-4" />
            {autoPricing ? 'Auto-Pricing ON' : 'Auto-Pricing OFF'}
          </button>
          <button
            onClick={analyzePricing}
            disabled={isAnalyzing}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Current Recommendation */}
      {recommendation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg border ${getActionColor(recommendation.action)}`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${
              recommendation.action === 'increase' ? 'bg-green-600 text-white' :
              recommendation.action === 'decrease' ? 'bg-red-600 text-white' :
              recommendation.action === 'maintain' ? 'bg-blue-600 text-white' :
              'bg-purple-600 text-white'
            }`}>
              {recommendation.action === 'increase' ? <TrendingUp className="w-4 h-4" /> :
               recommendation.action === 'decrease' ? <TrendingDown className="w-4 h-4" /> :
               recommendation.action === 'maintain' ? <Activity className="w-4 h-4" /> :
               <Zap className="w-4 h-4" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                  {recommendation.action} Price to ₹{recommendation.suggestedPrice.toLocaleString()}
                </h4>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(recommendation.urgency)}`}>
                    {recommendation.urgency} urgency
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {recommendation.confidence}% confidence
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                {recommendation.reasoning}
              </p>
              <div className="grid grid-cols-3 gap-4 text-xs mb-3">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Revenue Impact</span>
                  <span className={`font-medium ${
                    recommendation.expectedImpact.revenue > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {recommendation.expectedImpact.revenue > 0 ? '+' : ''}{recommendation.expectedImpact.revenue}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Demand Impact</span>
                  <span className={`font-medium ${
                    recommendation.expectedImpact.demand > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {recommendation.expectedImpact.demand > 0 ? '+' : ''}{recommendation.expectedImpact.demand}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Time to Act</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {recommendation.timeToImplement}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={implementRecommendation}
                  className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  Implement Recommendation
                </button>
                <button
                  onClick={analyzePricing}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  Re-analyze
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pricing Factors */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Pricing Factors Analysis
        </h4>
        <div className="space-y-3">
          {factors.map((factor, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getFactorColor(factor.impact)}`}>
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
              <div className="flex items-center gap-3 text-right">
                <div className="flex items-center gap-1">
                  {getTrendIcon(factor.trend)}
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {factor.currentValue}%
                  </span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Weight: {(factor.weight * 100).toFixed(0)}%
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Market Conditions */}
      {marketCondition && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Market Conditions
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Demand</p>
              <p className="text-sm font-medium capitalize text-gray-900 dark:text-white">
                {marketCondition.demand}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Competition</p>
              <p className="text-sm font-medium capitalize text-gray-900 dark:text-white">
                {marketCondition.competition}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Seasonality</p>
              <p className="text-sm font-medium capitalize text-gray-900 dark:text-white">
                {marketCondition.seasonality}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Price Elasticity</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {marketCondition.priceElasticity}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Market Saturation</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {(marketCondition.marketSaturation * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Strategy */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Pricing Strategy
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {strategies.map((strategy) => (
            <motion.div
              key={strategy.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedStrategy === strategy.name
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => handleStrategyChange(strategy.name)}
            >
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900 dark:text-white capitalize">
                  {strategy.name}
                </h5>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  strategy.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                  strategy.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {strategy.riskLevel} risk
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                {strategy.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Expected ROI</span>
                <span className="text-sm font-medium text-green-600">
                  {strategy.expectedROI}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Price History */}
      {priceHistory.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Price History
          </h4>
          <div className="space-y-2">
            {priceHistory.slice(-5).map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ₹{entry.price.toLocaleString()}
                  </span>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {entry.event}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIDynamicPricing;
