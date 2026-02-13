import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { Auction } from '@prisma/client';

enum AuctionType {
  LIVE = 'live',
  TIMED = 'timed',
  FLASH = 'flash',
  TENDER = 'tender',
}

enum AuctionStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDED = 'ended',
}

interface BidRequest {
  auctionId: string;
  userId: string;
  amount: number;
  userName: string;
}

export interface AuctionState {
  auctionId: string;
  status: 'waiting' | 'active' | 'paused' | 'ended';
  currentPrice: number;
  startPrice: number;
  endTime: Date;
  timeLeft: number; // seconds
  totalBids: number;
  activeUsers: number;
  isExtended: boolean;
  lastBid?: {
    userId: string;
    userName: string;
    amount: number;
    timestamp: Date;
  };
  buyNowPrice?: number;
  auctionType: string;
  requiresTokenDeposit?: boolean;
  minimumBidders?: number;
}

@Injectable()
export class AuctionsService {
  private readonly logger = new Logger(AuctionsService.name);

  // In-memory auction state (in production, use Redis or database)
  private auctionStates = new Map<string, AuctionState>();
  private activeTimers = new Map<string, NodeJS.Timeout>();

  // Auction type specific configurations
  private auctionConfigs = {
    live: {
      requiresTokenDeposit: true,
      tokenDepositAmount: 5000, // ₹5,000
      hasLiveStream: true,
      allowsChat: true,
      realTimeBidding: true,
    },
    timed: {
      autoExtend: true,
      extensionTime: 2 * 60 * 1000, // 2 minutes
      triggerTime: 5 * 60 * 1000, // Last 5 minutes
      hasAntiSniping: true,
    },
    flash: {
      durationMinutes: 5, // 5 minutes
      noExtensions: true,
      highFrequencyBidding: true,
    },
    tender: {
      minimumBidders: 3,
      qualificationRequired: true,
      businessOnly: true,
      longerDuration: true,
    },
  };

  constructor(
    private eventEmitter: EventEmitter2,
    private prisma: PrismaService,
  ) {}

  async getAuctionState(auctionId: string): Promise<AuctionState> {
    // Check if we have it in memory first
    if (this.auctionStates.has(auctionId)) {
      const state = this.auctionStates.get(auctionId);
      // Update time left
      state.timeLeft = Math.max(0, Math.floor((state.endTime.getTime() - Date.now()) / 1000));
      return state;
    }

    // Load from database
    const auction = await this.prisma.auction.findUnique({
      where: { id: auctionId },
    });
    if (!auction) {
      throw new NotFoundException(`Auction ${auctionId} not found`);
    }

    // Create auction state based on auction data
    const auctionState: AuctionState = {
      auctionId: auction.id,
      status: this.mapAuctionStatus(auction.status),
      currentPrice: auction.currentBid,
      startPrice: auction.startPrice,
      endTime: auction.endTime,
      timeLeft: Math.max(0, Math.floor((auction.endTime.getTime() - Date.now()) / 1000)),
      totalBids: 0, // Initialize with default values
      activeUsers: 0,
      isExtended: false,
      auctionType: 'timed', // Default type
      requiresTokenDeposit: false,
      minimumBidders: 0,
    };

    // Cache in memory
    this.auctionStates.set(auctionId, auctionState);

    return auctionState;
  }

  private mapAuctionStatus(dbStatus: string): AuctionState['status'] {
    switch (dbStatus) {
      case 'active': return 'active';
      case 'ended': return 'ended';
      case 'paused': return 'paused';
      default: return 'waiting';
    }
  }

