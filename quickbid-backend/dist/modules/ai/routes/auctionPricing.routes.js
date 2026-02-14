"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auctionPricingRouter = void 0;
const express_1 = __importDefault(require("express"));
const supabaseAdmin_1 = require("../../../supabaseAdmin");
const authMiddleware_1 = require("../../../middleware/authMiddleware");
exports.auctionPricingRouter = express_1.default.Router();
exports.auctionPricingRouter.post('/ai/auction-pricing', authMiddleware_1.requireAuth, async (req, res, next) => {
    try {
        if (!supabaseAdmin_1.supabaseAdmin) {
            return res.status(500).json({ error: 'Supabase admin not configured' });
        }
        const { category, brand, model, year, kmDriven, condition } = req.body || {};
        if (!category || typeof category !== 'string') {
            return res.status(400).json({ error: 'category is required' });
        }
        const cond = typeof condition === 'string' ? condition.toLowerCase() : 'excellent';
        const getConditionFactor = (c) => {
            switch (c) {
                case 'new': return 1.1;
                case 'excellent': return 1.0;
                case 'good': return 0.92;
                case 'fair': return 0.85;
                case 'poor': return 0.75;
                default: return 1.0;
            }
        };
        const percentile = (arr, p) => {
            if (!arr.length)
                return 0;
            const a = [...arr].sort((x, y) => x - y);
            const idx = Math.min(a.length - 1, Math.max(0, Math.floor((p / 100) * a.length)));
            return a[idx];
        };
        let query = supabaseAdmin_1.supabaseAdmin
            .from('products')
            .select('current_price, final_price, category, make, model, year_of_purchase, km_driven')
            .eq('category', category)
            .limit(100);
        if (brand)
            query = query.eq('make', brand);
        if (model)
            query = query.eq('model', model);
        const { data, error } = await query;
        if (error) {
            console.error('auction-pricing: products select error', error);
        }
        const prices = (data || [])
            .map((r) => (r.final_price ?? r.current_price))
            .filter((n) => typeof n === 'number' && n > 0);
        let market = 0;
        if (prices.length >= 5)
            market = Math.round(percentile(prices, 50));
        else if (prices.length > 0)
            market = Math.round(prices.reduce((s, v) => s + v, 0) / prices.length);
        if (!market)
            market = 10000;
        const condFactor = getConditionFactor(cond);
        let adjusted = Math.round(market * condFactor);
        const km = typeof kmDriven === 'number' ? kmDriven : 0;
        if (km > 0) {
            const kmPenalty = 1 - Math.min(0.3, Math.floor(km / 10000) * 0.02);
            adjusted = Math.max(1000, Math.round(adjusted * kmPenalty));
        }
        const startingPrice = Math.max(1000, Math.round(adjusted * 0.85));
        const reservePrice = Math.max(startingPrice, Math.round(adjusted * 0.95));
        const reasonParts = [];
        if (prices.length >= 5) {
            reasonParts.push(`Based on ${prices.length} similar items in ${category}`);
        }
        else if (prices.length > 0) {
            reasonParts.push(`Based on limited market data (${prices.length} similar items)`);
        }
        else {
            reasonParts.push('Using default floor pricing due to limited market data');
        }
        reasonParts.push(`condition ${cond}`);
        if (km > 0)
            reasonParts.push(`${km} km driven`);
        return res.json({
            startingPrice,
            reservePrice,
            reason: reasonParts.join(', '),
        });
    }
    catch (err) {
        next(err);
    }
});
// Heuristic "AI" settlement ETA for a given auction based on seller payout history
exports.auctionPricingRouter.get('/ai/settlement-eta/:auctionId', authMiddleware_1.requireAuth, async (req, res, next) => {
    try {
        if (!supabaseAdmin_1.supabaseAdmin) {
            return res.status(500).json({ error: 'Supabase admin not configured' });
        }
        const { auctionId } = req.params;
        if (!auctionId) {
            return res.status(400).json({ error: 'auctionId is required' });
        }
        const { data: auction, error: auctionErr } = await supabaseAdmin_1.supabaseAdmin
            .from('auctions')
            .select('id, seller_id, created_at, actual_end_time')
            .eq('id', auctionId)
            .maybeSingle();
        if (auctionErr) {
            console.error('settlement-eta: auction select error', auctionErr);
            return res.status(500).json({ error: 'Failed to load auction' });
        }
        if (!auction || !auction.seller_id) {
            return res.json({
                auctionId,
                sellerId: auction?.seller_id ?? null,
                samples: 0,
                minDays: 3,
                maxDays: 5,
                medianDays: 4,
                label: 'Typical settlement 3–5 days',
            });
        }
        const sellerId = auction.seller_id;
        const { data: payouts, error: payoutsErr } = await supabaseAdmin_1.supabaseAdmin
            .from('payouts')
            .select('created_at, paid_at, status')
            .eq('seller_id', sellerId)
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(50);
        if (payoutsErr) {
            console.error('settlement-eta: payouts select error', payoutsErr);
        }
        const durations = (payouts || [])
            .map((p) => {
            const created = p.created_at ? new Date(p.created_at) : null;
            const paid = p.paid_at ? new Date(p.paid_at) : null;
            if (!created || !paid)
                return null;
            const ms = paid.getTime() - created.getTime();
            const days = ms / (1000 * 60 * 60 * 24);
            return Number.isFinite(days) && days > 0 ? days : null;
        })
            .filter((d) => d != null)
            .sort((a, b) => a - b);
        const samples = durations.length;
        const percentile = (arr, p) => {
            if (!arr.length)
                return 0;
            const idx = Math.min(arr.length - 1, Math.max(0, Math.floor(((p / 100) * arr.length))));
            return arr[idx];
        };
        let minDays = 3;
        let maxDays = 5;
        let medianDays = 4;
        if (samples >= 3) {
            const p25 = percentile(durations, 25);
            const p50 = percentile(durations, 50);
            const p75 = percentile(durations, 75);
            medianDays = Math.max(1, Math.round(p50 || p25 || 3));
            minDays = Math.max(1, Math.round(p25 || medianDays));
            maxDays = Math.max(minDays, Math.round(p75 || medianDays));
        }
        else if (samples > 0) {
            const avg = durations.reduce((s, v) => s + v, 0) / samples;
            medianDays = Math.max(1, Math.round(avg));
            minDays = Math.max(1, medianDays - 1);
            maxDays = medianDays + 1;
        }
        const fmtRange = () => {
            if (minDays === maxDays) {
                return `${minDays} day${minDays === 1 ? '' : 's'}`;
            }
            return `${minDays}–${maxDays} days`;
        };
        const labelBase = samples >= 3
            ? `Based on last ${samples} completed payout${samples > 1 ? 's' : ''} for this seller`
            : 'Based on limited payout history for this seller';
        return res.json({
            auctionId,
            sellerId,
            samples,
            minDays,
            maxDays,
            medianDays,
            label: `${fmtRange()} · ${labelBase}`,
        });
    }
    catch (err) {
        next(err);
    }
});
