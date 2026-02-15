import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class MarketplaceMetricsService {
  private readonly logger = new Logger(MarketplaceMetricsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Aggregate and store daily marketplace metrics (runs daily at midnight)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async aggregateDailyMetrics(): Promise<void> {
    try {
      this.logger.log('Starting daily metrics aggregation');

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if metrics already exist for today
      const existingMetrics = await this.prisma.marketplaceMetric.findUnique({
        where: { date: today },
      });

      if (existingMetrics) {
        this.logger.log('Daily metrics already exist for today, skipping aggregation');
        return;
      }

      // Aggregate metrics from various sources
      const [
        userMetrics,
        auctionMetrics,
        financialMetrics,
        referralMetrics,
        campaignMetrics,
      ] = await Promise.all([
        this.getUserMetrics(today),
        this.getAuctionMetrics(today),
        this.getFinancialMetrics(today),
        this.getReferralMetrics(today),
        this.getCampaignMetrics(today),
      ]);

      // Get active campaign ID
      const activeCampaign = await this.prisma.launchCampaign.findFirst({
        where: {
          activeStatus: true,
          startDate: { lte: today },
          endDate: { gte: today },
        },
      });

      // Create daily metrics record
      const dailyMetrics = await this.prisma.marketplaceMetric.create({
        data: {
          date: today,
          dailyActiveUsers: userMetrics.dailyActiveUsers,
          newRegistrations: userMetrics.newRegistrations,
          newSellers: userMetrics.newSellers,
          auctionsCreated: auctionMetrics.auctionsCreated,
          auctionsCompleted: auctionMetrics.auctionsCompleted,
          bidsPlaced: auctionMetrics.bidsPlaced,
          averageBidsPerAuction: auctionMetrics.averageBidsPerAuction,
          revenueGenerated: financialMetrics.revenueGenerated,
          escrowVolume: financialMetrics.escrowVolume,
          walletVolume: financialMetrics.walletVolume,
          referralSignups: referralMetrics.referralSignups,
          referralConversions: referralMetrics.referralConversions,
          referralRevenue: referralMetrics.referralRevenue,
          campaignId: activeCampaign?.id,
          campaignRevenue: campaignMetrics.campaignRevenue,
        },
      });

      this.logger.log(`Daily metrics aggregated successfully for ${today.toISOString().split('T')[0]}`);

      // Trigger any post-aggregation processing
      await this.processDailyMetrics(dailyMetrics);

    } catch (error) {
      this.logger.error('Error aggregating daily metrics:', error);
      throw error;
    }
  }

  /**
   * Get user-related metrics for the day
   */
  private async getUserMetrics(date: Date): Promise<{
    dailyActiveUsers: number;
    newRegistrations: number;
    newSellers: number;
  }> {
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [dailyActiveUsers, newRegistrations, newSellers] = await Promise.all([
      // Users active today (logged in)
      this.prisma.userSession.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),
      // New user registrations today
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),
      // New sellers today
      this.prisma.user.count({
        where: {
          role: 'SELLER',
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),
    ]);

    return {
      dailyActiveUsers,
      newRegistrations,
      newSellers,
    };
  }

  /**
   * Get auction-related metrics for the day
   */
  private async getAuctionMetrics(date: Date): Promise<{
    auctionsCreated: number;
    auctionsCompleted: number;
    bidsPlaced: number;
    averageBidsPerAuction: number;
  }> {
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [auctionsCreated, auctionsCompleted, bidsPlaced, auctionStats] = await Promise.all([
      // Auctions created today
      this.prisma.product.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),
      // Auctions completed today
      this.prisma.product.count({
        where: {
          updatedAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
          auction_status: 'sold',
        },
      }),
      // Bids placed today
      this.prisma.bid.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),
      // Get average bids per auction (for auctions created this month)
      this.prisma.product.findMany({
        where: {
          createdAt: {
            gte: new Date(date.getFullYear(), date.getMonth(), 1),
          },
        },
        select: {
          id: true,
          _count: {
            select: { bids: true },
          },
        },
      }),
    ]);

    // Calculate average bids per auction
    const totalAuctionsThisMonth = auctionStats.length;
    const totalBidsThisMonth = auctionStats.reduce((sum, auction) => sum + auction._count.bids, 0);
    const averageBidsPerAuction = totalAuctionsThisMonth > 0
      ? totalBidsThisMonth / totalAuctionsThisMonth
      : 0;

    return {
      auctionsCreated,
      auctionsCompleted,
      bidsPlaced,
      averageBidsPerAuction,
    };
  }

  /**
   * Get financial metrics for the day
   */
  private async getFinancialMetrics(date: Date): Promise<{
    revenueGenerated: number;
    escrowVolume: number;
    walletVolume: number;
  }> {
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // In a real implementation, this would aggregate from transaction logs
    // For now, return mock data based on activity
    const [auctionsCompleted, bidsPlaced] = await Promise.all([
      this.prisma.product.count({
        where: {
          updatedAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
          auction_status: 'sold',
        },
      }),
      this.prisma.bid.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),
    ]);

    // Mock revenue calculation based on activity
    const revenueGenerated = auctionsCompleted * 2500 + bidsPlaced * 50; // Rough estimate
    const escrowVolume = revenueGenerated * 0.8; // 80% through escrow
    const walletVolume = revenueGenerated * 0.2; // 20% wallet transactions

    return {
      revenueGenerated,
      escrowVolume,
      walletVolume,
    };
  }

  /**
   * Get referral metrics for the day
   */
  private async getReferralMetrics(date: Date): Promise<{
    referralSignups: number;
    referralConversions: number;
    referralRevenue: number;
  }> {
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [referralSignups, referralConversions, successfulReferrals] = await Promise.all([
      // Users who registered via referral today
      this.prisma.referral.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),
      // Referrals that led to successful conversions today
      this.prisma.referral.count({
        where: {
          rewardStatus: 'credited',
          rewardCreditedAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),
      // Get successful referrals for revenue calculation
      this.prisma.referral.findMany({
        where: {
          rewardStatus: 'credited',
          rewardCreditedAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        select: {
          rewardAmount: true,
        },
      }),
    ]);

    const referralRevenue = successfulReferrals.reduce(
      (sum, referral) => sum + referral.rewardAmount,
      0
    );

    return {
      referralSignups,
      referralConversions,
      referralRevenue,
    };
  }

  /**
   * Get campaign metrics for the day
   */
  private async getCampaignMetrics(date: Date): Promise<{
    campaignRevenue: number;
  }> {
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get active campaign
    const activeCampaign = await this.prisma.launchCampaign.findFirst({
      where: {
        activeStatus: true,
        startDate: { lte: date },
        endDate: { gte: date },
      },
    });

    if (!activeCampaign) {
      return { campaignRevenue: 0 };
    }

    // Calculate campaign-specific revenue (users who registered during campaign)
    const campaignRevenue = await this.calculateCampaignRevenue(activeCampaign, startOfDay, endOfDay);

    return { campaignRevenue };
  }

  /**
   * Calculate campaign-specific revenue
   */
  private async calculateCampaignRevenue(
    campaign: any,
    startOfDay: Date,
    endOfDay: Date,
  ): Promise<number> {
    // Count transactions from users who registered during the campaign
    const campaignUsers = await this.prisma.user.findMany({
      where: {
        createdAt: {
          gte: campaign.startDate,
          lte: campaign.endDate,
        },
      },
      select: { id: true },
    });

    if (campaignUsers.length === 0) {
      return 0;
    }

    const userIds = campaignUsers.map(u => u.id);

    // Count auctions completed by campaign users today
    const auctionsByCampaignUsers = await this.prisma.product.count({
      where: {
        sellerId: { in: userIds },
        auction_status: 'sold',
        updatedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // Mock revenue calculation
    return auctionsByCampaignUsers * 2000; // Average ₹2,000 per auction
  }

  /**
   * Process daily metrics after aggregation (alerts, analysis, etc.)
   */
  private async processDailyMetrics(dailyMetrics: any): Promise<void> {
    try {
      // Check for significant changes and trigger alerts
      await this.checkMetricsAnomalies(dailyMetrics);

      // Update growth projections
      await this.updateGrowthProjections(dailyMetrics);

      // Generate automated insights
      await this.generateDailyInsights(dailyMetrics);

      this.logger.log('Daily metrics processing completed');
    } catch (error) {
      this.logger.error('Error processing daily metrics:', error);
    }
  }

  /**
   * Check for anomalies in daily metrics
   */
  private async checkMetricsAnomalies(dailyMetrics: any): Promise<void> {
    // Get yesterday's metrics for comparison
    const yesterday = new Date(dailyMetrics.date);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayMetrics = await this.prisma.marketplaceMetric.findUnique({
      where: { date: yesterday },
    });

    if (!yesterdayMetrics) {
      return; // No comparison data
    }

    const alerts = [];

    // Check user registration anomaly
    const userGrowthRate = yesterdayMetrics.newRegistrations > 0
      ? ((dailyMetrics.newRegistrations - yesterdayMetrics.newRegistrations) / yesterdayMetrics.newRegistrations) * 100
      : 0;

    if (Math.abs(userGrowthRate) > 50) { // 50% change
      alerts.push({
        type: userGrowthRate > 0 ? 'growth_spike' : 'growth_drop',
        metric: 'newRegistrations',
        value: dailyMetrics.newRegistrations,
        changePercent: userGrowthRate,
        severity: Math.abs(userGrowthRate) > 100 ? 'high' : 'medium',
      });
    }

    // Check auction completion rate
    const yesterdayCompletionRate = yesterdayMetrics.auctionsCreated > 0
      ? (yesterdayMetrics.auctionsCompleted / yesterdayMetrics.auctionsCreated) * 100
      : 0;

    const todayCompletionRate = dailyMetrics.auctionsCreated > 0
      ? (dailyMetrics.auctionsCompleted / dailyMetrics.auctionsCreated) * 100
      : 0;

    if (Math.abs(todayCompletionRate - yesterdayCompletionRate) > 20) {
      alerts.push({
        type: 'auction_completion_anomaly',
        metric: 'auctionCompletionRate',
        value: todayCompletionRate,
        changePercent: todayCompletionRate - yesterdayCompletionRate,
        severity: 'medium',
      });
    }

    // Log alerts (would trigger notifications in production)
    if (alerts.length > 0) {
      this.logger.warn('Metrics anomalies detected:', alerts);
    }
  }

  /**
   * Update growth projections based on daily metrics
   */
  private async updateGrowthProjections(dailyMetrics: any): Promise<void> {
    // This would update growth models and projections
    // For now, just log the activity
    this.logger.debug('Growth projections updated based on daily metrics');
  }

  /**
   * Generate automated insights from daily metrics
   */
  private async generateDailyInsights(dailyMetrics: any): Promise<void> {
    // Generate insights like:
    // - "User growth is 25% above target"
    // - "Auction completion rate improved by 15%"
    // - "Referral conversions reached all-time high"

    const insights = [];

    if (dailyMetrics.newRegistrations > 50) {
      insights.push('Strong user acquisition day - consider scaling marketing spend');
    }

    if (dailyMetrics.averageBidsPerAuction > 10) {
      insights.push('High engagement: auctions receiving above-average bids');
    }

    if (dailyMetrics.referralConversions > dailyMetrics.referralSignups * 0.8) {
      insights.push('Excellent referral conversion rate - viral growth accelerating');
    }

    if (insights.length > 0) {
      this.logger.log('Daily insights generated:', insights);
    }
  }

  /**
   * Get metrics for a date range
   */
  async getMetricsForDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    try {
      const metrics = await this.prisma.marketplaceMetric.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: 'asc' },
      });

      return metrics;
    } catch (error) {
      this.logger.error('Error getting metrics for date range:', error);
      throw error;
    }
  }

  /**
   * Get growth trends over time
   */
  async getGrowthTrends(days: number = 30): Promise<{
    userGrowth: number[];
    revenueGrowth: number[];
    auctionGrowth: number[];
    dates: string[];
  }> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const metrics = await this.getMetricsForDateRange(startDate, endDate);

      const userGrowth = metrics.map(m => m.newRegistrations);
      const revenueGrowth = metrics.map(m => m.revenueGenerated);
      const auctionGrowth = metrics.map(m => m.auctionsCreated);
      const dates = metrics.map(m => m.date.toISOString().split('T')[0]);

      return {
        userGrowth,
        revenueGrowth,
        auctionGrowth,
        dates,
      };
    } catch (error) {
      this.logger.error('Error getting growth trends:', error);
      throw error;
    }
  }

  /**
   * Manual trigger for metrics aggregation (for testing/admin)
   */
  async triggerMetricsAggregation(): Promise<void> {
    await this.aggregateDailyMetrics();
  }

  /**
   * Get latest metrics summary
   */
  async getLatestMetricsSummary(): Promise<any> {
    try {
      const latestMetrics = await this.prisma.marketplaceMetric.findFirst({
        orderBy: { date: 'desc' },
      });

      if (!latestMetrics) {
        return null;
      }

      // Calculate some derived metrics
      const recoveryRate = latestMetrics.auctionsCreated > 0
        ? (latestMetrics.auctionsCompleted / latestMetrics.auctionsCreated) * 100
        : 0;

      const averageOrderValue = latestMetrics.auctionsCompleted > 0
        ? latestMetrics.revenueGenerated / latestMetrics.auctionsCompleted
        : 0;

      return {
        ...latestMetrics,
        recoveryRate,
        averageOrderValue,
        totalActiveUsers: latestMetrics.dailyActiveUsers,
      };
    } catch (error) {
      this.logger.error('Error getting latest metrics summary:', error);
      throw error;
    }
  }
}
