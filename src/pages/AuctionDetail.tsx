import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GalleryPanel } from '../components/auction/AuctionGallery';
import { PricePanel } from '../components/auction/AuctionPrice';
import { BidPanel } from '../components/auction/BidPanel';
import { AuctionTabs } from '../components/auction/AuctionTabs';
import { AuctionDetailSkeleton } from '../components/LoadingSkeletons';
import { useAuth } from '../contexts/AuthContext';

export interface Auction {
  id: string;
  title: string;
  description: string;
  category: string;
  currentBid: number;
  minimumNextBid: number;
  bidCount: number;
  startingPrice: number;
  images: string[];
  endsAt: string;
  location: string;
  mileage?: number;
  condition: string;
  inspection?: {
    grade: 'ACE' | 'GOOD' | 'FAIR' | 'POOR';
    report: string;
  };
  seller: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    ratingCount: number;
    verified: boolean;
    topSeller: boolean;
  };
  relatedItems?: Array<{
    id: string;
    title: string;
    price: number;
  }>;
  escrowEnabled: boolean;
  aiInspected: boolean;
}

interface UserBid {
  auctionId: string;
  userId: string;
  amount: number;
  timestamp: string;
  isWinning: boolean;
}

export default function AuctionDetail() {
  const { auctionId } = useParams<{ auctionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [auction, setAuction] = useState<Auction | null>(null);
  const [userBid, setUserBid] = useState<UserBid | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch auction details
  useEffect(() => {
    const controller = new AbortController();

    const fetchAuction = async () => {
      if (!auctionId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/auctions/${auctionId}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to load auction');
        }

        const data = await response.json();
        
        if (!controller.signal.aborted) {
          setAuction(data);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
          console.error('Failed to fetch auction:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();

    return () => controller.abort();
  }, [auctionId]);

  // Fetch user's bid on this auction
  useEffect(() => {
    const controller = new AbortController();

    const fetchUserBid = async () => {
      if (!auctionId || !user?.id) return;

      try {
        const response = await fetch(`/api/auctions/${auctionId}/my-bid`, {
          signal: controller.signal,
        });

        if (response.ok) {
          const data = await response.json();
          if (!controller.signal.aborted) {
            setUserBid(data);
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Failed to fetch user bid:', err);
        }
      }
    };

    fetchUserBid();

    return () => controller.abort();
  }, [auctionId, user?.id]);

  if (loading) {
    return <AuctionDetailSkeleton />;
  }

  if (error || !auction) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error ? 'Error Loading Auction' : 'Auction Not Found'}
          </h2>
          <p className="text-gray-600 mb-4">
            {error || 'This auction no longer exists'}
          </p>
          <button
            onClick={() => navigate('/dashboard/auctions')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Auctions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white md:bg-gray-50 min-h-screen">
      {/* Breadcrumb - Hide on mobile */}
      <div className="hidden md:block border-b border-gray-200 px-4 md:px-6 py-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <button
            onClick={() => navigate('/dashboard/auctions')}
            className="hover:text-gray-900"
          >
            Auctions
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">{auction.title}</span>
        </div>
      </div>

      {/* Main Layout - 3 Column on Desktop, Stack on Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 p-3 md:p-6 pb-20 md:pb-6 auto-rows-max md:auto-rows-none">
        {/* LEFT: Gallery (35% = col-span-2) */}
        <div className="md:col-span-2 w-full min-w-0">
          <GalleryPanel auction={auction} />
        </div>

        {/* CENTER: Price (40% = col-span-2) */}
        <div className="md:col-span-2 w-full min-w-0">
          <PricePanel auction={auction} userBid={userBid} />
        </div>

        {/* RIGHT: Bid Panel (25% = col-span-1) - Sticky on Desktop */}
        <div 
          className="md:col-span-1 w-full min-w-0 md:sticky md:top-6 h-fit"
          data-bid-section
        >
          <div className="md:block hidden">
            <BidPanel auction={auction} userBid={userBid} />
          </div>
        </div>

        {/* Tabs Section - Full width */}
        <div className="col-span-1 md:col-span-5 w-full min-w-0 mt-4 md:mt-0">
          <AuctionTabs auction={auction} userBid={userBid} />
        </div>
      </div>

      {/* Mobile Sticky Bid Action Bar - Show only on mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
        <div className="px-4 py-3 flex gap-2 max-w-full overflow-hidden">
          <button
            className="flex-1 min-h-[44px] py-2 px-3 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all touch-manipulation"
            onClick={() => {
              window.location.hash = '#bid-section';
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }}
          >
            Bid Now
          </button>
          <button className="flex-shrink-0 min-h-[44px] min-w-[44px] p-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center">
            <span className="text-xl">♥</span>
          </button>
        </div>
      </div>
    </div>
  );
}
