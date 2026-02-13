import crypto from 'crypto';
import type { Request, Response } from 'express';
import type { Pool } from 'pg';
import * as Razorpay from 'razorpay';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const EVENTS_RAW_QUEUE = 'events-raw';

const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const eventsRawQueue = new Queue(EVENTS_RAW_QUEUE, { connection: redisConnection });

const getRazorpayClient = () => {
  const key_id = process.env.RAZORPAY_KEY_ID as string | undefined;
  const key_secret = process.env.RAZORPAY_KEY_SECRET as string | undefined;
  if (!key_id || !key_secret) {
    throw new Error('RAZORPAY_KEYS_NOT_CONFIGURED');
  }
  return new Razorpay({ key_id, key_secret });
};

const emitDepositAddedEvent = async (pool: Pool, deposit: any) => {
  const client = await pool.connect();
  try {
    await eventsRawQueue.add('server_event', { pixelEventId: `deposit:${deposit.id}` }, { attempts: 5, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: true });
  } finally {
    client.release();
  }
};

// POST /deposits/initiate
export const initiateDepositHandler = (pool: Pool) =>
  async (req: Request, res: Response) => {
    const user: any = (req as any).user;
    const userId: string | undefined = user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'UNAUTHENTICATED' });
    }

    const { amountCents, auctionId } = req.body as {
      amountCents?: number;
      auctionId?: string;
    };

    if (!amountCents || typeof amountCents !== 'number' || amountCents <= 0) {
      return res.status(400).json({ error: 'INVALID_AMOUNT' });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const paymentRef = `dep_${Date.now()}_${Math.random().toString(36).slice(2)}`;

      const insertRes = await client.query(
        `insert into public.deposits (
           user_id,
           product_id,
           type,
           amount,
           status,
           payment_ref,
           created_at
         ) values ($1, $2, $3, $4, 'pending', $5, now())
         returning id`,
        [userId, null, 'security', amountCents, paymentRef],
      );

      const depositId = insertRes.rows[0].id as string;

      await client.query('COMMIT');

      const rzp = getRazorpayClient();
      const amount = amountCents;
      const order = await rzp.orders.create({
        amount,
        currency: 'INR',
        receipt: depositId,
        notes: { deposit_id: depositId, auction_id: auctionId || '', user_id: userId },
      });

      return res.status(200).json({ depositId, order, key_id: process.env.RAZORPAY_KEY_ID });
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // ignore rollback errors
      }
      console.error('initiateDeposit error', err);
      return res.status(500).json({
        error: 'DEPOSIT_INIT_FAILED',
        // TEMP: expose error details so we can debug the exact Postgres failure
        details: (err as Error)?.message || String(err),
      });
    } finally {
      client.release();
    }
  };

// GET /deposits/:id/status
export const getDepositStatusHandler = (pool: Pool) =>
  async (req: Request, res: Response) => {
    const user: any = (req as any).user;
    const userId: string | undefined = user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'UNAUTHENTICATED' });
    }

    const { id } = req.params;

    try {
      const result = await pool.query(
        `select id, status, amount
           from public.deposits
          where id = $1
            and user_id = $2`,
        [id, userId],
      );

      if (!result.rows.length) {
        return res.status(404).json({ error: 'DEPOSIT_NOT_FOUND' });
      }

      const row = result.rows[0];

      return res.json({
        id: row.id,
        status: row.status,
        amountCents: row.amount,
      });
    } catch (err) {
      console.error('getDepositStatus error', err);
      return res.status(500).json({ error: 'DEPOSIT_STATUS_FAILED' });
    }
  };

