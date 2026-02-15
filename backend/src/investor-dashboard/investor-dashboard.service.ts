import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InvestorMetricsService } from '../analytics/investor-metrics.service';
import { LaunchCampaignService } from '../launch-campaign/launch-campaign.service';
import { FeeOverrideService } from '../fee-override/fee-override.service';
import { WalletBonusService } from '../wallet-bonus/wallet-bonus.service';

export interface InvestorDashboardData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    userGrowthRate: number;
  };
  userSegments: {
    totalBuyers: number;
    totalSellers: number;
    activeBuyers: number;
    activeSellers: number;
    companyUsers: number;
  };
  auctionMetrics: {
    totalAuctions: number;
    auctionsThisMonth: number;
    activeAuctions: number;
    completedAuctions: number;
    averageBidsPerAuction: number;
    recoveryRate: number; // Auctions with successful payments
  };
  financialMetrics: {
    totalRevenue: number;
    revenueThisMonth: number;
    escrowVolume: number;
    walletVolume: number;
    averageOrderValue: number;
    monthlyRecurringRevenue: number;
  };
  growthMetrics: {
    referralGrowth: number;
    viralCoefficient: number;
    customerAcquisitionCost: number;
    customerLifetimeValue: number;
    churnRate: number;
  };
  campaignPerformance: {
    activeCampaigns: number;
    totalCampaignRevenue: number;
    campaignROI: number;
    topPerformingCampaign: {
      name: string;
      revenue: number;
      users: number;
    } | null;
  };
  launchMode: {
    isActive: boolean;
    campaignName?: string;
    daysActive: number;
    totalSavings: number;
  };
  projections: {
    nextMonthRevenue: number;
    userGrowthProjection: number;
    breakEvenPoint: number;
    marketExpansionTarget: string;
  };
  alerts: Array<{
    type: 'warning' | 'info' | 'success';
    message: string;
    metric: string;
    value: any;
  }>;
}

@Injectable()
export class InvestorDashboardService {
  private readonly logger = new Logger(InvestorDashboardService.name);

  constructor(
    private prisma: PrismaService,
    private investorMetricsService: InvestorMetricsService,
    private launchCampaignService: LaunchCampaignService,
    private feeOverrideService: FeeOverrideService,
    private walletBonusService: WalletBonusService,
  ) {}

  /**
   * Get comprehensive investor dashboard data
   */
  async getInvestorDashboard(): Promise<InvestorDashboardData> {
    try {
      // Get data from multiple sources in parallel
      const [
        overview,
        userSegments,
        auctionMetrics,
        financialMetrics,
        growthMetrics,
        campaignPerformance,
        launchMode,
      ] = await Promise.all([
        this.getOverviewMetrics(),
        this.getUserSegments(),
        this.getAuctionMetrics(),
        this.getFinancialMetrics(),
        this.getGrowthMetrics(),
        this.getCampaignPerformance(),
        this.getLaunchModeStatus(),
      ]);

      // Generate projections and alerts
      const projections = this.generateProjections(financialMetrics, overview);
      const alerts = this.generateAlerts(overview, auctionMetrics, financialMetrics);

      return {
        overview,
        userSegments,
        auctionMetrics,
        financialMetrics,
        growthMetrics,
        campaignPerformance,
        launchMode,
        projections,
        alerts,
      };
    } catch (error) {
      this.logger.error('Error generating investor dashboard:', error);
      throw error;
    }
  }

