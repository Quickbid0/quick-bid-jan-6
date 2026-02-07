import type { Server as SocketIOServer, Socket } from 'socket.io';
import type { Pool } from 'pg';
import { BidService } from '../services/bidService.ts';
import { CountdownService } from '../services/countdownService.ts';
import crypto from 'crypto';
import { checkLimit } from '../middleware/redisRateLimit.ts';
import { createClient } from '@supabase/supabase-js';

interface JoinAuctionPayload {
  auctionId: string;
  token?: string;
}

interface PlaceBidPayload {
  auctionId: string;
  amountCents: number;
  idempotencyKey?: string;
}

interface AdminApproveBidPayload {
  bidId: string;
  action: 'accept' | 'reject' | 'override';
  overrideAmountCents?: number;
}

export function registerAuctionSocket(io: SocketIOServer, pool: Pool, countdownService?: CountdownService) {
  const bidService = new BidService(io, pool);
  const SUPABASE_URL = process.env.SUPABASE_URL as string | undefined;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : null;

  io.use(async (socket, next) => {
    try {
      const authToken =
        (socket.handshake.auth && (socket.handshake.auth as any).token) ||
        (socket.handshake.headers?.authorization as string | undefined)?.replace(/^Bearer\s+/i, '');
      if (authToken && supabase) {
        const { data, error } = await supabase.auth.getUser(authToken);
        if (error) return next(new Error('UNAUTHENTICATED'));
        if (data?.user?.id) {
          (socket.data as any).userId = data.user.id;
          return next();
        }
      }
      const testUserId = process.env.LIVE_BACKEND_TEST_USER_ID;
      if (NODE_ENV !== 'production' && testUserId) {
        (socket.data as any).userId = testUserId;
        return next();
      }
      return next(new Error('UNAUTHENTICATED'));
    } catch {
      return next(new Error('UNAUTHENTICATED'));
    }
  });

  io.on('connection', (socket: Socket) => {
    socket.on('join-auction', async (payload: JoinAuctionPayload) => {
      const room = `auction:${payload.auctionId}`;
      socket.join(room);

      // TODO: load initial auction state & emit 'auction-state'
      try {
        const auctionRes = await pool.query(
          `select * from public.auctions where id = $1`,
          [payload.auctionId]
        );
        
        if (auctionRes.rows.length > 0) {
          const auction = auctionRes.rows[0];
          
          // Get highest bid
          const highestBidRes = await pool.query(
            `select * from public.bids 
             where auction_id = $1 and status = 'accepted' 
             order by amount_cents desc, sequence desc 
             limit 1`,
            [payload.auctionId]
          );
          
          // Get recent bids history
          const recentBidsRes = await pool.query(
            `select b.*, u.name as user_name 
             from public.bids b
             left join public.user_profiles u on b.user_id = u.id
             where b.auction_id = $1 and b.status = 'accepted'
             order by b.amount_cents desc, b.sequence desc
             limit 10`,
            [payload.auctionId]
          );

          socket.emit('auction-state', {
            auction: {
              id: auction.id,
              status: auction.status,
              current_price: auction.current_price,
              end_date: auction.end_date,
              min_increment: auction.min_increment_cents,
            },
            highestBid: highestBidRes.rows[0] || null,
            recentBids: recentBidsRes.rows || [],
          });
        }
      } catch (err) {
        console.error('Error loading auction state:', err);
      }
    });

    socket.on('place-bid', async (payload: PlaceBidPayload) => {
      try {
        const userId = (socket.data as any)?.userId;
        if (!userId) {
          socket.emit('error', { code: 'UNAUTHENTICATED', requestId: crypto.randomUUID() });
          return;
        }
        const reqId = crypto.randomUUID();
        const rl = await checkLimit(`socket-bid:${userId}`, 10, 10_000);
        if (!rl.allowed) {
          socket.emit('error', { code: 'RATE_LIMITED', retryAfterSeconds: rl.ttlSeconds, requestId: reqId });
          return;
        }

        const result = await bidService.placeBid({
          auctionId: payload.auctionId,
          userId,
          amountCents: payload.amountCents,
          idempotencyKey: payload.idempotencyKey,
        });

        if (!result.accepted && result.pendingForAdmin) {
          socket.emit('bid-pending', { bidId: result.bid._id.toString(), requestId: reqId });
        }
      } catch (err: any) {
        if (err.message === 'DEPOSIT_REQUIRED' || err.message === 'INSUFFICIENT_WALLET_FOR_DEPOSIT') {
          socket.emit('deposit-required', { minDepositCents: null, requestId: crypto.randomUUID() });
          return;
        }

        socket.emit('error', { code: err.message || 'BID_FAILED', requestId: crypto.randomUUID() });
      }
    });

    socket.on('admin-approve-bid', async (payload: AdminApproveBidPayload) => {
      try {
        const adminId = (socket.data as any)?.userId;
        const roles = (socket.data as any)?.roles || [];
        if (!adminId || !roles.includes('admin')) {
          socket.emit('error', { code: 'FORBIDDEN' });
          return;
        }

        await bidService.handleAdminBidAction({
          bidId: payload.bidId,
          adminId,
          action: payload.action,
          overrideAmountCents: payload.overrideAmountCents,
        });
      } catch (err: any) {
        socket.emit('error', { code: err.message || 'ADMIN_ACTION_FAILED' });
      }
    });

    socket.on('finalize-winner', async (auctionId: string) => {
      try {
        const adminId = (socket.data as any)?.userId;
        const roles = (socket.data as any)?.roles || [];
        if (!adminId || !roles.includes('admin')) {
          socket.emit('error', { code: 'FORBIDDEN' });
          return;
        }

        await bidService.finalizeWinner({ auctionId, adminId });
      } catch (err: any) {
        socket.emit('error', { code: err.message || 'FINALIZE_FAILED' });
      }
    });
  });
}
