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
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FeeOverrideService } from './fee-override.service';

@ApiTags('Fee Override Management')
@Controller('fee-overrides')
@UseGuards(RolesGuard)
@ApiBearerAuth()
export class FeeOverrideController {
  constructor(private readonly feeOverrideService: FeeOverrideService) {}

  @Get('current')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get current fee overrides' })
  @ApiResponse({ status: 200, description: 'Current fee overrides retrieved successfully' })
  async getCurrentFeeOverrides() {
    const overrides = await this.feeOverrideService.getCurrentFeeOverrides();

    return {
      overrides,
      hasOverrides: !!overrides,
    };
  }

  @Put('update')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Update fee overrides' })
  @ApiResponse({ status: 200, description: 'Fee overrides updated successfully' })
  async updateFeeOverrides(
    @Body() overrides: {
      listingFee?: number;
      depositFee?: number;
      commissionPercentage?: number;
      referralReward?: number;
    },
    @Req() req: any,
  ) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    // Validate safety
    const safetyCheck = this.feeOverrideService.validateFeeOverrideSafety(overrides);
    if (!safetyCheck.isSafe) {
      throw new BadRequestException(`Unsafe fee overrides: ${safetyCheck.warnings.join(', ')}`);
    }

    if (safetyCheck.warnings.length > 0) {
      // Log warnings but allow the override
      console.warn('Fee override warnings:', safetyCheck.warnings);
    }

    const updatedOverrides = await this.feeOverrideService.updateFeeOverrides(overrides, adminId);

    return {
      success: true,
      message: 'Fee overrides updated successfully',
      overrides: updatedOverrides,
      warnings: safetyCheck.warnings,
    };
  }

  @Post('disable')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Disable all fee overrides' })
  @ApiResponse({ status: 200, description: 'Fee overrides disabled successfully' })
  async disableFeeOverrides(@Req() req: any) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    await this.feeOverrideService.disableFeeOverrides(adminId);

    return {
      success: true,
      message: 'Fee overrides disabled successfully',
    };
  }

  @Post('reset-to-defaults')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Reset all fee overrides to defaults' })
  @ApiResponse({ status: 200, description: 'Fee overrides reset to defaults successfully' })
  async resetToDefaults(@Req() req: any) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    await this.feeOverrideService.resetToDefaults(adminId);

    return {
      success: true,
      message: 'Fee overrides reset to defaults successfully',
    };
  }

  @Get('dynamic/:userId')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get dynamic fee structure for a user' })
  @ApiResponse({ status: 200, description: 'Dynamic fee structure retrieved successfully' })
  async getDynamicFeesForUser(@Req() req: any) {
    const userId = req.user?.id;
    const userRole = req.user?.role || 'BUYER';

    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    const feeStructure = await this.feeOverrideService.getDynamicFeesForUser(userId, userRole);

    return {
      feeStructure,
    };
  }

  @Post('calculate-fees')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate fees for a transaction' })
  @ApiResponse({ status: 200, description: 'Transaction fees calculated successfully' })
  async calculateTransactionFees(
    @Body() feeCalculation: {
      transactionType: 'listing' | 'auction_win' | 'referral';
      baseAmount: number;
    },
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    const userRole = req.user?.role || 'BUYER';

    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    const calculation = await this.feeOverrideService.calculateTransactionFees(
      feeCalculation.transactionType,
      feeCalculation.baseAmount,
      userId,
      userRole,
    );

    return {
      calculation,
    };
  }

  @Get('statistics')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get fee override statistics and savings' })
  @ApiResponse({ status: 200, description: 'Fee statistics retrieved successfully' })
  async getFeeStatistics() {
    const statistics = await this.feeOverrideService.getFeeStatistics();

    return {
      statistics,
    };
  }

  @Get('history')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get fee override history' })
  @ApiResponse({ status: 200, description: 'Fee override history retrieved successfully' })
  async getFeeOverrideHistory() {
    const history = await this.feeOverrideService.getFeeOverrideHistory();

    return {
      history,
    };
  }

  @Post('validate-safety')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Validate safety of fee override configuration' })
  @ApiResponse({ status: 200, description: 'Fee override safety validated' })
  async validateFeeOverrideSafety(
    @Body() overrides: {
      listingFee?: number;
      depositFee?: number;
      commissionPercentage?: number;
      referralReward?: number;
    },
  ) {
    const safetyCheck = this.feeOverrideService.validateFeeOverrideSafety(overrides);

    return {
      safetyCheck,
      isSafe: safetyCheck.isSafe,
      recommendations: safetyCheck.warnings.length > 0
        ? ['Consider the warnings before applying these overrides']
        : ['Configuration appears safe to apply'],
    };
  }
}
