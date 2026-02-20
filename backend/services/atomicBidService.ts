/**
 * FIX RT-01: Auction Race Condition / Duplicate Bids
 * Use database-level atomic operations to prevent two bids of the same amount winning
 */

import { Pool } from 'pg';

export class AtomicBidService {
  constructor(private pool: Pool) {}

  /**
   * Place a bid atomically
   * Returns the auction if bid succeeds, null if bid was outbid or auction ended
   * 
   * Usage:
   * const result = await bidService.placeBidAtomic(auctionId, userId, bidAmount);
   * if (!result.success) {
   *   return res.status(409).json({ error: result.error });
   * }
   */
  async placeBidAtomic(
    auctionId: string,
    userId: string,
    bidAmount: number
  ): Promise<{ success: boolean; error?: string; auction?: any }> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

      // 1️⃣ Fetch auction with lock
      const auctionResult = await client.query(
        `SELECT * FROM auctions WHERE id = $1 FOR UPDATE`,
        [auctionId]
      );

      if (auctionResult.rows.length === 0) {
        return { success: false, error: 'Auction not found' };
      }

      const auction = auctionResult.rows[0];

      // 2️⃣ Verify auction is still active
      if (auction.status !== 'active') {
        return { success: false, error: 'Auction is no longer active' };
      }

      if (new Date(auction.end_time) < new Date()) {
        return { success: false, error: 'Auction has ended' };
      }

      // 3️⃣ Check if bid is higher than current highest
      if (bidAmount <= auction.current_highest_bid) {
        return { success: false, error: 'Your bid must exceed the current highest bid' };
      }

      // 4️⃣ Check user has sufficient wallet balance
      const walletResult = await client.query(
        `SELECT balance FROM wallets WHERE user_id = $1`,
        [userId]
      );

      const wallet = walletResult.rows[0];
      if (!wallet || wallet.balance < bidAmount) {
        return { success: false, error: 'Insufficient wallet balance' };
      }

      // 5️⃣ Atomic update - ONLY if condition still true
      const updateResult = await client.query(
        `UPDATE auctions
         SET current_highest_bid = $2,
             current_highest_bidder_id = $3,
             updated_at = NOW()
         WHERE id = $1
         AND current_highest_bid < $2
         AND status = 'active'
         AND end_time > NOW()
         RETURNING *`,
        [auctionId, bidAmount, userId]
      );

      if (updateResult.rows.length === 0) {
        // Bid was outbid between check and update
        return {
          success: false,
          error: 'Bid was outbid or auction ended. Please refresh and try again.',
        };
      }

      // 6️⃣ Record the bid in bids table
      await client.query(
        `INSERT INTO bids (auction_id, user_id, amount, timestamp)
         VALUES ($1, $2, $3, NOW())`,
        [auctionId, userId, bidAmount]
      );

      await client.query('COMMIT');

      const updatedAuction = updateResult.rows[0];
      return {
        success: true,
        auction: {
          id: updatedAuction.id,
          currentHighestBid: updatedAuction.current_highest_bid,
          currentHighestBidderId: updatedAuction.current_highest_bidder_id,
        },
      };
    } catch (err: any) {
      await client.query('ROLLBACK');

      if (err.code === '40001') {
        // Serialization failure - retry
        return { success: false, error: 'Conflict: Please try again' };
      }

      console.error('[AtomicBidService] Error:', err);
      return { success: false, error: 'Server error placing bid' };
    } finally {
      client.release();
    }
  }

  /**
   * Refund a bid (when auction is deleted or cancelled)
   */
  async refundBid(bidId: string, userId: string, amount: number): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Refund the amount to user's wallet
      await client.query(
        `UPDATE wallets SET balance = balance + $1 WHERE user_id = $2`,
        [amount, userId]
      );

      // Mark bid as refunded
      await client.query(
        `UPDATE bids SET refunded = true, refunded_at = NOW() WHERE id = $1`,
        [bidId]
      );

      await client.query('COMMIT');
      return true;
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[AtomicBidService] Refund error:', err);
      return false;
    } finally {
      client.release();
    }
  }
}
