import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const AIModelOwnershipPolicy: React.FC = () => {
  usePageSEO({
    title: 'AI Model Ownership & Training Data Protection Policy | QuickMela',
    description: 'Declares AI model IP ownership and training data protection rules for QuickMela systems.',
    canonicalPath: '/legal/ai-model-ownership-policy',
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
          <li className="text-gray-700 dark:text-gray-200">AI Model Ownership &amp; Training Data Protection Policy</li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          QuickMela – AI Model IP, Data Ownership &amp; Confidentiality Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">Owner: Sanjeev Musugu</p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>
          To legally declare that all AI models used in QuickMela are proprietary, confidential, and exclusively owned by
          Tekvoro Technologies / Sanjeev Musugu.
        </p>

        <h2>2. What Is Protected</h2>
        <p>The following are protected:</p>
        <ul>
          <li>AI fraud engine</li>
          <li>AI condition-detection model</li>
          <li>AI bidding pattern classifier</li>
          <li>Risk scoring models</li>
          <li>OCR/KYC validation engines</li>
          <li>Listing analysis model</li>
          <li>SARFAESI compliance model</li>
          <li>Transport risk model</li>
        </ul>

        <h2>3. Training Data Protection</h2>
        <p>All data used for AI training is:</p>
        <ul>
          <li>Confidential</li>
          <li>Encrypted</li>
          <li>Not sold or shared</li>
          <li>Not used outside QuickMela</li>
        </ul>

        <h2>4. Third-Party Restrictions</h2>
        <p>Vendors, banks, or agencies may NOT:</p>
        <ul>
          <li>Copy</li>
          <li>Download</li>
          <li>Train external models</li>
          <li>Reverse-engineer AI outputs</li>
        </ul>
        <p>Any violation results in legal action.</p>

        <h2>5. Ownership</h2>
        <p>All AI systems remain the exclusive intellectual property of Sanjeev Musugu.</p>
      </article>
    </div>
  );
};

export default AIModelOwnershipPolicy;