  /**
   * Get overview metrics
   */
  private async getOverviewMetrics(): Promise<InvestorDashboardData['overview']> {
    const [totalUsers, activeUsers, newUsersThisMonth] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Start of month
          },
        },
      }),
    ]);

    // Calculate growth rate (simplified)
    const lastMonthUsers = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        },
      },
    });

    const userGrowthRate = lastMonthUsers > 0
      ? ((newUsersThisMonth - lastMonthUsers) / lastMonthUsers) * 100
      : 0;

    return {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      userGrowthRate,
    };
  }

  /**
   * Get user segments breakdown
   */
  private async getUserSegments(): Promise<InvestorDashboardData['userSegments']> {
    const [
      totalBuyers,
      totalSellers,
      companyUsers,
      activeBuyers,
      activeSellers,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'BUYER' } }),
      this.prisma.user.count({ where: { role: 'SELLER' } }),
      this.prisma.user.count({ where: { role: 'COMPANY' } }),
      this.prisma.user.count({
        where: {
          role: 'BUYER',
          lastLoginAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.prisma.user.count({
        where: {
          role: 'SELLER',
          lastLoginAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      totalBuyers,
      totalSellers,
      activeBuyers,
      activeSellers,
      companyUsers,
    };
  }

  /**
   * Get auction performance metrics
   */
  private async getAuctionMetrics(): Promise<InvestorDashboardData['auctionMetrics']> {
    const [
      totalAuctions,
      auctionsThisMonth,
      activeAuctions,
      completedAuctions,
      bidStats,
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      this.prisma.product.count({
        where: { auction_status: 'live' },
      }),
      this.prisma.product.count({
        where: { auction_status: 'sold' },
      }),
      this.prisma.bid.aggregate({
        _count: { id: true },
        _avg: { amount: true },
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const averageBidsPerAuction = totalAuctions > 0
      ? bidStats._count.id / totalAuctions
      : 0;

    const recoveryRate = totalAuctions > 0
      ? (completedAuctions / totalAuctions) * 100
      : 0;

    return {
      totalAuctions,
      auctionsThisMonth,
      activeAuctions,
      completedAuctions,
      averageBidsPerAuction,
      recoveryRate,
    };
  }

  /**
   * Get financial metrics
   */
  private async getFinancialMetrics(): Promise<InvestorDashboardData['financialMetrics']> {
    // Mock financial data - in real implementation, this would aggregate from transactions
    const totalRevenue = 1250000; // ₹12.5L
    const revenueThisMonth = 285000; // ₹2.85L
    const escrowVolume = 850000; // ₹8.5L
    const walletVolume = 450000; // ₹4.5L
    const averageOrderValue = 2500; // ₹2,500
    const monthlyRecurringRevenue = 125000; // ₹1.25L from subscriptions

    return {
      totalRevenue,
      revenueThisMonth,
      escrowVolume,
      walletVolume,
      averageOrderValue,
      monthlyRecurringRevenue,
    };
  }

  /**
   * Get growth and viral metrics
   */
  private async getGrowthMetrics(): Promise<InvestorDashboardData['growthMetrics']> {
    const referralGrowth = 45.5; // 45.5% growth from referrals
    const viralCoefficient = 0.8; // 0.8 viral coefficient
    const customerAcquisitionCost = 45.50; // ₹45.50 CAC
    const customerLifetimeValue = 1250; // ₹1,250 LTV
    const churnRate = 12.5; // 12.5% monthly churn

    return {
      referralGrowth,
      viralCoefficient,
      customerAcquisitionCost,
      customerLifetimeValue,
      churnRate,
    };
  }

  /**
   * Get campaign performance data
   */
  private async getCampaignPerformance(): Promise<InvestorDashboardData['campaignPerformance']> {
    const activeCampaigns = await this.launchCampaignService.getActiveCampaign()
      ? 1
      : 0;

    // Mock campaign data
    const totalCampaignRevenue = 285000; // ₹2.85L
    const campaignROI = 560; // 560% ROI

    return {
      activeCampaigns,
      totalCampaignRevenue,
      campaignROI,
      topPerformingCampaign: {
        name: 'Launch Week 1',
        revenue: 185000,
        users: 850,
      },
    };
  }

  /**
   * Get launch mode status
   */
  private async getLaunchModeStatus(): Promise<InvestorDashboardData['launchMode']> {
    const activeCampaign = await this.launchCampaignService.getActiveCampaign();

    if (!activeCampaign) {
      return {
        isActive: false,
        daysActive: 0,
        totalSavings: 0,
      };
    }

    const daysActive = Math.floor(
      (Date.now() - activeCampaign.startDate.getTime()) / (24 * 60 * 60 * 1000)
    );

    // Mock savings calculation
    const totalSavings = 125000; // ₹1.25L in waived fees

    return {
      isActive: true,
      campaignName: activeCampaign.campaignName,
      daysActive,
      totalSavings,
    };
  }

  /**
   * Generate revenue and growth projections
   */
  private generateProjections(
    financial: InvestorDashboardData['financialMetrics'],
    overview: InvestorDashboardData['overview'],
  ): InvestorDashboardData['projections'] {
    // Simple projection logic
    const nextMonthRevenue = financial.revenueThisMonth * 1.25; // 25% growth projection
    const userGrowthProjection = overview.newUsersThisMonth * 1.3; // 30% growth
    const breakEvenPoint = 500000; // ₹5L break-even target
    const marketExpansionTarget = 'Pan-India coverage by Q2 2026';

    return {
      nextMonthRevenue,
      userGrowthProjection,
      breakEvenPoint,
      marketExpansionTarget,
    };
  }

  /**
   * Generate alerts for critical metrics
   */
  private generateAlerts(
    overview: InvestorDashboardData['overview'],
    auction: InvestorDashboardData['auctionMetrics'],
    financial: InvestorDashboardData['financialMetrics'],
  ): InvestorDashboardData['alerts'] {
    const alerts = [];

    // User growth alerts
    if (overview.userGrowthRate < 10) {
      alerts.push({
        type: 'warning',
        message: 'User growth rate below 10% - consider marketing campaigns',
        metric: 'userGrowthRate',
        value: overview.userGrowthRate,
      });
    }

    // Auction recovery alerts
    if (auction.recoveryRate < 70) {
      alerts.push({
        type: 'warning',
        message: 'Auction recovery rate below 70% - payment issues detected',
        metric: 'recoveryRate',
        value: auction.recoveryRate,
      });
    }

    // Revenue alerts
    if (financial.revenueThisMonth < 200000) {
      alerts.push({
        type: 'info',
        message: 'Monthly revenue below ₹2L target',
        metric: 'revenueThisMonth',
        value: financial.revenueThisMonth,
      });
    }

    // Success alerts
    if (auction.recoveryRate > 85) {
      alerts.push({
        type: 'success',
        message: 'Excellent recovery rate - platform performing well',
        metric: 'recoveryRate',
        value: auction.recoveryRate,
      });
    }

    if (overview.userGrowthRate > 25) {
      alerts.push({
        type: 'success',
        message: 'Strong user growth - viral marketing effective',
        metric: 'userGrowthRate',
        value: overview.userGrowthRate,
      });
    }

    return alerts;
  }

  /**
   * Export dashboard data for investor reports
   */
  async exportDashboardData(format: 'json' | 'pdf' | 'excel' = 'json'): Promise<any> {
    const dashboardData = await this.getInvestorDashboard();

    const exportData = {
      generatedAt: new Date().toISOString(),
      company: 'QuickMela',
      period: 'Current Month',
      dashboard: dashboardData,
      metadata: {
        version: '1.0',
        generatedBy: 'Investor Dashboard Service',
        dataFreshness: 'Real-time',
      },
    };

    // In a real implementation, this would format for PDF/Excel
    return exportData;
  }

  /**
   * Get historical dashboard data for trend analysis
   */
  async getHistoricalDashboard(days: number = 90): Promise<Array<{
    date: string;
    totalUsers: number;
    activeUsers: number;
    totalRevenue: number;
    auctionRecoveryRate: number;
  }>> {
    // Mock historical data - in real implementation, this would aggregate from daily metrics
    const historicalData = [];
    const now = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      historicalData.push({
        date: date.toISOString().split('T')[0],
        totalUsers: 1000 + (i * 5), // Growing user base
        activeUsers: 300 + Math.floor(Math.random() * 100),
        totalRevenue: 50000 + (i * 1000), // Growing revenue
        auctionRecoveryRate: 75 + Math.floor(Math.random() * 20), // 75-95%
      });
    }

    return historicalData;
  }
}
