import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import {
  History,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Wallet,
  Package,
  Trophy,
  TrendingUp,
  Filter,
  Download,
  Calendar,
  Receipt,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSession } from '../context/SessionContext';

interface Transaction {
  id: string;
  type: 'bid' | 'payment' | 'wallet_topup' | 'refund' | 'commission' | 'order';
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  created_at: string;
  reference_id?: string;
  product_title?: string;
  seller_name?: string;
  metadata?: any;
}

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'bids' | 'payments' | 'wallet' | 'refunds'>('all');
  const [dateRange, setDateRange] = useState('30d');
  const { userProfile } = useSession();

  useEffect(() => {
    fetchTransactions();
  }, [userProfile]);

  const fetchTransactions = async () => {
    if (!userProfile?.id) return;

    setLoading(true);
    try {
      // Fetch bids
      const { data: bids, error: bidsError } = await supabase
        .from('bids')
        .select(`
          id,
          amount,
          created_at,
          status,
          auction:auction_id (
            product:product_id (
              title,
              seller:seller_id (name)
            )
          )
        `)
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (bidsError) console.error('Error fetching bids:', bidsError);

      // Fetch wallet transactions (mock for now - would come from wallet_transactions table)
      const walletTransactions: Transaction[] = [
        // Mock wallet top-ups
        {
          id: 'wallet-1',
          type: 'wallet_topup',
          amount: 50000,
          description: 'Wallet top-up via UPI',
          status: 'completed',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: { method: 'UPI', reference: 'UPI123456' }
        }
      ];

      // Transform bids to transactions
      const bidTransactions: Transaction[] = (bids || []).map((bid: any) => ({
        id: bid.id,
        type: 'bid',
        amount: -bid.amount, // Negative for outgoing
        description: `Bid on ${bid.auction?.product?.title || 'Product'}`,
        status: bid.status === 'active' ? 'pending' : 'completed',
        created_at: bid.created_at,
        product_title: bid.auction?.product?.title,
        seller_name: bid.auction?.product?.seller?.name,
        reference_id: bid.id
      }));

      // Combine all transactions
      const allTransactions = [...bidTransactions, ...walletTransactions]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string, status: string) => {
    const iconClass = status === 'completed' ? 'text-green-500' :
                     status === 'pending' ? 'text-yellow-500' :
                     status === 'failed' ? 'text-red-500' : 'text-gray-500';

    switch (type) {
      case 'bid':
        return <ArrowUpRight className={`h-5 w-5 ${iconClass}`} />;
      case 'payment':
        return <CreditCard className={`h-5 w-5 ${iconClass}`} />;
      case 'wallet_topup':
        return <ArrowDownLeft className={`h-5 w-5 ${iconClass}`} />;
      case 'refund':
        return <ArrowDownLeft className={`h-5 w-5 ${iconClass}`} />;
      case 'commission':
        return <TrendingUp className={`h-5 w-5 ${iconClass}`} />;
      case 'order':
        return <Package className={`h-5 w-5 ${iconClass}`} />;
      default:
        return <Receipt className={`h-5 w-5 ${iconClass}`} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;

    switch (filter) {
      case 'bids':
        return transaction.type === 'bid';
      case 'payments':
        return transaction.type === 'payment' || transaction.type === 'order';
      case 'wallet':
        return transaction.type === 'wallet_topup';
      case 'refunds':
        return transaction.type === 'refund';
      default:
        return true;
    }
  });

  const stats = {
    totalTransactions: transactions.length,
    totalSpent: transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0),
    totalReceived: transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
    pendingTransactions: transactions.filter(t => t.status === 'pending').length
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Transaction History</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">Complete record of your financial activities</p>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 3 Months</option>
            <option value="1y">Last Year</option>
          </select>

          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
          <History className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTransactions}</p>
          <p className="text-sm text-gray-500">Total Transactions</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
          <ArrowUpRight className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{(stats.totalSpent / 100000).toFixed(1)}L</p>
          <p className="text-sm text-gray-500">Total Spent</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
          <ArrowDownLeft className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{(stats.totalReceived / 1000).toFixed(0)}K</p>
          <p className="text-sm text-gray-500">Total Received</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
          <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingTransactions}</p>
          <p className="text-sm text-gray-500">Pending</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { id: 'all', label: 'All Transactions', count: transactions.length },
          { id: 'bids', label: 'Bids', count: transactions.filter(t => t.type === 'bid').length },
          { id: 'payments', label: 'Payments', count: transactions.filter(t => t.type === 'payment' || t.type === 'order').length },
          { id: 'wallet', label: 'Wallet', count: transactions.filter(t => t.type === 'wallet_topup').length },
          { id: 'refunds', label: 'Refunds', count: transactions.filter(t => t.type === 'refund').length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
              filter === tab.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No transactions found</h3>
            <p className="text-gray-500">You haven't made any transactions yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTransactions.map((transaction) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      {getTransactionIcon(transaction.type, transaction.status)}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {transaction.description}
                      </h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                          {transaction.status.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(transaction.created_at).toLocaleString()}
                        </span>
                        {transaction.reference_id && (
                          <span className="text-sm text-gray-500">
                            ID: {transaction.reference_id}
                          </span>
                        )}
                      </div>
                      {transaction.product_title && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Product: {transaction.product_title}
                          {transaction.seller_name && ` • Seller: ${transaction.seller_name}`}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-xl font-bold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">{transaction.type.replace('_', ' ')}</p>
                  </div>
                </div>

                {/* Transaction Details */}
                {transaction.metadata && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Transaction Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {Object.entries(transaction.metadata).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-gray-500 capitalize">{key.replace('_', ' ')}:</span>
                          <span className="ml-2 font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Insights */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Transaction Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Most Active Period</h3>
            <p className="text-blue-600 dark:text-blue-300">
              Evening hours (6-9 PM)
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">Average Transaction</h3>
            <p className="text-green-600 dark:text-green-300">
              ₹{(transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length || 0).toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h3 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Transaction Success Rate</h3>
            <p className="text-purple-600 dark:text-purple-300">
              {((transactions.filter(t => t.status === 'completed').length / transactions.length) * 100 || 0).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
