import { Router } from 'express';
import type { Pool } from 'pg';
import { exotelWhatsappWebhookHandler } from '../controllers/exotelController.ts';

// Router for Exotel webhooks: POST /webhooks/exotel/whatsapp
export function createExotelRouter(_pool: Pool) {
  const router = Router();

  router.post('/whatsapp', exotelWhatsappWebhookHandler);

  return router;
}
