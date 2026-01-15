import React, { useState } from 'react';
import { CreditCard, Smartphone, Building, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import QRCode from 'react-qr-code';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  fees: string;
  processingTime: string;
}

const PaymentGateway = () => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: <CreditCard className="h-6 w-6" />,
      description: 'Visa, Mastercard, RuPay accepted',
      fees: '2.5% + GST',
      processingTime: 'Instant'
    },
    {
      id: 'upi',
      name: 'UPI Payment',
      icon: <Smartphone className="h-6 w-6" />,
      description: 'Google Pay, PhonePe, Paytm, BHIM',
      fees: 'Free',
      processingTime: 'Instant'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: <Building className="h-6 w-6" />,
      description: 'All major banks supported',
      fees: '1.5% + GST',
      processingTime: '2-5 minutes'
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      icon: <Smartphone className="h-6 w-6" />,
      description: 'Paytm, Amazon Pay, Mobikwik',
      fees: '1% + GST',
      processingTime: 'Instant'
    }
  ];

  const handlePayment = async () => {
    if (!selectedMethod || !amount) {
      toast.error('Please select payment method and enter amount');
      return;
    }

    setProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      if (selectedMethod === 'upi') {
        setShowQR(true);
      } else {
        toast.success('Payment processed successfully!');
      }
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <Shield className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Secure Payment Gateway
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Multiple payment options with bank-level security
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Methods */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Select Payment Method</h2>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <motion.div
                  key={method.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedMethod === method.id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{method.name}</h3>
                      <p className="text-sm text-gray-600">{method.description}</p>
                      <div className="flex gap-4 mt-1 text-xs text-gray-500">
                        <span>Fees: {method.fees}</span>
                        <span>Processing: {method.processingTime}</span>
                      </div>
                    </div>
                    {selectedMethod === method.id && (
                      <CheckCircle className="h-5 w-5 text-indigo-600" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter amount"
            />
          </div>

          <button
            onClick={handlePayment}
            disabled={processing || !selectedMethod || !amount}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {processing ? 'Processing...' : `Pay ₹${amount || '0'}`}
          </button>
        </div>

        {/* Payment Details */}
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <h3 className="font-semibold mb-4">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-medium">₹{amount || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span>Processing Fee:</span>
                <span className="font-medium">₹{amount ? (parseFloat(amount) * 0.025).toFixed(2) : '0'}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Total:</span>
                <span className="font-semibold">₹{amount ? (parseFloat(amount) * 1.025).toFixed(2) : '0'}</span>
              </div>
            </div>
          </div>

          {showQR && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-6 bg-white rounded-lg shadow-lg"
            >
              <h3 className="font-semibold mb-4">Scan QR Code to Pay</h3>
              <QRCode
                value={`upi://pay?pa=merchant@upi&pn=QuickBid&am=${amount}&cu=INR`}
                size={200}
                className="mx-auto"
              />
              <p className="text-sm text-gray-600 mt-4">
                Scan with any UPI app to complete payment
              </p>
            </motion.div>
          )}

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800 dark:text-green-200">Secure Payment</h4>
                <p className="text-sm text-green-600 dark:text-green-300">
                  Your payment is protected by 256-bit SSL encryption and PCI DSS compliance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;
