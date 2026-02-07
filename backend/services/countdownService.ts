import type { Server as SocketIOServer } from 'socket.io';
import type { Pool } from 'pg';

interface CountdownTimer {
  auctionId: string;
  endTime: Date;
  interval: NodeJS.Timeout;
  isActive: boolean;
  lastMinuteExtension?: boolean;
}

export class CountdownService {
  private timers = new Map<string, CountdownTimer>();
  private io: SocketIOServer;
  private pool: Pool;

  constructor(io: SocketIOServer, pool: Pool) {
    this.io = io;
    this.pool = pool;
  }

  async startCountdown(auctionId: string, endTime: Date): Promise<void> {
    // Stop existing timer if any
    this.stopCountdown(auctionId);

    const timer: CountdownTimer = {
      auctionId,
      endTime,
      interval: setInterval(() => this.updateCountdown(auctionId), 1000),
      isActive: true,
      lastMinuteExtension: false
    };

    this.timers.set(auctionId, timer);
    
    // Send initial time
    await this.broadcastTimeUpdate(auctionId);
  }

  async extendCountdown(auctionId: string, extensionMinutes: number = 5): Promise<void> {
    const timer = this.timers.get(auctionId);
    if (!timer) return;

    // Extend the end time
    timer.endTime = new Date(timer.endTime.getTime() + (extensionMinutes * 60 * 1000));
    timer.lastMinuteExtension = true;

    // Update database
    await this.pool.query(
      `UPDATE auctions SET end_date = $1 WHERE id = $2`,
      [timer.endTime, auctionId]
    );

    // Broadcast extension
    this.io.to(`auction:${auctionId}`).emit('countdown-extended', {
      newEndTime: timer.endTime,
      extensionMinutes,
      reason: 'last-minute-bid'
    });

    // Send updated time
    await this.broadcastTimeUpdate(auctionId);
  }

  private async updateCountdown(auctionId: string): Promise<void> {
    const timer = this.timers.get(auctionId);
    if (!timer || !timer.isActive) return;

    const now = new Date();
    const timeRemaining = timer.endTime.getTime() - now.getTime();

    if (timeRemaining <= 0) {
      // Auction ended
      await this.endAuction(auctionId);
    } else {
      // Broadcast time update
      await this.broadcastTimeUpdate(auctionId);

      // Check for last-minute warnings
      const secondsRemaining = Math.floor(timeRemaining / 1000);
      
      if (secondsRemaining === 60) {
        this.io.to(`auction:${auctionId}`).emit('countdown-warning', {
          type: 'one-minute',
          message: '1 minute remaining!'
        });
      } else if (secondsRemaining === 30) {
        this.io.to(`auction:${auctionId}`).emit('countdown-warning', {
          type: 'thirty-seconds',
          message: '30 seconds remaining!'
        });
      } else if (secondsRemaining === 10) {
        this.io.to(`auction:${auctionId}`).emit('countdown-warning', {
          type: 'ten-seconds',
          message: '10 seconds remaining!'
        });
      } else if (secondsRemaining === 5) {
        this.io.to(`auction:${auctionId}`).emit('countdown-warning', {
          type: 'five-seconds',
          message: '5 seconds remaining!'
        });
      }
    }
  }

  private async broadcastTimeUpdate(auctionId: string): Promise<void> {
    const timer = this.timers.get(auctionId);
    if (!timer) return;

    const now = new Date();
    const timeRemaining = timer.endTime.getTime() - now.getTime();

    this.io.to(`auction:${auctionId}`).emit('countdown-update', {
      auctionId,
      timeRemaining: Math.max(0, timeRemaining),
      endTime: timer.endTime,
      isActive: timer.isActive,
      lastMinuteExtension: timer.lastMinuteExtension
    });
  }

  private async endAuction(auctionId: string): Promise<void> {
    const timer = this.timers.get(auctionId);
    if (!timer) return;

    timer.isActive = false;
    clearInterval(timer.interval);

    // Update auction status in database
    await this.pool.query(
      `UPDATE auctions SET status = 'ended' WHERE id = $1`,
      [auctionId]
    );

    // Get final auction data
    const auctionResult = await this.pool.query(
      `SELECT a.*, p.title, p.seller_id 
       FROM auctions a 
       JOIN products p ON a.product_id = p.id 
       WHERE a.id = $1`,
      [auctionId]
    );

    const auction = auctionResult.rows[0];

    // Get winning bid
    const winningBidResult = await this.pool.query(
      `SELECT b.*, u.name as winner_name, u.email as winner_email
       FROM bids b 
       JOIN user_profiles u ON b.user_id = u.id 
       WHERE b.auction_id = $1 AND b.status = 'accepted'
       ORDER BY b.amount_cents DESC, b.created_at ASC 
       LIMIT 1`,
      [auctionId]
    );

    const winningBid = winningBidResult.rows[0];

    // Broadcast auction end
    this.io.to(`auction:${auctionId}`).emit('auction-ended', {
      auctionId,
      auction: {
        id: auction.id,
        title: auction.title,
        sellerId: auction.seller_id,
        finalPrice: auction.current_price,
        endTime: auction.end_date
      },
      winningBid: winningBid ? {
        id: winningBid.id,
        amount: winningBid.amount_cents,
        winnerName: winningBid.winner_name,
        winnerId: winningBid.user_id,
        timestamp: winningBid.created_at
      } : null,
      endedAt: new Date()
    });

    // Send to admin dashboard
    this.io.to('admin-dashboard').emit('auction-completed', {
      auctionId,
      finalPrice: auction.current_price,
      winningBid: winningBid,
      endedAt: new Date()
    });

    // Remove timer
    this.timers.delete(auctionId);
  }

  stopCountdown(auctionId: string): void {
    const timer = this.timers.get(auctionId);
    if (timer) {
      clearInterval(timer.interval);
      this.timers.delete(auctionId);
    }
  }

  async pauseCountdown(auctionId: string): Promise<void> {
    const timer = this.timers.get(auctionId);
    if (timer) {
      timer.isActive = false;
      await this.broadcastTimeUpdate(auctionId);
    }
  }

  async resumeCountdown(auctionId: string): Promise<void> {
    const timer = this.timers.get(auctionId);
    if (timer) {
      timer.isActive = true;
      await this.broadcastTimeUpdate(auctionId);
    }
  }

  getActiveTimers(): string[] {
    return Array.from(this.timers.keys());
  }

  getTimerStatus(auctionId: string): { isActive: boolean; timeRemaining: number } | null {
    const timer = this.timers.get(auctionId);
    if (!timer) return null;

    const now = new Date();
    const timeRemaining = timer.endTime.getTime() - now.getTime();

    return {
      isActive: timer.isActive,
      timeRemaining: Math.max(0, timeRemaining)
    };
  }

  // Initialize timers for active auctions on server start
  async initializeActiveAuctions(): Promise<void> {
    try {
      const activeAuctions = await this.pool.query(
        `SELECT id, end_date 
         FROM auctions 
         WHERE status = 'active' AND end_date > NOW()
         ORDER BY end_date ASC`
      );

      for (const auction of activeAuctions.rows) {
        await this.startCountdown(auction.id, new Date(auction.end_date));
        console.log(`Started countdown for auction: ${auction.id}`);
      }
    } catch (error) {
      console.error('Error initializing active auctions:', error);
    }
  }

  // Cleanup on server shutdown
  shutdown(): void {
    for (const timer of this.timers.values()) {
      clearInterval(timer.interval);
    }
    this.timers.clear();
  }
}
