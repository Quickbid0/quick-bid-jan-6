import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Auction, AuctionType, AuctionStatus } from './auction.entity';

interface BidRequest {
  auctionId: string;
  userId: string;
  amount: number;
  userName: string;
}

export interface AuctionState {
  auctionId: string;
  auctionType: AuctionType;
  status: 'waiting' | 'active' | 'paused' | 'ended';
  currentPrice: number;
  startPrice: number;
  reservePrice?: number;
  buyNowPrice?: number;
  endTime: Date;
  totalBids: number;
  activeUsers: number;
  lastBid?: {
    userId: string;
    userName: string;
    amount: number;
    timestamp: Date;
  };
  timeLeft: number; // seconds
  isExtended: boolean;
  // Auction type specific data
  streamUrl?: string; // for live auctions
  requiresTokenDeposit?: boolean; // for live auctions
  autoExtend?: boolean; // for timed auctions
  minimumBidders?: number; // for tender auctions
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
    @InjectRepository(Auction)
    private auctionRepository: Repository<Auction>,
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
    const auction = await this.auctionRepository.findOne({ where: { id: auctionId } });
    if (!auction) {
      throw new NotFoundException(`Auction ${auctionId} not found`);
    }

    // Get auction type configuration
    const config = this.auctionConfigs[auction.auctionType];

    // Create auction state based on auction type
    const auctionState: AuctionState = {
      auctionId: auction.id,
      auctionType: auction.auctionType,
      status: this.mapAuctionStatus(auction.status),
      currentPrice: auction.currentPrice,
      startPrice: auction.startingPrice,
      reservePrice: auction.reservePrice,
      buyNowPrice: auction.buyNowPrice,
      endTime: auction.endTime,
      totalBids: auction.totalBids,
      activeUsers: auction.watchers,
      lastBid: auction.lastBid,
      timeLeft: Math.max(0, Math.floor((auction.endTime.getTime() - Date.now()) / 1000)),
      isExtended: false,
    };

    // Add auction type specific properties
    switch (auction.auctionType) {
      case 'live':
        auctionState.streamUrl = auction.auctionSettings?.streamUrl;
        auctionState.requiresTokenDeposit = (config as any).requiresTokenDeposit;
        break;
      case 'timed':
        auctionState.autoExtend = (config as any).autoExtend;
        break;
      case 'flash':
        // Flash auctions have fixed short duration
        break;
      case 'tender':
        auctionState.minimumBidders = (config as any).minimumBidders;
        break;
    }

    // Cache in memory
    this.auctionStates.set(auctionId, auctionState);

    return auctionState;
  }

  private mapAuctionStatus(dbStatus: AuctionStatus): AuctionState['status'] {
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
    const minIncrement = this.getMinimumIncrement(auctionState.auctionType, auctionState.currentPrice);

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
        // Check for anti-sniping extension
        if (auctionState.autoExtend &&
            auctionState.timeLeft <= (this.auctionConfigs.timed.triggerTime / 1000)) {
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
    const auction = this.auctionRepository.create(auctionData);

    // Validate auction type specific requirements
    this.validateAuctionCreation(auction);

    // Set default values based on auction type
    this.setAuctionDefaults(auction);

    return await this.auctionRepository.save(auction);
  }

  private validateAuctionCreation(auction: Auction): void {
    switch (auction.auctionType) {
      case 'live':
        if (!auction.auctionSettings?.streamUrl) {
          throw new BadRequestException('Live auctions require a stream URL');
        }
        break;

      case 'flash':
        // Flash auctions should have short duration
        const duration = (auction.endTime.getTime() - auction.startTime.getTime()) / (1000 * 60);
        if (duration > 60) { // Max 1 hour for flash auctions
          throw new BadRequestException('Flash auctions must be 60 minutes or less');
        }
        break;

      case 'tender':
        if (!auction.auctionSettings?.qualificationCriteria) {
          throw new BadRequestException('Tender auctions require qualification criteria');
        }
        break;

      case 'timed':
      default:
        // Standard validation
        break;
    }
  }

  private setAuctionDefaults(auction: Auction): void {
    const config = this.auctionConfigs[auction.auctionType];

    // Set default auction settings based on type
    if (!auction.auctionSettings) {
      auction.auctionSettings = {};
    }

    switch (auction.auctionType) {
      case 'live':
        auction.auctionSettings.requiresTokenDeposit = (config as any).requiresTokenDeposit;
        auction.auctionSettings.tokenDepositAmount = (config as any).tokenDepositAmount;
        break;

      case 'timed':
        auction.auctionSettings.autoExtend = (config as any).autoExtend;
        auction.auctionSettings.extendMinutes = (config as any).extensionTime / (60 * 1000);
        break;

      case 'flash':
        auction.auctionSettings.durationMinutes = (config as any).durationMinutes;
        break;

      case 'tender':
        auction.auctionSettings.minimumBidders = (config as any).minimumBidders;
        break;
    }

    // Set default increment if not specified
    if (!auction.incrementAmount) {
      auction.incrementAmount = this.getMinimumIncrement(auction.auctionType, auction.startingPrice);
    }

    // Set status to draft if not specified
    if (!auction.status) {
      auction.status = 'draft';
    }
  }

  async getAuctionsByType(auctionType: AuctionType): Promise<Auction[]> {
    return await this.auctionRepository.find({
      where: { auctionType },
      order: { createdAt: 'DESC' },
    });
  }

  async updateAuctionSettings(auctionId: string, settings: any): Promise<Auction> {
    const auction = await this.auctionRepository.findOne({ where: { id: auctionId } });
    if (!auction) {
      throw new NotFoundException(`Auction ${auctionId} not found`);
    }

    // Validate settings based on auction type
    this.validateAuctionSettings(auction.auctionType, settings);

    auction.auctionSettings = { ...auction.auctionSettings, ...settings };
    return await this.auctionRepository.save(auction);
  }

  private validateAuctionSettings(auctionType: AuctionType, settings: any): void {
    switch (auctionType) {
      case 'live':
        if (settings.streamUrl && !settings.streamUrl.startsWith('rtmp://') && !settings.streamUrl.startsWith('https://')) {
          throw new BadRequestException('Invalid stream URL format');
        }
        break;

      case 'flash':
        if (settings.durationMinutes && settings.durationMinutes > 60) {
          throw new BadRequestException('Flash auction duration cannot exceed 60 minutes');
        }
        break;

      case 'tender':
        if (settings.minimumBidders && settings.minimumBidders < 2) {
          throw new BadRequestException('Tender auctions require at least 2 minimum bidders');
        }
        break;
    }
  }
}
