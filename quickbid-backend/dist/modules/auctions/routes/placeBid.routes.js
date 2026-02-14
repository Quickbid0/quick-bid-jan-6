"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auctionsRouter = void 0;
const express_1 = __importDefault(require("express"));
const placeBid_service_1 = require("../services/placeBid.service");
const rateLimiter_1 = require("../../../middleware/rateLimiter");
const liveStats_service_1 = require("../services/liveStats.service");
exports.auctionsRouter = express_1.default.Router();
exports.auctionsRouter.post('/auctions/:auctionId/place-bid', rateLimiter_1.rateLimitBids, async (req, res, next) => {
    try {
        const idempotencyKey = req.header('Idempotency-Key') || undefined;
        const result = await (0, placeBid_service_1.placeBidHandler)({
            req,
            auctionId: req.params.auctionId,
            idempotencyKey,
        });
        res.status(result.statusCode).json(result.body);
    }
    catch (err) {
        next(err);
    }
});
exports.auctionsRouter.get('/auctions/:auctionId/live-stats', async (req, res, next) => {
    try {
        const { auctionId } = req.params;
        if (!auctionId) {
            return res.status(400).json({ error: 'auctionId is required' });
        }
        const stats = await (0, liveStats_service_1.computeBiddingStats)(auctionId);
        res.json({ auctionId, bidding_stats: stats });
    }
    catch (err) {
        next(err);
    }
});