  async placeBid(bidRequest: BidRequest): Promise<{
    success: boolean;
    bid?: any;
    auctionState?: AuctionState;
    shouldExtend?: boolean;
    newEndTime?: Date;
    reason?: string;
    message?: string;
  }> {
    const { auctionId, userId, amount, userName } = bidRequest;

    try {
      const auctionState = await this.getAuctionState(auctionId);

      // Auction type specific validation
      const validationResult = await this.validateBidForAuctionType(auctionState, bidRequest);
      if (!validationResult.valid) {
        return {
          success: false,
          reason: validationResult.reason,
          message: validationResult.message,
        };
      }

      // Validate auction is active
      if (auctionState.status !== 'active') {
        return {
          success: false,
          reason: 'auction_not_active',
          message: 'Auction is not currently active',
        };
      }

      // Check if auction has ended
      if (auctionState.timeLeft <= 0) {
        return {
          success: false,
          reason: 'auction_ended',
          message: 'Auction has already ended',
        };
      }

      // Validate bid amount based on auction type
      const bidValidation = this.validateBidAmount(auctionState, amount);
      if (!bidValidation.valid) {
        return {
          success: false,
          reason: bidValidation.reason,
          message: bidValidation.message,
        };
      }

      // Check buy-now price (available for all auction types)
      if (auctionState.buyNowPrice && amount >= auctionState.buyNowPrice) {
        // Buy-now triggered - end auction immediately
        await this.endAuction(auctionId, 'system', userId);
        return {
          success: true,
          bid: {
            id: this.generateBidId(),
            auctionId,
            userId,
            userName,
            amount,
            timestamp: new Date(),
            isBuyNow: true,
          },
          auctionState: await this.getAuctionState(auctionId),
          message: 'Buy Now triggered! Auction ended.',
        };
      }

      // Create bid object
      const bid = {
        id: this.generateBidId(),
        auctionId,
        userId,
        userName,
        amount,
        timestamp: new Date(),
        isBuyNow: false,
      };

      // Update auction state
      auctionState.currentPrice = amount;
      auctionState.totalBids += 1;
      auctionState.lastBid = {
        userId,
        userName,
        amount,
        timestamp: bid.timestamp,
      };

      // Auction type specific post-bid logic
      const extensionResult = await this.handlePostBidLogic(auctionState, bid);

      // Save updated state
      this.auctionStates.set(auctionId, auctionState);

      // Emit bid placed event
      this.eventEmitter.emit('auction.bidPlaced', {
        auctionId,
        bid,
        auctionState,
        auctionType: auctionState.auctionType,
      });

      // Log successful bid
      this.logger.log(`Bid placed: ₹${amount} by ${userName} on ${auctionState.auctionType} auction ${auctionId}`);

      return {
        success: true,
        bid,
        auctionState,
        shouldExtend: extensionResult.shouldExtend,
        newEndTime: extensionResult.newEndTime,
      };

    } catch (error) {
      this.logger.error(`Bid placement error: ${error.message}`, error.stack);
      return {
        success: false,
        reason: 'internal_error',
        message: 'An error occurred while placing your bid. Please try again.',
      };
    }
  }

  private async validateBidForAuctionType(auctionState: AuctionState, bidRequest: BidRequest): Promise<{
    valid: boolean;
    reason?: string;
    message?: string;
  }> {
    const { userId } = bidRequest;

    switch (auctionState.auctionType) {
      case 'live':
        // Live auctions may require token deposit verification
        if (auctionState.requiresTokenDeposit) {
          // In real implementation, check if user has deposited tokens
          // For now, assume token deposit is required but we'll allow bids
          this.logger.log(`Live auction bid - token deposit would be required for user ${userId}`);
        }
        return { valid: true };

      case 'tender':
        // Tender auctions may require bidder qualification
        if (auctionState.minimumBidders && auctionState.activeUsers < auctionState.minimumBidders) {
          return {
            valid: false,
            reason: 'minimum_bidders_not_met',
            message: `Tender auction requires minimum ${auctionState.minimumBidders} bidders`,
          };
        }
        return { valid: true };

      case 'flash':
        // Flash auctions have rapid bidding, may have special rules
        return { valid: true };

      case 'timed':
      default:
        // Standard validation for timed auctions
        return { valid: true };
    }
  }

