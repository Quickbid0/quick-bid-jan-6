import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import * as Sentry from '@sentry/node';
import crypto from 'crypto';

import { communityRouter } from './modules/community/routes/community.routes';
import { adminCommunityRouter } from './modules/community/routes/admin.routes';
import { rbacRouter } from './modules/rbac/routes/rbac.routes';
import { referralRouter } from './modules/referral/routes/referral.routes';
import { sponsorRouter } from './modules/ads/routes/sponsor.routes';
import { adSlotRouter } from './modules/ads/routes/slot.routes';
import { campaignRouter } from './modules/ads/routes/campaign.routes';
import { analyticsRouter } from './modules/ads/routes/analytics.routes';
import { invoiceRouter } from './modules/ads/routes/invoice.routes';
import { agentRouter } from './modules/ads/routes/agent.routes';
import { sponsorAuthRouter } from './modules/ads/routes/sponsorAuth.routes';
import { overlayRouter } from './modules/ads/routes/overlay.routes';
import { auctionsRouter } from './modules/auctions/routes/placeBid.routes';
import { adminPayoutsRouter } from './modules/auctions/routes/adminPayouts.routes';
import { adminSettlementRouter } from './modules/auctions/routes/adminSettlement.routes';
import { adminCommissionsRouter } from './modules/auctions/routes/adminCommissions.routes';
import { winPaymentsRouter } from './modules/auctions/routes/winPayments.routes';
import { payoutsRouter } from './modules/finance/routes/payouts.routes';
import { pixelRouter } from './modules/marketing/routes/pixel.routes';
import { eventsRouter } from './modules/marketing/routes/events.routes';
import { sellersRouter } from './modules/sellers/routes/sellers.routes';
import { departmentsRouter } from './modules/org/routes/departments.routes';
import { branchesRouter } from './modules/org/routes/branches.routes';
import { staffRouter } from './modules/org/routes/staff.routes';
import { riskRouter } from './modules/risk/routes/risk.routes';
import { auctionPricingRouter } from './modules/ai/routes/auctionPricing.routes';
import { salesRouter } from './modules/sales/routes/salesDashboard.routes';
import { emailRouter } from './modules/marketing/routes/email.routes';
import { adminBulkVerificationRouter } from './modules/products/routes/adminBulkVerification.routes';
import { auctionsBrowseRouter } from './modules/auctions/routes/browse.routes';

dotenv.config();

export const createApp = () => {
  const app = express();

  app.set('trust proxy', true);

  const SENTRY_DSN = process.env.SENTRY_DSN || '';
  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1),
      environment: process.env.NODE_ENV || 'development',
      release: process.env.APP_RELEASE || undefined,
    });
  }

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(morgan('dev'));
  app.use((req, res, next) => {
    const rid = (req.headers['x-request-id'] as string) || crypto.randomUUID();
    (req as any).requestId = rid;
    res.setHeader('x-request-id', rid);
    next();
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'quickbid-backend' });
  });

  app.use('/api/community', communityRouter);
  app.use('/api/admin/community', adminCommunityRouter);
  app.use('/api/rbac', rbacRouter);
  app.use('/api', referralRouter);
  app.use('/api', auctionsRouter);
  app.use('/api', winPaymentsRouter);
  app.use('/api', payoutsRouter);
  app.use('/api', sellersRouter);
  app.use('/api', riskRouter);
  app.use('/api', auctionPricingRouter);
  app.use('/api', salesRouter);
  app.use('/api', departmentsRouter);
  app.use('/api', branchesRouter);
  app.use('/api', staffRouter);
  app.use('/api', auctionsBrowseRouter);
  app.use('/api/admin', adminPayoutsRouter);
  app.use('/api/admin', adminSettlementRouter);
  app.use('/api/admin', adminCommissionsRouter);
  app.use('/api/admin/products', adminBulkVerificationRouter);
  app.use('/api/ads', sponsorRouter);
  app.use('/api/ads', adSlotRouter);
  app.use('/api/ads', campaignRouter);
  app.use('/api/ads', analyticsRouter);
  app.use('/api/ads', invoiceRouter);
  app.use('/api/ads', agentRouter);
  app.use('/api/ads', sponsorAuthRouter);
  app.use('/api/ads', overlayRouter);
  app.use('/api/marketing', emailRouter);

  app.get('/api/images/proxy', async (req, res) => {
    try {
      const rawUrl = (req.query.url as string) || '';
      if (!rawUrl) {
        res.status(400).send('url is required');
        return;
      }
      let parsed: URL;
      try {
        parsed = new URL(rawUrl);
      } catch {
        res.status(400).send('invalid url');
        return;
      }
      if (parsed.protocol !== 'https:') {
        res.status(400).send('only https allowed');
        return;
      }
      const allowedHosts = new Set<string>([
        'source.unsplash.com',
        'images.unsplash.com',
        'upload.wikimedia.org',
      ]);
      if (!allowedHosts.has(parsed.hostname)) {
        res.status(403).send('host not allowed');
        return;
      }
      const upstream = await fetch(parsed.toString(), { redirect: 'follow' });
      if (!upstream.ok) {
        res.status(upstream.status).send('failed to fetch image');
        return;
      }
      const contentType = upstream.headers.get('content-type') || 'image/*';
      const buf = Buffer.from(await upstream.arrayBuffer());
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
      res.send(buf);
    } catch (err: any) {
      console.error('image proxy error', err);
      res.status(500).send('proxy error');
    }
  });

  app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (SENTRY_DSN) {
      try {
        Sentry.captureException(err, { tags: { request_id: (req as any).requestId } });
      } catch {}
    }
    console.error('Unhandled error:', err);
    res.status(err.statusCode || 500).json({
      message: err.message || 'Internal server error',
    });
  });

  return app;
};
