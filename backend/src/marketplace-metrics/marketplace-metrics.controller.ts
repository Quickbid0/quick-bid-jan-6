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
import { MarketplaceMetricsService } from './marketplace-metrics.service';

@ApiTags('Marketplace Growth Tracking')
@Controller('marketplace-metrics')
@UseGuards(RolesGuard)
@ApiBearerAuth()
export class MarketplaceMetricsController {
  constructor(private readonly marketplaceMetricsService: MarketplaceMetricsService) {}

  @Get('latest')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get latest marketplace metrics summary' })
  @ApiResponse({ status: 200, description: 'Latest metrics retrieved successfully' })
  async getLatestMetricsSummary() {
    const summary = await this.marketplaceMetricsService.getLatestMetricsSummary();

    return {
      summary,
      generatedAt: new Date().toISOString(),
    };
  }

  @Get('range')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get marketplace metrics for a date range' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: true, description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Metrics range retrieved successfully' })
  async getMetricsForDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    if (start > end) {
      throw new BadRequestException('Start date must be before end date');
    }

    const maxDays = 365;
    const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff > maxDays) {
      throw new BadRequestException(`Date range cannot exceed ${maxDays} days`);
    }

    const metrics = await this.marketplaceMetricsService.getMetricsForDateRange(start, end);

    return {
      metrics,
      dateRange: {
        start: startDate,
        end: endDate,
        days: daysDiff + 1,
      },
      totalRecords: metrics.length,
    };
  }

  @Get('growth-trends')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get growth trends over time' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days to analyze (default: 30)' })
  @ApiResponse({ status: 200, description: 'Growth trends retrieved successfully' })
  async getGrowthTrends(@Query('days') days: string = '30') {
    const daysNum = parseInt(days);
    if (daysNum < 7 || daysNum > 365) {
      throw new BadRequestException('Days must be between 7 and 365');
    }

    const trends = await this.marketplaceMetricsService.getGrowthTrends(daysNum);

    return {
      trends,
      period: `${daysNum} days`,
      analysis: {
        userGrowthTrend: this.calculateTrendDirection(trends.userGrowth),
        revenueGrowthTrend: this.calculateTrendDirection(trends.revenueGrowth),
        auctionGrowthTrend: this.calculateTrendDirection(trends.auctionGrowth),
      },
    };
  }

  @Post('aggregate')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Manually trigger daily metrics aggregation' })
  @ApiResponse({ status: 200, description: 'Metrics aggregation triggered successfully' })
  async triggerMetricsAggregation() {
    await this.marketplaceMetricsService.triggerMetricsAggregation();

    return {
      success: true,
      message: 'Daily metrics aggregation triggered successfully',
      triggeredAt: new Date().toISOString(),
    };
  }

  @Get('performance-analysis')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get comprehensive performance analysis' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days to analyze (default: 30)' })
  @ApiResponse({ status: 200, description: 'Performance analysis retrieved successfully' })
  async getPerformanceAnalysis(@Query('days') days: string = '30') {
    const daysNum = parseInt(days);
    if (daysNum < 7 || daysNum > 90) {
      throw new BadRequestException('Days must be between 7 and 90');
    }

    const trends = await this.marketplaceMetricsService.getGrowthTrends(daysNum);

    // Calculate key performance indicators
    const kpis = {
      userAcquisition: {
        totalNewUsers: trends.userGrowth.reduce((sum, val) => sum + val, 0),
        averageDailyNewUsers: trends.userGrowth.reduce((sum, val) => sum + val, 0) / daysNum,
        growthRate: this.calculateAverageGrowthRate(trends.userGrowth),
      },
      auctionPerformance: {
        totalAuctions: trends.auctionGrowth.reduce((sum, val) => sum + val, 0),
        averageDailyAuctions: trends.auctionGrowth.reduce((sum, val) => sum + val, 0) / daysNum,
        auctionGrowthRate: this.calculateAverageGrowthRate(trends.auctionGrowth),
      },
      financialPerformance: {
        totalRevenue: trends.revenueGrowth.reduce((sum, val) => sum + val, 0),
        averageDailyRevenue: trends.revenueGrowth.reduce((sum, val) => sum + val, 0) / daysNum,
        revenueGrowthRate: this.calculateAverageGrowthRate(trends.revenueGrowth),
        revenuePerUser: trends.userGrowth.length > 0
          ? trends.revenueGrowth.reduce((sum, val) => sum + val, 0) / trends.userGrowth.reduce((sum, val) => sum + val, 0)
          : 0,
      },
      engagement: {
        auctionToUserRatio: trends.userGrowth.length > 0
          ? trends.auctionGrowth.reduce((sum, val) => sum + val, 0) / trends.userGrowth.reduce((sum, val) => sum + val, 0)
          : 0,
        revenueToAuctionRatio: trends.auctionGrowth.length > 0
          ? trends.revenueGrowth.reduce((sum, val) => sum + val, 0) / trends.auctionGrowth.reduce((sum, val) => sum + val, 0)
          : 0,
      },
    };

    // Generate insights
    const insights = this.generatePerformanceInsights(kpis, daysNum);

    return {
      kpis,
      insights,
      period: `${daysNum} days`,
      analysisDate: new Date().toISOString(),
    };
  }

  @Get('export')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Export marketplace metrics data' })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv'], description: 'Export format (default: json)' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days to export (default: 30)' })
  @ApiResponse({ status: 200, description: 'Metrics data exported successfully' })
  async exportMetricsData(
    @Query('format') format: string = 'json',
    @Query('days') days: string = '30',
  ) {
    const daysNum = parseInt(days);
    if (daysNum < 1 || daysNum > 365) {
      throw new BadRequestException('Days must be between 1 and 365');
    }

    if (!['json', 'csv'].includes(format)) {
      throw new BadRequestException('Invalid format. Must be json or csv');
    }

    const trends = await this.marketplaceMetricsService.getGrowthTrends(daysNum);

    // Format for export
    const exportData = {
      period: `${daysNum} days`,
      generatedAt: new Date().toISOString(),
      data: trends.dates.map((date, index) => ({
        date,
        dailyActiveUsers: 0, // Would need to aggregate from metrics
        newRegistrations: trends.userGrowth[index],
        auctionsCreated: trends.auctionGrowth[index],
        revenueGenerated: trends.revenueGrowth[index],
      })),
    };

    return {
      success: true,
      format,
      data: exportData,
    };
  }

  // Helper methods
  private calculateTrendDirection(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (changePercent > 5) return 'increasing';
    if (changePercent < -5) return 'decreasing';
    return 'stable';
  }

  private calculateAverageGrowthRate(values: number[]): number {
    if (values.length < 2) return 0;

    let totalGrowthRate = 0;
    let validComparisons = 0;

    for (let i = 1; i < values.length; i++) {
      if (values[i - 1] > 0) {
        const growthRate = ((values[i] - values[i - 1]) / values[i - 1]) * 100;
        totalGrowthRate += growthRate;
        validComparisons++;
      }
    }

    return validComparisons > 0 ? totalGrowthRate / validComparisons : 0;
  }

  private generatePerformanceInsights(kpis: any, days: number): string[] {
    const insights = [];

    // User acquisition insights
    if (kpis.userAcquisition.growthRate > 10) {
      insights.push(`Strong user growth at ${kpis.userAcquisition.growthRate.toFixed(1)}% - viral marketing effective`);
    } else if (kpis.userAcquisition.growthRate < 0) {
      insights.push(`User growth declining at ${Math.abs(kpis.userAcquisition.growthRate).toFixed(1)}% - investigate acquisition channels`);
    }

    // Revenue insights
    if (kpis.financialPerformance.revenueGrowthRate > 15) {
      insights.push(`Revenue growing rapidly at ${kpis.financialPerformance.revenueGrowthRate.toFixed(1)}% - expansion opportunity`);
    }

    // Engagement insights
    if (kpis.engagement.auctionToUserRatio > 0.5) {
      insights.push(`High engagement: ${kpis.engagement.auctionToUserRatio.toFixed(2)} auctions per user`);
    }

    // Revenue efficiency
    if (kpis.financialPerformance.revenuePerUser > 1000) {
      insights.push(`Strong monetization: ₹${kpis.financialPerformance.revenuePerUser.toFixed(0)} revenue per user`);
    }

    return insights;
  }
}
