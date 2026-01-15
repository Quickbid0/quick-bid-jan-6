import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const AMLPolicy: React.FC = () => {
  usePageSEO({
    title: 'AML & Financial Integrity Policy | QuickMela',
    description: 'Details the QuickMela AML controls to prevent money laundering and high-risk financial misuse.',
    canonicalPath: '/legal/aml-financial-integrity-policy',
    robots: 'index,follow',
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <nav className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link to="/" className="hover:text-primary-600">
              Home
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link to="/legal" className="hover:text-primary-600">
              Legal
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-700 dark:text-gray-200">AML &amp; Financial Integrity Policy</li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          QuickMela – AML &amp; Financial Integrity Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Owner: Sanjeev Musugu &middot; Aligned with RBI, FIU-IND, PMLA Act, SARFAESI Rules
        </p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>
          To prevent QuickMela from being used for money laundering, fraudulent transactions, black-money circulation,
          high-risk payment routing, or illegal financing activities.
        </p>

        <h2>2. AML Verification</h2>
        <p>QuickMela checks:</p>
        <ul>
          <li>PAN match</li>
          <li>Name match with bank account</li>
          <li>UPI VPA verification</li>
          <li>High-value suspicious transaction reports</li>
          <li>Wallet-to-wallet abnormal activity</li>
        </ul>

        <h2>3. Suspicious Transaction Indicators</h2>
        <p>Examples include:</p>
        <ul>
          <li>Large deposits without bidding</li>
          <li>Sudden bidding on multiple assets</li>
          <li>Unusual refund requests</li>
          <li>Bids far above asset value</li>
          <li>Payment from unrelated third parties</li>
        </ul>

        <h2>4. AML Actions</h2>
        <p>If AML red flags appear, QuickMela may:</p>
        <ul>
          <li>Freeze wallet</li>
          <li>Freeze bidding</li>
          <li>Report to FIU-IND</li>
          <li>Alert SARFAESI partner banks</li>
          <li>Blacklist PAN</li>
        </ul>

        <h2>5. Penalties</h2>
        <p>If laundering is confirmed:</p>
        <ul>
          <li>Permanent ban</li>
          <li>Account seizure</li>
          <li>Legal FIR</li>
          <li>Reporting to FIU-IND</li>
          <li>Civil and criminal penalties</li>
        </ul>
      </article>
    </div>
  );
};

export default AMLPolicy;
