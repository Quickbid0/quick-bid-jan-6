import React from 'react';
import { Link } from 'react-router-dom';
import GrowthLeadForm from '../components/GrowthLeadForm';
import PageFrame from '../components/layout/PageFrame';

const SalesPage = () => (
  <PageFrame
    title="Sales Support"
    description="Concierge support, dedicated account managers, and post-sale delivery coordination for buyers, partners, and corporates."
  >
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
      <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
        <li>Deal consults covering procurement rules, regulatory compliance, and escrow.</li>
        <li>Priority access to high-value lots and reserved inventory listings.</li>
        <li>Post-sale liaising with financing and logistics partners.</li>
      </ul>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Link
          to="/sales/login"
          className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-white font-semibold hover:bg-emerald-500"
        >
          Sales login
        </Link>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-700 px-6 py-3 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Back to Home
        </Link>
      </div>

      <div className="text-center space-y-2">
        <Link
          to="/demo?user=demo-sales&redirect=/sales"
          className="inline-flex items-center justify-center rounded-full border border-emerald-500 px-6 py-3 text-emerald-600 font-semibold hover:bg-emerald-50"
        >
          Launch Sales Demo
        </Link>
        <p className="text-xs text-gray-500">Or tell us about your enterprise requirements.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Book sales support</h3>
        <p className="text-xs text-gray-500 mb-3">A rep will reach out with procurement and logistics guidance.</p>
        <GrowthLeadForm interest="Sales Support" />
      </div>
    </div>
  </PageFrame>
);

export default SalesPage;
