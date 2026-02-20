import React, { useState } from 'react';
import { Heart, AlertCircle } from 'lucide-react';
import { BadgeContainer } from '../badges/BadgeContainer';
import { getBadgesForSeller } from '../../utils/badgeVisibility';

interface Auction {
  id: string;
  currentBid: number;
  minimumNextBid: number;
  bidCount: number;
  seller: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    ratingCount: number;
    verified: boolean;
    topSeller: boolean;
  };
}

interface UserBid {
  amount: number;
}

interface User {
  id: string;
  walletBalance: number;
}

interface BidPanelProps {
  auction: Auction;
  userBid?: UserBid | null;
}

export function BidPanel({ auction, userBid }: BidPanelProps) {
  const [bidAmount, setBidAmount] = useState(auction.minimumNextBid);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWatched, setIsWatched] = useState(false);

  const handlePlaceBid = async () => {
    if (isSubmitting) return;
    if (bidAmount < auction.minimumNextBid) {
      setError(`Bid must be at least ₹${auction.minimumNextBid.toLocaleString('en-IN')}`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/auctions/${auction.id}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: bidAmount }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to place bid');
      }

      // Success - show confirmation or navigate
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place bid');
      setIsSubmitting(false);
    }
  };

  const handleBestOffer = async () => {
    // TODO: Implement best offer flow
    console.log('Best offer clicked');
  };

  const handleWatchToggle = () => {
    setIsWatched(!isWatched);
    // TODO: Implement API call to save/remove from watchlist
  };

  return (
    <div className="space-y-4 sticky top-24 md:top-6 w-full min-w-0">
      {/* Bid Summary Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Current Leader</h3>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          ₹{auction.currentBid.toLocaleString('en-IN')}
        </div>
        <div className="text-sm text-gray-600">
          {auction.bidCount} {auction.bidCount === 1 ? 'bid' : 'bids'}
        </div>
      </div>

      {/* Bid Input Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <label className="block text-sm font-semibold text-gray-900">
          Your Bid
        </label>

        <div className="flex items-center gap-1">
          <span className="text-2xl font-bold text-gray-900">₹</span>
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              setBidAmount(isNaN(value) ? 0 : value);
              setError(null);
            }}
            min={auction.minimumNextBid}
            step={100}
            className="flex-1 text-2xl font-bold border-b-2 border-gray-300 focus:border-blue-500 outline-none px-2 py-1"
            placeholder="0"
          />
        </div>

        <div className="text-xs text-gray-500">
          Minimum: ₹{auction.minimumNextBid.toLocaleString('en-IN')}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handlePlaceBid}
          disabled={isSubmitting || bidAmount < auction.minimumNextBid}
          className={`w-full min-h-[44px] py-3 px-4 rounded-lg font-bold text-white transition-all touch-manipulation ${
            isSubmitting || bidAmount < auction.minimumNextBid
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
          }`}
        >
          {isSubmitting ? 'Placing Bid...' : 'Place Bid'}
        </button>

        <button
          onClick={handleBestOffer}
          disabled={isSubmitting}
          className="w-full min-h-[44px] py-2 px-4 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 touch-manipulation"
        >
          Best Offer
        </button>
      </div>

      {/* Wallet Balance */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="text-sm text-gray-500 mb-1">Wallet Balance</div>
        <div className="text-2xl font-bold text-gray-900 mb-3">
          ₹1,56,400
        </div>
        <button className="w-full min-h-[44px] py-2 px-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors touch-manipulation">
          + Add Funds
        </button>
      </div>

      {/* Seller Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Seller</h3>
        
        <div className="flex items-center gap-3">
          <img
            src={auction.seller.avatar}
            alt={auction.seller.name}
            className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-gray-900 truncate">
              {auction.seller.name}
            </div>
            <div className="text-xs text-gray-500">
              ⭐ {auction.seller.rating}/5 ({auction.seller.ratingCount})
            </div>
          </div>
        </div>

        {/* Seller Badges */}
        {(() => {
          const badges = getBadgesForSeller({
            isVerified: auction.seller.verified,
            isTopSeller: auction.seller.topSeller
          });
          
          if (badges.length > 0) {
            return (
              <BadgeContainer
                badges={badges}
                seller={{
                  isVerified: auction.seller.verified,
                  isTopSeller: auction.seller.topSeller
                }}
                direction="col"
                gap="sm"
              />
            );
          }
          return null;
        })()}

        <button className="w-full min-h-[44px] py-2 px-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors touch-manipulation">
          View Profile
        </button>
      </div>

      {/* Watch Button */}
      <button
        onClick={handleWatchToggle}
        className={`w-full min-h-[44px] py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all touch-manipulation ${
          isWatched
            ? 'bg-red-100 text-red-700 border-2 border-red-300'
            : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
        }`}
      >
        <Heart className={`w-5 h-5 ${isWatched ? 'fill-current' : ''}`} />
        {isWatched ? 'Watched' : 'Watch Item'}
      </button>
    </div>
  );
}
