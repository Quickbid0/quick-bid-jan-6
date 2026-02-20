/**
 * FIX RT-05: Auto-Bid Runaway Loop
 * FIX F-05: Auto-Bid Exceeds Wallet Balance
 * 
 * Prevents two buyers from creating 47+ bids in under 1 second
 * Ensures auto-bid respects wallet balance at execution time
 */

export class AutoBidService {
  // FIX RT-05: Store last auto-bid time per user per auction
  private lastAutoBidTime = new Map<string, number>();

  // Configurable cooldown - 1.5 seconds between auto-bids per user per auction
  private readonly AUTOBID_COOLDOWN_MS = 1500;

  /**
   * Check if user can place an auto-bid this instant
   */
  canAutoBid(auctionId: string, userId: string): boolean {
    const key = `${auctionId}:${userId}`;
    const lastTime = this.lastAutoBidTime.get(key) || 0;
    const now = Date.now();

    if (now - lastTime < this.AUTOBID_COOLDOWN_MS) {
      return false;
    }

    // Update the timestamp for next check
    this.lastAutoBidTime.set(key, now);
    return true;
  }

  /**
   * Calculate next auto-bid amount
   * Respects:
   * 1. Auto-bid max set by user
   * 2. Minimum bid (current highest + $1)
   * 3. Wallet balance at execution time
   */
  calculateNextBid(
    currentHighestBid: number,
    userAutoBidMax: number,
    userWalletBalance: number,
    bidIncrement: number = 1
  ): { bidAmount: number | null; reason?: string } {
    // FIX F-05: Wallet balance check
    if (currentHighestBid + bidIncrement > userWalletBalance) {
      return { bidAmount: null, reason: 'Auto-bid would exceed wallet balance' };
    }

    // Check against user's auto-bid max
    if (currentHighestBid + bidIncrement > userAutoBidMax) {
      return { bidAmount: null, reason: 'Auto-bid reached maximum' };
    }

    const nextBid = Math.min(
      currentHighestBid + bidIncrement,
      userAutoBidMax,
      userWalletBalance
    );

    return { bidAmount: nextBid };
  }

  /**
   * Validate auto-bid configuration
   * Used during FIX 9: Auto-Bid Exceeds Wallet Balance form validation
   */
  validateAutoBidMax(maxBid: number, userWalletBalance: number): { valid: boolean; error?: string } {
    if (maxBid <= 0) {
      return { valid: false, error: 'Auto-bid max must be greater than ₹0' };
    }

    if (maxBid > userWalletBalance) {
      return {
        valid: false,
        error: `Cannot set auto-bid max (₹${maxBid}) higher than wallet balance (₹${userWalletBalance})`,
      };
    }

    return { valid: true };
  }

  /**
   * Reset cooldown (useful for testing)
   */
  resetCooldown(auctionId: string, userId: string): void {
    const key = `${auctionId}:${userId}`;
    this.lastAutoBidTime.delete(key);
  }

  /**
   * Clean up old entries (run periodically)
   */
  cleanup(): void {
    const now = Date.now();
    const maxAge = 1 * 60 * 60 * 1000; // 1 hour

    for (const [key, timestamp] of this.lastAutoBidTime.entries()) {
      if (now - timestamp > maxAge) {
        this.lastAutoBidTime.delete(key);
      }
    }
  }
}

export const autoBidService = new AutoBidService();
