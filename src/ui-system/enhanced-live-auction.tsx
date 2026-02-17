// Enhanced Live Auction Screen - Ultimate Gaming Experience + Fintech Trust + SaaS Intelligence
// Revolutionary auction interface with bid intensity, countdown psychology, and real-time excitement

import React, { useState, useEffect, useCallback } from 'react';
import {
  Zap,
  Volume2,
  VolumeX,
  Trophy,
  Target,
  TrendingUp,
  Users,
  Clock,
  Crown,
  Flame,
  Star,
  AlertTriangle,
  CheckCircle,
  X,
  Heart,
  Share2,
  Eye,
  MessageSquare,
  DollarSign,
  Timer,
  Activity,
  TrendingRight,
  Award,
  Sparkles,
  Lightning,
  Rocket,
  Wind,
  Play,
  Pause
} from 'lucide-react';

// Import enhanced design system
import { Card, Button, Container, Grid, Flex, Stack } from '../ui-system';
import { colors, getGradient, getEmotionColor, getCountdownColor } from '../ui-system/colors';
import { textStyles, getTextStyle } from '../ui-system/typography';
import { StatusBadge, TrustScore, ProgressIndicator } from '../ui-system/simplified-status';
import { OptimizedImage, LoadingSpinner } from '../ui-system/performance-mobile-trust';

// Bid Intensity Meter Component
interface BidIntensityMeterProps {
  intensity: number; // 0-100
  bidders: number;
  className?: string;
}

