import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const MultiAccountDetectionPolicy: React.FC = () => {
  usePageSEO({
    title: 'Multi-Account Detection Policy | QuickMela',
    description: 'Details of how QuickMela detects and penalizes duplicate and collusive accounts.',
    canonicalPath: '/legal/multi-account-detection-policy',
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
          <li className="text-gray-700 dark:text-gray-200">Multi-Account Detection Policy</li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          QuickMela – Multi-Account &amp; Duplicate Identity Detection Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">Owner: Sanjeev Musugu</p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>
          Strict prevention of:
        </p>
        <ul>
          <li>Buyer creating multiple accounts</li>
          <li>Seller creating duplicate seller profiles</li>
          <li>Family/friend accounts used to manipulate auctions</li>
        </ul>

        <h2>2. Detection Methods</h2>
        <p>QuickMela uses:</p>
        <ul>
          <li>Device fingerprint</li>
          <li>Phone number clustering</li>
          <li>PAN/Aadhaar duplicate detection</li>
          <li>Behavior clustering</li>
          <li>Shared IP detection</li>
        </ul>

        <h2>3. Penalties</h2>
        <p>Penalties may include:</p>
        <ul>
          <li>Account suspension</li>
          <li>Deposit forfeiture</li>
          <li>SARFAESI escalation</li>
          <li>FIR for fraud (IPC 420)</li>
        </ul>
      </article>
    </div>
  );
};

export default MultiAccountDetectionPolicy;
