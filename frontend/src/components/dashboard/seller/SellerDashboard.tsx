// src/components/dashboard/seller/SellerDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Plus,
  Eye,
  Star
} from 'lucide-react';

interface SellerDashboardProps {
  user: User;
  products: Product[];
  activeAuctions: Auction[];
  recentSales: Sale[];
  deposit: DepositStatus;
  performance: SellerPerformance;
}

interface Product {
  id: string;
  title: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'live' | 'sold' | 'rejected';
  views: number;
  bids: number;
  currentPrice: number;
  reservePrice: number;
  imageUrl: string;
  createdAt: Date;
}

interface Auction {
  id: string;
  productId: string;
  productTitle: string;
  currentBid: number;
  bidders: number;
  timeLeft: number;
  status: 'scheduled' | 'live' | 'ended';
}

interface Sale {
  id: string;
  productTitle: string;
  finalPrice: number;
  buyerName: string;
  soldAt: Date;
  status: 'pending_payment' | 'payment_received' | 'delivered';
}

interface DepositStatus {
  status: 'not_required' | 'pending' | 'paid' | 'refunded';
  amount: number;
  refundableDate?: Date;
  progress: number;
}

interface SellerPerformance {
  totalRevenue: number;
  totalSales: number;
  successRate: number;
  averageSalePrice: number;
  revenueData: Array<{ month: string; revenue: number }>;
  productMetrics: {
    totalListed: number;
    totalSold: number;
    averageViews: number;
    averageBids: number;
  };
  aiSuggestions: AISuggestion[];
}

interface AISuggestion {
  type: 'pricing' | 'timing' | 'description';
  suggestion: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({
  user,
  products,
  activeAuctions,
  recentSales,
  deposit,
  performance,
}) => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Seller Dashboard 👨‍💼
            </h1>
            <p className="text-green-100">
              Track your auctions, monitor performance, and maximize your sales.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold">₹{performance.totalRevenue.toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Revenue</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`₹${performance.totalRevenue.toLocaleString()}`}
          subtitle={`${performance.totalSales} sales completed`}
          icon={DollarSign}
          color="green"
          trend={{ value: 12.5, label: 'vs last month' }}
        />

        <MetricCard
          title="Active Auctions"
          value={activeAuctions.length.toString()}
          subtitle={`${activeAuctions.filter(a => a.status === 'live').length} currently live`}
          icon={Package}
          color="blue"
          action={{ label: 'View Auctions', onClick: () => navigate('/auctions/my') }}
        />

        <MetricCard
          title="Success Rate"
          value={`${performance.successRate}%`}
          subtitle={`${performance.productMetrics.totalSold}/${performance.productMetrics.totalListed} products sold`}
          icon={TrendingUp}
          color="purple"
          trend={{ value: 8.2, label: 'vs last month' }}
        />

        <MetricCard
          title="Deposit Status"
          value={deposit.status === 'paid' ? 'Secured' : deposit.status === 'refunded' ? 'Refunded' : 'Required'}
          subtitle={deposit.status === 'paid' ? `₹${deposit.amount} paid` : 'Complete to list items'}
          icon={deposit.status === 'paid' ? CheckCircle : Clock}
          color={deposit.status === 'paid' ? 'green' : 'yellow'}
          action={deposit.status !== 'paid' ? {
            label: 'Pay Deposit',
            onClick: () => navigate('/seller/deposit')
          } : undefined}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Auctions & Products */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Auctions */}
          <ActiveAuctionsCard
            auctions={activeAuctions}
            onCreateAuction={() => navigate('/sell')}
            onViewAuction={(auctionId) => navigate(`/auctions/${auctionId}`)}
          />

          {/* Recent Sales */}
          <RecentSalesCard
            sales={recentSales}
            onViewSale={(saleId) => navigate(`/sales/${saleId}`)}
            onViewAll={() => navigate('/sales')}
          />

          {/* Revenue Analytics */}
          <RevenueAnalyticsCard
            data={performance.revenueData}
            period={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
        </div>

        {/* Right Column - Performance & AI */}
        <div className="space-y-6">
          {/* Performance Overview */}
          <PerformanceOverviewCard
            performance={performance}
            onViewAnalytics={() => navigate('/analytics')}
          />

          {/* AI Price Suggestions */}
          <AIPriceSuggestionsCard
            suggestions={performance.aiSuggestions}
            onApplySuggestion={(suggestion) => {
              // Handle AI suggestion application
              console.log('Applying AI suggestion:', suggestion);
            }}
          />

          {/* Quick Actions */}
          <QuickActionsCard
            actions={[
              {
                icon: 'plus',
                label: 'List New Item',
                description: 'Create a new auction',
                onClick: () => navigate('/sell'),
                primary: true,
              },
              {
                icon: 'bar-chart-3',
                label: 'View Analytics',
                description: 'Detailed performance metrics',
                onClick: () => navigate('/analytics'),
              },
              {
                icon: 'package',
                label: 'Manage Inventory',
                description: 'View all your products',
                onClick: () => navigate('/products'),
              },
              {
                icon: 'star',
                label: 'Reviews & Ratings',
                description: 'See buyer feedback',
                onClick: () => navigate('/reviews'),
              },
            ]}
          />

          {/* Deposit Tracker */}
          <DepositTrackerCard
            deposit={deposit}
            onPayDeposit={() => navigate('/seller/deposit')}
            onViewStatus={() => navigate('/seller/deposit/status')}
          />
        </div>
      </div>
    </div>
  );
};

