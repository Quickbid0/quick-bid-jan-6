import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const AutomatedFraudEscalationPolicy: React.FC = () => {
  usePageSEO({
    title: 'Automated Fraud Escalation Policy | QuickMela',
    description: 'Describes how AI fraud alerts escalate to compliance review and legal action.',
    canonicalPath: '/legal/automated-fraud-escalation-policy',
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
          <li className="text-gray-700 dark:text-gray-200">Automated Fraud Escalation Policy</li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          QuickMela – Real-Time Fraud Response &amp; Escalation Framework
        </h1>
        <p className="text-gray-600 dark:text-gray-300">Owner: Sanjeev Musugu</p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>Defines how AI alerts escalate to human review and legal action.</p>

        <h2>2. Escalation Levels</h2>
        <h3>Level 1 – AI Auto-Flag</h3>
        <p>Triggered by:</p>
        <ul>
          <li>IP mismatch</li>
          <li>Device mismatch</li>
          <li>Sudden high bidding</li>
          <li> suspicious listing</li>
        </ul>
        <p>System response:</p>
        <ul>
          <li>Limit actions</li>
          <li>Force KYC or face check</li>
        </ul>

        <h3>Level 2 – Compliance Review</h3>
        <p>Triggered by:</p>
        <ul>
          <li>Deposit anomalies</li>
          <li>Conflicting identity data</li>
          <li>Payment mismatch</li>
          <li>SARFAESI irregularities</li>
        </ul>
        <p>Compliance team may:</p>
        <ul>
          <li>Freeze account</li>
          <li>Request additional documents</li>
        </ul>

        <h3>Level 3 – Legal Escalation</h3>
        <p>Triggered when:</p>
        <ul>
          <li>Fraud is confirmed</li>
          <li>User is part of a fraud ring</li>
          <li>SARFAESI manipulation</li>
          <li>Bank asset tampering</li>
        </ul>
        <p>Actions:</p>
        <ul>
          <li>FIR under IPC 420 / IT Act 66D</li>
          <li>Blacklisting</li>
          <li>Deposit forfeiture</li>
        </ul>
      </article>
    </div>
  );
};

export default AutomatedFraudEscalationPolicy;
