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
  ApiBody,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { SubscriptionService } from './subscription.service';

@ApiTags('Subscription Management')
@Controller('subscriptions')
@UseGuards(RolesGuard)
@ApiBearerAuth()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('plans')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all subscription plans' })
  @ApiResponse({ status: 200, description: 'Subscription plans retrieved successfully' })
  async getAllSubscriptionPlans() {
    const plans = await this.subscriptionService.getAllSubscriptionPlans();

    return {
      plans,
      total: plans.length,
    };
  }

  @Get('plans/dynamic')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get dynamic subscription plans for user (with campaign overrides)' })
  @ApiResponse({ status: 200, description: 'Dynamic subscription plans retrieved successfully' })
  async getDynamicSubscriptionPlansForUser(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    const plans = await this.subscriptionService.getAvailableSubscriptionPlansForUser(userId);

    return {
      plans,
      userId,
    };
  }

  @Get('user/effective')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user effective subscription (with campaign overrides)' })
  @ApiResponse({ status: 200, description: 'User effective subscription retrieved successfully' })
  async getUserEffectiveSubscription(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    const subscription = await this.subscriptionService.getUserEffectiveSubscription(userId);

    return {
      subscription,
    };
  }

  @Post('check-limits')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if user can perform action based on subscription limits' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['bid', 'list', 'feature'],
          description: 'Action to check limits for'
        }
      },
      required: ['action']
    }
  })
  @ApiResponse({ status: 200, description: 'Subscription limits checked successfully' })
  async checkSubscriptionLimits(
    @Body() body: { action: 'bid' | 'list' | 'feature' },
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    const limits = await this.subscriptionService.checkSubscriptionLimits(userId, body.action);

    return {
      limits,
    };
  }

  @Post('plans')
  @HttpCode(HttpStatus.CREATED)
  @Roles('admin')
  @ApiOperation({ summary: 'Create new subscription plan' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Plan name' },
        bidLimit: { type: 'number', description: 'Monthly bid limit' },
        listingLimit: { type: 'number', description: 'Monthly listing limit' },
        commissionRate: { type: 'number', description: 'Commission rate percentage' },
        escrowFeePercentage: { type: 'number', description: 'Escrow fee percentage' },
        monthlyPrice: { type: 'number', description: 'Monthly price in rupees' },
        roleType: { type: 'string', enum: ['BUYER', 'SELLER', 'COMPANY'], description: 'Target role type' },
        launchOverrideAllowed: { type: 'boolean', description: 'Allow launch campaign overrides' },
      },
      required: ['name', 'bidLimit', 'listingLimit', 'commissionRate', 'escrowFeePercentage', 'monthlyPrice', 'roleType', 'launchOverrideAllowed']
    }
  })
  @ApiResponse({ status: 201, description: 'Subscription plan created successfully' })
  async createSubscriptionPlan(
    @Body() planData: {
      name: string;
      bidLimit: number;
      listingLimit: number;
      commissionRate: number;
      escrowFeePercentage: number;
      monthlyPrice: number;
      roleType: string;
      launchOverrideAllowed: boolean;
    },
    @Req() req: any,
  ) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    const plan = await this.subscriptionService.createOrUpdateSubscriptionPlan(planData);

    return {
      success: true,
      message: 'Subscription plan created successfully',
      plan,
    };
  }

  @Put('plans/:planId')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Update subscription plan' })
  @ApiParam({ name: 'planId', description: 'Subscription plan ID' })
  @ApiResponse({ status: 200, description: 'Subscription plan updated successfully' })
  async updateSubscriptionPlan(
    @Param('planId') planId: string,
    @Body() planData: {
      name?: string;
      bidLimit?: number;
      listingLimit?: number;
      commissionRate?: number;
      escrowFeePercentage?: number;
      monthlyPrice?: number;
      roleType?: string;
      launchOverrideAllowed?: boolean;
    },
    @Req() req: any,
  ) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    const plan = await this.subscriptionService.createOrUpdateSubscriptionPlan({
      ...planData,
      planId,
    } as any);

    return {
      success: true,
      message: 'Subscription plan updated successfully',
      plan,
    };
  }

  @Delete('plans/:planId')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete subscription plan' })
  @ApiParam({ name: 'planId', description: 'Subscription plan ID' })
  @ApiResponse({ status: 200, description: 'Subscription plan deleted successfully' })
  async deleteSubscriptionPlan(@Param('planId') planId: string) {
    await this.subscriptionService.deleteSubscriptionPlan(planId);

    return {
      success: true,
      message: 'Subscription plan deleted successfully',
    };
  }

  @Post('initialize-defaults')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Initialize default subscription plans' })
  @ApiResponse({ status: 200, description: 'Default subscription plans initialized successfully' })
  async initializeDefaultPlans() {
    await this.subscriptionService.initializeDefaultPlans();

    return {
      success: true,
      message: 'Default subscription plans initialized successfully',
    };
  }

  @Get('plans/:planId')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get subscription plan by ID' })
  @ApiParam({ name: 'planId', description: 'Subscription plan ID' })
  @ApiResponse({ status: 200, description: 'Subscription plan retrieved successfully' })
  async getSubscriptionPlanById(@Param('planId') planId: string) {
    const plan = await this.subscriptionService.getSubscriptionPlanById(planId);

    return {
      plan,
    };
  }
}
