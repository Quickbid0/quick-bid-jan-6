import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LaunchCampaignService } from '../launch-campaign/launch-campaign.service';

export interface SubscriptionPlan {
  id: string;
  name: string;
  bidLimit: number;
  listingLimit: number;
  commissionRate: number;
  escrowFeePercentage: number;
  monthlyPrice: number;
  roleType: string;
  launchOverrideAllowed: boolean;
}

export interface DynamicSubscriptionPlan extends SubscriptionPlan {
  // Campaign overrides
  campaignOverrides?: {
    bonusWalletCredit: number;
    referralBonusMultiplier: number;
    freeBidLimit: number;
    commissionOverridePercentage?: number;
    depositOverrideAmount?: number;
    subscriptionOverridePlan?: string;
    priorityListingEnabled: boolean;
  };
  // Final calculated values
  effectiveBidLimit: number;
  effectiveCommissionRate: number;
  effectiveEscrowFeePercentage: number;
  effectiveMonthlyPrice: number;
  hasCampaignOverrides: boolean;
}

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private prisma: PrismaService,
    private launchCampaignService: LaunchCampaignService,
  ) {}

  /**
   * Get all subscription plans
   */
  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const plans = await this.prisma.subscriptionPlan.findMany({
        orderBy: { monthlyPrice: 'asc' },
      });

      return plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        bidLimit: plan.bidLimit,
        listingLimit: plan.listingLimit,
        commissionRate: plan.commissionRate,
        escrowFeePercentage: plan.escrowFeePercentage,
        monthlyPrice: plan.monthlyPrice,
        roleType: plan.roleType,
        launchOverrideAllowed: plan.launchOverrideAllowed,
      }));
    } catch (error) {
      this.logger.error('Error getting subscription plans:', error);
      throw error;
    }
  }

  /**
   * Get subscription plan by ID
   */
  async getSubscriptionPlanById(planId: string): Promise<SubscriptionPlan> {
    try {
      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: { id: planId },
      });

      if (!plan) {
        throw new NotFoundException('Subscription plan not found');
      }

      return {
        id: plan.id,
        name: plan.name,
        bidLimit: plan.bidLimit,
        listingLimit: plan.listingLimit,
        commissionRate: plan.commissionRate,
        escrowFeePercentage: plan.escrowFeePercentage,
        monthlyPrice: plan.monthlyPrice,
        roleType: plan.roleType,
        launchOverrideAllowed: plan.launchOverrideAllowed,
      };
    } catch (error) {
      this.logger.error(`Error getting subscription plan ${planId}:`, error);
      throw error;
    }
  }

  /**
   * Get dynamic subscription plan for user (with campaign overrides)
   */
  async getDynamicSubscriptionPlanForUser(userId: string, basePlanId?: string): Promise<DynamicSubscriptionPlan> {
    try {
      // Get user's current subscription or base plan
      let basePlan: SubscriptionPlan;

      if (basePlanId) {
        basePlan = await this.getSubscriptionPlanById(basePlanId);
      } else {
        // Get user's current subscription
        const userSubscription = await this.prisma.userSubscription.findFirst({
          where: { userId },
          include: { plan: true },
        });

        if (userSubscription?.plan) {
          basePlan = {
            id: userSubscription.plan.id,
            name: userSubscription.plan.name,
            bidLimit: userSubscription.plan.bidLimit,
            listingLimit: userSubscription.plan.listingLimit,
            commissionRate: userSubscription.plan.commissionRate,
            escrowFeePercentage: userSubscription.plan.escrowFeePercentage,
            monthlyPrice: userSubscription.plan.monthlyPrice,
            roleType: userSubscription.plan.roleType,
            launchOverrideAllowed: userSubscription.plan.launchOverrideAllowed,
          };
        } else {
          // Default to free plan
          basePlan = await this.getDefaultPlanForUser(userId);
        }
      }

      // Check for campaign overrides
      const userEligibility = await this.launchCampaignService.getUserCampaignEligibility(userId, 'BUYER'); // Default to buyer for now

      let campaignOverrides;
      let hasCampaignOverrides = false;

      if (userEligibility.eligible && basePlan.launchOverrideAllowed) {
        campaignOverrides = userEligibility.benefits;
        hasCampaignOverrides = true;
      }

      // Calculate effective values
      const effectiveBidLimit = hasCampaignOverrides && campaignOverrides?.freeBidLimit
        ? basePlan.bidLimit + campaignOverrides.freeBidLimit
        : basePlan.bidLimit;

      const effectiveCommissionRate = hasCampaignOverrides && campaignOverrides?.commissionOverridePercentage !== undefined
        ? campaignOverrides.commissionOverridePercentage
        : basePlan.commissionRate;

      const effectiveEscrowFeePercentage = basePlan.escrowFeePercentage; // Escrow fees never overridden for safety

      const effectiveMonthlyPrice = hasCampaignOverrides && campaignOverrides?.subscriptionOverridePlan
        ? 0 // Free during campaign
        : basePlan.monthlyPrice;

      return {
        ...basePlan,
        campaignOverrides,
        effectiveBidLimit,
        effectiveCommissionRate,
        effectiveEscrowFeePercentage,
        effectiveMonthlyPrice,
        hasCampaignOverrides,
      };
    } catch (error) {
      this.logger.error(`Error getting dynamic subscription plan for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get subscription plans available to user (with dynamic pricing)
   */
  async getAvailableSubscriptionPlansForUser(userId: string): Promise<DynamicSubscriptionPlan[]> {
    try {
      const allPlans = await this.getAllSubscriptionPlans();
      const userEligibility = await this.launchCampaignService.getUserCampaignEligibility(userId, 'BUYER');

      return Promise.all(
        allPlans.map(async (plan) => {
          let campaignOverrides;
          let hasCampaignOverrides = false;

          if (userEligibility.eligible && plan.launchOverrideAllowed) {
            campaignOverrides = userEligibility.benefits;
            hasCampaignOverrides = true;
          }

          // Calculate effective values
          const effectiveBidLimit = hasCampaignOverrides && campaignOverrides?.freeBidLimit
            ? plan.bidLimit + campaignOverrides.freeBidLimit
            : plan.bidLimit;

          const effectiveCommissionRate = hasCampaignOverrides && campaignOverrides?.commissionOverridePercentage !== undefined
            ? campaignOverrides.commissionOverridePercentage
            : plan.commissionRate;

          const effectiveEscrowFeePercentage = plan.escrowFeePercentage;

          const effectiveMonthlyPrice = hasCampaignOverrides && campaignOverrides?.subscriptionOverridePlan
            ? 0 // Free during campaign
            : plan.monthlyPrice;

          return {
            ...plan,
            campaignOverrides,
            effectiveBidLimit,
            effectiveCommissionRate,
            effectiveEscrowFeePercentage,
            effectiveMonthlyPrice,
            hasCampaignOverrides,
          };
        })
      );
    } catch (error) {
      this.logger.error(`Error getting available subscription plans for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Create or update subscription plan
   */
  async createOrUpdateSubscriptionPlan(planData: {
    name: string;
    bidLimit: number;
    listingLimit: number;
    commissionRate: number;
    escrowFeePercentage: number;
    monthlyPrice: number;
    roleType: string;
    launchOverrideAllowed: boolean;
    planId?: string; // For updates
  }): Promise<SubscriptionPlan> {
    try {
      const plan = planData.planId
        ? await this.prisma.subscriptionPlan.update({
            where: { id: planData.planId },
            data: {
              name: planData.name,
              bidLimit: planData.bidLimit,
              listingLimit: planData.listingLimit,
              commissionRate: planData.commissionRate,
              escrowFeePercentage: planData.escrowFeePercentage,
              monthlyPrice: planData.monthlyPrice,
              roleType: planData.roleType,
              launchOverrideAllowed: planData.launchOverrideAllowed,
            },
          })
        : await this.prisma.subscriptionPlan.create({
            data: {
              name: planData.name,
              bidLimit: planData.bidLimit,
              listingLimit: planData.listingLimit,
              commissionRate: planData.commissionRate,
              escrowFeePercentage: planData.escrowFeePercentage,
              monthlyPrice: planData.monthlyPrice,
              roleType: planData.roleType,
              launchOverrideAllowed: planData.launchOverrideAllowed,
            },
          });

      this.logger.log(`Subscription plan ${planData.planId ? 'updated' : 'created'}: ${plan.name}`);

      return {
        id: plan.id,
        name: plan.name,
        bidLimit: plan.bidLimit,
        listingLimit: plan.listingLimit,
        commissionRate: plan.commissionRate,
        escrowFeePercentage: plan.escrowFeePercentage,
        monthlyPrice: plan.monthlyPrice,
        roleType: plan.roleType,
        launchOverrideAllowed: plan.launchOverrideAllowed,
      };
    } catch (error) {
      this.logger.error('Error creating/updating subscription plan:', error);
      throw error;
    }
  }

  /**
   * Delete subscription plan
   */
  async deleteSubscriptionPlan(planId: string): Promise<void> {
    try {
      // Check if plan is being used
      const usageCount = await this.prisma.userSubscription.count({
        where: { planId },
      });

      if (usageCount > 0) {
        throw new Error(`Cannot delete plan: ${usageCount} users are currently subscribed`);
      }

      await this.prisma.subscriptionPlan.delete({
        where: { id: planId },
      });

      this.logger.log(`Subscription plan deleted: ${planId}`);
    } catch (error) {
      this.logger.error(`Error deleting subscription plan ${planId}:`, error);
      throw error;
    }
  }

  /**
   * Get user's current effective subscription
   */
  async getUserEffectiveSubscription(userId: string): Promise<{
    basePlan: SubscriptionPlan;
    effectivePlan: DynamicSubscriptionPlan;
    campaignActive: boolean;
    campaignName?: string;
  }> {
    try {
      // Get user's base subscription
      const userSubscription = await this.prisma.userSubscription.findFirst({
        where: { userId },
        include: { plan: true },
      });

      if (!userSubscription?.plan) {
        // User has no subscription, return default
        const defaultPlan = await this.getDefaultPlanForUser(userId);
        return {
          basePlan: defaultPlan,
          effectivePlan: {
            ...defaultPlan,
            campaignOverrides: undefined,
            effectiveBidLimit: defaultPlan.bidLimit,
            effectiveCommissionRate: defaultPlan.commissionRate,
            effectiveEscrowFeePercentage: defaultPlan.escrowFeePercentage,
            effectiveMonthlyPrice: defaultPlan.monthlyPrice,
            hasCampaignOverrides: false,
          },
          campaignActive: false,
        };
      }

      const basePlan: SubscriptionPlan = {
        id: userSubscription.plan.id,
        name: userSubscription.plan.name,
        bidLimit: userSubscription.plan.bidLimit,
        listingLimit: userSubscription.plan.listingLimit,
        commissionRate: userSubscription.plan.commissionRate,
        escrowFeePercentage: userSubscription.plan.escrowFeePercentage,
        monthlyPrice: userSubscription.plan.monthlyPrice,
        roleType: userSubscription.plan.roleType,
        launchOverrideAllowed: userSubscription.plan.launchOverrideAllowed,
      };

      // Get effective plan with campaign overrides
      const effectivePlan = await this.getDynamicSubscriptionPlanForUser(userId, basePlan.id);

      // Get campaign info
      const userEligibility = await this.launchCampaignService.getUserCampaignEligibility(userId, basePlan.roleType);

      return {
        basePlan,
        effectivePlan,
        campaignActive: userEligibility.eligible,
        campaignName: userEligibility.activeCampaign?.name,
      };
    } catch (error) {
      this.logger.error(`Error getting user effective subscription ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Check if user can perform action based on subscription limits
   */
  async checkSubscriptionLimits(userId: string, action: 'bid' | 'list' | 'feature'): Promise<{
    allowed: boolean;
    remaining: number;
    upgradeRequired: boolean;
    effectivePlan: DynamicSubscriptionPlan;
  }> {
    try {
      const effectiveSubscription = await this.getUserEffectiveSubscription(userId);
      const { effectivePlan } = effectiveSubscription;

      let limit: number;
      let used: number;

      switch (action) {
        case 'bid':
          // Get user's bids this month
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);

          used = await this.prisma.bid.count({
            where: {
              userId,
              createdAt: { gte: startOfMonth },
            },
          });

          limit = effectivePlan.effectiveBidLimit;
          break;

        case 'list':
          // Get user's listings this month
          const startOfMonthList = new Date();
          startOfMonthList.setDate(1);
          startOfMonthList.setHours(0, 0, 0, 0);

          used = await this.prisma.product.count({
            where: {
              sellerId: userId,
              createdAt: { gte: startOfMonthList },
            },
          });

          limit = effectivePlan.listingLimit;
          break;

        default:
          return {
            allowed: true,
            remaining: 0,
            upgradeRequired: false,
            effectivePlan,
          };
      }

      const remaining = Math.max(0, limit - used);
      const allowed = remaining > 0;
      const upgradeRequired = !allowed && limit === effectivePlan.bidLimit; // Only if not boosted by campaign

      return {
        allowed,
        remaining,
        upgradeRequired,
        effectivePlan,
      };
    } catch (error) {
      this.logger.error(`Error checking subscription limits for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get default plan for user
   */
  private async getDefaultPlanForUser(userId: string): Promise<SubscriptionPlan> {
    try {
      // Get user role
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      const roleType = user?.role || 'BUYER';

      // Get the free/basic plan for this role
      const defaultPlan = await this.prisma.subscriptionPlan.findFirst({
        where: {
          roleType: roleType,
          monthlyPrice: 0, // Free plan
        },
      });

      if (defaultPlan) {
        return {
          id: defaultPlan.id,
          name: defaultPlan.name,
          bidLimit: defaultPlan.bidLimit,
          listingLimit: defaultPlan.listingLimit,
          commissionRate: defaultPlan.commissionRate,
          escrowFeePercentage: defaultPlan.escrowFeePercentage,
          monthlyPrice: defaultPlan.monthlyPrice,
          roleType: defaultPlan.roleType,
          launchOverrideAllowed: defaultPlan.launchOverrideAllowed,
        };
      }

      // Fallback free plan
      return {
        id: 'free_plan',
        name: 'Free Plan',
        bidLimit: 5,
        listingLimit: roleType === 'SELLER' ? 1 : 0,
        commissionRate: 5.0,
        escrowFeePercentage: 2.0,
        monthlyPrice: 0,
        roleType,
        launchOverrideAllowed: true,
      };
    } catch (error) {
      this.logger.error(`Error getting default plan for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Initialize default subscription plans
   */
  async initializeDefaultPlans(): Promise<void> {
    try {
      const defaultPlans = [
        // Buyer plans
        {
          name: 'Free',
          bidLimit: 5,
          listingLimit: 0,
          commissionRate: 5.0,
          escrowFeePercentage: 2.0,
          monthlyPrice: 0,
          roleType: 'BUYER',
          launchOverrideAllowed: true,
        },
        {
          name: 'Silver',
          bidLimit: 50,
          listingLimit: 0,
          commissionRate: 3.0,
          escrowFeePercentage: 1.5,
          monthlyPrice: 499,
          roleType: 'BUYER',
          launchOverrideAllowed: true,
        },
        {
          name: 'Gold',
          bidLimit: 200,
          listingLimit: 0,
          commissionRate: 2.0,
          escrowFeePercentage: 1.0,
          monthlyPrice: 999,
          roleType: 'BUYER',
          launchOverrideAllowed: true,
        },
        {
          name: 'Platinum',
          bidLimit: 1000,
          listingLimit: 0,
          commissionRate: 1.0,
          escrowFeePercentage: 0.5,
          monthlyPrice: 1999,
          roleType: 'BUYER',
          launchOverrideAllowed: false,
        },

        // Seller plans
        {
          name: 'Free Seller',
          bidLimit: 0,
          listingLimit: 1,
          commissionRate: 5.0,
          escrowFeePercentage: 2.0,
          monthlyPrice: 0,
          roleType: 'SELLER',
          launchOverrideAllowed: true,
        },
        {
          name: 'Seller Pro',
          bidLimit: 0,
          listingLimit: 50,
          commissionRate: 3.0,
          escrowFeePercentage: 1.5,
          monthlyPrice: 999,
          roleType: 'SELLER',
          launchOverrideAllowed: true,
        },
        {
          name: 'Seller Enterprise',
          bidLimit: 0,
          listingLimit: 500,
          commissionRate: 2.0,
          escrowFeePercentage: 1.0,
          monthlyPrice: 4999,
          roleType: 'SELLER',
          launchOverrideAllowed: false,
        },
      ];

      for (const planData of defaultPlans) {
        const existingPlan = await this.prisma.subscriptionPlan.findFirst({
          where: {
            name: planData.name,
            roleType: planData.roleType,
          },
        });

        if (!existingPlan) {
          await this.prisma.subscriptionPlan.create({
            data: planData,
          });
          this.logger.log(`Created default subscription plan: ${planData.name}`);
        }
      }
    } catch (error) {
      this.logger.error('Error initializing default subscription plans:', error);
    }
  }
}
