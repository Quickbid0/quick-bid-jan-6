"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.referralRouter = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../../../middleware/authMiddleware");
const requirePermission_1 = require("../../rbac/middleware/requirePermission");
const referral_service_1 = require("../referral.service");
const ReferralBonusHistory_1 = require("../models/ReferralBonusHistory");
const ReferralBonusRule_1 = require("../models/ReferralBonusRule");
exports.referralRouter = (0, express_1.Router)();
// Apply first deposit bonus
exports.referralRouter.post('/referral/apply-first-deposit-bonus', authMiddleware_1.requireAuth, async (req, res) => {
    try {
        const { userId, depositAmount, walletTransactionId, deviceId, ipAddress } = req.body;
        if (!userId || !depositAmount || !walletTransactionId) {
            return res.status(400).json({ message: 'userId, depositAmount and walletTransactionId are required' });
        }
        const result = await (0, referral_service_1.applyFirstDepositBonus)({
            userId,
            depositAmount,
            walletTransactionId,
            deviceId,
            ipAddress,
        });
        res.json(result);
    }
    catch (err) {
        console.error('apply-first-deposit-bonus error', err);
        res.status(500).json({ message: 'Failed to apply first deposit bonus', error: err.message });
    }
});
// Apply first bid bonus
exports.referralRouter.post('/referral/apply-first-bid-bonus', authMiddleware_1.requireAuth, async (req, res) => {
    try {
        const { userId, bidId, deviceId, ipAddress } = req.body;
        if (!userId || !bidId) {
            return res.status(400).json({ message: 'userId and bidId are required' });
        }
        const result = await (0, referral_service_1.applyFirstBidBonus)({ userId, bidId, deviceId, ipAddress });
        res.json(result);
    }
    catch (err) {
        console.error('apply-first-bid-bonus error', err);
        res.status(500).json({ message: 'Failed to apply first bid bonus', error: err.message });
    }
});
// Bonus history for current user (or specific user if you add RBAC later)
exports.referralRouter.get('/referral/bonus/history', authMiddleware_1.requireAuth, async (req, res) => {
    try {
        const { userId } = req.query;
        const currentUserId = req.user?.id;
        const targetUserId = userId || currentUserId;
        if (!targetUserId) {
            return res.status(400).json({ message: 'userId is required' });
        }
        const history = await ReferralBonusHistory_1.ReferralBonusHistory.find({ referrerUserId: targetUserId })
            .sort({ createdAt: -1 })
            .lean();
        res.json(history);
    }
    catch (err) {
        console.error('bonus history error', err);
        res.status(500).json({ message: 'Failed to fetch bonus history', error: err.message });
    }
});
// Admin: list referral bonus history with filters
exports.referralRouter.get('/admin/referral/bonus/history', authMiddleware_1.requireAuth, (0, requirePermission_1.requirePermission)('referral.history.view_all'), async (req, res) => {
    try {
        const { status, source, eventType, referrerUserId, referredUserId, from, to, searchTerm, limit = '50', offset = '0', } = req.query;
        const query = {};
        if (status)
            query.status = status;
        if (source)
            query.source = source;
        if (eventType)
            query.eventType = eventType;
        if (referrerUserId)
            query.referrerUserId = referrerUserId;
        if (referredUserId)
            query.referredUserId = referredUserId;
        // Date range filter on createdAt
        if (from || to) {
            const range = {};
            if (from)
                range.$gte = new Date(from);
            if (to)
                range.$lte = new Date(to);
            query.createdAt = range;
        }
        // Search term across referrerUserId and referredUserId
        if (searchTerm) {
            const regex = new RegExp(searchTerm, 'i');
            query.$or = [
                { referrerUserId: regex },
                { referredUserId: regex },
            ];
        }
        const lim = Math.min(parseInt(limit, 10) || 50, 200);
        const off = parseInt(offset, 10) || 0;
        const [items, total] = await Promise.all([
            ReferralBonusHistory_1.ReferralBonusHistory.find(query)
                .sort({ createdAt: -1 })
                .skip(off)
                .limit(lim)
                .lean(),
            ReferralBonusHistory_1.ReferralBonusHistory.countDocuments(query),
        ]);
        res.json({ items, total });
    }
    catch (err) {
        console.error('admin bonus history error', err);
        res.status(500).json({ message: 'Failed to fetch referral bonus history', error: err.message });
    }
});
// Admin: update referral bonus status (approve/reject/mark credited)
exports.referralRouter.patch('/admin/referral/bonus/:id/status', authMiddleware_1.requireAuth, (0, requirePermission_1.requirePermission)('referral.payout.approve'), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;
        if (!status || !['approved', 'rejected', 'credited'].includes(status)) {
            return res.status(400).json({ message: 'status must be one of approved, rejected, credited' });
        }
        const updates = {
            status,
        };
        if (reason)
            updates.reason = reason;
        if (status === 'approved' || status === 'credited') {
            updates.approvedBy = req.user?.id || 'system';
        }
        const updated = await ReferralBonusHistory_1.ReferralBonusHistory.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
        if (!updated) {
            return res.status(404).json({ message: 'Referral bonus record not found' });
        }
        res.json(updated);
    }
    catch (err) {
        console.error('admin update referral bonus status error', err);
        res.status(500).json({ message: 'Failed to update referral bonus status', error: err.message });
    }
});
// Admin: freeze / unfreeze referral bonus for fraud review
exports.referralRouter.patch('/admin/referral/bonus/:id/freeze', authMiddleware_1.requireAuth, (0, requirePermission_1.requirePermission)('referral.bonus.freeze'), async (req, res) => {
    try {
        const { id } = req.params;
        const { frozen, fraudNotes } = req.body;
        const isFrozen = !!frozen;
        const updates = {
            status: isFrozen ? 'frozen' : 'pending',
            flaggedFraud: isFrozen,
        };
        if (typeof fraudNotes === 'string') {
            updates.fraudNotes = fraudNotes;
        }
        if (isFrozen) {
            updates.frozenBy = req.user?.id || 'system';
        }
        const updated = await ReferralBonusHistory_1.ReferralBonusHistory.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
        if (!updated) {
            return res.status(404).json({ message: 'Referral bonus record not found' });
        }
        res.json(updated);
    }
    catch (err) {
        console.error('admin freeze referral bonus error', err);
        res.status(500).json({ message: 'Failed to update referral bonus freeze state', error: err.message });
    }
});
// Admin: update referral bonus settings (single rule per type)
exports.referralRouter.put('/admin/referral/bonus/settings', authMiddleware_1.requireAuth, (0, requirePermission_1.requirePermission)('referral.settings.manage'), async (req, res) => {
    try {
        const { type, ...settings } = req.body;
        if (!type) {
            return res.status(400).json({ message: 'type is required' });
        }
        const updated = await ReferralBonusRule_1.ReferralBonusRule.findOneAndUpdate({ type }, {
            $set: {
                ...settings,
                updatedBy: req.user?.id || 'system',
            },
            $setOnInsert: {
                createdBy: req.user?.id || 'system',
            },
        }, { new: true, upsert: true }).lean();
        res.json(updated);
    }
    catch (err) {
        console.error('update referral settings error', err);
        res.status(500).json({ message: 'Failed to update referral settings', error: err.message });
    }
});
