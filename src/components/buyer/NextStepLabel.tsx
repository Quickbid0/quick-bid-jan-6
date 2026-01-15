import React from 'react';

export interface NextStepLabelProps {
  auctionStatus?: string | null;
  payoutStatus?: string | null;
  paymentStatus?: string | null; // from win_payments.status if available
}

const normalize = (value?: string | null) => (value || '').toLowerCase();

export const NextStepLabel: React.FC<NextStepLabelProps> = ({ auctionStatus, payoutStatus, paymentStatus }) => {
  const a = normalize(auctionStatus);
  const p = normalize(payoutStatus);
  const pay = normalize(paymentStatus);

  let label = 'No immediate action needed';
  let tone: 'info' | 'primary' | 'warning' | 'danger' | 'success' = 'info';

  // Payment-specific guidance (win_payments.status)
  if (pay === 'pending_verification') {
    label = 'Our Accounts team is reviewing your payment.';
    tone = 'primary';
  } else if (pay === 'approved') {
    label = 'Your payment is verified. Watch for delivery / pickup instructions.';
    tone = 'success';
  } else if (pay === 'rejected') {
    label = 'Your payment was rejected. Please re-submit correct details or contact support.';
    tone = 'danger';
  } else if (pay === 'pending_documents') {
    label = 'Please upload or share the additional documents requested by Accounts.';
    tone = 'warning';
  } else if (pay === 'partial_payment') {
    label = 'We have recorded a partial payment. Please complete the remaining amount.';
    tone = 'warning';
  } else if (pay === 'refund_in_progress') {
    label = 'A refund is in progress for this payment. Watch for bank / wallet updates.';
    tone = 'info';
  }

  // Auction-level guidance when no explicit paymentStatus overrides
  if (pay === '' || pay === undefined) {
    if (a === 'payment_pending') {
      label = 'Complete payment to confirm your win.';
      tone = 'primary';
    } else if (a === 'payment_under_review') {
      label = 'Your payment is under review by Accounts.';
      tone = 'primary';
    } else if (a === 'paid') {
      label = 'Payment is marked as paid. Next, wait for delivery / pickup instructions.';
      tone = 'success';
    } else if (a === 'delivery_in_progress') {
      label = 'Delivery / pickup is in progress. Keep your phone handy for updates.';
      tone = 'primary';
    } else if (a === 'delivered' || a === 'closed') {
      label = 'This win is completed. No further action is required.';
      tone = 'info';
    }
  }

  // Payout-level hint (seller settlement) is more informational for buyer
  if (!pay && !a && p === 'pending') {
    label = 'Seller settlement is being computed. This will not change what you pay.';
    tone = 'info';
  }

  let className = 'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ';
  if (tone === 'primary') className += 'bg-indigo-50 text-indigo-700';
  else if (tone === 'success') className += 'bg-green-50 text-green-700';
  else if (tone === 'warning') className += 'bg-yellow-50 text-yellow-800';
  else if (tone === 'danger') className += 'bg-red-50 text-red-700';
  else className += 'bg-gray-50 text-gray-700';

  return <span className={className}>{label}</span>;
};

export default NextStepLabel;
