import type { Server as SocketIOServer } from 'socket.io';
import type { Pool, PoolClient } from 'pg';

export type BidType = 'manual' | 'auto' | 'admin_override';
export type BidStatus = 'pending' | 'accepted' | 'rejected';

export interface PlaceBidInput {
  auctionId: string;
  userId: string;
  amountCents: number;
  idempotencyKey?: string; // for network retries
  isHighSpeed?: boolean;
  autoBidId?: string;
}

export interface PlaceBidResult {
  bid: any;
  accepted: boolean;
  pendingForAdmin: boolean;
}

export type AdminBidAction = 'accept' | 'reject' | 'override';

export interface AdminBidActionInput {
  bidId: string;
  adminId: string;
  action: AdminBidAction;
  overrideAmountCents?: number;
}

export interface FinalizeWinnerInput {
  auctionId: string;
  adminId: string;
}

export interface WalletAuditLogParams {
  userId: string;
  walletId?: string;
  auctionId?: string | null;
  bidId?: string | null;
  orderId?: string | null;

  eventType: string;
  status: string;

  amountDeltaCents: number;
  walletBeforeCents: number;
  walletAfterCents: number;
  escrowBeforeCents?: number | null;
  escrowAfterCents?: number | null;

  sourceType?: string | null;
  sourceReference?: string | null;

  reasonCode?: string | null;
  reasonText?: string | null;
  policyCodes?: string[] | null;
}

interface ReserveAutoDropLogParams {
  environment?: 'prod' | 'staging' | 'dev';

  actorType: 'seller' | 'admin' | 'system' | 'ai';
  actorId: string | null;
  channel: 'web' | 'app' | 'admin_console' | 'scheduler' | 'ai_engine';

  auctionId: string;
  listingId?: string | null;
  sellerId: string;

  eventType:
    | 'AUTO_DROP_CONFIG_CREATED'
    | 'AUTO_DROP_CONFIG_UPDATED'
    | 'AUTO_DROP_EVALUATED'
    | 'AUTO_DROP_TRIGGERED'
    | 'RESERVE_PRICE_CHANGED'
    | 'RESERVE_CHANGE_OVERRIDDEN';

  status: 'pending' | 'applied' | 'rejected' | 'rolled_back';

  oldReserveCents: number | null;
  newReserveCents: number | null;
  changeDeltaCents: number | null;

  triggerReasonCode:
    | 'manual_config'
    | 'time_decay'
    | 'low_engagement'
    | 'bid_gap'
    | 'ai_recommendation'
    | 'manual_override'
    | null;

  triggerDetails?: Record<string, unknown>;

  approvalType:
    | 'auto_no_approval'
    | 'seller_approved'
    | 'admin_approved'
    | 'rejected';

  policyCodes?: string[] | null;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
}

export class BidService {
  private io: SocketIOServer;
  private pool: Pool;

  constructor(io: SocketIOServer, pool: Pool) {
    this.io = io;
    this.pool = pool;
  }

  private getAuctionRoom(auctionId: string): string {
    return `auction:${auctionId}`;
  }

  /**
   * Core placeBid flow using Postgres transaction against Supabase tables.
   */
  async placeBid(input: PlaceBidInput): Promise<PlaceBidResult> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Idempotency: if idempotencyKey is provided, reuse existing bid
      if (input.idempotencyKey) {
        const existing = await client.query(
          `select b.*,
                  up.name as user_name
           from public.bids b
           join public.user_profiles up on up.id = b.user_id
           where b.auction_id = $1
             and b.user_id = $2
             and (b.meta ->> 'idempotencyKey') = $3
           limit 1`,
          [input.auctionId, input.userId, input.idempotencyKey]
        );

        if (existing.rows.length > 0) {
          const bidRow = existing.rows[0];
          const accepted = bidRow.status === 'accepted';
          const pendingForAdmin = bidRow.status === 'pending';
          await client.query('COMMIT');
          return { bid: bidRow, accepted, pendingForAdmin };
        }
      }

      // Load auction and ensure live
      const auctionRes = await client.query(
        `select * from public.auctions where id = $1 for update`,
        [input.auctionId]
      );
      if (auctionRes.rows.length === 0) {
        throw new Error('AUCTION_NOT_FOUND');
      }
      const auction = auctionRes.rows[0];
      if (auction.status !== 'live') {
        throw new Error('AUCTION_NOT_LIVE');
      }

