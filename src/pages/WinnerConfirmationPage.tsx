import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  CheckCircle,
  Clock,
  CreditCard,
  Shield,
  Truck,
  FileText,
  Phone,
  Mail,
  MapPin,
  IndianRupee,
  AlertCircle,
  Download,
  Share2,
  Star,
  Calendar,
  Car,
  User,
  Award,
  Lock
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock auction data
const mockAuction = {
  id: '1',
  title: 'BMW X3 2020 Excellent Condition',
  make: 'BMW',
  model: 'X3',
  year: 2020,
  finalBid: 1850000,
  reservePrice: 1750000,
  dealer: {
    name: 'Elite Motors',
    location: 'Mumbai, Maharashtra',
    phone: '+91 98765 43210',
    email: 'contact@elitemotors.com',
    rating: 4.8,
    verified: true
  },
  vehicle: {
    registration: 'MH01 AB 1234',
    insuranceExpiry: '2025-12-31',
    inspectionScore: 85,
    riskGrade: 'A',
    warranty: true,
    warrantyPeriod: 12
  },
  payment: {
    totalAmount: 1850000,
    platformFee: 148000, // 8%
    escrowAmount: 1850000,
    deliveryCharges: 5000,
    insurance: 25000,
    finalAmount: 1850000 + 5000 + 25000 // 1,852,500
  },
  timeline: {
    auctionEnd: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    paymentDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
  }
};

const WinnerConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'netbanking' | 'upi' | 'wallet'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const steps = [
    { id: 1, title: 'Congratulations', icon: Trophy },
    { id: 2, title: 'Payment', icon: CreditCard },
    { id: 3, title: 'Confirmation', icon: CheckCircle }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    setIsProcessing(false);
    setIsPaid(true);
    setCurrentStep(3);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div
            className="space-y-8"
          >
            {/* Winner Announcement */}
            <div className="text-center">
              <div
                className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6"
              >
                <Trophy className="h-10 w-10 text-yellow-600" />
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Congratulations! 🎉
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                You won the auction for <span className="font-semibold text-gray-900">{mockAuction.title}</span>
              </p>
            </div>

            {/* Auction Summary */}
            <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Car className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{mockAuction.make} {mockAuction.model}</div>
                  <div className="text-sm text-gray-600">{mockAuction.year}</div>
                </div>

                <div className="text-center">
                  <IndianRupee className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(mockAuction.finalBid)}</div>
                  <div className="text-sm text-gray-600">Winning Bid</div>
                </div>

                <div className="text-center">
                  <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">Risk Grade A</div>
                  <div className="text-sm text-gray-600">85/100 Inspection</div>
                </div>
              </div>
            </Card>

            {/* Dealer Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dealer Information</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-blue-600">
                    {mockAuction.dealer.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{mockAuction.dealer.name}</h4>
                    {mockAuction.dealer.verified && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">{mockAuction.dealer.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {mockAuction.dealer.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {mockAuction.dealer.phone}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Next Steps */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Next Steps</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Complete Payment</p>
                    <p className="text-sm text-blue-700">Secure payment through our escrow system</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Vehicle Verification</p>
                    <p className="text-sm text-gray-500">Final inspection and paperwork</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Delivery</p>
                    <p className="text-sm text-gray-500">Vehicle delivered to your location</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Important Notice */}
            <Card className="p-6 bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900 mb-2">Important Notice</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Payment must be completed within 7 days to secure your winning bid</li>
                    <li>• Funds are held in escrow until successful delivery</li>
                    <li>• All payments are protected by QuickMela's buyer protection policy</li>
                    <li>• Contact the dealer directly for any questions about the vehicle</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        );

      case 2:
        return (
          <div
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Payment</h2>
              <p className="text-gray-600">Secure payment through QuickMela's escrow system</p>
            </div>

            {/* Payment Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Winning Bid</span>
                  <span className="font-medium">{formatCurrency(mockAuction.finalBid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Charges</span>
                  <span className="font-medium">{formatCurrency(mockAuction.payment.deliveryCharges)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Insurance (Optional)</span>
                  <span className="font-medium">{formatCurrency(mockAuction.payment.insurance)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount</span>
                    <span>{formatCurrency(mockAuction.payment.finalAmount)}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Escrow Information */}
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-900">Secure Escrow Payment</h3>
              </div>
              <div className="space-y-3 text-sm text-green-800">
                <p>• Your payment is held securely in escrow until successful delivery</p>
                <p>• Funds are only released to the dealer after you confirm receipt</p>
                <p>• Full buyer protection with money-back guarantee</p>
                <p>• SSL encryption and bank-grade security</p>
              </div>
            </Card>

            {/* Payment Methods */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Payment Method</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
                  { id: 'netbanking', label: 'Net Banking', icon: Shield },
                  { id: 'upi', label: 'UPI', icon: Phone },
                  { id: 'wallet', label: 'Wallet', icon: Lock }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      paymentMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <method.icon className="h-6 w-6 mb-2" />
                    <div className="font-medium">{method.label}</div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Payment Deadline */}
            <Card className="p-4 bg-orange-50 border-orange-200">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-900">Payment Deadline</p>
                  <p className="text-sm text-orange-700">
                    Complete payment by {mockAuction.timeline.paymentDeadline.toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })} to secure your winning bid.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        );

      case 3:
        return (
          <div
            className="space-y-8"
          >
            {/* Success Message */}
            <div className="text-center">
              <div
                className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6"
              >
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Payment Successful! ✅
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Your payment of {formatCurrency(mockAuction.payment.finalAmount)} has been processed successfully.
              </p>
            </div>

            {/* Payment Confirmation */}
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Transaction ID</span>
                  <span className="font-mono font-medium">QM{Date.now().toString().slice(-8)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Payment Method</span>
                  <span className="font-medium capitalize">{paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Amount Paid</span>
                  <span className="font-semibold text-lg">{formatCurrency(mockAuction.payment.finalAmount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Payment Date</span>
                  <span className="font-medium">{new Date().toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            </Card>

            {/* Next Steps */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Dealer Contact</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      The dealer will contact you within 24 hours to schedule vehicle inspection and paperwork.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4 mr-1" />
                        Call Dealer
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4 mr-1" />
                        Email Dealer
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-600">Vehicle Inspection</h4>
                    <p className="text-sm text-gray-500">
                      Final inspection and documentation verification (2-3 business days).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-600">Delivery</h4>
                    <p className="text-sm text-gray-500">
                      Vehicle delivered to your location by {mockAuction.timeline.deliveryDate.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Download Receipt */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Receipt & Documents</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Payment Agreement
                </Button>
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Confirmation
                </Button>
              </div>
            </Card>

            {/* Support */}
            <Card className="p-6 bg-gray-50">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
                <p className="text-gray-600 mb-4">
                  Our support team is here to assist you throughout the delivery process.
                </p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Support
                  </Button>
                  <Button variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Support
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Auction Winner</h1>
              <p className="text-gray-600 mt-1">{mockAuction.title}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Step {currentStep} of {steps.length}</p>
              <p className="font-medium text-gray-900">{steps[currentStep - 1].title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep > step.id
                      ? 'bg-green-600 text-white'
                      : currentStep === step.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderStepContent()}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            variant="outline"
            className="px-6"
          >
            Previous
          </Button>

          {currentStep === 2 && !isPaid && (
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="px-8 bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? 'Processing...' : `Pay ${formatCurrency(mockAuction.payment.finalAmount)}`}
            </Button>
          )}

          {currentStep === 1 && (
            <Button
              onClick={() => setCurrentStep(2)}
              className="px-6"
            >
              Proceed to Payment
            </Button>
          )}

          {currentStep === 3 && (
            <Button
              onClick={() => navigate('/auctions')}
              className="px-6"
            >
              Browse More Auctions
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WinnerConfirmationPage;
