import type { Request, Response } from 'express';

// TEMP stub: verify wiring of Exotel WhatsApp webhook
export function exotelWhatsappWebhookHandler(_req: Request, res: Response) {
  return res.status(200).send('EXOTEL WHATSAPP WEBHOOK OK');
}
