import {
  Controller,
  Get,
  Put,
  Post,
  Body,
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
  ApiBody,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BidControlService } from './bid-control.service';

@ApiTags('Bid Control Management')
@Controller('bid-controls')
@UseGuards(RolesGuard)
@ApiBearerAuth()
export class BidControlController {
  constructor(private readonly bidControlService: BidControlService) {}

  @Get('settings')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get current bid control settings' })
  @ApiResponse({ status: 200, description: 'Bid control settings retrieved successfully' })
  async getBidControlSettings() {
    const settings = await this.bidControlService.getBidControlSettings();

    return {
      settings,
    };
  }

  @Put('settings')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Update bid control settings' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        minWalletBalance: { type: 'number', description: 'Minimum wallet balance required' },
        maxBidsPerDay: { type: 'number', description: 'Maximum bids per user per day' },
        autoBidEnabled: { type: 'boolean', description: 'Enable auto-bid functionality' },
        antiSnipingExtensionSeconds: { type: 'number', description: 'Anti-sniping extension in seconds' },
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Bid control settings updated successfully' })
  async updateBidControlSettings(
    @Body() settings: {
      minWalletBalance?: number;
      maxBidsPerDay?: number;
      autoBidEnabled?: boolean;
      antiSnipingExtensionSeconds?: number;
    },
    @Req() req: any,
  ) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    const updatedSettings = await this.bidControlService.updateBidControlSettings(settings, adminId);

    return {
      success: true,
      message: 'Bid control settings updated successfully',
      settings: updatedSettings,
    };
  }

  @Post('emergency-pause')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Activate emergency bidding pause' })
  @ApiResponse({ status: 200, description: 'Emergency pause activated successfully' })
  async emergencyPauseBidding(@Req() req: any) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    await this.bidControlService.emergencyPauseBidding(adminId);

    return {
      success: true,
      message: 'Emergency bidding pause activated',
      warning: 'CRITICAL: All bidding activity has been paused',
    };
  }

  @Post('emergency-resume')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Resume bidding after emergency pause' })
  @ApiResponse({ status: 200, description: 'Bidding resumed successfully' })
  async emergencyResumeBidding(@Req() req: any) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    await this.bidControlService.resumeBidding(adminId);

    return {
      success: true,
      message: 'Bidding resumed successfully',
    };
  }

  @Get('status')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get comprehensive bid control status' })
  @ApiResponse({ status: 200, description: 'Bid control status retrieved successfully' })
  async getBidControlStatus() {
    const status = await this.bidControlService.getBidControlStatus();

    return {
      status,
    };
  }

  @Get('user-stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user bid statistics' })
  @ApiResponse({ status: 200, description: 'User bid statistics retrieved successfully' })
  async getUserBidStats(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    const stats = await this.bidControlService.getUserBidStats(userId);

    return {
      stats,
    };
  }

  @Post('validate-bid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate if user can place a bid' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        auctionId: { type: 'string', description: 'Auction ID' },
        bidAmount: { type: 'number', description: 'Bid amount' },
      },
      required: ['auctionId', 'bidAmount']
    }
  })
  @ApiResponse({ status: 200, description: 'Bid validation completed successfully' })
  async validateBidPlacement(
    @Body() bidData: { auctionId: string; bidAmount: number },
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    const validation = await this.bidControlService.validateBidPlacement(
      userId,
      bidData.auctionId,
      bidData.bidAmount,
    );

    return {
      validation,
    };
  }

  @Get('anti-sniping')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get anti-sniping configuration' })
  @ApiResponse({ status: 200, description: 'Anti-sniping configuration retrieved successfully' })
  async getAntiSnipingConfig() {
    const extensionDuration = await this.bidControlService.getAntiSnipingExtensionDuration();
    const autoBidEnabled = await this.bidControlService.isAutoBidEnabled();

    return {
      antiSnipingEnabled: autoBidEnabled,
      extensionDurationSeconds: extensionDuration,
    };
  }

  @Post('cache/clear')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Clear bid control cache' })
  @ApiResponse({ status: 200, description: 'Cache cleared successfully' })
  async clearCache() {
    this.bidControlService.clearCache();

    return {
      success: true,
      message: 'Bid control cache cleared',
    };
  }
}
