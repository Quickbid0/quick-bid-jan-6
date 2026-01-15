import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const EVENTS_RAW_QUEUE = 'events-raw';
const AUTOMATIONS_QUEUE = 'automations';

const automationsQueue = new Queue(AUTOMATIONS_QUEUE, { connection });

interface EventsRawJobData {
  pixelEventId: string;
}

const worker = new Worker<EventsRawJobData>(
  EVENTS_RAW_QUEUE,
  async (job: Job<EventsRawJobData>) => {
    const { pixelEventId } = job.data;
    if (!pixelEventId) return;

    await pool.query('update pixel_events set enriched = true where id = $1', [pixelEventId]);

    await automationsQueue.add(
      'event_ready',
      { pixelEventId },
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
      }
    );
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log('[eventsEnrichmentWorker] completed job', job.id);
});

worker.on('failed', (job, err) => {
  console.error('[eventsEnrichmentWorker] failed job', job?.id, err);
});