// Active Auctions Card
const ActiveAuctionsCard: React.FC<{
  auctions: Auction[];
  onCreateAuction: () => void;
  onViewAuction: (auctionId: string) => void;
}> = ({ auctions, onCreateAuction, onViewAuction }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Active Auctions</h2>
        <p className="text-sm text-gray-500">
          {auctions.length} auctions currently running
        </p>
      </div>
      <button
        onClick={onCreateAuction}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        New Auction
      </button>
    </div>

    {auctions.length === 0 ? (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Auctions</h3>
        <p className="text-gray-500 mb-4">Create your first auction to start selling</p>
        <button
          onClick={onCreateAuction}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create Auction
        </button>
      </div>
    ) : (
      <div className="space-y-4">
        {auctions.map((auction) => (
          <div key={auction.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <img
              src={`/api/products/${auction.productId}/image`} // Placeholder
              alt={auction.productTitle}
              className="w-16 h-16 object-cover rounded-lg"
            />

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{auction.productTitle}</h3>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-gray-500">
                  Current: ₹{auction.currentBid.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500">
                  {auction.bidders} bidders
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <AuctionStatusBadge status={auction.status} />
                <TimeLeftDisplay timeLeft={auction.timeLeft} />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <button
                onClick={() => onViewAuction(auction.id)}
                className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
              >
                View Auction
              </button>
              <button className="text-gray-600 hover:text-gray-800 text-sm">
                Edit Details
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Auction Status Badge
const AuctionStatusBadge: React.FC<{ status: Auction['status'] }> = ({ status }) => {
  const configs = {
    scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
    live: { label: 'Live', color: 'bg-green-100 text-green-800' },
    ended: { label: 'Ended', color: 'bg-gray-100 text-gray-800' },
  };

  const config = configs[status];

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

// Time Left Display
const TimeLeftDisplay: React.FC<{ timeLeft: number }> = ({ timeLeft }) => {
  const formatTime = (seconds: number) => {
    if (seconds <= 0) return 'Ended';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) return `${hours}h ${minutes}m left`;
    if (minutes > 0) return `${minutes}m left`;
    return `${seconds}s left`;
  };

  const isUrgent = timeLeft <= 600; // 10 minutes

  return (
    <span className={`text-sm ${isUrgent ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
      {formatTime(timeLeft)}
    </span>
  );
};

// Recent Sales Card
const RecentSalesCard: React.FC<{
  sales: Sale[];
  onViewSale: (saleId: string) => void;
  onViewAll: () => void;
}> = ({ sales, onViewSale, onViewAll }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Recent Sales</h2>
        <p className="text-sm text-gray-500">
          Your latest completed transactions
        </p>
      </div>
      <button
        onClick={onViewAll}
        className="text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        View All
      </button>
    </div>

    {sales.length === 0 ? (
      <div className="text-center py-8">
        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No sales yet</p>
      </div>
    ) : (
      <div className="space-y-4">
        {sales.slice(0, 3).map((sale) => (
          <div key={sale.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{sale.productTitle}</h3>
                <p className="text-sm text-gray-500">
                  Sold to {sale.buyerName} • {new Date(sale.soldAt).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-green-600">
                    ₹{sale.finalPrice.toLocaleString()}
                  </span>
                  <SaleStatusBadge status={sale.status} />
                </div>
              </div>
            </div>

            <button
              onClick={() => onViewSale(sale.id)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Sale Status Badge
const SaleStatusBadge: React.FC<{ status: Sale['status'] }> = ({ status }) => {
  const configs = {
    pending_payment: { label: 'Payment Pending', color: 'bg-yellow-100 text-yellow-800' },
    payment_received: { label: 'Payment Received', color: 'bg-blue-100 text-blue-800' },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  };

  const config = configs[status];

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

export default SellerDashboard;
