"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsRouter = void 0;
const express_1 = require("express");
const rateLimit_1 = require("../../../middleware/rateLimit");
const analytics_service_1 = require("../services/analytics.service");
exports.analyticsRouter = (0, express_1.Router)();
const analyticsLimiter = (0, rateLimit_1.rateLimit)((req) => `ads-analytics:${req.ip}`, 60, 5 * 60 * 1000);
exports.analyticsRouter.get('/analytics', analyticsLimiter, async (req, res, next) => {
    try {
        const { sponsorId, campaignId, slotId, eventId, from, to } = req.query;
        const summary = await (0, analytics_service_1.getAnalyticsSummary)({
            sponsorId,
            campaignId,
            slotId,
            eventId,
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
        });
        res.json(summary);
    }
    catch (err) {
        next(err);
    }
});
exports.analyticsRouter.get('/analytics/report', analyticsLimiter, async (req, res, next) => {
    try {
        const { sponsorId, campaignId, slotId, eventId, from, to } = req.query;
        const report = await (0, analytics_service_1.getAnalyticsReport)({
            sponsorId,
            campaignId,
            slotId,
            eventId,
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
        });
        res.json(report);
    }
    catch (err) {
        next(err);
    }
});
exports.analyticsRouter.get('/analytics/export', analyticsLimiter, async (req, res, next) => {
    try {
        const { sponsorId, campaignId, slotId, eventId, from, to } = req.query;
        const csv = await (0, analytics_service_1.exportAnalyticsCsv)({
            sponsorId,
            campaignId,
            slotId,
            eventId,
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
        });
        res.header('Content-Type', 'text/csv');
        res.attachment('analytics.csv');
        res.send(csv);
    }
    catch (err) {
        next(err);
    }
});
