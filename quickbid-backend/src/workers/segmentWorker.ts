import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { SEGMENT_UPDATES_QUEUE } from '../modules/marketing/queues/queues';
import { PixelEventModel } from '../modules/marketing/models/pixelEvent.model';
import { SegmentModel } from '../modules/marketing/models/segment.model';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

interface SegmentUpdateJobData {
  pixelEventId: string;
  user_id?: string | null;
  visitor_id?: string | null;
  event: string;
  ts: string | Date;
}

function isWithinDays(ts: Date, days: number) {
  const now = new Date();
  const diffMs = now.getTime() - ts.getTime();
  return diffMs <= days * 24 * 60 * 60 * 1000;
}

const worker = new Worker(
  SEGMENT_UPDATES_QUEUE,
  async (job: Job<SegmentUpdateJobData>) => {
    const { pixelEventId, user_id, visitor_id, event, ts } = job.data;
    const eventTime = ts instanceof Date ? ts : new Date(ts);

    const evt = await PixelEventModel.findById(pixelEventId).lean();
    if (!evt) return;

    const userKey = user_id || evt.user_id || null;
    const visitorKey = visitor_id || evt.visitor_id || null;

    const membershipIds: string[] = [];
    if (userKey) membershipIds.push(`user:${userKey}`);
    if (!userKey && visitorKey) membershipIds.push(`visitor:${visitorKey}`);
    if (!membershipIds.length) return;

    // Example built-in segments. Later we can drive this entirely from SegmentModel.criteria_json
    const segments: { name: string; match: () => boolean }[] = [
      {
        name: 'viewed_auction_last_7d',
        match: () => event === 'auction_view' && isWithinDays(eventTime, 7),
      },
      {
        name: 'first_deposit',
        match: () => event === 'deposit_added' && !!(evt.metadata && evt.metadata.first_time),
      },
    ];

    for (const seg of segments) {
      if (!seg.match()) continue;

      const existing = await SegmentModel.findOne({ name: seg.name });
      if (!existing) {
        await SegmentModel.create({
          name: seg.name,
          criteria_json: { system: true },
          last_evaluated_at: new Date(),
          size: membershipIds.length,
        });
      } else {
        existing.last_evaluated_at = new Date();
        existing.size += membershipIds.length;
        await existing.save();
      }

      // TODO: store per-segment membership in dedicated collection/Redis for fast lookup
    }
  },
  {
    connection,
  }
);

worker.on('completed', (job) => {
  console.log(`segmentWorker completed job ${job.id}`);
});

worker.on('failed', (job, err) => {
  console.error(`segmentWorker failed job ${job?.id}`, err);
});
