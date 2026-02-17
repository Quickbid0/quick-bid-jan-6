import React, { useState } from 'react';
import {
  Calculator,
  CheckCircle,
  AlertCircle,
  Banknote,
  CreditCard,
  Building2,
  TrendingUp,
  DollarSign,
  Calendar,
  X,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock loan eligibility data
const mockLoanData = {
  banks: [
    {
      id: 'hdfc',
      name: 'HDFC Bank',
      logo: '🏦',
      interestRate: 12.5,
      processingFee: 0.5,
      maxTenure: 84,
      approvalTime: '24 hours'
    },
    {
      id: 'icici',
      name: 'ICICI Bank',
      logo: '🏛️',
      interestRate: 11.8,
      processingFee: 0.3,
      maxTenure: 72,
      approvalTime: '12 hours'
    },
    {
      id: 'sbi',
      name: 'State Bank of India',
      logo: '🇮🇳',
      interestRate: 13.2,
      processingFee: 0,
      maxTenure: 60,
      approvalTime: '48 hours'
    }
  ]
};

interface LoanEligibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  auctionPrice?: number;
}

const LoanEligibilityModal: React.FC<LoanEligibilityModalProps> = ({
  isOpen,
  onClose,
  auctionPrice = 1000000
}) => {
  const [step, setStep] = useState<'form' | 'loading' | 'results'>('form');
  const [formData, setFormData] = useState({
    monthlyIncome: '',
    employmentType: '',
    existingEMI: '',
    cibilConsent: false
  });
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateEligibility = async () => {
    setStep('loading');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock calculation based on inputs
    const income = parseFloat(formData.monthlyIncome) || 0;
    const existingEmi = parseFloat(formData.existingEMI) || 0;

    // Simple risk assessment
    let riskTier = 'D';
    let maxLoanPercent = 0.5;

    if (income >= 50000 && existingEmi / income <= 0.3) {
      riskTier = 'A';
      maxLoanPercent = 0.9;
    } else if (income >= 30000 && existingEmi / income <= 0.4) {
      riskTier = 'B';
      maxLoanPercent = 0.8;
    } else if (income >= 25000 && existingEmi / income <= 0.5) {
      riskTier = 'C';
      maxLoanPercent = 0.7;
    }

    const maxLoanAmount = Math.min(auctionPrice * maxLoanPercent, income * 60);
    const downPayment = auctionPrice - maxLoanAmount;

    // Calculate EMI for different tenures
    const interestRate = riskTier === 'A' ? 0.125 : riskTier === 'B' ? 0.132 : 0.145;
    const emiOptions = [12, 24, 36, 48, 60].map(tenure => {
      const monthlyRate = interestRate / 12;
      const emi = (maxLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
                 (Math.pow(1 + monthlyRate, tenure) - 1);
      const totalAmount = emi * tenure;
      const totalInterest = totalAmount - maxLoanAmount;

      return {
        tenure,
        emi: Math.round(emi),
        totalAmount: Math.round(totalAmount),
        totalInterest: Math.round(totalInterest)
      };
    });

    // Select best bank offers
    const bankOffers = mockLoanData.banks.map(bank => ({
      ...bank,
      eligibleAmount: maxLoanAmount,
      adjustedRate: riskTier === 'A' ? bank.interestRate - 0.5 :
                     riskTier === 'B' ? bank.interestRate : bank.interestRate + 0.5
    }));

    setEligibilityResult({
      riskTier,
      maxLoanAmount: Math.round(maxLoanAmount),
      downPayment: Math.round(downPayment),
      emiOptions,
      bankOffers
    });

    setStep('results');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
}
}
}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Calculator className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Loan Eligibility Check</h2>
                <p className="text-gray-600">Get instant pre-approval for your dream car</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'form' && (
            <div className="space-y-6">
              {/* Vehicle Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Price
                </label>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(auctionPrice)}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Income *
                  </label>
                  <input
                    type="number"
                    placeholder="₹50,000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.monthlyIncome}
                    onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment Type *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.employmentType}
                    onChange={(e) => handleInputChange('employmentType', e.target.value)}
                  >
                    <option value="">Select type</option>
                    <option value="salaried">Salaried</option>
                    <option value="self-employed">Self-employed</option>
                    <option value="business">Business Owner</option>
                    <option value="government">Government Employee</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Existing Monthly EMI
                  </label>
                  <input
                    type="number"
                    placeholder="₹0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.existingEMI}
                    onChange={(e) => handleInputChange('existingEMI', e.target.value)}
                  />
                </div>
              </div>

              {/* CIBIL Consent */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <input
                  type="checkbox"
                  id="cibil-consent"
                  className="mt-1"
                  checked={formData.cibilConsent}
                  onChange={(e) => handleInputChange('cibilConsent', e.target.checked)}
                />
                <div>
                  <label htmlFor="cibil-consent" className="text-sm font-medium text-gray-900">
                    I consent to CIBIL score check
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    We need your consent to check your credit score for loan eligibility assessment.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={calculateEligibility}
                disabled={!formData.monthlyIncome || !formData.employmentType || !formData.cibilConsent}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
              >
                Check My Eligibility
              </Button>
            </div>
          )}

          {step === 'loading' && (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Checking Your Eligibility
              </h3>
              <p className="text-gray-600">
                We're analyzing your details and connecting with banks...
              </p>
            </div>
          )}

          {step === 'results' && eligibilityResult && (
            <div className="space-y-6">
              {/* Risk Tier */}
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  eligibilityResult.riskTier === 'A' ? 'bg-green-100 text-green-800' :
                  eligibilityResult.riskTier === 'B' ? 'bg-blue-100 text-blue-800' :
                  eligibilityResult.riskTier === 'C' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {eligibilityResult.riskTier === 'A' && <CheckCircle className="h-4 w-4" />}
                  {eligibilityResult.riskTier === 'B' && <TrendingUp className="h-4 w-4" />}
                  {eligibilityResult.riskTier === 'C' && <AlertCircle className="h-4 w-4" />}
                  {eligibilityResult.riskTier === 'D' && <AlertCircle className="h-4 w-4" />}
                  Risk Tier {eligibilityResult.riskTier}
                </div>
              </div>

              {/* Eligibility Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 text-center">
                  <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Eligible Loan Amount</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(eligibilityResult.maxLoanAmount)}
                  </p>
                </Card>

                <Card className="p-4 text-center">
                  <Banknote className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Down Payment</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(eligibilityResult.downPayment)}
                  </p>
                </Card>

                <Card className="p-4 text-center">
                  <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Monthly EMI (36 months)</p>
                  <p className="text-xl font-bold text-purple-600">
                    {formatCurrency(eligibilityResult.emiOptions.find((opt: any) => opt.tenure === 36)?.emi || 0)}
                  </p>
                </Card>
              </div>

              {/* EMI Breakdown */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">EMI Options</h3>
                <div className="space-y-3">
                  {eligibilityResult.emiOptions.map((option: any) => (
                    <div key={option.tenure} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{option.tenure} Months</p>
                        <p className="text-sm text-gray-600">
                          Total: {formatCurrency(option.totalAmount)} • Interest: {formatCurrency(option.totalInterest)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">
                          {formatCurrency(option.emi)}/month
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Bank Offers */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Offers</h3>
                <div className="space-y-3">
                  {eligibilityResult.bankOffers.map((bank: any) => (
                    <div key={bank.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{bank.logo}</span>
                        <div>
                          <p className="font-medium">{bank.name}</p>
                          <p className="text-sm text-gray-600">
                            {bank.adjustedRate}% interest • {bank.approcessingFee}% fee
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Approval in</p>
                        <p className="font-medium">{bank.approvalTime}</p>
                        <Button size="sm" className="mt-2">
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={() => setStep('form')} variant="outline" className="flex-1">
                  Recheck Eligibility
                </Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  Proceed with Application
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanEligibilityModal;
