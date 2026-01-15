import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const PaymentFailed: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const type = params.get('type') || 'payment';
  const back = params.get('back') || '/';

  const title =
    type === 'token'
      ? 'Token Payment Could Not Be Completed'
      : type === 'security'
        ? 'Security Deposit Payment Failed'
        : type === 'visit'
          ? 'Visit Booking Payment Failed'
          : 'Payment Failed';

  return (
    <div className="max-w-xl mx-auto px-6 py-16 text-center">
      <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-3">{title}</h1>
      <p className="text-gray-600 mb-4">
        Your {type} could not be completed. This can happen due to network issues, incorrect card details, or a
        timeout from your bank.
      </p>

      <div className="mb-6 text-left inline-block text-sm text-gray-700">
        <p className="font-semibold mb-2">You can try the following:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Check your internet connection and payment method details.</li>
          <li>Try the payment again after a few minutes.</li>
          <li>If money was debited but not reflected, check your bank/SMS before retrying.</li>
        </ul>
      </div>

      <div className="flex gap-3 justify-center">
        <Link
          to={back}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Retry / Go Back
        </Link>
        <Link
          to="/dashboard"
          className="px-5 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default PaymentFailed;
