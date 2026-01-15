import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const AIFraudDetectionPolicy: React.FC = () => {
  usePageSEO({
    title: 'AI Fraud Detection Policy | QuickMela',
    description:
      'Details of the QuickMela AI fraud detection and prevention framework, including behavior monitoring, risk levels, and penalties.',
    canonicalPath: '/legal/ai-fraud-detection-policy',
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
          <li className="text-gray-700 dark:text-gray-200">AI Fraud Detection Policy</li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          QuickMela – AI Fraud Detection and Prevention Framework
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Legal Owner: Sanjeev Musugu, Tekvoro Technologies &middot; Last Updated: 20 November 2025
        </p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>
          This policy defines QuickMela&rsquo;s AI-driven fraud detection systems, including automated detection of
          suspicious activities, user manipulation attempts, multi-account behavior, and platform abuse.
        </p>

        <h2>2. Ownership Declaration</h2>
        <p>
          All AI models, algorithms, fraud detection systems, behavioral engines, and risk analysis tools are
          exclusively owned by Sanjeev Musugu, Founder &amp; CEO of Tekvoro Technologies. Unauthorized copying or
          reverse engineering is strictly prohibited.
        </p>

        <h2>3. Fraud Types Detected</h2>
        <p>AI monitors:</p>
        <ul>
          <li>Shill bidding</li>
          <li>Fake bidding patterns</li>
          <li>Buyer-seller collusion</li>
          <li>Price manipulation</li>
          <li>Sudden coordinated bids</li>
          <li>Multi-account behavior</li>
          <li>Location/IP shifts</li>
          <li>Fraudulent payment attempts</li>
          <li>Transport or pickup fraud</li>
          <li>SARFAESI auction manipulation</li>
        </ul>

        <h2>4. Behavior-Based AI Signals</h2>
        <p>AI evaluates:</p>
        <ul>
          <li>Bid timing</li>
          <li>Bid acceleration patterns</li>
          <li>Session irregularities</li>
          <li>Abandoned bids</li>
          <li>Identity mismatch</li>
          <li>Risky device fingerprints</li>
          <li>Suspicious payment retries</li>
        </ul>

        <h2>5. Fraud Alerts</h2>
        <p>AI flags users as:</p>
        <ul>
          <li>Low Risk &rarr; Normal</li>
          <li>Medium Risk &rarr; Limited actions</li>
          <li>High Risk &rarr; Manual review</li>
          <li>Critical Risk &rarr; Auto-ban</li>
        </ul>

        <h2>6. Penalties</h2>
        <p>If fraud is confirmed:</p>
        <ul>
          <li>Account ban</li>
          <li>Bid cancellation</li>
          <li>Deposit forfeiture</li>
          <li>Legal FIR (IPC 420 + IT Act 66D)</li>
          <li>SARFAESI escalation for seized vehicles</li>
        </ul>

        <h2>7. Consent</h2>
        <p>Using QuickMela means you consent to AI-based monitoring.</p>
      </article>
    </div>
  );
};

export default AIFraudDetectionPolicy;
