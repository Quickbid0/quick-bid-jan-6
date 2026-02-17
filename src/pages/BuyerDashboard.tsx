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
  AlertCircle,
  Eye,
  Star,
  Sparkles,
  Target,
  Award,
  Zap,
  ArrowUp,
  ArrowDown,
  Activity,
  PieChart,
  BarChart3,
  Users,
  Crown
} from 'lucide-react';

// =============================================================================
// ELITE BUYER DASHBOARD - Series B Ready
// Minimal but Data Powerful + Large KPI Cards + Smooth Animations + AI Insights
// =============================================================================

interface BuyerStats {
  walletBalance: number;
  activeBids: number;
  wonAuctions: number;
  totalSpent: number;
  savedItems: number;
  winRate: number;
  avgBidAmount: number;
  totalBidsPlaced: number;
}

interface ActiveBid {
  id: string;
  auctionTitle: string;
  currentBid: number;
  myBid: number;
  timeLeft: string;
  status: 'winning' | 'outbid' | 'leading';
  image: string;
  category: string;
}

interface WonAuction {
  id: string;
  title: string;
  finalPrice: number;
  wonDate: string;
  status: 'payment_pending' | 'paid' | 'delivered';
  image: string;
}

interface AISuggestion {
  id: string;
  type: 'bid' | 'save' | 'budget';
  title: string;
  description: string;
  action: string;
  impact: string;
  confidence: number;
}