const BidIntensityMeter: React.FC<BidIntensityMeterProps> = ({ intensity, bidders, className }) => {
  const getIntensityLevel = (intensity: number) => {
    if (intensity >= 90) return { level: 'LEGENDARY', color: colors.bidIntensity.legendary, icon: Crown };
    if (intensity >= 75) return { level: 'EXTREME', color: colors.bidIntensity.extreme, icon: Flame };
    if (intensity >= 50) return { level: 'HOT', color: colors.bidIntensity.high, icon: Fire };
    if (intensity >= 25) return { level: 'WARM', color: colors.bidIntensity.medium, icon: Zap };
    return { level: 'CALM', color: colors.bidIntensity.low, icon: Wind };
  };

  const { level, color, icon: Icon } = getIntensityLevel(intensity);

  return (
    <div
}
}
}
      className={`bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 rounded-2xl ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            animate={{
              scale: intensity > 70 ? [1, 1.2, 1] : 1,
              rotate: intensity > 90 ? [0, 10, -10, 0] : 0
            }}
}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <span className="text-sm font-bold">BID INTENSITY</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <Users className="w-3 h-3" />
          {bidders}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span>{level}</span>
          <span>{intensity}%</span>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-full rounded-full relative"
            style={{ background: `linear-gradient(90deg, ${color} 0%, ${color}DD 100%)` }}
}
%` }}
}
          >
            {/* Animated particles for high intensity */}
            {intensity > 70 && (
              <div
                className="absolute inset-0"
                animate={{
                  background: [
                    `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
                    `linear-gradient(90deg, transparent 25%, ${color} 75%, transparent 100%)`,
                    `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`
                  ]
                }}
}
              />
            )}
          </div>
        </div>

        {/* Intensity indicators */}
        <div className="flex justify-between">
          {['CALM', 'WARM', 'HOT', 'EXTREME', 'LEGENDARY'].map((label, index) => {
            const threshold = index * 25;
            const isActive = intensity >= threshold;
            return (
              <div
                key={label}
                className={`text-xs font-bold transition-colors ${
                  isActive ? 'text-white' : 'text-gray-500'
                }`}
 : {}}
}
              >
                {label[0]}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Ultimate Countdown Timer Component
interface CountdownTimerProps {
  secondsLeft: number;
  totalSeconds: number;
  isLeading?: boolean;
  className?: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  secondsLeft,
  totalSeconds,
  isLeading = false,
  className
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return { mins, secs, formatted: `${mins}:${secs.toString().padStart(2, '0')}` };
  };

  const { mins, secs, formatted } = formatTime(secondsLeft);
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const countdownColor = getCountdownColor(secondsLeft);

  // Critical moments for animation
  const isCritical = secondsLeft <= 5;
  const isWarning = secondsLeft <= 30;
  const isExciting = secondsLeft <= 60;

  return (
    <div
      className={`relative ${className}`}
      animate={isCritical ? {
        scale: [1, 1.05, 1],
        borderColor: [countdownColor, '#ef4444', countdownColor]
      } : {}}
}
    >
      {/* Background glow for critical moments */}
      {isCritical && (
        <div
          className="absolute inset-0 bg-red-500/20 rounded-2xl blur-xl"
}
}
        />
      )}

      <Card className={`p-6 text-center relative overflow-hidden ${
        isLeading ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white' : 'bg-gray-900 text-white'
      }`}>

        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
 : {}}
}
          />
        </div>

        <div className="relative z-10">
          <div
            className="mb-4"
 : {}}
}
          >
            <Timer className={`w-12 h-12 mx-auto mb-2 ${
              isLeading ? 'text-white' : countdownColor === colors.gamingStates.urgent ? 'text-red-400' : 'text-blue-400'
            }`} />
            {isLeading && <Crown className="w-6 h-6 mx-auto text-yellow-300" />}
          </div>

          <div
            className="mb-4"
            animate={isCritical ? {
              scale: [1, 1.2, 1],
              color: ['#ffffff', '#fbbf24', '#ffffff']
            } : {}}
}
          >
            <div
              className="text-5xl font-black mb-2"
              style={getTextStyle('gaming', 'countdown')}
            >
              {formatted}
            </div>
            <p className={`text-sm font-medium ${isLeading ? 'text-emerald-100' : 'text-gray-300'}`}>
              {isLeading ? 'YOU\'RE LEADING! 🔥' : 'Time Remaining'}
            </p>
          </div>

          {/* Progress ring */}
          <div className="relative w-24 h-24 mx-auto mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke={isLeading ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)"}
                strokeWidth="8"
                fill="none"
              />
              {/* Progress circle */}
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                stroke={isLeading ? "#10b981" : countdownColor}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
}
}
}
                style={{
                  strokeDasharray: '283',
                  strokeDashoffset: `calc(283 - (283 * ${progress}) / 100)`
                }}
              />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="text-lg font-bold"
 : {}}
}
              >
                {Math.round(progress)}%
              </div>
            </div>
          </div>

          {/* Urgency messages */}
          <Fragment>
            {isCritical && (
              <div
}
}
}
                className="text-red-300 font-bold text-sm"
              >
                ⚡ FINAL SECONDS ⚡
              </div>
            )}
            {isWarning && !isCritical && (
              <div
}
}
}
                className="text-orange-300 font-bold text-sm"
              >
                🚀 GET READY TO BID 🚀
              </div>
            )}
          </Fragment>
        </div>
      </Card>
    </div>
  );
};

// Real-time Bid Ticker Component
interface BidTickerProps {
  bids: Array<{
    id: string;
    bidder: string;
    amount: number;
    timestamp: Date;
    isYou?: boolean;
  }>;
  className?: string;
}

const BidTicker: React.FC<BidTickerProps> = ({ bids, className }) => {
  return (
    <Card className={`p-4 bg-gradient-to-r from-blue-900 to-purple-900 text-white ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-blue-300" />
        <span className="text-sm font-bold">LIVE BID TICKER</span>
        <div
}
}
          className="w-2 h-2 bg-green-400 rounded-full"
        />
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto">
        <Fragment>
          {bids.slice(0, 5).map((bid, index) => (
            <div
              key={bid.id}
}
}
}
}
              className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                bid.isYou
                  ? 'bg-emerald-500/20 border border-emerald-400'
                  : 'bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                {bid.isYou && <Crown className="w-4 h-4 text-yellow-400" />}
                <span className={`text-sm font-medium ${bid.isYou ? 'text-emerald-300' : 'text-white'}`}>
                  {bid.isYou ? 'YOU' : bid.bidder}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-green-400">
                  ₹{(bid.amount / 100000).toFixed(1)}L
                </span>
                <span className="text-xs text-gray-400">
                  {bid.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </Fragment>
      </div>
    </Card>
  );
};

// Winning Probability UI Component
interface WinningProbabilityProps {
  probability: number;
  yourBid: number;
  highestBid: number;
  totalBidders: number;
  className?: string;
}

const WinningProbability: React.FC<WinningProbabilityProps> = ({
  probability,
  yourBid,
  highestBid,
  totalBidders,
  className
}) => {
  const getProbabilityColor = (prob: number) => {
    if (prob >= 80) return 'text-emerald-400 border-emerald-400';
    if (prob >= 60) return 'text-blue-400 border-blue-400';
    if (prob >= 40) return 'text-yellow-400 border-yellow-400';
    return 'text-red-400 border-red-400';
  };

  const getProbabilityIcon = (prob: number) => {
    if (prob >= 80) return Trophy;
    if (prob >= 60) return Target;
    if (prob >= 40) return TrendingUp;
    return AlertTriangle;
  };

  const Icon = getProbabilityIcon(probability);

  return (
    <div
}
}
}
      className={`bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-4 rounded-2xl ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
 : {}}
}
          >
            <Icon className={`w-5 h-5 ${getProbabilityColor(probability)}`} />
          </div>
          <span className="text-sm font-bold">WIN PROBABILITY</span>
        </div>
        <div
          className={`text-2xl font-black ${getProbabilityColor(probability)}`}
 : {}}
}
        >
          {probability}%
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span>Your Bid:</span>
          <span className="font-bold">₹{(yourBid / 100000).toFixed(1)}L</span>
        </div>
        <div className="flex justify-between">
          <span>Highest:</span>
          <span className="font-bold text-yellow-400">₹{(highestBid / 100000).toFixed(1)}L</span>
        </div>
        <div className="flex justify-between">
          <span>Active Bidders:</span>
          <span className="font-bold">{totalBidders}</span>
        </div>
      </div>

      {/* Probability visualization */}
      <div className="mt-3">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${getProbabilityColor(probability).replace('text-', 'bg-').replace('border-', 'bg-')}`}
}
%` }}
}
          />
        </div>
        <div className="flex justify-between text-xs mt-1 text-gray-400">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
};

// Enhanced Live Auction Component
export const EnhancedLiveAuction: React.FC = () => {
  const [auctionData, setAuctionData] = useState({
    item: {
      name: 'BMW X5 2020',
      description: 'Premium Luxury SUV • Excellent Condition',
      images: ['/api/placeholder/600/400'],
      startingPrice: 750000,
      currentBid: 875000,
      reservePrice: 900000,
      yourLastBid: 875000,
      isLeading: true
    },
    timeLeft: 180, // 3 minutes
    totalDuration: 600, // 10 minutes total
    bidders: 23,
    bidIntensity: 85,
    winningProbability: 78,
    soundEnabled: true,
    isPaused: false
  });

  const [recentBids, setRecentBids] = useState([
    { id: '1', bidder: 'Alex Chen', amount: 875000, timestamp: new Date(), isYou: true },
    { id: '2', bidder: 'Sarah Wilson', amount: 850000, timestamp: new Date(Date.now() - 30000) },
    { id: '3', bidder: 'Mike Johnson', amount: 825000, timestamp: new Date(Date.now() - 60000) },
    { id: '4', bidder: 'Emma Davis', amount: 800000, timestamp: new Date(Date.now() - 90000) },
  ]);

  const [bidAmount, setBidAmount] = useState(900000);

  // Countdown timer
  useEffect(() => {
    if (auctionData.isPaused) return;

    const interval = setInterval(() => {
      setAuctionData(prev => ({
        ...prev,
        timeLeft: Math.max(0, prev.timeLeft - 1)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [auctionData.isPaused]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of new bid
        const newBid = {
          id: Date.now().toString(),
          bidder: ['John Smith', 'Lisa Brown', 'David Lee', 'Anna White'][Math.floor(Math.random() * 4)],
          amount: auctionData.currentBid + Math.floor(Math.random() * 25000) + 5000,
          timestamp: new Date(),
          isYou: false
        };

        setAuctionData(prev => ({
          ...prev,
          currentBid: newBid.amount,
          bidders: prev.bidders + (Math.random() > 0.5 ? 1 : 0),
          bidIntensity: Math.min(100, prev.bidIntensity + Math.floor(Math.random() * 10)),
          winningProbability: prev.isLeading ? Math.max(10, prev.winningProbability - Math.floor(Math.random() * 15)) : prev.winningProbability
        }));

        setRecentBids(prev => [newBid, ...prev.slice(0, 9)]);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [auctionData.currentBid, auctionData.isLeading]);

  const handleBid = useCallback(() => {
    const newBid = {
      id: Date.now().toString(),
      bidder: 'YOU',
      amount: bidAmount,
      timestamp: new Date(),
      isYou: true
    };

    setAuctionData(prev => ({
      ...prev,
      currentBid: bidAmount,
      yourLastBid: bidAmount,
      isLeading: true,
      bidIntensity: Math.min(100, prev.bidIntensity + 15),
      winningProbability: 95
    }));

    setRecentBids(prev => [newBid, ...prev.slice(0, 9)]);

    // Auto-increment bid amount for next bid
    setBidAmount(prev => prev + 25000);
  }, [bidAmount]);

  const toggleSound = () => {
    setAuctionData(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const togglePause = () => {
    setAuctionData(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent animate-pulse" />

        {/* Dynamic background elements */}
        <div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"
        />
        <div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-32 right-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
        />
      </div>

      <Container className="relative z-10 py-8">
        {/* Header with Auction Info */}
        <div
}
}
}
          className="mb-8"
        >
          <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{auctionData.item.name}</h1>
                <p className="text-gray-600">{auctionData.item.description}</p>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={toggleSound}
                  className="gap-2"
                >
                  {auctionData.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  Sound
                </Button>

                <Button
                  variant="outline"
                  onClick={togglePause}
                  className="gap-2"
                >
                  {auctionData.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  {auctionData.isPaused ? 'Resume' : 'Pause'}
                </Button>

                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-600">Live Auction</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Auction Grid */}
        <Grid cols={12} gap="lg" className="mb-8">
          {/* Left Column - Item Image & Details */}
          <div className="col-span-12 lg:col-span-5">
            <div
}
}
}
            >
              <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
                <div className="space-y-6">
                  {/* Item Image */}
                  <div className="relative">
                    <OptimizedImage
                      src={auctionData.item.images[0]}
                      alt={auctionData.item.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    {auctionData.isLeading && (
                      <div
}
}
                        className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1"
                      >
                        <Crown className="w-4 h-4" />
                        YOU'RE LEADING!
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Auction Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Starting Price:</span>
                        <div className="font-semibold">₹{(auctionData.item.startingPrice / 100000).toFixed(1)}L</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Current Bid:</span>
                        <div className="font-semibold text-emerald-600">₹{(auctionData.currentBid / 100000).toFixed(1)}L</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Your Last Bid:</span>
                        <div className="font-semibold text-blue-600">₹{(auctionData.yourLastBid / 100000).toFixed(1)}L</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Reserve Price:</span>
                        <div className="font-semibold text-gray-600">₹{(auctionData.item.reservePrice / 100000).toFixed(1)}L</div>
                      </div>
                    </div>
                  </div>

                  {/* Trust Indicators */}
                  <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Shield className="w-4 h-4" />
                      <span className="text-xs font-medium">Verified Seller</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">Escrow Protected</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-600">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-xs font-medium">AI Inspected</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Right Column - Bidding Interface */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            {/* Countdown Timer */}
            <CountdownTimer
              secondsLeft={auctionData.timeLeft}
              totalSeconds={auctionData.totalDuration}
              isLeading={auctionData.isLeading}
            />

            {/* Bid Intensity & Probability */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BidIntensityMeter
                intensity={auctionData.bidIntensity}
                bidders={auctionData.bidders}
              />
              <WinningProbability
                probability={auctionData.winningProbability}
                yourBid={auctionData.yourLastBid}
                highestBid={auctionData.currentBid}
                totalBidders={auctionData.bidders}
              />
            </div>

            {/* Bidding Interface */}
            <Card className="p-6 bg-gradient-to-r from-emerald-500 to-blue-600 text-white">
              <h3 className="text-lg font-bold mb-4">Place Your Bid</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Bid Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70">₹</span>
                    <input
                      type="number"
                      value={bidAmount / 100000}
                      onChange={(e) => setBidAmount(Number(e.target.value) * 100000)}
                      className="w-full pl-8 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-white/50"
                      placeholder="Enter bid amount"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70">Lakhs</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleBid}
                    className="flex-1 bg-white text-emerald-600 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                    disabled={auctionData.timeLeft === 0}
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    {auctionData.isLeading ? 'Increase Bid' : 'Place Bid'}
                  </Button>

                  <Button
                    variant="outline"
                    className="px-6 py-3 border-white/30 text-white hover:bg-white/10"
                  >
                    <Heart className="w-5 h-5" />
                  </Button>
                </div>

                {/* Quick Bid Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {[25, 50, 75, 100].map((increment) => (
                    <button
                      key={increment}
                      onClick={() => setBidAmount(auctionData.currentBid + increment * 1000)}
                      className="py-2 px-3 bg-white/10 hover:bg-white/20 rounded text-sm font-medium transition-colors"
                    >
                      +₹{increment}K
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Bid Ticker */}
            <BidTicker bids={recentBids} />
          </div>
        </Grid>

        {/* Bottom Section - Additional Info */}
        <div
}
}
}
        >
          <Grid cols={3} gap="md">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-semibold">{auctionData.bidders}</div>
                  <div className="text-sm text-gray-600">Active Bidders</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-semibold">₹{(auctionData.currentBid - auctionData.item.startingPrice).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Price Increase</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="font-semibold">{Math.floor(auctionData.totalDuration / 60)}min</div>
                  <div className="text-sm text-gray-600">Auction Duration</div>
                </div>
              </div>
            </Card>
          </Grid>
        </div>
      </Container>
    </div>
  );
};

export default EnhancedLiveAuction;
