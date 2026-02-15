import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
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
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ReferralService } from './referral.service';

@ApiTags('Referral System')
@Controller('referrals')
@UseGuards(RolesGuard)
@ApiBearerAuth()
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Get('code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user referral code' })
  @ApiResponse({ status: 200, description: 'Referral code retrieved successfully' })
  async getReferralCode(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    const stats = await this.referralService.getReferralStats(userId);

    return {
      referralCode: stats.referralCode,
      totalReferrals: stats.totalReferrals,
      successfulReferrals: stats.successfulReferrals,
      totalEarned: stats.totalEarned,
    };
  }

  @Post('generate-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate new referral code for user' })
  @ApiResponse({ status: 200, description: 'Referral code generated successfully' })
  async generateReferralCode(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    // Generate and update user's referral code
    const referralCode = this.referralService.generateReferralCode(userId);

    // Update user with new referral code
    // Note: This would be handled in the service in a real implementation

    return {
      success: true,
      referralCode,
      message: 'Referral code generated successfully',
    };
  }

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user referral statistics' })
  @ApiResponse({ status: 200, description: 'Referral statistics retrieved successfully' })
  async getReferralStats(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    const stats = await this.referralService.getReferralStats(userId);

    return {
      totalReferrals: stats.totalReferrals,
      successfulReferrals: stats.successfulReferrals,
      pendingRewards: stats.pendingRewards,
      totalEarned: stats.totalEarned,
      referralCode: stats.referralCode,
    };
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate referral code' })
  @ApiResponse({ status: 200, description: 'Referral code validated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid referral code' })
  async validateReferralCode(@Body() body: { referralCode: string }, @Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    const { referralCode } = body;

    if (!referralCode || !this.referralService.validateReferralCode(referralCode)) {
      throw new BadRequestException('Invalid referral code format');
    }

    // Check for abuse
    const abuseCheck = await this.referralService.checkReferralAbuse(userId, referralCode);
    if (abuseCheck.isAbusive) {
      throw new BadRequestException(`Referral code rejected: ${abuseCheck.reasons.join(', ')}`);
    }

    return {
      valid: true,
      message: 'Referral code is valid',
    };
  }

  @Get('dashboard')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get referral analytics dashboard (Admin only)' })
  @ApiResponse({ status: 200, description: 'Referral analytics retrieved successfully' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getReferralDashboard(@Query('days') days: string = '30') {
    // In a real implementation, this would aggregate referral metrics
    const daysNum = parseInt(days);

    // Mock data - would be replaced with actual aggregation queries
    const dashboard = {
      period: `${daysNum} days`,
      totalShares: 1250,
      totalReferrals: 89,
      successfulConversions: 67,
      conversionRate: 75.3,
      totalRewardsPaid: 13400,
      averageRewardPerReferral: 150.6,
      topReferrers: [
        { userId: 'user_001', referrals: 12, earnings: 2400 },
        { userId: 'user_002', referrals: 8, earnings: 1600 },
        { userId: 'user_003', referrals: 6, earnings: 1200 },
      ],
      dailyStats: Array.from({ length: Math.min(daysNum, 30) }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        shares: Math.floor(Math.random() * 50) + 10,
        referrals: Math.floor(Math.random() * 8) + 1,
        conversions: Math.floor(Math.random() * 6) + 1,
        rewards: Math.floor(Math.random() * 1000) + 100,
      })),
    };

    return dashboard;
  }

  @Post('reward/:referralId')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Manually credit referral reward (Admin only)' })
  @ApiParam({ name: 'referralId', description: 'Referral ID' })
  @ApiResponse({ status: 200, description: 'Referral reward credited successfully' })
  async creditReferralReward(
    @Param('referralId') referralId: string,
    @Body() body: { rewardAmount: number; reason: string },
    @Req() req: any,
  ) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    const { rewardAmount, reason } = body;

    if (!rewardAmount || rewardAmount <= 0) {
      throw new BadRequestException('Valid reward amount is required');
    }

    await this.referralService.creditReferralReward(
      referralId,
      rewardAmount,
      reason || 'Manual admin credit',
      adminId,
    );

    return {
      success: true,
      message: `Referral reward of ₹${rewardAmount} credited successfully`,
    };
  }

  @Get('leaderboard')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get referral leaderboard' })
  @ApiResponse({ status: 200, description: 'Referral leaderboard retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getReferralLeaderboard(@Query('limit') limit: string = '10') {
    // Mock leaderboard - would be replaced with actual aggregation
    const leaderboard = Array.from({ length: parseInt(limit) }, (_, i) => ({
      rank: i + 1,
      userId: `user_${(i + 1).toString().padStart(3, '0')}`,
      name: `Referrer ${i + 1}`,
      totalReferrals: Math.floor(Math.random() * 20) + 5,
      successfulReferrals: Math.floor(Math.random() * 15) + 3,
      totalEarnings: Math.floor(Math.random() * 5000) + 500,
      averageReward: Math.floor(Math.random() * 200) + 100,
    }));

    // Sort by total earnings
    leaderboard.sort((a, b) => b.totalEarnings - a.totalEarnings);

    return {
      leaderboard,
      period: 'All time',
      lastUpdated: new Date().toISOString(),
    };
  }
}
