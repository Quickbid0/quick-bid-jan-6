import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const DeviceFingerprintingPolicy: React.FC = () => {
  usePageSEO({
    title: 'Device Security & Fingerprinting Policy | QuickMela',
    description:
      'Details of the QuickMela device fingerprinting framework used to detect multi-account fraud and device-based risks.',
    canonicalPath: '/legal/device-fingerprinting-policy',
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
          <li className="text-gray-700 dark:text-gray-200">Device Security &amp; Fingerprinting Policy</li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          QuickMela – Device Security &amp; Fingerprinting Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Legal Owner: Sanjeev Musugu &middot; Last Updated: 20 November 2025
        </p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>To identify every device used to access QuickMela and prevent multi-account fraud.</p>

        <h2>2. What We Capture</h2>
        <p>QuickMela collects:</p>
        <ul>
          <li>Device ID</li>
          <li>OS &amp; browser version</li>
          <li>Hardware signatures</li>
          <li>Motion sensors (mobile)</li>
          <li>IP &amp; network fingerprint</li>
          <li>VPN/TOR detection</li>
        </ul>

        <h2>3. Prohibited Actions</h2>
        <p>Strictly prohibited:</p>
        <ul>
          <li>Using multiple devices to bypass bans</li>
          <li>Emulator or virtual device usage</li>
          <li>Device spoofing</li>
        </ul>

        <h2>4. Automatic Device Blocks</h2>
        <p>Triggered if:</p>
        <ul>
          <li>OS signature mismatch</li>
          <li>Too many accounts on one device</li>
          <li>Sudden region changes</li>
        </ul>
      </article>
    </div>
  );
};

export default DeviceFingerprintingPolicy;
