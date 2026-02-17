// Enhanced Buyer Dashboard - Gaming Excitement + Fintech Trust + SaaS Intelligence
// Premium dashboard experience with real-time data, AI insights, and emotional engagement

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Trophy,
  Clock,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  Users,
  Eye,
  Heart,
  Star,
  Award,
  Crown,
  Flame,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Filter,
  Search,
  Bell,
  Settings,
  User,
  Calendar,
  MapPin
} from 'lucide-react';

// Import enhanced design system
import { Card, Button, Container, Grid, Flex, Stack } from '../ui-system';
import { colors, getGradient, getEmotionColor } from '../ui-system/colors';
import { textStyles, getTextStyle } from '../ui-system/typography';
import { StatusBadge, TrustScore, ProgressIndicator } from '../ui-system/simplified-status';
import { OptimizedImage, LoadingSpinner } from '../ui-system/performance-mobile-trust';

// Animated KPI Card Component
interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ComponentType<any>;
  gradient: string;
  delay?: number;
  isRealtime?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  gradient,
  delay = 0,
  isRealtime = false
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (typeof value === 'number') {
      const timer = setTimeout(() => {
        setIsAnimating(true);
        const duration = 1000;
        const steps = 60;
        const increment = value / steps;
        let current = 0;

        const animate = () => {
          current += increment;
          if (current >= value) {
            setAnimatedValue(value);
            setIsAnimating(false);
          } else {
            setAnimatedValue(current);
            setTimeout(animate, duration / steps);
          }
        };
        animate();
      }, delay * 100);

      return () => clearTimeout(timer);
    }
  }, [value, delay]);

  return (
    <div
    >
      <Card className={`p-6 bg-gradient-to-br ${gradient} text-white relative overflow-hidden group cursor-pointer hover:scale-105 transition-transform duration-200`}>
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent animate-pulse" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Icon className="w-6 h-6" />
            </div>
            {isRealtime && (
              <div
                className="w-2 h-2 bg-green-400 rounded-full"
              />
            )}
          </div>

          <div className="mb-2">
            <h3 className="text-sm font-medium text-white/90 mb-1">{title}</h3>
            <div className="text-2xl font-bold">
              {typeof value === 'number' ? (
                <span key={animatedValue}>
                  {isAnimating ? Math.round(animatedValue).toLocaleString() : value.toLocaleString()}
                </span>
              ) : (
                <span>{value}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {change > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-300" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-300" />
            )}
            <span className={`text-sm font-medium ${change > 0 ? 'text-green-300' : 'text-red-300'}`}>
              {change > 0 ? '+' : ''}{change}% {changeLabel}
            </span>
          </div>
        </div>

        {/* Hover effect */}
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg" />
      </Card>
    </div>
  );
};

// AI Recommendation Panel
interface AIRecommendationProps {
  title: string;
  description: string;
  action: string;
  confidence: number;
  icon: React.ComponentType<any>;
  color: string;
}

const AIRecommendation: React.FC<AIRecommendationProps> = ({
  title,
  description,
  action,
  confidence,
  icon: Icon,
  color
}) => (
  <div
    className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
  >
    <div className="flex items-start gap-3">
      <div className={`p-2 bg-${color}-100 rounded-lg`}>
        <Icon className={`w-5 h-5 text-${color}-600`} />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
            {confidence}% match
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        <Button size="sm" variant="outline" className="group-hover:bg-blue-600 group-hover:text-white transition-colors">
          {action}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  </div>
);

