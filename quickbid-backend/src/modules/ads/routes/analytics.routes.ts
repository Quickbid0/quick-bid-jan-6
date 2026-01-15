import { Router } from 'express';
import { rateLimit } from '../../../middleware/rateLimit';
import {
  getAnalyticsSummary,
  getAnalyticsReport,
  exportAnalyticsCsv,
} from '../services/analytics.service';

export const analyticsRouter = Router();

const analyticsLimiter = rateLimit(
  (req) => `ads-analytics:${req.ip}`,
  60,
  5 * 60 * 1000,
);

analyticsRouter.get('/analytics', analyticsLimiter, async (req, res, next) => {
  try {
    const { sponsorId, campaignId, slotId, eventId, from, to } = req.query as Record<string, string>;
    const summary = await getAnalyticsSummary({
      sponsorId,
      campaignId,
      slotId,
      eventId,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

analyticsRouter.get('/analytics/report', analyticsLimiter, async (req, res, next) => {
  try {
    const { sponsorId, campaignId, slotId, eventId, from, to } = req.query as Record<string, string>;
    const report = await getAnalyticsReport({
      sponsorId,
      campaignId,
      slotId,
      eventId,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
    res.json(report);
  } catch (err) {
    next(err);
  }
});

analyticsRouter.get('/analytics/export', analyticsLimiter, async (req, res, next) => {
  try {
    const { sponsorId, campaignId, slotId, eventId, from, to } = req.query as Record<string, string>;
    const csv = await exportAnalyticsCsv({
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
  } catch (err) {
    next(err);
  }
});