  private validateBidAmount(auctionState: AuctionState, amount: number): {
    valid: boolean;
    reason?: string;
    message?: string;
  } {
    // Validate bid amount
    if (amount <= auctionState.currentPrice) {
      return {
        valid: false,
        reason: 'bid_too_low',
        message: `Bid must be higher than current price of ₹${auctionState.currentPrice}`,
      };
    }

    // Get minimum increment based on auction type
    const minIncrement = this.getMinimumIncrement(auctionState.auctionType as any, auctionState.currentPrice);

    if (amount < auctionState.currentPrice + minIncrement) {
      return {
        valid: false,
        reason: 'bid_increment_too_small',
        message: `Minimum bid increment is ₹${minIncrement}`,
      };
    }

    return { valid: true };
  }

  private getMinimumIncrement(auctionType: AuctionType, currentPrice: number): number {
    switch (auctionType) {
      case 'flash':
        // Flash auctions have smaller increments for rapid bidding
        return Math.max(50, Math.floor(currentPrice * 0.01)); // 1% or ₹50 minimum

      case 'live':
        // Live auctions have standard increments
        return Math.max(100, Math.floor(currentPrice * 0.02)); // 2% or ₹100 minimum

      case 'tender':
        // Tender auctions often have fixed increments
        return 500; // Fixed ₹500 increment for business auctions

      case 'timed':
      default:
        // Standard timed auctions
        return Math.max(100, Math.floor(currentPrice * 0.05)); // 5% or ₹100 minimum
    }
  }

  private async handlePostBidLogic(auctionState: AuctionState, bid: any): Promise<{
    shouldExtend: boolean;
    newEndTime?: Date;
  }> {
    switch (auctionState.auctionType) {
      case 'timed':
        // Check for anti-sniping extension (simplified - no autoExtend in schema)
        if (auctionState.timeLeft <= (this.auctionConfigs.timed.triggerTime / 1000)) {
          // Extend auction
          const newEndTime = new Date(auctionState.endTime.getTime() + this.auctionConfigs.timed.extensionTime);
          auctionState.endTime = newEndTime;
          auctionState.isExtended = true;

          this.logger.log(`Anti-sniping triggered for timed auction ${auctionState.auctionId}. Extended by ${this.auctionConfigs.timed.extensionTime / 1000} seconds`);

          return {
            shouldExtend: true,
            newEndTime,
          };
        }
        break;

      case 'flash':
        // Flash auctions don't extend
        break;

      case 'live':
        // Live auctions may have different extension rules or real-time updates
        break;

      case 'tender':
        // Tender auctions may have different rules
        break;
    }

    return {
      shouldExtend: false,
    };
  }

