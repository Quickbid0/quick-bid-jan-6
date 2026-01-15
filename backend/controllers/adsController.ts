import type { Request, Response } from 'express';
import type { Pool } from 'pg';
import type { Server as SocketIOServer } from 'socket.io';

// GET /ads?active=true
export const listAdsHandler = (pool: Pool) =>
  async (req: Request, res: Response) => {
    const active = req.query.active === 'true';

    const { rows } = await pool.query(
      `select id, title, media_url, duration_sec, sponsor_id, active
         from public.ads
        ${active ? 'where active = true' : ''}
        order by created_at desc`,
    );

    res.json(rows);
  };

// GET /auctions?status=live
export const listAuctionsHandler = (pool: Pool) =>
  async (req: Request, res: Response) => {
    const status = (req.query.status as string) || 'live';

    const { rows } = await pool.query(
      `select id, lot_no, status
         from public.auctions
        where status = $1
        order by start_time desc nulls last`,
      [status],
    );

    res.json(rows);
  };

// GET /auctions/:id/ad-slots
export const getAuctionAdSlotsHandler = (pool: Pool) =>
  async (req: Request, res: Response) => {
    const { id: auctionId } = req.params;

    const { rows } = await pool.query(
      `select
         aas.slot_id,
         aas.start_sec,
         aas.duration_sec,
         aas.ad_id,
         a.title as ad_title
       from public.auction_ad_slots aas
       left join public.ads a on a.id = aas.ad_id
       where aas.auction_id = $1
       order by aas.start_sec asc`,
      [auctionId],
    );

    const formatted = rows.map((row: any, idx: number) => ({
      slotIndex: idx,
      label: row.slot_id || `Slot ${idx + 1}`,
      startSec: Number(row.start_sec) || 0,
      adId: row.ad_id,
      adTitle: row.ad_title,
    }));

    res.json(formatted);
  };

// PATCH /ads/:id/schedule
export const patchAdScheduleHandler = (pool: Pool) =>
  async (req: Request, res: Response) => {
    const user: any = (req as any).user;
    if (!user || !Array.isArray(user.roles) || !user.roles.includes('superadmin')) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    const { id: adId } = req.params;
    const { auctionId, slotIndex, startSec } = req.body as {
      auctionId: string;
      slotIndex: number;
      startSec: number;
    };

    if (!auctionId) {
      return res.status(400).json({ error: 'MISSING_AUCTION_ID' });
    }

    const slotId = `slot_${slotIndex}`;

    await pool.query(
      `insert into public.auction_ad_slots (auction_id, slot_id, start_sec, duration_sec, ad_id)
         values ($1, $2, $3, 15, $4)
       on conflict (auction_id, slot_id)
         do update set ad_id = excluded.ad_id,
                       start_sec = excluded.start_sec`,
      [auctionId, slotId, startSec, adId],
    );

    res.status(204).end();
  };

// POST /ads/:id/push
export const makePushAdHandler = (io: SocketIOServer, pool: Pool) =>
  async (req: Request, res: Response) => {
    const user: any = (req as any).user;
    if (!user || !Array.isArray(user.roles) || !user.roles.includes('superadmin')) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    const { id: adId } = req.params;
    const { auctionId } = req.body as { auctionId: string };

    if (!auctionId) {
      return res.status(400).json({ error: 'MISSING_AUCTION_ID' });
    }

    const { rows } = await pool.query(
      `select id, title, media_url, duration_sec
         from public.ads
        where id = $1`,
      [adId],
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'AD_NOT_FOUND' });
    }
    const ad = rows[0];

    io.to(`auction:${auctionId}`).emit('ad-play', {
      adId: ad.id,
      mediaUrl: ad.media_url,
      durationSec: ad.duration_sec,
      startSec: 0,
      title: ad.title,
    });

    await pool.query(
      `insert into public.admin_action_logs (
         admin_id, action_type, target_type, target_id, auction_id, details, created_at
       ) values ($1, 'AD_PUSH', 'ad', $2, $3, $4, now())`,
      [
        user.id,
        ad.id,
        auctionId,
        { via: 'SuperAdminAds', title: ad.title },
      ],
    );

    res.status(204).end();
  };
