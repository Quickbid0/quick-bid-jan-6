import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const AuctionIntegrityMonitoringPolicy: React.FC = () => {
  usePageSEO({
    title: 'Auction Integrity & Real-Time Monitoring Policy | QuickMela',
    description: 'Defines real-time auction monitoring, anti-collusion rules, and penalties for manipulation.',
    canonicalPath: '/legal/auction-integrity-monitoring-policy',
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
          <li className="text-gray-700 dark:text-gray-200">Auction Integrity &amp; Real-Time Monitoring Policy</li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          QuickMela – Auction Fairness &amp; Anti-Manipulation Framework
        </h1>
        <p className="text-gray-600 dark:text-gray-300">Owner: Sanjeev Musugu</p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>
          To ensure fair bidding, transparent discovery, anti-collusion, anti-manipulation, zero shill bidding, and
          Bank/SARFAESI compliance.
        </p>

        <h2>2. Live Auction Monitoring</h2>
        <p>System monitors:</p>
        <ul>
          <li>Bid-to-time ratios</li>
          <li>Irregular bid jumps</li>
          <li>High-speed auto-bidding</li>
          <li>Suspicious silent bidders</li>
          <li>Buyer-seller connection</li>
          <li>IP/share patterns</li>
        </ul>

        <h2>3. Anti-Manipulation Rules</h2>
        <p>Strictly prohibited:</p>
        <ul>
          <li>Coordinated bidding</li>
          <li>Price stabilization</li>
          <li>Dummy bidders</li>
          <li>Artificial price pushing</li>
          <li>Seller bidding on own item</li>
        </ul>

        <h2>4. Real-Time Protections</h2>
        <p>AI automatically:</p>
        <ul>
          <li>Blocks shill bids</li>
          <li>Pauses auction if manipulation detected</li>
          <li>Sends alerts to compliance team</li>
          <li>Requires additional buyer verification</li>
        </ul>

        <h2>5. Penalties</h2>
        <p>Penalties may include:</p>
        <ul>
          <li>Auction cancellation</li>
          <li>User ban</li>
          <li>SARFAESI reporting</li>
          <li>Legal action</li>
        </ul>
      </article>
    </div>
  );
};

export default AuctionIntegrityMonitoringPolicy;
