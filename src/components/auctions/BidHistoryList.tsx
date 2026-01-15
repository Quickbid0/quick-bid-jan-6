import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';

interface BidHistoryEntry {
  bidder: string;
  amount: number;
  time: string;
  isWinning: boolean;
}

interface BidHistoryListProps {
  auctionId: string;
}

export const BidHistoryList: React.FC<BidHistoryListProps> = ({ auctionId }) => {
  const [entries, setEntries] = useState<BidHistoryEntry[]>([]);
  const [tokenOk, setTokenOk] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!auctionId) return;

    const loadBidHistory = async () => {
      try {
        setLoading(true);

        const { data: userData } = await supabase.auth.getUser();
        const user = userData?.user || null;

        if (!user) {
          setTokenOk(false);
          setEntries([]);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('token_fee_paid_at')
          .eq('id', user.id)
          .single();

        const hasToken = !!profile?.token_fee_paid_at;
        setTokenOk(hasToken);

        if (!hasToken) {
          setEntries([]);
          return;
        }

        const { data } = await supabase
          .from('bids')
          .select('amount, created_at, user_id')
          .eq('auction_id', auctionId)
          .order('created_at', { ascending: false })
          .limit(50);

        const bids = data || [];
        if (bids.length === 0) {
          setEntries([]);
          return;
        }

        const highest = bids.reduce((acc: any, b: any) => (b.amount > acc.amount ? b : acc), bids[0]);

        const history: BidHistoryEntry[] = bids.map((b: any) => {
          const isYou = user && b.user_id === user.id;
          const bidderLabel = isYou ? 'You' : `Bidder ${b.user_id.slice(-4)}`;
          const time = new Date(b.created_at).toLocaleTimeString();
          return {
            bidder: bidderLabel,
            amount: b.amount,
            time,
            isWinning: b.user_id === highest.user_id,
          };
        });

        setEntries(history);
      } catch (e) {
        console.error('BidHistoryList: error loading bid history', e);
        setTokenOk(false);
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };

    loadBidHistory();
  }, [auctionId]);

  if (loading && tokenOk === null) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        Loading bid history…
      </div>
    );
  }

  if (tokenOk === false) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-yellow-200 dark:border-yellow-700 text-xs text-gray-700 dark:text-gray-200">
        <div className="font-semibold mb-1">Pay token fee to view bids</div>
        <p className="mb-2">
          A one-time token fee unlocks full bid history and premium bidding features across Quick Mela auctions.
        </p>
        <a
          href="/checkout/token"
          className="inline-flex items-center px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700 text-[0.75rem]"
        >
          Pay token fee
        </a>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        No bids yet. Be the first to bid!
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700 max-h-64 overflow-y-auto text-xs">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">Recent Bids</h3>
      <ul className="space-y-1">
        {entries.map((entry, idx) => (
          <li
            key={idx}
            className={`flex justify-between items-center px-2 py-1 rounded ${
              entry.isWinning
                ? 'bg-green-50 dark:bg-green-900/30 text-green-900 dark:text-green-50'
                : 'bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100'
            }`}
          >
            <div className="flex flex-col">
              <span className="font-medium">{entry.bidder}</span>
              <span className="text-[0.7rem] opacity-80">{entry.time}</span>
            </div>
            <div className="text-right">
              <span className="font-semibold">₹{entry.amount.toLocaleString()}</span>
              {entry.isWinning && (
                <span className="block text-[0.7rem] uppercase tracking-wide">Leading</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BidHistoryList;
