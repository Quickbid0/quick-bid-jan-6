import { supabaseAdmin } from '../../../supabaseAdmin';

export async function validateAuctionState(auctionId: string) {
  if (!supabaseAdmin) {
    throw Object.assign(new Error('Supabase admin not configured'), { statusCode: 500 });
  }

  const { data: auction, error } = await supabaseAdmin
    .from('auctions')
    .select('*')
    .eq('id', auctionId)
    .maybeSingle();

  if (error) {
    throw Object.assign(new Error('Auction lookup failed'), { statusCode: 500 });
  }

  if (!auction) {
    throw Object.assign(new Error('Auction not found'), { statusCode: 404 });
  }

  if (!['active', 'live'].includes(auction.status)) {
    throw Object.assign(new Error('Auction is not accepting bids'), { statusCode: 400 });
  }

  const now = new Date();
  if (auction.start_date && new Date(auction.start_date) > now) {
    throw Object.assign(new Error('Auction has not started'), { statusCode: 400 });
  }
  if (auction.end_date && new Date(auction.end_date) <= now) {
    throw Object.assign(new Error('Auction has already ended'), { statusCode: 400 });
  }

  return auction;
}

export function validateIncrementRules(currentPrice: number, newAmount: number, incrementAmount: number) {
  if (newAmount <= currentPrice) {
    throw Object.assign(new Error('Bid must be higher than current price'), { statusCode: 400 });
  }
  if ((newAmount - currentPrice) % incrementAmount !== 0) {
    throw Object.assign(new Error('Bid must follow increment rules'), { statusCode: 400 });
  }
}
