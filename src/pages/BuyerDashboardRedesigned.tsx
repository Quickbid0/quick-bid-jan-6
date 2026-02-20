import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Gavel,
  ShoppingBag,
  Heart,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  Eye,
  Sparkles,
  Target,
  Crown,
  ChevronRight,
  Plus
} from 'lucide-react';
import { KPICard, AuctionCard, StatusBadge, StatCounter } from '@/components/design-system/EnhancedComponents';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * REDESIGNED BUYER DASHBOARD
 * 
 * Key Features:
 * - Large, prominent active bids section
 * - Clear wallet balance at top
 * - Won auctions organized by status
 * - AI recommendations
 * - Performance analytics
 * - Mobile optimized
 */

interface ActiveBid {
  id: string;
  title: string;
  currentBid: number;
  myBid: number;
  timeLeft: string;
  timeLeftMs: number;
  status: 'winning' | 'outbid' | 'leading';
  image: string;
  bidCount: number;
  viewCount: number;
}

interface WonAuction {
  id: string;
  title: string;
  finalPrice: number;
  wonDate: string;
  status: 'payment_pending' | 'paid' | 'delivered';
  image: string;
  sellerName: string;
  sellerRating: number;
}

interface BuyerStatsSummary {
  walletBalance: number;
  activeBids: number;
  wonAuctions: number;
  totalSpent: number;
  winRate: number;
  totalBidsPlaced: number;
  responseTime: number; // average time to complete auction
}

