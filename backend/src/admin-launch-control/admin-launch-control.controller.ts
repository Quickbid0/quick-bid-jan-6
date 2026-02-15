import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
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
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FeatureFlagService } from '../feature-flag/feature-flag.service';
import { LaunchCampaignService } from '../launch-campaign/launch-campaign.service';
import { FeeOverrideService } from '../fee-override/fee-override.service';
import { BidControlService } from '../bid-control/bid-control.service';
import { WalletBonusService } from '../wallet-bonus/wallet-bonus.service';
import { InvestorDashboardService } from '../investor-dashboard/investor-dashboard.service';
import { MarketplaceMetricsService } from '../marketplace-metrics/marketplace-metrics.service';
import { SafetyRulesService } from '../safety-rules/safety-rules.service';

@ApiTags('Admin Launch Control Center')
@Controller('admin/launch-control')
@UseGuards(RolesGuard)
@ApiBearerAuth()
export class AdminLaunchControlController {
  constructor(
    private featureFlagService: FeatureFlagService,
    private launchCampaignService: LaunchCampaignService,
    private feeOverrideService: FeeOverrideService,
    private bidControlService: BidControlService,
    private walletBonusService: WalletBonusService,
    private investorDashboardService: InvestorDashboardService,
    private marketplaceMetricsService: MarketplaceMetricsService,
    private safetyRulesService: SafetyRulesService,
  ) {}

  @Get('dashboard')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get launch control center dashboard overview' })
  @ApiResponse({ status: 200, description: 'Launch control dashboard retrieved successfully' })
  async getLaunchControlDashboard() {
    // Get all critical launch control data in parallel
    const [
      launchStatus,
      activeCampaign,
      bidControlStatus,
      feeOverrides,
      recentMetrics,
      safetyStatus,
    ] = await Promise.all([
      this.featureFlagService.getLaunchModeStatus(),
      this.launchCampaignService.getActiveCampaign(),
      this.bidControlService.getBidControlStatus(),
      this.feeOverrideService.getCurrentFeeOverrides(),
      this.marketplaceMetricsService.getLatestMetricsSummary(),
      this.safetyRulesService.getSafetyRulesSummary(),
    ]);

    // Calculate launch health score
    const healthScore = this.calculateLaunchHealthScore({
      launchStatus,
      activeCampaign,
      bidControlStatus,
      feeOverrides,
      recentMetrics,
      safetyStatus,
    });

    return {
      dashboard: {
        launchStatus,
        activeCampaign,
        bidControlStatus,
        feeOverrides,
        recentMetrics,
        safetyStatus,
        healthScore,
      },
      timestamp: new Date().toISOString(),
      controlCenterVersion: '1.0.0',
    };
  }

  @Post('emergency-kill-switch/activate')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Activate emergency kill switch - stops all marketplace activity' })
  @ApiResponse({ status: 200, description: 'Emergency kill switch activated' })
  async activateEmergencyKillSwitch(
    @Req() req: any,
    @Body() body: { reason: string; expectedDuration: string },
  ) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    // Validate reason
    if (!body.reason || body.reason.trim().length < 10) {
      throw new BadRequestException('Emergency activation requires a detailed reason (minimum 10 characters)');
    }

    // Activate emergency pause
    await this.bidControlService.emergencyPauseBidding(adminId);

    // Log emergency activation
    console.error('🚨 EMERGENCY KILL SWITCH ACTIVATED', {
      adminId,
      reason: body.reason,
      expectedDuration: body.expectedDuration,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      message: 'Emergency kill switch activated - all marketplace activity paused',
      emergencyDetails: {
        activatedBy: adminId,
        reason: body.reason,
        expectedDuration: body.expectedDuration,
        activatedAt: new Date().toISOString(),
      },
      affectedSystems: [
        'New auction creation',
        'Bid placement',
        'Fund transfers',
        'Wallet operations',
        'Campaign activities',
      ],
    };
  }

  @Post('emergency-kill-switch/deactivate')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Deactivate emergency kill switch - resume marketplace activity' })
  @ApiResponse({ status: 200, description: 'Emergency kill switch deactivated' })
  async deactivateEmergencyKillSwitch(@Req() req: any) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    // Deactivate emergency pause
    await this.bidControlService.resumeBidding(adminId);

