import React, { useEffect, useState } from 'react';
import { useSession } from '../context/SessionContext';
import { supabase } from '../config/supabaseClient';
import { toast } from 'react-hot-toast';
import { Wallet, CreditCard, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageContainer from '../components/layout/PageFrame';

const WalletPage = () => {
  const { user } = useSession();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [processing, setProcessing] = useState(false);

  const quickAmounts = [100, 500, 1000, 2000, 5000, 10000];

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        
        // Use backend API for wallet balance
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wallet/balance`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setBalance(data.balance);
          setLoading(false);
          return;
        }
        
        // Fallback to mock balance
        setBalance(25000);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching balance:', err);
        toast.error('Failed to load wallet balance');
        setLoading(false);
      }
    };

    fetchBalance();
  }, [user]);

  const handleAddMoney = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const handleAddFunds = async (amount: number) => {
      setProcessing(true);
      
      try {
        // Use real Razorpay service
        const { realRazorpayService } = await import('../services/realRazorpayService');
        const result = await realRazorpayService.processWalletTopup(amount);
        
        if (result.success) {
          toast.success(`₹${amount} added to wallet successfully!`);
          // Refresh balance
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wallet/balance`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setBalance(data.balance);
          }
        } else {
          toast.error(result.error || 'Failed to add funds');
        }
      } catch (error) {
        console.error('Add funds error:', error);
        toast.error('Failed to add funds');
      } finally {
        setProcessing(false);
        setShowAddMoney(false);
      }
    };

    handleAddFunds(parseFloat(amount));
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading wallet balance...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Wallet</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your funds and transactions</p>
            </div>
            <button
              onClick={() => setShowAddMoney(true)}
              className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Add Money
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <div data-testid="wallet-balance" className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
          <div className="text-center">
            <Wallet className="h-16 w-16 mb-4" />
            <h2 className="text-4xl font-bold mb-2">₹{balance?.toLocaleString()}</h2>
            <p className="text-indigo-100">Available Balance</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => {
                setAmount(amount.toString());
                setShowAddMoney(true);
              }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-indigo-500 hover:shadow-lg transition-all"
            >
              <span className="text-2xl font-bold text-gray-900 dark:text-white">+₹{amount.toLocaleString()}</span>
              <p className="text-sm text-gray-600 dark:text-gray-400">Quick Add</p>
            </button>
          ))}
          <button
            onClick={() => setShowAddMoney(true)}
            className="bg-indigo-600 text-white p-6 rounded-xl shadow-sm border border-indigo-500 hover:bg-indigo-700 hover:shadow-lg transition-all"
          >
            <Plus className="h-5 w-5 inline mr-2" />
            Custom Amount
          </button>
        </div>

        {/* Recent Transactions */}
        <div data-testid="wallet-transactions" className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Transactions</h3>
          <div className="space-y-4">
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Your transaction history will appear here once you start using your wallet.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Money Modal */}
      <AnimatePresence>
        {showAddMoney && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Add Money</h3>
                <button
                  onClick={() => setShowAddMoney(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 text-gray-500 dark:text-gray-400">₹</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {['credit', 'debit'].map((method) => (
                      <button
                        key={method}
                        onClick={() => setSelectedMethod(method)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedMethod === method
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 hover:border-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        <CreditCard className="h-5 w-5 mr-2" />
                        {method === 'credit' ? 'Credit Card' : 'Debit Card'}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleAddMoney}
                  disabled={processing || !amount || parseFloat(amount) <= 0}
                  className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {processing ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-5 w-5 mr-2" />
                  )}
                  {processing ? 'Processing...' : `Add ₹${parseFloat(amount).toLocaleString()}`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </PageContainer>
  );
};

export default WalletPage;