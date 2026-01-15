import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const BehaviouralMonitoringPolicy: React.FC = () => {
  usePageSEO({
    title: 'Behavioural Monitoring Policy | QuickMela',
    description: 'Describes how QuickMela tracks behaviour patterns to detect fraud and abnormal activity.',
    canonicalPath: '/legal/behavioural-monitoring-policy',
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
          <li className="text-gray-700 dark:text-gray-200">Behavioural Monitoring Policy</li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          QuickMela – Behavioural Pattern &amp; Anomaly Detection Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Legal Owner: Sanjeev Musugu, Tekvoro Technologies &middot; Last Updated: 20 November 2025
        </p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>
          To detect suspicious or abnormal buyer/seller behavior during bidding, login, payments, listing creation, and
          pickup processes. Behavioural monitoring helps prevent shill bidding, coordinated fraud, and auction
          manipulation.
        </p>

        <h2>2. What Behaviour AI Tracks</h2>
        <p>AI tracks:</p>
        <ul>
          <li>Rapid bid acceleration</li>
          <li>Odd-hour bot-like activity</li>
          <li>Sudden deposit &rarr; bid &rarr; withdrawal patterns</li>
          <li>Switching between multiple accounts</li>
          <li>Repeated bidding &amp; cancelling</li>
          <li>Hiding device/IP details</li>
          <li>Hover/click behavior anomalies</li>
          <li>Speed-of-action inconsistencies</li>
          <li>SARFAESI bidder unusual patterns</li>
        </ul>

        <h2>3. Behaviour Triggers</h2>
        <p>AI flags:</p>
        <ul>
          <li>Abnormal click speed</li>
          <li>Superhuman multitasking</li>
          <li>Simultaneous sessions</li>
          <li>Patterns similar to high-risk users</li>
          <li>Multiple failed payments</li>
          <li>OTP spam or auto-fill attempts</li>
        </ul>

        <h2>4. Penalties</h2>
        <p>If suspicious behaviour is confirmed:</p>
        <ul>
          <li>Temporary restriction</li>
          <li>Forced re-verification</li>
          <li>High-risk score</li>
          <li>Account freeze</li>
          <li>FIR under IPC 420 if fraud is verified</li>
        </ul>
      </article>
    </div>
  );
};

export default BehaviouralMonitoringPolicy;
