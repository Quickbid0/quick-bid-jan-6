import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Wallet, Plus, ArrowUpRight, ArrowDownLeft, Search,
  Filter, Download, Eye, CreditCard, Smartphone,
  Banknote, RefreshCw, Shield, TrendingUp, TrendingDown
} from 'lucide-react';

interface WalletBalance {
  availableBalance: number;
  blockedBalance: number;
  totalBalance: number;
  currency: string;
}

interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT' | 'REFUND';
  amount: number;
  description: string;
  referenceId?: string;
  referenceType?: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  createdAt: string;
  balanceBefore: number;
  balanceAfter: number;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking' | 'wallet';
  name: string;
  icon: any;
  description: string;
  fees: number;
  processingTime: string;
  limits: {
    min: number;
    max: number;
  };
}

const WalletInterface: React.FC = () => {
  const [balance, setBalance] = useState<WalletBalance>({
    availableBalance: 0,
    blockedBalance: 0,
    totalBalance: 0,
    currency: 'INR'
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [addAmount, setAddAmount] = useState<number>(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const transactionsPerPage = 10;

  useEffect(() => {
    fetchWalletData();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, filterType]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);

      // Fetch wallet balance
      const balanceResponse = await fetch('/api/wallet/balance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        setBalance(balanceData);
      }

      // Fetch transaction history
      const transactionsResponse = await fetch('/api/wallet/transactions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData);
      }

    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(tx =>
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.referenceId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(tx => tx.type === filterType);
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  };

  const handleAddFunds = async () => {
    if (addAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    try {
      const response = await fetch('/api/wallet/add-funds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          amount: addAmount,
          paymentMethod: selectedPaymentMethod
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Payment initiated successfully!');

        // Redirect to payment gateway or show QR code based on method
        if (result.paymentUrl) {
          window.location.href = result.paymentUrl;
        } else if (result.qrCode) {
          // Show QR code modal
          toast.success('Scan QR code to complete payment');
        }

        setShowAddFunds(false);
        setAddAmount(0);
        setSelectedPaymentMethod('');
      } else {
        toast.error('Failed to initiate payment');
      }
    } catch (error) {
      console.error('Error adding funds:', error);
      toast.error('Failed to add funds');
    }
  };

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      type: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, RuPay',
      fees: 1.5,
      processingTime: 'Instant',
      limits: { min: 1, max: 200000 }
    },
    {
      id: 'upi',
      type: 'upi',
      name: 'UPI',
      icon: Smartphone,
      description: 'Paytm, Google Pay, PhonePe, BHIM UPI',
      fees: 0,
      processingTime: 'Instant',
      limits: { min: 1, max: 100000 }
    },
    {
      id: 'netbanking',
      type: 'netbanking',
      name: 'Net Banking',
      icon: Banknote,
      description: 'Online banking transfer',
      fees: 0,
      processingTime: '2-3 minutes',
      limits: { min: 1, max: 500000 }
    }
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'CREDIT':
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      case 'DEBIT':
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'REFUND':
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      default:
        return <Wallet className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'CREDIT':
        return 'text-green-600';
      case 'DEBIT':
        return 'text-red-600';
      case 'REFUND':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-100';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'FAILED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  const startIndex = (currentPage - 1) * transactionsPerPage;
  const endIndex = startIndex + transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
            <p className="text-gray-600 mt-2">Manage your funds and view transaction history</p>
          </div>
          <button
            onClick={() => setShowAddFunds(true)}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
            <span>Add Funds</span>
          </button>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Balance</p>
                <p className="text-2xl font-bold text-gray-900">₹{balance.availableBalance.toLocaleString()}</p>
                <p className="text-sm text-green-600">Ready to use</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Wallet className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Blocked Balance</p>
                <p className="text-2xl font-bold text-gray-900">₹{balance.blockedBalance.toLocaleString()}</p>
                <p className="text-sm text-orange-600">Held for auctions</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900">₹{balance.totalBalance.toLocaleString()}</p>
                <p className="text-sm text-blue-600">Overall value</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
              <button className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="CREDIT">Credits</option>
                  <option value="DEBIT">Debits</option>
                  <option value="REFUND">Refunds</option>
                </select>
              </div>
            </div>
          </div>

          {/* Transaction List */}
          <div className="divide-y divide-gray-200">
            {currentTransactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No transactions found</p>
              </div>
            ) : (
              currentTransactions.map((transaction) => (
                <div key={transaction.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-full">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{new Date(transaction.createdAt).toLocaleTimeString()}</span>
                          {transaction.referenceId && (
                            <>
                              <span>•</span>
                              <span>ID: {transaction.referenceId.slice(0, 8)}...</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'CREDIT' ? '+' : transaction.type === 'REFUND' ? '+' : '-'}
                        ₹{transaction.amount.toLocaleString()}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full inline-block ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 text-sm text-gray-600">
                    Balance: ₹{transaction.balanceAfter.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Funds Modal */}
        {showAddFunds && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Add Funds to Wallet</h3>
                <p className="text-sm text-gray-600 mt-1">Choose amount and payment method</p>
              </div>

              <div className="p-6 space-y-4">
                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={addAmount}
                    onChange={(e) => setAddAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter amount"
                    min="1"
                    max="100000"
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex space-x-2">
                  {[500, 1000, 2000, 5000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setAddAmount(amount)}
                      className="px-3 py-2 border border-gray-300 rounded text-sm hover:border-indigo-500 hover:bg-indigo-50"
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>

                {/* Payment Methods */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Payment Method
                  </label>
                  <div className="space-y-2">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <div
                          key={method.id}
                          onClick={() => setSelectedPaymentMethod(method.id)}
                          className={`p-3 border rounded-lg cursor-pointer ${
                            selectedPaymentMethod === method.id
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Icon className="w-5 h-5 text-gray-600" />
                              <div>
                                <p className="font-medium text-gray-900">{method.name}</p>
                                <p className="text-sm text-gray-600">{method.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              {method.fees > 0 && (
                                <p className="text-sm text-gray-500">Fee: {method.fees}%</p>
                              )}
                              <p className="text-xs text-gray-500">{method.processingTime}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex space-x-3">
                <button
                  onClick={() => setShowAddFunds(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFunds}
                  disabled={addAmount <= 0 || !selectedPaymentMethod}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Add Funds
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletInterface;
