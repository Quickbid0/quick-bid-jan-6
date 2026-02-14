import { EventEmitter2 } from '@nestjs/event-emitter';
export interface WalletTransaction {
    id: string;
    userId: string;
    amount: number;
    type: 'credit' | 'debit' | 'hold' | 'release';
    purpose: 'wallet_topup' | 'bid_placement' | 'bid_refund' | 'auction_win' | 'auction_payout' | 'security_deposit' | 'commission' | 'penalty' | 'refund';
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    referenceId?: string;
    referenceType?: string;
    description: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export interface WalletBalance {
    userId: string;
    availableBalance: number;
    heldBalance: number;
    totalBalance: number;
    currency: string;
    lastUpdated: Date;
}
export interface RefundRequest {
    userId: string;
    amount: number;
    reason: string;
    referenceId?: string;
    referenceType?: string;
    originalTransactionId?: string;
}
export declare class WalletService {
    private eventEmitter;
    private readonly logger;
    constructor(eventEmitter: EventEmitter2);
    getBalance(userId: string): Promise<WalletBalance>;
    addFunds(userId: string, amount: number, purpose?: WalletTransaction['purpose'], referenceId?: string, referenceType?: string, description?: string, metadata?: Record<string, any>): Promise<{
        success: boolean;
        transactionId: string;
        newBalance: WalletBalance;
    }>;
    deductFunds(userId: string, amount: number, purpose?: WalletTransaction['purpose'], referenceId?: string, referenceType?: string, description?: string, metadata?: Record<string, any>): Promise<{
        success: boolean;
        transactionId: string;
        newBalance: WalletBalance;
    }>;
    holdFunds(userId: string, amount: number, purpose: WalletTransaction['purpose'], referenceId?: string, referenceType?: string, description?: string, metadata?: Record<string, any>): Promise<{
        success: boolean;
        transactionId: string;
        newBalance: WalletBalance;
    }>;
    releaseFunds(userId: string, amount: number, originalTransactionId: string, description?: string, metadata?: Record<string, any>): Promise<{
        success: boolean;
        transactionId: string;
        newBalance: WalletBalance;
    }>;
    processRefund(refundRequest: RefundRequest): Promise<{
        success: boolean;
        transactionId: string;
        newBalance: WalletBalance;
    }>;
    processAuctionSettlement(auctionId: string, winnerId: string, sellerId: string, finalPrice: number, platformFeePercent?: number): Promise<{
        success: boolean;
        winnerTransactionId: string;
        sellerTransactionId: string;
        platformFee: number;
        sellerPayout: number;
    }>;
    refundAuctionBids(auctionId: string, bidDetails: Array<{
        userId: string;
        amount: number;
        bidId: string;
    }>): Promise<{
        success: boolean;
        refundedCount: number;
        totalRefunded: number;
        failedRefunds: Array<{
            userId: string;
            amount: number;
            error: string;
        }>;
    }>;
    getTransactionHistory(userId: string, limit?: number, offset?: number, type?: WalletTransaction['type'], purpose?: WalletTransaction['purpose']): Promise<{
        transactions: WalletTransaction[];
        totalCount: number;
        hasMore: boolean;
    }>;
    getWalletStats(userId: string): Promise<{
        totalCredits: number;
        totalDebits: number;
        netFlow: number;
        transactionCount: number;
        averageTransaction: number;
        lastTransactionDate?: Date;
    }>;
    private updateWalletBalance;
    private generateTransactionId;
    private getTransactionDescription;
    private recordPlatformFee;
}