// Live Auction Spotlight
const LiveAuctionSpotlight: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl p-6 text-white relative overflow-hidden"
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent animate-pulse" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 bg-white rounded-full"
            />
            <span className="text-lg font-bold">LIVE AUCTION</span>
          </div>
          <StatusBadge status="active" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">BMW X5 2020</h3>
            <p className="text-orange-100 mb-4">Premium SUV • Excellent Condition</p>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Bid:</span>
                <span className="font-bold">₹8,50,000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Your Max Bid:</span>
                <span className="font-bold">₹9,00,000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Bidders:</span>
                <span className="font-bold">23 active</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="mb-4">
              <div className="text-4xl font-black mb-2" style={getTextStyle('gaming', 'countdown')}>
                {formatTime(timeLeft)}
              </div>
              <p className="text-sm text-orange-100">Time Remaining</p>
            </div>

            <div className="flex gap-2 justify-center">
              <Button className="bg-white text-red-600 hover:bg-gray-100 font-bold px-6 py-2">
                Bid Now
                <Zap className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-red-600 px-4 py-2">
                Watch
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Activity Heatmap Component
const ActivityHeatmap: React.FC = () => {
  const [hoveredCell, setHoveredCell] = useState<{ day: number; hour: number; value: number } | null>(null);

  // Mock heatmap data (7 days x 24 hours)
  const heatmapData = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => Math.floor(Math.random() * 5))
  );

  const getIntensityColor = (value: number) => {
    const colors = ['bg-gray-100', 'bg-blue-200', 'bg-blue-400', 'bg-blue-600', 'bg-blue-800'];
    return colors[value] || colors[0];
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Bidding Activity</h3>
          <p className="text-sm text-gray-600">Your auction participation heatmap</p>
        </div>
        <Button variant="outline" size="sm">
          <Calendar className="w-4 h-4 mr-2" />
          Last 7 Days
        </Button>
      </div>

      <div className="space-y-2">
        {heatmapData.map((week, dayIndex) => (
          <div key={dayIndex} className="flex gap-1">
            {week.map((value, hourIndex) => (
              <div
                key={hourIndex}
                className={`w-3 h-3 rounded-sm cursor-pointer ${getIntensityColor(value)}`}
                onHoverStart={() => setHoveredCell({ day: dayIndex, hour: hourIndex, value })}
                onHoverEnd={() => setHoveredCell(null)}
              />
            ))}
          </div>
        ))}
      </div>

      <Fragment>
        {hoveredCell && (
          <div
            className="absolute bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none z-10"
            style={{
              left: hoveredCell.hour * 16 + 20,
              top: hoveredCell.day * 16 + 100
            }}
          >
            {hoveredCell.value} bids
          </div>
        )}
      </Fragment>

      <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map(level => (
            <div key={level} className={`w-3 h-3 rounded-sm ${getIntensityColor(level)}`} />
          ))}
        </div>
        <span>More</span>
      </div>
    </Card>
  );
};

