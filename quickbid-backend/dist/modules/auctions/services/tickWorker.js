"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAuctionTick = runAuctionTick;
const supabaseAdmin_1 = require("../../../supabaseAdmin");
const auctionEvents_1 = require("../../../socket/auctionEvents");
const liveStats_service_1 = require("./liveStats.service");
// Run periodic auction tick: auto-extend and finalize auctions.
async function runAuctionTick(options = {}) {
    if (!supabaseAdmin_1.supabaseAdmin) {
        console.warn('Supabase admin not configured, skipping auction tick');
        return;
    }
    const extensionThresholdSeconds = options.extensionThresholdSeconds ?? 60;
    const extensionSeconds = options.extensionSeconds ?? 60;
    const now = new Date();
    const nowIso = now.toISOString();
    // 1) Find active auctions that are due to end or recently ended
    const { data: auctions, error } = await supabaseAdmin_1.supabaseAdmin
        .from('auctions')
        .select('id, end_date, status, seller_id, product_id')
        .in('status', ['active', 'live'])
        .lte('end_date', new Date(now.getTime() + extensionThresholdSeconds * 1000).toISOString());
    if (error) {
        console.error('runAuctionTick: auctions select error', error);
        return;
    }
    if (!auctions || auctions.length === 0)
        return;
    const events = (0, auctionEvents_1.getAuctionsEvents)();
    for (const auction of auctions) {
        const endDate = new Date(auction.end_date);
        const secondsToEnd = (endDate.getTime() - now.getTime()) / 1000;
        // Fetch latest bids for this auction
        const { data: bids, error: bidsErr } = await supabaseAdmin_1.supabaseAdmin
            .from('bids')
            .select('id, user_id, amount, created_at')
            .eq('auction_id', auction.id)
            .eq('status', 'active')
            .order('amount', { ascending: false })
            .order('created_at', { ascending: false });
        if (bidsErr) {
            console.error('runAuctionTick: bids select error', bidsErr);
            continue;
        }
        const hasBids = bids && bids.length > 0;
        const latestBid = hasBids ? bids[0] : null;
        // Auto-extension: if we are within the extension threshold and there is a recent bid
        if (secondsToEnd > 0 && secondsToEnd <= extensionThresholdSeconds && latestBid) {
            const newEnd = new Date(endDate.getTime() + extensionSeconds * 1000).toISOString();
            const { error: updateErr } = await supabaseAdmin_1.supabaseAdmin
                .from('auctions')
                .update({ end_date: newEnd })
                .eq('id', auction.id);
            if (updateErr) {
                console.error('runAuctionTick: auction extend update error', updateErr);
                continue;
            }
            if (events) {
                let bidding_stats = undefined;
                try {
                    bidding_stats = await (0, liveStats_service_1.computeBiddingStats)(auction.id);
                }
                catch (statsErr) {
                    console.error('runAuctionTick: computeBiddingStats (extend) error', statsErr);
                }
                events.emitAuctionExtended(auction.id, {
                    auctionId: auction.id,
                    previousEndDate: auction.end_date,
                    newEndDate: newEnd,
                    bidding_stats,
                });
            }
            continue;
        }
        // Finalization: auction has ended
        if (endDate <= now) {
            if (!hasBids) {
                // No bids: mark ended with no winner
                const { error: endErr } = await supabaseAdmin_1.supabaseAdmin
                    .from('auctions')
                    .update({
                    status: 'ended',
                    winner_id: null,
                    final_price: null,
                    actual_end_time: nowIso,
                })
                    .eq('id', auction.id);
                if (endErr) {
                    console.error('runAuctionTick: end without bids update error', endErr);
                    continue;
                }
                if (events) {
                    let bidding_stats = undefined;
                    try {
                        bidding_stats = await (0, liveStats_service_1.computeBiddingStats)(auction.id);
                    }
                    catch (statsErr) {
                        console.error('runAuctionTick: computeBiddingStats (finalize no bids) error', statsErr);
                    }
                    events.emitAuctionFinalized(auction.id, {
                        auctionId: auction.id,
                        winnerId: null,
                        finalPrice: null,
                        bidding_stats,
                    });
                }
                continue;
            }
            // There are bids: determine winner from highest amount, then latest created_at
            const winningBid = latestBid;
            if (!winningBid) {
                continue;
            }
            const { error: finalizeErr } = await supabaseAdmin_1.supabaseAdmin
                .from('auctions')
                .update({
                status: 'ended',
                winner_id: winningBid.user_id,
                final_price: winningBid.amount,
                actual_end_time: nowIso,
            })
                .eq('id', auction.id);
            if (finalizeErr) {
                console.error('runAuctionTick: finalize update error', finalizeErr);
                continue;
            }
            // Create payout (settlement) record if not already present
            if (auction.seller_id) {
                try {
                    const { data: existingPayout, error: payoutCheckErr } = await supabaseAdmin_1.supabaseAdmin
                        .from('payouts')
                        .select('id')
                        .eq('payout_reference', auction.id)
                        .eq('seller_id', auction.seller_id)
                        .maybeSingle();
                    if (payoutCheckErr) {
                        console.error('runAuctionTick: payouts existing check error', payoutCheckErr);
                    }
                    else if (!existingPayout) {
                        const salePrice = Number(winningBid.amount || 0);
                        // Commission lookup: try to find the most relevant active rule for this product
                        let commissionAmount = 0;
                        const listingFeeAmount = 0;
                        const boostFeeAmount = 0;
                        const verificationFeeAmount = 0;
                        const otherFees = 0;
                        try {
                            if (auction.product_id) {
                                const { data: product, error: productErr } = await supabaseAdmin_1.supabaseAdmin
                                    .from('products')
                                    .select('category, main_category, sub_category')
                                    .eq('id', auction.product_id)
                                    .maybeSingle();
                                if (productErr) {
                                    console.error('runAuctionTick: product select for commission error', productErr);
                                }
                                else if (product) {
                                    const primaryCategory = product.main_category || product.category || product.sub_category || null;
                                    if (primaryCategory) {
                                        const { data: rules, error: rulesErr } = await supabaseAdmin_1.supabaseAdmin
                                            .from('commissions')
                                            .select('mode, commission_flat, commission_percent, min_commission, active, start_at, end_at')
                                            .eq('category', primaryCategory)
                                            .eq('active', true)
                                            .lte('start_at', nowIso)
                                            .or('end_at.is.null,end_at.gt.' + nowIso)
                                            .order('start_at', { ascending: false })
                                            .limit(1);
                                        if (rulesErr) {
                                            console.error('runAuctionTick: commissions select error', rulesErr);
                                        }
                                        else if (rules && rules.length > 0) {
                                            const rule = rules[0];
                                            const mode = rule.mode;
                                            const percent = rule.commission_percent != null ? Number(rule.commission_percent) : null;
                                            const flat = rule.commission_flat != null ? Number(rule.commission_flat) : null;
                                            const minCommission = rule.min_commission != null ? Number(rule.min_commission) : null;
                                            if (mode === 'percent' && percent !== null) {
                                                let value = (salePrice * percent) / 100;
                                                if (minCommission !== null && value < minCommission)
                                                    value = minCommission;
                                                commissionAmount = value;
                                            }
                                            else if (mode === 'flat' && flat !== null) {
                                                commissionAmount = flat;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        catch (commissionErr) {
                            console.error('runAuctionTick: commission calculation unexpected error', commissionErr);
                        }
                        const netPayout = salePrice - (commissionAmount + listingFeeAmount + boostFeeAmount + verificationFeeAmount + otherFees);
                        const { error: payoutInsertErr } = await supabaseAdmin_1.supabaseAdmin.from('payouts').insert({
                            seller_id: auction.seller_id,
                            product_id: auction.product_id || null,
                            listing_id: null,
                            sale_price: salePrice,
                            commission_amount: commissionAmount,
                            listing_fee_amount: listingFeeAmount,
                            boost_fee_amount: boostFeeAmount,
                            verification_fee_amount: verificationFeeAmount,
                            other_fees: otherFees,
                            net_payout: netPayout,
                            currency: 'INR',
                            status: 'pending',
                            payout_reference: auction.id,
                        });
                        if (payoutInsertErr) {
                            console.error('runAuctionTick: payouts insert error', payoutInsertErr);
                        }
                    }
                }
                catch (payoutErr) {
                    console.error('runAuctionTick: payouts creation unexpected error', payoutErr);
                }
            }
            if (events) {
                let bidding_stats = undefined;
                try {
                    bidding_stats = await (0, liveStats_service_1.computeBiddingStats)(auction.id);
                }
                catch (statsErr) {
                    console.error('runAuctionTick: computeBiddingStats (finalize winner) error', statsErr);
                }
                events.emitAuctionFinalized(auction.id, {
                    auctionId: auction.id,
                    winnerId: winningBid.user_id,
                    finalPrice: winningBid.amount,
                    bidding_stats,
                });
            }
            // Best-effort notification for the winning bidder
            try {
                if (winningBid.user_id) {
                    await supabaseAdmin_1.supabaseAdmin
                        .from('notifications')
                        .insert({
                        user_id: winningBid.user_id,
                        type: 'bid_won',
                        title: 'You won the auction',
                        message: 'Congratulations! You have won this auction. Please proceed to payment to complete your purchase.',
                        auction_id: auction.id,
                        read: false,
                        read_at: null,
                    });
                }
            }
            catch (notifErr) {
                console.error('runAuctionTick: failed to insert bid_won notification', notifErr);
            }
        }
    }
}
