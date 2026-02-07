import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan } from 'typeorm';
import { Auction, AuctionStatus, AuctionType } from '../auctions/auction.entity';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface AnalyticsFilters {
  dateRange?: DateRange;
  auctionType?: AuctionType;
  sellerId?: string;
  category?: string;
  status?: AuctionStatus;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  revenueByMonth: { month: string; revenue: number }[];
  revenueByAuctionType: { type: AuctionType; revenue: number; percentage: number }[];
  revenueByCategory: { category: string; revenue: number; auctions: number }[];
  averageRevenuePerAuction: number;
  topRevenueAuctions: { auctionId: string; title: string; revenue: number; endDate: Date }[];
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsersByMonth: { month: string; newUsers: number }[];
  userRetentionRate: number;
  userEngagementMetrics: {
    averageBidsPerUser: number;
    averageAuctionsWonPerUser: number;
    averageSessionDuration: number;
    conversionRate: number;
  };
  userDemographics: {
    topCountries: { country: string; users: number }[];
    deviceTypes: { device: string; users: number }[];
    userSegments: { segment: string; users: number; percentage: number }[];
  };
}

export interface AuctionAnalytics {
  totalAuctions: number;
  auctionsByStatus: { status: AuctionStatus; count: number; percentage: number }[];
  auctionsByType: { type: AuctionType; count: number; percentage: number }[];
  auctionPerformance: {
    averageAuctionDuration: number;
    averageBidCount: number;
    averageFinalPrice: number;
    successRate: number; // auctions with bids / total auctions
  };
  popularCategories: { category: string; auctions: number; avgPrice: number; totalValue: number }[];
  timeBasedMetrics: {
    auctionsByHour: { hour: number; auctions: number }[];
    auctionsByDayOfWeek: { day: string; auctions: number }[];
    peakAuctionTimes: { hour: number; day: string; auctionCount: number }[];
  };
}

export interface BusinessIntelligenceReport {
  executiveSummary: {
    totalRevenue: number;
    totalUsers: number;
    totalAuctions: number;
    platformGrowth: number;
    keyMetrics: { metric: string; value: string; change: number }[];
  };
  revenueAnalysis: RevenueAnalytics;
  userAnalysis: UserAnalytics;
  auctionAnalysis: AuctionAnalytics;
  marketInsights: {
    trendingCategories: { category: string; growth: number; demand: number }[];
    priceTrends: { category: string; avgPrice: number; priceChange: number }[];
    competitorAnalysis: { competitor: string; marketShare: number; strengths: string[] }[];
  };
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    category: string;
    recommendation: string;
    expectedImpact: string;
    implementationEffort: string;
  }[];
}

@Injectable()
export class AdvancedAnalyticsService {
  private readonly logger = new Logger(AdvancedAnalyticsService.name);

  constructor(
    @InjectRepository(Auction)
    private auctionRepository: Repository<Auction>,
    private prismaService: PrismaService,
  ) {}

  async generateRevenueAnalytics(filters?: AnalyticsFilters): Promise<RevenueAnalytics> {
    const { dateRange } = filters || {};

    // Get all completed auctions
    const queryBuilder = this.auctionRepository
      .createQueryBuilder('auction')
      .where('auction.status = :status', { status: 'ended' });

    if (dateRange) {
      queryBuilder.andWhere('auction.endTime BETWEEN :start AND :end', {
        start: dateRange.startDate,
        end: dateRange.endDate,
      });
    }

    const completedAuctions = await queryBuilder.getMany();

    // Calculate revenue (assuming commission-based model)
    const commissionRate = 0.05; // 5% commission
    const totalRevenue = completedAuctions.reduce((sum, auction) => {
      return sum + (Number(auction.currentPrice) * commissionRate);
    }, 0);

    // Revenue by month
    const revenueByMonth = await this.calculateRevenueByMonth(dateRange);

    // Revenue by auction type
    const revenueByAuctionType = await this.calculateRevenueByAuctionType(dateRange);

    // Revenue by category
    const revenueByCategory = await this.calculateRevenueByCategory(dateRange);

    // Average revenue per auction
    const averageRevenuePerAuction = completedAuctions.length > 0
      ? totalRevenue / completedAuctions.length
      : 0;

    // Top revenue auctions
    const topRevenueAuctions = completedAuctions
      .sort((a, b) => Number(b.currentPrice) - Number(a.currentPrice))
      .slice(0, 10)
      .map(auction => ({
        auctionId: auction.id,
        title: auction.title,
        revenue: Number(auction.currentPrice) * commissionRate,
        endDate: auction.endTime,
      }));

    return {
      totalRevenue,
      revenueByMonth,
      revenueByAuctionType,
      revenueByCategory,
      averageRevenuePerAuction,
      topRevenueAuctions,
    };
  }

