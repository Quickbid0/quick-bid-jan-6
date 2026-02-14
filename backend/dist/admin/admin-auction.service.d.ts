import { AuctionsService } from '../auctions/auctions.service';
import { PaymentService } from '../payments/payment.service';
interface AuctionMonitoringData {
    auctionId: string;
    status: 'waiting' | 'active' | 'paused' | 'ended';
    currentPrice: number;
    totalBids: number;
    activeUsers: number;
    timeLeft: number;
    lastBid?: {
        userId: string;
        amount: number;
        timestamp: Date;
    };
    issues: string[];
    riskLevel: 'low' | 'medium' | 'high';
}
interface SettlementData {
    auctionId: string;
    winnerId: string;
    winnerName: string;
    finalPrice: number;
    sellerId: string;
    sellerName: string;
    platformFee: number;
    sellerPayout: number;
    paymentStatus: 'pending' | 'processing' | 'completed' | 'failed';
    settlementDate?: Date;
}
export declare class AdminAuctionService {
    private readonly auctionsService;
    private readonly paymentService;
    private readonly logger;
    constructor(auctionsService: AuctionsService, paymentService: PaymentService);
    getAuctionMonitoring(status?: string): Promise<{
        success: boolean;
        data: AuctionMonitoringData[];
        summary: {
            totalAuctions: number;
            activeAuctions: number;
            totalRevenue: number;
            issuesCount: number;
            highRiskCount: number;
        };
    }>;
    getSettlements(status?: string, limit?: number): Promise<{
        success: boolean;
        data: SettlementData[];
        summary: {
            totalSettlements: number;
            pendingPayments: number;
            totalRevenue: number;
            monthlyRevenue: number;
        };
    }>;
    getAuctionDetails(auctionId: string): Promise<{
        success: boolean;
        auction: any;
        bids: any[];
        participants: any[];
        issues: string[];
        recommendations: string[];
    }>;
    performAdminAction(actionRequest: {
        auctionId: string;
        action: 'start' | 'pause' | 'resume' | 'end' | 'extend' | 'cancel';
        reason?: string;
        parameters?: Record<string, any>;
    }): Promise<{
        success: boolean;
        message: string;
        auctionState?: any;
    }>;
    processSettlement(auctionId: string, notes?: string): Promise<{
        success: boolean;
        settlement: SettlementData;
        message: string;
    }>;
    getAnalyticsOverview(period?: string): Promise<{
        success: boolean;
        analytics: {
            totalAuctions: number;
            totalRevenue: number;
            averageBidAmount: number;
            conversionRate: number;
            topCategories: any[];
            revenueByDay: any[];
            userEngagement: any;
            fraudIndicators: any[];
        };
    }>;
    getFraudMonitoring(): Promise<{
        success: boolean;
        alerts: any[];
        suspiciousActivities: any[];
        riskMetrics: any;
    }>;
    performEmergencyAction(action: {
        action: 'pause_all' | 'resume_all' | 'shutdown' | 'maintenance_mode';
        reason: string;
        duration?: number;
    }): Promise<{
        success: boolean;
        message: string;
        affectedAuctions: number;
    }>;
    getSystemHealth(): Promise<{
        success: boolean;
        health: {
            websocketConnections: number;
            activeAuctions: number;
            pendingSettlements: number;
            systemLoad: number;
            errorRate: number;
            responseTime: number;
            services: any[];
        };
    }>;
    private detectAuctionIssues;
    private calculateRiskLevel;
    private generateRecommendations;
    private generateMockSettlements;
    private generateMockBids;
    private generateMockParticipants;
    private generateRevenueByDay;
}
export {};
