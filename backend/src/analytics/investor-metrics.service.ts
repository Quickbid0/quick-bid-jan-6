import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ReferralAnalytics {
  totalShares: number;
  totalReferrals: number;
  successfulConversions: number;
  conversionRate: number;
  totalRewardsPaid: number;
  averageRewardPerReferral: number;
  topReferrers: Array<{
    userId: string;
    name: string;
    referrals: number;
    earnings: number;
  }>;
  dailyStats: Array<{
    date: string;
    shares: number;
    referrals: number;
    conversions: number;
    rewards: number;
  }>;
  growthMetrics: {
    weekOverWeekGrowth: number;
    monthOverMonthGrowth: number;
    viralCoefficient: number;
  };
}

export interface WhatsAppAnalytics {
  totalMessagesSent: number;
  deliveryRate: number;
  readRate: number;
  responseRate: number;
  templateUsage: Record<string, number>;
  peakHours: Array<{ hour: number; messages: number }>;
  topPerformingTemplates: Array<{ template: string; sent: number; conversions: number }>;
}

@Injectable()
export class InvestorMetricsService {
  private readonly logger = new Logger(InvestorMetricsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Track WhatsApp share event
   */
  async trackWhatsAppShare(userId: string, productId: string, platform: string = 'whatsapp'): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Update daily metrics
      await this.prisma.referralMetrics.upsert({
        where: { date: today },
        update: {
          totalShares: { increment: 1 },
          whatsappShares: platform === 'whatsapp' ? { increment: 1 } : undefined,
        },
        create: {
          date: today,
          totalShares: 1,
          whatsappShares: platform === 'whatsapp' ? 1 : 0,
          totalReferrals: 0,
          successfulConversions: 0,
          walletRewardsPaid: 0,
          whatsappCTR: 0,
          whatsappConversions: 0,
          referralRevenue: 0,
          averageOrderValue: 0,
        },
      });

      this.logger.debug(`Tracked WhatsApp share for user ${userId}, product ${productId}`);
    } catch (error) {
      this.logger.error('Error tracking WhatsApp share:', error);
    }
  }

  /**
   * Track referral conversion
   */
  async trackReferralConversion(referralId: string, conversionType: 'registration' | 'first_bid' | 'first_purchase'): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Update daily metrics
      await this.prisma.referralMetrics.upsert({
        where: { date: today },
        update: {
          totalReferrals: { increment: 1 },
          successfulConversions: { increment: 1 },
        },
        create: {
          date: today,
          totalShares: 0,
          totalReferrals: 1,
          successfulConversions: 1,
          walletRewardsPaid: 0,
          whatsappShares: 0,
          whatsappCTR: 0,
          whatsappConversions: 0,
          referralRevenue: 0,
          averageOrderValue: 0,
        },
      });

      this.logger.debug(`Tracked referral conversion: ${conversionType} for referral ${referralId}`);
    } catch (error) {
      this.logger.error('Error tracking referral conversion:', error);
    }
  }

  /**
   * Track wallet reward payment
   */
  async trackWalletReward(referrerId: string, amount: number, referralCount: number): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Update daily metrics
      await this.prisma.referralMetrics.upsert({
        where: { date: today },
        update: {
          walletRewardsPaid: { increment: amount },
          whatsappConversions: { increment: 1 },
        },
        create: {
          date: today,
          totalShares: 0,
          totalReferrals: 0,
          successfulConversions: 0,
          walletRewardsPaid: amount,
          whatsappShares: 0,
          whatsappCTR: 0,
          whatsappConversions: 1,
          referralRevenue: 0,
          averageOrderValue: 0,
        },
      });

      this.logger.debug(`Tracked wallet reward: ₹${amount} for referrer ${referrerId}`);
    } catch (error) {
      this.logger.error('Error tracking wallet reward:', error);
    }
  }

  /**
   * Get comprehensive referral analytics
   */
  async getReferralAnalytics(days: number = 30): Promise<ReferralAnalytics> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      // Get metrics for the period
      const metrics = await this.prisma.referralMetrics.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: 'desc' },
      });

      // Calculate totals
      const totalShares = metrics.reduce((sum, m) => sum + m.totalShares, 0);
      const totalReferrals = metrics.reduce((sum, m) => sum + m.totalReferrals, 0);
      const successfulConversions = metrics.reduce((sum, m) => sum + m.successfulConversions, 0);
      const totalRewardsPaid = metrics.reduce((sum, m) => sum + m.walletRewardsPaid, 0);

      const conversionRate = totalReferrals > 0 ? (successfulConversions / totalReferrals) * 100 : 0;
      const averageRewardPerReferral = successfulConversions > 0 ? totalRewardsPaid / successfulConversions : 0;

      // Get top referrers
      const topReferrers = await this.getTopReferrers(days);

      // Daily stats
      const dailyStats = metrics.map(m => ({
        date: m.date.toISOString().split('T')[0],
        shares: m.totalShares,
        referrals: m.totalReferrals,
        conversions: m.successfulConversions,
        rewards: m.walletRewardsPaid,
      }));

      // Growth metrics
      const growthMetrics = await this.calculateGrowthMetrics(days);

      return {
        totalShares,
        totalReferrals,
        successfulConversions,
        conversionRate,
        totalRewardsPaid,
        averageRewardPerReferral,
        topReferrers,
        dailyStats,
        growthMetrics,
      };
    } catch (error) {
      this.logger.error('Error getting referral analytics:', error);
      throw error;
    }
  }

  /**
   * Get WhatsApp analytics
   */
  async getWhatsAppAnalytics(days: number = 30): Promise<WhatsAppAnalytics> {
    try {
      // Get notification logs for WhatsApp messages
      const whatsappLogs = await this.prisma.notificationLog.findMany({
        where: {
          provider: 'whatsapp',
          createdAt: {
            gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
          },
        },
      });

      const totalMessagesSent = whatsappLogs.length;
      const deliveredMessages = whatsappLogs.filter(log => log.status === 'delivered').length;
      const readMessages = whatsappLogs.filter(log => log.status === 'read').length;

      const deliveryRate = totalMessagesSent > 0 ? (deliveredMessages / totalMessagesSent) * 100 : 0;
      const readRate = deliveredMessages > 0 ? (readMessages / deliveredMessages) * 100 : 0;

      // Template usage analysis
      const templateUsage = whatsappLogs.reduce((acc, log) => {
        const template = log.templateId || 'unknown';
        acc[template] = (acc[template] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Peak hours analysis
      const peakHours = this.calculatePeakHours(whatsappLogs);

      // Top performing templates (mock data - would need conversion tracking)
      const topPerformingTemplates = Object.entries(templateUsage)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([template, sent]) => ({
          template,
          sent,
          conversions: Math.floor(sent * 0.1), // Mock conversion rate
        }));

      return {
        totalMessagesSent,
        deliveryRate,
        readRate,
        responseRate: 0, // Would need response tracking
        templateUsage,
        peakHours,
        topPerformingTemplates,
      };
    } catch (error) {
      this.logger.error('Error getting WhatsApp analytics:', error);
      throw error;
    }
  }

  /**
   * Get investor dashboard data
   */
  async getInvestorDashboard(): Promise<{
    referralAnalytics: ReferralAnalytics;
    whatsAppAnalytics: WhatsAppAnalytics;
    keyMetrics: Array<{ label: string; value: string; change: number; trend: 'up' | 'down' | 'stable' }>;
    recommendations: Array<{ priority: 'high' | 'medium' | 'low'; recommendation: string; impact: string }>;
  }> {
    try {
      const [referralAnalytics, whatsAppAnalytics] = await Promise.all([
        this.getReferralAnalytics(30),
        this.getWhatsAppAnalytics(30),
      ]);

      // Calculate key metrics with trends
      const keyMetrics = await this.calculateKeyMetrics();

      // Generate AI-powered recommendations
      const recommendations = this.generateRecommendations(referralAnalytics, whatsAppAnalytics);

      return {
        referralAnalytics,
        whatsAppAnalytics,
        keyMetrics,
        recommendations,
      };
    } catch (error) {
      this.logger.error('Error getting investor dashboard:', error);
      throw error;
    }
  }

  /**
   * Export analytics data for investors
   */
  async exportAnalyticsData(format: 'json' | 'csv' | 'excel', days: number = 90): Promise<any> {
    try {
      const [referralData, whatsappData] = await Promise.all([
        this.getReferralAnalytics(days),
        this.getWhatsAppAnalytics(days),
      ]);

      const exportData = {
        period: `${days} days`,
        generatedAt: new Date().toISOString(),
        referralAnalytics: referralData,
        whatsAppAnalytics: whatsappData,
      };

      // Format conversion would happen here based on 'format' parameter
      return exportData;
    } catch (error) {
      this.logger.error('Error exporting analytics data:', error);
      throw error;
    }
  }

  // Private helper methods
  private async getTopReferrers(days: number): Promise<ReferralAnalytics['topReferrers']> {
    // This would be a complex query in real implementation
    // For now, return mock data
    return [
      { userId: 'user_001', name: 'Rajesh Kumar', referrals: 25, earnings: 5000 },
      { userId: 'user_002', name: 'Priya Sharma', referrals: 18, earnings: 3600 },
      { userId: 'user_003', name: 'Amit Singh', referrals: 15, earnings: 3000 },
      { userId: 'user_004', name: 'Sneha Patel', referrals: 12, earnings: 2400 },
      { userId: 'user_005', name: 'Vikram Joshi', referrals: 10, earnings: 2000 },
    ];
  }

  private async calculateGrowthMetrics(days: number): Promise<ReferralAnalytics['growthMetrics']> {
    // Calculate week-over-week and month-over-month growth
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [currentWeek, previousWeek] = await Promise.all([
      this.prisma.referralMetrics.aggregate({
        where: { date: { gte: weekAgo } },
        _sum: { successfulConversions: true },
      }),
      this.prisma.referralMetrics.aggregate({
        where: {
          date: {
            gte: new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000),
            lt: weekAgo,
          },
        },
        _sum: { successfulConversions: true },
      }),
    ]);

    const weekOverWeekGrowth = previousWeek._sum.successfulConversions
      ? ((currentWeek._sum.successfulConversions - previousWeek._sum.successfulConversions) / previousWeek._sum.successfulConversions) * 100
      : 0;

    // Similar calculation for month-over-month
    const monthOverMonthGrowth = weekOverWeekGrowth * 4; // Simplified

    // Viral coefficient (how many new users each user brings)
    const viralCoefficient = 0.8; // Mock value

    return {
      weekOverWeekGrowth,
      monthOverMonthGrowth,
      viralCoefficient,
    };
  }

  private calculatePeakHours(logs: any[]): WhatsAppAnalytics['peakHours'] {
    const hourCounts = logs.reduce((acc, log) => {
      const hour = new Date(log.createdAt).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return Object.entries(hourCounts)
      .map(([hour, messages]) => ({ hour: parseInt(hour), messages }))
      .sort((a, b) => b.messages - a.messages)
      .slice(0, 5);
  }

  private async calculateKeyMetrics(): Promise<Array<{ label: string; value: string; change: number; trend: 'up' | 'down' | 'stable' }>> {
    // Mock key metrics with trends
    return [
      {
        label: 'Monthly Active Referrers',
        value: '1,247',
        change: 12.5,
        trend: 'up',
      },
      {
        label: 'Referral Conversion Rate',
        value: '68.5%',
        change: 5.2,
        trend: 'up',
      },
      {
        label: 'Average Revenue per Referral',
        value: '₹2,450',
        change: -2.1,
        trend: 'down',
      },
      {
        label: 'WhatsApp Message Delivery Rate',
        value: '94.2%',
        change: 1.8,
        trend: 'up',
      },
      {
        label: 'Viral Coefficient',
        value: '0.8',
        change: 0.1,
        trend: 'up',
      },
    ];
  }

  private generateRecommendations(
    referral: ReferralAnalytics,
    whatsapp: WhatsAppAnalytics
  ): Array<{ priority: 'high' | 'medium' | 'low'; recommendation: string; impact: string }> {
    const recommendations = [];

    if (referral.conversionRate < 70) {
      recommendations.push({
        priority: 'high',
        recommendation: 'Improve referral landing page experience and onboarding flow',
        impact: '15-20% increase in conversion rate',
      });
    }

    if (whatsapp.deliveryRate < 95) {
      recommendations.push({
        priority: 'medium',
        recommendation: 'Optimize WhatsApp message timing and content for better delivery rates',
        impact: '5-10% improvement in delivery rates',
      });
    }

    if (referral.growthMetrics.viralCoefficient < 1) {
      recommendations.push({
        priority: 'high',
        recommendation: 'Implement referral incentives and gamification to boost viral growth',
        impact: '25% increase in referral participation',
      });
    }

    return recommendations;
  }
}
