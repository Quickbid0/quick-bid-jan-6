import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FeatureFlagService } from '../feature-flag/feature-flag.service';
import { LaunchCampaignService } from '../launch-campaign/launch-campaign.service';

export interface FeeStructure {
  listingFee?: number;
  depositFee?: number;
  commissionPercentage?: number;
  escrowFee?: number; // Never overridden for safety
  referralReward?: number;
}

export interface DynamicFeeStructure extends FeeStructure {
  isLaunchMode: boolean;
  campaignActive: boolean;
  campaignName?: string;
  originalFees: FeeStructure;
  appliedOverrides: string[]; // List of applied overrides
}

@Injectable()
export class FeeOverrideService {
  private readonly logger = new Logger(FeeOverrideService.name);

  // Default fee structure (never changes)
  private readonly DEFAULT_FEES: FeeStructure = {
    listingFee: 500, // ₹500 for sellers
    depositFee: 1000, // ₹1000 security deposit
    commissionPercentage: 5.0, // 5% commission
    escrowFee: 2.0, // 2% escrow fee (NEVER OVERRIDDEN)
    referralReward: 50, // ₹50 base referral reward
  };

  constructor(
    private prisma: PrismaService,
    private featureFlagService: FeatureFlagService,
    private launchCampaignService: LaunchCampaignService,
  ) {}

  /**
   * Get current fee overrides
   */
  async getCurrentFeeOverrides(): Promise<FeeStructure | null> {
    try {
      const feeOverride = await this.prisma.feeOverride.findFirst({
        where: { activeStatus: true },
        orderBy: { updatedAt: 'desc' },
      });

      if (!feeOverride) {
        return null;
      }

      return {
        listingFee: feeOverride.listingFee ?? undefined,
        depositFee: feeOverride.depositFee ?? undefined,
        commissionPercentage: feeOverride.commissionPercentage ?? undefined,
        escrowFee: undefined, // NEVER overridden
        referralReward: feeOverride.referralReward ?? undefined,
      };
    } catch (error) {
      this.logger.error('Error getting current fee overrides:', error);
      return null;
    }
  }

  /**
   * Update fee overrides
   */
  async updateFeeOverrides(
    overrides: Partial<FeeStructure>,
    updatedBy: string,
  ): Promise<FeeStructure> {
    try {
      // Validate overrides (never allow escrow fee override)
      if (overrides.escrowFee !== undefined) {
        throw new Error('Escrow fee cannot be overridden for security reasons');
      }

      const updatedOverride = await this.prisma.feeOverride.upsert({
        where: { id: 'current' }, // Using fixed ID for single record
        update: {
          listingFee: overrides.listingFee,
          depositFee: overrides.depositFee,
          commissionPercentage: overrides.commissionPercentage,
          referralReward: overrides.referralReward,
          activeStatus: true,
          updatedBy,
          updatedAt: new Date(),
        },
        create: {
          id: 'current',
          listingFee: overrides.listingFee,
          depositFee: overrides.depositFee,
          commissionPercentage: overrides.commissionPercentage,
          referralReward: overrides.referralReward,
          activeStatus: true,
          updatedBy,
        },
      });

      this.logger.log(`Fee overrides updated by ${updatedBy}`);

      return {
        listingFee: updatedOverride.listingFee ?? undefined,
        depositFee: updatedOverride.depositFee ?? undefined,
        commissionPercentage: updatedOverride.commissionPercentage ?? undefined,
        escrowFee: undefined,
        referralReward: updatedOverride.referralReward ?? undefined,
      };
    } catch (error) {
      this.logger.error('Error updating fee overrides:', error);
      throw error;
    }
  }

