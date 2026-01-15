import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { EVENTS_RAW_QUEUE, SEGMENT_UPDATES_QUEUE } from '../modules/marketing/queues/queues';
import { PixelEventModel } from '../modules/marketing/models/pixelEvent.model';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

const worker = new Worker(
  EVENTS_RAW_QUEUE,
  async (job: Job) => {
    const { pixelEventId } = job.data as { pixelEventId: string };
    if (!pixelEventId) return;

    const evt = await PixelEventModel.findById(pixelEventId);
    if (!evt) return;

    // TODO: add real UA/geo enrichment here
    evt.enriched = true;
    await evt.save();

    const { segmentUpdatesQueue } = await import('../modules/marketing/queues/queues');

    await segmentUpdatesQueue.add(
      'segment_update',
      {
        pixelEventId,
        user_id: evt.user_id,
        visitor_id: evt.visitor_id,
        event: evt.event,
        ts: evt.ts,
      },
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
      }
    );
  },
  {
    connection,
  }
);

worker.on('completed', (job) => {
  console.log(`enrichmentWorker completed job ${job.id}`);
});

worker.on('failed', (job, err) => {
  console.error(`enrichmentWorker failed job ${job?.id}`, err);
});
