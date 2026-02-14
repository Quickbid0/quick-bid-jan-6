"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeBiddingStats = computeBiddingStats;
const supabaseAdmin_1 = require("../../../supabaseAdmin");
async function computeBiddingStats(auctionId) {
    if (!supabaseAdmin_1.supabaseAdmin) {
        throw Object.assign(new Error('Supabase admin not configured'), { statusCode: 500 });
    }
    // Aggregate bids in a couple of queries to avoid pulling entire history
    const { data: agg, error: aggErr } = await supabaseAdmin_1.supabaseAdmin
        .from('bids')
        .select('amount, user_id, created_at')
        .eq('auction_id', auctionId)
        .eq('status', 'active')
        .order('amount', { ascending: false })
        .order('created_at', { ascending: false });
    if (aggErr) {
        console.error('computeBiddingStats: bids select error', aggErr);
        throw Object.assign(new Error('Failed to load bidding stats'), { statusCode: 500 });
    }
    if (!agg || agg.length === 0) {
        return {
            highestBid: null,
            highestBidder: null,
            totalBids: 0,
            bidsPerMinute: 0,
            activeBidders: 0,
            lastBidTime: null,
        };
    }
    const totalBids = agg.length;
    const highest = agg[0];
    const highestBid = Number(highest.amount) || 0;
    const highestBidder = highest.user_id;
    const firstTime = new Date(agg[agg.length - 1].created_at).getTime();
    const lastTime = new Date(agg[0].created_at).getTime();
    const minutesSpan = Math.max((lastTime - firstTime) / 60000, 1 / 60); // avoid div by zero
    const bidsPerMinute = Number((totalBids / minutesSpan).toFixed(2));
    const distinctBidders = new Set();
    for (const row of agg) {
        if (row.user_id)
            distinctBidders.add(row.user_id);
    }
    return {
        highestBid,
        highestBidder,
        totalBids,
        bidsPerMinute,
        activeBidders: distinctBidders.size,
        lastBidTime: highest.created_at,
    };
}
