import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

export interface ReputationScore {
  userId: string;
  overallScore: number;
  trustLevel: 'low' | 'medium' | 'high' | 'excellent';
  factors: {
    auctionParticipation: {
      score: number;
      totalAuctions: number;
      winRate: number;
      completionRate: number;
    };
    paymentReliability: {
      score: number;
      onTimePayments: number;
      totalPayments: number;
      disputeRate: number;
    };
    sellerPerformance: {
      score: number;
      averageRating: number;
      totalReviews: number;
      responseTime: number;
    };
    accountStanding: {
      score: number;
      accountAge: number; // days
      kycVerified: boolean;
      emailVerified: boolean;
    };
  };
  badges: string[];
  riskLevel: 'low' | 'medium' | 'high';
  lastCalculated: Date;
}

export interface AssetReputation {
  productId: string;
  sellerReputation: number;
  inspectionScore?: number;
  marketDemand: number;
  historicalPerformance: {
    averageBidCount: number;
    averageFinalPrice: number;
    timeToSell: number;
  };
  riskFactors: string[];
  recommendedPrice: {
    min: number;
    max: number;
    optimal: number;
  };
}

@Injectable()
export class ReputationService {
  private readonly logger = new Logger(ReputationService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async calculateUserReputation(userId: string): Promise<ReputationScore> {
    this.logger.log(`Calculating reputation score for user ${userId}`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profiles: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Calculate individual factor scores
    const auctionParticipation = await this.calculateAuctionParticipation(userId);
    const paymentReliability = await this.calculatePaymentReliability(userId);
    const sellerPerformance = await this.calculateSellerPerformance(userId);
    const accountStanding = this.calculateAccountStanding(user);

    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      (auctionParticipation.score * 0.3) +
      (paymentReliability.score * 0.4) +
      (sellerPerformance.score * 0.2) +
      (accountStanding.score * 0.1)
    );

    // Determine trust level
    const trustLevel = this.determineTrustLevel(overallScore);

    // Generate badges
    const badges = this.generateBadges(overallScore, auctionParticipation, paymentReliability);

    // Determine risk level
    const riskLevel = this.determineRiskLevel(overallScore, paymentReliability.disputeRate);

    const reputation: ReputationScore = {
      userId,
      overallScore,
      trustLevel,
      factors: {
        auctionParticipation,
        paymentReliability,
        sellerPerformance,
        accountStanding,
      },
      badges,
      riskLevel,
      lastCalculated: new Date(),
    };

    // Log reputation calculation
    await this.auditService.logActivity({
      userId,
      action: 'REPUTATION_CALCULATED',
      resource: 'reputation',
      category: 'system',
      severity: 'low',
      metadata: {
        overallScore,
        trustLevel,
        riskLevel,
        badges: badges.join(', '),
      },
    });

    return reputation;
  }

  async calculateAssetReputation(productId: string): Promise<AssetReputation> {
    this.logger.log(`Calculating asset reputation for product ${productId}`);

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        inspection: true,
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Get seller reputation
    const sellerReputation = await this.calculateUserReputation(product.sellerId);

    // Get inspection score if available
    const inspectionScore = product.inspection?.overallScore;

    // Calculate market demand (simulated)
    const marketDemand = await this.calculateMarketDemand(product.category, productId);

    // Get historical performance
    const historicalPerformance = await this.getHistoricalPerformance(product.category, product.price);

    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(product, sellerReputation, inspectionScore);

    // Calculate recommended price range
    const recommendedPrice = this.calculateRecommendedPrice(product, historicalPerformance, inspectionScore);

    return {
      productId,
      sellerReputation: sellerReputation.overallScore,
      inspectionScore,
      marketDemand,
      historicalPerformance,
      riskFactors,
      recommendedPrice,
    };
  }

  async getTopReputableUsers(limit: number = 50): Promise<Array<{
    userId: string;
    overallScore: number;
    trustLevel: string;
    badges: string[];
  }>> {
    // In a real implementation, this would query cached reputation scores
    // For now, return mock data
    return [
      { userId: 'user1', overallScore: 95, trustLevel: 'excellent', badges: ['Trusted Seller', 'Top Performer'] },
      { userId: 'user2', overallScore: 92, trustLevel: 'excellent', badges: ['Verified Buyer', 'Fast Payer'] },
      { userId: 'user3', overallScore: 88, trustLevel: 'high', badges: ['Reliable Seller', 'Quality Products'] },
      { userId: 'user4', overallScore: 85, trustLevel: 'high', badges: ['Trusted Buyer', 'Good History'] },
      { userId: 'user5', overallScore: 82, trustLevel: 'high', badges: ['Consistent Seller'] },
    ].slice(0, limit);
  }

  async getReputationStatistics(): Promise<{
    averageScore: number;
    distribution: {
      excellent: number;
      high: number;
      medium: number;
      low: number;
    };
    topPerformers: number;
    riskDistribution: {
      low: number;
      medium: number;
      high: number;
    };
  }> {
    // Mock statistics - would aggregate from database
    return {
      averageScore: 72.5,
      distribution: {
        excellent: 850,
        high: 2450,
        medium: 3800,
        low: 1200,
      },
      topPerformers: 150,
      riskDistribution: {
        low: 6800,
        medium: 1200,
        high: 400,
      },
    };
  }

  // Private helper methods
  private async calculateAuctionParticipation(userId: string): Promise<ReputationScore['factors']['auctionParticipation']> {
    // Simulate auction participation metrics
    // In real implementation, would query auction and bid tables
    const totalAuctions = Math.floor(Math.random() * 50) + 5;
    const completedAuctions = Math.floor(totalAuctions * 0.85);
    const wonAuctions = Math.floor(completedAuctions * 0.6);

    const winRate = totalAuctions > 0 ? (wonAuctions / totalAuctions) * 100 : 0;
    const completionRate = (completedAuctions / totalAuctions) * 100;

    // Calculate score based on participation
    let score = 50; // Base score
    score += Math.min(winRate, 30); // Up to 30 points for win rate
    score += Math.min(completionRate - 70, 20); // Bonus for high completion rate

    return {
      score: Math.min(100, Math.max(0, score)),
      totalAuctions,
      winRate: Math.round(winRate),
      completionRate: Math.round(completionRate),
    };
  }

  private async calculatePaymentReliability(userId: string): Promise<ReputationScore['factors']['paymentReliability']> {
    // Simulate payment reliability metrics
    const totalPayments = Math.floor(Math.random() * 30) + 3;
    const onTimePayments = Math.floor(totalPayments * 0.92);
    const disputes = Math.floor(Math.random() * 3); // 0-2 disputes

    const disputeRate = (disputes / totalPayments) * 100;

    // Calculate score based on payment reliability
    let score = 80; // Base score for having payment history
    score -= disputeRate * 5; // Penalty for disputes
    score += (onTimePayments / totalPayments) * 20; // Bonus for on-time payments

    return {
      score: Math.min(100, Math.max(0, score)),
      onTimePayments,
      totalPayments,
      disputeRate: Math.round(disputeRate * 100) / 100,
    };
  }

  private async calculateSellerPerformance(userId: string): Promise<ReputationScore['factors']['sellerPerformance']> {
    // Simulate seller performance metrics
    const totalReviews = Math.floor(Math.random() * 25) + 2;
    const averageRating = 4.2 + (Math.random() * 0.8); // 4.2-5.0 range
    const responseTime = Math.floor(Math.random() * 24) + 1; // 1-24 hours

    // Calculate score based on seller performance
    let score = averageRating * 20; // Rating out of 5, scaled to 100
    score -= Math.min(responseTime / 2, 10); // Penalty for slow response
    score += Math.min(totalReviews / 2, 15); // Bonus for review volume

    return {
      score: Math.min(100, Math.max(0, score)),
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      responseTime,
    };
  }

  private calculateAccountStanding(user: any): ReputationScore['factors']['accountStanding'] {
    const accountAge = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate score based on account standing
    let score = 60; // Base score
    score += Math.min(accountAge / 10, 20); // Up to 20 points for account age
    score += user.emailVerified ? 10 : 0; // Bonus for email verification
    score += user.profiles?.[0]?.isVerified ? 10 : 0; // Bonus for KYC verification

    return {
      score: Math.min(100, Math.max(0, score)),
      accountAge,
      kycVerified: user.profiles?.[0]?.isVerified || false,
      emailVerified: user.emailVerified === 'VERIFIED',
    };
  }

  private determineTrustLevel(score: number): ReputationScore['trustLevel'] {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  }

  private generateBadges(
    overallScore: number,
    auctionParticipation: any,
    paymentReliability: any
  ): string[] {
    const badges: string[] = [];

    if (overallScore >= 90) badges.push('Elite Member');
    if (auctionParticipation.winRate >= 70) badges.push('Winning Bidder');
    if (paymentReliability.disputeRate === 0) badges.push('Dispute-Free');
    if (auctionParticipation.totalAuctions >= 25) badges.push('Active Participant');
    if (paymentReliability.onTimePayments >= 10) badges.push('Reliable Payer');

    return badges;
  }

  private determineRiskLevel(score: number, disputeRate: number): ReputationScore['riskLevel'] {
    if (score >= 80 && disputeRate < 5) return 'low';
    if (score >= 60 && disputeRate < 15) return 'medium';
    return 'high';
  }

  private async calculateMarketDemand(category: string, productId: string): Promise<number> {
    // Simulate market demand calculation (0-100)
    return Math.floor(Math.random() * 40) + 60; // 60-100 range
  }

  private async getHistoricalPerformance(category: string, basePrice: number): Promise<AssetReputation['historicalPerformance']> {
    // Simulate historical performance data
    return {
      averageBidCount: Math.floor(Math.random() * 8) + 3, // 3-10 bids
      averageFinalPrice: basePrice * (0.9 + Math.random() * 0.4), // 90%-130% of base price
      timeToSell: Math.floor(Math.random() * 14) + 1, // 1-14 days
    };
  }

  private identifyRiskFactors(product: any, sellerReputation: ReputationScore, inspectionScore?: number): string[] {
    const risks: string[] = [];

    if (sellerReputation.overallScore < 60) {
      risks.push('Low seller reputation');
    }

    if (inspectionScore && inspectionScore < 70) {
      risks.push('Poor inspection score');
    }

    if (product.bulkUploadBatchId) {
      risks.push('Bulk uploaded vehicle');
    }

    if (sellerReputation.factors.paymentReliability.disputeRate > 10) {
      risks.push('High seller dispute rate');
    }

    return risks.length > 0 ? risks : ['No significant risks identified'];
  }

  private calculateRecommendedPrice(
    product: any,
    historical: AssetReputation['historicalPerformance'],
    inspectionScore?: number
  ): AssetReputation['recommendedPrice'] {
    const basePrice = product.price;
    const avgFinalPrice = historical.averageFinalPrice;

    // Calculate recommended range based on historical data and inspection
    const inspectionMultiplier = inspectionScore ? (inspectionScore / 100) : 0.85;
    const recommendedMin = Math.round(avgFinalPrice * 0.8 * inspectionMultiplier);
    const recommendedMax = Math.round(avgFinalPrice * 1.2 * inspectionMultiplier);
    const optimalPrice = Math.round((recommendedMin + recommendedMax) / 2);

    return {
      min: recommendedMin,
      max: recommendedMax,
      optimal: optimalPrice,
    };
  }
}
