import {
  Controller,
  Get,
  Post,
  Delete,
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
import { WalletBonusService, CreateWalletBonusDto } from './wallet-bonus.service';

@ApiTags('Wallet Bonus Management')
@Controller('wallet-bonuses')
@UseGuards(RolesGuard)
@ApiBearerAuth()
export class WalletBonusController {
  constructor(private readonly walletBonusService: WalletBonusService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new wallet bonus' })
  @ApiResponse({ status: 201, description: 'Wallet bonus created successfully' })
  async createWalletBonus(
    @Body() bonusData: CreateWalletBonusDto,
  ) {
    const bonus = await this.walletBonusService.createWalletBonus(bonusData);

    return {
      success: true,
      message: 'Wallet bonus created successfully',
      bonus,
    };
  }

  @Get('user/active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user active wallet bonuses' })
  @ApiResponse({ status: 200, description: 'Active bonuses retrieved successfully' })
  async getUserActiveBonuses(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    const bonuses = await this.walletBonusService.getUserActiveBonuses(userId);

    return {
      bonuses,
      total: bonuses.length,
    };
  }

  @Get('user/available')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user available bonus amount' })
  @ApiResponse({ status: 200, description: 'Available bonus retrieved successfully' })
  async getUserAvailableBonus(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    const availableBonus = await this.walletBonusService.getUserAvailableBonus(userId);

    return {
      availableBonus,
    };
  }

  @Post('use')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Use bonus amount for transaction' })
  @ApiResponse({ status: 200, description: 'Bonus used successfully' })
  async useBonusAmount(
    @Body() useData: { amount: number; transactionId?: string },
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    const result = await this.walletBonusService.useBonusAmount(
      userId,
      useData.amount,
      useData.transactionId,
    );

    return {
      success: true,
      message: `Bonus used successfully: ₹${result.usedAmount}`,
      result,
    };
  }

  @Get('statistics')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get wallet bonus statistics' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days to analyze (default: 30)' })
  @ApiResponse({ status: 200, description: 'Bonus statistics retrieved successfully' })
  async getBonusStatistics(@Query('days') days: string = '30') {
    const daysNum = parseInt(days);
    if (daysNum < 1 || daysNum > 365) {
      throw new BadRequestException('Days must be between 1 and 365');
    }

    const statistics = await this.walletBonusService.getBonusStatistics(daysNum);

    return {
      statistics,
      period: `${daysNum} days`,
    };
  }

  @Post('grant-launch-bonuses/:campaignId')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Grant launch bonuses for campaign' })
  @ApiParam({ name: 'campaignId', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Launch bonuses granted successfully' })
  async grantLaunchBonusesForCampaign(
    @Param('campaignId') campaignId: string,
    @Req() req: any,
  ) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    const result = await this.walletBonusService.grantLaunchBonusesForCampaign(campaignId, adminId);

    return {
      success: true,
      message: `Launch bonuses granted: ${result.processedUsers} users, ₹${result.totalBonusGranted} total`,
      result,
    };
  }

  @Post('expire-old')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Expire old bonuses (cron job)' })
  @ApiResponse({ status: 200, description: 'Old bonuses expired successfully' })
  async expireOldBonuses() {
    const result = await this.walletBonusService.expireOldBonuses();

    return {
      success: true,
      message: `Expired ${result.expiredCount} bonuses worth ₹${result.expiredAmount}`,
      result,
    };
  }

  @Get(':bonusId')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get bonus by ID' })
  @ApiParam({ name: 'bonusId', description: 'Bonus ID' })
  @ApiResponse({ status: 200, description: 'Bonus retrieved successfully' })
  async getBonusById(@Param('bonusId') bonusId: string) {
    const bonus = await this.walletBonusService.getBonusById(bonusId);

    if (!bonus) {
      throw new BadRequestException('Bonus not found');
    }

    return {
      bonus,
    };
  }

  @Delete(':bonusId')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Cancel/unused bonus' })
  @ApiParam({ name: 'bonusId', description: 'Bonus ID' })
  @ApiResponse({ status: 200, description: 'Bonus cancelled successfully' })
  async cancelBonus(
    @Param('bonusId') bonusId: string,
    @Req() req: any,
  ) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    await this.walletBonusService.cancelBonus(bonusId, adminId);

    return {
      success: true,
      message: 'Bonus cancelled successfully',
    };
  }

  @Get('admin/user-bonuses/:userId')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get user bonuses (Admin only)' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User bonuses retrieved successfully' })
  async getUserBonuses(@Param('userId') userId: string) {
    const bonuses = await this.walletBonusService.getUserActiveBonuses(userId);

    return {
      userId,
      bonuses,
      total: bonuses.length,
    };
  }

  @Post('admin/create-bonus/:userId')
  @HttpCode(HttpStatus.CREATED)
  @Roles('admin')
  @ApiOperation({ summary: 'Create bonus for user (Admin only)' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 201, description: 'Bonus created successfully' })
  async createBonusForUser(
    @Param('userId') userId: string,
    @Body() bonusData: {
      bonusAmount: number;
      reason: 'launch_bonus' | 'referral_bonus' | 'campaign_bonus' | 'tier_bonus' | 'admin_bonus';
      campaignId?: string;
      expiresAt: string;
    },
    @Req() req: any,
  ) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    const bonus = await this.walletBonusService.createWalletBonus({
      userId,
      bonusAmount: bonusData.bonusAmount,
      reason: bonusData.reason,
      campaignId: bonusData.campaignId,
      expiresAt: new Date(bonusData.expiresAt),
      createdBy: adminId,
    });

    return {
      success: true,
      message: 'Bonus created for user successfully',
      bonus,
    };
  }
}
