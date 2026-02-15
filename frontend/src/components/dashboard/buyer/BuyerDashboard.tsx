// src/components/dashboard/buyer/BuyerDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Tag,
  Eye,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';

interface BuyerDashboardProps {
  user: User;
  wallet: WalletData;
  activeBids: AuctionBid[];
  kycStatus: KYCStatus;
  notifications: Notification[];
}

interface WalletData {
  balance: number;
  escrowBalance: number;
  availableBalance: number;
  recentTransactions: Transaction[];
}

interface AuctionBid {
  id: string;
  auctionId: string;
  auctionTitle: string;
  currentBid: number;
  myBid: number;
  status: 'winning' | 'outbid' | 'ended';
  timeLeft: number;
  imageUrl: string;
}

interface KYCStatus {
  status: 'not_started' | 'pending' | 'verified' | 'rejected';
  completionPercentage: number;
  nextSteps: string[];
}

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
}

const BuyerDashboard: React.FC<BuyerDashboardProps> = ({
  user,
  wallet,
  activeBids,
  kycStatus,
  notifications,
}) => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user.name}! 👋
            </h1>
            <p className="text-blue-100">
              Ready to find your next vehicle? Check out your active bids and wallet balance.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold">₹{wallet.balance.toLocaleString()}</div>
                <div className="text-sm opacity-90">Available Balance</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Wallet Balance"
          value={`₹${wallet.availableBalance.toLocaleString()}`}
          subtitle={`Escrow: ₹${wallet.escrowBalance.toLocaleString()}`}
          icon={Wallet}
          color="blue"
          action={{ label: 'Add Funds', onClick: () => navigate('/wallet') }}
        />

        <MetricCard
          title="Active Bids"
          value={activeBids.length.toString()}
          subtitle={`${activeBids.filter(b => b.status === 'winning').length} winning`}
          icon={Tag}
          color="green"
          action={{ label: 'View Bids', onClick: () => navigate('/bids') }}
        />

        <MetricCard
          title="KYC Status"
          value={kycStatus.status === 'verified' ? 'Verified' : 'In Progress'}
          subtitle={`${kycStatus.completionPercentage}% complete`}
          icon={kycStatus.status === 'verified' ? CheckCircle : Clock}
          color={kycStatus.status === 'verified' ? 'green' : 'yellow'}
          action={{
            label: kycStatus.status === 'verified' ? 'View Details' : 'Complete KYC',
            onClick: () => navigate('/profile')
          }}
        />

        <MetricCard
          title="Notifications"
          value={notifications.length.toString()}
          subtitle={`${notifications.filter(n => !n.read).length} unread`}
          icon={AlertCircle}
          color="purple"
          action={{ label: 'View All', onClick: () => navigate('/notifications') }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Active Bids & Watchlist */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Bids */}
          <ActiveBidsCard
            bids={activeBids}
            onViewAll={() => navigate('/bids')}
            onBidAgain={(auctionId) => navigate(`/auctions/${auctionId}`)}
          />

          {/* Auction Heat Meter */}
          <AuctionHeatMeter
            period={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />

          {/* Bid Success Analytics */}
          <BidAnalyticsCard
            period={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
        </div>

        {/* Right Column - Wallet & KYC */}
        <div className="space-y-6">
          {/* Wallet Balance Card */}
          <WalletBalanceCard
            wallet={wallet}
            onAddFunds={() => navigate('/wallet')}
            onViewTransactions={() => navigate('/wallet/transactions')}
          />

          {/* KYC Progress Tracker */}
          <KYCProgressTracker
            status={kycStatus}
            onComplete={() => navigate('/profile/kyc')}
            onViewStatus={() => navigate('/profile')}
          />

          {/* Trust Score Card */}
          <TrustScoreCard
            score={user.trustScore || 0}
            level={user.trustLevel || 'basic'}
            badges={user.badges || []}
          />

          {/* Quick Actions */}
          <QuickActionsCard
            actions={[
              {
                icon: 'search',
                label: 'Browse Auctions',
                description: 'Find your next vehicle',
                onClick: () => navigate('/auctions'),
                primary: true,
              },
              {
                icon: 'heart',
                label: 'My Watchlist',
                description: 'Saved auctions',
                onClick: () => navigate('/watchlist'),
              },
              {
                icon: 'dollar-sign',
                label: 'EMI Calculator',
                description: 'Check financing options',
                onClick: () => navigate('/emi-calculator'),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
  action?: {
    label: string;
    onClick: () => void;
  };
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  action,
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <div className={`p-6 rounded-xl border ${colorClasses[color]} transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className="h-8 w-8 opacity-75" />
        {action && (
          <button
            onClick={action.onClick}
            className="text-sm font-medium hover:underline"
          >
            {action.label}
          </button>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm font-medium opacity-90">{title}</div>
        <div className="text-xs opacity-75">{subtitle}</div>
      </div>
    </div>
  );
};

// Active Bids Card
const ActiveBidsCard: React.FC<{
  bids: AuctionBid[];
  onViewAll: () => void;
  onBidAgain: (auctionId: string) => void;
}> = ({ bids, onViewAll, onBidAgain }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Active Bids</h2>
        <p className="text-sm text-gray-500">
          {bids.length} auctions you're bidding on
        </p>
      </div>
      <button
        onClick={onViewAll}
        className="text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        View All
      </button>
    </div>

    {bids.length === 0 ? (
      <div className="text-center py-12">
        <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Bids</h3>
        <p className="text-gray-500 mb-4">Start bidding on auctions to track them here</p>
        <button
          onClick={() => navigate('/auctions')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Browse Auctions
        </button>
      </div>
    ) : (
      <div className="space-y-4">
        {bids.slice(0, 3).map((bid) => (
          <div key={bid.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <img
              src={bid.imageUrl}
              alt={bid.auctionTitle}
              className="w-16 h-16 object-cover rounded-lg"
            />

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{bid.auctionTitle}</h3>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-gray-500">
                  Current: ₹{bid.currentBid.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500">
                  Your bid: ₹{bid.myBid.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <StatusBadge status={bid.status} />
                <TimeLeft timeLeft={bid.timeLeft} />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <button
                onClick={() => onBidAgain(bid.auctionId)}
                className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
              >
                Bid Again
              </button>
              <button className="text-gray-600 hover:text-gray-800 text-sm">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Status Badge Component
const StatusBadge: React.FC<{ status: AuctionBid['status'] }> = ({ status }) => {
  const configs = {
    winning: { label: 'Winning', color: 'bg-green-100 text-green-800' },
    outbid: { label: 'Outbid', color: 'bg-red-100 text-red-800' },
    ended: { label: 'Ended', color: 'bg-gray-100 text-gray-800' },
  };

  const config = configs[status];

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

// Time Left Component
const TimeLeft: React.FC<{ timeLeft: number }> = ({ timeLeft }) => {
  const formatTime = (seconds: number) => {
    if (seconds <= 0) return 'Ended';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const isUrgent = timeLeft <= 600; // 10 minutes

  return (
    <span className={`text-sm ${isUrgent ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
      {formatTime(timeLeft)}
    </span>
  );
};

export default BuyerDashboard;
