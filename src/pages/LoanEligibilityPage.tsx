import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import LoanEligibilityModal from '@/components/LoanEligibilityModal';

const LoanEligibilityPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          QuickMela Loan Eligibility
        </h1>
        <p className="text-gray-600 mb-8">
          Check your loan eligibility instantly and get pre-approved for your dream car.
        </p>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
        >
          Check My Eligibility
        </Button>
      </div>

      <LoanEligibilityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        auctionPrice={1500000}
      />
    </div>
  );
};

export default LoanEligibilityPage;
