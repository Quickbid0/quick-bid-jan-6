import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import GrowthLeadForm from '../components/GrowthLeadForm';
import PageFrame from '../components/layout/PageFrame';

const MarketingPage = () => {
  const highlights = useMemo(() => [
    'Branded hero spaces on primary auction lobbies',
    'Sponsored product carousels for featured sellers',
    'Performance dashboards that measure impressions and Spend',
    'Integrated email + WhatsApp nurture sequences for buyers '
  ], []);

  return (
    <PageFrame
      title="Marketing & Visibility"
      description="Amplify your inventory with premium placements, live campaigns, and data-driven marketing across QuickMela."
    >
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 border border-gray-200 dark:border-gray-700">
        <div className="grid md:grid-cols-2 gap-4">
          {highlights.map((item) => (
            <div key={item} className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900">
              <p className="text-sm text-slate-700 dark:text-slate-200">{item}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-300">
          Want a bespoke campaign plan? Send us a note and we&apos;ll connect you with our Marketplace Experience specialists.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Link
            to="/campaigns/launch"
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-500"
          >
            Launch a campaign
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-700 px-6 py-3 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Return home
          </Link>
        </div>

        <div className="text-center space-y-2">
          <Link
            to="/demo?user=demo-marketing"
            className="inline-flex items-center justify-center rounded-full border border-indigo-200 dark:border-indigo-700 px-6 py-3 text-indigo-700 dark:text-indigo-200 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
          >
            Launch Marketing Demo
          </Link>
          <p className="text-xs text-gray-500">Or tell us your target buyer profile.</p>
        </div>

        <div className="bg-slate-900/70 p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-white">Plan a campaign</h3>
          <p className="text-xs text-slate-200 mb-3">Share a few details and our Marketplace Experience team will follow up.</p>
          <GrowthLeadForm interest="Marketing Services" />
        </div>
      </div>
    </PageFrame>
  );
};

export default MarketingPage;
