import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
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
  automated: boolean; // Whether this was auto-generated
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
  triggeredBy: string; // penalty_id or 'system'
  appealable: boolean;
}

export interface RiskScore {
  sellerId: string;
  overallScore: number; // 0-100, lower is better
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
  impact: number; // Points deducted from score
  severity: 'low' | 'medium' | 'high' | 'critical';
  occurredAt: Date;
  resolvedAt?: Date;
}

export type PenaltyType =
  | 'late_delivery'
  | 'non_delivery'
  | 'fake_product'
  | 'misdescription'
  | 'poor_quality'
  | 'fraud'
  | 'multiple_violations'
  | 'spam_listing'
  | 'inappropriate_content'
  | 'payment_dispute'
  | 'buyer_complaint'
  | 'system_abuse';

export type CooldownType =
  | 'listing_ban'
  | 'auction_ban'
  | 'account_suspension'
  | 'feature_restriction'
  | 'review_required';

interface PenaltyRule {
  type: PenaltyType;
  severity: Penalty['severity'];
  baseAmount: number;
  durationDays: number;
  triggersCooldown: boolean;
  cooldownType?: CooldownType;
  cooldownDays?: number;
  description: string;
}

@Injectable()
export class PenaltyService {
  private readonly logger = new Logger(PenaltyService.name);

  constructor(private eventEmitter: EventEmitter2) {}

  private readonly penaltyRules: Record<PenaltyType, PenaltyRule> = {
    late_delivery: {
      type: 'late_delivery',
      severity: 'low',
      baseAmount: 500,
      durationDays: 30,
      triggersCooldown: false,
      description: 'Late delivery of auction item',
    },
    non_delivery: {
      type: 'non_delivery',
      severity: 'high',
      baseAmount: 2000,
      durationDays: 90,
      triggersCooldown: true,
      cooldownType: 'listing_ban',
      cooldownDays: 7,
      description: 'Failure to deliver auction item',
    },
    fake_product: {
      type: 'fake_product',
      severity: 'critical',
      baseAmount: 5000,
      durationDays: 180,
      triggersCooldown: true,
      cooldownType: 'listing_ban',
      cooldownDays: 30,
      description: 'Selling counterfeit or fake products',
    },
    misdescription: {
      type: 'misdescription',
      severity: 'medium',
      baseAmount: 1000,
      durationDays: 60,
      triggersCooldown: false,
      description: 'Product description does not match actual item',
    },
    poor_quality: {
      type: 'poor_quality',
      severity: 'medium',
      baseAmount: 1500,
      durationDays: 45,
      triggersCooldown: false,
      description: 'Product quality significantly below expectations',
    },
    fraud: {
      type: 'fraud',
      severity: 'critical',
      baseAmount: 10000,
      durationDays: 365,
      triggersCooldown: true,
      cooldownType: 'account_suspension',
      cooldownDays: 90,
      description: 'Fraudulent activity or scam',
    },
    multiple_violations: {
      type: 'multiple_violations',
      severity: 'high',
      baseAmount: 3000,
      durationDays: 120,
      triggersCooldown: true,
      cooldownType: 'auction_ban',
      cooldownDays: 14,
      description: 'Multiple policy violations within short period',
    },
    spam_listing: {
      type: 'spam_listing',
      severity: 'medium',
      baseAmount: 800,
      durationDays: 30,
      triggersCooldown: true,
      cooldownType: 'feature_restriction',
      cooldownDays: 3,
      description: 'Creating spam or duplicate listings',
    },
    inappropriate_content: {
      type: 'inappropriate_content',
      severity: 'high',
      baseAmount: 2500,
      durationDays: 60,
      triggersCooldown: true,
      cooldownType: 'listing_ban',
      cooldownDays: 7,
      description: 'Inappropriate or prohibited content in listings',
    },
    payment_dispute: {
      type: 'payment_dispute',
      severity: 'medium',
      baseAmount: 1200,
      durationDays: 45,
      triggersCooldown: false,
      description: 'Disputed payment or transaction issues',
    },
    buyer_complaint: {
      type: 'buyer_complaint',
      severity: 'low',
      baseAmount: 300,
      durationDays: 15,
      triggersCooldown: false,
      description: 'Buyer complaint or dissatisfaction',
    },
    system_abuse: {
      type: 'system_abuse',
      severity: 'high',
      baseAmount: 4000,
      durationDays: 90,
      triggersCooldown: true,
      cooldownType: 'feature_restriction',
      cooldownDays: 14,
      description: 'Abusing platform systems or features',
    },
  };

