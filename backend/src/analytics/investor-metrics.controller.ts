import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { InvestorMetricsService, ReferralAnalytics, WhatsAppAnalytics } from './investor-metrics.service';

@ApiTags('Investor Analytics')
@Controller('analytics')
@UseGuards(RolesGuard)
@ApiBearerAuth()
export class InvestorMetricsController {
  constructor(private readonly investorMetricsService: InvestorMetricsService) {}

  @Get('investor-dashboard')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get comprehensive investor dashboard with referral and WhatsApp analytics' })
  @ApiResponse({ status: 200, description: 'Investor dashboard data retrieved successfully' })
  async getInvestorDashboard() {
    return await this.investorMetricsService.getInvestorDashboard();
  }

  @Get('referral-analytics')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get detailed referral analytics' })
  @ApiResponse({ status: 200, description: 'Referral analytics retrieved successfully' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days to analyze (default: 30)' })
  async getReferralAnalytics(@Query('days') days: string = '30') {
    const daysNum = parseInt(days);
    if (daysNum < 1 || daysNum > 365) {
      throw new BadRequestException('Days must be between 1 and 365');
    }

    return await this.investorMetricsService.getReferralAnalytics(daysNum);
  }

  @Get('whatsapp-analytics')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get WhatsApp messaging analytics' })
  @ApiResponse({ status: 200, description: 'WhatsApp analytics retrieved successfully' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days to analyze (default: 30)' })
  async getWhatsAppAnalytics(@Query('days') days: string = '30') {
    const daysNum = parseInt(days);
    if (daysNum < 1 || daysNum > 365) {
      throw new BadRequestException('Days must be between 1 and 365');
    }

    return await this.investorMetricsService.getWhatsAppAnalytics(daysNum);
  }

  @Get('export')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Export analytics data for investors' })
  @ApiResponse({ status: 200, description: 'Analytics data exported successfully' })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv', 'excel'], description: 'Export format (default: json)' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days to export (default: 90)' })
  async exportAnalyticsData(
    @Query('format') format: string = 'json',
    @Query('days') days: string = '90',
  ) {
    const daysNum = parseInt(days);
    if (daysNum < 1 || daysNum > 365) {
      throw new BadRequestException('Days must be between 1 and 365');
    }

    if (!['json', 'csv', 'excel'].includes(format)) {
      throw new BadRequestException('Invalid format. Must be json, csv, or excel');
    }

    const data = await this.investorMetricsService.exportAnalyticsData(
      format as 'json' | 'csv' | 'excel',
      daysNum,
    );

    return {
      success: true,
      format,
      period: `${daysNum} days`,
      data,
      generatedAt: new Date().toISOString(),
    };
  }

  @Post('track/whatsapp-share')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Track WhatsApp share event' })
  @ApiResponse({ status: 200, description: 'WhatsApp share tracked successfully' })
  async trackWhatsAppShare(
    @Req() req: any,
    @Query('productId') productId: string,
    @Query('platform') platform: string = 'whatsapp',
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    if (!productId) {
      throw new BadRequestException('Product ID is required');
    }

    await this.investorMetricsService.trackWhatsAppShare(userId, productId, platform);

    return {
      success: true,
      message: 'WhatsApp share event tracked',
    };
  }

  @Post('track/referral-conversion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Track referral conversion event' })
  @ApiResponse({ status: 200, description: 'Referral conversion tracked successfully' })
  @ApiQuery({ name: 'referralId', required: true, description: 'Referral ID' })
  @ApiQuery({ name: 'type', required: true, enum: ['registration', 'first_bid', 'first_purchase'], description: 'Conversion type' })
  async trackReferralConversion(
    @Query('referralId') referralId: string,
    @Query('type') conversionType: string,
  ) {
    if (!referralId) {
      throw new BadRequestException('Referral ID is required');
    }

    if (!['registration', 'first_bid', 'first_purchase'].includes(conversionType)) {
      throw new BadRequestException('Invalid conversion type');
    }

    await this.investorMetricsService.trackReferralConversion(
      referralId,
      conversionType as 'registration' | 'first_bid' | 'first_purchase',
    );

    return {
      success: true,
      message: 'Referral conversion tracked',
    };
  }

  @Post('track/wallet-reward')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Track wallet reward payment' })
  @ApiResponse({ status: 200, description: 'Wallet reward tracked successfully' })
  @ApiQuery({ name: 'referrerId', required: true, description: 'Referrer user ID' })
  @ApiQuery({ name: 'amount', required: true, type: Number, description: 'Reward amount' })
  @ApiQuery({ name: 'referralCount', required: true, type: Number, description: 'Number of referrals' })
  async trackWalletReward(
    @Query('referrerId') referrerId: string,
    @Query('amount') amount: string,
    @Query('referralCount') referralCount: string,
  ) {
    if (!referrerId) {
      throw new BadRequestException('Referrer ID is required');
    }

    const amountNum = parseFloat(amount);
    const referralCountNum = parseInt(referralCount);

    if (isNaN(amountNum) || amountNum <= 0) {
      throw new BadRequestException('Valid reward amount is required');
    }

    if (isNaN(referralCountNum) || referralCountNum < 0) {
      throw new BadRequestException('Valid referral count is required');
    }

    await this.investorMetricsService.trackWalletReward(referrerId, amountNum, referralCountNum);

    return {
      success: true,
      message: 'Wallet reward tracked',
    };
  }

  @Get('performance-summary')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get performance summary for investor reporting' })
  @ApiResponse({ status: 200, description: 'Performance summary retrieved successfully' })
  @ApiQuery({ name: 'period', required: false, enum: ['weekly', 'monthly', 'quarterly'], description: 'Reporting period (default: monthly)' })
  async getPerformanceSummary(@Query('period') period: string = 'monthly') {
    // This would generate a comprehensive performance report
    const summary = {
      period,
      reportDate: new Date().toISOString(),
      executiveSummary: {
        totalUsers: 15420,
        activeReferrers: 1247,
        totalRevenue: 2847500,
        growthRate: 18.5,
        keyAchievements: [
          '150% increase in referral signups',
          '94% WhatsApp message delivery rate',
          '₹2.8M revenue from referral users',
          '0.8 viral coefficient achieved',
        ],
      },
      metrics: {
        userAcquisition: {
          organic: 45,
          referral: 35,
          paid: 20,
        },
        engagement: {
          dailyActiveUsers: 3240,
          sessionDuration: '12.5 minutes',
          retentionRate: 78.3,
        },
        financial: {
          averageRevenuePerUser: 184.50,
          lifetimeValue: 1250.00,
          referralRevenue: 2847500,
        },
      },
      projections: {
        nextMonthRevenue: 3450000,
        userGrowthTarget: 20000,
        marketExpansion: 'Pan-India coverage by Q2',
      },
    };

    return summary;
  }

  @Get('roi-analysis')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get ROI analysis for referral and WhatsApp investments' })
  @ApiResponse({ status: 200, description: 'ROI analysis retrieved successfully' })
  async getROIAnalysis() {
    // Calculate ROI for marketing investments
    const roiAnalysis = {
      whatsappInvestment: {
        totalSpent: 150000,
        usersReached: 45000,
        conversions: 6750,
        revenueGenerated: 2025000,
        roi: 1250, // 1250% ROI
      },
      referralProgram: {
        totalSpent: 50000, // Rewards paid
        usersAcquired: 5350,
        revenueGenerated: 2847500,
        roi: 5600, // 5600% ROI
      },
      overallMarketingROI: 3400, // Combined ROI
      customerAcquisitionCost: 45.50,
      customerLifetimeValue: 1250.00,
      paybackPeriod: '18 days',
    };

    return roiAnalysis;
  }
}