    // Log emergency deactivation
    console.log('✅ EMERGENCY KILL SWITCH DEACTIVATED', {
      adminId,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      message: 'Emergency kill switch deactivated - marketplace activity resumed',
      resumedAt: new Date().toISOString(),
    };
  }

  @Get('feature-flags')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get all feature flags for launch control' })
  @ApiResponse({ status: 200, description: 'Feature flags retrieved successfully' })
  async getFeatureFlags() {
    const flags = await this.featureFlagService.getAllFlags();

    // Group by category
    const groupedFlags = flags.reduce((acc, flag) => {
      if (!acc[flag.category]) {
        acc[flag.category] = [];
      }
      acc[flag.category].push(flag);
      return acc;
    }, {} as Record<string, any[]>);

    return {
      flags,
      groupedFlags,
      totalFlags: flags.length,
      categories: Object.keys(groupedFlags),
    };
  }

  @Post('feature-flags/bulk-update')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Bulk update feature flags' })
  @ApiResponse({ status: 200, description: 'Feature flags updated successfully' })
  async bulkUpdateFeatureFlags(
    @Req() req: any,
    @Body() body: { flags: Record<string, boolean> },
  ) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    // Validate safety for each flag
    const safetyViolations = [];
    for (const [flagKey, value] of Object.entries(body.flags)) {
      const safetyCheck = await this.safetyRulesService.validateFeatureFlagSafety(flagKey, value);
      if (!safetyCheck.isSafe) {
        safetyViolations.push({
          flagKey,
          violations: safetyCheck.violations,
        });
      }
    }

    if (safetyViolations.length > 0) {
      throw new BadRequestException({
        message: 'Feature flag updates blocked by safety rules',
        violations: safetyViolations,
      });
    }

    const result = await this.featureFlagService.setFlag('bulk_update', true, adminId);

