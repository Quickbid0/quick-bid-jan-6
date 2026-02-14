import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { Auction } from '@prisma/client';
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
    timeLeft: number;
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
export declare class AuctionsService {
    private eventEmitter;
    private prisma;
    private readonly logger;
    private auctionStates;
    private activeTimers;
    private auctionConfigs;
    constructor(eventEmitter: EventEmitter2, prisma: PrismaService);
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
export {};