// Enhanced Buyer Dashboard Component
export const EnhancedBuyerDashboard: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const kpiData = [
    {
      title: "Active Bids",
      value: 12,
      change: 25,
      changeLabel: "from last week",
      icon: Target,
      gradient: "from-blue-500 to-indigo-600",
      isRealtime: true
    },
    {
      title: "Won Auctions",
      value: 8,
      change: 12,
      changeLabel: "this month",
      icon: Trophy,
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      title: "Total Spent",
      value: 245000,
      change: -5,
      changeLabel: "vs last month",
      icon: DollarSign,
      gradient: "from-purple-500 to-pink-600"
    },
    {
      title: "Watchlist",
      value: 34,
      change: 8,
      changeLabel: "new items",
      icon: Heart,
      gradient: "from-orange-500 to-red-600"
    }
  ];

  const aiRecommendations = [
    {
      title: "Hot Deal Alert",
      description: "Audi A6 2019 just listed - 20% below market value. Matches your search criteria.",
      action: "View Now",
      confidence: 95,
      icon: Flame,
      color: "red"
    },
    {
      title: "Smart Investment",
      description: "Based on your bidding history, this commercial vehicle could appreciate 15% in 6 months.",
      action: "Analyze",
      confidence: 87,
      icon: TrendingUp,
      color: "green"
    },
    {
      title: "Competitor Alert",
      description: "A similar BMW X3 is ending in 2 hours. Your max bid is ₹50K below current price.",
      action: "Increase Bid",
      confidence: 92,
      icon: Zap,
      color: "yellow"
    }
  ];

  return (
    <Container className="py-8">
      {/* Header */}
      <div
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Welcome back, Alex! 👋
          </h1>
          <p className="text-gray-600">
            You've got <span className="font-semibold text-blue-600">3 active bids</span> and{' '}
            <span className="font-semibold text-emerald-600">2 auctions ending soon</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleRefresh}
            loading={refreshing}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>

          <Button className="gap-2">
            <Search className="w-4 h-4" />
            Browse Auctions
          </Button>
        </div>
      </div>

      {/* Live Auction Spotlight */}
      <div
        className="mb-8"
      >
        <LiveAuctionSpotlight />
      </div>

      {/* KPI Cards */}
      <div
        className="mb-8"
      >
        <Grid cols={4} gap="md">
          {kpiData.map((kpi, index) => (
            <KPICard
              key={kpi.title}
              {...kpi}
              delay={index}
            />
          ))}
        </Grid>
      </div>

      {/* Main Content Grid */}
      <Grid cols={3} gap="lg">
        {/* Left Column - AI Recommendations */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
                <p className="text-sm text-gray-600">Personalized insights for you</p>
              </div>
              <div className="flex items-center gap-1 text-purple-600">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-medium">AI Powered</span>
              </div>
            </div>

            <div className="space-y-4">
              {aiRecommendations.map((rec, index) => (
                <AIRecommendation key={index} {...rec} />
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Target, label: 'Place Bid', color: 'bg-blue-500' },
                { icon: Heart, label: 'Watchlist', color: 'bg-red-500' },
                { icon: BarChart3, label: 'Analytics', color: 'bg-green-500' },
                { icon: Settings, label: 'Settings', color: 'bg-gray-500' }
              ].map((action, index) => (
                <button
                  key={action.label}
                  onClick={() => console.log(action.label)}
                  className={`p-4 ${action.color} text-white rounded-lg hover:opacity-90 transition-opacity`}
                >
                  <action.icon className="w-6 h-6 mb-2 mx-auto" />
                  <div className="text-sm font-medium">{action.label}</div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Middle Column - Activity Feed */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Activity Feed</h3>
              <StatusBadge status="active" />
            </div>

            <div className="space-y-4">
              {[
                {
                  type: 'bid',
                  message: 'You placed a bid on BMW X5',
                  amount: '₹8,50,000',
                  time: '2 minutes ago',
                  icon: Target,
                  color: 'text-blue-600'
                },
                {
                  type: 'win',
                  message: 'Congratulations! You won Honda City',
                  amount: '₹6,20,000',
                  time: '1 hour ago',
                  icon: Trophy,
                  color: 'text-emerald-600'
                },
                {
                  type: 'outbid',
                  message: 'You were outbid on Audi A4',
                  amount: '₹12,50,000',
                  time: '3 hours ago',
                  icon: TrendingUp,
                  color: 'text-orange-600'
                }
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className={`p-2 bg-gray-100 rounded-lg ${activity.color}`}>
                    <activity.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">{activity.time}</span>
                      <span className="text-xs font-semibold text-gray-700">{activity.amount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Auctions */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Auctions</h3>
              <Button variant="ghost" size="sm">View All</Button>
            </div>

            <div className="space-y-3">
              {[
                { name: 'BMW X5 2020', currentBid: '₹8,50,000', status: 'active', bidders: 23 },
                { name: 'Honda City 2019', currentBid: '₹6,20,000', status: 'won', bidders: 18 },
                { name: 'Audi A4 2018', currentBid: '₹12,50,000', status: 'outbid', bidders: 31 }
              ].map((auction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{auction.name}</h4>
                    <p className="text-xs text-gray-500">{auction.bidders} bidders</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 text-sm">{auction.currentBid}</p>
                    <StatusBadge status={auction.status as any} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - Analytics & Heatmap */}
        <div className="space-y-6">
          {/* Performance Overview */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-gray-500">Live</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Win Rate</span>
                  <span className="font-semibold">67%</span>
                </div>
                <ProgressIndicator current={67} total={100} showPercentage />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Bid Efficiency</span>
                  <span className="font-semibold">84%</span>
                </div>
                <ProgressIndicator current={84} total={100} showPercentage />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Avg. Savings</span>
                  <span className="font-semibold">₹1.2L</span>
                </div>
                <ProgressIndicator current={85} total={100} showPercentage />
              </div>
            </div>
          </Card>

          {/* Activity Heatmap */}
          <ActivityHeatmap />

          {/* Trust Score */}
          <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
            <div className="text-center">
              <TrustScore score={92} size="lg" showDetails />
              <p className="text-sm text-gray-600 mt-2">Your bidding reputation</p>
              <div className="flex justify-center gap-1 mt-3">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span className="text-xs font-medium text-gray-700">Top 5% of buyers</span>
              </div>
            </div>
          </Card>
        </div>
      </Grid>
    </Container>
  );
};

export default EnhancedBuyerDashboard;
