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

const AUTOMATIONS_QUEUE = 'automations';
const NOTIFICATIONS_QUEUE = 'notifications';

const notificationsQueue = new Queue(NOTIFICATIONS_QUEUE, { connection });

interface AutomationsJobData {
  pixelEventId: string;
}

function getNested(obj: any, path: string) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

const worker = new Worker<AutomationsJobData>(
  AUTOMATIONS_QUEUE,
  async (job: Job<AutomationsJobData>) => {
    const { pixelEventId } = job.data;
    if (!pixelEventId) return;

    const { rows: eventRows } = await pool.query('select * from pixel_events where id = $1', [pixelEventId]);
    const evt = eventRows[0];
    if (!evt) return;

    const eventName = evt.event as string;

    const { rows: automations } = await pool.query(
      'select * from automations where active = true'
    );

    for (const automation of automations) {
      const trigger = automation.trigger as any;
      if (!trigger || trigger.type !== 'event' || trigger.event_name !== eventName) continue;

      const filters = (automation.filters || {}) as Record<string, any>;
      let matches = true;
      for (const [key, expected] of Object.entries(filters)) {
        const actual = getNested(evt, key);
        if (actual !== expected) {
          matches = false;
          break;
        }
      }
      if (!matches) continue;

      const userId = evt.user_id as string | null;
      const eventId = evt.event_id as string;

      try {
        await pool.query(
          'insert into automation_executions (automation_id, user_id, event_id, status) values ($1,$2,$3,$4) on conflict do nothing',
          [automation.id, userId, eventId, 'queued']
        );
      } catch (err) {
        console.error('[ruleEngineWorker] execution insert error', err);
        continue;
      }

      const actions = automation.actions as any[];
      for (const action of actions) {
        await notificationsQueue.add(
          'notify',
          {
            automationId: automation.id,
            userId,
            eventId,
            action,
          },
          {
            attempts: 5,
            backoff: { type: 'exponential', delay: 1000 },
            delay: action.delay_ms || 0,
            removeOnComplete: true,
          }
        );
      }
    }
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log('[ruleEngineWorker] completed job', job.id);
});

worker.on('failed', (job, err) => {
  console.error('[ruleEngineWorker] failed job', job?.id, err);
});