      // Load user with wallet & KYC
      const userRes = await client.query(
        `select * from public.user_profiles where id = $1 for update`,
        [input.userId]
      );
      if (userRes.rows.length === 0) {
        throw new Error('USER_NOT_FOUND');
      }
      const user = userRes.rows[0];

      if (user.kyc_status !== 'verified') {
        throw new Error('KYC_NOT_VERIFIED');
      }

      // Latest verified deposit
      const depositRes = await client.query(
        `select * from public.deposits
         where user_id = $1 and status = 'verified'
         order by created_at desc
         limit 1`,
        [input.userId]
      );
      if (depositRes.rows.length === 0) {
        throw new Error('DEPOSIT_REQUIRED');
      }
      const latestDeposit = depositRes.rows[0];

      const { requiredMinDepositCents } = this.computeRequiredDeposit({
        auction,
        bidAmountCents: input.amountCents,
      });

      // Enforce minimum increment if configured on the auction: if there is an
      // existing highest accepted bid and min_increment_cents is set, reject
      // bids that are below highest + min_increment_cents without touching
      // wallet/escrow.
      const minIncrementCents = Number(auction.min_increment_cents || 0);
      if (minIncrementCents > 0) {
        const highestRes = await client.query(
          `select amount_cents
             from public.bids
            where auction_id = $1
              and status = 'accepted'
            order by amount_cents desc, sequence desc
            limit 1`,
          [input.auctionId],
        );
        const highestBidRow = highestRes.rows[0] ?? null;

        if (highestBidRow) {
          const highestAmountCents = Number(highestBidRow.amount_cents);
          const minAllowedCents = highestAmountCents + minIncrementCents;

          if (input.amountCents < minAllowedCents) {
            const rejectMeta: any = {
              isHighSpeed: input.isHighSpeed ?? false,
              rejectionReason: {
                code: 'below_min_increment',
                highestAmountCents,
                minIncrementCents,
                minAllowedCents,
                attemptedAmountCents: input.amountCents,
              },
            };
            if (input.autoBidId) rejectMeta.autoBidId = input.autoBidId;
            if (input.idempotencyKey) rejectMeta.idempotencyKey = input.idempotencyKey;

            const rejectedBidRes = await client.query(
              `insert into public.bids (
                 auction_id, user_id, amount_cents, type, status, created_at, meta
               ) values ($1, $2, $3, $4, $5, now(), $6)
               returning *`,
              [
                input.auctionId,
                input.userId,
                input.amountCents,
                'manual',
                'rejected',
                rejectMeta,
              ],
            );

            const rejectedBid = rejectedBidRes.rows[0];

            await client.query('COMMIT');
            client.release();

            const room = this.getAuctionRoom(input.auctionId);
            this.io.to(room).emit('bid-rejected', {
              bid: rejectedBid,
              reason: 'below_min_increment',
            });

            return {
              bid: rejectedBid,
              accepted: false,
              pendingForAdmin: false,
            };
          }
        }
      }

      const walletBeforeAvailable = Number(user.wallet_available_cents);
      const walletBeforeEscrow = Number(user.wallet_escrow_cents);

      if (walletBeforeAvailable < requiredMinDepositCents) {
        throw new Error('INSUFFICIENT_WALLET_FOR_DEPOSIT');
      }

      // Lock escrow: move from available -> escrow
      const newAvailable = walletBeforeAvailable - requiredMinDepositCents;
      const newEscrow = walletBeforeEscrow + requiredMinDepositCents;

      await client.query(
        `update public.user_profiles
         set wallet_available_cents = $1,
             wallet_escrow_cents    = $2
         where id = $3`,
        [newAvailable, newEscrow, input.userId]
      );

      const depositSnapshot = {
        walletAvailableCents: newAvailable,
        walletEscrowCents: newEscrow,
        minRequiredEscrowCents: requiredMinDepositCents,
        depositId: latestDeposit.id,
      };

      const requiresAdminApproval = Boolean(auction.admin_approval_required);
      const status: BidStatus = requiresAdminApproval ? 'pending' : 'accepted';

