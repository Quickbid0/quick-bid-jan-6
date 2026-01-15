import { Router } from 'express';
import type { Pool } from 'pg';
import { listSupportTicketsHandler, patchSupportTicketHandler } from '../controllers/supportController.ts';

export function createSupportRouter(pool: Pool, authMiddleware: any) {
  const router = Router();

  router.get('/tickets', authMiddleware, listSupportTicketsHandler(pool));
  router.patch('/tickets/:id', authMiddleware, patchSupportTicketHandler(pool));

  return router;
}
