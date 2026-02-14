"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalyticsSummary = getAnalyticsSummary;
exports.getAnalyticsReport = getAnalyticsReport;
exports.exportAnalyticsCsv = exportAnalyticsCsv;
const AdImpression_1 = require("../models/AdImpression");
function buildMatch(filter) {
    const match = {};
    if (filter.sponsorId)
        match.sponsorId = filter.sponsorId;
    if (filter.campaignId)
        match.campaignId = filter.campaignId;
    if (filter.slotId)
        match.slotId = filter.slotId;
    if (filter.eventId)
        match.eventId = filter.eventId;
    if (filter.from || filter.to) {
        match.timestamp = {};
        if (filter.from)
            match.timestamp.$gte = filter.from;
        if (filter.to)
            match.timestamp.$lte = filter.to;
    }
    return match;
}
async function getAnalyticsSummary(filter) {
    const match = buildMatch(filter);
    const [row] = await AdImpression_1.AdImpression.aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                impressions: { $sum: 1 },
                clicks: { $sum: { $cond: ['$clicked', 1, 0] } },
                watchTimeMs: { $sum: '$durationMs' },
            },
        },
    ]);
    const impressions = row?.impressions || 0;
    const clicks = row?.clicks || 0;
    const watchTimeMs = row?.watchTimeMs || 0;
    const ctr = impressions > 0 ? clicks / impressions : 0;
    return { impressions, clicks, watchTimeMs, ctr };
}
async function getAnalyticsReport(filter) {
    const match = buildMatch(filter);
    const byDay = await AdImpression_1.AdImpression.aggregate([
        { $match: match },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                impressions: { $sum: 1 },
                clicks: { $sum: { $cond: ['$clicked', 1, 0] } },
                watchTimeMs: { $sum: '$durationMs' },
            },
        },
        { $sort: { _id: 1 } },
    ]);
    return byDay.map((d) => ({
        date: d._id,
        impressions: d.impressions,
        clicks: d.clicks,
        watchTimeMs: d.watchTimeMs,
    }));
}
async function exportAnalyticsCsv(filter) {
    const rows = await getAnalyticsReport(filter);
    const header = 'date,impressions,clicks,watchTimeMs,ctr';
    const lines = rows.map((r) => {
        const ctr = r.impressions > 0 ? r.clicks / r.impressions : 0;
        return `${r.date},${r.impressions},${r.clicks},${r.watchTimeMs},${ctr.toFixed(4)}`;
    });
    return [header, ...lines].join('\n');
}
