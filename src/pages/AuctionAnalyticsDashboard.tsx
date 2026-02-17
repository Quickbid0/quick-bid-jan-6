import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  Gavel,
  DollarSign,
  Eye,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Target,
  Zap
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock analytics data
const mockAnalytics = {
  overview: {
    totalAuctions: 1247,
    activeAuctions: 89,
    totalBids: 15632,
    totalUsers: 5432,
    totalRevenue: 89200000,
    avgBidAmount: 5700
  },
  trends: {
    dailyBids: [120, 145, 132, 158, 167, 189, 201, 178, 195, 210, 225, 240],
    dailyRevenue: [45000, 52000, 48000, 61000, 67000, 72000, 78000, 65000, 73000, 79000, 85000, 92000],
    userGrowth: [120, 135, 148, 162, 178, 195, 213, 232, 252, 273, 295, 318]
  },
  topCategories: [
    { name: 'Vehicles', auctions: 342, bids: 5234, revenue: 45600000 },
    { name: 'Jewelry', auctions: 189, bids: 3124, revenue: 23400000 },
    { name: 'Art & Paintings', auctions: 156, bids: 2890, revenue: 18900000 },
    { name: 'Industrial Equipment', auctions: 98, bids: 1456, revenue: 1340000 }
  ],
  recentActivity: [
    { time: '2 min ago', event: 'New bid on BMW X5', amount: 2850000, user: 'Rahul S.' },
    { time: '5 min ago', event: 'Auction ended', item: 'Vintage Rolex', finalBid: 125000 },
    { time: '8 min ago', event: 'New user registered', user: 'Priya M.' },
    { time: '12 min ago', event: 'High-value bid', amount: 890000, item: 'Diamond Necklace' },
    { time: '15 min ago', event: 'Auction started', item: 'Tesla Model S', startingBid: 4500000 }
  ]
};

const AuctionAnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-IN').format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Track your auction performance and user engagement</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
}
}
}
          >
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Gavel className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Auctions</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(mockAnalytics.overview.totalAuctions)}</p>
                </div>
              </div>
            </Card>
          </div>

          <div
}
}
}
          >
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockAnalytics.overview.totalRevenue)}</p>
                </div>
              </div>
            </Card>
          </div>

          <div
}
}
}
          >
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(mockAnalytics.overview.totalUsers)}</p>
                </div>
              </div>
            </Card>
          </div>

          <div
}
}
}
          >
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Bid Amount</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockAnalytics.overview.avgBidAmount)}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Bid Trends */}
          <div
}
}
}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Daily Bids</h3>
                <Badge className="bg-green-100 text-green-800">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% vs last week
                </Badge>
              </div>
              <div className="h-64 flex items-end justify-between space-x-2">
                {mockAnalytics.trends.dailyBids.map((value, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="bg-blue-500 rounded-t w-8 transition-all duration-300 hover:bg-blue-600"
                      style={{ height: `${(value / 250) * 200}px` }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-2">{index + 1}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Revenue Trends */}
          <div
}
}
}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
                <Badge className="bg-green-100 text-green-800">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +18% vs last week
                </Badge>
              </div>
              <div className="h-64 flex items-end justify-between space-x-2">
                {mockAnalytics.trends.dailyRevenue.map((value, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="bg-green-500 rounded-t w-8 transition-all duration-300 hover:bg-green-600"
                      style={{ height: `${(value / 100000) * 200}px` }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-2">{index + 1}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Category Performance & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Categories */}
          <div
}
}
}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Categories</h3>
              <div className="space-y-4">
                {mockAnalytics.topCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      <p className="text-sm text-gray-600">{category.auctions} auctions</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(category.revenue)}</p>
                      <p className="text-sm text-gray-600">{category.bids} bids</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <div
}
}
}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {mockAnalytics.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {activity.event.includes('bid') && <Gavel className="h-5 w-5 text-blue-500" />}
                      {activity.event.includes('auction') && <Clock className="h-5 w-5 text-orange-500" />}
                      {activity.event.includes('user') && <Users className="h-5 w-5 text-green-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.event}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                      {activity.amount && (
                        <p className="text-sm font-semibold text-green-600">{formatCurrency(activity.amount)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionAnalyticsDashboard;