  async generateUserAnalytics(filters?: AnalyticsFilters): Promise<UserAnalytics> {
    const { dateRange } = filters || {};

    // User counts
    const totalUsers = await this.prismaService.user.count();
    const activeUsers = await this.prismaService.user.count({
      where: { status: 'ACTIVE' }
    });

    // New users by month
    const newUsersByMonth = await this.calculateNewUsersByMonth(dateRange);

    // User retention rate (simplified calculation)
    const userRetentionRate = await this.calculateUserRetention();

    // User engagement metrics
    const userEngagementMetrics = await this.calculateUserEngagementMetrics();

    // User demographics
    const userDemographics = await this.calculateUserDemographics();

    return {
      totalUsers,
      activeUsers,
      newUsersByMonth,
      userRetentionRate,
      userEngagementMetrics,
      userDemographics,
    };
  }

  async generateAuctionAnalytics(filters?: AnalyticsFilters): Promise<AuctionAnalytics> {
    const { dateRange } = filters || {};

    // Basic auction counts
    const totalAuctions = await this.auctionRepository.count();

    // Auctions by status
    const auctionsByStatus = await this.calculateAuctionsByStatus();

    // Auctions by type
    const auctionsByType = await this.calculateAuctionsByType();

    // Auction performance metrics
    const auctionPerformance = await this.calculateAuctionPerformance();

    // Popular categories
    const popularCategories = await this.calculatePopularCategories();

    // Time-based metrics
    const timeBasedMetrics = await this.calculateTimeBasedMetrics();

    return {
      totalAuctions,
      auctionsByStatus,
      auctionsByType,
      auctionPerformance,
      popularCategories,
      timeBasedMetrics,
    };
  }

  async generateBusinessIntelligenceReport(filters?: AnalyticsFilters): Promise<BusinessIntelligenceReport> {
    // Generate all analytics in parallel
    const [revenueAnalysis, userAnalysis, auctionAnalysis] = await Promise.all([
      this.generateRevenueAnalytics(filters),
      this.generateUserAnalytics(filters),
      this.generateAuctionAnalytics(filters),
    ]);

    // Executive summary
    const executiveSummary = {
      totalRevenue: revenueAnalysis.totalRevenue,
      totalUsers: userAnalysis.totalUsers,
      totalAuctions: auctionAnalysis.totalAuctions,
      platformGrowth: this.calculatePlatformGrowth(revenueAnalysis, userAnalysis),
      keyMetrics: this.calculateKeyMetrics(revenueAnalysis, userAnalysis, auctionAnalysis),
    };

    // Market insights
    const marketInsights = await this.generateMarketInsights();

    // AI-generated recommendations
    const recommendations = await this.generateAIRecommendations(
      revenueAnalysis,
      userAnalysis,
      auctionAnalysis
    );

    return {
      executiveSummary,
      revenueAnalysis,
      userAnalysis,
      auctionAnalysis,
      marketInsights,
      recommendations,
    };
  }

  async exportReportToExcel(report: BusinessIntelligenceReport, filename?: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'QuickMela Analytics';
    workbook.created = new Date();

    // Executive Summary Sheet
    const summarySheet = workbook.addWorksheet('Executive Summary');
    summarySheet.addRow(['QuickMela Business Intelligence Report']);
    summarySheet.addRow(['Generated on', new Date().toLocaleDateString()]);
    summarySheet.addRow([]);
    summarySheet.addRow(['Total Revenue', report.executiveSummary.totalRevenue]);
    summarySheet.addRow(['Total Users', report.executiveSummary.totalUsers]);
    summarySheet.addRow(['Total Auctions', report.executiveSummary.totalAuctions]);
    summarySheet.addRow(['Platform Growth', `${report.executiveSummary.platformGrowth}%`]);

    // Revenue Analysis Sheet
    const revenueSheet = workbook.addWorksheet('Revenue Analysis');
    revenueSheet.addRow(['Month', 'Revenue']);
    report.revenueAnalysis.revenueByMonth.forEach(item => {
      revenueSheet.addRow([item.month, item.revenue]);
    });

    // User Analysis Sheet
    const userSheet = workbook.addWorksheet('User Analysis');
    userSheet.addRow(['Month', 'New Users']);
    report.userAnalysis.newUsersByMonth.forEach(item => {
      userSheet.addRow([item.month, item.newUsers]);
    });

    // Auction Analysis Sheet
    const auctionSheet = workbook.addWorksheet('Auction Analysis');
    auctionSheet.addRow(['Category', 'Auctions', 'Avg Price', 'Total Value']);
    report.auctionAnalysis.popularCategories.forEach(item => {
      auctionSheet.addRow([item.category, item.auctions, item.avgPrice, item.totalValue]);
    });

    return await workbook.xlsx.writeBuffer() as unknown as Buffer;
  }

