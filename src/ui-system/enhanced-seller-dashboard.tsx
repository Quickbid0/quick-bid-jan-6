// Enhanced Seller Dashboard - Gaming Excitement + Fintech Trust + SaaS Intelligence
// Premium seller experience with revenue analytics, AI insights, and performance optimization

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Trophy,
  Crown,
  Star,
  Award,
  Sparkles,
  RefreshCw,
  Plus,
  Eye,
  Heart,
  MessageSquare,
  Calendar,
  MapPin,
  Filter,
  Download,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingRight,
  ShoppingCart,
  Gavel
} from 'lucide-react';

// Import enhanced design system
import { Card, Button, Container, Grid, Flex, Stack } from '../ui-system';
import { colors, getGradient, getEmotionColor } from '../ui-system/colors';
import { textStyles, getTextStyle } from '../ui-system/typography';
import { StatusBadge, TrustScore, ProgressIndicator } from '../ui-system/simplified-status';
import { OptimizedImage, LoadingSpinner } from '../ui-system/performance-mobile-trust';

// Revenue Heatmap Component
const RevenueHeatmap: React.FC = () => {
  const [hoveredCell, setHoveredCell] = useState<{ month: number; week: number; revenue: number } | null>(null);

  // Mock revenue data (12 months x 4 weeks)
  const revenueData = Array.from({ length: 12 }, () =>
    Array.from({ length: 4 }, () => Math.floor(Math.random() * 500000) + 100000)
  );

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const getRevenueColor = (revenue: number) => {
    if (revenue > 400000) return 'bg-emerald-500';
    if (revenue > 300000) return 'bg-emerald-400';
    if (revenue > 200000) return 'bg-emerald-300';
    if (revenue > 100000) return 'bg-emerald-200';
    return 'bg-emerald-100';
  };

  const maxRevenue = Math.max(...revenueData.flat());
  const getIntensityColor = (revenue: number) => {
    const intensity = revenue / maxRevenue;
    if (intensity > 0.8) return 'bg-emerald-600';
    if (intensity > 0.6) return 'bg-emerald-500';
    if (intensity > 0.4) return 'bg-emerald-400';
    if (intensity > 0.2) return 'bg-emerald-300';
    return 'bg-emerald-200';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Revenue Heatmap</h3>
          <p className="text-sm text-gray-600">Monthly sales performance</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-emerald-600">₹24.5L</span>
          <TrendingUp className="w-5 h-5 text-emerald-500" />
        </div>
      </div>

      <div className="space-y-3">
        {revenueData.map((monthData, monthIndex) => (
          <div key={monthIndex} className="flex items-center gap-3">
            <div className="w-8 text-xs font-medium text-gray-500 text-right">
              {months[monthIndex]}
            </div>
            <div className="flex gap-1 flex-1">
              {monthData.map((revenue, weekIndex) => (
                <div
                  key={weekIndex}
                  className={`h-8 rounded cursor-pointer ${getIntensityColor(revenue)} hover:opacity-80 transition-opacity`}
                  style={{ width: `${100 / 4}%` }}
                  onHoverStart={() => setHoveredCell({ month: monthIndex, week: weekIndex, revenue })}
                  onHoverEnd={() => setHoveredCell(null)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {hoveredCell && (
        <div
          className="absolute bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg pointer-events-none z-10"
          style={{
            left: 120 + (hoveredCell.week * 60),
            top: 120 + (hoveredCell.month * 24)
          }}
        >
          <div className="font-medium">₹{(hoveredCell.revenue / 100000).toFixed(1)}L</div>
          <div className="text-gray-300">{months[hoveredCell.month]} Week {hoveredCell.week + 1}</div>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
        <span>₹1L</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-emerald-200 rounded" />
          <div className="w-3 h-3 bg-emerald-300 rounded" />
          <div className="w-3 h-3 bg-emerald-400 rounded" />
          <div className="w-3 h-3 bg-emerald-500 rounded" />
          <div className="w-3 h-3 bg-emerald-600 rounded" />
        </div>
        <span>₹5L+</span>
      </div>
    </Card>
  );
};

// AI Sales Insights Panel
interface SalesInsightProps {
  title: string;
  insight: string;
  impact: 'high' | 'medium' | 'low';
  action: string;
  icon: React.ComponentType<any>;
  color: string;
}

const SalesInsight: React.FC<SalesInsightProps> = ({
  title,
  insight,
  impact,
  action,
  icon: Icon,
  color
}) => {
  const impactColors = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-blue-100 text-blue-700 border-blue-200'
  };

  return (
    <div
      className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4"
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 bg-${color}-100 rounded-lg`}>
          <Icon className={`w-5 h-5 text-${color}-600`} />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-gray-900">{title}</h4>
            <span className={`text-xs px-2 py-1 rounded-full font-medium border ${impactColors[impact]}`}>
              {impact} impact
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{insight}</p>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
            {action}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Live Auction Monitor
const LiveAuctionMonitor: React.FC = () => {
  const [auctions, setAuctions] = useState([
    {
      id: 1,
      item: 'BMW X5 2020',
      currentBid: 850000,
      bidders: 23,
      timeLeft: 180, // 3 minutes
      status: 'active',
      myReserve: 900000,
      topBidder: false
    },
    {
      id: 2,
      item: 'Honda City 2019',
      currentBid: 620000,
      bidders: 18,
      timeLeft: 45, // 45 seconds
      status: 'ending',
      myReserve: 650000,
      topBidder: true
    },
    {
      id: 3,
      item: 'Audi A4 2018',
      currentBid: 1250000,
      bidders: 31,
      timeLeft: 7200, // 2 hours
      status: 'active',
      myReserve: 1300000,
      topBidder: false
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAuctions(prev => prev.map(auction => ({
        ...auction,
        timeLeft: Math.max(0, auction.timeLeft - 1),
        // Simulate bid increases occasionally
        currentBid: Math.random() > 0.95 ? auction.currentBid + Math.floor(Math.random() * 10000) + 5000 : auction.currentBid
      })));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getUrgencyColor = (seconds: number) => {
    if (seconds < 60) return 'text-red-600 bg-red-50';
    if (seconds < 300) return 'text-orange-600 bg-orange-50';
    return 'text-blue-600 bg-blue-50';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Live Auctions</h3>
          <p className="text-sm text-gray-600">Monitor your active listings</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>

      <div className="space-y-4">
        {auctions.map((auction) => (
          <div
            key={auction.id}
            className={`p-4 rounded-lg border-2 transition-all ${
              auction.topBidder
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{auction.item}</h4>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {auction.bidders} bidders
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    Reserve: ₹{(auction.myReserve / 100000).toFixed(1)}L
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  ₹{(auction.currentBid / 100000).toFixed(1)}L
                </div>
                <div className={`text-xs px-2 py-1 rounded-full font-medium ${getUrgencyColor(auction.timeLeft)}`}>
                  {formatTime(auction.timeLeft)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {auction.topBidder && (
                  <div className="flex items-center gap-1 text-emerald-600">
                    <Crown className="w-4 h-4" />
                    <span className="text-xs font-medium">You're winning!</span>
                  </div>
                )}
                <StatusBadge status={auction.status} size="sm" />
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4 mr-1" />
                  Watch
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Message
                </Button>
              </div>
            </div>

            {/* Bid progress bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Current: ₹{(auction.currentBid / 100000).toFixed(1)}L</span>
                <span>Reserve: ₹{(auction.myReserve / 100000).toFixed(1)}L</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    auction.currentBid >= auction.myReserve ? 'bg-emerald-500' : 'bg-blue-500'
                  }`}
                  style={{
                    width: `${Math.min(100, (auction.currentBid / auction.myReserve) * 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Enhanced Seller Dashboard Component
export const EnhancedSellerDashboard: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const kpiData = [
    {
      title: "Total Revenue",
      value: 2450000,
      change: 18,
      changeLabel: "from last month",
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-600",
      isRealtime: true
    },
    {
      title: "Active Auctions",
      value: 12,
      change: 25,
      changeLabel: "vs last week",
      icon: Gavel,
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      title: "Items Sold",
      value: 8,
      change: 12,
      changeLabel: "this month",
      icon: ShoppingCart,
      gradient: "from-purple-500 to-pink-600"
    },
    {
      title: "Avg. Sale Price",
      value: 875000,
      change: 8,
      changeLabel: "increase",
      icon: TrendingUp,
      gradient: "from-orange-500 to-red-600"
    }
  ];

  const aiInsights = [
    {
      title: "Price Optimization",
      insight: "Increase starting prices by 5-10% for luxury vehicles. Data shows 15% higher final bids.",
      impact: 'high' as const,
      action: "Apply Changes",
      icon: TrendingUp,
      color: "green"
    },
    {
      title: "Timing Strategy",
      insight: "Schedule auctions for Wednesday evenings. 40% higher engagement and 25% better prices.",
      impact: 'high' as const,
      action: "Update Schedule",
      icon: Clock,
      color: "blue"
    },
    {
      title: "Description Enhancement",
      insight: "Add detailed service history to listings. Similar items sell 30% faster with complete docs.",
      impact: 'medium' as const,
      action: "Enhance Listings",
      icon: FileText,
      color: "purple"
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
            Welcome back, Sarah! 🚀
          </h1>
          <p className="text-gray-600">
            You've earned <span className="font-semibold text-emerald-600">₹2.45L</span> this month with{' '}
            <span className="font-semibold text-blue-600">8 successful sales</span>
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
            <Plus className="w-4 h-4" />
            List Item
          </Button>
        </div>
      </div>

      {/* Live Auction Monitor */}
      <div
        className="mb-8"
      >
        <LiveAuctionMonitor />
      </div>

      {/* KPI Cards */}
      <div
        className="mb-8"
      >
        <Grid cols={4} gap="md">
          {kpiData.map((kpi, index) => (
            <div
              key={kpi.title}
            >
              <Card className={`p-6 bg-gradient-to-br ${kpi.gradient} text-white relative overflow-hidden group cursor-pointer hover:scale-105 transition-transform duration-200`}>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                      <kpi.icon className="w-6 h-6" />
                    </div>
                    {kpi.isRealtime && (
                      <div
                        className="w-2 h-2 bg-green-400 rounded-full"
                      />
                    )}
                  </div>

                  <div className="mb-2">
                    <h3 className="text-sm font-medium text-white/90 mb-1">{kpi.title}</h3>
                    <div className="text-2xl font-bold">
                      {typeof kpi.value === 'number' && kpi.value > 1000 ? (
                        <span>₹{(kpi.value / 100000).toFixed(1)}L</span>
                      ) : (
                        <span>{kpi.value}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {kpi.change > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-300" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-300" />
                    )}
                    <span className={`text-sm font-medium ${kpi.change > 0 ? 'text-green-300' : 'text-red-300'}`}>
                      {kpi.change > 0 ? '+' : ''}{kpi.change}% {kpi.changeLabel}
                    </span>
                  </div>
                </div>

                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg" />
              </Card>
            </div>
          ))}
        </Grid>
      </div>

      {/* Main Content Grid */}
      <Grid cols={3} gap="lg">
        {/* Left Column - AI Insights & Performance */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">AI Sales Insights</h3>
                <p className="text-sm text-gray-600">Data-driven recommendations</p>
              </div>
              <div className="flex items-center gap-1 text-purple-600">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-medium">AI Powered</span>
              </div>
            </div>

            <div className="space-y-4">
              {aiInsights.map((insight, index) => (
                <SalesInsight key={index} {...insight} />
              ))}
            </div>
          </Card>

          {/* Performance Metrics */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Metrics</h3>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Sale Rate</span>
                  <span className="font-semibold text-emerald-600">67%</span>
                </div>
                <ProgressIndicator current={67} total={100} showPercentage />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Avg. Time to Sale</span>
                  <span className="font-semibold text-blue-600">4.2 days</span>
                </div>
                <ProgressIndicator current={78} total={100} showPercentage />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Customer Satisfaction</span>
                  <span className="font-semibold text-purple-600">4.8/5</span>
                </div>
                <ProgressIndicator current={96} total={100} showPercentage />
              </div>
            </div>
          </Card>
        </div>

        {/* Middle Column - Revenue Heatmap & Analytics */}
        <div className="space-y-6">
          <RevenueHeatmap />

          {/* Top Performing Items */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
              <Button variant="ghost" size="sm">View All</Button>
            </div>

            <div className="space-y-4">
              {[
                { name: 'BMW X5 2020', soldFor: 875000, profit: 125000, status: 'sold' },
                { name: 'Honda City 2019', soldFor: 650000, profit: 95000, status: 'sold' },
                { name: 'Audi A4 2018', soldFor: 1250000, profit: 180000, status: 'active' }
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                    <p className="text-xs text-gray-500">Sold for ₹{(item.soldFor / 100000).toFixed(1)}L</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600 text-sm">
                      +₹{(item.profit / 100000).toFixed(1)}L
                    </p>
                    <StatusBadge status={item.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - Inventory & Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Plus, label: 'List Item', color: 'bg-emerald-500', action: () => console.log('List item') },
                { icon: BarChart3, label: 'Analytics', color: 'bg-blue-500', action: () => console.log('Analytics') },
                { icon: Users, label: 'Messages', color: 'bg-purple-500', action: () => console.log('Messages') },
                { icon: Settings, label: 'Settings', color: 'bg-gray-500', action: () => console.log('Settings') }
              ].map((action, index) => (
                <button
                  key={action.label}
                  whileTap={{ scale: 0.95 }}
                  onClick={action.action}
                  className={`p-4 ${action.color} text-white rounded-lg hover:opacity-90 transition-opacity`}
                >
                  <action.icon className="w-6 h-6 mb-2 mx-auto" />
                  <div className="text-sm font-medium">{action.label}</div>
                </button>
              ))}
            </div>
          </Card>

          {/* Seller Trust Score */}
          <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
            <div className="text-center">
              <TrustScore score={94} size="lg" showDetails />
              <p className="text-sm text-gray-600 mt-2">Your seller reputation</p>
              <div className="flex justify-center gap-1 mt-3">
                <Crown className="w-4 h-4 text-yellow-500" />
                <Award className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-medium text-gray-700">Elite Seller</span>
              </div>
            </div>
          </Card>

          {/* Upcoming Auctions */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming</h3>
              <Button variant="ghost" size="sm">Schedule</Button>
            </div>

            <div className="space-y-3">
              {[
                { item: 'Mercedes C-Class 2021', time: 'Tomorrow 2:00 PM', bidders: 45 },
                { item: 'Toyota Fortuner 2019', time: 'Friday 10:00 AM', bidders: 32 },
                { item: 'Hyundai Creta 2020', time: 'Next Week', bidders: 28 }
              ].map((auction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{auction.item}</h4>
                    <p className="text-xs text-gray-500">{auction.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">{auction.bidders} interested</p>
                    <StatusBadge status="pending" size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Grid>
    </Container>
  );
};

export default EnhancedSellerDashboard;
