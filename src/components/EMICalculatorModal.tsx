import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingUp, IndianRupee, Calendar, Percent } from 'lucide-react';
import { useState } from 'react';

interface EMICalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemPrice?: number;
  title?: string;
}

export const EMICalculatorModal: React.FC<EMICalculatorModalProps> = ({
  isOpen,
  onClose,
  itemPrice = 0,
  title = 'EMI Calculator'
}) => {
  const [loanAmount, setLoanAmount] = useState(itemPrice);
  const [interestRate, setInterestRate] = useState(12);
  const [tenureYears, setTenureYears] = useState(5);
  const [downPayment, setDownPayment] = useState(20);

  if (!isOpen) return null;

  const calculateEMI = () => {
    const principal = loanAmount * (1 - downPayment / 100);
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = tenureYears * 12;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    return Math.round(emi);
  };

  const calculateTotalAmount = () => {
    return calculateEMI() * tenureYears * 12;
  };

  const calculateTotalInterest = () => {
    return calculateTotalAmount() - (loanAmount * (1 - downPayment / 100));
  };

  const emi = calculateEMI();
  const totalAmount = calculateTotalAmount();
  const totalInterest = calculateTotalInterest();
  const principal = loanAmount * (1 - downPayment / 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden">
        <Card className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calculator className="h-8 w-8 text-blue-500" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-600">Calculate your monthly EMI</p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </Button>
          </div>

          {/* Calculator Inputs */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Loan Amount (₹)</label>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Down Payment (%)</label>
                <input
                  type="number"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Interest Rate (%)</label>
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  step="0.1"
                  min="1"
                  max="30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tenure (Years)</label>
                <input
                  type="number"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  min="1"
                  max="30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-blue-50 rounded-lg p-4 space-y-3">
            <div className="text-center">
              <p className="text-sm text-blue-600">Monthly EMI</p>
              <p className="text-3xl font-bold text-blue-700">₹{emi.toLocaleString('en-IN')}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-600">Principal Amount</p>
                <p className="font-semibold text-gray-900">₹{principal.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Total Interest</p>
                <p className="font-semibold text-gray-900">₹{totalInterest.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="text-center pt-2 border-t border-blue-200">
              <p className="text-sm text-gray-600">Total Amount Payable</p>
              <p className="text-xl font-bold text-blue-700">₹{totalAmount.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Bank Partnerships */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Partner Banks</span>
            </div>
            <p className="text-sm text-green-600 mb-3">Get instant loan approval from our banking partners</p>
            <div className="flex gap-2">
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                Apply Now
              </Button>
              <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                Compare Banks
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <IndianRupee className="h-4 w-4 mr-2" />
              Get Loan Quote
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EMICalculatorModal;