  async exportReportToPDF(report: BusinessIntelligenceReport, filename?: string): Promise<Buffer> {
    return new Promise((resolve) => {
      const buffers: Buffer[] = [];
      const doc = new PDFDocument();

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Title
      doc.fontSize(20).text('QuickMela Business Intelligence Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown(2);

      // Executive Summary
      doc.fontSize(16).text('Executive Summary');
      doc.moveDown();
      doc.fontSize(10)
        .text(`Total Revenue: ₹${report.executiveSummary.totalRevenue.toLocaleString()}`)
        .text(`Total Users: ${report.executiveSummary.totalUsers}`)
        .text(`Total Auctions: ${report.executiveSummary.totalAuctions}`)
        .text(`Platform Growth: ${report.executiveSummary.platformGrowth}%`);

      doc.end();
    });
  }

  async scheduleReport(
    reportType: 'daily' | 'weekly' | 'monthly',
    recipients: string[],
    filters?: AnalyticsFilters
  ): Promise<{ success: boolean; reportId: string }> {
    // In real implementation, this would use a job queue like Bull
    const reportId = `report_${Date.now()}`;

    // Mock scheduling
    console.log(`Scheduled ${reportType} report for ${recipients.join(', ')}`);

    return { success: true, reportId };
  }

  async getCustomReport(
    metrics: string[],
    filters: AnalyticsFilters,
    groupBy?: string[],
    dateRange?: DateRange
  ): Promise<any> {
    // Generate custom report based on requested metrics
    const report: any = {};

    for (const metric of metrics) {
      switch (metric) {
        case 'revenue':
          report.revenue = await this.generateRevenueAnalytics(filters);
          break;
        case 'users':
          report.users = await this.generateUserAnalytics(filters);
          break;
        case 'auctions':
          report.auctions = await this.generateAuctionAnalytics(filters);
          break;
      }
    }

    return report;
  }

  // Private helper methods
  private async calculateRevenueByMonth(dateRange?: DateRange): Promise<{ month: string; revenue: number }[]> {
    const months: { month: string; revenue: number }[] = [];

    // Mock data - in real implementation, aggregate from database
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

      months.push({
        month: monthStr,
        revenue: Math.floor(Math.random() * 100000) + 50000,
      });
    }

    return months;
  }

  private async calculateRevenueByAuctionType(dateRange?: DateRange): Promise<{ type: AuctionType; revenue: number; percentage: number }[]> {
    // Mock data
    const totalRevenue = 500000;
    return [
      { type: 'live' as AuctionType, revenue: 200000, percentage: 40 },
      { type: 'timed' as AuctionType, revenue: 250000, percentage: 50 },
      { type: 'flash' as AuctionType, revenue: 35000, percentage: 7 },
      { type: 'tender' as AuctionType, revenue: 15000, percentage: 3 },
    ];
  }

  private async calculateRevenueByCategory(dateRange?: DateRange): Promise<{ category: string; revenue: number; auctions: number }[]> {
    // Mock data
    return [
      { category: 'Electronics', revenue: 150000, auctions: 45 },
      { category: 'Jewelry', revenue: 120000, auctions: 38 },
      { category: 'Art', revenue: 80000, auctions: 25 },
      { category: 'Vehicles', revenue: 100000, auctions: 15 },
    ];
  }

  private async calculateNewUsersByMonth(dateRange?: DateRange): Promise<{ month: string; newUsers: number }[]> {
    const months: { month: string; newUsers: number }[] = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

      months.push({
        month: monthStr,
        newUsers: Math.floor(Math.random() * 200) + 50,
      });
    }

