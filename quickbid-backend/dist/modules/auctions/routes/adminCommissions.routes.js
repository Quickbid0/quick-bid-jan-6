"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminCommissionsRouter = void 0;
const express_1 = __importDefault(require("express"));
const supabaseAdmin_1 = require("../../../supabaseAdmin");
const authMiddleware_1 = require("../../../middleware/authMiddleware");
const commissionService_1 = require("../services/commissionService");
exports.adminCommissionsRouter = express_1.default.Router();
const requireAdminOrSuperAdmin = (req, res, next) => {
    const role = req.user?.role;
    if (role !== 'admin' && role !== 'superadmin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    next();
};
exports.adminCommissionsRouter.get('/commissions/current', authMiddleware_1.requireAuth, requireAdminOrSuperAdmin, async (_req, res) => {
    try {
        const settings = await commissionService_1.commissionService.getActive(true);
        return res.json({ ok: true, settings });
    }
    catch (e) {
        console.error('adminCommissions: get current error', e);
        return res.status(500).json({ ok: false, error: 'internal_error' });
    }
});
exports.adminCommissionsRouter.post('/commissions', authMiddleware_1.requireAuth, requireAdminOrSuperAdmin, async (req, res) => {
    try {
        if (!supabaseAdmin_1.supabaseAdmin) {
            return res.status(500).json({ ok: false, error: 'Supabase admin not configured' });
        }
        const { buyer_commission_percent, seller_commission_percent, platform_flat_fee_cents, category_overrides, } = req.body || {};
        const buyerPct = Number(buyer_commission_percent);
        const sellerPct = Number(seller_commission_percent);
        const flatFee = Number(platform_flat_fee_cents || 0);
        if (!Number.isFinite(buyerPct) || buyerPct < 0 || buyerPct > 100) {
            return res.status(400).json({ ok: false, error: 'buyer_commission_percent must be between 0 and 100' });
        }
        if (!Number.isFinite(sellerPct) || sellerPct < 0 || sellerPct > 100) {
            return res.status(400).json({ ok: false, error: 'seller_commission_percent must be between 0 and 100' });
        }
        if (!Number.isFinite(flatFee) || flatFee < 0) {
            return res.status(400).json({ ok: false, error: 'platform_flat_fee_cents cannot be negative' });
        }
        const { data, error } = await supabaseAdmin_1.supabaseAdmin
            .from('commission_settings')
            .insert({
            buyer_commission_percent: buyerPct,
            seller_commission_percent: sellerPct,
            platform_flat_fee_cents: flatFee,
            category_overrides: category_overrides ?? null,
            active: true,
            created_by: req.user?.id ?? null,
            updated_by: req.user?.id ?? null,
        })
            .select('id, buyer_commission_percent, seller_commission_percent, platform_flat_fee_cents, category_overrides, active')
            .single();
        if (error || !data) {
            console.error('adminCommissions: insert error', error);
            return res.status(500).json({ ok: false, error: 'Failed to create commission settings' });
        }
        commissionService_1.commissionService.invalidateCache();
        return res.status(201).json({ ok: true, settings: data });
    }
    catch (e) {
        console.error('adminCommissions: create error', e);
        return res.status(500).json({ ok: false, error: 'internal_error' });
    }
});
exports.adminCommissionsRouter.patch('/commissions/:id', authMiddleware_1.requireAuth, requireAdminOrSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        if (!id)
            return res.status(400).json({ ok: false, error: 'id is required' });
        if (!supabaseAdmin_1.supabaseAdmin) {
            return res.status(500).json({ ok: false, error: 'Supabase admin not configured' });
        }
        const patch = {};
        const { buyer_commission_percent, seller_commission_percent, platform_flat_fee_cents, active } = req.body || {};
        if (buyer_commission_percent !== undefined) {
            const pct = Number(buyer_commission_percent);
            if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
                return res.status(400).json({ ok: false, error: 'buyer_commission_percent must be between 0 and 100' });
            }
            patch.buyer_commission_percent = pct;
        }
        if (seller_commission_percent !== undefined) {
            const pct = Number(seller_commission_percent);
            if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
                return res.status(400).json({ ok: false, error: 'seller_commission_percent must be between 0 and 100' });
            }
            patch.seller_commission_percent = pct;
        }
        if (platform_flat_fee_cents !== undefined) {
            const fee = Number(platform_flat_fee_cents);
            if (!Number.isFinite(fee) || fee < 0) {
                return res.status(400).json({ ok: false, error: 'platform_flat_fee_cents cannot be negative' });
            }
            patch.platform_flat_fee_cents = fee;
        }
        if (active !== undefined) {
            patch.active = !!active;
        }
        patch.updated_by = req.user?.id ?? null;
        patch.updated_at = new Date().toISOString();
        const { data, error } = await supabaseAdmin_1.supabaseAdmin
            .from('commission_settings')
            .update(patch)
            .eq('id', id)
            .select('id, buyer_commission_percent, seller_commission_percent, platform_flat_fee_cents, category_overrides, active')
            .maybeSingle();
        if (error) {
            console.error('adminCommissions: patch error', error);
            return res.status(500).json({ ok: false, error: 'Failed to update commission settings' });
        }
        commissionService_1.commissionService.invalidateCache();
        return res.json({ ok: true, settings: data });
    }
    catch (e) {
        console.error('adminCommissions: patch error', e);
        return res.status(500).json({ ok: false, error: 'internal_error' });
    }
});
