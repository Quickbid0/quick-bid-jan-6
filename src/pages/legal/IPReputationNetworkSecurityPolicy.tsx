import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const IPReputationNetworkSecurityPolicy: React.FC = () => {
  usePageSEO({
    title: 'IP Reputation & Network Security Policy | QuickMela',
    description: 'Explains how QuickMela evaluates IP reputation and network behaviour to block bots and high-risk traffic.',
    canonicalPath: '/legal/ip-reputation-network-security-policy',
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
          <li className="text-gray-700 dark:text-gray-200">IP Reputation &amp; Network Security Policy</li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          QuickMela – Network, IP, and Traffic Reputation Analysis Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">Owner: Sanjeev Musugu</p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>
          To protect QuickMela from bots, scrapers, proxy/VPN attacks, TOR users, suspicious foreign IPs, high-risk IP
          clusters, and datacenter fraud networks.
        </p>

        <h2>2. IP Checks</h2>
        <p>AI and network systems check:</p>
        <ul>
          <li>IP location</li>
          <li>Proxy/VPN detection</li>
          <li>TOR exit node flags</li>
          <li>Datacenter IP blocks</li>
          <li>IP-to-Device consistency</li>
          <li>IP used by multiple accounts</li>
          <li>IP involved in SARFAESI fraud networks</li>
        </ul>

        <h2>3. When IP Is Blocked</h2>
        <p>IPs may be blocked automatically if:</p>
        <ul>
          <li>International IP connecting to Indian-only auctions</li>
          <li>Bots requesting too frequently</li>
          <li>IP attempts scraping</li>
          <li>Fraud signatures match</li>
          <li>High-risk ASN</li>
          <li>SARFAESI blacklist matches</li>
        </ul>

        <h2>4. Auto Enforcement</h2>
        <p>System actions may include:</p>
        <ul>
          <li>Temporary block (12–48 hours)</li>
          <li>Permanent ban for repeated violations</li>
          <li>Legal escalation if part of fraud ring</li>
        </ul>
      </article>
    </div>
  );
};

export default IPReputationNetworkSecurityPolicy;
