import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const type = params.get('type') || 'payment';
  const back = params.get('back') || '/';

  const title =
    type === 'token'
      ? 'Token Fee Paid Successfully'
      : type === 'security'
        ? 'Security Deposit Received'
        : type === 'visit'
          ? 'Visit Booking Payment Successful'
          : 'Payment Successful';

  const description =
    type === 'token'
      ? 'Your one-time token fee has been received. This unlocks access to serious buyer features on Quick Mela.'
      : type === 'security'
        ? 'Your refundable security deposit is now recorded. You can safely participate in bidding for this asset.'
        : type === 'visit'
          ? 'Your inspection visit payment has been received. Our team will confirm the visit details shortly.'
          : 'We received your payment successfully.';

  return (
    <div className="max-w-xl mx-auto px-6 py-16 text-center">
      <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-3">{title}</h1>
      <p className="text-gray-600 mb-6">{description}</p>

      <div className="mb-6 text-left inline-block text-sm text-gray-700">
        <p className="font-semibold mb-2">What happens next?</p>
        <ul className="list-disc list-inside space-y-1 text-left">
          {type === 'token' && (
            <>
              <li>Use the same account to pay the refundable security deposit for any auction you want to join.</li>
              <li>You can now complete your KYC and start exploring high-value auctions.</li>
            </>
          )}
          {type === 'security' && (
            <>
              <li>Return to the product page and place your bid before the auction timer ends.</li>
              <li>Your deposit stays safely held and is refunded if you do not win.</li>
            </>
          )}
          {type === 'visit' && (
            <>
              <li>Check your dashboard or email for visit confirmation and time slot.</li>
              <li>Carry a valid ID proof when you arrive at the inspection location.</li>
            </>
          )}
          {type !== 'token' && type !== 'security' && type !== 'visit' && (
            <li>You can review this payment and related activity from your dashboard.</li>
          )}
        </ul>
      </div>

      <div className="flex gap-3 justify-center">
        <Link
          to={back}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          {type === 'token'
            ? 'Continue to Pay Deposit'
            : type === 'security'
              ? 'Back to Product & Bid'
              : type === 'visit'
                ? 'View Visit Details'
                : 'Return'}
          <ArrowRight className="w-4 h-4" />
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

export default PaymentSuccess;