export default function EliteBuyerDashboard() {
  const [stats, setStats] = useState<BuyerStats>({
    walletBalance: 0,
    activeBids: 0,
    wonAuctions: 0,
    totalSpent: 0,
    savedItems: 0,
    winRate: 0,
    avgBidAmount: 0,
    totalBidsPlaced: 0
  });

  const [activeBids, setActiveBids] = useState<ActiveBid[]>([]);
  const [wonAuctions, setWonAuctions] = useState<WonAuction[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'bids' | 'wins' | 'analytics'>('overview');

  useEffect(() => {
    fetchBuyerData();
  }, []);

  const fetchBuyerData = async () => {
    try {
      setLoading(true);

      // Simulate API call with enhanced data
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStats({
        walletBalance: 125000,
        activeBids: 7,
        wonAuctions: 12,
        totalSpent: 450000,
        savedItems: 23,
        winRate: 63,
        avgBidAmount: 28500,
        totalBidsPlaced: 156
      });

      setActiveBids([
        {
          id: '1',
          auctionTitle: 'BMW X5 2020 Premium Luxury SUV',
          currentBid: 2850000,
          myBid: 2850000,
          timeLeft: '2h 30m',
          status: 'leading',
          image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=200&q=80',
          category: 'Vehicles'
        },
        {
          id: '2',
          auctionTitle: 'Handmade Ceramic Vase Collection',
          currentBid: 25000,
          myBid: 22000,
          timeLeft: '45m',
          status: 'outbid',
          image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=200&q=80',
          category: 'Art'
        },
        {
          id: '3',
          auctionTitle: 'Rolex Submariner Watch',
          currentBid: 850000,
          myBid: 850000,
          timeLeft: '1h 15m',
          status: 'winning',
          image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=200&q=80',
          category: 'Jewelry'
        }
      ]);

      setWonAuctions([
        {
          id: '1',
          title: 'Antique Grandfather Clock',
          finalPrice: 125000,
          wonDate: '2024-01-10',
          status: 'delivered',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
        },
        {
          id: '2',
          title: 'BMW X5 Vehicle',
          finalPrice: 2850000,
          wonDate: '2024-01-08',
          status: 'payment_pending',
          image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=200&q=80'
        }
      ]);

      setAiSuggestions([
        {
          id: '1',
          type: 'bid',
          title: 'High-Value Opportunity',
          description: 'Rare vintage guitar auction matches your interests. Win rate: 89%',
          action: 'Bid Now',
          impact: '+₹150K potential value',
          confidence: 89
        },
        {
          id: '2',
          type: 'budget',
          title: 'Optimize Bidding Strategy',
          description: 'Your average bid is ₹28.5K. Consider smaller increments for better win rates.',
          action: 'View Strategy',
          impact: '15% higher win rate',
          confidence: 76
        },
        {
          id: '3',
          type: 'save',
          title: 'Designer Handbag Collection',
          description: 'Premium collection ending soon. Matches your saved searches.',
          action: 'Save Item',
          impact: 'Limited availability',
          confidence: 92
        }
      ]);

    } catch (error) {
      console.error('Error loading buyer dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getBidStatusColor = (status: string) => {
    switch (status) {
      case 'winning': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'leading': return 'text-primary-600 bg-primary-50 border-primary-200';
      case 'outbid': return 'text-error-600 bg-error-50 border-error-200';
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  const getBidStatusIcon = (status: string) => {
    switch (status) {
      case 'winning': return Crown;
      case 'leading': return Target;
      case 'outbid': return AlertCircle;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Elite Navigation */}
      <nav className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-2xl font-bold text-primary-600">
                QuickMela
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => setActiveView('overview')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-250 ${
                    activeView === 'overview'
                      ? 'bg-primary-600 text-white'
                      : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveView('bids')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-250 ${
                    activeView === 'bids'
                      ? 'bg-primary-600 text-white'
                      : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  Active Bids
                </button>
                <button
                  onClick={() => setActiveView('wins')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-250 ${
                    activeView === 'wins'
                      ? 'bg-primary-600 text-white'
                      : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  Won Auctions
                </button>
                <button
                  onClick={() => setActiveView('analytics')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-250 ${
                    activeView === 'analytics'
                      ? 'bg-primary-600 text-white'
                      : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  Analytics
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-700">
                    ₹{stats.walletBalance.toLocaleString()}
                  </span>
                </div>
              </div>
              <button className="bg-primary-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-700 transition-all duration-250">
                Add Funds
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'overview' && (
          <div className="space-y-8">
            {/* Hero Welcome */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Welcome back, Champion! 🏆</h1>
                  <p className="text-primary-100 text-lg">You've won {stats.wonAuctions} auctions and saved ₹{(stats.totalSpent * 0.3).toLocaleString()}</p>
                </div>
                <div className="hidden md:block">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold">{stats.winRate}%</div>
                    <div className="text-sm text-primary-100">Win Rate</div>
                  </div>
                </div>
              </div>
            </div>

            {/* LARGE KPI CARDS - Elite Feature */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Wallet Balance',
                  value: stats.walletBalance,
                  change: '+₹12,500',
                  changeType: 'positive',
                  icon: Wallet,
                  color: 'emerald'
                },
                {
                  title: 'Active Bids',
                  value: stats.activeBids,
                  change: `${stats.activeBids} auctions`,
                  changeType: 'neutral',
                  icon: Gavel,
                  color: 'primary'
                },
                {
                  title: 'Won Auctions',
                  value: stats.wonAuctions,
                  change: '+2 this month',
                  changeType: 'positive',
                  icon: Crown,
                  color: 'amber'
                },
                {
                  title: 'Total Spent',
                  value: stats.totalSpent,
                  change: '₹4.5L invested',
                  changeType: 'neutral',
                  icon: TrendingUp,
                  color: 'purple'
                }
              ].map((kpi, index) => (
                <div
                  key={kpi.title}
                  className="bg-white rounded-2xl p-6 shadow-xl border border-neutral-200 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-${kpi.color}-100`}>
                      <kpi.icon className={`w-6 h-6 text-${kpi.color}-600`} />
                    </div>
                    {kpi.changeType === 'positive' && (
                      <div className="flex items-center gap-1 text-emerald-600 text-sm">
                        <ArrowUp className="w-3 h-3" />
                        <span className="font-medium">{kpi.change}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-3xl font-bold text-neutral-900 mb-1">
                      {kpi.title.includes('Spent') || kpi.title.includes('Balance')
                        ? `₹${kpi.value.toLocaleString()}`
                        : kpi.value.toLocaleString()
                      }
                    </div>
                    <div className="text-neutral-600 font-medium">{kpi.title}</div>
                    {kpi.changeType === 'neutral' && (
                      <div className="text-sm text-neutral-500 mt-1">{kpi.change}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* AI Suggestions Card - Elite Feature */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-neutral-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-primary-100 rounded-xl p-3">
                  <Sparkles className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">AI-Powered Insights</h2>
                  <p className="text-neutral-600">Personalized recommendations to improve your auction success</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {aiSuggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.id}
                    className={`rounded-xl p-6 border-2 transition-all duration-250 hover:shadow-lg ${
                      suggestion.type === 'bid'
                        ? 'border-primary-200 bg-primary-50 hover:border-primary-300'
                        : suggestion.type === 'save'
                        ? 'border-emerald-200 bg-emerald-50 hover:border-emerald-300'
                        : 'border-amber-200 bg-amber-50 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg ${
                        suggestion.type === 'bid'
                          ? 'bg-primary-200'
                          : suggestion.type === 'save'
                          ? 'bg-emerald-200'
                          : 'bg-amber-200'
                      }`}>
                        {suggestion.type === 'bid' && <Target className="w-4 h-4 text-primary-700" />}
                        {suggestion.type === 'save' && <Heart className="w-4 h-4 text-emerald-700" />}
                        {suggestion.type === 'budget' && <TrendingUp className="w-4 h-4 text-amber-700" />}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-neutral-500 mb-1">Confidence</div>
                        <div className={`text-sm font-bold ${
                          suggestion.confidence > 85 ? 'text-emerald-600' :
                          suggestion.confidence > 70 ? 'text-amber-600' : 'text-neutral-600'
                        }`}>
                          {suggestion.confidence}%
                        </div>
                      </div>
                    </div>

                    <h3 className="font-semibold text-neutral-900 mb-2">{suggestion.title}</h3>
                    <p className="text-sm text-neutral-600 mb-4">{suggestion.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-neutral-500">{suggestion.impact}</div>
                      <button className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-250 ${
                        suggestion.type === 'bid'
                          ? 'bg-primary-600 text-white hover:bg-primary-700'
                          : suggestion.type === 'save'
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-amber-600 text-white hover:bg-amber-700'
                      }`}>
                        {suggestion.action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Bids Preview */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-neutral-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900">Active Bids</h2>
                <button
                  onClick={() => setActiveView('bids')}
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                >
                  View All →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {activeBids.slice(0, 3).map((bid, index) => {
                  const StatusIcon = getBidStatusIcon(bid.status);
                  return (
                    <div
                      key={bid.id}
                      className="border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-all duration-250"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <img
                          src={bid.image}
                          alt={bid.auctionTitle}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-neutral-900 mb-1 line-clamp-2">{bid.auctionTitle}</h3>
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getBidStatusColor(bid.status)}`}>
                            <StatusIcon className="w-3 h-3" />
                            {bid.status}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">Current Bid</span>
                          <span className="font-semibold text-neutral-900">{formatPrice(bid.currentBid)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">Your Bid</span>
                          <span className="font-semibold text-primary-600">{formatPrice(bid.myBid)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">Time Left</span>
                          <span className={`font-semibold ${
                            bid.timeLeft.includes('45m') ? 'text-error-600' : 'text-neutral-900'
                          }`}>
                            {bid.timeLeft}
                          </span>
                        </div>
                      </div>

                      <button className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all duration-250">
                        {bid.status === 'outbid' ? 'Bid Again' : 'View Auction'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Wins */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-neutral-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900">Recent Wins</h2>
                <button
                  onClick={() => setActiveView('wins')}
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                >
                  View All →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {wonAuctions.map((auction, index) => (
                  <div
                    key={auction.id}
                    className="flex items-center gap-6 p-6 border border-neutral-200 rounded-xl hover:shadow-lg transition-all duration-250"
                  >
                    <img
                      src={auction.image}
                      alt={auction.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral-900 mb-1">{auction.title}</h3>
                      <div className="text-sm text-neutral-600 mb-2">
                        Won on {new Date(auction.wonDate).toLocaleDateString('en-IN')}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-lg font-bold text-emerald-600">{formatPrice(auction.finalPrice)}</div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          auction.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-700'
                            : auction.status === 'paid'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {auction.status.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === 'bids' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-neutral-900">Active Bids</h1>
              <div className="text-neutral-600">{activeBids.length} auctions</div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {activeBids.map((bid, index) => {
                const StatusIcon = getBidStatusIcon(bid.status);
                return (
                  <div
                    key={bid.id}
                    className="bg-white rounded-2xl p-8 shadow-xl border border-neutral-200"
                  >
                    <div className="flex items-start gap-6">
                      <img
                        src={bid.image}
                        alt={bid.auctionTitle}
                        className="w-24 h-24 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h2 className="text-xl font-bold text-neutral-900 mb-1">{bid.auctionTitle}</h2>
                            <div className="flex items-center gap-4 text-sm text-neutral-600">
                              <span>{bid.category}</span>
                              <span>•</span>
                              <span>{bid.timeLeft} left</span>
                            </div>
                          </div>
                          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${getBidStatusColor(bid.status)}`}>
                            <StatusIcon className="w-4 h-4" />
                            <span className="font-medium capitalize">{bid.status}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          <div className="text-center">
                            <div className="text-sm text-neutral-600 mb-1">Current Bid</div>
                            <div className="text-2xl font-bold text-neutral-900">{formatPrice(bid.currentBid)}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-neutral-600 mb-1">Your Bid</div>
                            <div className="text-2xl font-bold text-primary-600">{formatPrice(bid.myBid)}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-neutral-600 mb-1">Difference</div>
                            <div className={`text-2xl font-bold ${
                              bid.myBid >= bid.currentBid ? 'text-emerald-600' : 'text-error-600'
                            }`}>
                              {bid.myBid >= bid.currentBid ? 'Leading' : `-${formatPrice(bid.currentBid - bid.myBid)}`}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <button className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all duration-250">
                            View Auction
                          </button>
                          {bid.status === 'outbid' && (
                            <button className="flex-1 border border-neutral-300 text-neutral-700 py-3 rounded-xl font-semibold hover:bg-neutral-50 transition-all duration-250">
                              Bid Again
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeView === 'wins' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-neutral-900">Won Auctions</h1>
              <div className="text-neutral-600">{wonAuctions.length} auctions</div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {wonAuctions.map((auction, index) => (
                <div
                  key={auction.id}
                  className="bg-white rounded-2xl p-8 shadow-xl border border-neutral-200"
                >
                  <div className="flex items-start gap-6">
                    <img
                      src={auction.image}
                      alt={auction.title}
                      className="w-24 h-24 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="text-xl font-bold text-neutral-900 mb-1">{auction.title}</h2>
                          <div className="text-sm text-neutral-600">
                            Won on {new Date(auction.wonDate).toLocaleDateString('en-IN')}
                          </div>
                        </div>
                        <div className={`px-4 py-2 rounded-xl text-sm font-medium ${
                          auction.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-700'
                            : auction.status === 'paid'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {auction.status.replace('_', ' ')}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-neutral-600 mb-1">Final Price</div>
                          <div className="text-2xl font-bold text-emerald-600">{formatPrice(auction.finalPrice)}</div>
                        </div>

                        <div className="flex gap-3">
                          {auction.status === 'payment_pending' && (
                            <button className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all duration-250">
                              Pay Now
                            </button>
                          )}
                          <button className="border border-neutral-300 text-neutral-700 px-6 py-3 rounded-xl font-semibold hover:bg-neutral-50 transition-all duration-250">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'analytics' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-neutral-900">Analytics & Insights</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Win Rate', value: `${stats.winRate}%`, change: '+5%', color: 'emerald' },
                { label: 'Avg Bid Amount', value: formatPrice(stats.avgBidAmount), change: '+₹2.1K', color: 'primary' },
                { label: 'Total Bids', value: stats.totalBidsPlaced.toString(), change: '+23', color: 'blue' },
                { label: 'Success Value', value: formatPrice(stats.totalSpent), change: '+₹1.2L', color: 'purple' }
              ].map((metric, index) => (
                <div
                  key={metric.label}
                  className="bg-white rounded-2xl p-6 shadow-xl border border-neutral-200 text-center"
                >
                  <div className={`text-3xl font-bold text-${metric.color}-600 mb-2`}>{metric.value}</div>
                  <div className="text-neutral-900 font-semibold mb-1">{metric.label}</div>
                  <div className="text-emerald-600 text-sm font-medium">{metric.change} this month</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl border border-neutral-200">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Performance Trends</h2>
              <div className="h-64 bg-neutral-50 rounded-xl flex items-center justify-center">
                <div className="text-center text-neutral-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                  <p>Advanced analytics chart would appear here</p>
                  <p className="text-sm">Real-time bidding performance and win rate trends</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )};
