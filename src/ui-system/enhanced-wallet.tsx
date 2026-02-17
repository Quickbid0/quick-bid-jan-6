// Enhanced Wallet UX - Gaming Excitement + Fintech Trust + SaaS Intelligence
// Premium wallet experience with animated balances, locked funds indicators, and trust messaging

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Lock,
  Unlock,
  Shield,
  CreditCard,
  Banknote,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  Sparkles,
  Crown,
  Star,
  CheckCircle,
  AlertTriangle,
  Clock,
  Target,
  Zap,
  Plus,
  Minus,
  RefreshCw,
  ChevronRight,
  DollarSign,
  PiggyBank,
  ShieldCheck,
  Fingerprint
} from 'lucide-react';

// Import enhanced design system
import { Card, Button, Container, Grid, Flex, Stack } from '../ui-system';
import { colors, getGradient, getEmotionColor } from '../ui-system/colors';
import { textStyles, getTextStyle } from '../ui-system/typography';
import { StatusBadge, TrustScore, ProgressIndicator } from '../ui-system/simplified-status';
import { OptimizedImage, LoadingSpinner } from '../ui-system/performance-mobile-trust';

// Animated Balance Counter Component
interface AnimatedBalanceProps {
  amount: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDecimals?: boolean;
  className?: string;
}

const AnimatedBalance: React.FC<AnimatedBalanceProps> = ({
  amount,
  currency = '₹',
  size = 'lg',
  showDecimals = true,
  className
}) => {
  const [displayAmount, setDisplayAmount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const duration = 1500;
    const steps = 60;
    const increment = amount / steps;
    let current = displayAmount;

    const animate = () => {
      current += increment;
      if (Math.abs(current - amount) < Math.abs(increment)) {
        setDisplayAmount(amount);
        setIsAnimating(false);
      } else {
        setDisplayAmount(current);
        setTimeout(animate, duration / steps);
      }
    };

    // Start from current value if it's close, otherwise reset
    if (Math.abs(displayAmount - amount) < amount * 0.1) {
      current = displayAmount;
    } else {
      current = 0;
    }

    animate();
  }, [amount]);

  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-6xl'
  };

  const formatAmount = (num: number) => {
    const lakhs = num / 100000;
    if (lakhs >= 1) {
      return showDecimals ? lakhs.toFixed(1) : Math.floor(lakhs);
    }
    return showDecimals ? (num / 1000).toFixed(1) : Math.floor(num / 1000);
  };

  const getSuffix = (num: number) => {
    return num >= 100000 ? 'L' : 'K';
  };

  return (
    <div
      className={`${sizeClasses[size]} font-black ${className}`}
      style={getTextStyle('fintech', 'balance')}
 : {}}
}
    >
      <span className="text-gray-600">{currency}</span>
      <span
        key={displayAmount}
}
}
}
      >
        {formatAmount(displayAmount)}
      </span>
      <span className="text-gray-500 text-lg ml-1">{getSuffix(amount)}</span>
    </div>
  );
};

// Locked Funds Visual Indicator Component
interface LockedFundsIndicatorProps {
  available: number;
  locked: number;
  escrow: number;
  total: number;
  className?: string;
}

