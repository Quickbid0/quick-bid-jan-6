import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const AIExplainabilityPolicy: React.FC = () => {
  usePageSEO({
    title: 'AI Explainability & Human Oversight Policy | QuickMela',
    description: 'Ensures AI-driven decisions are explainable and always subject to human review.',
    canonicalPath: '/legal/ai-explainability-human-oversight-policy',
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
          <li className="text-gray-700 dark:text-gray-200">AI Explainability &amp; Human Oversight Policy</li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          QuickMela – AI Transparency &amp; Manual Review Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">Owner: Sanjeev Musugu</p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>
          To ensure AI decisions (risk scores, fraud flags, tampering alerts, listing validation) can be explained,
          evaluated, and overridden by a human.
        </p>

        <h2>2. Explainability Rules</h2>
        <p>QuickMela maintains:</p>
        <ul>
          <li>Logs of why AI flagged a user</li>
          <li>Audit trails showing AI inputs</li>
          <li>Reason codes (e.g., device mismatch, location anomaly)</li>
        </ul>

        <h2>3. Mandatory Human Oversight</h2>
        <p>Human review is required for:</p>
        <ul>
          <li>High-value auctions</li>
          <li>SARFAESI fraudulent cases</li>
          <li>Bank escalations</li>
          <li>Any permanent ban</li>
          <li>Transport disputes</li>
        </ul>
        <p>AI NEVER has the final authority alone.</p>

        <h2>4. Buyer/Seller Rights</h2>
        <p>Users may request clarity on:</p>
        <ul>
          <li>Why they were flagged</li>
          <li>Which AI signals triggered the risk</li>
        </ul>
        <p>But users cannot request model weights or confidential algorithms.</p>
      </article>
    </div>
  );
};

export default AIExplainabilityPolicy;
