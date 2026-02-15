import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FeatureFlagService } from '../feature-flag/feature-flag.service';

export interface CreateCampaignDto {
  campaignName: string;
  startDate: Date;
  endDate: Date;
  targetRoles: string[];
  bonusWalletCredit: number;
  referralBonusMultiplier: number;
  freeBidLimit: number;
  commissionOverridePercentage?: number;
  depositOverrideAmount?: number;
  subscriptionOverridePlan?: string;
  priorityListingEnabled: boolean;
}

export interface UpdateCampaignDto {
  campaignName?: string;
  startDate?: Date;
  endDate?: Date;
  targetRoles?: string[];
  bonusWalletCredit?: number;
  referralBonusMultiplier?: number;
  freeBidLimit?: number;
  commissionOverridePercentage?: number;
  depositOverrideAmount?: number;
  subscriptionOverridePlan?: string;
  priorityListingEnabled?: boolean;
}

@Injectable()
export class LaunchCampaignService {
  private readonly logger = new Logger(LaunchCampaignService.name);

  constructor(
    private prisma: PrismaService,
    private featureFlagService: FeatureFlagService,
  ) {}

  /**
   * Create a new launch campaign
   */
  async createCampaign(campaignData: CreateCampaignDto, createdByAdmin: string): Promise<any> {
    try {
      // Validate campaign data
      this.validateCampaignData(campaignData);

      // Check for overlapping active campaigns
      const hasActiveCampaign = await this.hasActiveCampaign();
      if (hasActiveCampaign) {
        throw new BadRequestException('Cannot create campaign: Another campaign is currently active');
      }

      // Create campaign
      const campaign = await this.prisma.launchCampaign.create({
        data: {
          campaignName: campaignData.campaignName,
          startDate: campaignData.startDate,
          endDate: campaignData.endDate,
          targetRoles: campaignData.targetRoles,
          bonusWalletCredit: campaignData.bonusWalletCredit,
          referralBonusMultiplier: campaignData.referralBonusMultiplier,
          freeBidLimit: campaignData.freeBidLimit,
          commissionOverridePercentage: campaignData.commissionOverridePercentage,
          depositOverrideAmount: campaignData.depositOverrideAmount,
          subscriptionOverridePlan: campaignData.subscriptionOverridePlan,
          priorityListingEnabled: campaignData.priorityListingEnabled,
          createdByAdmin,
          activeStatus: false, // Start inactive
        },
      });

      this.logger.log(`Launch campaign created: ${campaign.campaignName} by ${createdByAdmin}`);

      return campaign;
    } catch (error) {
      this.logger.error('Error creating launch campaign:', error);
      throw error;
    }
  }

  /**
   * Get all campaigns
   */
  async getAllCampaigns(): Promise<any[]> {
    try {
      const campaigns = await this.prisma.launchCampaign.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return campaigns;
    } catch (error) {
      this.logger.error('Error getting all campaigns:', error);
      throw error;
    }
  }

  /**
   * Get active campaign
   */
  async getActiveCampaign(): Promise<any | null> {
    try {
      const now = new Date();

      const activeCampaign = await this.prisma.launchCampaign.findFirst({
        where: {
          activeStatus: true,
          startDate: { lte: now },
          endDate: { gte: now },
        },
      });

      return activeCampaign;
    } catch (error) {
      this.logger.error('Error getting active campaign:', error);
      throw error;
    }
  }

  /**
   * Get campaign by ID
   */
  async getCampaignById(campaignId: string): Promise<any> {
    try {
      const campaign = await this.prisma.launchCampaign.findUnique({
        where: { id: campaignId },
      });

      if (!campaign) {
        throw new NotFoundException('Campaign not found');
      }

      return campaign;
    } catch (error) {
      this.logger.error(`Error getting campaign ${campaignId}:`, error);
      throw error;
    }
  }