const LockedFundsIndicator: React.FC<LockedFundsIndicatorProps> = ({
  available,
  locked,
  escrow,
  total,
  className
}) => {
  const lockedPercentage = (locked / total) * 100;
  const escrowPercentage = (escrow / total) * 100;
  const availablePercentage = (available / total) * 100;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Fund Distribution</h3>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Shield className="w-4 h-4" />
          Protected
        </div>
      </div>

      {/* Visual breakdown */}
      <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
        {/* Available funds */}
        <div
          className="absolute left-0 top-0 h-full bg-emerald-500"
}
%` }}
}
        />

        {/* Locked funds */}
        <div
          className="absolute h-full bg-orange-500"
%` }}
%`, left: `${availablePercentage}%` }}
}
        />

        {/* Escrow funds */}
        <div
          className="absolute h-full bg-blue-500"
%` }}
          animate={{
            width: `${escrowPercentage}%`,
            left: `${availablePercentage + lockedPercentage}%`
          }}
}
        />
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
          <div>
            <div className="font-medium text-gray-900">Available</div>
            <div className="text-gray-600">₹{(available / 100000).toFixed(1)}L</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <Lock className="w-4 h-4 text-orange-600" />
          <div>
            <div className="font-medium text-gray-900">Locked</div>
            <div className="text-gray-600">₹{(locked / 100000).toFixed(1)}L</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <Shield className="w-4 h-4 text-blue-600" />
          <div>
            <div className="font-medium text-gray-900">Escrow</div>
            <div className="text-gray-600">₹{(escrow / 100000).toFixed(1)}L</div>
          </div>
        </div>
      </div>

      {/* Gaming-style locked funds animation */}
      {locked > 0 && (
        <div
}
}
}
          className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div
}
}
            >
              <Lock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="font-medium text-orange-900">Funds Locked for Bidding</div>
              <div className="text-sm text-orange-700">
                ₹{(locked / 100000).toFixed(1)}L reserved in active auctions
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trust messaging for escrow */}
      {escrow > 0 && (
        <div
}
}
}
          className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div
}
}
            >
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-blue-900">Securely Held in Escrow</div>
              <div className="text-sm text-blue-700">
                ₹{(escrow / 100000).toFixed(1)}L protected by bank-grade security
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Trust Messaging Component
interface TrustMessagingProps {
  className?: string;
}

