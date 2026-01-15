import React from 'react';
import { Link } from 'react-router-dom';
import GrowthLeadForm from '../components/GrowthLeadForm';
import PageFrame from '../components/layout/PageFrame';

const CampaignsPage = () => {
  return (
    <PageFrame
      title="Campaigns & Promotions"
      description="Launch targeted campaigns, highlight premium lots, and stay in front of buyers with curated marketing touches."
    >
      <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-lg">
        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
          <li>Campaign strategy workshops with our auctions team</li>
          <li>Spotlight banners across timed, live, and tender inventories</li>
          <li>Dedicated campaign tracking dashboards and analytics</li>
        </ul>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Need help bringing a campaign to life? Our Marketplace Experience team can design the perfect launch.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Link
            to="/campaigns/launch"
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700"
          >
            Launch campaigns
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
            to="/demo?user=demo-campaigns&redirect=/campaigns/launch"
            className="inline-flex items-center justify-center rounded-full border border-indigo-600 px-6 py-3 text-indigo-700 font-semibold hover:bg-indigo-50"
          >
            Launch Campaigns Demo
          </Link>
          <p className="text-xs text-gray-500">Tell us about your launch goals and we&apos;ll share a plan.</p>
        </div>

        <div className="bg-gray-900/80 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-semibold">Launch your campaign</h3>
          <p className="text-xs opacity-80 mb-3">
            Our marketing ops team will follow up within business hours with a tailored strategy deck.
          </p>
          <GrowthLeadForm interest="Launch Campaigns" />
        </div>
      </div>
    </PageFrame>
  );
 };

export default CampaignsPage;