  /**
   * Update campaign
   */
  async updateCampaign(campaignId: string, updateData: UpdateCampaignDto, updatedBy: string): Promise<any> {
    try {
      // Validate campaign exists
      const existingCampaign = await this.getCampaignById(campaignId);

      // If updating dates, validate them
      if (updateData.startDate || updateData.endDate) {
        const startDate = updateData.startDate || existingCampaign.startDate;
        const endDate = updateData.endDate || existingCampaign.endDate;

        if (startDate >= endDate) {
          throw new BadRequestException('Campaign start date must be before end date');
        }
      }

      // Update campaign
      const updatedCampaign = await this.prisma.launchCampaign.update({
        where: { id: campaignId },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Launch campaign updated: ${campaignId} by ${updatedBy}`);

      return updatedCampaign;
    } catch (error) {
      this.logger.error(`Error updating campaign ${campaignId}:`, error);
      throw error;
    }
  }

  /**
   * Activate campaign (ensures only one active at a time)
   */
  async activateCampaign(campaignId: string, activatedBy: string): Promise<any> {
    try {
      // Check if campaign exists
      const campaign = await this.getCampaignById(campaignId);

      // Check for other active campaigns and deactivate them
      await this.prisma.launchCampaign.updateMany({
        where: { activeStatus: true },
        data: {
          activeStatus: false,
          updatedAt: new Date(),
        },
      });

      // Activate the specified campaign
      const activatedCampaign = await this.prisma.launchCampaign.update({
        where: { id: campaignId },
        data: {
          activeStatus: true,
          updatedAt: new Date(),
        },
      });

      // Enable launch mode feature flag
      await this.featureFlagService.setFlag('launch_mode_active', true, activatedBy);

      this.logger.log(`Launch campaign activated: ${campaign.campaignName} by ${activatedBy}`);

      return activatedCampaign;
    } catch (error) {
      this.logger.error(`Error activating campaign ${campaignId}:`, error);
      throw error;
    }
  }

  /**
   * Deactivate campaign
   */
  async deactivateCampaign(campaignId: string, deactivatedBy: string): Promise<any> {
    try {
      // Check if campaign exists
      const campaign = await this.getCampaignById(campaignId);

      // Deactivate campaign
      const deactivatedCampaign = await this.prisma.launchCampaign.update({
        where: { id: campaignId },
        data: {
          activeStatus: false,
          updatedAt: new Date(),
        },
      });

      // Check if there are any other active campaigns
      const hasOtherActive = await this.hasActiveCampaign();
      if (!hasOtherActive) {
        // Disable launch mode if no active campaigns
        await this.featureFlagService.setFlag('launch_mode_active', false, deactivatedBy);
      }

      this.logger.log(`Launch campaign deactivated: ${campaign.campaignName} by ${deactivatedBy}`);

      return deactivatedCampaign;
    } catch (error) {
      this.logger.error(`Error deactivating campaign ${campaignId}:`, error);
      throw error;
    }
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(campaignId: string, deletedBy: string): Promise<void> {
    try {
      // Check if campaign is active
      const campaign = await this.getCampaignById(campaignId);

      if (campaign.activeStatus) {
        throw new BadRequestException('Cannot delete active campaign. Deactivate first.');
      }

      // Delete campaign
      await this.prisma.launchCampaign.delete({
        where: { id: campaignId },
      });

      this.logger.log(`Launch campaign deleted: ${campaign.campaignName} by ${deletedBy}`);
    } catch (error) {
      this.logger.error(`Error deleting campaign ${campaignId}:`, error);
      throw error;
    }
  }

  /**
   * End campaign manually (before scheduled end date)
   */
  async endCampaign(campaignId: string, endedBy: string): Promise<any> {
    try {
      // Set end date to now
      const now = new Date();

      const endedCampaign = await this.prisma.launchCampaign.update({
        where: { id: campaignId },
        data: {
          endDate: now,
          activeStatus: false,
          updatedAt: now,
        },
      });

      // Disable launch mode
      await this.featureFlagService.setFlag('launch_mode_active', false, endedBy);

      this.logger.log(`Launch campaign ended manually: ${endedCampaign.campaignName} by ${endedBy}`);

      return endedCampaign;
    } catch (error) {
      this.logger.error(`Error ending campaign ${campaignId}:`, error);
      throw error;
    }
  }

  /**
   * Get campaign performance metrics
   */
  async getCampaignPerformance(campaignId: string): Promise<any> {
    try {
      const campaign = await this.getCampaignById(campaignId);

      // Get metrics from marketplace_metrics table
      const campaignMetrics = await this.prisma.marketplaceMetric.findMany({
        where: {
          campaignId: campaignId,
          date: {
            gte: campaign.startDate,
            lte: campaign.endDate,
          },
        },
        orderBy: { date: 'asc' },
      });

      // Calculate totals
      const totalMetrics = campaignMetrics.reduce(
        (acc, metric) => ({
          totalUsers: acc.totalUsers + metric.newRegistrations,
          totalAuctions: acc.totalAuctions + metric.auctionsCreated,
          totalBids: acc.totalBids + metric.bidsPlaced,
          totalRevenue: acc.totalRevenue + metric.revenueGenerated,
          totalEscrowVolume: acc.totalEscrowVolume + metric.escrowVolume,
          totalReferralSignups: acc.totalReferralSignups + metric.referralSignups,
        }),
        {
          totalUsers: 0,
          totalAuctions: 0,
          totalBids: 0,
          totalRevenue: 0,
          totalEscrowVolume: 0,
          totalReferralSignups: 0,
        }
      );

      return {
        campaign: {
          id: campaign.id,
          name: campaign.campaignName,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          activeStatus: campaign.activeStatus,
        },
        performance: totalMetrics,
        dailyMetrics: campaignMetrics,
        roi: {
          investment: 0, // Would be tracked separately
          revenue: totalMetrics.totalRevenue,
          roi: 0, // Calculated as (revenue - investment) / investment * 100
        },
      };
    } catch (error) {
      this.logger.error(`Error getting campaign performance ${campaignId}:`, error);
      throw error;
    }
  }

  /**
   * Check if user is eligible for campaign benefits
   */
  async getUserCampaignEligibility(userId: string, userRole: string): Promise<{
    eligible: boolean;
    activeCampaign?: any;
    benefits?: any;
  }> {
    try {
      const activeCampaign = await this.getActiveCampaign();

      if (!activeCampaign) {
        return { eligible: false };
      }

      // Check if user's role is targeted by the campaign
      const isRoleTargeted = activeCampaign.targetRoles.includes('all') ||
                           activeCampaign.targetRoles.includes(userRole.toLowerCase());

      if (!isRoleTargeted) {
        return { eligible: false };
      }

      // User is eligible
      return {
        eligible: true,
        activeCampaign: {
          id: activeCampaign.id,
          name: activeCampaign.campaignName,
          endDate: activeCampaign.endDate,
        },
        benefits: {
          bonusWalletCredit: activeCampaign.bonusWalletCredit,
          referralBonusMultiplier: activeCampaign.referralBonusMultiplier,
          freeBidLimit: activeCampaign.freeBidLimit,
          commissionOverridePercentage: activeCampaign.commissionOverridePercentage,
          depositOverrideAmount: activeCampaign.depositOverrideAmount,
          subscriptionOverridePlan: activeCampaign.subscriptionOverridePlan,
          priorityListingEnabled: activeCampaign.priorityListingEnabled,
        },
      };
    } catch (error) {
      this.logger.error(`Error checking user campaign eligibility ${userId}:`, error);
      return { eligible: false };
    }
  }

  /**
   * Check if there's currently an active campaign
   */
  private async hasActiveCampaign(): Promise<boolean> {
    try {
      const now = new Date();
      const activeCount = await this.prisma.launchCampaign.count({
        where: {
          activeStatus: true,
          startDate: { lte: now },
          endDate: { gte: now },
        },
      });

      return activeCount > 0;
    } catch (error) {
      this.logger.error('Error checking for active campaigns:', error);
      return false;
    }
  }

  /**
   * Validate campaign data
   */
  private validateCampaignData(data: CreateCampaignDto): void {
    if (data.startDate >= data.endDate) {
      throw new BadRequestException('Campaign start date must be before end date');
    }

    if (data.bonusWalletCredit < 0) {
      throw new BadRequestException('Bonus wallet credit cannot be negative');
    }

    if (data.referralBonusMultiplier < 1) {
      throw new BadRequestException('Referral bonus multiplier must be at least 1');
    }

    if (data.freeBidLimit < 0) {
      throw new BadRequestException('Free bid limit cannot be negative');
    }

    if (data.commissionOverridePercentage !== undefined && data.commissionOverridePercentage < 0) {
      throw new BadRequestException('Commission override percentage cannot be negative');
    }

    if (data.depositOverrideAmount !== undefined && data.depositOverrideAmount < 0) {
      throw new BadRequestException('Deposit override amount cannot be negative');
    }

    // Validate target roles
    const validRoles = ['buyer', 'seller', 'company', 'all'];
    const invalidRoles = data.targetRoles.filter(role => !validRoles.includes(role));
    if (invalidRoles.length > 0) {
      throw new BadRequestException(`Invalid target roles: ${invalidRoles.join(', ')}`);
    }
  }

  /**
   * Auto-end expired campaigns (called by cron job)
   */
  async processExpiredCampaigns(): Promise<number> {
    try {
      const now = new Date();

      const expiredCampaigns = await this.prisma.launchCampaign.findMany({
        where: {
          activeStatus: true,
          endDate: { lt: now },
        },
      });

      if (expiredCampaigns.length === 0) {
        return 0;
      }

      // End expired campaigns
      await this.prisma.launchCampaign.updateMany({
        where: {
          activeStatus: true,
          endDate: { lt: now },
        },
        data: {
          activeStatus: false,
          updatedAt: now,
        },
      });

      // Check if launch mode should be disabled
      const hasOtherActive = await this.hasActiveCampaign();
      if (!hasOtherActive) {
        await this.featureFlagService.setFlag('launch_mode_active', false, 'system');
      }

      this.logger.log(`Auto-ended ${expiredCampaigns.length} expired campaigns`);

      return expiredCampaigns.length;
    } catch (error) {
      this.logger.error('Error processing expired campaigns:', error);
      throw error;
    }
  }
}
