import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  algorithm: 'collaborative' | 'content-based' | 'hybrid' | 'trending' | 'personalized';
  parameters: Record<string, any>;
  weight: number; // Percentage of users to assign to this variant
}

export interface ABTestResult {
  variantId: string;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  conversionRate: number;
  avgSessionTime: number;
  revenue: number;
}

@Injectable()
export class ABTestingService {
  private readonly logger = new Logger(ABTestingService.name);

  // Current active A/B test variants for AI recommendations
  private readonly recommendationVariants: ABTestVariant[] = [
    {
      id: 'collaborative-filtering',
      name: 'Collaborative Filtering',
      description: 'Recommendations based on similar users\' behavior',
      algorithm: 'collaborative',
      parameters: { similarityThreshold: 0.7, minCommonItems: 3 },
      weight: 25
    },
    {
      id: 'content-based',
      name: 'Content-Based',
      description: 'Recommendations based on item similarity',
      algorithm: 'content-based',
      parameters: { categoryWeight: 0.4, priceWeight: 0.3, conditionWeight: 0.3 },
      weight: 25
    },
    {
      id: 'hybrid-advanced',
      name: 'Advanced Hybrid',
      description: 'Combination of collaborative and content-based with ML optimization',
      algorithm: 'hybrid',
      parameters: { collaborativeWeight: 0.6, contentWeight: 0.4, temporalDecay: 0.8 },
      weight: 30
    },
    {
      id: 'trending-popular',
      name: 'Trending + Popular',
      description: 'Mix of trending items and popular recommendations',
      algorithm: 'trending',
      parameters: { trendingWindow: 7, popularThreshold: 50 },
      weight: 20
    }
  ];

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Assign a user to an A/B test variant based on their user ID
   * Uses consistent hashing to ensure users always get the same variant
   */
  assignUserToVariant(userId: string, testType: 'recommendations' | 'pricing' | 'ui' = 'recommendations'): ABTestVariant {
    const variants = this.getVariantsForTest(testType);

    // Simple consistent hashing based on user ID
    const hash = this.simpleHash(userId);
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    let cumulativeWeight = 0;

    for (const variant of variants) {
      cumulativeWeight += variant.weight;
      if (hash % totalWeight < cumulativeWeight) {
        return variant;
      }
    }

    // Fallback to first variant
    return variants[0];
  }

  /**
   * Track user interaction with A/B test variant
   */
  async trackInteraction(
    userId: string,
    variantId: string,
    action: 'impression' | 'click' | 'conversion' | 'purchase',
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.prisma.aBTestInteraction.create({
        data: {
          userId,
          variantId,
          action,
          metadata: metadata || {},
          createdAt: new Date()
        }
      });

      this.logger.debug(`Tracked ${action} for user ${userId} on variant ${variantId}`);
    } catch (error) {
      this.logger.error(`Failed to track interaction for user ${userId}:`, error);
    }
  }

  /**
   * Get A/B test results for a specific time period
   */
  async getTestResults(
    testType: 'recommendations' | 'pricing' | 'ui' = 'recommendations',
    days: number = 30
  ): Promise<ABTestResult[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const variants = this.getVariantsForTest(testType);
    const results: ABTestResult[] = [];

    for (const variant of variants) {
      const interactions = await this.prisma.aBTestInteraction.findMany({
        where: {
          variantId: variant.id,
          createdAt: { gte: startDate }
        }
      });

      const impressions = interactions.filter(i => i.action === 'impression').length;
      const clicks = interactions.filter(i => i.action === 'click').length;
      const conversions = interactions.filter(i => i.action === 'conversion').length;
      const purchases = interactions.filter(i => i.action === 'purchase').length;

      // Calculate revenue from purchases (simplified)
      const revenue = purchases * 1000; // Average order value assumption

      results.push({
        variantId: variant.id,
        impressions,
        clicks,
        conversions: conversions + purchases,
        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
        conversionRate: clicks > 0 ? ((conversions + purchases) / clicks) * 100 : 0,
        avgSessionTime: 0, // Would need session tracking
        revenue
      });
    }

    return results;
  }

  /**
   * Get the best performing variant based on current results
   */
  async getBestPerformingVariant(testType: 'recommendations' | 'pricing' | 'ui' = 'recommendations'): Promise<ABTestVariant | null> {
    const results = await this.getTestResults(testType, 30);

    if (results.length === 0) return null;

    // Find variant with highest conversion rate (can be customized)
    const bestResult = results.reduce((best, current) =>
      current.conversionRate > best.conversionRate ? current : best
    );

    const variants = this.getVariantsForTest(testType);
    return variants.find(v => v.id === bestResult.variantId) || null;
  }

  /**
   * Update variant weights based on performance (reinforcement learning)
   */
  async optimizeVariantWeights(testType: 'recommendations' | 'pricing' | 'ui' = 'recommendations'): Promise<void> {
    const results = await this.getTestResults(testType, 7); // Use recent performance

    if (results.length < 2) return; // Need at least 2 variants to optimize

    const totalConversions = results.reduce((sum, r) => sum + r.conversions, 0);

    if (totalConversions === 0) return; // No data to optimize on

    // Simple reinforcement: increase weight for better performing variants
    const variants = this.getVariantsForTest(testType);

    for (const variant of variants) {
      const result = results.find(r => r.variantId === variant.id);
      if (result) {
        const performance = result.conversions / totalConversions;
        // Adjust weight based on performance (simple formula)
        variant.weight = Math.max(5, Math.min(50, variant.weight * (1 + performance)));
      }
    }

    // Normalize weights to sum to 100
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    variants.forEach(v => v.weight = Math.round((v.weight / totalWeight) * 100));

    this.logger.log(`Optimized variant weights for ${testType}:`, variants.map(v => `${v.id}: ${v.weight}%`));
  }

  /**
   * Get variants for a specific test type
   */
  private getVariantsForTest(testType: 'recommendations' | 'pricing' | 'ui'): ABTestVariant[] {
    switch (testType) {
      case 'recommendations':
        return this.recommendationVariants;
      case 'pricing':
        return []; // Would implement pricing variants
      case 'ui':
        return []; // Would implement UI variants
      default:
        return this.recommendationVariants;
    }
  }

  /**
   * Simple hash function for consistent user assignment
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}
