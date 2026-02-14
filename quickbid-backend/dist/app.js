"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const Sentry = __importStar(require("@sentry/node"));
const crypto_1 = __importDefault(require("crypto"));
const community_routes_1 = require("./modules/community/routes/community.routes");
const admin_routes_1 = require("./modules/community/routes/admin.routes");
const rbac_routes_1 = require("./modules/rbac/routes/rbac.routes");
const referral_routes_1 = require("./modules/referral/routes/referral.routes");
const sponsor_routes_1 = require("./modules/ads/routes/sponsor.routes");
const slot_routes_1 = require("./modules/ads/routes/slot.routes");
const campaign_routes_1 = require("./modules/ads/routes/campaign.routes");
const analytics_routes_1 = require("./modules/ads/routes/analytics.routes");
const invoice_routes_1 = require("./modules/ads/routes/invoice.routes");
const agent_routes_1 = require("./modules/ads/routes/agent.routes");
const sponsorAuth_routes_1 = require("./modules/ads/routes/sponsorAuth.routes");
const overlay_routes_1 = require("./modules/ads/routes/overlay.routes");
const placeBid_routes_1 = require("./modules/auctions/routes/placeBid.routes");
const adminPayouts_routes_1 = require("./modules/auctions/routes/adminPayouts.routes");
const adminSettlement_routes_1 = require("./modules/auctions/routes/adminSettlement.routes");
const adminCommissions_routes_1 = require("./modules/auctions/routes/adminCommissions.routes");
const winPayments_routes_1 = require("./modules/auctions/routes/winPayments.routes");
const payouts_routes_1 = require("./modules/finance/routes/payouts.routes");
const sellers_routes_1 = require("./modules/sellers/routes/sellers.routes");
const departments_routes_1 = require("./modules/org/routes/departments.routes");
const branches_routes_1 = require("./modules/org/routes/branches.routes");
const staff_routes_1 = require("./modules/org/routes/staff.routes");
const risk_routes_1 = require("./modules/risk/routes/risk.routes");
const auctionPricing_routes_1 = require("./modules/ai/routes/auctionPricing.routes");
const salesDashboard_routes_1 = require("./modules/sales/routes/salesDashboard.routes");
const email_routes_1 = require("./modules/marketing/routes/email.routes");
const adminBulkVerification_routes_1 = require("./modules/products/routes/adminBulkVerification.routes");
const browse_routes_1 = require("./modules/auctions/routes/browse.routes");
dotenv_1.default.config();
const createApp = () => {
    const app = (0, express_1.default)();
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
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)());
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use((0, morgan_1.default)('dev'));
    app.use((req, res, next) => {
        const rid = req.headers['x-request-id'] || crypto_1.default.randomUUID();
        req.requestId = rid;
        res.setHeader('x-request-id', rid);
        next();
    });
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', service: 'quickbid-backend' });
    });
    app.use('/api/community', community_routes_1.communityRouter);
    app.use('/api/admin/community', admin_routes_1.adminCommunityRouter);
    app.use('/api/rbac', rbac_routes_1.rbacRouter);
    app.use('/api', referral_routes_1.referralRouter);
    app.use('/api', placeBid_routes_1.auctionsRouter);
    app.use('/api', winPayments_routes_1.winPaymentsRouter);
    app.use('/api', payouts_routes_1.payoutsRouter);
    app.use('/api', sellers_routes_1.sellersRouter);
    app.use('/api', risk_routes_1.riskRouter);
    app.use('/api', auctionPricing_routes_1.auctionPricingRouter);
    app.use('/api', salesDashboard_routes_1.salesRouter);
    app.use('/api', departments_routes_1.departmentsRouter);
    app.use('/api', branches_routes_1.branchesRouter);
    app.use('/api', staff_routes_1.staffRouter);
    app.use('/api', browse_routes_1.auctionsBrowseRouter);
    app.use('/api/admin', adminPayouts_routes_1.adminPayoutsRouter);
    app.use('/api/admin', adminSettlement_routes_1.adminSettlementRouter);
    app.use('/api/admin', adminCommissions_routes_1.adminCommissionsRouter);
    app.use('/api/admin/products', adminBulkVerification_routes_1.adminBulkVerificationRouter);
    app.use('/api/ads', sponsor_routes_1.sponsorRouter);
    app.use('/api/ads', slot_routes_1.adSlotRouter);
    app.use('/api/ads', campaign_routes_1.campaignRouter);
    app.use('/api/ads', analytics_routes_1.analyticsRouter);
    app.use('/api/ads', invoice_routes_1.invoiceRouter);
    app.use('/api/ads', agent_routes_1.agentRouter);
    app.use('/api/ads', sponsorAuth_routes_1.sponsorAuthRouter);
    app.use('/api/ads', overlay_routes_1.overlayRouter);
    app.use('/api/marketing', email_routes_1.emailRouter);
    app.get('/api/images/proxy', async (req, res) => {
        try {
            const rawUrl = req.query.url || '';
            if (!rawUrl) {
                res.status(400).send('url is required');
                return;
            }
            let parsed;
            try {
                parsed = new URL(rawUrl);
            }
            catch {
                res.status(400).send('invalid url');
                return;
            }
            if (parsed.protocol !== 'https:') {
                res.status(400).send('only https allowed');
                return;
            }
            const allowedHosts = new Set([
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
        }
        catch (err) {
            console.error('image proxy error', err);
            res.status(500).send('proxy error');
        }
    });
    app.use((err, req, res, _next) => {
        if (SENTRY_DSN) {
            try {
                Sentry.captureException(err, { tags: { request_id: req.requestId } });
            }
            catch { }
        }
        console.error('Unhandled error:', err);
        res.status(err.statusCode || 500).json({
            message: err.message || 'Internal server error',
        });
    });
    return app;
};
exports.createApp = createApp;
