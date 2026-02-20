import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { BadgeContainer } from '../badges/BadgeContainer';
import { getAuctionCardBadges } from '../../utils/badgeVisibility';

interface Auction {
  id: string;
  title: string;
  currentBid: number;
  startingPrice: number;
  minimumNextBid: number;
  bidCount: number;
  endsAt: string;
  location: string;
  condition: string;
  mileage?: number;
  description: string;
  inspection?: {
    grade: 'ACE' | 'GOOD' | 'FAIR' | 'POOR';
    report: string;
  };
  seller: {
    verified: boolean;
  };
  escrowEnabled: boolean;
  aiInspected: boolean;
}

interface UserBid {
  isWinning: boolean;
  amount: number;
}

interface AuctionPriceProps {
  auction: Auction;
  userBid?: UserBid | null;
}

export function PricePanel({ auction, userBid }: AuctionPriceProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isEnded, setIsEnded] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Calculate countdown
  useEffect(() => {
    const calculateTimeLeft = () => {
      const endTime = new Date(auction.endsAt).getTime();
      const now = new Date().getTime();
      const diff = endTime - now;

      setTimeRemaining(diff);

      if (diff <= 0) {
        setIsEnded(true);
        setTimeLeft('Ended');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [auction.endsAt]);

  const getInspectionColor = (grade: string) => {
    switch (grade) {
      case 'ACE':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'GOOD':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'FAIR':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'POOR':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-4 w-full min-w-0">
      {/* Price Section - PROMINENT */}
      <div className="space-y-2">
        <div className="text-sm text-gray-500 font-medium">Current Price</div>
        <div className="text-4xl sm:text-5xl md:text-4xl font-bold text-gray-900 leading-tight break-words">
          ₹{auction.currentBid.toLocaleString('en-IN')}
        </div>
        <div className="text-sm text-gray-600">
          {auction.bidCount} {auction.bidCount === 1 ? 'bid' : 'bids'} placed
        </div>

        {userBid && (
          <div className={`text-sm font-medium mt-2 p-2 rounded ${
            userBid.isWinning ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
          }`}>
            {userBid.isWinning ? '✓ You are winning' : '⚠️ You have been outbid'}
          </div>
        )}
      </div>

      {/* Countdown Timer - URGENT */}
      <div className={`p-4 rounded-lg border-2 ${
        isEnded
          ? 'bg-gray-100 border-gray-300'
          : timeRemaining < 3600000
          ? 'bg-red-50 border-red-300'
          : 'bg-amber-50 border-amber-300'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 flex-shrink-0" />
          <h3 className="text-sm font-semibold">
            {isEnded ? 'Auction Ended' : 'Auction Ends In'}
          </h3>
        </div>
        <div className={`text-2xl font-bold break-words ${
          isEnded
            ? 'text-gray-600'
            : timeRemaining < 3600000
            ? 'text-red-600'
            : 'text-amber-600'
        }`}>
          {timeLeft}
        </div>
      </div>

      {/* Trust Signals - Display as Badges */}
      {(() => {
        const badges = getAuctionCardBadges(
          { isVerified: auction.seller.verified },
          {
            escrowEnabled: auction.escrowEnabled,
            aiInspected: auction.aiInspected,
            inspectionGrade: auction.inspection?.grade
          }
        );
        
        return (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Buyer Protection</h3>
            <BadgeContainer
              badges={badges}
              seller={{ isVerified: auction.seller.verified }}
              auction={{
                escrowEnabled: auction.escrowEnabled,
                aiInspected: auction.aiInspected,
                inspectionGrade: auction.inspection?.grade
              }}
              direction="col"
              gap="sm"
            />
          </div>
        );
      })()}

      {/* Inspection Grade Badge */}
      {auction.inspection && (
        <div className={`p-3 rounded-lg border ${getInspectionColor(auction.inspection.grade)}`}>
          <div className="text-xs font-semibold uppercase mb-1">Inspection Grade</div>
          <div className="text-2xl font-bold">{auction.inspection.grade}</div>
        </div>
      )}

      {/* Item Details - Responsive */}
      <div className="space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-900">Item Details</h3>

        <div className="min-w-0">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Location</div>
          <div className="text-sm font-medium text-gray-900 break-words">{auction.location}</div>
        </div>

        {auction.mileage !== undefined && (
          <div className="min-w-0">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Mileage</div>
            <div className="text-sm font-medium text-gray-900">
              {auction.mileage.toLocaleString('en-IN')} km
            </div>
          </div>
        )}

        <div className="min-w-0">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Condition</div>
          <div className="text-sm font-medium text-gray-900">{auction.condition}</div>
        </div>
      </div>

      {/* Description Preview */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
        <p className="text-sm text-gray-600 line-clamp-3 break-words">
          {auction.description}
        </p>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2">
          Read more
        </button>
      </div>
    </div>
  );
}
