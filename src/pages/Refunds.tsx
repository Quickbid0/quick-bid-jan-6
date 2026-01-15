import React from 'react';

const Refunds: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Cancellation & Refunds Policy</h1>
      <p className="text-gray-600 mb-3">This Cancellation & Refunds Policy describes how cancellations, token fees, deposits, and refunds are handled on QuickBid, owned and operated by Tekvoro Technologies Pvt Ltd.</p>
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-500">
        <span>Last updated: {new Date().toLocaleDateString()}</span>
        <span className="text-gray-500">
          Refund support: <a href="mailto:support@quickbid.com" className="text-indigo-600 hover:text-indigo-800">support@quickbid.com</a>
        </span>
      </div>
      <div className="mb-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
        <p className="font-semibold mb-2 text-xs uppercase tracking-wide text-gray-500">On this page</p>
        <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
          <li><a href="#token" className="text-indigo-600 hover:text-indigo-800">Token Fee (₹100)</a></li>
          <li><a href="#deposit" className="text-indigo-600 hover:text-indigo-800">Security Deposit</a></li>
          <li><a href="#cancellation" className="text-indigo-600 hover:text-indigo-800">Order Cancellation</a></li>
          <li><a href="#request" className="text-indigo-600 hover:text-indigo-800">How to Request a Refund</a></li>
          <li><a href="#contact" className="text-indigo-600 hover:text-indigo-800">Contact</a></li>
        </ul>
      </div>

      <h2 id="token" className="text-xl font-semibold mt-6 mb-2">Token Fee (₹100)</h2>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Token fee is non-refundable and used to verify serious buyers.</li>
        <li>In case of duplicate charge by error, please contact support with payment reference.</li>
      </ul>

      <h2 id="deposit" className="text-xl font-semibold mt-6 mb-2">Security Deposit</h2>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Deposits are fully refundable if you do not win the auction or if the auction is cancelled.</li>
        <li>Refund timelines: typically 5–7 business days post-auction completion, subject to banking partners.</li>
        <li>In case of disputes or chargebacks, refunds may be paused pending resolution.</li>
      </ul>

      <h2 id="cancellation" className="text-xl font-semibold mt-6 mb-2">Order Cancellation</h2>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Winning bids constitute a binding commitment; cancellations after winning may lead to forfeiture of deposit as per seller policy.</li>
        <li>If an auction/listing is cancelled by the seller or platform, deposits are refunded.</li>
      </ul>

      <h2 id="request" className="text-xl font-semibold mt-6 mb-2">How to Request a Refund</h2>
      <ul className="list-disc pl-6 space-y-2 text-gray-700">
        <li>Email support@quickbid.com with subject “Refund Request” and include payment reference and product link.</li>
        <li>We will acknowledge within 2 business days and share next steps.</li>
      </ul>

      <h2 id="contact" className="text-xl font-semibold mt-6 mb-2">Contact</h2>
      <p className="text-gray-700">For refund queries, contact support@quickbid.com</p>
    </div>
  );
};

export default Refunds;
