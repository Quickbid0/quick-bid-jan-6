"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentRouter = void 0;
const express_1 = require("express");
const agentReferral_service_1 = require("../services/agentReferral.service");
exports.agentRouter = (0, express_1.Router)();
exports.agentRouter.get('/agents/referrals', async (_req, res, next) => {
    try {
        const all = await (0, agentReferral_service_1.listAllReferralBonuses)();
        res.json(all);
    }
    catch (err) {
        next(err);
    }
});
exports.agentRouter.post('/agents/:id/bonus', async (req, res, next) => {
    try {
        const agentId = req.params.id;
        const { sponsorId, bonusAmount, invoiceId } = req.body;
        const bonus = await (0, agentReferral_service_1.createAgentBonus)({ agentId, sponsorId, bonusAmount, invoiceId });
        res.status(201).json(bonus);
    }
    catch (err) {
        next(err);
    }
});
exports.agentRouter.get('/agents/:id/bonus/history', async (req, res, next) => {
    try {
        const bonuses = await (0, agentReferral_service_1.listAgentBonuses)(req.params.id);
        res.json(bonuses);
    }
    catch (err) {
        next(err);
    }
});
exports.agentRouter.patch('/agents/bonus/:referralId', async (req, res, next) => {
    try {
        const { status } = req.body;
        const updated = await (0, agentReferral_service_1.updateAgentBonusStatus)(req.params.referralId, status);
        if (!updated) {
            res.status(404).json({ message: 'Referral bonus not found' });
            return;
        }
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
});
