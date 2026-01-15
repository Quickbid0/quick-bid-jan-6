import type { Request } from 'express';
import { supabaseAdmin } from '../../../supabaseAdmin';
import { validateAuctionState, validateIncrementRules } from './validators';
import crypto from 'crypto';
import { getAuctionsEvents } from '../../../socket/auctionEvents';
import { computeBiddingStats } from './liveStats.service';
import { checkSellerRestriction } from '../../risk/services/sellerRisk.service';

interface PlaceBidHandlerParams {
  req: Request;
  auctionId: string;
  idempotencyKey?: string;
}

interface HandlerResult {
  statusCode: number;
  body: any;
}

export async function placeBidHandler(params: PlaceBidHandlerParams): Promise<HandlerResult> {
  const { req, auctionId, idempotencyKey } = params;
  const userId = (req as any).user?.id as string | undefined; // to be set by auth middleware

  if (!userId) {
    return { statusCode: 401, body: { error: 'Unauthorized' } };
  }

  const { amount } = req.body || {};
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return { statusCode: 400, body: { error: 'Invalid bid amount' } };
  }

  if (!supabaseAdmin) {
    return { statusCode: 500, body: { error: 'Supabase admin not configured' } };
  }

  // Buyer risk restriction guard: block users under active controls from bidding
  const restriction = await checkSellerRestriction(userId);
  if (!restriction.allowed) {
    const message =
      restriction.status === 'blocked'
        ? 'Your account is blocked from bidding. Please contact support.'
        : 'Your account is currently in cooldown and cannot place bids.';

    return {
      statusCode: 403,
      body: {
        error: 'USER_RESTRICTED',
        status: restriction.status,
        cooldownActive: restriction.cooldownActive,
        cooldownUntil: restriction.cooldownUntil,
        message,
      },
    };
  }

  // Basic idempotency using a dedicated table
  if (idempotencyKey) {
    const { data: existing, error: existingErr } = await supabaseAdmin
      .from('bid_requests')
      .select('response, status_code')
      .eq('idempotency_key', idempotencyKey)
      .eq('auction_id', auctionId)
      .eq('bidder_id', userId)
      .maybeSingle();

    if (existingErr) {
      console.error('bid_requests select error', existingErr);
    } else if (existing) {
      return { statusCode: existing.status_code || 200, body: existing.response };
    }
  }

  const auction = await validateAuctionState(auctionId);
  const currentPrice = Number(auction.current_price) || Number(auction.starting_price) || 0;
  const incrementAmount = Number(auction.increment_amount) || 100;

  validateIncrementRules(currentPrice, amount, incrementAmount);

  // TODO: integrate device blocking and risk checks in auth phase

  try {
    // Re-read latest auction state to minimize race conditions
    const { data: latestAuction, error: latestErr } = await supabaseAdmin
      .from('auctions')
      .select('id, current_price, increment_amount')
      .eq('id', auctionId)
      .maybeSingle();

    if (latestErr) {
      console.error('latest auction select error', latestErr);
      return { statusCode: 500, body: { error: 'Auction lookup failed' } };
    }
    if (!latestAuction) {
      return { statusCode: 404, body: { error: 'Auction not found' } };
    }

    const dbCurrentPrice = Number(latestAuction.current_price) || currentPrice;
    const dbIncrement = Number(latestAuction.increment_amount) || incrementAmount;
    validateIncrementRules(dbCurrentPrice, amount, dbIncrement);

    // Determine previous highest bidder (for outbid notification)
    const { data: prevHighest, error: prevErr } = await supabaseAdmin
      .from('bids')
      .select('user_id, amount')
      .eq('auction_id', auctionId)
      .eq('status', 'active')
      .order('amount', { ascending: false })
      .limit(1);

    if (prevErr) {
      console.error('prev highest bid select error', prevErr);
    }

    const prevHighestBidderId = prevHighest && prevHighest.length > 0 ? (prevHighest[0].user_id as string) : null;

    // Insert bid
    const { data: bid, error: bidError } = await supabaseAdmin
      .from('bids')
      .insert({ auction_id: auctionId, user_id: userId, amount, status: 'active' })
      .select('id')
      .single();

    if (bidError) {
      console.error('bid insert error', bidError);
      return { statusCode: 500, body: { error: 'Failed to write bid' } };
    }

    const bidId = bid.id as string;

    // Update auction price (best-effort atomicity; to be upgraded to server-side transaction)
    const { error: auctionUpdateErr } = await supabaseAdmin
      .from('auctions')
      .update({ current_price: amount, highest_bid_id: bidId })
      .eq('id', auctionId);

    if (auctionUpdateErr) {
      console.error('auction update error', auctionUpdateErr);
      return { statusCode: 500, body: { error: 'Failed to update auction price' } };
    }

    // Append to bid_ledger with hash chaining
    const { data: ledgerRows, error: ledgerErr } = await supabaseAdmin
      .from('bid_ledger')
      .select('hash')
      .eq('auction_id', auctionId)
      .order('ts', { ascending: false })
      .limit(1);

    if (ledgerErr) {
      console.error('bid_ledger select error', ledgerErr);
    }

    const prevHash = ledgerRows && ledgerRows.length > 0 ? (ledgerRows[0].hash as string) : null;
    const ts = new Date().toISOString();
    const payload = `${prevHash || ''}${auctionId}${bidId}${userId}${amount}${ts}`;
    const hash = crypto.createHash('sha256').update(payload).digest('hex');

    const { error: ledgerInsertErr } = await supabaseAdmin.from('bid_ledger').insert({
      auction_id: auctionId,
      bid_id: bidId,
      bidder_id: userId,
      amount,
      ts,
      prev_hash: prevHash,
      hash,
    });

    if (ledgerInsertErr) {
      console.error('bid_ledger insert error', ledgerInsertErr);
    }

    const canonicalState = {
      auctionId,
      bidId,
      amount,
    };

    if (idempotencyKey) {
      const { error: idemErr } = await supabaseAdmin.from('bid_requests').insert({
        idempotency_key: idempotencyKey,
        auction_id: auctionId,
        bidder_id: userId,
        response: canonicalState,
        status_code: 200,
      });
      if (idemErr) {
        console.error('bid_requests insert error', idemErr);
      }
    }

    // Emit Socket.io events via auctions namespace, with live bidding stats
    const events = getAuctionsEvents();
    if (events) {
      let bidding_stats: any = undefined;
      try {
        bidding_stats = await computeBiddingStats(auctionId);
      } catch (statsErr) {
        console.error('placeBid: computeBiddingStats error', statsErr);
      }

      events.emitBidAccepted(auctionId, { auctionId, bidId, amount, bidderId: userId, bidding_stats });
      if (prevHighestBidderId && prevHighestBidderId !== userId) {
        events.emitOutbid(auctionId, prevHighestBidderId, {
          auctionId,
          previousBidderId: prevHighestBidderId,
          newBidId: bidId,
          newAmount: amount,
          bidding_stats,
        });

        // Best-effort notification for the previously highest bidder
        try {
          await supabaseAdmin
            .from('notifications')
            .insert({
              user_id: prevHighestBidderId,
              type: 'bid_outbid',
              title: 'You have been outbid',
              message: 'Another bidder has placed a higher bid. Place a higher bid to stay in the lead.',
              auction_id: auctionId,
              read: false,
              read_at: null,
            });
        } catch (notifErr) {
          console.error('placeBid: failed to insert outbid notification', notifErr);
        }
      }
    }

    return { statusCode: 200, body: canonicalState };
  } catch (err) {
    console.error('placeBid error', err);
    const statusCode = (err as any).statusCode || 500;
    return { statusCode, body: { error: (err as any).message || 'Failed to place bid' } };
  }
}