  /**
   * Disable fee overrides
   */
  async disableFeeOverrides(disabledBy: string): Promise<void> {
    try {
      await this.prisma.feeOverride.updateMany({
        where: { activeStatus: true },
        data: {
          activeStatus: false,
          updatedBy: disabledBy,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Fee overrides disabled by ${disabledBy}`);
    } catch (error) {
      this.logger.error('Error disabling fee overrides:', error);
      throw error;
    }
  }

  /**
   * Get dynamic fee structure for user (with campaign overrides)
   */
  async getDynamicFeesForUser(userId: string, userRole: string): Promise<DynamicFeeStructure> {
    try {
      const isLaunchMode = await this.featureFlagService.isEnabled('launch_mode_active');
      const campaignEligibility = await this.launchCampaignService.getUserCampaignEligibility(userId, userRole);

      let appliedOverrides: string[] = [];
      let currentFees = { ...this.DEFAULT_FEES };

      // Apply global fee overrides if launch mode is active
      if (isLaunchMode) {
        const globalOverrides = await this.getCurrentFeeOverrides();
        if (globalOverrides) {
          appliedOverrides.push('global_launch_override');

          if (globalOverrides.listingFee !== undefined) {
            currentFees.listingFee = globalOverrides.listingFee;
            appliedOverrides.push('listing_fee_override');
          }

          if (globalOverrides.depositFee !== undefined) {
            currentFees.depositFee = globalOverrides.depositFee;
            appliedOverrides.push('deposit_fee_override');
          }

          if (globalOverrides.commissionPercentage !== undefined) {
            currentFees.commissionPercentage = globalOverrides.commissionPercentage;
            appliedOverrides.push('commission_override');
          }

          if (globalOverrides.referralReward !== undefined) {
            currentFees.referralReward = globalOverrides.referralReward;
            appliedOverrides.push('referral_reward_override');
          }
        }
      }

      // Apply campaign-specific overrides
      if (campaignEligibility.eligible && campaignEligibility.benefits) {
        appliedOverrides.push('campaign_override');

        if (campaignEligibility.benefits.commissionOverridePercentage !== undefined) {
          currentFees.commissionPercentage = campaignEligibility.benefits.commissionOverridePercentage;
          appliedOverrides.push('campaign_commission_override');
        }

        if (campaignEligibility.benefits.depositOverrideAmount !== undefined) {
          currentFees.depositFee = campaignEligibility.benefits.depositOverrideAmount;
          appliedOverrides.push('campaign_deposit_override');
        }
      }

      // Apply feature flag overrides
      const freeSellerWeek = await this.featureFlagService.isEnabled('free_seller_week');
      const freeBuyerWeek = await this.featureFlagService.isEnabled('free_buyer_week');
      const disableCommission = await this.featureFlagService.isEnabled('disable_commission');
      const disableListingFee = await this.featureFlagService.isEnabled('disable_listing_fee');
      const disableDepositFee = await this.featureFlagService.isEnabled('disable_deposit_fee');

      if (freeSellerWeek && userRole === 'SELLER') {
        currentFees.listingFee = 0;
        appliedOverrides.push('free_seller_week');
      }

      if (freeBuyerWeek && userRole === 'BUYER') {
        currentFees.depositFee = 0;
        appliedOverrides.push('free_buyer_week');
      }

      if (disableCommission) {
        currentFees.commissionPercentage = 0;
        appliedOverrides.push('commission_disabled');
      }

      if (disableListingFee) {
        currentFees.listingFee = 0;
        appliedOverrides.push('listing_fee_disabled');
      }

      if (disableDepositFee) {
        currentFees.depositFee = 0;
        appliedOverrides.push('deposit_fee_disabled');
      }

      return {
        ...currentFees,
        isLaunchMode,
        campaignActive: campaignEligibility.eligible,
        campaignName: campaignEligibility.activeCampaign?.name,
        originalFees: this.DEFAULT_FEES,
        appliedOverrides,
      };
    } catch (error) {
      this.logger.error(`Error getting dynamic fees for user ${userId}:`, error);
      // Return default fees on error
      return {
        ...this.DEFAULT_FEES,
        isLaunchMode: false,
        campaignActive: false,
        originalFees: this.DEFAULT_FEES,
        appliedOverrides: [],
      };
    }
  }

  /**
   * Calculate fees for a specific transaction
   */
  async calculateTransactionFees(
    transactionType: 'listing' | 'auction_win' | 'referral',
    baseAmount: number,
    userId: string,
    userRole: string,
  ): Promise<{
    fees: FeeStructure;
    totalAmount: number;
    breakdown: Array<{ type: string; amount: number; description: string }>;
  }> {
    try {
      const dynamicFees = await this.getDynamicFeesForUser(userId, userRole);

      const breakdown: Array<{ type: string; amount: number; description: string }> = [];
      let totalFees = 0;

      switch (transactionType) {
        case 'listing':
          if (dynamicFees.listingFee && dynamicFees.listingFee > 0) {
            breakdown.push({
              type: 'listing_fee',
              amount: dynamicFees.listingFee,
              description: 'Product listing fee',
            });
            totalFees += dynamicFees.listingFee;
          }
          break;

        case 'auction_win':
          // Commission on winning amount
          if (dynamicFees.commissionPercentage && dynamicFees.commissionPercentage > 0) {
            const commissionAmount = (baseAmount * dynamicFees.commissionPercentage) / 100;
            breakdown.push({
              type: 'commission',
              amount: commissionAmount,
              description: `${dynamicFees.commissionPercentage}% commission`,
            });
            totalFees += commissionAmount;
          }

          // Escrow fee (NEVER overridden)
          if (dynamicFees.escrowFee && dynamicFees.escrowFee > 0) {
            const escrowAmount = (baseAmount * dynamicFees.escrowFee) / 100;
            breakdown.push({
              type: 'escrow_fee',
              amount: escrowAmount,
              description: `${dynamicFees.escrowFee}% escrow protection fee`,
            });
            totalFees += escrowAmount;
          }

          // Deposit fee if applicable
          if (dynamicFees.depositFee && dynamicFees.depositFee > 0) {
            breakdown.push({
              type: 'deposit_fee',
              amount: dynamicFees.depositFee,
              description: 'Security deposit',
            });
            totalFees += dynamicFees.depositFee;
          }
          break;

        case 'referral':
          if (dynamicFees.referralReward && dynamicFees.referralReward > 0) {
            breakdown.push({
              type: 'referral_reward',
              amount: dynamicFees.referralReward,
              description: 'Referral reward bonus',
            });
            totalFees += dynamicFees.referralReward;
          }
          break;
      }

      return {
        fees: dynamicFees,
        totalAmount: baseAmount + totalFees,
        breakdown,
      };
    } catch (error) {
      this.logger.error(`Error calculating transaction fees for ${transactionType}:`, error);
      throw error;
    }
  }

  /**
   * Get fee statistics and savings during launch
   */
  async getFeeStatistics(days: number = 30): Promise<{
    totalFeesWaived: number;
    totalCommissionsReduced: number;
    topFeeOverrides: Array<{ override: string; savings: number }>;
    campaignFeeImpact: Array<{ campaignName: string; totalSavings: number }>;
  }> {
    try {
      // This would require tracking fee calculations in the database
      // For now, return mock statistics
      return {
        totalFeesWaived: 250000, // ₹2.5L in waived fees
        totalCommissionsReduced: 150000, // ₹1.5L in reduced commissions
        topFeeOverrides: [
          { override: 'commission_disabled', savings: 100000 },
          { override: 'free_listing_week', savings: 75000 },
          { override: 'deposit_fee_waived', savings: 75000 },
        ],
        campaignFeeImpact: [
          { campaignName: 'Launch Week 1', totalSavings: 150000 },
          { campaignName: 'Early Supporter Campaign', totalSavings: 100000 },
        ],
      };
    } catch (error) {
      this.logger.error('Error getting fee statistics:', error);
      throw error;
    }
  }

  /**
   * Validate fee override safety
   */
  validateFeeOverrideSafety(overrides: Partial<FeeStructure>): {
    isSafe: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];

    // Never allow escrow fee overrides
    if (overrides.escrowFee !== undefined) {
      warnings.push('CRITICAL: Escrow fee cannot be overridden for security reasons');
      return { isSafe: false, warnings };
    }

    // Warn about very low commission rates
    if (overrides.commissionPercentage !== undefined && overrides.commissionPercentage < 1) {
      warnings.push('WARNING: Commission rate below 1% may not be sustainable');
    }

    // Warn about zero fees
    if (overrides.listingFee === 0) {
      warnings.push('WARNING: Zero listing fee may attract low-quality listings');
    }

    if (overrides.depositFee === 0) {
      warnings.push('WARNING: Zero deposit fee removes financial accountability');
    }

    // High referral rewards
    if (overrides.referralReward && overrides.referralReward > 200) {
      warnings.push('WARNING: High referral rewards may encourage gaming');
    }

    return {
      isSafe: warnings.length === 0 || !warnings.some(w => w.includes('CRITICAL')),
      warnings,
    };
  }

  /**
   * Reset all fee overrides to defaults
   */
  async resetToDefaults(resetBy: string): Promise<void> {
    try {
      await this.disableFeeOverrides(resetBy);
      this.logger.log(`Fee overrides reset to defaults by ${resetBy}`);
    } catch (error) {
      this.logger.error('Error resetting fee overrides:', error);
      throw error;
    }
  }

  /**
   * Get fee override history
   */
  async getFeeOverrideHistory(limit: number = 10): Promise<Array<{
    overrides: FeeStructure;
    updatedBy: string;
    updatedAt: Date;
    appliedOverrides: string[];
  }>> {
    try {
      // In a real implementation, this would track fee override history
      // For now, return current state
      const currentOverrides = await this.getCurrentFeeOverrides();

      return [{
        overrides: currentOverrides || {},
        updatedBy: 'system',
        updatedAt: new Date(),
        appliedOverrides: [],
      }];
    } catch (error) {
      this.logger.error('Error getting fee override history:', error);
      throw error;
    }
  }
}
