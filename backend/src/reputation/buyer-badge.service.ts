import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

export type BuyerBadgeLevel = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface BuyerBadge {
  level: BuyerBadgeLevel;
  score: number;
  criteria: {
    walletBalance: number;
    pastWins: number;
    successfulPayments: number;
    disputeFree: boolean;
    accountAge: number; // days
    kycVerified: boolean;
    averageBidAmount: number;
  };
  benefits: string[];
  validUntil: Date;
  lastUpdated: Date;
}

export interface BadgeCriteria {
  level: BuyerBadgeLevel;
  minScore: number;
  requirements: {
    minWalletBalance: number;
    minPastWins: number;
    minSuccessfulPayments: number;
    minAccountAge: number; // days
    disputeFree: boolean;
    kycRequired: boolean;
    minAverageBidAmount: number;
  };
  benefits: string[];
  description: string;
}

@Injectable()
export class BuyerBadgeService {
  private readonly logger = new Logger(BuyerBadgeService.name);

  // Badge criteria thresholds
  private readonly badgeCriteria: BadgeCriteria[] = [
    {
      level: 'none',
      minScore: 0,
      requirements: {
        minWalletBalance: 0,
        minPastWins: 0,
        minSuccessfulPayments: 0,
        minAccountAge: 0,
        disputeFree: false,
        kycRequired: false,
        minAverageBidAmount: 0,
      },
      benefits: ['Basic bidding access'],
      description: 'New buyer',
    },
    {
      level: 'bronze',
      minScore: 25,
      requirements: {
        minWalletBalance: 10000,
        minPastWins: 1,
        minSuccessfulPayments: 1,
        minAccountAge: 30,
        disputeFree: true,
        kycRequired: true,
        minAverageBidAmount: 50000,
      },
      benefits: [
        'Basic bidding access',
        'Priority customer support',
        'Faster bid processing',
        'EMI eligibility priority',
      ],
      description: 'Verified buyer with basic track record',
    },
    {
      level: 'silver',
      minScore: 50,
      requirements: {
        minWalletBalance: 50000,
        minPastWins: 5,
        minSuccessfulPayments: 5,
        minAccountAge: 90,
        disputeFree: true,
        kycRequired: true,
        minAverageBidAmount: 100000,
      },
      benefits: [
        'All Bronze benefits',
        'Exclusive deals access',
        'Pre-approved financing badge',
        'Bulk purchase discounts',
        'Dedicated account manager',
      ],
      description: 'Established buyer with proven reliability',
    },
    {
      level: 'gold',
      minScore: 75,
      requirements: {
        minWalletBalance: 200000,
        minPastWins: 15,
        minSuccessfulPayments: 15,
        minAccountAge: 180,
        disputeFree: true,
        kycRequired: true,
        minAverageBidAmount: 250000,
      },
      benefits: [
        'All Silver benefits',
        'VIP auction access',
        'Private seller negotiations',
        'Custom financing terms',
        'Priority vehicle allocation',
        'Complimentary inspections',
      ],
      description: 'Premium buyer with excellent track record',
    },
    {
      level: 'platinum',
      minScore: 90,
      requirements: {
        minWalletBalance: 500000,
        minPastWins: 50,
        minSuccessfulPayments: 50,
        minAccountAge: 365,
        disputeFree: true,
        kycRequired: true,
        minAverageBidAmount: 500000,
      },
      benefits: [
        'All Gold benefits',
        'Exclusive pre-auction access',
        'Custom vehicle sourcing',
        'Dedicated relationship manager',
        'Red carpet treatment',
        'Complimentary delivery',
        'VIP event invitations',
      ],
      description: 'Elite buyer with exceptional reputation',
    },
    {
      level: 'diamond',
      minScore: 95,
      requirements: {
        minWalletBalance: 1000000,
        minPastWins: 100,
        minSuccessfulPayments: 100,
        minAccountAge: 730,
        disputeFree: true,
        kycRequired: true,
        minAverageBidAmount: 1000000,
      },
      benefits: [
        'All Platinum benefits',
        'Private auction hosting',
        'Custom vehicle requirements',
        'Concierge services',
        'Exclusive partnerships',
        'White-glove service',
      ],
      description: 'Legendary buyer with unmatched reputation',
    },
  ];

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async calculateBuyerBadge(userId: string): Promise<BuyerBadge> {
    this.logger.log(`Calculating buyer badge for user ${userId}`);

    // Gather all buyer metrics
    const criteria = await this.gatherBuyerCriteria(userId);

    // Calculate reputation score
    const score = this.calculateReputationScore(criteria);

    // Determine badge level
    const badgeLevel = this.determineBadgeLevel(score);

    // Get badge details
    const badgeCriteria = this.badgeCriteria.find(b => b.level === badgeLevel);
    const benefits = badgeCriteria?.benefits || [];

    const badge: BuyerBadge = {
      level: badgeLevel,
      score,
      criteria,
      benefits,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days validity
      lastUpdated: new Date(),
    };

    // Cache badge in database (in a real implementation)
    // For now, we'll recalculate each time

    // Log badge calculation
    await this.auditService.logActivity({
      userId,
      action: 'BUYER_BADGE_CALCULATED',
      resource: 'badge',
      category: 'user',
      severity: 'low',
      metadata: {
        badgeLevel,
        score,
        criteria,
      },
    });

    return badge;
  }

