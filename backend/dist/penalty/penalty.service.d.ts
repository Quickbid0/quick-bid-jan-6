import { EventEmitter2 } from '@nestjs/event-emitter';
export interface Penalty {
    id: string;
    sellerId: string;
    type: PenaltyType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    amount: number;
    status: 'active' | 'expired' | 'appealed' | 'waived';
    createdAt: Date;
    expiresAt: Date;
    resolvedAt?: Date;
    appealReason?: string;
    appealStatus?: 'pending' | 'approved' | 'rejected';
    evidence?: string[];
    relatedAuctionId?: string;
    relatedBidId?: string;
    automated: boolean;
}
export interface Cooldown {
    id: string;
    sellerId: string;
    type: CooldownType;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    reason: string;
    triggeredBy: string;
    appealable: boolean;
}
export interface RiskScore {
    sellerId: string;
    overallScore: number;
    componentScores: {
        delivery: number;
        quality: number;
        behavior: number;
        compliance: number;
    };
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    factors: RiskFactor[];
    lastCalculated: Date;
    trend: 'improving' | 'stable' | 'declining';
}
export interface RiskFactor {
    type: string;
    description: string;
    impact: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    occurredAt: Date;
    resolvedAt?: Date;
}
export type PenaltyType = 'late_delivery' | 'non_delivery' | 'fake_product' | 'misdescription' | 'poor_quality' | 'fraud' | 'multiple_violations' | 'spam_listing' | 'inappropriate_content' | 'payment_dispute' | 'buyer_complaint' | 'system_abuse';
export type CooldownType = 'listing_ban' | 'auction_ban' | 'account_suspension' | 'feature_restriction' | 'review_required';
export declare class PenaltyService {
    private eventEmitter;
    private readonly logger;
    constructor(eventEmitter: EventEmitter2);
    private readonly penaltyRules;
    calculateRiskScore(sellerId: string): Promise<RiskScore>;
    applyPenalty(sellerId: string, type: PenaltyType, details: {
        description: string;
        relatedAuctionId?: string;
        relatedBidId?: string;
        evidence?: string[];
        reportedBy?: string;
        severity?: Penalty['severity'];
    }): Promise<Penalty>;
    applyCooldown(sellerId: string, type: CooldownType, durationDays: number, reason: string, triggeredBy?: string, appealable?: boolean): Promise<Cooldown>;
    checkSellerPermissions(sellerId: string): Promise<{
        canListProducts: {
            allowed: boolean;
            reason?: string;
            cooldownEnd?: Date;
        };
        canParticipateInAuctions: {
            allowed: boolean;
            reason?: string;
            cooldownEnd?: Date;
        };
        canReceivePayments: {
            allowed: boolean;
            reason?: string;
        };
        restrictions: string[];
    }>;
    getActivePenalties(sellerId: string): Promise<Penalty[]>;
    getActiveCooldowns(sellerId: string): Promise<Cooldown[]>;
    getPenaltyHistory(sellerId: string, days?: number): Promise<Penalty[]>;
    appealPenalty(penaltyId: string, appealReason: string, evidence?: string[]): Promise<{
        success: boolean;
        message: string;
    }>;
    private calculateDeliveryScore;
    private calculateQualityScore;
    private calculateBehaviorScore;
    private calculateComplianceScore;
    private getPenaltyImpact;
    private getRiskLevel;
    private identifyRiskFactors;
    private calculateTrend;
    private calculatePenaltyAmount;
    private applyCooldownFromPenalty;
    private getCooldownSeverity;
    private getActiveCooldownByType;
    private getSellerPerformanceMetrics;
    private getPreviousRiskScore;
    private generatePenaltyId;
    private generateCooldownId;
    private storePenalty;
    private storeCooldown;
    private updateCooldown;
    private storeRiskScore;
}