  async startAuction(auctionId: string, adminId: string): Promise<{
    success: boolean;
    startTime?: Date;
    endTime?: Date;
    message?: string;
    error?: string;
  }> {
    try {
      const auctionState = await this.getAuctionState(auctionId);

      if (auctionState.status === 'active') {
        return {
          success: false,
          error: 'Auction is already active',
        };
      }

      // Update status
      auctionState.status = 'active';
      auctionState.endTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      this.auctionStates.set(auctionId, auctionState);

      // Set up auction timer
      this.scheduleAuctionEnd(auctionId);

      this.logger.log(`Auction ${auctionId} started by admin ${adminId}`);

      return {
        success: true,
        startTime: new Date(),
        endTime: auctionState.endTime,
        message: 'Auction started successfully',
      };

    } catch (error) {
      this.logger.error(`Start auction error: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async endAuction(auctionId: string, adminId: string, winnerUserId?: string): Promise<{
    success: boolean;
    winner?: any;
    finalPrice?: number;
    endTime?: Date;
    message?: string;
    error?: string;
  }> {
    try {
      const auctionState = await this.getAuctionState(auctionId);

      if (auctionState.status === 'ended') {
        return {
          success: false,
          error: 'Auction has already ended',
        };
      }

      // Update status
      auctionState.status = 'ended';
      auctionState.timeLeft = 0;

      this.auctionStates.set(auctionId, auctionState);

      // Clear any active timers
      if (this.activeTimers.has(auctionId)) {
        clearTimeout(this.activeTimers.get(auctionId));
        this.activeTimers.delete(auctionId);
      }

      // Determine winner
      let winner = null;
      if (auctionState.lastBid) {
        winner = {
          userId: winnerUserId || auctionState.lastBid.userId,
          userName: auctionState.lastBid.userName,
          winningBid: auctionState.lastBid.amount,
        };
      }

      // Emit auction ended event
      this.eventEmitter.emit('auction.ended', {
        auctionId,
        winner,
        finalPrice: winner ? winner.winningBid : auctionState.currentPrice,
        endTime: new Date(),
      });

      this.logger.log(`Auction ${auctionId} ended. Winner: ${winner ? winner.userName : 'No winner'}`);

      return {
        success: true,
        winner,
        finalPrice: winner ? winner.winningBid : auctionState.currentPrice,
        endTime: new Date(),
        message: 'Auction ended successfully',
      };

    } catch (error) {
      this.logger.error(`End auction error: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async pauseAuction(auctionId: string, adminId: string): Promise<{
    success: boolean;
    pauseTime?: Date;
    reason?: string;
    message?: string;
    error?: string;
  }> {
    try {
      const auctionState = await this.getAuctionState(auctionId);

      if (auctionState.status !== 'active') {
        return {
          success: false,
          error: 'Auction is not currently active',
        };
      }

      // Update status
      auctionState.status = 'paused';

      this.auctionStates.set(auctionId, auctionState);

      // Clear active timer
      if (this.activeTimers.has(auctionId)) {
        clearTimeout(this.activeTimers.get(auctionId));
        this.activeTimers.delete(auctionId);
      }

      this.logger.log(`Auction ${auctionId} paused by admin ${adminId}`);

      return {
        success: true,
        pauseTime: new Date(),
        reason: 'Administrative pause',
        message: 'Auction paused successfully',
      };

    } catch (error) {
      this.logger.error(`Pause auction error: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private scheduleAuctionEnd(auctionId: string) {
    const auctionState = this.auctionStates.get(auctionId);
    if (!auctionState) return;

    const timeLeft = auctionState.endTime.getTime() - Date.now();

    if (timeLeft > 0) {
      const timer = setTimeout(async () => {
        await this.endAuction(auctionId, 'system');
      }, timeLeft);

      this.activeTimers.set(auctionId, timer);
    }
  }

  private generateBidId(): string {
    return `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Admin methods for monitoring
  async getActiveAuctions(): Promise<AuctionState[]> {
    const activeAuctions: AuctionState[] = [];

    for (const [auctionId, state] of this.auctionStates.entries()) {
      if (state.status === 'active') {
        // Update time left
        state.timeLeft = Math.max(0, Math.floor((state.endTime.getTime() - Date.now()) / 1000));
        activeAuctions.push(state);
      }
    }

    return activeAuctions;
  }

  async getAuctionStats(auctionId: string): Promise<any> {
    const state = await this.getAuctionState(auctionId);
    return {
      auctionId,
      status: state.status,
      currentPrice: state.currentPrice,
      totalBids: state.totalBids,
      timeLeft: state.timeLeft,
      isExtended: state.isExtended,
      lastBid: state.lastBid,
    };
  }

  async createAuction(auctionData: Partial<Auction>): Promise<Auction> {
    const data = {
      title: auctionData.title || '',
      productId: auctionData.productId || '',
      sellerId: auctionData.sellerId || '',
      startPrice: auctionData.startPrice || 0,
      currentBid: auctionData.currentBid || auctionData.startPrice || 0,
      endTime: auctionData.endTime || new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      status: auctionData.status || 'draft',
    };

    return await this.prisma.auction.create({
      data,
    });
  }

  async getAuctionsByType(status: string): Promise<Auction[]> {
    return await this.prisma.auction.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateAuctionSettings(auctionId: string, settings: any): Promise<Auction> {
    throw new BadRequestException('Auction settings not supported in current schema');
  }
}