      const meta: any = {
        depositSnapshot,
        isHighSpeed: input.isHighSpeed ?? false,
      };
      if (input.autoBidId) meta.autoBidId = input.autoBidId;
      if (input.idempotencyKey) meta.idempotencyKey = input.idempotencyKey;

      // Insert bid; sequence uses bigserial
      const bidInsertRes = await client.query(
        `insert into public.bids (
           auction_id, user_id, amount_cents, type, status, created_at, meta
         ) values ($1, $2, $3, $4, $5, now(), $6)
         returning *`,
        [
          input.auctionId,
          input.userId,
          input.amountCents,
          'manual',
          status,
          meta,
        ]
      );
      const createdBid = bidInsertRes.rows[0];

      // Increment bids_count
      await client.query(
        `update public.auctions
         set bids_count = coalesce(bids_count, 0) + 1
         where id = $1`,
        [input.auctionId]
      );

      await this.logWalletEvent(client, {
        userId: input.userId,
        auctionId: input.auctionId,
        bidId: createdBid.id,
        orderId: null,
        eventType: 'ESCROW_LOCKED_FOR_BID',
        status: 'completed',
        amountDeltaCents: 0,
        walletBeforeCents: walletBeforeAvailable,
        walletAfterCents: newAvailable,
        escrowBeforeCents: walletBeforeEscrow,
        escrowAfterCents: newEscrow,
        sourceType: 'auction_settlement',
        sourceReference: null,
        reasonCode: 'auction_bid',
        reasonText: 'Escrow locked for bid placement.',
        policyCodes: ['ONB-04', 'AUC-02'],
      });

      await client.query('COMMIT');
      client.release();

      const room = this.getAuctionRoom(input.auctionId);

      if (requiresAdminApproval) {
        this.io.to(room).emit('bid-pending', { bidId: createdBid.id });
        return {
          bid: createdBid,
          accepted: false,
          pendingForAdmin: true,
        };
      }

      this.io.to(room).emit('new-bid', { bid: createdBid, accepted: true });
      this.io.to(room).emit('bid-overlay', {
        amountCents: createdBid.amount_cents,
        username: user.name,
        flags: { type: createdBid.type, isHighSpeed: meta.isHighSpeed },
      });