  async getBuyerBadge(userId: string): Promise<BuyerBadge> {
    // In a real implementation, this would check cache first
    return this.calculateBuyerBadge(userId);
  }

  async getBadgeBenefits(level: BuyerBadgeLevel): Promise<string[]> {
    const badge = this.badgeCriteria.find(b => b.level === level);
    return badge?.benefits || [];
  }

  async getBadgeLeaderboard(limit: number = 50): Promise<Array<{
    userId: string;
    badgeLevel: BuyerBadgeLevel;
    score: number;
    displayName: string;
  }>> {
    // In a real implementation, this would query cached badges
    // For now, return mock data
    return [
      { userId: 'user1', badgeLevel: 'diamond', score: 98, displayName: 'Rajesh Kumar' },
      { userId: 'user2', badgeLevel: 'platinum', score: 94, displayName: 'Priya Sharma' },
      { userId: 'user3', badgeLevel: 'gold', score: 85, displayName: 'Amit Patel' },
      { userId: 'user4', badgeLevel: 'silver', score: 72, displayName: 'Sneha Gupta' },
      { userId: 'user5', badgeLevel: 'bronze', score: 45, displayName: 'Vikram Singh' },
    ].slice(0, limit);
  }

  async getBadgeStatistics(): Promise<{
    totalBuyers: number;
    badgeDistribution: Record<BuyerBadgeLevel, number>;
    averageScore: number;
    topPerformers: Array<{
      userId: string;
      badgeLevel: BuyerBadgeLevel;
      score: number;
    }>;
  }> {
    // Mock statistics - in real implementation, aggregate from database
    return {
      totalBuyers: 15420,
      badgeDistribution: {
        none: 8920,
        bronze: 4520,
        silver: 1250,
        gold: 380,
        platinum: 120,
        diamond: 25,
      },
      averageScore: 32.5,
      topPerformers: [
        { userId: 'user1', badgeLevel: 'diamond', score: 98 },
        { userId: 'user2', badgeLevel: 'platinum', score: 96 },
        { userId: 'user3', badgeLevel: 'platinum', score: 93 },
      ],
    };
  }

