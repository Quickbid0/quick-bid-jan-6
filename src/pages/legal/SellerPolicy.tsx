import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const SellerPolicy: React.FC = () => {
  usePageSEO({
    title: 'Seller Policy | QuickMela',
    description: 'Full Seller Policy for listing and selling items on the QuickMela marketplace.',
    canonicalPath: '/legal/seller-policy',
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
          <li className="text-gray-700 dark:text-gray-200">Seller Policy</li>
        </ol>
      </nav>
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Seller Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Obligations, rights, and responsibilities of sellers on QuickMela.
        </p>
      </header>
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert">
          <pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-100">
QUICKMELA  FULL LEGAL DOCUMENT SET

6. SELLER POLICY
(Your full seller policy text)
          </pre>
        </div>
      </article>
    </div>
  );
};

export default SellerPolicy;
