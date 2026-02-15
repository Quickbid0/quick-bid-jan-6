// src/components/payments/IndianPaymentModal.tsx
import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  CheckCircle,
  X,
  Loader,
  AlertCircle
} from 'lucide-react';

interface IndianPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  orderId: string;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  available: boolean;
}

const IndianPaymentModal: React.FC<IndianPaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  orderId,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any>({});
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [step, setStep] = useState<'select' | 'details' | 'processing'>('select');

  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethods();
    }
  }, [isOpen]);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/payments/methods');
      const data = await response.json();
      setPaymentMethods(data.data);
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
    }
  };

  const paymentOptions: PaymentMethod[] = [
    {
      id: 'upi',
      name: 'UPI',
      icon: <Smartphone className="h-6 w-6" />,
      description: 'Pay using Google Pay, PhonePe, Paytm, or any UPI app',
      available: paymentMethods.upi?.available || false,
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: <Building2 className="h-6 w-6" />,
      description: 'Pay directly from your bank account',
      available: paymentMethods.netbanking?.available || false,
    },
    {
      id: 'wallet',
      name: 'Wallet',
      icon: <Wallet className="h-6 w-6" />,
      description: 'Pay using Paytm, Mobikwik, Ola Money, or other wallets',
      available: paymentMethods.wallet?.available || false,
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: <CreditCard className="h-6 w-6" />,
      description: 'Pay using Visa, Mastercard, RuPay, or American Express',
      available: paymentMethods.card?.available || false,
    },
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setStep('details');
  };

  const handlePaymentSubmit = async () => {
    setIsProcessing(true);
    setStep('processing');

    try {
      let paymentData: any = {
        amount,
        currency: 'INR',
        orderId,
        customerId: 'current-user-id', // This would come from auth context
        customerEmail: 'user@example.com', // This would come from user profile
        customerPhone: '+91XXXXXXXXXX', // This would come from user profile
      };

      let endpoint = '';

      switch (selectedMethod) {
        case 'upi':
          paymentData.upiId = upiId;
          endpoint = '/api/payments/upi';
          break;
        case 'netbanking':
          paymentData.bankCode = selectedBank;
          endpoint = '/api/payments/netbanking';
          break;
        case 'wallet':
          paymentData.walletCode = selectedWallet;
          endpoint = '/api/payments/wallet';
          break;
        case 'card':
          // Card payments would use a different flow with Stripe/Razorpay checkout
          endpoint = '/api/payments/card';
          break;
        default:
          throw new Error('Invalid payment method');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      if (result.success) {
        // Initialize Razorpay payment
        if (result.data.razorpayOrderId) {
          initializeRazorpayPayment(result.data);
        } else {
          onPaymentSuccess(result.data);
          onClose();
        }
      } else {
        throw new Error(result.message || 'Payment creation failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      onPaymentError(error instanceof Error ? error.message : 'Payment failed');
      setStep('details');
    } finally {
      setIsProcessing(false);
    }
  };

  const initializeRazorpayPayment = (paymentData: any) => {
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID,
      amount: paymentData.amount,
      currency: paymentData.currency,
      name: 'QuickMela',
      description: `Payment for Order ${orderId}`,
      order_id: paymentData.razorpayOrderId,
      handler: function (response: any) {
        // Verify payment on backend
        verifyPayment(response);
      },
      prefill: {
        email: 'user@example.com', // From user profile
        contact: '+91XXXXXXXXXX', // From user profile
      },
      theme: {
        color: '#2563eb',
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  const verifyPayment = async (razorpayResponse: any) => {
    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          paymentId: razorpayResponse.razorpay_payment_id,
          razorpayPaymentId: razorpayResponse.razorpay_payment_id,
          razorpaySignature: razorpayResponse.razorpay_signature,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onPaymentSuccess(result.data);
        onClose();
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      onPaymentError(error instanceof Error ? error.message : 'Payment verification failed');
    }
  };

  const renderPaymentMethods = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Payment Method</h3>
      <div className="grid grid-cols-1 gap-3">
        {paymentOptions.map((method) => (
          <button
            key={method.id}
            onClick={() => handleMethodSelect(method.id)}
            disabled={!method.available}
            className={`p-4 border rounded-lg text-left transition-all ${
              method.available
                ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                method.available ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {method.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{method.name}</h4>
                <p className="text-sm text-gray-600">{method.description}</p>
              </div>
              {method.available && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderPaymentDetails = () => {
    switch (selectedMethod) {
      case 'upi':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">UPI Payment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UPI ID
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your UPI ID (e.g., yourname@paytm, yourname@okaxis)
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Available UPI Apps</h4>
                <div className="grid grid-cols-2 gap-2">
                  {paymentMethods.upi?.apps?.map((app: any) => (
                    <button
                      key={app.code}
                      onClick={() => setUpiId(`${app.code === 'gpay' ? 'tez' : app.code}@okaxis`)}
                      className="flex items-center gap-2 p-2 bg-white rounded border hover:bg-gray-50"
                    >
                      <img src={app.logo} alt={app.name} className="h-6 w-6" />
                      <span className="text-sm">{app.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'netbanking':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Net Banking</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Your Bank
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose your bank</option>
                  {paymentMethods.netbanking?.banks?.map((bank: any) => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedBank && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-800">
                      You will be redirected to {paymentMethods.netbanking?.banks?.find((b: any) => b.code === selectedBank)?.name} secure login page
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'wallet':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Wallet Payment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Wallet
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {paymentMethods.wallet?.wallets?.map((wallet: any) => (
                    <button
                      key={wallet.code}
                      onClick={() => setSelectedWallet(wallet.code)}
                      className={`p-3 border rounded-lg text-left transition-all ${
                        selectedWallet === wallet.code
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={wallet.logo} alt={wallet.name} className="h-8 w-8" />
                        <div>
                          <h4 className="font-medium text-gray-900">{wallet.name}</h4>
                          <p className="text-sm text-gray-600">{wallet.description}</p>
                        </div>
                        {selectedWallet === wallet.code && (
                          <CheckCircle className="h-5 w-5 text-blue-600 ml-auto" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'card':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Card Payment</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-blue-800">
                  You will be redirected to secure payment gateway
                </span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderProcessing = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader className="h-12 w-12 text-blue-600 animate-spin mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
      <p className="text-gray-600 text-center">
        Please wait while we process your payment...<br />
        Do not close this window or refresh the page.
      </p>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Complete Payment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
            disabled={isProcessing}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Amount Display */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">₹{amount.toLocaleString()}</p>
            </div>
          </div>

          {step === 'select' && renderPaymentMethods()}
          {step === 'details' && renderPaymentDetails()}
          {step === 'processing' && renderProcessing()}
        </div>

        {/* Footer */}
        {step === 'details' && (
          <div className="flex gap-3 p-6 border-t border-gray-200">
            <button
              onClick={() => setStep('select')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={isProcessing}
            >
              Back
            </button>
            <button
              onClick={handlePaymentSubmit}
              disabled={isProcessing || !(
                (selectedMethod === 'upi' && upiId) ||
                (selectedMethod === 'netbanking' && selectedBank) ||
                (selectedMethod === 'wallet' && selectedWallet) ||
                selectedMethod === 'card'
              )}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  Processing...
                </div>
              ) : (
                `Pay ₹${amount.toLocaleString()}`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndianPaymentModal;
