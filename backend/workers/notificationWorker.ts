import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { Pool } from 'pg';
import sgMail from '@sendgrid/mail';
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

const NOTIFICATIONS_QUEUE = 'notifications';

const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.MARKETING_FROM_EMAIL;

if (apiKey) {
  sgMail.setApiKey(apiKey);
} else {
  console.warn('[notificationWorker] SENDGRID_API_KEY is not set; emails will be skipped');
}

interface NotificationJobData {
  automationId: string;
  userId?: string | null;
  eventId: string;
  action: any;
}

async function resolveRecipientEmail(userId: string | null, action: any): Promise<string | null> {
  if (action.params && action.params.to) return action.params.to as string;
  if (!userId) return null;

  const { rows } = await pool.query('select email from users where id = $1', [userId]);
  if (!rows[0] || !rows[0].email) return null;
  return rows[0].email as string;
}

const worker = new Worker<NotificationJobData>(
  NOTIFICATIONS_QUEUE,
  async (job: Job<NotificationJobData>) => {
    const { automationId, userId, eventId, action } = job.data;
    if (action.type !== 'email') return;

    if (!apiKey || !fromEmail) {
      console.warn('[notificationWorker] Missing SENDGRID_API_KEY or MARKETING_FROM_EMAIL; skipping email');
      return;
    }

    const to = await resolveRecipientEmail(userId || null, action);
    if (!to) {
      console.warn('[notificationWorker] Could not resolve recipient email');
      if (automationId && eventId) {
        await pool.query(
          'update automation_executions set status = $1, error = $2 where automation_id = $3 and event_id = $4 and (user_id = $5 or (user_id is null and $5 is null))',
          ['failed', 'Could not resolve recipient email', automationId, eventId, userId || null]
        );
      }
      return;
    }

    const subject = action.params.subject || 'QuickMela Notification';
    const html = action.params.html || '<p>Hello from QuickMela</p>';

    try {
      await sgMail.send({
        to,
        from: fromEmail,
        subject,
        html,
      });

      if (automationId && eventId) {
        await pool.query(
          'update automation_executions set status = $1, error = null where automation_id = $2 and event_id = $3 and (user_id = $4 or (user_id is null and $4 is null))',
          ['success', automationId, eventId, userId || null]
        );
      }
    } catch (err) {
      console.error('[notificationWorker] send error', err);
      if (automationId && eventId) {
        await pool.query(
          'update automation_executions set status = $1, error = $2 where automation_id = $3 and event_id = $4 and (user_id = $5 or (user_id is null and $5 is null))',
          ['failed', (err as Error).message || String(err), automationId, eventId, userId || null]
        );
      }
    }
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log('[notificationWorker] completed job', job.id);
});

worker.on('failed', (job, err) => {
  console.error('[notificationWorker] failed job', job?.id, err);
});
