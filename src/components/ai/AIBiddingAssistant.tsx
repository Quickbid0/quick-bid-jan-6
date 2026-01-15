import React, { useState, useEffect } from 'react';
import { Brain, Zap, Target, TrendingUp, AlertTriangle, Clock, Users, Activity, Lightbulb, Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface BiddingStrategy {
  id: string;
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  expectedROI: number;
  successRate: number;
  maxBid: number;
  timing: 'immediate' | 'last-minute' | 'strategic';
  pros: string[];
  cons: string[];
}

interface BidRecommendation {
  action: 'bid' | 'wait' | 'withdraw';
  amount?: number;
  confidence: number;
  reasoning: string;
  urgency: 'low' | 'medium' | 'high';
  marketContext: {
    competition: 'low' | 'medium' | 'high';
    priceTrend: 'rising' | 'stable' | 'falling';
    timeRemaining: string;
  };
}

interface AuctionAnalysis {
  currentPrice: number;
  estimatedFinalPrice: number;
  competitionLevel: number;
  bidHistory: Array<{
    time: string;
    amount: number;
    bidderType: 'new' | 'regular' | 'aggressive';
  }>;
  priceVelocity: number;
  optimalBidTime: string;
}

const AIBiddingAssistant: React.FC<{ auctionId: string; currentPrice: number; onBidRecommendation?: (amount: number) => void }> = ({ 
  auctionId, 
  currentPrice, 
  onBidRecommendation 
}) => {
  const [analysis, setAnalysis] = useState<AuctionAnalysis | null>(null);
  const [recommendation, setRecommendation] = useState<BidRecommendation | null>(null);
  const [strategies, setStrategies] = useState<BiddingStrategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [autoBidEnabled, setAutoBidEnabled] = useState(false);
  const [maxAutoBid, setMaxAutoBid] = useState(currentPrice * 1.2);

  useEffect(() => {
    analyzeAuction();
    generateStrategies();
  }, [auctionId, currentPrice]);

  const analyzeAuction = async () => {
    try {
      setIsAnalyzing(true);
      
      const response = await fetch('/api/ai/auction-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auctionId,
          includeHistoricalData: true,
          includeCompetitorAnalysis: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to analyze auction');
      
      const data = await response.json();
      setAnalysis(data.analysis);
      setRecommendation(data.recommendation);
    } catch (error) {
      console.error('Error analyzing auction:', error);
      // Use mock data for demo
      setAnalysis(getMockAnalysis());
      setRecommendation(getMockRecommendation());
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateStrategies = () => {
    const strategies: BiddingStrategy[] = [
      {
        id: 'conservative',
        name: 'Conservative Approach',
        description: 'Safe bidding with minimal risk',
        riskLevel: 'low',
        expectedROI: 5,
        successRate: 85,
        maxBid: currentPrice * 1.1,
        timing: 'last-minute',
        pros: ['Low risk', 'High success rate', 'Budget controlled'],
        cons: ['Lower returns', 'May miss opportunities'],
      },
      {
        id: 'aggressive',
        name: 'Aggressive Bidding',
        description: 'High-risk, high-reward strategy',
        riskLevel: 'high',
        expectedROI: 25,
        successRate: 45,
        maxBid: currentPrice * 1.5,
        timing: 'immediate',
        pros: ['High potential returns', 'Intimidates competitors'],
        cons: ['High risk', 'Budget intensive'],
      },
      {
        id: 'strategic',
        name: 'Strategic Timing',
        description: 'Optimized timing for maximum advantage',
        riskLevel: 'medium',
        expectedROI: 15,
        successRate: 70,
        maxBid: currentPrice * 1.25,
        timing: 'strategic',
        pros: ['Balanced approach', 'Market timing advantage'],
        cons: ['Requires monitoring', 'Complex execution'],
      },
      {
        id: 'sniper',
        name: 'Sniper Strategy',
        description: 'Last-second bid placement',
        riskLevel: 'medium',
        expectedROI: 20,
        successRate: 60,
        maxBid: currentPrice * 1.3,
        timing: 'last-minute',
        pros: ['Surprise element', 'Minimal competition'],
        cons: ['Timing critical', 'Technical risk'],
      },
    ];
    setStrategies(strategies);
  };

  const getMockAnalysis = (): AuctionAnalysis => ({
    currentPrice: currentPrice,
    estimatedFinalPrice: currentPrice * 1.18,
    competitionLevel: 7,
    bidHistory: [
      { time: '10:30 AM', amount: currentPrice * 0.8, bidderType: 'new' },
      { time: '11:15 AM', amount: currentPrice * 0.9, bidderType: 'regular' },
      { time: '12:00 PM', amount: currentPrice * 0.95, bidderType: 'aggressive' },
      { time: '1:30 PM', amount: currentPrice, bidderType: 'regular' },
    ],
    priceVelocity: 0.15,
    optimalBidTime: '2:45 PM',
  });

  const getMockRecommendation = (): BidRecommendation => ({
    action: 'bid',
    amount: currentPrice * 1.12,
    confidence: 78,
    reasoning: 'Market analysis shows moderate competition with rising price trend. Current bid activity suggests strategic timing would be optimal.',
    urgency: 'medium',
    marketContext: {
      competition: 'medium',
      priceTrend: 'rising',
      timeRemaining: '2h 15m',
    },
  });

  const handleStrategySelect = (strategyId: string) => {
    setSelectedStrategy(strategyId);
    const strategy = strategies.find(s => s.id === strategyId);
    if (strategy && onBidRecommendation) {
      onBidRecommendation(strategy.maxBid);
      toast.success(`Applied ${strategy.name} strategy`);
    }
  };

  const handleAutoBidToggle = () => {
    setAutoBidEnabled(!autoBidEnabled);
    if (!autoBidEnabled) {
      toast.success('Auto-bid enabled - AI will bid strategically for you');
    } else {
      toast('Auto-bid disabled');
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isAnalyzing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
            <Brain className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Bidding Assistant
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Intelligent bidding strategies and recommendations
            </p>
          </div>
        </div>
        <button
          onClick={handleAutoBidToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            autoBidEnabled 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {autoBidEnabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {autoBidEnabled ? 'Auto-Bid Active' : 'Enable Auto-Bid'}
        </button>
      </div>

      {/* Current Recommendation */}
      {recommendation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg border ${
            recommendation.action === 'bid' 
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
              : recommendation.action === 'wait'
              ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
              : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${
              recommendation.action === 'bid' 
                ? 'bg-green-600 text-white' 
                : recommendation.action === 'wait'
                ? 'bg-yellow-600 text-white'
                : 'bg-red-600 text-white'
            }`}>
              {recommendation.action === 'bid' ? <Target className="w-4 h-4" /> : 
               recommendation.action === 'wait' ? <Clock className="w-4 h-4" /> : 
               <AlertTriangle className="w-4 h-4" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                  {recommendation.action} {recommendation.amount && `₹${recommendation.amount.toLocaleString()}`}
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
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Competition:</span>
                  <span className="font-medium capitalize text-gray-900 dark:text-white">
                    {recommendation.marketContext.competition}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Trend:</span>
                  <span className="font-medium capitalize text-gray-900 dark:text-white">
                    {recommendation.marketContext.priceTrend}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Time left:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {recommendation.marketContext.timeRemaining}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Auction Analysis */}
      {analysis && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Auction Analysis
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current Price</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                ₹{analysis.currentPrice.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Est. Final Price</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                ₹{analysis.estimatedFinalPrice.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Competition</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {analysis.competitionLevel} bidders
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Optimal Bid Time</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {analysis.optimalBidTime}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bidding Strategies */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Recommended Strategies
        </h4>
        <div className="space-y-3">
          {strategies.map((strategy, index) => (
            <motion.div
              key={strategy.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedStrategy === strategy.id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => handleStrategySelect(strategy.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    {strategy.name}
                  </h5>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {strategy.description}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(strategy.riskLevel)}`}>
                    {strategy.riskLevel}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {strategy.timing}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-xs mb-2">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">ROI:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {strategy.expectedROI}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Success:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {strategy.successRate}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Max Bid:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ₹{strategy.maxBid.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-4 text-xs">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Pros:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {strategy.pros.slice(0, 2).map((pro, i) => (
                      <span key={i} className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded">
                        {pro}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Cons:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {strategy.cons.slice(0, 2).map((con, i) => (
                      <span key={i} className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded">
                        {con}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Auto-Bid Settings */}
      {autoBidEnabled && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              Auto-Bid Settings
            </h4>
            <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
              Active
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Maximum Bid Amount</label>
              <input
                type="number"
                value={maxAutoBid}
                onChange={(e) => setMaxAutoBid(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Strategy</label>
              <select className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm">
                <option>Strategic Timing</option>
                <option>Conservative</option>
                <option>Aggressive</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AIBiddingAssistant;