      return {
        bid: createdBid,
        accepted: true,
        pendingForAdmin: false,
      };
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // ignore rollback errors
      }
      client.release();
      throw err;
    }
  }

  /**
   * System-triggered winner finalization for auto-end flow.
   * - No admin required
   * - Only runs if auction is not already ended and end_date has passed
   */
  async autoFinalizeWinner(auctionId: string): Promise<void> {
    const client: PoolClient = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const auctionRes = await client.query(
        `select * from public.auctions where id = $1 for update`,
        [auctionId],
      );
      if (auctionRes.rows.length === 0) {
        throw new Error('AUCTION_NOT_FOUND');
      }
      const auction = auctionRes.rows[0];

      if (auction.status === 'ended') {
        await client.query('ROLLBACK');
        client.release();
        return;
      }

      const now = new Date();
      const endDate = auction.end_date ? new Date(auction.end_date) : null;
      if (!endDate || endDate > now) {
        await client.query('ROLLBACK');
        client.release();
        return;
      }

      const bidRes = await client.query(
        `select * from public.bids
         where auction_id = $1 and status = 'accepted'
         order by amount_cents desc, sequence desc
         limit 1`,
        [auctionId],
      );
      const highestBid = bidRes.rows.length ? bidRes.rows[0] : null;

      let winnerUser: any = null;
      if (highestBid) {
        const userRes = await client.query(
          `select id, name from public.user_profiles where id = $1`,
          [highestBid.user_id],
        );
        winnerUser = userRes.rows.length ? userRes.rows[0] : null;
      }

      if (highestBid) {
        const losersRes = await client.query(
          `select b.*
             from public.bids b
            where b.auction_id = $1
              and b.status = 'accepted'
              and b.id <> $2`,
          [auctionId, highestBid.id],
        );
        for (const loser of losersRes.rows) {
          const loserUserRes = await client.query(
            `select * from public.user_profiles where id = $1 for update`,
            [loser.user_id],
          );
          if (!loserUserRes.rows.length) continue;
          const loserUser = loserUserRes.rows[0];
          const snapshot = (loser.meta && loser.meta.depositSnapshot) || null;
          let releaseAmount = 0;
          if (snapshot && snapshot.minRequiredEscrowCents != null) {
            releaseAmount = Number(snapshot.minRequiredEscrowCents) || 0;
          } else {
            const depositCalc = this.computeRequiredDeposit({
              auction,
              bidAmountCents: Number(loser.amount_cents),
            });
            releaseAmount = depositCalc.requiredMinDepositCents || 0;
          }
          if (releaseAmount > 0) {
            const walletBeforeAvailable = Number(loserUser.wallet_available_cents);
            const walletBeforeEscrow = Number(loserUser.wallet_escrow_cents);
            const newAvailable = walletBeforeAvailable + releaseAmount;
            const newEscrow = walletBeforeEscrow - releaseAmount;
            await client.query(
              `update public.user_profiles
                 set wallet_available_cents = $1,
                     wallet_escrow_cents    = $2
               where id = $3`,
              [newAvailable, newEscrow, loserUser.id],
            );
            await this.logWalletEvent(client, {
              userId: loserUser.id,
              auctionId: auction.id,
              bidId: loser.id,
              orderId: null,
              eventType: 'ESCROW_RELEASED',
              status: 'completed',
              amountDeltaCents: 0,
              walletBeforeCents: walletBeforeAvailable,
              walletAfterCents: newAvailable,
              escrowBeforeCents: walletBeforeEscrow,
              escrowAfterCents: newEscrow,
              sourceType: 'auction_settlement',
              sourceReference: null,
              reasonCode: 'auction_loss_refund',
              reasonText: 'Escrow released for non-winning bid at auto finalization.',
              policyCodes: ['AUC-02'],
            });
          }
        }
      }

      await client.query(
        `update public.auctions set status = 'ended' where id = $1`,
        [auctionId],
      );

      await client.query('COMMIT');
      client.release();

      console.log('[live-backend] autoFinalizeWinner success', {
        auctionId: String(auction.id),
        winnerUserId: winnerUser ? String(winnerUser.id) : null,
        amountCents: highestBid ? highestBid.amount_cents : null,
      });

      console.log('[live-backend] settlement-check', {
        auctionId: String(auction.id),
        winnerDebit: highestBid ? Number(highestBid.amount_cents) : null,
        sellerCredit: null,
        platformFee: null,
      });

      const room = this.getAuctionRoom(String(auction.id));

      this.io.to(room).emit('winner-finalized', {
        winner: winnerUser ? { id: String(winnerUser.id), name: winnerUser.name } : null,
        amountCents: highestBid ? highestBid.amount_cents : null,
      });

      this.io.to(room).emit('auction-ended');
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // ignore rollback errors
      }
      client.release();
      throw err;
    }
  }

  async applyReserveAutoDrop(
    auctionId: string,
    newReserveCents: number,
    context: {
      actorType: 'seller' | 'admin' | 'system' | 'ai';
      actorId: string | null;
      channel: 'web' | 'app' | 'admin_console' | 'scheduler' | 'ai_engine';
      triggerReasonCode:
        | 'manual_config'
        | 'time_decay'
        | 'low_engagement'
        | 'bid_gap'
        | 'ai_recommendation'
        | 'manual_override'
        | null;
      triggerDetails?: Record<string, unknown>;
      approvalType:
        | 'auto_no_approval'
        | 'seller_approved'
        | 'admin_approved'
        | 'rejected';
    },
  ): Promise<void> {
    const client: PoolClient = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const auctionRes = await client.query(
        `select id, seller_id, reserve_price_cents from public.auctions where id = $1 for update`,
        [auctionId],
      );
      if (auctionRes.rows.length === 0) {
        throw new Error('AUCTION_NOT_FOUND');
      }

      const auction = auctionRes.rows[0];
      const oldReserveCents = Number(auction.reserve_price_cents);
      const sellerId = String(auction.seller_id);

      if (oldReserveCents === newReserveCents) {
        await client.query('ROLLBACK');
        client.release();
        return;
      }

      await client.query(
        `update public.auctions set reserve_price_cents = $1 where id = $2`,
        [newReserveCents, auctionId],
      );

      const changeDeltaCents = newReserveCents - oldReserveCents;

      await this.logReserveAutoDropEvent(client, {
        environment: 'prod',
        actorType: context.actorType,
        actorId: context.actorId,
        channel: context.channel,
        auctionId,
        listingId: null,
        sellerId,
        eventType: 'RESERVE_PRICE_CHANGED',
        status: 'applied',
        oldReserveCents,
        newReserveCents,
        changeDeltaCents,
        triggerReasonCode: context.triggerReasonCode,
        triggerDetails: context.triggerDetails,
        approvalType: context.approvalType,
        policyCodes: ['AUC-01', 'AUC-02', 'AI-10'],
        beforeState: { reserve_price_cents: oldReserveCents },
        afterState: { reserve_price_cents: newReserveCents },
      });

      await client.query('COMMIT');
      client.release();
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch {
      }
      client.release();
      throw err;
    }
  }

  private computeRequiredDeposit(params: {
    auction: any;
    bidAmountCents: number;
  }): { requiredMinDepositCents: number } {
    const { auction, bidAmountCents } = params;
    const percent = auction.minDepositPercent ?? auction.config?.minDepositPercent ?? 0;
    const fixed = auction.minDepositFixedCents ?? auction.config?.minDepositFixedCents ?? 0;

    const percentValue = Math.floor((bidAmountCents * percent) / 100);
    const requiredMinDepositCents = Math.max(percentValue, fixed);

    return { requiredMinDepositCents };
  }

  /**
   * Admin action: accept / reject / override a bid.
   */
  async handleAdminBidAction(input: AdminBidActionInput): Promise<void> {
    const client: PoolClient = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const bidRes = await client.query(
        `select * from public.bids where id = $1 for update`,
        [input.bidId]
      );
      if (bidRes.rows.length === 0) {
        throw new Error('BID_NOT_FOUND');
      }
      const bid = bidRes.rows[0];

      const auctionRes = await client.query(
        `select * from public.auctions where id = $1 for update`,
        [bid.auction_id]
      );
      if (auctionRes.rows.length === 0) {
        throw new Error('AUCTION_NOT_FOUND');
      }
      const auction = auctionRes.rows[0];

      const userRes = await client.query(
        `select * from public.user_profiles where id = $1 for update`,
        [bid.user_id]
      );
      if (userRes.rows.length === 0) {
        throw new Error('USER_NOT_FOUND');
      }
      const user = userRes.rows[0];

      const room = this.getAuctionRoom(String(auction.id));
      const depositSnapshot = (bid.meta && bid.meta.depositSnapshot) || null;
      const originalAmount = Number(bid.amount_cents);

      if (input.action === 'reject') {
        if (depositSnapshot) {
          const releaseAmount = Number(depositSnapshot.minRequiredEscrowCents || 0);
          const walletBeforeAvailable = Number(user.wallet_available_cents);
          const walletBeforeEscrow = Number(user.wallet_escrow_cents);
          const newAvailable = walletBeforeAvailable + releaseAmount;
          const newEscrow = walletBeforeEscrow - releaseAmount;

          await client.query(
            `update public.user_profiles
             set wallet_available_cents = $1,
                 wallet_escrow_cents    = $2
             where id = $3`,
            [newAvailable, newEscrow, user.id]
          );

          await this.logWalletEvent(client, {
            userId: user.id,
            auctionId: auction.id,
            bidId: bid.id,
            orderId: null,
            eventType: 'ESCROW_RELEASED',
            status: 'completed',
            amountDeltaCents: 0,
            walletBeforeCents: walletBeforeAvailable,
            walletAfterCents: newAvailable,
            escrowBeforeCents: walletBeforeEscrow,
            escrowAfterCents: newEscrow,
            sourceType: 'auction_settlement',
            sourceReference: null,
            reasonCode: 'auction_loss_refund',
            reasonText: 'Escrow released after admin bid rejection.',
            policyCodes: ['ONB-04', 'AUC-02'],
          });
        }

        const updatedBidRes = await client.query(
          `update public.bids set status = 'rejected' where id = $1 returning *`,
          [bid.id]
        );
        const updatedBid = updatedBidRes.rows[0];

        await this.logAdminAction(client, {
          adminId: input.adminId,
          actionType: 'BID_REJECT',
          targetType: 'bid',
          targetId: bid.id,
          auctionId: auction.id,
          details: { reason: 'ADMIN_REJECT', originalAmount },
        });

        await client.query('COMMIT');
        client.release();

        this.io.to(room).emit('admin-action-log', {
          action: {
            type: 'BID_REJECT',
            bidId: String(updatedBid.id),
            adminId: input.adminId,
          },
        });

        this.io.to(room).emit('new-bid', { bid: updatedBid, accepted: false });
        return;
      }

      if (input.action === 'override') {
        if (!input.overrideAmountCents) {
          throw new Error('OVERRIDE_AMOUNT_REQUIRED');
        }

        const newAmount = input.overrideAmountCents;
        const { requiredMinDepositCents } = this.computeRequiredDeposit({
          auction,
          bidAmountCents: newAmount,
        });

        const previousLocked = Number(
          depositSnapshot?.minRequiredEscrowCents || 0
        );
        const diff = requiredMinDepositCents - previousLocked;

        let newAvailable = Number(user.wallet_available_cents);
        let newEscrow = Number(user.wallet_escrow_cents);

        if (diff > 0) {
          if (newAvailable < diff) {
            throw new Error('INSUFFICIENT_WALLET_FOR_OVERRIDE');
          }
          newAvailable -= diff;
          newEscrow += diff;
        } else if (diff < 0) {
          newAvailable += -diff;
          newEscrow -= -diff;
        }

        await client.query(
          `update public.user_profiles
           set wallet_available_cents = $1,
               wallet_escrow_cents    = $2
           where id = $3`,
          [newAvailable, newEscrow, user.id]
        );

        const newSnapshot = {
          ...(depositSnapshot || {}),
          minRequiredEscrowCents: requiredMinDepositCents,
        };

        const updatedBidRes = await client.query(
          `update public.bids
           set amount_cents = $1,
               type         = 'admin_override',
               status       = 'accepted',
               meta         = jsonb_set(coalesce(meta, '{}'::jsonb), '{depositSnapshot}', $2::jsonb, true)
           where id = $3
           returning *`,
          [newAmount, JSON.stringify(newSnapshot), bid.id]
        );
        const updatedBid = updatedBidRes.rows[0];

        await this.logAdminAction(client, {
          adminId: input.adminId,
          actionType: 'BID_OVERRIDE',
          targetType: 'bid',
          targetId: bid.id,
          auctionId: auction.id,
          details: { previousAmount: originalAmount, newAmount },
        });

        await client.query('COMMIT');
        client.release();

        this.io.to(room).emit('admin-action-log', {
          action: {
            type: 'BID_OVERRIDE',
            bidId: String(updatedBid.id),
            previousAmount: originalAmount,
            newAmount,
            adminId: input.adminId,
          },
        });

        this.io.to(room).emit('new-bid', { bid: updatedBid, accepted: true });
        this.io.to(room).emit('bid-overlay', {
          amountCents: updatedBid.amount_cents,
          username: user.name,
          flags: { type: 'admin_override', overridden: true },
        });

        return;
      }

      // Accept
      const updatedBidRes = await client.query(
        `update public.bids
         set status = 'accepted'
         where id = $1
         returning *`,
        [bid.id]
      );
      const updatedBid = updatedBidRes.rows[0];

      await this.logAdminAction(client, {
        adminId: input.adminId,
        actionType: 'BID_ACCEPT',
        targetType: 'bid',
        targetId: bid.id,
        auctionId: auction.id,
        details: { amountCents: updatedBid.amount_cents },
      });

      await client.query('COMMIT');
      client.release();

      this.io.to(room).emit('admin-action-log', {
        action: {
          type: 'BID_ACCEPT',
          bidId: String(updatedBid.id),
          adminId: input.adminId,
        },
      });

      this.io.to(room).emit('new-bid', { bid: updatedBid, accepted: true });
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // ignore rollback errors
      }
      client.release();
      throw err;
    }
  }

  /**
   * Winner finalization: pick highest valid bid, end auction, notify clients.
   */
  async finalizeWinner(input: FinalizeWinnerInput): Promise<void> {
    const client: PoolClient = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const auctionRes = await client.query(
        `select * from public.auctions where id = $1 for update`,
        [input.auctionId]
      );
      if (auctionRes.rows.length === 0) {
        throw new Error('AUCTION_NOT_FOUND');
      }
      const auction = auctionRes.rows[0];

      if (auction.status === 'ended') {
        await client.query('ROLLBACK');
        client.release();
        return;
      }

      const bidRes = await client.query(
        `select * from public.bids
         where auction_id = $1 and status = 'accepted'
         order by amount_cents desc, sequence desc
         limit 1`,
        [input.auctionId]
      );
      const highestBid = bidRes.rows.length ? bidRes.rows[0] : null;

      let winnerUser: any = null;
      if (highestBid) {
        const userRes = await client.query(
          `select id, name from public.user_profiles where id = $1`,
          [highestBid.user_id]
        );
        winnerUser = userRes.rows.length ? userRes.rows[0] : null;
      }

      if (highestBid) {
        const losersRes = await client.query(
          `select b.*
             from public.bids b
            where b.auction_id = $1
              and b.status = 'accepted'
              and b.id <> $2`,
          [input.auctionId, highestBid.id]
        );
        for (const loser of losersRes.rows) {
          const loserUserRes = await client.query(
            `select * from public.user_profiles where id = $1 for update`,
            [loser.user_id]
          );
          if (!loserUserRes.rows.length) continue;
          const loserUser = loserUserRes.rows[0];
          const snapshot = (loser.meta && loser.meta.depositSnapshot) || null;
          let releaseAmount = 0;
          if (snapshot && snapshot.minRequiredEscrowCents != null) {
            releaseAmount = Number(snapshot.minRequiredEscrowCents) || 0;
          } else {
            const depositCalc = this.computeRequiredDeposit({
              auction,
              bidAmountCents: Number(loser.amount_cents),
            });
            releaseAmount = depositCalc.requiredMinDepositCents || 0;
          }
          if (releaseAmount > 0) {
            const walletBeforeAvailable = Number(loserUser.wallet_available_cents);
            const walletBeforeEscrow = Number(loserUser.wallet_escrow_cents);
            const newAvailable = walletBeforeAvailable + releaseAmount;
            const newEscrow = walletBeforeEscrow - releaseAmount;
            await client.query(
              `update public.user_profiles
                 set wallet_available_cents = $1,
                     wallet_escrow_cents    = $2
               where id = $3`,
              [newAvailable, newEscrow, loserUser.id]
            );
            await this.logWalletEvent(client, {
              userId: loserUser.id,
              auctionId: auction.id,
              bidId: loser.id,
              orderId: null,
              eventType: 'ESCROW_RELEASED',
              status: 'completed',
              amountDeltaCents: 0,
              walletBeforeCents: walletBeforeAvailable,
              walletAfterCents: newAvailable,
              escrowBeforeCents: walletBeforeEscrow,
              escrowAfterCents: newEscrow,
              sourceType: 'auction_settlement',
              sourceReference: null,
              reasonCode: 'auction_loss_refund',
              reasonText: 'Escrow released for non-winning bid at admin finalization.',
              policyCodes: ['AUC-02'],
            });
          }
        }
      }

      await client.query(
        `update public.auctions set status = 'ended' where id = $1`,
        [input.auctionId]
      );

      await this.logAdminAction(client, {
        adminId: input.adminId,
        actionType: 'AUCTION_FINISH',
        targetType: 'auction',
        targetId: auction.id,
        auctionId: auction.id,
        details: {
          winnerBidId: highestBid ? highestBid.id : null,
          winnerUserId: highestBid ? highestBid.user_id : null,
          amountCents: highestBid ? highestBid.amount_cents : null,
        },
      });

      await client.query('COMMIT');
      client.release();

      console.log('[live-backend] adminFinalizeWinner success', {
        auctionId: String(auction.id),
        winnerUserId: winnerUser ? String(winnerUser.id) : null,
        amountCents: highestBid ? highestBid.amount_cents : null,
        adminId: input.adminId,
      });

      console.log('[live-backend] settlement-check', {
        auctionId: String(auction.id),
        winnerDebit: highestBid ? Number(highestBid.amount_cents) : null,
        sellerCredit: null,
        platformFee: null,
      });

      const room = this.getAuctionRoom(String(auction.id));
      this.io.to(room).emit('winner-finalized', {
        winner: winnerUser ? { id: String(winnerUser.id), name: winnerUser.name } : null,
        amountCents: highestBid ? highestBid.amount_cents : null,
      });
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // ignore rollback errors
      }
      client.release();
      throw err;
    }
  }

  private async logAdminAction(
    client: PoolClient,
    params: {
      adminId: string;
      actionType: string;
      targetType: 'bid' | 'auction' | 'ad' | 'deposit';
      targetId: string;
      auctionId?: string;
      details?: any;
    }
  ): Promise<void> {
    await client.query(
      `insert into public.admin_action_logs (
         admin_id, action_type, target_type, target_id, auction_id, details, created_at
       ) values ($1, $2, $3, $4, $5, $6, now())`,
      [
        params.adminId,
        params.actionType,
        params.targetType,
        params.targetId,
        params.auctionId ?? null,
        params.details ?? {},
      ]
    );
  }

  private async logWalletEvent(
    client: PoolClient,
    params: WalletAuditLogParams,
  ): Promise<void> {
    const {
      userId,
      walletId,
      auctionId,
      bidId,
      orderId,
      eventType,
      status,
      amountDeltaCents,
      walletBeforeCents,
      walletAfterCents,
      escrowBeforeCents = null,
      escrowAfterCents = null,
      sourceType = null,
      sourceReference = null,
      reasonCode = null,
      reasonText = null,
      policyCodes = null,
    } = params;

    const effectiveWalletId = walletId ?? userId;

    await client.query(
      `insert into public.wallet_audit_log (
         id,
         created_at,
         environment,
         actor_type,
         actor_id,
         channel,
         ip_address,
         wallet_id,
         user_id,
         currency,
         event_type,
         status,
         amount_delta_cents,
         wallet_balance_before_cents,
         wallet_balance_after_cents,
         escrow_balance_before_cents,
         escrow_balance_after_cents,
         source_type,
         source_reference,
         auction_id,
         bid_id,
         order_id,
         reason_code,
         reason_text,
         policy_codes
       ) values (
         gen_random_uuid(),
         now(),
         'prod',
         'user',
         $1,
         'web',
         null,
         $2,
         $3,
         'INR',
         $4,
         $5,
         $6,
         $7,
         $8,
         $9,
         $10,
         $11,
         $12,
         $13,
         $14,
         $15,
         $16,
         $17,
         $18
       )`,
      [
        userId,
        effectiveWalletId,
        userId,
        eventType,
        status,
        amountDeltaCents,
        walletBeforeCents,
        walletAfterCents,
        escrowBeforeCents,
        escrowAfterCents,
        sourceType,
        sourceReference,
        auctionId ?? null,
        bidId ?? null,
        orderId ?? null,
        reasonCode,
        reasonText,
        policyCodes,
      ],
    );
  }

  private async logReserveAutoDropEvent(
    client: PoolClient,
    params: ReserveAutoDropLogParams,
  ): Promise<void> {
    const {
      environment = 'prod',
      actorType,
      actorId,
      channel,
      auctionId,
      listingId = null,
      sellerId,
      eventType,
      status,
      oldReserveCents,
      newReserveCents,
      changeDeltaCents,
      triggerReasonCode,
      triggerDetails = null,
      approvalType,
      policyCodes = null,
      beforeState = null,
      afterState = null,
    } = params;

    await client.query(
      `insert into public.reserve_auto_drop_log (
         id,
         created_at,
         environment,
         actor_type,
         actor_id,
         channel,
         auction_id,
         listing_id,
         seller_id,
         event_type,
         status,
         old_reserve_cents,
         new_reserve_cents,
         change_delta_cents,
         trigger_reason_code,
         trigger_details,
         approval_type,
         policy_codes,
         before_state,
         after_state
       ) values (
         gen_random_uuid(),
         now(),
         $1,
         $2,
         $3,
         $4,
         $5,
         $6,
         $7,
         $8,
         $9,
         $10,
         $11,
         $12,
         $13,
         $14,
         $15,
         $16,
         $17,
         $18
       )`,
      [
        environment,
        actorType,
        actorId,
        channel,
        auctionId,
        listingId,
        sellerId,
        eventType,
        status,
        oldReserveCents,
        newReserveCents,
        changeDeltaCents,
        triggerReasonCode,
        triggerDetails,
        approvalType,
        policyCodes,
        beforeState,
        afterState,
      ],
    );
  }
}
