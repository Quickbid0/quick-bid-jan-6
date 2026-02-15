// src/components/payments/PaymentMethodSelector.tsx
import React from 'react';
import { CreditCard, Smartphone, Building2, Wallet, CheckCircle } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  popular?: boolean;
  processingFee?: string;
}

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodSelect: (methodId: string) => void;
  availableMethods: any;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodSelect,
  availableMethods,
}) => {
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'upi',
      name: 'UPI',
      icon: <Smartphone className="h-5 w-5" />,
      description: 'Google Pay, PhonePe, Paytm, BHIM UPI',
      popular: true,
      processingFee: 'Free',
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: <Building2 className="h-5 w-5" />,
      description: 'Direct bank account payment',
      processingFee: 'Free',
    },
    {
      id: 'wallet',
      name: 'Wallet',
      icon: <Wallet className="h-5 w-5" />,
      description: 'Paytm, Mobikwik, Ola Money',
      processingFee: 'Free',
    },
    {
      id: 'card',
      name: 'Card',
      icon: <CreditCard className="h-5 w-5" />,
      description: 'Credit/Debit Card (Visa, Mastercard, RuPay)',
      processingFee: '2.5%',
    },
  ];

  const isMethodAvailable = (methodId: string): boolean => {
    return availableMethods[methodId]?.available || false;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
        <span className="text-sm text-gray-500">Secure & Instant</span>
      </div>

      <div className="space-y-3">
        {paymentMethods.map((method) => {
          const available = isMethodAvailable(method.id);

          return (
            <button
              key={method.id}
              onClick={() => available && onMethodSelect(method.id)}
              disabled={!available}
              className={`w-full p-4 border rounded-lg text-left transition-all ${
                selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : available
                  ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    available
                      ? selectedMethod === method.id
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {method.icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{method.name}</h4>
                      {method.popular && available && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full">
                          Popular
                        </span>
                      )}
                      {selectedMethod === method.id && (
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                    {method.processingFee && (
                      <p className="text-xs text-gray-500 mt-1">
                        Processing fee: {method.processingFee}
                      </p>
                    )}
                  </div>
                </div>

                {!available && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                      Unavailable
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Security Note */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-green-900">Secure Payment</h4>
            <p className="text-sm text-green-700 mt-1">
              Your payment information is encrypted and secure. We use industry-standard
              security measures to protect your data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
