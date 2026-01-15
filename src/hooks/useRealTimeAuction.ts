import { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';

interface AuctionUpdate {
  auctionId: string;
  currentPrice: number;
  bidCount: number;
  timeLeft: string;
  lastBidder?: string;
}

export const useRealTimeAuction = (auctionId: string) => {
  const [auctionData, setAuctionData] = useState<AuctionUpdate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auctionId) return;

    // Initial fetch
    fetchAuctionData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`auction:${auctionId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'auctions',
        filter: `id=eq.${auctionId}`
      }, (payload) => {
        updateAuctionData(payload.new);
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'bids',
        filter: `auction_id=eq.${auctionId}`
      }, () => {
        fetchAuctionData(); // Refresh on new bid
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [auctionId]);

  const fetchAuctionData = async () => {
    try {
      const { data: auction, error: auctionError } = await supabase
        .from('auctions')
        .select(`
          *,
          bids(count)
        `)
        .eq('id', auctionId)
        .single();

      if (auctionError) throw auctionError;

      const timeLeft = calculateTimeLeft(auction.end_date);
      
      setAuctionData({
        auctionId,
        currentPrice: auction.current_price,
        bidCount: auction.bids?.[0]?.count || 0,
        timeLeft
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch auction data';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const updateAuctionData = (auctionUpdate: any) => {
    setAuctionData(prev => prev ? {
      ...prev,
      currentPrice: auctionUpdate.current_price,
      timeLeft: calculateTimeLeft(auctionUpdate.end_date)
    } : null);
  };

  const calculateTimeLeft = (endDate: string): string => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  return { auctionData, loading, error, refetch: fetchAuctionData };
};