import React from 'react';
import { Link } from 'react-router-dom';

const InvestLanding: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Invest in QuickMela — Earn Returns (No Equity)
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Flexible Fixed ROI and Revenue Share plans. Transparent payouts. KYC & legal agreement. Investors fund the
          QuickMela marketplace growth and receive contractual returns — not equity.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/invest/apply" className="btn btn-primary">
            Apply to Invest
          </Link>
          <a href="/docs/investor-policy.pdf" className="btn btn-outline">
            Download Policy
          </a>
          <Link to="/investors" className="btn btn-ghost">
            View Investor Pitch
          </Link>
        </div>
      </header>

      <section className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Fixed ROI Plans</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Lock-in capital for 12–18 months and receive predictable fixed returns.
          </p>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>• Minimum ₹25,000</li>
            <li>• 12 months → target ~15% return (example)</li>
            <li>• 18 months → target ~18–24% return (tiered)</li>
            <li>• Payout frequency: Monthly / Quarterly / End-of-tenure</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Revenue Share Plan</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Participate in a share of marketplace revenue generated using the invested pool.
          </p>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>• Minimum ₹50,000</li>
            <li>• 2–5% revenue share on funded revenue streams</li>
            <li>• Target 120–130% total return cap</li>
            <li>• Payouts as revenue is realized and reconciled</li>
          </ul>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold mb-2">Trust & Compliance</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            No equity. Legal agreement. KYC + PAN required. Investor funds are tracked in a separate pool with ledgered
            entries and statements.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold mb-2">Transparent Ledger</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Every contribution, payout, fee, and tax entry is recorded in an investor ledger. Download statements and
            TDS certificates.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold mb-2">Simple Application</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Fill the online form, complete KYC, sign the Investment Agreement, and transfer funds. Our team guides you
            through each step.
          </p>
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-gray-900/60 rounded-2xl p-6 md:p-8">
        <h2 className="text-2xl font-semibold mb-3">How it works</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-200 text-sm">
          <li>Submit your interest and basic details on the Apply to Invest form.</li>
          <li>Upload KYC documents (PAN, Aadhaar) and confirm bank details for payouts.</li>
          <li>Review and sign the Investment & Revenue Share Agreement (digital or PDF).
          </li>
          <li>Transfer funds to the designated account and share UTR/transaction reference.</li>
          <li>Once reconciled, your plan is activated and you can track returns in the investor dashboard.</li>
        </ol>
      </section>
    </div>
  );
};

export default InvestLanding;
