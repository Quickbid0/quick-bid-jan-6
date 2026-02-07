// Load .env from this backend folder (ESM-safe)
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: `${__dirname}/.env` });

import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import { Pool } from 'pg';
import { registerAuctionSocket } from './sockets/auctionSocket.ts';
import { CountdownService } from './services/countdownService.ts';
import { createAdsRouter } from './routes/adsRoutes.ts';
import { createDepositRouter } from './routes/depositRoutes.ts';
import { createMarketingRouter } from './routes/marketingRoutes.ts';
import { createAiRouter } from './routes/aiRoutes.ts';
import { createExotelRouter } from './routes/exotelRoutes.ts';
import { createSupportRouter } from './routes/supportRoutes.ts';
import { createFinanceRouter } from './routes/financeRoutes.ts';
import { createPartnerWebhookRouter } from './routes/partnerWebhookRoutes.ts';
import { BidService } from './services/bidService.ts';
import { razorpayWebhookHandler } from './controllers/depositController.ts';
import { createWinsRouter } from './routes/winsRoutes.ts';
import { createDepartmentsRouter } from './routes/departmentsRoutes.ts';
import { createRiskRouter } from './routes/riskRoutes.ts';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import * as Sentry from '@sentry/node';
// Observability for live-backend is kept minimal to avoid runtime instability.

const PORT = Number(process.env.LIVE_BACKEND_PORT || process.env.PORT || 4000);
const DATABASE_URL = process.env.DATABASE_URL;
const NODE_ENV = process.env.NODE_ENV || 'development';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);

if (!DATABASE_URL) {
  console.warn('[live-backend] DATABASE_URL is not set. Postgres connections will fail.');
}
if (NODE_ENV === 'production') {
  const missing: string[] = [];
  if (!process.env.RAZORPAY_KEY_ID) missing.push('RAZORPAY_KEY_ID');
  if (!process.env.RAZORPAY_KEY_SECRET) missing.push('RAZORPAY_KEY_SECRET');
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) missing.push('RAZORPAY_WEBHOOK_SECRET');
  if (!process.env.SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (missing.length) {
    throw new Error(`[live-backend] Missing required env in production: ${missing.join(', ')}`);
  }
}

// Auth middleware with Supabase JWT verification
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

const authMiddleware = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const bearer = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    const token = typeof bearer === 'string' && bearer.startsWith('Bearer ') ? bearer.slice(7) : null;

    if (token && supabase) {
      const { data, error } = await supabase.auth.getUser(token);
      if (error) {
        // Fall through to dev fallback if configured
      } else if (data?.user) {
        const user = data.user;
        const role =
          (user.app_metadata && (user.app_metadata as any).role) ||
          (user.user_metadata && (user.user_metadata as any).role) ||
          'user';
        const roles = [role].filter(Boolean);
        req.user = { id: user.id, roles };
        return next();
      }
    }

    // Dev/test fallback
    const testUserId = process.env.LIVE_BACKEND_TEST_USER_ID;
    if (NODE_ENV !== 'production' && testUserId) {
      req.user = { id: testUserId, roles: ['admin', 'superadmin'] };
      return next();
    }

    return res.status(401).json({ error: 'UNAUTHENTICATED' });
  } catch (err) {
    return res.status(500).json({ error: 'AUTH_VERIFICATION_FAILED' });
  }
};

export async function startServer() {
  // Use Supabase instead of PostgreSQL if DATABASE_URL is not available
  if (!DATABASE_URL && supabase) {
    console.log('[live-backend] Using Supabase instead of PostgreSQL');
    // Skip PostgreSQL pool creation and use Supabase client
  } else if (!DATABASE_URL) {
    throw new Error('[live-backend] DATABASE_URL is required when Supabase is not available');
  }

  // Create PostgreSQL pool only if DATABASE_URL is available
  const pool = DATABASE_URL ? new Pool({ connectionString: DATABASE_URL }) : null;

  const app = express();
  app.set('trust proxy', true);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
        if (ALLOWED_ORIGINS.length && ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        return callback(new Error(`Not allowed by CORS: ${origin}`));
      },
      credentials: true,
    }),
  );
  app.use(express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  }));
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.2),
    });
  }
  app.use((req: any, res, next) => {
    const rid = (req.headers['x-request-id'] as string) || crypto.randomUUID();
    req.requestId = rid;
    res.setHeader('x-request-id', rid);
    if (process.env.SENTRY_DSN) {
      Sentry.setTag('request_id', rid);
    }
    next();
  });

  app.post('/webhooks/razorpay', razorpayWebhookHandler(pool));

  app.use(authMiddleware);

  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
        if (ALLOWED_ORIGINS.length && ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        return callback(new Error(`Not allowed by CORS (socket): ${origin}`));
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  registerAuctionSocket(io, pool);

  const bidService = new BidService(io, pool);
  const countdownService = new CountdownService(io, pool);

  // Initialize countdown timers for active auctions
  await countdownService.initializeActiveAuctions();

  // Re-register auction socket with countdown service
  registerAuctionSocket(io, pool, countdownService);

  async function autoEndLiveAuctions() {
    try {
      const res = await pool.query(
        `select id
           from public.auctions
          where auction_type = 'live'
            and status in ('active', 'live')
            and end_date <= now()
          limit 50`,
      );

      for (const row of res.rows) {
        const auctionId = String(row.id);
        try {
          await bidService.autoFinalizeWinner(auctionId);
        } catch (err) {
          console.error('[live-backend] autoFinalizeWinner failed', auctionId, err);
        }
      }
    } catch (err) {
      console.error('[live-backend] autoEndLiveAuctions query failed', err);
    }
  }

  setInterval(autoEndLiveAuctions, 15_000);

  app.use('/api/ads', createAdsRouter(io, pool, authMiddleware));
  app.use('/api/deposits', createDepositRouter(pool, authMiddleware));
  app.use('/api/marketing', createMarketingRouter(pool));
  app.use('/api/ai', createAiRouter(authMiddleware));
  app.use('/api/support', createSupportRouter(pool, authMiddleware));
  app.use('/api/v1/finance', createFinanceRouter(pool, authMiddleware));
  app.use('/api/v1/webhooks/partner', createPartnerWebhookRouter(pool));
  app.use('/webhooks/exotel', createExotelRouter(pool));
  app.use('/api/wins', createWinsRouter(pool, authMiddleware));
  app.use('/api/departments', createDepartmentsRouter(pool));
  app.use('/api/risk', createRiskRouter(pool, authMiddleware));

  await new Promise<void>((resolve) => {
    server.listen(PORT, () => {
      console.log(`[live-backend] listening on http://localhost:${PORT}`);
      resolve();
    });
  });

  return { app, server, io, pool };
}

// Auto-start when run directly with ts-node/esm
startServer().catch((err) => {
  console.error('[live-backend] Failed to start server', err);
  process.exit(1);
});
