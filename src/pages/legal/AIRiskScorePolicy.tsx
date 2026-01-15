import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const AIRiskScorePolicy: React.FC = () => {
  usePageSEO({
    title: 'AI Risk Scoring Policy | QuickMela',
    description:
      'Overview of the QuickMela AI-driven risk score system, factors, risk levels, and automatic enforcement actions.',
    canonicalPath: '/legal/ai-risk-score-policy',
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
          <li className="text-gray-700 dark:text-gray-200">AI Risk Scoring Policy</li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          QuickMela – AI Risk Scoring Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Legal Owner: Sanjeev Musugu &middot; Last Updated: 20 November 2025
        </p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>Defines the automated system calculating a Risk Score (0–100) for each user.</p>

        <h2>2. Factors Impacting Risk Score</h2>
        <p>AI checks:</p>
        <ul>
          <li>Name/ID mismatch</li>
          <li>IP anomalies</li>
          <li>Device mismatch</li>
          <li>Payment mismatch</li>
          <li>SARFAESI blacklist</li>
          <li>Behavioral red flags</li>
          <li>Odometer/tampering fraud</li>
          <li>Multiple OTP failures</li>
          <li>Abnormal session patterns</li>
        </ul>

        <h2>3. Risk Levels</h2>
        <ul>
          <li>0–30: Normal User</li>
          <li>30–60: Suspicious</li>
          <li>60–80: High Risk (limited access)</li>
          <li>80–100: Critical (banned)</li>
        </ul>

        <h2>4. Automatic Actions</h2>
        <p>AI may:</p>
        <ul>
          <li>Block bidding</li>
          <li>Increase deposit requirements</li>
          <li>Require face verification</li>
          <li>Restrict wallet withdrawals</li>
          <li>Freeze account</li>
        </ul>
      </article>
    </div>
  );
};

export default AIRiskScorePolicy;
