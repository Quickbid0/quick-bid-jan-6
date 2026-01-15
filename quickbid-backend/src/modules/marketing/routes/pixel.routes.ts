import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { PixelEventModel } from '../models/pixelEvent.model';
import { eventsRawQueue } from '../queues/queues';

export const pixelRouter = Router();

function computeEventId(body: any) {
  if (body.event_id) return body.event_id;
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify({ metadata: body.metadata || {}, ts: body.ts }))
    .digest('hex');
  return hash;
}

pixelRouter.post('/api/v1/pixel', async (req: Request, res: Response) => {
  try {
    const { pixel_id, event, metadata, visitor_id, user_id, utm, event_id, ts } = req.body || {};

    if (!pixel_id || !event || !ts) {
      return res.status(400).json({ message: 'pixel_id, event and ts are required' });
    }

    const finalEventId = computeEventId({ event_id, metadata, ts });

    const existing = await PixelEventModel.findOne({ event_id: finalEventId }).lean();
    if (existing) {
      return res.status(200).json({ status: 'duplicate', id: existing._id });
    }

    const doc = await PixelEventModel.create({
      pixel_id,
      event,
      metadata,
      visitor_id,
      user_id,
      utm,
      event_id: finalEventId,
      ts: new Date(ts),
      processed: false,
      enriched: false,
    });

    await eventsRawQueue.add(
      'pixel_event',
      {
        pixelEventId: doc._id.toString(),
      },
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: false,
      }
    );

    res.status(202).json({ status: 'enqueued', id: doc._id });
  } catch (err: any) {
    console.error('pixel ingest error', err);
    res.status(500).json({ message: 'Failed to ingest pixel event', error: err.message });
  }
});
