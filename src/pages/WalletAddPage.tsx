import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { supabase } from '../config/supabaseClient';
import { toast } from 'react-hot-toast';
import { Wallet, CreditCard, Plus, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const WalletAddPage = () => {
  const navigate = useNavigate();
  const { user } = useSession();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const quickAmounts = [100, 500, 1000, 2000, 5000, 10000];
  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, RuPay' },
    { id: 'upi', name: 'UPI', icon: Plus, description: 'Google Pay, PhonePe, Paytm' },
    { id: 'netbanking', name: 'Net Banking', icon: Wallet, description: 'All major banks' }
  ];

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        
        if (!user) {
          setBalance(null);
          setLoading(false);
          return;
        }

        const { data: wallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single();

        setBalance(wallet?.balance || 0);
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

    if (!selectedMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update wallet balance (mock implementation)
      if (user) {
        const newBalance = (balance || 0) + parseFloat(amount);
        
        // In a real implementation, this would be a proper transaction
        const { error } = await supabase
          .from('wallets')
          .upsert({
            user_id: user.id,
            balance: newBalance,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
        
        setBalance(newBalance);
        setSuccess(true);
        toast.success(`Successfully added ₹${amount} to your wallet!`);
        
        // Reset form after success
        setTimeout(() => {
          setAmount('');
          setSelectedMethod(null);
          setSuccess(false);
        }, 3000);
      }
    } catch (err) {
      console.error('Error adding money:', err);
      toast.error('Failed to add money. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/wallet')}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add Money to Wallet</h1>
                <p className="text-sm text-gray-600">Current balance: ₹{balance?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Amount Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Enter Amount</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter amount"
                min="1"
              />
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Quick Amounts</p>
              <div className="grid grid-cols-3 gap-3">
                {quickAmounts.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount.toString())}
                    className={`py-2 px-3 rounded-lg border transition-colors ${
                      amount === quickAmount.toString()
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    ₹{quickAmount}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Select Payment Method</h2>
            
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`w-full p-4 rounded-lg border transition-colors text-left ${
                      selectedMethod === method.id
                        ? 'bg-blue-50 border-blue-600'
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-4 ${
                        selectedMethod === method.id ? 'bg-blue-600' : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          selectedMethod === method.id ? 'text-white' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{method.name}</h3>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8">
          <button
            onClick={handleAddMoney}
            disabled={!amount || !selectedMethod || processing || success}
            className={`w-full max-w-md mx-auto block py-4 px-6 rounded-lg font-medium transition-all ${
              success
                ? 'bg-green-600 text-white'
                : processing
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : amount && selectedMethod
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {processing ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </div>
            ) : success ? (
              <div className="flex items-center justify-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Money Added Successfully!
              </div>
            ) : (
              `Add ₹${amount || '0'} to Wallet`
            )}
          </button>
        </div>

        {/* Security Note */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start">
            <Wallet className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Secure Payment</h3>
              <p className="text-sm text-blue-700">
                Your payment information is encrypted and secure. We use industry-standard security measures 
                to protect your financial data. All transactions are monitored for fraud prevention.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletAddPage;