  /**
   * Calculate comprehensive risk score for a seller
   */
  async calculateRiskScore(sellerId: string): Promise<RiskScore> {
    try {
      // Get all penalties and activity data
      const activePenalties = await this.getActivePenalties(sellerId);
      const penaltyHistory = await this.getPenaltyHistory(sellerId, 90); // Last 90 days
      const performanceMetrics = await this.getSellerPerformanceMetrics(sellerId);

      // Calculate component scores
      const deliveryScore = this.calculateDeliveryScore(penaltyHistory, performanceMetrics);
      const qualityScore = this.calculateQualityScore(penaltyHistory, performanceMetrics);
      const behaviorScore = this.calculateBehaviorScore(penaltyHistory, performanceMetrics);
      const complianceScore = this.calculateComplianceScore(activePenalties, penaltyHistory);

      const componentScores = {
        delivery: deliveryScore,
        quality: qualityScore,
        behavior: behaviorScore,
        compliance: complianceScore,
      };

      // Calculate overall score (weighted average)
      const overallScore = Math.round(
        (deliveryScore * 0.3) +
        (qualityScore * 0.3) +
        (behaviorScore * 0.25) +
        (complianceScore * 0.15)
      );

      // Determine risk level
      const riskLevel = this.getRiskLevel(overallScore);

      // Identify risk factors
      const factors = this.identifyRiskFactors(sellerId, penaltyHistory, performanceMetrics);

      // Calculate trend
      const previousScore = await this.getPreviousRiskScore(sellerId);
      const trend = this.calculateTrend(overallScore, previousScore);

      const riskScore: RiskScore = {
        sellerId,
        overallScore,
        componentScores,
        riskLevel,
        factors,
        lastCalculated: new Date(),
        trend,
      };

      // Store risk score for trend analysis
      await this.storeRiskScore(riskScore);

      return riskScore;
    } catch (error) {
      this.logger.error(`Failed to calculate risk score for seller ${sellerId}:`, error);
      throw error;
    }
  }