export default function RedesignedBuyerDashboard() {
  const [stats, setStats] = useState<BuyerStatsSummary>({
    walletBalance: 156400,
    activeBids: 8,
    wonAuctions: 34,
    totalSpent: 856400,
    winRate: 34,
    totalBidsPlaced: 127,
    responseTime: 2.5
  });

  const [activeBids, setActiveBids] = useState<ActiveBid[]>([
    {
      id: '1',
      title: 'Samsung 55" Smart TV 4K UHD',
      currentBid: 18500,
      myBid: 18500,
      timeLeft: '3h 45m',
      timeLeftMs: 13500000,
      status: 'winning',
      image: 'https://images.unsplash.com/photo-1567389781514-3b961442b8d0?w=400',
      bidCount: 12,
      viewCount: 245
    },
    {
      id: '2',
      title: 'iPhone 14 Pro Max',
      currentBid: 62000,
      myBid: 58000,
      timeLeft: '8h 20m',
      timeLeftMs: 29920000,
      status: 'outbid',
      image: 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=400',
      bidCount: 23,
      viewCount: 456
    },
    {
      id: '3',
      title: 'Sony WH-1000XM5 Headphones',
      currentBid: 22500,
      myBid: 22500,
      timeLeft: '12h 15m',
      timeLeftMs: 44100000,
      status: 'leading',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      bidCount: 8,
      viewCount: 189
    },
    {
      id: '4',
      title: 'iPad Air 2024',
      currentBid: 45000,
      myBid: 40000,
      timeLeft: '5h 30m',
      timeLeftMs: 19800000,
      status: 'outbid',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
      bidCount: 15,
      viewCount: 312
    }
  ]);

  const [wonAuctions, setWonAuctions] = useState<WonAuction[]>([
    {
      id: 'WON1',
      title: 'Apple AirPods Pro',
      finalPrice: 15000,
      wonDate: '2 days ago',
      status: 'payment_pending',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      sellerName: 'TechStore India',
      sellerRating: 4.8
    },
    {
      id: 'WON2',
      title: 'Gaming Mouse - Logitech',
      finalPrice: 3500,
      wonDate: '1 week ago',
      status: 'paid',
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
      sellerName: 'Gaming Paradise',
      sellerRating: 4.6
    },
    {
      id: 'WON3',
      title: 'Mechanical Keyboard RGB',
      finalPrice: 5200,
      wonDate: '10 days ago',
      status: 'delivered',
      image: 'https://images.unsplash.com/photo-1587829191301-e8c0b8847011?w=400',
      sellerName: 'ElectroHub',
      sellerRating: 4.7
    }
  ]);

  const [recommendations, setRecommendations] = useState([
    {
      id: 'REC1',
      title: 'MacBook Air M2',
      price: 85000,
      confidence: 92,
      reason: 'Based on your interest in tech products',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'
    },
    {
      id: 'REC2',
      title: 'Sony Mirrorless Camera',
      price: 95000,
      confidence: 87,
      reason: 'Trending in Photography category',
      image: 'https://images.unsplash.com/photo-1609034227505-5876f6aa4e90?w=400'
    },
    {
      id: 'REC3',
      title: 'Samsung Fridge Smart IoT',
      price: 145000,
      confidence: 81,
      reason: 'You\'ve won similar items',
      image: 'https://images.unsplash.com/photo-1584622181563-430f63602d4b?w=400'
    }
  ]);

  const [spendingTrend, setSpendingTrend] = useState([
    { date: 'Mon', amount: 15000 },
    { date: 'Tue', amount: 22000 },
    { date: 'Wed', amount: 18000 },
    { date: 'Thu', amount: 31000 },
    { date: 'Fri', amount: 28000 },
    { date: 'Sat', amount: 42000 },
    { date: 'Sun', amount: 35000 }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! You have {stats.activeBids} active bids</p>
            </div>
            <Link to="/add-funds">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Funds
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* SECTION 1: WALLET & KEY METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Wallet Balance"
            value={`₹${stats.walletBalance.toLocaleString('en-IN')}`}
            icon={Wallet}
            color="blue"
            subtext="Available to bid"
            onClick={() => console.log('wallet')}
          />
          <KPICard
            title="Active Bids"
            value={stats.activeBids}
            icon={Target}
            color="purple"
            subtext="Currently placed"
            trend={stats.activeBids > 5 ? 15 : -5}
            trendDirection={stats.activeBids > 5 ? 'up' : 'down'}
          />
          <KPICard
            title="Won Auctions"
            value={stats.wonAuctions}
            icon={Crown}
            color="amber"
            subtext="Lifetime"
            comparison="34 items purchased"
          />
          <KPICard
            title="Win Rate"
            value={`${stats.winRate}%`}
            icon={TrendingUp}
            color="green"
            subtext="vs category avg 28%"
            trend={6}
            trendDirection="up"
          />
        </div>

        {/* SECTION 2: ACTIVE BIDS - HERO SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Active Bids</h2>
              <p className="text-gray-600 text-sm mt-1">Real-time bid updates • {stats.activeBids} items</p>
            </div>
            <Link to="/bids/active" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Active Bids Grid - Horizontal Scroll on Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeBids.map(bid => (
              <AuctionCard
                key={bid.id}
                type="buyer"
                id={bid.id}
                title={bid.title}
                image={bid.image}
                currentBid={bid.currentBid}
                myBid={bid.myBid}
                timeLeft={bid.timeLeft}
                timeLeftMs={bid.timeLeftMs}
                status={bid.status}
                bidCount={bid.bidCount}
                viewCount={bid.viewCount}
                onBidClick={() => console.log('bid clicked')}
              />
            ))}
          </div>
        </div>

        {/* SECTION 3: WON AUCTIONS & RECOMMENDATIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Won Auctions */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recent Wins</h2>
                <p className="text-gray-600 text-sm mt-1">Items won in recent auctions</p>
              </div>
              <Link to="/wins/all" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Won Auctions Cards */}
            <div className="space-y-3">
              {wonAuctions.map(item => (
                <Card key={item.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-green-500">
                  <div className="flex gap-4">
                    <img src={item.image} alt={item.title} className="w-20 h-20 rounded object-cover" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <StatusBadge
                          status={item.status === 'payment_pending' ? 'warning' : item.status === 'paid' ? 'success' : 'completed'}
                          size="sm"
                        />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{item.wonDate} • {item.sellerName}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-gray-900">₹{item.finalPrice.toLocaleString('en-IN')}</span>
                        {item.status === 'payment_pending' && (
                          <Button className="bg-blue-600 text-white text-xs py-1 h-8">Pay Now</Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">For You</h2>
            </div>
            <p className="text-gray-600 text-sm">AI-powered recommendations</p>

            <div className="space-y-3">
              {recommendations.map(rec => (
                <Card key={rec.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <img src={rec.image} alt={rec.title} className="w-full h-24 rounded object-cover mb-3" />
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{rec.title}</h3>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ml-2">
                      {rec.confidence}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{rec.reason}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">₹{rec.price.toLocaleString('en-IN')}</span>
                    <Button className="bg-blue-600 text-white text-xs py-1 h-7 px-3">Watch</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 4: ANALYTICS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending Trend */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Spending This Week</h3>
            <div className="h-48 flex items-end justify-between gap-2">
              {spendingTrend.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-blue-200 rounded-t hover:bg-blue-300 transition-colors" style={{ height: `${(item.amount / 50000) * 100}%` }} />
                  <span className="text-xs text-gray-600">{item.date}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-4">₹1,91,000 total this week</p>
          </Card>

          {/* Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Your Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <span className="text-gray-700">Total Spent (Lifetime)</span>
                <span className="font-bold text-lg">₹{stats.totalSpent.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <span className="text-gray-700">Total Bids Placed</span>
                <span className="font-bold text-lg">{stats.totalBidsPlaced}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Avg Time to Complete</span>
                <span className="font-bold text-lg">{stats.responseTime} days</span>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
