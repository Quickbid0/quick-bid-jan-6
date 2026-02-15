import {
  Controller,
  Get,
  Post,
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
import { RecoveryOptimizationAIService } from './recovery-optimization-ai.service';

@ApiTags('recovery-optimization')
@Controller('recovery-optimization')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecoveryOptimizationAIController {
  constructor(private readonly recoveryAIService: RecoveryOptimizationAIService) {}

  @Get('metrics')
  @Roles('ADMIN', 'COMPANY_OWNER')
  @ApiOperation({ summary: 'Get recovery performance metrics' })
  @ApiQuery({ name: 'companyId', required: false, description: 'Filter by company ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO string)' })
  @ApiResponse({ status: 200, description: 'Recovery metrics retrieved successfully' })
  async getRecoveryMetrics(
    @Query('companyId') companyId?: string,
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string,
    @Req() req: Request
  ) {
    // Only allow company owners to see their own data, admins see all
    const userRole = (req as any).user?.role;
    const userCompanyId = (req as any).user?.companyId;

    if (userRole === 'COMPANY_OWNER' && !companyId) {
      companyId = userCompanyId;
    } else if (userRole !== 'ADMIN' && companyId !== userCompanyId) {
      throw new BadRequestException('Access denied');
    }

    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    return this.recoveryAIService.getRecoveryMetrics(companyId, startDate, endDate);
  }

  @Get('asset/:assetId/performance')
  @ApiOperation({ summary: 'Analyze individual asset performance' })
  @ApiResponse({ status: 200, description: 'Asset performance analysis retrieved' })
  async analyzeAssetPerformance(@Param('assetId') assetId: string) {
    return this.recoveryAIService.analyzeAssetPerformance(assetId);
  }

  @Get('market-insights')
  @Roles('ADMIN', 'COMPANY_OWNER')
  @ApiOperation({ summary: 'Get market insights and trends' })
  @ApiQuery({ name: 'region', required: false, description: 'Filter by region' })
  @ApiQuery({ name: 'assetType', required: false, description: 'Filter by asset type' })
  @ApiQuery({ name: 'months', required: false, description: 'Number of months for trends' })
  @ApiResponse({ status: 200, description: 'Market insights retrieved successfully' })
  async getMarketInsights(
    @Query('region') region?: string,
    @Query('assetType') assetType?: string,
    @Query('months') months?: string
  ) {
    const monthsNum = months ? parseInt(months) : 12;
    return this.recoveryAIService.getMarketInsights(region, assetType, monthsNum);
  }

  @Get('ai-recommendations')
  @Roles('ADMIN', 'COMPANY_OWNER')
  @ApiOperation({ summary: 'Get AI-driven optimization recommendations' })
  @ApiQuery({ name: 'companyId', required: false, description: 'Company ID for analysis' })
  @ApiResponse({ status: 200, description: 'AI recommendations retrieved successfully' })
  async getAIOptimizationRecommendations(
    @Query('companyId') companyId?: string,
    @Req() req: Request
  ) {
    const userRole = (req as any).user?.role;
    const userCompanyId = (req as any).user?.companyId;

    if (userRole === 'COMPANY_OWNER' && !companyId) {
      companyId = userCompanyId;
    } else if (userRole !== 'ADMIN') {
      companyId = userCompanyId;
    }

    if (!companyId) {
      throw new BadRequestException('Company ID required');
    }

    return this.recoveryAIService.getAIOptimizationRecommendations(companyId);
  }

  @Post('report/generate')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN', 'COMPANY_OWNER')
  @ApiOperation({ summary: 'Generate comprehensive recovery performance report' })
  @ApiResponse({ status: 200, description: 'Recovery report generated successfully' })
  async generateRecoveryReport(
    @Body() body: {
      companyId?: string;
      startDate: string;
      endDate: string;
    },
    @Req() req: Request
  ) {
    const userRole = (req as any).user?.role;
    const userCompanyId = (req as any).user?.companyId;
    let companyId = body.companyId;

    if (userRole === 'COMPANY_OWNER' && !companyId) {
      companyId = userCompanyId;
    } else if (userRole !== 'ADMIN') {
      companyId = userCompanyId;
    }

    if (!companyId) {
      throw new BadRequestException('Company ID required');
    }

    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    return this.recoveryAIService.generateRecoveryReport(companyId, startDate, endDate);
  }

  @Get('portfolio-analysis')
  @Roles('ADMIN', 'COMPANY_OWNER')
  @ApiOperation({ summary: 'Analyze portfolio performance and optimization opportunities' })
  @ApiQuery({ name: 'companyId', required: false, description: 'Company ID for analysis' })
  @ApiResponse({ status: 200, description: 'Portfolio analysis retrieved successfully' })
  async getPortfolioAnalysis(
    @Query('companyId') companyId?: string,
    @Req() req: Request
  ) {
    const userRole = (req as any).user?.role;
    const userCompanyId = (req as any).user?.companyId;

    if (userRole === 'COMPANY_OWNER' && !companyId) {
      companyId = userCompanyId;
    } else if (userRole !== 'ADMIN') {
      companyId = userCompanyId;
    }

    if (!companyId) {
      throw new BadRequestException('Company ID required');
    }

    // Get comprehensive portfolio analysis
    const [metrics, recommendations, insights] = await Promise.all([
      this.recoveryAIService.getRecoveryMetrics(companyId),
      this.recoveryAIService.getAIOptimizationRecommendations(companyId),
      this.recoveryAIService.getMarketInsights(),
    ]);

    return {
      portfolioOverview: metrics,
      optimizationRecommendations: recommendations,
      marketInsights: insights.slice(0, 5), // Top 5 insights
      riskAssessment: {
        overallRisk: metrics.recoveryTrend === 'improving' ? 'low' : 'medium',
        recommendations: [
          'Diversify asset portfolio across categories',
          'Monitor seasonal demand patterns',
          'Optimize reserve pricing based on AI recommendations',
          'Focus on high-demand regions and asset types',
        ],
      },
    };
  }

  @Get('performance-heatmap')
  @Roles('ADMIN', 'COMPANY_OWNER')
  @ApiOperation({ summary: 'Get region-based performance heatmap data' })
  @ApiQuery({ name: 'companyId', required: false, description: 'Company ID for analysis' })
  @ApiResponse({ status: 200, description: 'Performance heatmap data retrieved' })
  async getPerformanceHeatmap(
    @Query('companyId') companyId?: string,
    @Req() req: Request
  ) {
    const userRole = (req as any).user?.role;
    const userCompanyId = (req as any).user?.companyId;

    if (userRole === 'COMPANY_OWNER' && !companyId) {
      companyId = userCompanyId;
    } else if (userRole !== 'ADMIN') {
      companyId = userCompanyId;
    }

    // Generate heatmap data for different regions
    const regions = [
      { name: 'Delhi NCR', performance: 85, assets: 1250, recovery: 82 },
      { name: 'Mumbai', performance: 88, assets: 980, recovery: 85 },
      { name: 'Bangalore', performance: 82, assets: 750, recovery: 79 },
      { name: 'Chennai', performance: 79, assets: 620, recovery: 76 },
      { name: 'Hyderabad', performance: 84, assets: 580, recovery: 81 },
      { name: 'Pune', performance: 81, assets: 450, recovery: 78 },
      { name: 'Kolkata', performance: 76, assets: 380, recovery: 73 },
      { name: 'Ahmedabad', performance: 83, assets: 320, recovery: 80 },
    ];

    return {
      heatmap: regions.map(region => ({
        ...region,
        color: this.getHeatmapColor(region.performance),
        trend: Math.random() > 0.5 ? 'up' : 'down',
        growth: (Math.random() - 0.5) * 20, // -10% to +10%
      })),
      summary: {
        bestPerforming: regions.reduce((best, current) =>
          current.performance > best.performance ? current : best
        ),
        totalAssets: regions.reduce((sum, r) => sum + r.assets, 0),
        averageRecovery: regions.reduce((sum, r) => sum + r.recovery, 0) / regions.length,
        marketOpportunity: 'North India showing 15% higher demand',
      },
    };
  }

  // Private helper methods
  private getHeatmapColor(performance: number): string {
    if (performance >= 85) return 'green';
    if (performance >= 80) return 'light-green';
    if (performance >= 75) return 'yellow';
    if (performance >= 70) return 'orange';
    return 'red';
  }
}
