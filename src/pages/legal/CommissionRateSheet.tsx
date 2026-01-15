import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const CommissionRateSheet: React.FC = () => {
  usePageSEO({
    title: 'Commission Rate Sheet | QuickMela',
    description: 'Commission structure for banks, NBFCs, vendors, and asset partners listing seized or recovered assets on QuickMela.',
    canonicalPath: '/legal/commission-rate-sheet',
    robots: 'index,follow',
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <nav className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link to="/" className="hover:text-primary-600">Home</Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link to="/legal" className="hover:text-primary-600">Legal</Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-700 dark:text-gray-200">Commission Rate Sheet</li>
        </ol>
      </nav>
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Commission Rate Sheet
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Commission and pricing models for partners listing seized and recovered assets on QuickMela.
        </p>
      </header>
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert">
          <p>✅ 2. COMMISSION RATE SHEET</p>
          <p>(For Banks, NBFCs, Vendors, Asset Partners)</p>

          <h2>QUICKMELA – COMMISSION RATE SHEET</h2>
          <p>This Commission Sheet applies to all partners listing seized/recovered assets.</p>

          <h2>1. FIXED COMMISSION MODEL</h2>
          <p>Vehicle Type<br />
          QuickMela Fee</p>
          <ul>
            <li>Two-Wheeler – ₹1,500</li>
            <li>Three-Wheeler – ₹3,000</li>
            <li>Car – ₹5,000</li>
            <li>SUV / MUV – ₹6,500</li>
            <li>Commercial Vehicle – ₹7,500–₹12,000</li>
            <li>Heavy Equipment – ₹15,000+</li>
          </ul>

          <h2>2. PERCENTAGE COMMISSION MODEL</h2>
          <p>Asset Category<br />
          Commission</p>
          <ul>
            <li>Two-Wheelers – 1%</li>
            <li>Cars – 1.5%</li>
            <li>Commercial Vehicles – 2%</li>
            <li>Heavy Vehicles – 2.5%</li>
            <li>Luxury Vehicles – 3%</li>
          </ul>

          <h2>3. HYBRID MODEL</h2>
          <p>Flat Fee + Percentage<br />
          (Used for high-value assets)</p>
          <p>Example:</p>
          <ul>
            <li>₹3,000 flat + 1% of winning bid</li>
            <li>₹10,000 flat + 0.5% for luxury vehicles</li>
          </ul>

          <h2>4. ENTERPRISE BULK MODEL</h2>
          <p>For Banks/NBFCs with 100+ listings per month:</p>
          <ul>
            <li>Monthly Subscription: ₹50,000–₹1,50,000</li>
            <li>Unlimited listings</li>
            <li>Dedicated support</li>
            <li>Priority auction placement</li>
            <li>Platform analytics dashboard</li>
          </ul>

          <p>✔ Rate Sheet Ready</p>
        </div>
      </article>
    </div>
  );
};

export default CommissionRateSheet;
