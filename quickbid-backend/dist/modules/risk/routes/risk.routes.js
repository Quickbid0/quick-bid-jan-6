"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.riskRouter = void 0;
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../../middleware/authMiddleware");
const sellerRisk_service_1 = require("../services/sellerRisk.service");
exports.riskRouter = express_1.default.Router();
const requireAdminOrSuperAdmin = (req, res, next) => {
    const role = req.user?.role;
    if (role !== 'admin' && role !== 'superadmin') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    next();
};
exports.riskRouter.get('/risk/sellers/:sellerId', authMiddleware_1.requireAuth, async (req, res, next) => {
    try {
        const { sellerId } = req.params;
        if (!sellerId) {
            return res.status(400).json({ error: 'sellerId is required' });
        }
        const callerId = req.user?.id;
        const callerRole = req.user?.role;
        if (!callerId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (callerId !== sellerId && callerRole !== 'admin' && callerRole !== 'superadmin') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const summary = await (0, sellerRisk_service_1.getSellerRiskSummary)(sellerId);
        if (!summary) {
            return res.status(404).json({ error: 'No risk data for seller' });
        }
        res.json(summary);
    }
    catch (err) {
        next(err);
    }
});
exports.riskRouter.post('/risk/sellers/:sellerId/penalties', authMiddleware_1.requireAuth, requireAdminOrSuperAdmin, async (req, res, next) => {
    try {
        const { sellerId } = req.params;
        if (!sellerId) {
            return res.status(400).json({ error: 'sellerId is required' });
        }
        const { type, severity, points, reason, evidenceJson, cooldownDays } = req.body || {};
        if (!type || typeof type !== 'string') {
            return res.status(400).json({ error: 'type is required' });
        }
        if (!severity || !['low', 'medium', 'high'].includes(String(severity))) {
            return res.status(400).json({ error: 'severity must be one of low, medium, high' });
        }
        const adminId = req.user?.id || null;
        const summary = await (0, sellerRisk_service_1.applySellerPenalty)({
            sellerId,
            type,
            severity,
            points: typeof points === 'number' ? points : undefined,
            reason: typeof reason === 'string' ? reason : null,
            evidenceJson: evidenceJson && typeof evidenceJson === 'object' ? evidenceJson : {},
            appliedBy: adminId,
            cooldownDays: typeof cooldownDays === 'number' ? cooldownDays : undefined,
        });
        return res.status(200).json(summary);
    }
    catch (err) {
        next(err);
    }
});