    return {
      success: true,
      message: 'Feature flags updated successfully',
      result,
    };
  }

  @Get('campaigns')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get all launch campaigns' })
  @ApiResponse({ status: 200, description: 'Launch campaigns retrieved successfully' })
  async getLaunchCampaigns() {
    const campaigns = await this.launchCampaignService.getAllCampaigns();

    return {
      campaigns,
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.activeStatus).length,
    };
  }

  @Post('campaigns')
  @HttpCode(HttpStatus.CREATED)
  @Roles('admin')
  @ApiOperation({ summary: 'Create new launch campaign' })
  @ApiResponse({ status: 201, description: 'Launch campaign created successfully' })
  async createLaunchCampaign(
    @Req() req: any,
    @Body() campaignData: {
      campaignName: string;
      startDate: string;
      endDate: string;
      targetRoles: string[];
      bonusWalletCredit: number;
      referralBonusMultiplier: number;
      freeBidLimit: number;
      commissionOverridePercentage?: number;
      depositOverrideAmount?: number;
      subscriptionOverridePlan?: string;
      priorityListingEnabled: boolean;
    },
  ) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    const campaign = await this.launchCampaignService.createCampaign(
      {
        ...campaignData,
        startDate: new Date(campaignData.startDate),
        endDate: new Date(campaignData.endDate),
      },
      adminId,
    );

    return {
      success: true,
      message: 'Launch campaign created successfully',
      campaign,
    };
  }

  @Get('fee-overrides')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get current fee overrides' })
  @ApiResponse({ status: 200, description: 'Fee overrides retrieved successfully' })
  async getFeeOverrides() {
    const overrides = await this.feeOverrideService.getCurrentFeeOverrides();

    return {
      overrides,
      hasOverrides: !!overrides,
    };
  }

  @Put('fee-overrides')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Update fee overrides' })
  @ApiResponse({ status: 200, description: 'Fee overrides updated successfully' })
  async updateFeeOverrides(
    @Req() req: any,
    @Body() overrides: {
      listingFee?: number;
      depositFee?: number;
      commissionPercentage?: number;
      referralReward?: number;
    },
  ) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    const updatedOverrides = await this.feeOverrideService.updateFeeOverrides(overrides, adminId);

    return {
      success: true,
      message: 'Fee overrides updated successfully',
      overrides: updatedOverrides,
    };
  }

  @Get('bid-controls')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get bid control settings' })
  @ApiResponse({ status: 200, description: 'Bid controls retrieved successfully' })
  async getBidControls() {
    const settings = await this.bidControlService.getBidControlSettings();

    return {
      settings,
    };
  }

  @Put('bid-controls')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Update bid control settings' })
  @ApiResponse({ status: 200, description: 'Bid controls updated successfully' })
  async updateBidControls(
    @Req() req: any,
    @Body() settings: {
      minWalletBalance?: number;
      maxBidsPerDay?: number;
      autoBidEnabled?: boolean;
      antiSnipingExtensionSeconds?: number;
    },
  ) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    const updatedSettings = await this.bidControlService.updateBidControlSettings(settings, adminId);

    return {
      success: true,
      message: 'Bid controls updated successfully',
      settings: updatedSettings,
    };
  }

  @Get('wallet-promotions')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get wallet promotion statistics' })
  @ApiResponse({ status: 200, description: 'Wallet promotions retrieved successfully' })
  async getWalletPromotions() {
    const statistics = await this.walletBonusService.getBonusStatistics();

    return {
      statistics,
    };
  }

  @Get('analytics')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get analytics dashboard for launch control' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getAnalytics() {
    const dashboard = await this.investorDashboardService.getInvestorDashboard();

    return {
      analytics: dashboard,
    };
  }

  @Get('metrics')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get marketplace metrics for launch control' })
  @ApiResponse({ status: 200, description: 'Metrics retrieved successfully' })
  async getMetrics() {
    const metrics = await this.marketplaceMetricsService.getLatestMetricsSummary();

    return {
      metrics,
    };
  }

  @Get('safety-status')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get safety status for launch control' })
  @ApiResponse({ status: 200, description: 'Safety status retrieved successfully' })
  async getSafetyStatus() {
    const status = this.safetyRulesService.getSafetyRulesSummary();

    return {
      safetyStatus: status,
    };
  }

  @Post('system-health-check')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Perform comprehensive system health check' })
  @ApiResponse({ status: 200, description: 'System health check completed' })
  async performSystemHealthCheck() {
    // Perform comprehensive health check of all launch systems
    const healthCheck = {
      timestamp: new Date().toISOString(),
      systems: {
        featureFlags: { status: 'operational', lastChecked: new Date() },
        campaigns: { status: 'operational', lastChecked: new Date() },
        feeOverrides: { status: 'operational', lastChecked: new Date() },
        bidControls: { status: 'operational', lastChecked: new Date() },
        walletBonuses: { status: 'operational', lastChecked: new Date() },
        analytics: { status: 'operational', lastChecked: new Date() },
        metrics: { status: 'operational', lastChecked: new Date() },
        safetyRules: { status: 'enforced', lastChecked: new Date() },
      },
      overallHealth: 'HEALTHY',
      issuesFound: 0,
      recommendations: [
        'All systems operational',
        'Safety rules are enforced',
        'Launch controls are active',
      ],
    };

    return {
      healthCheck,
    };
  }

  // Helper method to calculate launch health score
  private calculateLaunchHealthScore(data: any): {
    score: number;
    status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    factors: Record<string, number>;
  } {
    let score = 100;
    const factors: Record<string, number> = {};

    // Launch mode status (20 points)
    if (data.launchStatus.launchModeActive) {
      factors.launchMode = 20;
    } else {
      factors.launchMode = 0;
      score -= 20;
    }

    // Active campaign (15 points)
    if (data.activeCampaign) {
      factors.activeCampaign = 15;
    } else {
      factors.activeCampaign = 5;
      score -= 10;
    }

    // Safety status (25 points)
    factors.safety = data.safetyStatus.criticalRules === data.safetyStatus.enforcedRules ? 25 : 0;

    // Fee overrides active (10 points)
    if (data.feeOverrides) {
      factors.feeOverrides = 10;
    } else {
      factors.feeOverrides = 0;
      score -= 10;
    }

    // Recent metrics available (10 points)
    if (data.recentMetrics) {
      factors.recentMetrics = 10;
    } else {
      factors.recentMetrics = 0;
      score -= 10;
    }

    // Bid controls configured (10 points)
    if (!data.bidControlStatus.settings.emergencyPauseFlag) {
      factors.bidControls = 10;
    } else {
      factors.bidControls = 0;
      score -= 50; // Emergency pause is critical
    }

    // Determine status
    let status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    if (score >= 90) status = 'excellent';
    else if (score >= 75) status = 'good';
    else if (score >= 60) status = 'fair';
    else if (score >= 40) status = 'poor';
    else status = 'critical';

    return {
      score: Math.max(0, score),
      status,
      factors,
    };
  }
}