  /**
   * Apply penalty based on violation type
   */
  async applyPenalty(
    sellerId: string,
    type: PenaltyType,
    details: {
      description: string;
      relatedAuctionId?: string;
      relatedBidId?: string;
      evidence?: string[];
      reportedBy?: string;
      severity?: Penalty['severity'];
    }
  ): Promise<Penalty> {
    try {
      const rule = this.penaltyRules[type];
      if (!rule) {
        throw new BadRequestException(`Unknown penalty type: ${type}`);
      }

      // Adjust severity if specified
      const severity = details.severity || rule.severity;

      // Calculate penalty amount based on severity and seller history
      const penaltyAmount = await this.calculatePenaltyAmount(sellerId, rule.baseAmount, severity);

      const penalty: Penalty = {
        id: this.generatePenaltyId(),
        sellerId,
        type,
        severity,
        description: details.description,
        amount: penaltyAmount,
        status: 'active',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + (rule.durationDays * 24 * 60 * 60 * 1000)),
        relatedAuctionId: details.relatedAuctionId,
        relatedBidId: details.relatedBidId,
        evidence: details.evidence,
        automated: !details.reportedBy, // Automated if no reporter specified
      };

      // Store penalty
      await this.storePenalty(penalty);

      // Apply cooldown if required
      if (rule.triggersCooldown) {
        await this.applyCooldownFromPenalty(penalty, rule);
      }

      // Update seller's risk score
      await this.calculateRiskScore(sellerId);

      // Emit penalty event
      this.eventEmitter.emit('penalty.applied', {
        penalty,
        sellerId,
        type,
        amount: penaltyAmount,
      });

      this.logger.log(`Penalty applied to seller ${sellerId}: ${type} - ₹${penaltyAmount}`);

      return penalty;
    } catch (error) {
      this.logger.error(`Failed to apply penalty to seller ${sellerId}:`, error);
      throw error;
    }
  }

  /**
   * Apply cooldown restriction
   */
  async applyCooldown(
    sellerId: string,
    type: CooldownType,
    durationDays: number,
    reason: string,
    triggeredBy: string = 'system',
    appealable: boolean = true
  ): Promise<Cooldown> {
    try {
      // Check for existing active cooldown of same type
      const existingCooldown = await this.getActiveCooldownByType(sellerId, type);
      if (existingCooldown) {
        // Extend existing cooldown instead of creating new one
        existingCooldown.endDate = new Date(Math.max(
          existingCooldown.endDate.getTime(),
          Date.now() + (durationDays * 24 * 60 * 60 * 1000)
        ));
        existingCooldown.description = `${existingCooldown.description} (Extended: ${reason})`;
        await this.updateCooldown(existingCooldown);
        return existingCooldown;
      }

      const cooldown: Cooldown = {
        id: this.generateCooldownId(),
        sellerId,
        type,
        severity: this.getCooldownSeverity(type),
        description: reason,
        startDate: new Date(),
        endDate: new Date(Date.now() + (durationDays * 24 * 60 * 60 * 1000)),
        isActive: true,
        reason,
        triggeredBy,
        appealable,
      };

      await this.storeCooldown(cooldown);

      // Emit cooldown event
      this.eventEmitter.emit('cooldown.applied', {
        cooldown,
        sellerId,
        type,
        durationDays,
      });

      this.logger.log(`Cooldown applied to seller ${sellerId}: ${type} for ${durationDays} days`);

      return cooldown;
    } catch (error) {
      this.logger.error(`Failed to apply cooldown to seller ${sellerId}:`, error);
      throw error;
    }
  }

  /**
   * Check if seller can perform specific actions
   */
  async checkSellerPermissions(sellerId: string): Promise<{
    canListProducts: { allowed: boolean; reason?: string; cooldownEnd?: Date };
    canParticipateInAuctions: { allowed: boolean; reason?: string; cooldownEnd?: Date };
    canReceivePayments: { allowed: boolean; reason?: string };
    restrictions: string[];
  }> {
    try {
      const activeCooldowns = await this.getActiveCooldowns(sellerId);
      const activePenalties = await this.getActivePenalties(sellerId);
      const riskScore = await this.calculateRiskScore(sellerId);

      const restrictions: string[] = [];

      // Check listing restrictions
      const listingBan = activeCooldowns.find(c => c.type === 'listing_ban');
      const accountSuspension = activeCooldowns.find(c => c.type === 'account_suspension');

      const canListProducts = {
        allowed: !listingBan && !accountSuspension,
        reason: listingBan ? listingBan.description : accountSuspension ? accountSuspension.description : undefined,
        cooldownEnd: listingBan?.endDate || accountSuspension?.endDate,
      };

      // Check auction participation restrictions
      const auctionBan = activeCooldowns.find(c => c.type === 'auction_ban');

      const canParticipateInAuctions = {
        allowed: !auctionBan && !accountSuspension && riskScore.riskLevel !== 'critical',
        reason: auctionBan ? auctionBan.description :
                accountSuspension ? accountSuspension.description :
                riskScore.riskLevel === 'critical' ? 'High risk account - auction participation restricted' : undefined,
        cooldownEnd: auctionBan?.endDate || accountSuspension?.endDate,
      };

      // Check payment restrictions
      const canReceivePayments = {
        allowed: !accountSuspension && activePenalties.filter(p => p.severity === 'critical').length === 0,
        reason: accountSuspension ? 'Account suspended' :
                activePenalties.some(p => p.severity === 'critical') ? 'Critical violations prevent payment processing' : undefined,
      };

      // Collect all restrictions
      if (!canListProducts.allowed) {
        restrictions.push(`Product listing restricted until ${canListProducts.cooldownEnd?.toLocaleDateString()}`);
      }
      if (!canParticipateInAuctions.allowed) {
        restrictions.push(`Auction participation restricted until ${canParticipateInAuctions.cooldownEnd?.toLocaleDateString()}`);
      }
      if (!canReceivePayments.allowed) {
        restrictions.push('Payment processing restricted');
      }

      return {
        canListProducts,
        canParticipateInAuctions,
        canReceivePayments,
        restrictions,
      };
    } catch (error) {
      this.logger.error(`Failed to check permissions for seller ${sellerId}:`, error);
      throw error;
    }
  }

  /**
   * Get active penalties for a seller
   */
  async getActivePenalties(sellerId: string): Promise<Penalty[]> {
    // In production, query database
    // For now, return mock data
    return [
      {
        id: 'pen_001',
        sellerId,
        type: 'late_delivery',
        severity: 'low',
        description: 'Late delivery of auction item',
        amount: 500,
        status: 'active',
        createdAt: new Date(Date.now() - 86400000),
        expiresAt: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
        automated: true,
      },
    ];
  }

  /**
   * Get active cooldowns for a seller
   */
  async getActiveCooldowns(sellerId: string): Promise<Cooldown[]> {
    // In production, query database
    // For now, return mock data
    return [];
  }

  /**
   * Get penalty history for analysis
   */
  async getPenaltyHistory(sellerId: string, days: number = 90): Promise<Penalty[]> {
    // In production, query database with date filter
    return await this.getActivePenalties(sellerId); // Mock implementation
  }

  /**
   * Appeal a penalty or cooldown
   */
  async appealPenalty(
    penaltyId: string,
    appealReason: string,
    evidence?: string[]
  ): Promise<{ success: boolean; message: string }> {
    try {
      // In production, update penalty with appeal information
      // For now, mock successful appeal submission

      this.logger.log(`Penalty appeal submitted for penalty ${penaltyId}: ${appealReason}`);

      return {
        success: true,
        message: 'Appeal submitted successfully. You will be notified of the decision within 5-7 business days.',
      };
    } catch (error) {
      this.logger.error(`Failed to submit appeal for penalty ${penaltyId}:`, error);
      throw error;
    }
  }

  // Private helper methods

  private calculateDeliveryScore(penaltyHistory: Penalty[], metrics: any): number {
    const deliveryPenalties = penaltyHistory.filter(p =>
      ['late_delivery', 'non_delivery'].includes(p.type)
    );

    let score = 100;
    deliveryPenalties.forEach(penalty => {
      score -= this.getPenaltyImpact(penalty);
    });

    // Factor in on-time delivery rate (mock)
    const onTimeDeliveryRate = metrics.onTimeDeliveryRate || 0.95;
    score = score * onTimeDeliveryRate;

    return Math.max(0, Math.min(100, score));
  }

  private calculateQualityScore(penaltyHistory: Penalty[], metrics: any): number {
    const qualityPenalties = penaltyHistory.filter(p =>
      ['fake_product', 'misdescription', 'poor_quality'].includes(p.type)
    );

    let score = 100;
    qualityPenalties.forEach(penalty => {
      score -= this.getPenaltyImpact(penalty);
    });

    return Math.max(0, Math.min(100, score));
  }

  private calculateBehaviorScore(penaltyHistory: Penalty[], metrics: any): number {
    const behaviorPenalties = penaltyHistory.filter(p =>
      ['fraud', 'system_abuse', 'inappropriate_content'].includes(p.type)
    );

    let score = 100;
    behaviorPenalties.forEach(penalty => {
      score -= this.getPenaltyImpact(penalty);
    });

    return Math.max(0, Math.min(100, score));
  }

  private calculateComplianceScore(activePenalties: Penalty[], penaltyHistory: Penalty[]): number {
    const compliancePenalties = penaltyHistory.filter(p =>
      ['multiple_violations', 'spam_listing'].includes(p.type)
    );

    let score = 100;

    // Deduct for active penalties
    activePenalties.forEach(penalty => {
      score -= this.getPenaltyImpact(penalty);
    });

    // Additional deduction for frequent violations
    if (penaltyHistory.length > 5) {
      score -= 10;
    }
    if (penaltyHistory.length > 10) {
      score -= 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  private getPenaltyImpact(penalty: Penalty): number {
    const severityMultipliers = {
      low: 2,
      medium: 5,
      high: 10,
      critical: 25,
    };

    return severityMultipliers[penalty.severity];
  }

  private getRiskLevel(score: number): RiskScore['riskLevel'] {
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'high';
    return 'critical';
  }

  private identifyRiskFactors(sellerId: string, penaltyHistory: Penalty[], metrics: any): RiskFactor[] {
    const factors: RiskFactor[] = [];

    // Add factors based on penalty history
    penaltyHistory.forEach(penalty => {
      factors.push({
        type: penalty.type,
        description: penalty.description,
        impact: this.getPenaltyImpact(penalty),
        severity: penalty.severity,
        occurredAt: penalty.createdAt,
      });
    });

    return factors;
  }

  private calculateTrend(currentScore: number, previousScore: number | null): RiskScore['trend'] {
    if (!previousScore) return 'stable';

    const difference = currentScore - previousScore;
    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  }

  private async calculatePenaltyAmount(sellerId: string, baseAmount: number, severity: Penalty['severity']): Promise<number> {
    // Adjust amount based on seller history and severity
    const penaltyHistory = await this.getPenaltyHistory(sellerId, 365); // Last year
    const historyMultiplier = Math.min(2, 1 + (penaltyHistory.length * 0.1)); // Max 2x multiplier

    const severityMultipliers = {
      low: 0.5,
      medium: 1,
      high: 1.5,
      critical: 2,
    };

    return Math.round(baseAmount * historyMultiplier * severityMultipliers[severity]);
  }

  private async applyCooldownFromPenalty(penalty: Penalty, rule: PenaltyRule): Promise<void> {
    if (rule.cooldownType && rule.cooldownDays) {
      await this.applyCooldown(
        penalty.sellerId,
        rule.cooldownType,
        rule.cooldownDays,
        `Automatic cooldown due to ${penalty.type} penalty`,
        penalty.id,
        true
      );
    }
  }

  private getCooldownSeverity(type: CooldownType): Cooldown['severity'] {
    const severityMap: Record<CooldownType, Cooldown['severity']> = {
      listing_ban: 'high',
      auction_ban: 'high',
      account_suspension: 'critical',
      feature_restriction: 'medium',
      review_required: 'low',
    };

    return severityMap[type];
  }

  private async getActiveCooldownByType(sellerId: string, type: CooldownType): Promise<Cooldown | null> {
    const activeCooldowns = await this.getActiveCooldowns(sellerId);
    return activeCooldowns.find(c => c.type === type) || null;
  }

  private async getSellerPerformanceMetrics(sellerId: string): Promise<any> {
    // In production, calculate from actual data
    return {
      onTimeDeliveryRate: 0.95,
      averageRating: 4.2,
      totalSales: 150,
      disputeRate: 0.02,
    };
  }

  private async getPreviousRiskScore(sellerId: string): Promise<number | null> {
    // In production, fetch from database
    return null;
  }

  private generatePenaltyId(): string {
    return `pen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCooldownId(): string {
    return `cool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Database operation mocks (replace with actual DB calls)
  private async storePenalty(penalty: Penalty): Promise<void> {
    this.logger.log(`Storing penalty: ${penalty.id}`);
  }

  private async storeCooldown(cooldown: Cooldown): Promise<void> {
    this.logger.log(`Storing cooldown: ${cooldown.id}`);
  }

  private async updateCooldown(cooldown: Cooldown): Promise<void> {
    this.logger.log(`Updating cooldown: ${cooldown.id}`);
  }

  private async storeRiskScore(riskScore: RiskScore): Promise<void> {
    this.logger.log(`Storing risk score for seller: ${riskScore.sellerId}`);
  }
}
