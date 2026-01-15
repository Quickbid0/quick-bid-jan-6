import React, { useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { Gavel, PlayCircle, ShieldCheck, Wallet, Clock, Users } from 'lucide-react';
import { supabase } from '../config/supabaseClient';

const useQuery = () => new URLSearchParams(useLocation().search);

const CampaignLanding: React.FC = () => {
  const { source } = useParams<{ source?: string }>();
  const query = useQuery();
  const utmSource = (query.get('utm_source') || source || 'default').toLowerCase();
  const utmCampaign = query.get('utm_campaign');
  const utmMedium = query.get('utm_medium');

  useEffect(() => {
    const logEvent = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('marketing_events').insert({
          path: '/campaign',
          source: utmSource,
          utm_source: utmSource,
          utm_campaign: utmCampaign,
          utm_medium: utmMedium,
          route_param: source,
          user_id: user?.id || null,
          event_type: 'landing_view',
        });
      } catch (e) {
        // Tracking failures should never break the landing
        console.warn('Failed to log marketing event', e);
      }
    };
    logEvent();
  }, [utmSource, utmCampaign, utmMedium, source]);

  let headline = 'India’s Trusted Vehicle Auction Marketplace';
  let subheadline = 'Bid on bank-seized and verified vehicles with real-time auctions, secure wallet deposits, and full KYC protection.';

  if (utmSource.includes('facebook')) {
    headline = 'Exclusive Facebook Deals on Seized Vehicles';
    subheadline = 'Join Quickmela buyers from Facebook and bid live on verified vehicles with full transparency and instant updates.';
  } else if (utmSource.includes('instagram')) {
    headline = 'Swipe Up. Bid Live. Win Smarter.';
    subheadline = 'Quickmela brings timed and live auctions to your phone with a mobile-first, PWA experience built for Instagram shoppers.';
  } else if (utmSource.includes('google')) {
    headline = 'Found Quickmela on Google? You’re in the Right Place.';
    subheadline = 'Compare vehicles, check history, and place bids in minutes with secure deposits and real-time notifications.';
  } else if (utmSource.includes('linkedin')) {
    headline = 'Liquidate Fleet & Assets with Compliance-First Auctions';
    subheadline = 'Quickmela for companies and banks: structured auctions, compliance tracking, and secure payouts.';
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="grid md:grid-cols-2 gap-10 items-center mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-xs font-medium text-indigo-700 dark:text-indigo-200 mb-3">
              <Gavel className="h-3 w-3" />
              <span>Quickmela • Real-time Vehicle Auctions</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {headline}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm md:text-base">
              {subheadline}
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
              >
                Get started in 2 minutes
              </Link>
              <Link
                to="/timed-auction"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Browse live auctions
              </Link>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              No listing of fake vehicles. Every seller is verified, deposits are secured, and all bids are tracked in real time.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Live right now</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">Timed & live auctions in progress</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Real-time updates
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-start gap-3">
                <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-300 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">KYC & verification</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Buyer, seller, and company profiles verified with document uploads and checks.</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-start gap-3">
                <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-300 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Secure deposits</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Wallet with automatic bid deposits, refunds, and withdrawal requests.</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/30 flex items-start gap-3">
                <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-300 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Timed & live formats</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Timed, live stream, and tender auctions for every type of sale.</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-start gap-3">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-300 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">For buyers & sellers</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Dashboards for buyers, sellers & companies with full visibility.</p>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <span>Optimised for mobile & PWA installs</span>
              <span>No hidden fees on browsing or registration</span>
            </div>
          </div>
        </div>

        {/* Social proof / CTA band */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Ready to send traffic here?</p>
            <p className="text-xs text-gray-600 dark:text-gray-300">Use this URL in your ads: <span className="font-mono text-[11px]">quickbid.com/campaign/{source || 'default'}?utm_source=...</span></p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link to="/timed-auction" className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
              View current auctions
            </Link>
            <Link to="/advanced-search" className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
              Advanced vehicle search
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignLanding;
