import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { PixelEventModel } from '../models/pixelEvent.model';
import { eventsRawQueue } from '../queues/queues';

export const eventsRouter = Router();

function computeServerEventId(body: any) {
  if (body.event_id) return body.event_id;
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify({ event: body.event, metadata: body.metadata || {}, ts: body.ts }))
    .digest('hex');
  return hash;
}

eventsRouter.post('/api/v1/events', async (req: Request, res: Response) => {
  try {
    const { pixel_id, event, metadata, visitor_id, user_id, utm, event_id, ts } = req.body || {};

    if (!event || !ts) {
      return res.status(400).json({ message: 'event and ts are required' });
    }

    const finalEventId = computeServerEventId({ event, event_id, metadata, ts });

    const existing = await PixelEventModel.findOne({ event_id: finalEventId }).lean();
    if (existing) {
      return res.status(200).json({ status: 'duplicate', id: existing._id });
    }

    const doc = await PixelEventModel.create({
      pixel_id: pixel_id || 'server',
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
      'server_event',
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
    console.error('server events ingest error', err);
    res.status(500).json({ message: 'Failed to ingest server event', error: err.message });
  }
});