  private async gatherBuyerCriteria(userId: string): Promise<BuyerBadge['criteria']> {
    // Get user basic info
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profiles: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get wallet information
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    // Get past auction wins (simulated - would query auction history)
    const pastWins = await this.getPastWinsCount(userId);

    // Get payment history (simulated - would query payment records)
    const successfulPayments = await this.getSuccessfulPaymentsCount(userId);

    // Check for disputes (simulated - would query dispute records)
    const hasDisputes = await this.checkForDisputes(userId);

    // Calculate account age
    const accountAge = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate average bid amount (simulated)
    const averageBidAmount = await this.getAverageBidAmount(userId);

    return {
      walletBalance: wallet?.balance || 0,
      pastWins,
      successfulPayments,
      disputeFree: !hasDisputes,
      accountAge,
      kycVerified: user.emailVerified === 'VERIFIED',
      averageBidAmount,
    };
  }

  private calculateReputationScore(criteria: BuyerBadge['criteria']): number {
    let score = 0;

    // Wallet balance scoring (max 20 points)
    if (criteria.walletBalance >= 1000000) score += 20;
    else if (criteria.walletBalance >= 500000) score += 15;
    else if (criteria.walletBalance >= 200000) score += 12;
    else if (criteria.walletBalance >= 50000) score += 8;
    else if (criteria.walletBalance >= 10000) score += 5;

    // Past wins scoring (max 25 points)
    if (criteria.pastWins >= 100) score += 25;
    else if (criteria.pastWins >= 50) score += 20;
    else if (criteria.pastWins >= 15) score += 15;
    else if (criteria.pastWins >= 5) score += 10;
    else if (criteria.pastWins >= 1) score += 5;

    // Payment history scoring (max 20 points)
    if (criteria.successfulPayments >= 100) score += 20;
    else if (criteria.successfulPayments >= 50) score += 15;
    else if (criteria.successfulPayments >= 15) score += 12;
    else if (criteria.successfulPayments >= 5) score += 8;
    else if (criteria.successfulPayments >= 1) score += 5;

    // Account age scoring (max 10 points)
    if (criteria.accountAge >= 730) score += 10; // 2+ years
    else if (criteria.accountAge >= 365) score += 8; // 1+ years
    else if (criteria.accountAge >= 180) score += 6; // 6+ months
    else if (criteria.accountAge >= 90) score += 4; // 3+ months
    else if (criteria.accountAge >= 30) score += 2; // 1+ months

    // KYC verification bonus (5 points)
    if (criteria.kycVerified) score += 5;

    // Dispute-free bonus (10 points)
    if (criteria.disputeFree) score += 10;

    // Average bid amount bonus (max 10 points)
    if (criteria.averageBidAmount >= 1000000) score += 10;
    else if (criteria.averageBidAmount >= 500000) score += 8;
    else if (criteria.averageBidAmount >= 250000) score += 6;
    else if (criteria.averageBidAmount >= 100000) score += 4;
    else if (criteria.averageBidAmount >= 50000) score += 2;

    return Math.min(100, score);
  }

  private determineBadgeLevel(score: number): BuyerBadgeLevel {
    // Find the highest badge level the user qualifies for
    for (let i = this.badgeCriteria.length - 1; i >= 0; i--) {
      if (score >= this.badgeCriteria[i].minScore) {
        return this.badgeCriteria[i].level;
      }
    }
    return 'none';
  }

  private async getPastWinsCount(userId: string): Promise<number> {
    // Simulated - would query auction wins from database
    // Random value based on user ID for demo purposes
    const hash = userId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return Math.floor((hash % 100) * Math.random());
  }

  private async getSuccessfulPaymentsCount(userId: string): Promise<number> {
    // Simulated - would query successful payment records
    const hash = userId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return Math.floor((hash % 80) * Math.random());
  }

  private async checkForDisputes(userId: string): Promise<boolean> {
    // Simulated - would query dispute records
    // Most users are dispute-free (90% chance)
    return Math.random() > 0.9;
  }

  private async getAverageBidAmount(userId: string): Promise<number> {
    // Simulated - would calculate average from bid history
    const hash = userId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return 50000 + (hash % 950000); // Range: 50k - 1M
  }

  // Public method to get badge criteria for display
  getBadgeCriteria(): BadgeCriteria[] {
    return this.badgeCriteria;
  }
}
