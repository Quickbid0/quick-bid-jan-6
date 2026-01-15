import { Router } from 'express';
import type { Pool } from 'pg';
import { rateLimit } from '../middleware/redisRateLimit.ts';

export function createWinsRouter(pool: Pool, authMiddleware: any) {
  const router = Router();

  // Record buyer payment submission for a finalized auction win
  const winsLimiter = rateLimit(
    (req) => {
      const user: any = (req as any).user;
      return `wins:${user?.id || req.ip}`;
    },
    10,
    60_000,
  );
  router.post('/:auctionId/payments', authMiddleware, winsLimiter, async (req, res) => {
    try {
      const user: any = (req as any).user;
      if (!user?.id) {
        return res.status(401).json({ error: 'UNAUTHENTICATED' });
      }
      const { auctionId } = req.params;
      const { method, amount, reference_number, screenshot_url, notes } = req.body || {};

      if (!method || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'INVALID_INPUT' });
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Verify winner
        const winRes = await client.query(
          `select a.id, b.user_id as winner_id, b.amount_cents
             from public.auctions a
             left join LATERAL (
               select *
                 from public.bids
                where auction_id = a.id
                  and status = 'accepted'
                order by amount_cents desc, sequence desc
                limit 1
             ) b on true
            where a.id = $1
              and a.status = 'ended'`,
          [auctionId],
        );
        const winRow = winRes.rows[0];
        if (!winRow || String(winRow.winner_id) !== String(user.id)) {
          await client.query('ROLLBACK');
          return res.status(403).json({ error: 'FORBIDDEN_NOT_WINNER' });
        }

        // Insert payment record (pending verification)
        const insertRes = await client.query(
          `insert into public.win_payments (
             auction_id,
             user_id,
             method,
             amount_cents,
             reference_number,
             screenshot_url,
             notes,
             status,
             created_at
           ) values ($1,$2,$3,$4,$5,$6,$7,'pending_verification',now())
           returning id`,
          [
            auctionId,
            user.id,
            method,
            Math.round(amount * 100),
            reference_number || null,
            screenshot_url || null,
            notes || null,
          ],
        );

        const paymentId = insertRes.rows[0]?.id;

        await client.query('COMMIT');
        client.release();

        return res.status(201).json({ id: paymentId, status: 'pending_verification' });
      } catch (err) {
        try {
          await client.query('ROLLBACK');
        } catch {}
        client.release();
        return res.status(500).json({ error: 'WIN_PAYMENT_CREATE_FAILED' });
      }
    } catch (err) {
      return res.status(500).json({ error: 'UNEXPECTED_ERROR' });
    }
  });

  router.patch('/:auctionId/payments/:id', authMiddleware, async (req, res) => {
    try {
      const user: any = (req as any).user;
      const roles: string[] = (user?.roles as string[]) || [];
      if (!user?.id) {
        return res.status(401).json({ error: 'UNAUTHENTICATED' });
      }
      if (!roles.includes('admin') && !roles.includes('superadmin')) {
        return res.status(403).json({ error: 'FORBIDDEN' });
      }
      const { auctionId, id } = req.params;
      const { status, notes } = req.body || {};
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ error: 'INVALID_STATUS' });
      }
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const existingRes = await client.query(
          `select id, auction_id, status
             from public.win_payments
            where id = $1
              and auction_id = $2
            for update`,
          [id, auctionId],
        );
        const existing = existingRes.rows[0];
        if (!existing) {
          await client.query('ROLLBACK');
          client.release();
          return res.status(404).json({ error: 'NOT_FOUND' });
        }
        const now = new Date().toISOString();
        await client.query(
          `update public.win_payments
              set status = $1,
                  verified_by = $2,
                  verified_at = $3,
                  notes = $4
            where id = $5`,
          [status, user.id, now, notes ?? null, id],
        );
        await client.query(
          `insert into public.win_payment_audit_logs
             (win_payment_id, changed_by, old_status, new_status, note, created_at)
           values ($1,$2,$3,$4,$5,now())`,
          [id, user.id, existing.status || null, status, notes ?? null],
        );
        let auctionStatusUpdate: string | null = null;
        const lower = String(status).toLowerCase();
        if (lower === 'approved') {
          auctionStatusUpdate = 'paid';
        } else if (lower === 'rejected') {
          auctionStatusUpdate = 'payment_pending';
        } else if (lower === 'pending_documents' || lower === 'partial_payment' || lower === 'refund_in_progress') {
          auctionStatusUpdate = 'payment_under_review';
        }
        if (auctionStatusUpdate) {
          await client.query(`update public.auctions set status = $1 where id = $2`, [auctionStatusUpdate, auctionId]);
        }
        await client.query('COMMIT');
        client.release();
        return res.status(200).json({ id, status });
      } catch (err) {
        try {
          await client.query('ROLLBACK');
        } catch {}
        client.release();
        return res.status(500).json({ error: 'WIN_PAYMENT_UPDATE_FAILED' });
      }
    } catch (err) {
      return res.status(500).json({ error: 'UNEXPECTED_ERROR' });
    }
  });

  return router;
}
