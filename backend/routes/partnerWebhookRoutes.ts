import { Router } from 'express';
import type { Pool } from 'pg';
import { partnerWebhookHandler } from '../controllers/partnerWebhookController.ts';

export function createPartnerWebhookRouter(pool: Pool) {
  const router = Router();

  router.post('/:partnerKey', partnerWebhookHandler(pool));

  return router;
}
