import React, { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { toast } from 'react-hot-toast';

interface SubscriptionRow {
  id: string;
  plan: 'starter' | 'pro' | 'premium';
  price_monthly: number;
  listing_quota: number | null;
  boost_quota: number | null;
  used_listings: number;
  used_boosts: number;
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
}

const PLANS = [
  {
    code: 'starter' as const,
    name: 'Starter',
    price: 199,
    description: 'Great for casual sellers getting started on QuickMela.',
    listingQuota: 20,
    boostQuota: 1,
    highlights: ['Up to 20 active listings per month', '1 free Boost', 'Standard ranking in search'],
  },
  {
    code: 'pro' as const,
    name: 'Pro',
    price: 499,
    description: 'For serious sellers who list frequently.',
    listingQuota: null,
    boostQuota: 5,
    highlights: ['Unlimited listings', '5 free Boosts', 'Better visibility in buyer feeds'],
  },
  {
    code: 'premium' as const,
    name: 'Premium',
    price: 999,
    description: 'Best for dealerships and power sellers.',
    listingQuota: null,
    boostQuota: 10,
    highlights: ['Priority ranking', 'Verified badge', '10 free Boosts', 'Access to promos & spotlight slots'],
  },
];

const SellerMembership: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentSub, setCurrentSub] = useState<SubscriptionRow | null>(null);
  const [creatingOrderFor, setCreatingOrderFor] = useState<'starter' | 'pro' | 'premium' | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data: auth } = await supabase.auth.getUser();
        const uid = auth.user?.id || null;
        if (!uid) {
          toast.error('You must be logged in as a seller to view membership.');
          setLoading(false);
          return;
        }
        setUserId(uid);

        const nowIso = new Date().toISOString();
        const { data: subs, error } = await supabase
          .from('subscriptions')
          .select('id, plan, price_monthly, listing_quota, boost_quota, used_listings, used_boosts, starts_at, expires_at, is_active')
          .eq('seller_id', uid)
          .eq('is_active', true)
          .lte('starts_at', nowIso)
          .or('expires_at.is.null,expires_at.gte.' + nowIso)
          .order('starts_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error loading subscription', error);
          toast.error('Could not load your membership details.');
        } else if (subs && subs.length > 0) {
          setCurrentSub(subs[0] as SubscriptionRow);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleBuyPlan = async (planCode: 'starter' | 'pro' | 'premium') => {
    if (!userId) {
      toast.error('Please login to purchase a plan.');
      return;
    }

    const plan = PLANS.find((p) => p.code === planCode);
    if (!plan) return;

    try {
      setCreatingOrderFor(planCode);

      const body = {
        amount: plan.price * 100,
        currency: 'INR',
        notes: {
          type: 'subscription',
          seller_id: userId,
          plan: plan.code,
          amount: plan.price,
          listing_quota: plan.listingQuota,
          boost_quota: plan.boostQuota,
        },
      };

      const res = await fetch('/.netlify/functions/razorpay-create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create payment order');
      }

      const { order, key_id } = await res.json();

      if (!(window as any).Razorpay) {
        toast.error('Payment SDK not loaded. Please refresh and try again.');
        return;
      }

      const options: any = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'QuickMela Membership',
        description: `${plan.name} plan`,
        order_id: order.id,
        notes: order.notes,
        handler: () => {
          toast.success('Payment initiated. We will update your membership once it is confirmed.');
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e: any) {
      console.error('Error creating subscription payment', e);
      toast.error(e?.message || 'Failed to start membership payment');
    } finally {
      setCreatingOrderFor(null);
    }
  };

  const renderPlanCard = (plan: (typeof PLANS)[number]) => {
    const isCurrent = currentSub?.plan === plan.code && currentSub?.is_active;

    return (
      <div
        key={plan.code}
        className={`flex flex-col rounded-xl border p-5 shadow-sm bg-white dark:bg-gray-900 ${
          isCurrent ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-gray-200 dark:border-gray-700'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h2>
          <div className="text-right">
            <div className="text-xl font-bold text-gray-900 dark:text-white">₹{plan.price}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">per month</div>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{plan.description}</p>
        <ul className="text-xs text-gray-700 dark:text-gray-200 space-y-1 mb-4">
          {plan.highlights.map((h) => (
            <li key={h} className="flex items-start gap-1">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />
              <span>{h}</span>
            </li>
          ))}
        </ul>

        {isCurrent && currentSub && (
          <div className="mb-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
            <div className="font-semibold mb-0.5">Current plan</div>
            <div>
              Listings used: {currentSub.used_listings}
              {currentSub.listing_quota !== null && currentSub.listing_quota !== undefined
                ? ` / ${currentSub.listing_quota}`
                : ' (unlimited)'}
            </div>
            <div>
              Boosts used: {currentSub.used_boosts}
              {currentSub.boost_quota !== null && currentSub.boost_quota !== undefined
                ? ` / ${currentSub.boost_quota}`
                : ''}
            </div>
          </div>
        )}

        <button
          type="button"
          disabled={creatingOrderFor === plan.code}
          onClick={() => handleBuyPlan(plan.code)}
          className={`mt-auto inline-flex justify-center items-center rounded-lg px-4 py-2 text-sm font-medium border ${
            isCurrent
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
              : 'border-gray-900 text-white bg-gray-900 hover:bg-black'
          } disabled:opacity-60`}
        >
          {creatingOrderFor === plan.code
            ? 'Processing…'
            : isCurrent
            ? 'Renew / Extend'
            : 'Buy / Upgrade'}
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QuickMela Membership</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Choose a plan that matches your selling style. Plans control your listing limits, free boosts, and visibility.
        </p>
      </div>

      {loading && <div className="py-10 text-center text-gray-500">Loading your membership…</div>}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((p) => renderPlanCard(p))}
        </div>
      )}
    </div>
  );
};

export default SellerMembership;
