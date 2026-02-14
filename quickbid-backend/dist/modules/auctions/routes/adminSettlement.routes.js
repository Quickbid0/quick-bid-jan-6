"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminSettlementRouter = void 0;
const express_1 = __importDefault(require("express"));
const supabaseAdmin_1 = require("../../../supabaseAdmin");
const authMiddleware_1 = require("../../../middleware/authMiddleware");
const computeQuickMelaCommissions_1 = require("../services/computeQuickMelaCommissions");
const escrowClient_1 = require("../../../services/escrowClient");
const settlementLedger_service_1 = require("../services/settlementLedger.service");
exports.adminSettlementRouter = express_1.default.Router();
const requireAdminOrSuperAdmin = (req, res, next) => {
    const role = req.user?.role;
    if (role !== 'admin' && role !== 'superadmin') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    next();
};
exports.adminSettlementRouter.post('/auctions/:auctionId/settle', authMiddleware_1.requireAuth, requireAdminOrSuperAdmin, async (req, res, next) => {
    try {
        const { auctionId } = req.params;
        if (!auctionId) {
            return res.status(400).json({ ok: false, error: 'auctionId is required' });
        }
        if (!supabaseAdmin_1.supabaseAdmin) {
            return res.status(500).json({ ok: false, error: 'Supabase admin not configured' });
        }
        const { data: auction, error: auctionErr } = await supabaseAdmin_1.supabaseAdmin
            .from('auctions')
            .select('id, status, winner_id, final_price, seller_id, product_id')
            .eq('id', auctionId)
            .maybeSingle();
        if (auctionErr) {
            console.error('admin settle auction: auction select error', auctionErr);
            return res.status(500).json({ ok: false, error: 'Failed to load auction' });
        }
        if (!auction) {
            return res.status(404).json({ ok: false, error: 'auction not found' });
        }
        if (!auction.winner_id || auction.final_price == null) {
            return res.status(400).json({ ok: false, error: 'auction has no winner or final price' });
        }
        if ((auction.status || '').toLowerCase() === 'completed') {
            return res.status(409).json({ ok: false, error: 'auction already completed' });
        }
        const finalPrice = Number(auction.final_price);
        if (!Number.isFinite(finalPrice) || finalPrice <= 0) {
            return res.status(400).json({ ok: false, error: 'invalid final price on auction' });
        }
        const finalPriceCents = Math.round(finalPrice * 100);
        const { buyerCommission, sellerCommission, totalCommission, netToSeller, platformFlatCents } = await (0, computeQuickMelaCommissions_1.computeQuickMelaCommissions)(finalPriceCents);
        const { data: existingPayout, error: payoutSelectErr } = await supabaseAdmin_1.supabaseAdmin
            .from('payouts')
            .select('id, status')
            .eq('payout_reference', auctionId)
            .maybeSingle();
        if (payoutSelectErr) {
            console.error('admin settle auction: payout select error', payoutSelectErr);
            return res.status(500).json({ ok: false, error: 'Failed to load payout' });
        }
        let payoutId;
        if (!existingPayout) {
            const salePrice = finalPriceCents / 100;
            const commissionAmount = sellerCommission / 100;
            const netPayout = netToSeller / 100;
            const { data: created, error: createErr } = await supabaseAdmin_1.supabaseAdmin
                .from('payouts')
                .insert({
                seller_id: auction.seller_id,
                product_id: auction.product_id,
                listing_id: null,
                sale_price: salePrice,
                commission_amount: commissionAmount,
                net_payout: netPayout,
                payout_reference: auctionId,
                status: 'pending',
            })
                .select('id')
                .single();
            if (createErr || !created) {
                console.error('admin settle auction: payout insert error', createErr);
                return res.status(500).json({ ok: false, error: 'Failed to create payout' });
            }
            payoutId = created.id;
        }
        else {
            payoutId = existingPayout.id;
            if ((existingPayout.status || '').toLowerCase() === 'completed') {
                // Idempotent: if payout already completed, still return commissions but do not double-settle
                await (0, settlementLedger_service_1.recordSettlementForPayout)({ payoutId });
                return res.status(200).json({
                    ok: true,
                    status: 'already_completed',
                    commissions: { buyerCommission, sellerCommission, platformFlatCents, totalCommission },
                    payoutId,
                });
            }
        }
        const { data: escrow, error: escrowErr } = await supabaseAdmin_1.supabaseAdmin
            .from('escrow_accounts')
            .select('id, status')
            .eq('auction_id', auctionId)
            .eq('buyer_id', auction.winner_id)
            .maybeSingle();
        if (escrowErr) {
            console.error('admin settle auction: escrow select error', escrowErr);
            return res.status(500).json({ ok: false, error: 'Failed to load escrow account' });
        }
        if (!escrow || escrow.status !== 'FUNDED') {
            const { error: auctionUpdateErr } = await supabaseAdmin_1.supabaseAdmin
                .from('auctions')
                .update({ status: 'awaiting_funds' })
                .eq('id', auctionId);
            if (auctionUpdateErr) {
                console.error('admin settle auction: update awaiting_funds error', auctionUpdateErr);
            }
            return res.status(200).json({
                ok: false,
                message: 'escrow not funded; marked auction awaiting_funds',
                commissions: { buyerCommission, sellerCommission, platformFlatCents, totalCommission },
            });
        }
        const feeToPlatform = buyerCommission + sellerCommission + (platformFlatCents || 0);
        const escrowResp = await escrowClient_1.escrowClient.release({
            escrowId: escrow.id,
            netToSellerCents: netToSeller,
            feeToPlatformCents: feeToPlatform,
            reference: `settle:${auctionId}`,
        });
        if (!escrowResp || !escrowResp.ok) {
            console.error('admin settle auction: escrow release failed', escrowResp);
            return res.status(502).json({ ok: false, error: 'escrow release failed', details: escrowResp });
        }
        const { error: payoutUpdateErr } = await supabaseAdmin_1.supabaseAdmin
            .from('payouts')
            .update({ status: 'completed', paid_at: new Date().toISOString() })
            .eq('id', payoutId);
        if (payoutUpdateErr) {
            console.error('admin settle auction: payout update error', payoutUpdateErr);
            return res.status(500).json({ ok: false, error: 'Failed to update payout status' });
        }
        const { error: auctionStatusErr } = await supabaseAdmin_1.supabaseAdmin
            .from('auctions')
            .update({ status: 'completed' })
            .eq('id', auctionId);
        if (auctionStatusErr) {
            console.error('admin settle auction: auction status update error', auctionStatusErr);
        }
        if (auction.product_id) {
            const { error: productStatusErr } = await supabaseAdmin_1.supabaseAdmin
                .from('products')
                .update({ status: 'settled' })
                .eq('id', auction.product_id);
            if (productStatusErr) {
                console.error('admin settle auction: product status update error', productStatusErr);
            }
        }
        await (0, settlementLedger_service_1.recordSettlementForPayout)({ payoutId });
        return res.json({
            ok: true,
            commissions: { buyerCommission, sellerCommission, totalCommission },
            payoutId,
        });
    }
    catch (err) {
        console.error('admin settle auction: unexpected error', err);
        return next(err);
    }
});
