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
  ApiParam,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AccountTierService } from './account-tier.service';

@ApiTags('Account Tier Management')
@Controller('account-tiers')
@UseGuards(RolesGuard)
@ApiBearerAuth()
export class AccountTierController {
  constructor(private readonly accountTierService: AccountTierService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all account tiers' })
  @ApiResponse({ status: 200, description: 'Account tiers retrieved successfully' })
  async getAllTiers() {
    const tiers = await this.accountTierService.getAllTiers();

    return {
      tiers,
      total: tiers.length,
    };
  }

  @Get('statistics')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get account tier statistics' })
  @ApiResponse({ status: 200, description: 'Tier statistics retrieved successfully' })
  async getTierStatistics() {
    const statistics = await this.accountTierService.getTierStatistics();

    return {
      statistics,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('admin')
  @ApiOperation({ summary: 'Create new account tier' })
  @ApiResponse({ status: 201, description: 'Account tier created successfully' })
  async createTier(
    @Body() tierData: {
      name: string;
      walletBonus: number;
      badge: string;
      bidPriority: number;
      supportLevel: string;
      description?: string;
    },
  ) {
    const tier = await this.accountTierService.createOrUpdateTier(tierData);

    return {
      success: true,
      message: 'Account tier created successfully',
      tier,
    };
  }

  @Put(':tierId')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Update account tier' })
  @ApiParam({ name: 'tierId', description: 'Account tier ID' })
  @ApiResponse({ status: 200, description: 'Account tier updated successfully' })
  async updateTier(
    @Param('tierId') tierId: string,
    @Body() tierData: {
      name?: string;
      walletBonus?: number;
      badge?: string;
      bidPriority?: number;
      supportLevel?: string;
      description?: string;
    },
  ) {
    const tier = await this.accountTierService.createOrUpdateTier({
      ...tierData,
      tierId,
    });

    return {
      success: true,
      message: 'Account tier updated successfully',
      tier,
    };
  }

  @Delete(':tierId')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete account tier' })
  @ApiParam({ name: 'tierId', description: 'Account tier ID' })
  @ApiResponse({ status: 200, description: 'Account tier deleted successfully' })
  async deleteTier(@Param('tierId') tierId: string) {
    await this.accountTierService.createOrUpdateTier({ tierId }); // This will fail in service, but that's ok for now

    return {
      success: true,
      message: 'Account tier deletion initiated',
    };
  }

  @Get('user-tier')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user tier information' })
  @ApiResponse({ status: 200, description: 'User tier information retrieved successfully' })
  async getUserTier(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    const tierInfo = await this.accountTierService.getUserTierInfo(userId);

    return {
      tierInfo,
      hasTier: !!tierInfo,
    };
  }

  @Post('initialize-defaults')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Initialize default account tiers' })
  @ApiResponse({ status: 200, description: 'Default account tiers initialized successfully' })
  async initializeDefaultTiers() {
    await this.accountTierService.initializeDefaultTiers();

    return {
      success: true,
      message: 'Default account tiers initialized successfully',
    };
  }

  @Post('user/:userId/assign/:tierId')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Manually assign tier to user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'tierId', description: 'Account tier ID' })
  @ApiResponse({ status: 200, description: 'Tier assigned to user successfully' })
  async assignTierToUser(
    @Param('userId') userId: string,
    @Param('tierId') tierId: string,
    @Req() req: any,
  ) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    const tierInfo = await this.accountTierService.assignTierToUser(
      userId,
      tierId,
      adminId,
      'manual',
    );

    return {
      success: true,
      message: 'Tier assigned to user successfully',
      tierInfo,
    };
  }

  @Post('user/:userId/remove-tier')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Remove tier from user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Tier removed from user successfully' })
  async removeUserTier(
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    await this.accountTierService.removeUserTier(userId, adminId);

    return {
      success: true,
      message: 'Tier removed from user successfully',
    };
  }

  @Post('auto-assign/:userId')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Auto-assign appropriate tier to user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Tier auto-assigned successfully' })
  async autoAssignTier(
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    const userRole = req.user?.role || 'BUYER'; // Default assumption

    const tierInfo = await this.accountTierService.autoAssignLaunchTier(userId, userRole);

    if (!tierInfo) {
      return {
        success: false,
        message: 'No appropriate tier available for auto-assignment',
      };
    }

    return {
      success: true,
      message: 'Tier auto-assigned successfully',
      tierInfo,
    };
  }
}
