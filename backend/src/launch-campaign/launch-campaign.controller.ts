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
import { LaunchCampaignService, CreateCampaignDto, UpdateCampaignDto } from './launch-campaign.service';

@ApiTags('Launch Campaign Management')
@Controller('launch-campaigns')
@UseGuards(RolesGuard)
@ApiBearerAuth()
export class LaunchCampaignController {
  constructor(private readonly launchCampaignService: LaunchCampaignService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new launch campaign' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        campaignName: { type: 'string', description: 'Campaign name' },
        startDate: { type: 'string', format: 'date-time', description: 'Campaign start date' },
        endDate: { type: 'string', format: 'date-time', description: 'Campaign end date' },
        targetRoles: { type: 'array', items: { type: 'string' }, description: 'Target user roles' },
        bonusWalletCredit: { type: 'number', description: 'Bonus wallet credit amount' },
        referralBonusMultiplier: { type: 'number', description: 'Referral bonus multiplier' },
        freeBidLimit: { type: 'number', description: 'Free bid limit' },
        commissionOverridePercentage: { type: 'number', description: 'Commission override percentage' },
        depositOverrideAmount: { type: 'number', description: 'Deposit override amount' },
        subscriptionOverridePlan: { type: 'string', description: 'Subscription override plan' },
        priorityListingEnabled: { type: 'boolean', description: 'Enable priority listings' },
      },
      required: ['campaignName', 'startDate', 'endDate', 'targetRoles', 'bonusWalletCredit', 'referralBonusMultiplier', 'freeBidLimit', 'priorityListingEnabled']
    }
  })
  @ApiResponse({ status: 201, description: 'Campaign created successfully' })
  async createCampaign(
    @Body() campaignData: CreateCampaignDto,
    @Req() req: any,
  ) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    const campaign = await this.launchCampaignService.createCampaign(campaignData, adminId);

    return {
      success: true,
      message: 'Launch campaign created successfully',
      campaign,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get all launch campaigns' })
  @ApiResponse({ status: 200, description: 'Campaigns retrieved successfully' })
  async getAllCampaigns() {
    const campaigns = await this.launchCampaignService.getAllCampaigns();

    return {
      campaigns,
      total: campaigns.length,
    };
  }

  @Get('active')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get currently active campaign' })
  @ApiResponse({ status: 200, description: 'Active campaign retrieved successfully' })
  async getActiveCampaign() {
    const campaign = await this.launchCampaignService.getActiveCampaign();

    return {
      activeCampaign: campaign,
      hasActiveCampaign: !!campaign,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get campaign by ID' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Campaign retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async getCampaignById(@Param('id') campaignId: string) {
    const campaign = await this.launchCampaignService.getCampaignById(campaignId);

    return {
      campaign,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Update campaign' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Campaign updated successfully' })
  async updateCampaign(
    @Param('id') campaignId: string,
    @Body() updateData: UpdateCampaignDto,
    @Req() req: any,
  ) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    const campaign = await this.launchCampaignService.updateCampaign(campaignId, updateData, adminId);

    return {
      success: true,
      message: 'Campaign updated successfully',
      campaign,
    };
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Activate campaign (ensures only one active at a time)' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Campaign activated successfully' })
  async activateCampaign(
    @Param('id') campaignId: string,
    @Req() req: any,
  ) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    const campaign = await this.launchCampaignService.activateCampaign(campaignId, adminId);

    return {
      success: true,
      message: 'Campaign activated successfully',
      campaign,
      warning: 'All other campaigns have been deactivated',
    };
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Deactivate campaign' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Campaign deactivated successfully' })
  async deactivateCampaign(
    @Param('id') campaignId: string,
    @Req() req: any,
  ) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    const campaign = await this.launchCampaignService.deactivateCampaign(campaignId, adminId);

    return {
      success: true,
      message: 'Campaign deactivated successfully',
      campaign,
    };
  }

  @Post(':id/end')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'End campaign manually (before scheduled end date)' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Campaign ended successfully' })
  async endCampaign(
    @Param('id') campaignId: string,
    @Req() req: any,
  ) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    const campaign = await this.launchCampaignService.endCampaign(campaignId, adminId);

    return {
      success: true,
      message: 'Campaign ended successfully',
      campaign,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete campaign' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Campaign deleted successfully' })
  async deleteCampaign(
    @Param('id') campaignId: string,
    @Req() req: any,
  ) {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new BadRequestException('Admin authentication required');
    }

    await this.launchCampaignService.deleteCampaign(campaignId, adminId);

    return {
      success: true,
      message: 'Campaign deleted successfully',
    };
  }

  @Get(':id/performance')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Get campaign performance metrics' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Campaign performance retrieved successfully' })
  async getCampaignPerformance(@Param('id') campaignId: string) {
    const performance = await this.launchCampaignService.getCampaignPerformance(campaignId);

    return {
      performance,
    };
  }

  @Get('user/eligibility')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check user eligibility for active campaign' })
  @ApiResponse({ status: 200, description: 'User eligibility checked successfully' })
  async checkUserEligibility(@Req() req: any) {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      throw new BadRequestException('User authentication required');
    }

    const eligibility = await this.launchCampaignService.getUserCampaignEligibility(userId, userRole);

    return {
      eligibility,
    };
  }

  @Post('process-expired')
  @HttpCode(HttpStatus.OK)
  @Roles('admin')
  @ApiOperation({ summary: 'Process expired campaigns (called by cron job)' })
  @ApiResponse({ status: 200, description: 'Expired campaigns processed successfully' })
  async processExpiredCampaigns() {
    const processedCount = await this.launchCampaignService.processExpiredCampaigns();

    return {
      success: true,
      message: `Processed ${processedCount} expired campaigns`,
      processedCount,
    };
  }
}