const TrustMessaging: React.FC<TrustMessagingProps> = ({ className }) => {
  const trustMessages = [
    {
      icon: Shield,
      title: "Bank-Grade Security",
      description: "Your funds are protected by 256-bit SSL encryption and RBI-compliant security protocols.",
      color: "emerald"
    },
    {
      icon: CheckCircle,
      title: "Instant Verification",
      description: "All transactions are verified in real-time with AI-powered fraud detection.",
      color: "blue"
    },
    {
      icon: Fingerprint,
      title: "Biometric Protection",
      description: "Advanced biometric authentication ensures only you can access your funds.",
      color: "purple"
    },
    {
      icon: PiggyBank,
      title: "FDIC Insured",
      description: "Your deposits are insured up to ₹5 lakhs by the Deposit Insurance Corporation.",
      color: "orange"
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-emerald-600" />
        <h3 className="text-lg font-semibold text-gray-900">Trust & Security</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trustMessages.map((message, index) => (
          <div
            key={message.title}
}
}
}
            className={`p-4 bg-gradient-to-br from-${message.color}-50 to-${message.color}-100 border border-${message.color}-200 rounded-lg`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 bg-${message.color}-100 rounded-lg`}>
                <message.icon className={`w-5 h-5 text-${message.color}-600`} />
              </div>
              <div>
                <h4 className={`font-semibold text-${message.color}-900 mb-1`}>
                  {message.title}
                </h4>
                <p className={`text-sm text-${message.color}-700`}>
                  {message.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced Transaction History with Gaming Elements
interface TransactionHistoryProps {
  transactions: Array<{
    id: string;
    type: 'credit' | 'debit' | 'locked' | 'unlocked';
    amount: number;
    description: string;
    timestamp: Date;
    status: 'completed' | 'pending' | 'failed';
    auctionId?: string;
  }>;
  className?: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions, className }) => {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit': return ArrowDownLeft;
      case 'debit': return ArrowUpRight;
      case 'locked': return Lock;
      case 'unlocked': return Unlock;
      default: return DollarSign;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'credit': return 'text-emerald-600 bg-emerald-100';
      case 'debit': return 'text-red-600 bg-red-100';
      case 'locked': return 'text-orange-600 bg-orange-100';
      case 'unlocked': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-700 bg-emerald-100';
      case 'pending': return 'text-yellow-700 bg-yellow-100';
      case 'failed': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-2" />
          View All
        </Button>
      </div>

      <div className="space-y-3">
        {transactions.map((transaction, index) => {
          const Icon = getTransactionIcon(transaction.type);
          return (
            <div
              key={transaction.id}
}
}
}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getTransactionColor(transaction.type)}`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div>
                  <div className="font-medium text-gray-900">{transaction.description}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {transaction.timestamp.toLocaleDateString()}
                    </span>
                    <StatusBadge
                      status={transaction.status}
                      size="sm"
                    />
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className={`font-bold ${
                  transaction.type === 'credit' ? 'text-emerald-600' :
                  transaction.type === 'debit' ? 'text-red-600' :
                  'text-gray-900'
                }`}>
                  {transaction.type === 'credit' ? '+' : transaction.type === 'debit' ? '-' : ''}
                  ₹{(transaction.amount / 100000).toFixed(1)}L
                </div>
                {transaction.auctionId && (
                  <div className="text-xs text-gray-500">
                    Auction #{transaction.auctionId}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Enhanced Wallet Component
export const EnhancedWallet: React.FC = () => {
  const [walletData, setWalletData] = useState({
    available: 2450000,
    locked: 350000,
    escrow: 1200000,
    total: 4000000,
    transactions: [
      {
        id: '1',
        type: 'credit' as const,
        amount: 500000,
        description: 'Funds Added',
        timestamp: new Date(Date.now() - 3600000),
        status: 'completed' as const
      },
      {
        id: '2',
        type: 'locked' as const,
        amount: 350000,
        description: 'Bid Locked - BMW X5 Auction',
        timestamp: new Date(Date.now() - 7200000),
        status: 'completed' as const,
        auctionId: 'A001'
      },
      {
        id: '3',
        type: 'debit' as const,
        amount: 1200000,
        description: 'Payment Released to Seller',
        timestamp: new Date(Date.now() - 86400000),
        status: 'completed' as const
      }
    ]
  });

  const [showBalance, setShowBalance] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'deposit' | 'withdraw' | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const handleAction = (action: 'deposit' | 'withdraw') => {
    setSelectedAction(action);
    // In a real app, this would open a modal or navigate to payment flow
    console.log(`${action} action triggered`);
  };

  return (
    <Container className="py-8">
      {/* Header */}
      <div
}
}
}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              💰 Your Wallet
            </h1>
            <p className="text-gray-600">
              Manage your funds with bank-grade security
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowBalance(!showBalance)}
              className="gap-2"
            >
              {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showBalance ? 'Hide' : 'Show'} Balance
            </Button>

            <Button
              variant="outline"
              onClick={handleRefresh}
              loading={refreshing}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Main Balance Display */}
      <div
}
}
}
        className="mb-8"
      >
        <Card className="p-8 bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600 text-white relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent animate-pulse" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Wallet className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Total Balance</h2>
                  <p className="text-white/80">Available for bidding & purchases</p>
                </div>
              </div>

              <TrustScore score={98} size="sm" />
            </div>

            {/* Animated Balance */}
            <div className="mb-6">
              {showBalance ? (
                <AnimatedBalance
                  amount={walletData.available}
                  size="xl"
                  className="text-white"
                />
              ) : (
                <div className="text-6xl font-black text-white">••••••</div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <div
}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => handleAction('deposit')}
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm gap-2"
                  variant="outline"
                >
                  <Plus className="w-5 h-5" />
                  Add Money
                </Button>
              </div>

              <div
}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => handleAction('withdraw')}
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm gap-2"
                  variant="outline"
                >
                  <Minus className="w-5 h-5" />
                  Withdraw
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Fund Distribution & Trust */}
      <Grid cols={2} gap="lg" className="mb-8">
        <Card className="p-6">
          <LockedFundsIndicator
            available={walletData.available}
            locked={walletData.locked}
            escrow={walletData.escrow}
            total={walletData.total}
          />
        </Card>

        <Card className="p-6">
          <TrustMessaging />
        </Card>
      </Grid>

      {/* Transaction History */}
      <Card className="p-6">
        <TransactionHistory transactions={walletData.transactions} />
      </Card>

      {/* Quick Deposit Options */}
      <div
}
}
}
        className="mt-8"
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Quick Deposit</h3>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Zap className="w-4 h-4" />
              Instant Transfer
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1000, 5000, 10000, 25000].map((amount) => (
              <button
                key={amount}
}
                whileTap={{ scale: 0.95 }}
                className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:shadow-md transition-all"
                onClick={() => handleAction('deposit')}
              >
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-900 mb-1">
                    ₹{(amount / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-blue-600">Quick Add</div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-emerald-900">Secure Payment Methods</div>
                <div className="text-sm text-emerald-700">UPI, Cards, Net Banking, Wallets</div>
              </div>
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-emerald-600">UPI</span>
                </div>
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Container>
  );
};

export default EnhancedWallet;
