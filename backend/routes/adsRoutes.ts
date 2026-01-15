import { Router } from 'express';
import type { Pool } from 'pg';
import type { Server as SocketIOServer } from 'socket.io';
import {
  listAdsHandler,
  listAuctionsHandler,
  getAuctionAdSlotsHandler,
  patchAdScheduleHandler,
  makePushAdHandler,
} from '../controllers/adsController.ts';

// Factory to create ads router with access to pg Pool and Socket.io
export function createAdsRouter(io: SocketIOServer, pool: Pool, authMiddleware: any) {
  const router = Router();

  // list ads
  router.get('/ads', authMiddleware, listAdsHandler(pool));

  // list auctions (e.g. ?status=live)
  router.get('/auctions', authMiddleware, listAuctionsHandler(pool));

  // ad slots for a given auction
  router.get('/auctions/:id/ad-slots', authMiddleware, getAuctionAdSlotsHandler(pool));

  // schedule ad for a slot
  router.patch('/ads/:id/schedule', authMiddleware, patchAdScheduleHandler(pool));

  // push ad now into live auction stream
  router.post('/ads/:id/push', authMiddleware, makePushAdHandler(io, pool));

  return router;
}
