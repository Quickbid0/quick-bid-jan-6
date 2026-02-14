"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminPayoutsRouter = void 0;
const express_1 = __importDefault(require("express"));
const supabaseAdmin_1 = require("../../../supabaseAdmin");
const settlementLedger_service_1 = require("../services/settlementLedger.service");
const authMiddleware_1 = require("../../../middleware/authMiddleware");
exports.adminPayoutsRouter = express_1.default.Router();
const requireAdminOrSuperAdmin = (req, res, next) => {
    const role = req.user?.role;
    if (role !== 'admin' && role !== 'superadmin') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    next();
};
exports.adminPayoutsRouter.post('/payouts/:payoutId/complete', authMiddleware_1.requireAuth, requireAdminOrSuperAdmin, async (req, res, next) => {
    try {
        const { payoutId } = req.params;
        if (!payoutId) {
            return res.status(400).json({ error: 'payoutId is required' });
        }
        if (!supabaseAdmin_1.supabaseAdmin) {
            return res.status(500).json({ error: 'Supabase admin not configured' });
        }
        const { data: payout, error: selectErr } = await supabaseAdmin_1.supabaseAdmin
            .from('payouts')
            .select('id, status')
            .eq('id', payoutId)
            .maybeSingle();
        if (selectErr) {
            console.error('admin complete payout: select error', selectErr);
            return res.status(500).json({ error: 'Failed to load payout' });
        }
        if (!payout) {
            return res.status(404).json({ error: 'Payout not found' });
        }
        if (payout.status === 'completed') {
            // Idempotent: still trigger ledger in case it was missed earlier
            await (0, settlementLedger_service_1.recordSettlementForPayout)({ payoutId });
            return res.status(200).json({ status: 'already_completed' });
        }
        const { error: updateErr } = await supabaseAdmin_1.supabaseAdmin
            .from('payouts')
            .update({ status: 'completed' })
            .eq('id', payoutId);
        if (updateErr) {
            console.error('admin complete payout: update error', updateErr);
            return res.status(500).json({ error: 'Failed to mark payout as completed' });
        }
        await (0, settlementLedger_service_1.recordSettlementForPayout)({ payoutId });
        return res.status(200).json({ status: 'completed' });
    }
    catch (err) {
        next(err);
    }
});