// POST /deposits/:id/verify
export const razorpayWebhookHandler = (pool: Pool) =>
  async (req: Request, res: Response) => {
    const signature = req.headers['x-razorpay-signature'] as string | undefined;
    const body = (req as any).rawBody?.toString() || '';
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!signature || !secret) {
      return res.status(400).json({ error: 'WEBHOOK_SIGNATURE_REQUIRED' });
    }
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
    if (expected !== signature) {
      return res.status(400).json({ error: 'INVALID_SIGNATURE' });
    }

    const payload = JSON.parse(body);
    const payment = payload?.payload?.payment?.entity;
    if (!payment) {
      return res.status(200).json({ ok: true });
    }

    const depositId = payment?.notes?.deposit_id as string | undefined;
    if (!depositId) {
      return res.status(400).json({ error: 'MISSING_DEPOSIT_ID' });
    }

    const status = payment.status === 'captured' ? 'paid' : 'failed';

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`update public.deposits set status = $1 where id = $2`, [status, depositId]);
      await client.query('COMMIT');
      if (status === 'paid') {
        await eventsRawQueue.add('server_event', { pixelEventId: `deposit:${depositId}` }, { attempts: 5, backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: true });
      }
    } catch (err) {
      await client.query('ROLLBACK');
      return res.status(500).json({ error: 'WEBHOOK_PROCESSING_FAILED' });
    } finally {
      client.release();
    }

    return res.json({ status });
  };

export const verifyDepositHandler = (pool: Pool) =>
  async (req: Request, res: Response) => {
    const user: any = (req as any).user;
    const roles: string[] = Array.isArray(user?.roles) ? user.roles : [];

    if (!user || (!roles.includes('admin') && !roles.includes('superadmin'))) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    const { id } = req.params;
    const { status } = req.body as {
      status: 'paid' | 'failed' | 'refunded';
    };

    if (!['paid', 'failed', 'refunded'].includes(status)) {
      return res.status(400).json({ error: 'INVALID_STATUS' });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const depRes = await client.query(
        `select * from public.deposits where id = $1 for update`,
        [id],
      );
      if (!depRes.rows.length) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'DEPOSIT_NOT_FOUND' });
      }
      const deposit = depRes.rows[0];

      if (deposit.status !== 'pending') {
        await client.query('ROLLBACK');
        return res.json({ status: deposit.status });
      }

      let isFirstVerified = false;

      if (status === 'paid') {
        const countRes = await client.query(
          `select count(*)::int as cnt
             from public.deposits
            where user_id = $1
              and status = 'paid'`,
          [deposit.user_id],
        );
        const cnt = (countRes.rows[0]?.cnt as number) || 0;
        isFirstVerified = cnt === 0;
      }

      await client.query(
        `update public.deposits set status = $1 where id = $2`,
        [status, id],
      );

      await client.query('COMMIT');
      try {
        if (status === 'paid' && isFirstVerified) {
          const eventName = 'deposit_added';
          const eventId = `deposit:${deposit.id}`;

          const insertSql = `
            insert into pixel_events (pixel_id, event, event_id, user_id, metadata, utm, ts, enriched)
            values ($1,$2,$3,$4,$5,$6,$7,false)
            on conflict (event_id) do nothing
            returning id
          `;

          const metadata = {
            amount_cents: deposit.amount_cents,
            deposit_id: deposit.id,
            first_time: true,
          } as any;

          const { rows } = await pool.query(insertSql, [
            'server',
            eventName,
            eventId,
            deposit.user_id,
            metadata,
            {},
            new Date(),
          ]);

          const row = rows[0];
          if (row) {
            await eventsRawQueue.add(
              'server_event',
              { pixelEventId: row.id },
              {
                attempts: 5,
                backoff: { type: 'exponential', delay: 1000 },
                removeOnComplete: true,
              },
            );
          }
        }
      } catch (emitErr) {
        console.error('verifyDeposit emit marketing event error', emitErr);
      }

      return res.json({ status });
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // ignore rollback errors
      }
      console.error('verifyDeposit error', err);
      return res.status(500).json({ error: 'DEPOSIT_VERIFY_FAILED' });
    } finally {
      client.release();
    }
  };
