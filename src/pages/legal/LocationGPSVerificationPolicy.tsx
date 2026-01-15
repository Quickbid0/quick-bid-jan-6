import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const LocationGPSVerificationPolicy: React.FC = () => {
  usePageSEO({
    title: 'Location & GPS Verification Policy | QuickMela',
    description: 'Explains how QuickMela verifies location, detects geo-spoofing, and enforces penalties.',
    canonicalPath: '/legal/location-gps-verification-policy',
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
          <li className="text-gray-700 dark:text-gray-200">Location &amp; GPS Verification Policy</li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          QuickMela – Location &amp; GPS Verification Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">Owner: Sanjeev Musugu</p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>To ensure user geographic consistency and prevent geo-spoofing.</p>

        <h2>2. Verification Methods</h2>
        <p>QuickMela uses:</p>
        <ul>
          <li>GPS-based mobile verification</li>
          <li>IP geolocation</li>
          <li>Payment location match</li>
          <li>Pickup location consistency</li>
          <li>SARFAESI region validation</li>
        </ul>

        <h2>3. When Location Is Blocked</h2>
        <p>Location-based access may be blocked if:</p>
        <ul>
          <li>Sudden country changes</li>
          <li>VPN/proxy detected</li>
          <li>Multiple states in short time</li>
          <li>Pickup location mismatch</li>
        </ul>

        <h2>4. Penalties</h2>
        <p>Penalties may include:</p>
        <ul>
          <li>Temporary block</li>
          <li>Manual review</li>
          <li>Permanent ban for deliberate spoofing</li>
        </ul>
      </article>
    </div>
  );
};

export default LocationGPSVerificationPolicy;
