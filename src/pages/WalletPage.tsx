import React, { useEffect, useState } from 'react';
import {
  Wallet,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  Shield,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Banknote,
  Smartphone,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Filter,
  Search,
  Calendar,
  Target,
  Zap
} from 'lucide-react';

// =============================================================================
// ELITE WALLET PAGE - Series B Ready
// Fintech-Level Clean UI + Strong Balance Card + Transaction Timeline + Locked Funds Clarity
// =============================================================================

interface Transaction {
  id: string;
  type: 'credit' | 'debit' | 'lock' | 'unlock';
  amount: number;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
  category?: string;
}

export default function EliteWalletPage() {
  const [balance, setBalance] = useState(125000);
  const [availableBalance, setAvailableBalance] = useState(95000);
  const [lockedBalance, setLockedBalance] = useState(30000);
  const [showBalance, setShowBalance] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'analytics'>('overview');
  const [filterPeriod, setFilterPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Enhanced sample data
  const sampleTransactions: Transaction[] = [
    {
      id: '1',
      type: 'credit',
      amount: 25000,
      description: 'Wallet Top-up',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      category: 'deposit'
    },
    {
      id: '2',
      type: 'lock',
      amount: 15000,
      description: 'Funds locked for BMW X5 bid',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      category: 'auction'
    },
    {
      id: '3',
      type: 'debit',
      amount: 850000,
      description: 'BMW X5 Auction Payment',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      category: 'payment'
    },
    {
      id: '4',
      type: 'credit',
      amount: 850000,
      description: 'Refund: BMW X5 Auction',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      category: 'refund'
    },
    {
      id: '5',
      type: 'debit',
      amount: 5000,
      description: 'Yard Token Payment',
      timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      category: 'fee'
    }
  ];

  useEffect(() => {
    // Simulate loading transactions
    setTimeout(() => {
      setTransactions(sampleTransactions);
    }, 1000);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit': return ArrowDownLeft;
      case 'debit': return ArrowUpRight;
      case 'lock': return Lock;
      case 'unlock': return Shield;
      default: return Wallet;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'credit': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'debit': return 'text-error-600 bg-error-50 border-error-200';
      case 'lock': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'unlock': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  const quickAddAmounts = [1000, 2500, 5000, 10000, 25000, 50000];

  const addFunds = (amount: number) => {
    // Simulate adding funds
    setLoading(true);
    setTimeout(() => {
      setBalance(prev => prev + amount);
      setAvailableBalance(prev => prev + amount);
      setTransactions(prev => [{
        id: Date.now().toString(),
        type: 'credit',
        amount,
        description: 'Wallet Top-up',
        timestamp: new Date().toISOString(),
        status: 'completed',
        category: 'deposit'
      }, ...prev]);
      setLoading(false);
    }, 1500);
  };

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
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-250 ${
                    activeTab === 'overview'
                      ? 'bg-primary-600 text-white'
                      : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-250 ${
                    activeTab === 'transactions'
                      ? 'bg-primary-600 text-white'
                      : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  Transactions
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-250 ${
                    activeTab === 'analytics'
                      ? 'bg-primary-600 text-white'
                      : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  Analytics
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-250"
              >
                {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
              <button className="bg-primary-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-primary-700 transition-all duration-250">
                Add Funds
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Elite Balance Card - Hero Feature */}
            <div
}
}
}
              className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-3xl p-8 text-white"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Wallet className="w-8 h-8" />
                      <span className="text-primary-100 text-lg">Total Balance</span>
                    </div>
                    <div className="flex items-baseline gap-4">
                      <div className="text-5xl lg:text-6xl font-black">
                        {showBalance ? formatPrice(balance) : '₹••••••'}
                      </div>
                      <div className="flex items-center gap-2 text-primary-200">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">+12.5% this month</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <div className="text-sm text-primary-200 mb-1">Available to Spend</div>
                      <div className="text-2xl font-bold text-white">
                        {showBalance ? formatPrice(availableBalance) : '₹••••••'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Balance Breakdown - Elite Feature */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div
}
}
}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-emerald-500/20 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-emerald-300" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-emerald-200">Available</div>
                        <div className="text-xs text-emerald-300">Ready to use</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {showBalance ? formatPrice(availableBalance) : '₹••••••'}
                    </div>
                    <div className="mt-2 bg-white/20 rounded-full h-2">
                      <div
                        className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(availableBalance / balance) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div
}
}
}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-amber-500/20 rounded-xl">
                        <Lock className="w-5 h-5 text-amber-300" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-amber-200">Locked in Bids</div>
                        <div className="text-xs text-amber-300">Reserved funds</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {showBalance ? formatPrice(lockedBalance) : '₹••••••'}
                    </div>
                    <div className="mt-2 bg-white/20 rounded-full h-2">
                      <div
                        className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(lockedBalance / balance) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div
}
}
}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-500/20 rounded-xl">
                        <Shield className="w-5 h-5 text-blue-300" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-blue-200">In Escrow</div>
                        <div className="text-xs text-blue-300">Secured payments</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {showBalance ? formatPrice(balance - availableBalance - lockedBalance) : '₹••••••'}
                    </div>
                    <div className="mt-2 bg-white/20 rounded-full h-2">
                      <div
                        className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${((balance - availableBalance - lockedBalance) / balance) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions - Elite CTA */}
                <div
}
}
}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <button className="flex-1 bg-white text-primary-600 py-4 rounded-2xl font-bold hover:bg-neutral-50 transition-all duration-250 hover:shadow-xl flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add Funds
                  </button>
                  <button className="flex-1 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white py-4 rounded-2xl font-bold hover:bg-white/20 transition-all duration-250 flex items-center justify-center gap-2">
                    <ArrowUpRight className="w-5 h-5" />
                    Transfer
                  </button>
                  <button className="flex-1 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white py-4 rounded-2xl font-bold hover:bg-white/20 transition-all duration-250 flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" />
                    Withdraw
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Add Money - Elite Design */}
            <div
}
}
}
              className="bg-white rounded-2xl shadow-xl p-8 border border-neutral-200"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Quick Add Money</h2>
                <p className="text-neutral-600">Choose from preset amounts or add a custom amount</p>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
                {quickAddAmounts.map((amount, index) => (
                  <button
                    key={amount}
}
}
}
                    onClick={() => addFunds(amount)}
                    disabled={loading}
                    className="bg-neutral-50 hover:bg-primary-50 border border-neutral-200 hover:border-primary-300 rounded-xl p-4 transition-all duration-250 hover:shadow-lg group"
                  >
                    <div className="text-xl font-bold text-neutral-900 group-hover:text-primary-600 mb-1">
                      ₹{amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-neutral-500">Quick add</div>
                  </button>
                ))}
              </div>

              {/* Payment Methods - Elite */}
              <div className="border-t border-neutral-200 pt-8">
                <h3 className="text-lg font-semibold text-neutral-900 mb-6 text-center">Payment Methods</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: CreditCard, name: 'Credit/Debit Cards', desc: 'Visa, Mastercard, RuPay' },
                    { icon: Smartphone, name: 'UPI & Wallets', desc: 'Paytm, Google Pay, PhonePe' },
                    { icon: Banknote, name: 'Net Banking', desc: 'All major banks supported' }
                  ].map((method, index) => (
                    <div
                      key={method.name}
}
}
}
                      className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl p-6 border border-neutral-200 hover:shadow-lg transition-all duration-250 cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-100 rounded-xl group-hover:bg-primary-200 transition-colors duration-250">
                          <method.icon className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-900">{method.name}</div>
                          <div className="text-sm text-neutral-600">{method.desc}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Transactions Preview */}
            <div
}
}
}
              className="bg-white rounded-2xl shadow-xl p-8 border border-neutral-200"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900">Recent Transactions</h2>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                >
                  View All →
                </button>
              </div>

              <div className="space-y-4">
                {transactions.slice(0, 5).map((transaction, index) => {
                  const IconComponent = getTransactionIcon(transaction.type);
                  return (
                    <div
                      key={transaction.id}
}
}
}
                      className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl hover:shadow-md transition-all duration-250"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${getTransactionColor(transaction.type)}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-900">{transaction.description}</div>
                          <div className="text-sm text-neutral-600 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {new Date(transaction.timestamp).toLocaleDateString('en-IN')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold text-lg ${
                          transaction.type === 'credit' ? 'text-emerald-600' :
                          transaction.type === 'debit' ? 'text-error-600' :
                          'text-neutral-900'
                        }`}>
                          {transaction.type === 'credit' ? '+' : transaction.type === 'debit' ? '-' : ''}
                          {formatPrice(transaction.amount)}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          transaction.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          transaction.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-error-100 text-error-700'
                        }`}>
                          {transaction.status}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">Transaction History</h1>
                <p className="text-neutral-600 mt-2">Complete overview of your wallet activity</p>
              </div>

              <div className="flex items-center gap-4">
                <select
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value as any)}
                  className="px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="all">All time</option>
                </select>
                <button className="p-2 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors duration-200">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Transaction Timeline - Elite Feature */}
            <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden">
              <div className="border-b border-neutral-200 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-neutral-900">Transaction Timeline</h2>
                  <div className="text-sm text-neutral-600">
                    {transactions.length} transactions
                  </div>
                </div>
              </div>

              <div className="divide-y divide-neutral-100">
                {transactions.map((transaction, index) => {
                  const IconComponent = getTransactionIcon(transaction.type);
                  return (
                    <div
                      key={transaction.id}
}
}
}
                      className="p-6 hover:bg-neutral-50 transition-colors duration-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${getTransactionColor(transaction.type)}`}>
                          <IconComponent className="w-6 h-6" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-neutral-900">{transaction.description}</h3>
                              <div className="flex items-center gap-4 text-sm text-neutral-600 mt-1">
                                <span>{new Date(transaction.timestamp).toLocaleDateString('en-IN')}</span>
                                <span>•</span>
                                <span>{new Date(transaction.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                {transaction.reference && (
                                  <>
                                    <span>•</span>
                                    <span className="font-mono text-xs bg-neutral-100 px-2 py-1 rounded">
                                      {transaction.reference}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-bold text-xl ${
                                transaction.type === 'credit' ? 'text-emerald-600' :
                                transaction.type === 'debit' ? 'text-error-600' :
                                'text-neutral-900'
                              }`}>
                                {transaction.type === 'credit' ? '+' : transaction.type === 'debit' ? '-' : ''}
                                {formatPrice(transaction.amount)}
                              </div>
                              <div className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                                transaction.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                transaction.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                'bg-error-100 text-error-700'
                              }`}>
                                {transaction.status}
                              </div>
                            </div>
                          </div>

                          {transaction.category && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded-full capitalize">
                                {transaction.category}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Wallet Analytics</h1>
              <p className="text-neutral-600 mt-2">Insights into your spending patterns and wallet performance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Transactions', value: transactions.length.toString(), change: '+23%', color: 'primary' },
                { label: 'Avg Transaction', value: formatPrice(Math.round(transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length)), change: '+₹2.1K', color: 'emerald' },
                { label: 'Success Rate', value: '98.5%', change: '+2.1%', color: 'blue' },
                { label: 'Monthly Growth', value: '+12.8%', change: '+3.2%', color: 'purple' }
              ].map((metric, index) => (
                <div
                  key={metric.label}
}
}
}
                  className="bg-white rounded-2xl p-6 shadow-xl border border-neutral-200"
                >
                  <div className={`text-3xl font-bold text-${metric.color}-600 mb-2`}>{metric.value}</div>
                  <div className="text-neutral-900 font-semibold mb-1">{metric.label}</div>
                  <div className="text-emerald-600 text-sm font-medium">{metric.change} this month</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl border border-neutral-200">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Spending Insights</h2>
              <div className="h-64 bg-neutral-50 rounded-xl flex items-center justify-center">
                <div className="text-center text-neutral-500">
                  <Target className="w-12 h-12 mx-auto mb-2" />
                  <p>Advanced spending analytics chart</p>
                  <p className="text-sm">Category breakdown and spending trends</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}