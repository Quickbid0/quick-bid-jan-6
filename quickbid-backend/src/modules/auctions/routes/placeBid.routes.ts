import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { placeBidHandler } from '../services/placeBid.service';
import { rateLimitBids } from '../../../middleware/rateLimiter';
import { computeBiddingStats } from '../services/liveStats.service';

export const auctionsRouter = express.Router();

auctionsRouter.post(
  '/auctions/:auctionId/place-bid',
  rateLimitBids,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idempotencyKey = req.header('Idempotency-Key') || undefined;
      const result = await placeBidHandler({
        req,
        auctionId: req.params.auctionId,
        idempotencyKey,
      });
      res.status(result.statusCode).json(result.body);
    } catch (err) {
      next(err);
    }
  }
);

auctionsRouter.get(
  '/auctions/:auctionId/live-stats',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { auctionId } = req.params;
      if (!auctionId) {
        return res.status(400).json({ error: 'auctionId is required' });
      }

      const stats = await computeBiddingStats(auctionId);
      res.json({ auctionId, bidding_stats: stats });
    } catch (err) {
      next(err);
    }
  }
);
