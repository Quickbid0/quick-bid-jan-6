import React, { useEffect, useState } from 'react';

interface BiddingStats {
  highestBid: number | null;
  highestBidder: string | null;
  totalBids: number;
  bidsPerMinute: number;
  activeBidders: number;
  lastBidTime: string | null;
}

interface LiveScoreboardProps {
  auctionId: string;
}

export const LiveScoreboard: React.FC<LiveScoreboardProps> = ({ auctionId }) => {
  const [stats, setStats] = useState<BiddingStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/auctions/${auctionId}/live-stats`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setStats(data.bidding_stats as BiddingStats);
      } catch {
        // ignore
      }
    };

    if (auctionId) {
      fetchStats();
      const interval = setInterval(fetchStats, 2000);
      return () => {
        cancelled = true;
        clearInterval(interval);
      };
    }
  }, [auctionId]);

  const highestBid = stats?.highestBid ?? 0;
  const totalBids = stats?.totalBids ?? 0;
  const activeBidders = stats?.activeBidders ?? 0;
  const bidsPerMinute = stats?.bidsPerMinute ?? 0;
  const lastBidTime = stats?.lastBidTime ? new Date(stats.lastBidTime).toLocaleTimeString() : '—';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-800">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Live Scoreboard</h3>
      <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
        <div className="col-span-2 bg-green-50 dark:bg-green-900/30 rounded-lg px-3 py-2">
          <p className="text-green-800 dark:text-green-100 text-xs uppercase tracking-wide mb-1">🏏 Runs (Highest Bid)</p>
          <p className="text-lg sm:text-2xl font-bold text-green-900 dark:text-green-50">
            ₹{highestBid.toLocaleString()}
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg px-3 py-2">
          <p className="text-blue-800 dark:text-blue-100 text-[0.65rem] uppercase tracking-wide mb-1">🎯 Balls (Total Bids)</p>
          <p className="text-base font-semibold text-blue-900 dark:text-blue-50">{totalBids}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg px-3 py-2">
          <p className="text-purple-800 dark:text-purple-100 text-[0.65rem] uppercase tracking-wide mb-1">👥 Overs (Active Bidders)</p>
          <p className="text-base font-semibold text-purple-900 dark:text-purple-50">{activeBidders}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg px-3 py-2">
          <p className="text-yellow-800 dark:text-yellow-100 text-[0.65rem] uppercase tracking-wide mb-1">⚡ Run Rate (Bids/Min)</p>
          <p className="text-base font-semibold text-yellow-900 dark:text-yellow-50">{bidsPerMinute.toFixed(1)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
          <p className="text-gray-600 dark:text-gray-300 text-[0.65rem] uppercase tracking-wide mb-1">⭐ Last Bid Time</p>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{lastBidTime}</p>
        </div>
      </div>
    </div>
  );
};

export default LiveScoreboard;
