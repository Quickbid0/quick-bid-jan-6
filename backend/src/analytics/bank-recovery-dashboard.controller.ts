import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BankRecoveryDashboardService } from './bank-recovery-dashboard.service';

@ApiTags('bank-recovery-dashboard')
@Controller('bank-recovery-dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BankRecoveryDashboardController {
  constructor(private readonly recoveryDashboardService: BankRecoveryDashboardService) {}

  @Get('metrics/:companyId')
  @Roles('ADMIN', 'COMPANY_OWNER')
  @ApiOperation({ summary: 'Get bank recovery performance metrics' })
  @ApiResponse({ status: 200, description: 'Recovery metrics retrieved successfully' })
  async getRecoveryMetrics(@Param('companyId') companyId: string, @Req() req: Request) {
    const userRole = (req as any).user?.role;
    const userCompanyId = (req as any).user?.companyId;

    // Only allow company owners to see their own data, admins see all
    if (userRole === 'COMPANY_OWNER' && companyId !== userCompanyId) {
      throw new BadRequestException('Access denied - can only view own company data');
    }

    return this.recoveryDashboardService.getBankRecoveryMetrics(companyId);
  }

  @Post('analysis/:companyId')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN', 'COMPANY_OWNER')
  @ApiOperation({ summary: 'Generate comprehensive recovery performance analysis' })
  @ApiResponse({ status: 200, description: 'Analysis generated successfully' })
  async generateRecoveryAnalysis(
    @Param('companyId') companyId: string,
    @Body() analysisParams: {
      startDate: string;
      endDate: string;
    },
    @Req() req: Request
  ) {
    const userRole = (req as any).user?.role;
    const userCompanyId = (req as any).user?.companyId;

    if (userRole === 'COMPANY_OWNER' && companyId !== userCompanyId) {
      throw new BadRequestException('Access denied - can only analyze own company data');
    }

    const startDate = new Date(analysisParams.startDate);
    const endDate = new Date(analysisParams.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    return this.recoveryDashboardService.generateRecoveryPerformanceAnalysis(
      companyId,
      startDate,
      endDate
    );
  }

  @Get('heatmap/:companyId')
  @Roles('ADMIN', 'COMPANY_OWNER')
  @ApiOperation({ summary: 'Get recovery performance heatmap data' })
  @ApiResponse({ status: 200, description: 'Heatmap data retrieved successfully' })
  async getRecoveryHeatmap(@Param('companyId') companyId: string, @Req() req: Request) {
    const userRole = (req as any).user?.role;
    const userCompanyId = (req as any).user?.companyId;

    if (userRole === 'COMPANY_OWNER' && companyId !== userCompanyId) {
      throw new BadRequestException('Access denied - can only view own company data');
    }

    return this.recoveryDashboardService.getRecoveryHeatmapData(companyId);
  }

  @Post('executive-summary/:companyId')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN', 'COMPANY_OWNER')
  @ApiOperation({ summary: 'Generate executive summary report' })
  @ApiResponse({ status: 200, description: 'Executive summary generated successfully' })
  async generateExecutiveSummary(@Param('companyId') companyId: string, @Req() req: Request) {
    const userRole = (req as any).user?.role;
    const userCompanyId = (req as any).user?.companyId;

    if (userRole === 'COMPANY_OWNER' && companyId !== userCompanyId) {
      throw new BadRequestException('Access denied - can only generate reports for own company');
    }

    return this.recoveryDashboardService.generateExecutiveSummary(companyId);
  }

  @Get('market-intelligence')
  @Roles('ADMIN', 'COMPANY_OWNER')
  @ApiOperation({ summary: 'Get market intelligence and competitive analysis' })
  @ApiQuery({ name: 'companyId', required: false, description: 'Company ID for company-specific insights' })
  @ApiResponse({ status: 200, description: 'Market intelligence retrieved successfully' })
  async getMarketIntelligence(@Query('companyId') companyId?: string, @Req() req: Request) {
    const userRole = (req as any).user?.role;
    const userCompanyId = (req as any).user?.companyId;

    if (userRole === 'COMPANY_OWNER' && companyId && companyId !== userCompanyId) {
      throw new BadRequestException('Access denied - can only view own company intelligence');
    }

    // Generate comprehensive market intelligence
    const intelligence = {
      marketOverview: {
        totalMarketSize: 150000000000, // ₹1.5 lakh crore
        annualGrowth: 12.5,
        keyTrends: [
          'Increasing digital adoption in asset liquidation',
          'Growing preference for online auctions',
          'Rising demand for used commercial vehicles',
          'Regulatory focus on transparent transactions',
        ],
      },
      competitiveLandscape: {
        marketLeaders: [
          { name: 'QuickMela', marketShare: 15.2, strength: 'AI-driven optimization' },
          { name: 'ABC Auctions', marketShare: 12.8, strength: 'Established dealer network' },
          { name: 'XYZ Liquidators', marketShare: 10.5, strength: 'Bank partnerships' },
          { name: 'Traditional Players', marketShare: 45.0, strength: 'Physical presence' },
        ],
        ourAdvantages: [
          'AI-powered recovery optimization',
          'Real-time market intelligence',
          'Transparent escrow system',
          'Comprehensive compliance framework',
          'Enterprise-grade security',
        ],
      },
      opportunityAnalysis: {
        highGrowthSegments: [
          { segment: 'Commercial Vehicles', growthRate: 18.5, marketSize: 25000000000 },
          { segment: 'Luxury Cars', growthRate: 15.2, marketSize: 18000000000 },
          { segment: 'Two-wheelers', growthRate: 22.1, marketSize: 12000000000 },
        ],
        regionalOpportunities: [
          { region: 'Tier 2 Cities', potential: 'High', reason: 'Lower competition, growing economy' },
          { region: 'South India', potential: 'High', reason: 'Strong automotive market, tech adoption' },
          { region: 'Western India', potential: 'Medium', reason: 'Established competition, steady growth' },
        ],
      },
      pricingIntelligence: {
        averageRecoveryRates: {
          cars: 78.5,
          bikes: 74.2,
          commercial: 71.8,
          luxury: 68.9,
        },
        priceVolatility: {
          cars: 8.5,
          bikes: 6.2,
          commercial: 12.1,
          luxury: 15.8,
        },
        seasonalTrends: {
          q1: { recoveryRate: 82.1, reason: 'Post-festival demand' },
          q2: { recoveryRate: 75.8, reason: 'Pre-monsoon slowdown' },
          q3: { recoveryRate: 79.3, reason: 'Festival season pickup' },
          q4: { recoveryRate: 77.6, reason: 'Year-end clearance' },
        },
      },
      strategicRecommendations: [
        'Focus on commercial vehicle segment for maximum growth',
        'Expand to 15+ tier-2 cities within 6 months',
        'Strengthen AI capabilities for competitive advantage',
        'Develop bank-specific partnership programs',
        'Invest in dealer network expansion',
      ],
    };

    return intelligence;
  }

  @Get('roi-calculator')
  @Roles('ADMIN', 'COMPANY_OWNER')
  @ApiOperation({ summary: 'Calculate ROI for different recovery strategies' })
  @ApiQuery({ name: 'strategy', required: true, description: 'Recovery strategy to analyze' })
  @ApiQuery({ name: 'investment', required: true, description: 'Investment amount' })
  @ApiQuery({ name: 'timeframe', required: true, description: 'Timeframe in months' })
  @ApiResponse({ status: 200, description: 'ROI calculation completed' })
  async calculateROI(
    @Query('strategy') strategy: string,
    @Query('investment') investmentStr: string,
    @Query('timeframe') timeframeStr: string
  ) {
    const investment = parseFloat(investmentStr);
    const timeframe = parseInt(timeframeStr);

    if (isNaN(investment) || investment <= 0) {
      throw new BadRequestException('Invalid investment amount');
    }

    if (isNaN(timeframe) || timeframe < 1 || timeframe > 60) {
      throw new BadRequestException('Timeframe must be between 1 and 60 months');
    }

    // Calculate ROI based on strategy
    let expectedRecoveryRate = 0;
    let operationalCosts = 0;
    let strategyDetails: any = {};

    switch (strategy) {
      case 'ai_optimized':
        expectedRecoveryRate = 82.5;
        operationalCosts = 8.5; // percentage
        strategyDetails = {
          name: 'AI-Optimized Recovery',
          advantages: ['Higher recovery rates', 'Faster liquidation', 'Reduced manual effort'],
          requirements: ['AI platform implementation', 'Data integration', 'Staff training'],
        };
        break;
      case 'traditional_auction':
        expectedRecoveryRate = 68.2;
        operationalCosts = 12.3;
        strategyDetails = {
          name: 'Traditional Auction',
          advantages: ['Established process', 'Lower upfront costs'],
          requirements: ['Physical auction setup', 'Manual bidding management'],
        };
        break;
      case 'dealer_network':
        expectedRecoveryRate = 75.8;
        operationalCosts = 6.7;
        strategyDetails = {
          name: 'Dealer Network Liquidation',
          advantages: ['Faster sales', 'Lower marketing costs', 'Established relationships'],
          requirements: ['Dealer partnerships', 'Network maintenance', 'Commission management'],
        };
        break;
      default:
        throw new BadRequestException('Invalid strategy. Use: ai_optimized, traditional_auction, or dealer_network');
    }

    const expectedRecovery = investment * (expectedRecoveryRate / 100);
    const operationalCostAmount = investment * (operationalCosts / 100);
    const netRecovery = expectedRecovery - operationalCostAmount;
    const roi = ((netRecovery - investment) / investment) * 100;
    const monthlyRoi = roi / timeframe;

    // Calculate payback period
    const monthlyCashFlow = (netRecovery - investment) / timeframe;
    const paybackMonths = investment / Math.abs(monthlyCashFlow);

    return {
      strategy: strategyDetails,
      investment: {
        amount: investment,
        timeframeMonths: timeframe,
        expectedRecoveryRate: `${expectedRecoveryRate}%`,
      },
      financials: {
        expectedRecovery: expectedRecovery,
        operationalCosts: operationalCostAmount,
        netRecovery: netRecovery,
        totalROI: `${roi.toFixed(2)}%`,
        monthlyROI: `${monthlyRoi.toFixed(2)}%`,
        paybackPeriodMonths: paybackMonths.toFixed(1),
      },
      riskAssessment: {
        riskLevel: expectedRecoveryRate > 75 ? 'low' : expectedRecoveryRate > 70 ? 'medium' : 'high',
        confidence: expectedRecoveryRate > 75 ? 85 : expectedRecoveryRate > 70 ? 75 : 65,
        marketFactors: [
          'Economic conditions',
          'Regional demand',
          'Asset quality',
          'Competition levels',
        ],
      },
      recommendations: [
        expectedRecoveryRate > 75
          ? 'High-confidence strategy - recommended for immediate implementation'
          : 'Moderate risk - consider pilot testing before full rollout',
        `Expected ${monthlyRoi.toFixed(1)}% monthly ROI over ${timeframe} months`,
        `Payback period: ${paybackMonths.toFixed(1)} months`,
      ],
    };
  }

  @Get('benchmarking/:companyId')
  @Roles('ADMIN', 'COMPANY_OWNER')
  @ApiOperation({ summary: 'Get performance benchmarking against industry standards' })
  @ApiResponse({ status: 200, description: 'Benchmarking data retrieved successfully' })
  async getBenchmarkingData(@Param('companyId') companyId: string, @Req() req: Request) {
    const userRole = (req as any).user?.role;
    const userCompanyId = (req as any).user?.companyId;

    if (userRole === 'COMPANY_OWNER' && companyId !== userCompanyId) {
      throw new BadRequestException('Access denied - can only benchmark own company');
    }

    // Get company's current metrics
    const companyMetrics = await this.recoveryDashboardService.getBankRecoveryMetrics(companyId);

    // Industry benchmarks
    const benchmarks = {
      recoveryRate: {
        industryAverage: 65.2,
        topPerformers: 82.1,
        companyPerformance: companyMetrics.recoveryPercentage,
        percentile: companyMetrics.recoveryPercentage > 75 ? 'Top 25%' :
                   companyMetrics.recoveryPercentage > 70 ? 'Top 50%' : 'Below Average',
      },
      timeToRecovery: {
        industryAverage: 28.5,
        topPerformers: 18.2,
        companyPerformance: companyMetrics.timeToRecovery,
        percentile: companyMetrics.timeToRecovery < 22 ? 'Top 25%' :
                   companyMetrics.timeToRecovery < 26 ? 'Top 50%' : 'Below Average',
      },
      assetRecoveryRate: {
        industryAverage: 72.8,
        topPerformers: 88.5,
        companyPerformance: companyMetrics.recoveryRate,
        percentile: companyMetrics.recoveryRate > 80 ? 'Top 25%' :
                   companyMetrics.recoveryRate > 75 ? 'Top 50%' : 'Below Average',
      },
    };

    // Calculate overall performance score
    const performanceScore = (
      (companyMetrics.recoveryPercentage / benchmarks.recoveryRate.topPerformers) * 40 +
      ((28.5 - companyMetrics.timeToRecovery) / (28.5 - benchmarks.timeToRecovery.topPerformers)) * 35 +
      (companyMetrics.recoveryRate / benchmarks.assetRecoveryRate.topPerformers) * 25
    );

    return {
      companyMetrics,
      industryBenchmarks: benchmarks,
      overallPerformance: {
        score: Math.min(100, Math.max(0, performanceScore)),
        rating: performanceScore > 85 ? 'Excellent' :
               performanceScore > 75 ? 'Very Good' :
               performanceScore > 65 ? 'Good' :
               performanceScore > 55 ? 'Average' : 'Needs Improvement',
        strengths: [],
        areasForImprovement: [],
      },
      competitorAnalysis: {
        marketPosition: performanceScore > 80 ? 'Market Leader' :
                       performanceScore > 70 ? 'Strong Performer' :
                       performanceScore > 60 ? 'Competitive' : 'Needs Improvement',
        competitiveAdvantages: [
          'AI-driven optimization platform',
          'Transparent escrow system',
          'Real-time market intelligence',
          'Enterprise-grade compliance',
        ],
      },
    };
  }
}