    return months;
  }

  private async calculateUserRetention(): Promise<number> {
    // Mock calculation
    return 78.5;
  }

  private async calculateUserEngagementMetrics(): Promise<UserAnalytics['userEngagementMetrics']> {
    return {
      averageBidsPerUser: 12.4,
      averageAuctionsWonPerUser: 2.1,
      averageSessionDuration: 25.3,
      conversionRate: 68.5,
    };
  }

  private async calculateUserDemographics(): Promise<UserAnalytics['userDemographics']> {
    return {
      topCountries: [
        { country: 'India', users: 1250 },
        { country: 'United States', users: 340 },
        { country: 'United Kingdom', users: 180 },
      ],
      deviceTypes: [
        { device: 'Mobile', users: 890 },
        { device: 'Desktop', users: 650 },
        { device: 'Tablet', users: 230 },
      ],
      userSegments: [
        { segment: 'High Value', users: 150, percentage: 12 },
        { segment: 'Regular', users: 850, percentage: 68 },
        { segment: 'New', users: 300, percentage: 24 },
      ],
    };
  }

  private async calculateAuctionsByStatus(): Promise<{ status: AuctionStatus; count: number; percentage: number }[]> {
    const total = await this.auctionRepository.count();
    const statusCounts = await this.auctionRepository
      .createQueryBuilder('auction')
      .select('auction.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('auction.status')
      .getRawMany();

    return statusCounts.map(item => ({
      status: item.status as AuctionStatus,
      count: parseInt(item.count),
      percentage: total > 0 ? (parseInt(item.count) / total) * 100 : 0,
    }));
  }

  private async calculateAuctionsByType(): Promise<{ type: AuctionType; count: number; percentage: number }[]> {
    const total = await this.auctionRepository.count();
    const typeCounts = await this.auctionRepository
      .createQueryBuilder('auction')
      .select('auction.auctionType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('auction.auctionType')
      .getRawMany();

    return typeCounts.map(item => ({
      type: item.type as AuctionType,
      count: parseInt(item.count),
      percentage: total > 0 ? (parseInt(item.count) / total) * 100 : 0,
    }));
  }

  private async calculateAuctionPerformance(): Promise<AuctionAnalytics['auctionPerformance']> {
    const completedAuctions = await this.auctionRepository.find({
      where: { status: 'ended' }
    });

    if (completedAuctions.length === 0) {
      return {
        averageAuctionDuration: 0,
        averageBidCount: 0,
        averageFinalPrice: 0,
        successRate: 0,
      };
    }

    const totalDuration = completedAuctions.reduce((sum, auction) => {
      const duration = auction.endTime.getTime() - auction.startTime.getTime();
      return sum + (duration / (1000 * 60 * 60)); // hours
    }, 0);

    const averageDuration = totalDuration / completedAuctions.length;
    const averageBidCount = completedAuctions.reduce((sum, auction) => sum + auction.totalBids, 0) / completedAuctions.length;
    const averageFinalPrice = completedAuctions.reduce((sum, auction) => sum + Number(auction.currentPrice), 0) / completedAuctions.length;

    const totalAuctions = await this.auctionRepository.count();
    const successRate = totalAuctions > 0 ? (completedAuctions.length / totalAuctions) * 100 : 0;

    return {
      averageAuctionDuration: averageDuration,
      averageBidCount,
      averageFinalPrice,
      successRate,
    };
  }

  private async calculatePopularCategories(): Promise<AuctionAnalytics['popularCategories']> {
    const categoryStats = await this.auctionRepository
      .createQueryBuilder('auction')
      .select('auction.category', 'category')
      .addSelect('COUNT(*)', 'auctions')
      .addSelect('AVG(auction.currentPrice)', 'avgPrice')
      .addSelect('SUM(auction.currentPrice)', 'totalValue')
      .where('auction.category IS NOT NULL')
      .groupBy('auction.category')
      .orderBy('auctions', 'DESC')
      .limit(10)
      .getRawMany();

    return categoryStats.map(item => ({
      category: item.category || 'Uncategorized',
      auctions: parseInt(item.auctions),
      avgPrice: Number(item.avgPrice || 0),
      totalValue: Number(item.totalValue || 0),
    }));
  }

  private async calculateTimeBasedMetrics(): Promise<AuctionAnalytics['timeBasedMetrics']> {
    // Mock data for time-based metrics
    const auctionsByHour = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      auctions: Math.floor(Math.random() * 50) + 10,
    }));

    const auctionsByDayOfWeek = [
      { day: 'Monday', auctions: 120 },
      { day: 'Tuesday', auctions: 135 },
      { day: 'Wednesday', auctions: 148 },
      { day: 'Thursday', auctions: 142 },
      { day: 'Friday', auctions: 165 },
      { day: 'Saturday', auctions: 180 },
      { day: 'Sunday', auctions: 156 },
    ];

    const peakAuctionTimes = [
      { hour: 20, day: 'Friday', auctionCount: 45 },
      { hour: 19, day: 'Saturday', auctionCount: 42 },
      { hour: 21, day: 'Thursday', auctionCount: 38 },
    ];

    return {
      auctionsByHour,
      auctionsByDayOfWeek,
      peakAuctionTimes,
    };
  }

  private calculatePlatformGrowth(revenue: RevenueAnalytics, users: UserAnalytics): number {
    // Calculate month-over-month growth
    if (revenue.revenueByMonth.length < 2) return 0;

    const currentMonth = revenue.revenueByMonth[revenue.revenueByMonth.length - 1];
    const previousMonth = revenue.revenueByMonth[revenue.revenueByMonth.length - 2];

    if (previousMonth.revenue === 0) return 0;

    return ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100;
  }

  private calculateKeyMetrics(
    revenue: RevenueAnalytics,
    users: UserAnalytics,
    auctions: AuctionAnalytics
  ): { metric: string; value: string; change: number }[] {
    return [
      {
        metric: 'Monthly Revenue',
        value: `₹${revenue.revenueByMonth[revenue.revenueByMonth.length - 1]?.revenue.toLocaleString() || '0'}`,
        change: this.calculatePlatformGrowth(revenue, users),
      },
      {
        metric: 'Active Users',
        value: users.activeUsers.toString(),
        change: 12.5, // Mock change percentage
      },
      {
        metric: 'Total Auctions',
        value: auctions.totalAuctions.toString(),
        change: 8.3, // Mock change percentage
      },
      {
        metric: 'Conversion Rate',
        value: `${users.userEngagementMetrics.conversionRate}%`,
        change: 5.2, // Mock change percentage
      },
    ];
  }

  private async generateMarketInsights(): Promise<BusinessIntelligenceReport['marketInsights']> {
    // Mock market insights
    return {
      trendingCategories: [
        { category: 'AI Technology', growth: 45.2, demand: 8.7 },
        { category: 'Sustainable Fashion', growth: 32.1, demand: 6.4 },
        { category: 'Electric Vehicles', growth: 28.9, demand: 7.2 },
      ],
      priceTrends: [
        { category: 'Electronics', avgPrice: 15000, priceChange: 12.5 },
        { category: 'Jewelry', avgPrice: 25000, priceChange: -3.2 },
        { category: 'Art', avgPrice: 35000, priceChange: 18.7 },
      ],
      competitorAnalysis: [
        {
          competitor: 'Competitor A',
          marketShare: 25.4,
          strengths: ['Large user base', 'Established brand']
        },
        {
          competitor: 'Competitor B',
          marketShare: 18.7,
          strengths: ['Mobile-first design', 'Fast auctions']
        },
      ],
    };
  }

  private async generateAIRecommendations(
    revenue: RevenueAnalytics,
    users: UserAnalytics,
    auctions: AuctionAnalytics
  ): Promise<BusinessIntelligenceReport['recommendations']> {
    const recommendations: BusinessIntelligenceReport['recommendations'] = [];

    // Revenue-based recommendations
    if (revenue.averageRevenuePerAuction < 1000) {
      recommendations.push({
        priority: 'high',
        category: 'Revenue Optimization',
        recommendation: 'Implement dynamic pricing suggestions for sellers to increase average auction values',
        expectedImpact: '15-20% increase in average revenue per auction',
        implementationEffort: 'Medium',
      });
    }

    // User engagement recommendations
    if (users.userEngagementMetrics.conversionRate < 70) {
      recommendations.push({
        priority: 'high',
        category: 'User Engagement',
        recommendation: 'Enhance onboarding flow and provide personalized auction recommendations',
        expectedImpact: '10-15% improvement in user conversion rate',
        implementationEffort: 'Medium',
      });
    }

    // Auction performance recommendations
    if (auctions.auctionPerformance.successRate < 80) {
      recommendations.push({
        priority: 'medium',
        category: 'Auction Optimization',
        recommendation: 'Implement auction ending notifications and extend popular auctions automatically',
        expectedImpact: 'Increase auction completion rate by 15%',
        implementationEffort: 'Low',
      });
    }

    // Add more AI-generated recommendations
    recommendations.push({
      priority: 'medium',
      category: 'Market Expansion',
      recommendation: 'Launch targeted marketing campaigns for high-growth categories like AI Technology',
      expectedImpact: '25% increase in new user acquisition',
      implementationEffort: 'High',
    });

    return recommendations;
  }
}
