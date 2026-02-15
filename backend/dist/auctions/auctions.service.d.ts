import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
export interface AuctionState {
    auctionId: string;
    status: 'waiting' | 'active' | 'paused' | 'ended';
    currentPrice: number;
    startPrice: number;
    endTime: Date;
    timeLeft: number;
    totalBids: number;
    activeUsers: number;
    isExtended: boolean;
    auctionType: 'timed' | 'live' | 'flash' | 'tender';
    requiresTokenDeposit: boolean;
    minimumBidders: number;
    buyNowPrice?: number;
    lastBid?: {
        userId: string;
        userName: string;
        amount: number;
        timestamp: Date;
    };
}
export interface BidRequest {
    auctionId: string;
    userId: string;
    amount: number;
    userName: string;
}
export interface Auction {
    id: string;
    title: string;
    productId: string;
    sellerId: string;
    startPrice: number;
    currentBid: number;
    endTime: Date;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
export type AuctionType = 'timed' | 'live' | 'flash' | 'tender';
export interface AuctionConfig {
    timed: {
        triggerTime: number;
        extensionTime: number;
    };
    live: {
        tokenDepositRequired: boolean;
        minimumDeposit: number;
    };
    flash: {
        rapidBidding: boolean;
        minimumIncrement: number;
    };
    tender: {
        minimumBidders: number;
        qualificationRequired: boolean;
    };
}
export declare class AuctionsService {
    private prisma;
    private walletService;
    private eventEmitter;
    private readonly logger;
    private auctionStates;
    private activeTimers;
    private auctionConfigs;
    constructor(prisma: PrismaService, walletService: WalletService, eventEmitter: EventEmitter2);
    getAuctionState(auctionId: string): Promise<AuctionState>;
    private mapAuctionStatus;
    placeBid(bidRequest: BidRequest): Promise<{
        success: boolean;
        bid?: any;
        auctionState?: AuctionState;
        shouldExtend?: boolean;
        newEndTime?: Date;
        reason?: string;
        message?: string;
    }>;
    private validateBidForAuctionType;
    private validateBidAmount;
    private getMinimumIncrement;
    private handlePostBidLogic;
    startAuction(auctionId: string, adminId: string): Promise<{
        success: boolean;
        startTime?: Date;
        endTime?: Date;
        message?: string;
        error?: string;
    }>;
    endAuction(auctionId: string, adminId: string, winnerUserId?: string): Promise<{
        success: boolean;
        winner?: any;
        finalPrice?: number;
        endTime?: Date;
        message?: string;
        error?: string;
    }>;
    pauseAuction(auctionId: string, adminId: string): Promise<{
        success: boolean;
        pauseTime?: Date;
        reason?: string;
        message?: string;
        error?: string;
    }>;
    private scheduleAuctionEnd;
    private generateBidId;
    getActiveAuctions(): Promise<AuctionState[]>;
    getAuctionStats(auctionId: string): Promise<any>;
    createAuction(auctionData: Partial<Auction>): Promise<Auction>;
    getAuctionsByType(status: string): Promise<Auction[]>;
    updateAuctionSettings(auctionId: string, settings: any): Promise<Auction>;
}
