"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
const dotenv_1 = require("dotenv");
const url_1 = require("url");
const path_1 = require("path");
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = (0, path_1.dirname)(__filename);
dotenv_1.default.config({ path: `${__dirname}/.env` });
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server: SocketIOServer } = require('socket.io');
const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const Sentry = require('@sentry/node');
const auctionSocket_ts_1 = require("./sockets/auctionSocket.ts");
const countdownService_ts_1 = require("./services/countdownService.ts");
const adsRoutes_ts_1 = require("./routes/adsRoutes.ts");
const depositRoutes_ts_1 = require("./routes/depositRoutes.ts");
const marketingRoutes_ts_1 = require("./routes/marketingRoutes.ts");
const aiRoutes_ts_1 = require("./routes/aiRoutes.ts");
const exotelRoutes_ts_1 = require("./routes/exotelRoutes.ts");
const supportRoutes_ts_1 = require("./routes/supportRoutes.ts");
const financeRoutes_ts_1 = require("./routes/financeRoutes.ts");
const partnerWebhookRoutes_ts_1 = require("./routes/partnerWebhookRoutes.ts");
const bidService_ts_1 = require("./services/bidService.ts");
const depositController_ts_1 = require("./controllers/depositController.ts");
const winsRoutes_ts_1 = require("./routes/winsRoutes.ts");
const departmentsRoutes_ts_1 = require("./routes/departmentsRoutes.ts");
const riskRoutes_ts_1 = require("./routes/riskRoutes.ts");
if (!DATABASE_URL) {
    console.warn('[live-backend] DATABASE_URL is not set. Postgres connections will fail.');
}
if (NODE_ENV === 'production') {
    const missing = [];
    if (!process.env.RAZORPAY_KEY_ID)
        missing.push('RAZORPAY_KEY_ID');
    if (!process.env.RAZORPAY_KEY_SECRET)
        missing.push('RAZORPAY_KEY_SECRET');
    if (!process.env.RAZORPAY_WEBHOOK_SECRET)
        missing.push('RAZORPAY_WEBHOOK_SECRET');
    if (!process.env.SUPABASE_URL)
        missing.push('SUPABASE_URL');
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
        missing.push('SUPABASE_SERVICE_ROLE_KEY');
    if (missing.length) {
        throw new Error(`[live-backend] Missing required env in production: ${missing.join(', ')}`);
    }
}
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        const bearer = Array.isArray(authHeader) ? authHeader[0] : authHeader;
        const token = typeof bearer === 'string' && bearer.startsWith('Bearer ') ? bearer.slice(7) : null;
        if (token && supabase) {
            const { data, error } = await supabase.auth.getUser(token);
            if (error) {
            }
            else if (data?.user) {
                const user = data.user;
                const role = (user.app_metadata && user.app_metadata.role) ||
                    (user.user_metadata && user.user_metadata.role) ||
                    'user';
                const roles = [role].filter(Boolean);
                req.user = { id: user.id, roles };
                return next();
            }
        }
        const testUserId = process.env.LIVE_BACKEND_TEST_USER_ID;
        if (NODE_ENV !== 'production' && testUserId) {
            req.user = { id: testUserId, roles: ['admin', 'superadmin'] };
            return next();
        }
        return res.status(401).json({ error: 'UNAUTHENTICATED' });
    }
    catch (err) {
        return res.status(500).json({ error: 'AUTH_VERIFICATION_FAILED' });
    }
};
async function startServer() {
    if (!DATABASE_URL && supabase) {
        console.log('[live-backend] Using Supabase instead of PostgreSQL');
    }
    else if (!DATABASE_URL) {
        throw new Error('[live-backend] DATABASE_URL is required when Supabase is not available');
    }
    const pool = DATABASE_URL ? new Pool({ connectionString: DATABASE_URL }) : null;
    const app = express();
    app.set('trust proxy', true);
    app.use(cors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin))
                return callback(null, true);
            if (ALLOWED_ORIGINS.length && ALLOWED_ORIGINS.includes(origin))
                return callback(null, true);
            return callback(new Error(`Not allowed by CORS: ${origin}`));
        },
        credentials: true,
    }));
    app.use(express.json({
        verify: (req, _res, buf) => {
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
    app.use((req, res, next) => {
        const rid = req.headers['x-request-id'] || crypto.randomUUID();
        req.requestId = rid;
        res.setHeader('x-request-id', rid);
        if (process.env.SENTRY_DSN) {
            Sentry.setTag('request_id', rid);
        }
        next();
    });
    app.post('/webhooks/razorpay', (0, depositController_ts_1.razorpayWebhookHandler)(pool));
    app.use(authMiddleware);
    const server = http.createServer(app);
    const io = new SocketIOServer(server, {
        cors: {
            origin: (origin, callback) => {
                if (!origin)
                    return callback(null, true);
                if (NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin))
                    return callback(null, true);
                if (ALLOWED_ORIGINS.length && ALLOWED_ORIGINS.includes(origin))
                    return callback(null, true);
                return callback(new Error(`Not allowed by CORS (socket): ${origin}`));
            },
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });
    (0, auctionSocket_ts_1.registerAuctionSocket)(io, pool);
    const bidService = new bidService_ts_1.BidService(io, pool);
    const countdownService = new countdownService_ts_1.CountdownService(io, pool);
    await countdownService.initializeActiveAuctions();
    (0, auctionSocket_ts_1.registerAuctionSocket)(io, pool, countdownService);
    async function autoEndLiveAuctions() {
        try {
            const res = await pool.query(`select id
           from public.auctions
          where auction_type = 'live'
            and status in ('active', 'live')
            and end_date <= now()
          limit 50`);
            for (const row of res.rows) {
                const auctionId = String(row.id);
                try {
                    await bidService.autoFinalizeWinner(auctionId);
                }
                catch (err) {
                    console.error('[live-backend] autoFinalizeWinner failed', auctionId, err);
                }
            }
        }
        catch (err) {
            console.error('[live-backend] autoEndLiveAuctions query failed', err);
        }
    }
    setInterval(autoEndLiveAuctions, 15_000);
    app.use('/api/ads', (0, adsRoutes_ts_1.createAdsRouter)(io, pool, authMiddleware));
    app.use('/api/deposits', (0, depositRoutes_ts_1.createDepositRouter)(pool, authMiddleware));
    app.use('/api/marketing', (0, marketingRoutes_ts_1.createMarketingRouter)(pool));
    app.use('/api/ai', (0, aiRoutes_ts_1.createAiRouter)(authMiddleware));
    app.use('/api/support', (0, supportRoutes_ts_1.createSupportRouter)(pool, authMiddleware));
    app.use('/api/v1/finance', (0, financeRoutes_ts_1.createFinanceRouter)(pool, authMiddleware));
    app.use('/api/v1/webhooks/partner', (0, partnerWebhookRoutes_ts_1.createPartnerWebhookRouter)(pool));
    app.use('/webhooks/exotel', (0, exotelRoutes_ts_1.createExotelRouter)(pool));
    app.use('/api/wins', (0, winsRoutes_ts_1.createWinsRouter)(pool, authMiddleware));
    app.use('/api/departments', (0, departmentsRoutes_ts_1.createDepartmentsRouter)(pool));
    app.use('/api/risk', (0, riskRoutes_ts_1.createRiskRouter)(pool, authMiddleware));
    await new Promise((resolve) => {
        server.listen(PORT, () => {
            console.log(`[live-backend] listening on http://localhost:${PORT}`);
            resolve();
        });
    });
    return { app, server, io, pool };
}
startServer().catch((err) => {
    console.error('[live-backend] Failed to start server', err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map