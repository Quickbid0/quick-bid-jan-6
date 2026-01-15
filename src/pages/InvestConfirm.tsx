import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const InvestConfirm: React.FC = () => {
  const [params] = useSearchParams();
  const id = params.get('id');

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Investment Application Submitted</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Thank you for applying to invest in QuickMela. Your application has been received and our team will review your
        details, complete KYC, and share the Investment Agreement and funding instructions.
      </p>

      {id && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm text-sm text-gray-700 dark:text-gray-200">
          <p className="font-semibold mb-1">Reference ID</p>
          <p className="font-mono break-all">{id}</p>
        </div>
      )}

      <section className="bg-gray-50 dark:bg-gray-900/60 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-200 space-y-2">
        <h2 className="font-semibold mb-1">Next steps</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>You will receive an email/WhatsApp confirmation with your application details.</li>
          <li>Our team will schedule a quick call to confirm plan type, amount, and payout preferences.</li>
          <li>You will receive the Investment Agreement for e-sign or PDF signature.</li>
          <li>After signature, we will share bank details for fund transfer and UTR capture.</li>
          <li>Once funds are reconciled, we will activate your plan and enable the investor dashboard.</li>
        </ol>
      </section>

      <div className="flex gap-3">
        <Link to="/invest" className="btn btn-outline">
          Back to Invest page
        </Link>
        <Link to="/investors" className="btn btn-primary">
          View Investor Pitch
        </Link>
      </div>
    </div>
  );
};

export default InvestConfirm;
