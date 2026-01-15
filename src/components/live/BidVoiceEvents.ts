import { supabase } from '../../config/supabaseClient';
import { announceBid, announceCountdown, announceStart } from './AnchorVoice';

interface BidVoiceSubscriptionOptions {
  auctionId: string;
}

export const setupBidVoiceEvents = ({ auctionId }: BidVoiceSubscriptionOptions) => {
  const channel = supabase
    .channel(`auction-voice:${auctionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'bids',
        filter: `auction_id=eq.${auctionId}`,
      },
      (payload) => {
        const bid: any = payload.new;
        const amount = Number(bid.amount) || 0;
        const userId = String(bid.user_id || 'Bidder');
        announceBid(userId, amount);
      },
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'auctions',
        filter: `id=eq.${auctionId}`,
      },
      (payload) => {
        const auction: any = payload.new;
        if (auction.status === 'live' && payload.old?.status !== 'live') {
          const title = auction.title || 'this vehicle';
          announceStart(title);
        }
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const triggerCountdownVoice = () => announceCountdown();

export default setupBidVoiceEvents;
