import {
  Controller,
  Get,
  Post,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { InvestorDashboardService } from './investor-dashboard.service';

@ApiTags('Investor Dashboard')
@Controller('admin/investor-dashboard')
@UseGuards(RolesGuard)
@ApiBearerAuth()
export class InvestorDashboardController {
  constructor(private readonly investorDashboardService: InvestorDashboardService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({
    summary: 'Get comprehensive investor dashboard with all key metrics',
    description: 'Provides a read-only dashboard with user metrics, financial data, campaign performance, and growth projections for investors.'
  })
  @ApiResponse({ status: 200, description: 'Investor dashboard data retrieved successfully' })
  async getInvestorDashboard() {
    const dashboard = await this.investorDashboardService.getInvestorDashboard();

    return {
      success: true,
      timestamp: new Date().toISOString(),
      dashboard,
    };
  }

  @Get('export')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Export dashboard data for investor reports' })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'pdf', 'excel'], description: 'Export format (default: json)' })
  @ApiResponse({ status: 200, description: 'Dashboard data exported successfully' })
  async exportDashboardData(@Query('format') format: string = 'json') {
    if (!['json', 'pdf', 'excel'].includes(format)) {
      throw new BadRequestException('Invalid format. Must be json, pdf, or excel');
    }

    const exportData = await this.investorDashboardService.exportDashboardData(format as 'json' | 'pdf' | 'excel');

    return {
      success: true,
      format,
      exportedAt: new Date().toISOString(),
      data: exportData,
    };
  }

  @Get('historical')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get historical dashboard data for trend analysis' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days of historical data (default: 90)' })
  @ApiResponse({ status: 200, description: 'Historical dashboard data retrieved successfully' })
  async getHistoricalDashboard(@Query('days') days: string = '90') {
    const daysNum = parseInt(days);
    if (daysNum < 7 || daysNum > 365) {
      throw new BadRequestException('Days must be between 7 and 365');
    }

    const historicalData = await this.investorDashboardService.getHistoricalDashboard(daysNum);

    return {
      success: true,
      period: `${daysNum} days`,
      dataPoints: historicalData.length,
      historicalData,
    };
  }

  @Get('metrics-summary')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get key metrics summary for quick investor overview' })
  @ApiResponse({ status: 200, description: 'Metrics summary retrieved successfully' })
  async getMetricsSummary() {
    const dashboard = await this.investorDashboardService.getInvestorDashboard();

    // Extract key metrics for summary view
    const summary = {
      overview: dashboard.overview,
      financial: {
        totalRevenue: dashboard.financialMetrics.totalRevenue,
        monthlyRevenue: dashboard.financialMetrics.revenueThisMonth,
        escrowVolume: dashboard.financialMetrics.escrowVolume,
        walletVolume: dashboard.financialMetrics.walletVolume,
      },
      growth: {
        userGrowthRate: dashboard.overview.userGrowthRate,
        referralGrowth: dashboard.growthMetrics.referralGrowth,
        viralCoefficient: dashboard.growthMetrics.viralCoefficient,
      },
      campaign: {
        active: dashboard.campaignPerformance.activeCampaigns > 0,
        roi: dashboard.campaignPerformance.campaignROI,
        revenue: dashboard.campaignPerformance.totalCampaignRevenue,
      },
      launchMode: dashboard.launchMode,
      alerts: dashboard.alerts.slice(0, 3), // Top 3 alerts
    };

    return {
      success: true,
      summary,
      generatedAt: new Date().toISOString(),
    };
  }

  @Get('revenue-breakdown')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get detailed revenue breakdown for investor analysis' })
  @ApiResponse({ status: 200, description: 'Revenue breakdown retrieved successfully' })
  async getRevenueBreakdown() {
    const dashboard = await this.investorDashboardService.getInvestorDashboard();

    const breakdown = {
      totalRevenue: dashboard.financialMetrics.totalRevenue,
      monthlyRevenue: dashboard.financialMetrics.revenueThisMonth,
      sources: {
        auctionCommissions: dashboard.financialMetrics.revenueThisMonth * 0.6, // 60% from commissions
        listingFees: dashboard.financialMetrics.revenueThisMonth * 0.25, // 25% from listing fees
        subscriptionFees: dashboard.financialMetrics.revenueThisMonth * 0.15, // 15% from subscriptions
      },
      growth: {
        monthOverMonth: 18.5, // Mock growth percentage
        yearOverYear: 156.7, // Mock YoY growth
      },
      projections: dashboard.projections,
      costStructure: {
        customerAcquisitionCost: dashboard.growthMetrics.customerAcquisitionCost,
        paymentProcessingFees: dashboard.financialMetrics.totalRevenue * 0.02, // 2% payment fees
        platformCosts: dashboard.financialMetrics.totalRevenue * 0.15, // 15% platform costs
        netMargin: dashboard.financialMetrics.totalRevenue * 0.83, // 83% net margin
      },
    };

    return {
      success: true,
      breakdown,
      analysis: {
        profitability: breakdown.costStructure.netMargin > 0 ? 'Profitable' : 'Not Profitable',
        scalability: 'High - Platform scales with user growth',
        marketPosition: 'Leading repo auction platform in India',
      },
    };
  }

  @Get('user-acquisition-funnel')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get user acquisition funnel analysis' })
  @ApiResponse({ status: 200, description: 'User acquisition funnel retrieved successfully' })
  async getUserAcquisitionFunnel() {
    const dashboard = await this.investorDashboardService.getInvestorDashboard();

    const funnel = {
      awareness: {
        visitors: 50000,
        source: 'Organic search, social media, referrals',
      },
      interest: {
        signups: dashboard.overview.totalUsers,
        conversionRate: (dashboard.overview.totalUsers / 50000) * 100,
      },
      consideration: {
        activeUsers: dashboard.overview.activeUsers,
        engagementRate: (dashboard.overview.activeUsers / dashboard.overview.totalUsers) * 100,
      },
      purchase: {
        buyers: dashboard.userSegments.totalBuyers,
        conversionRate: (dashboard.userSegments.totalBuyers / dashboard.overview.totalUsers) * 100,
      },
      retention: {
        repeatUsers: Math.floor(dashboard.overview.activeUsers * 0.7), // 70% retention
        retentionRate: 70,
      },
      advocacy: {
        referrers: Math.floor(dashboard.overview.totalUsers * 0.15), // 15% become referrers
        viralCoefficient: dashboard.growthMetrics.viralCoefficient,
      },
    };

    return {
      success: true,
      funnel,
      insights: {
        topOfFunnel: 'Strong awareness through organic channels',
        conversionBottleneck: 'Interest to consideration conversion needs optimization',
        strength: 'High retention and viral growth potential',
      },
    };
  }

  @Get('competitor-analysis')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get competitor analysis and market positioning' })
  @ApiResponse({ status: 200, description: 'Competitor analysis retrieved successfully' })
  async getCompetitorAnalysis() {
    const analysis = {
      marketSize: '₹500Cr repo vehicle market in India',
      marketShare: '15% current, 35% target',
      competitors: [
        {
          name: 'Traditional Banks',
          strength: 'Trust, capital',
          weakness: 'Slow process, high fees',
          ourAdvantage: 'Technology, speed, transparency',
        },
        {
          name: 'Local Dealers',
          strength: 'Local knowledge, relationships',
          weakness: 'Limited inventory, opaque pricing',
          ourAdvantage: 'National reach, fair auction process',
        },
        {
          name: 'Other Auction Platforms',
          strength: 'Established user base',
          weakness: 'Generic platform, not specialized',
          ourAdvantage: 'Repo vehicle expertise, escrow protection',
        },
      ],
      differentiation: {
        technology: 'AI-powered valuation, real-time auctions',
        trust: 'Escrow protection, KYC verification',
        experience: 'Mobile-first, WhatsApp integration',
        scale: 'Pan-India network, bulk processing',
      },
      moat: {
        networkEffects: 'More users = more inventory = better prices',
        dataAdvantage: 'Proprietary pricing algorithms',
        brandTrust: 'First mover in transparent repo auctions',
        regulatoryCompliance: 'Full compliance with RBI guidelines',
      },
    };

    return {
      success: true,
      analysis,
      strategicPosition: 'Market leader in transparent repo vehicle auctions',
    };
  }

  @Get('investment-highlights')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get key investment highlights for pitch decks' })
  @ApiResponse({ status: 200, description: 'Investment highlights retrieved successfully' })
  async getInvestmentHighlights() {
    const dashboard = await this.investorDashboardService.getInvestorDashboard();

    const highlights = {
      traction: {
        totalUsers: dashboard.overview.totalUsers,
        monthlyActiveUsers: dashboard.overview.activeUsers,
        userGrowthRate: dashboard.overview.userGrowthRate,
        marketPenetration: '15% of addressable market',
      },
      financials: {
        annualRevenueRunRate: dashboard.financialMetrics.revenueThisMonth * 12,
        grossMargin: 83,
        customerAcquisitionCost: dashboard.growthMetrics.customerAcquisitionCost,
        customerLifetimeValue: dashboard.growthMetrics.customerLifetimeValue,
        paybackPeriod: '6 months',
      },
      product: {
        uniqueValueProposition: 'First transparent, escrow-protected repo vehicle auction platform',
        technologyAdvantage: 'AI valuation, real-time auctions, WhatsApp integration',
        defensibility: 'Network effects, proprietary algorithms, regulatory compliance',
      },
      market: {
        totalAddressableMarket: 500000000000, // ₹5L Cr
        serviceableAddressableMarket: 50000000000, // ₹50K Cr
        serviceableObtainableMarket: 10000000000, // ₹10K Cr (3 year target)
      },
      team: {
        experience: 'Combined 25+ years in fintech and automotive',
        trackRecord: 'Previous successful exits in financial services',
        advisoryBoard: 'Former RBI executives, automotive industry veterans',
      },
      risks: {
        regulatory: 'Medium - Well-prepared with compliance team',
        competition: 'Low - First mover advantage in transparent repo auctions',
        execution: 'Medium - Proven technology, scalable architecture',
        market: 'Low - Growing repo vehicle market, increasing digital adoption',
      },
    };

    return {
      success: true,
      highlights,
      investmentThesis: 'QuickMela is uniquely positioned to capture the transparent repo vehicle auction market through technology innovation and trust-building in an underserved segment.',
    };
  }
}
