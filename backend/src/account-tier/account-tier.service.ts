import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AccountTier {
  id: string;
  name: string;
  walletBonus: number;
  badge: string;
  bidPriority: number;
  supportLevel: string;
  description?: string;
}

export interface UserTierInfo {
  tier: AccountTier;
  assignedAt: Date;
  reason: string; // 'registration', 'campaign', 'upgrade', 'manual'
  expiresAt?: Date;
}

@Injectable()
export class AccountTierService {
  private readonly logger = new Logger(AccountTierService.name);

  // Pre-defined launch tiers
  private readonly LAUNCH_TIERS = [
    {
      name: 'Founding Buyer',
      walletBonus: 500,
      badge: '🏆',
      bidPriority: 10,
      supportLevel: 'vip',
      description: 'First 1000 buyers during launch week',
    },
    {
      name: 'Founding Seller',
      walletBonus: 1000,
      badge: '💎',
      bidPriority: 8,
      supportLevel: 'priority',
      description: 'First 500 sellers during launch week',
    },
    {
      name: 'Early Supporter',
      walletBonus: 200,
      badge: '⭐',
      bidPriority: 5,
      supportLevel: 'priority',
      description: 'Next 2000 users during launch month',
    },
    {
      name: 'Dealer Elite',
      walletBonus: 0,
      badge: '🚛',
      bidPriority: 3,
      supportLevel: 'standard',
      description: 'Verified dealers and sellers',
    },
    {
      name: 'Enterprise',
      walletBonus: 0,
      badge: '🏢',
      bidPriority: 7,
      supportLevel: 'vip',
      description: 'Enterprise and bulk users',
    },
  ];

  constructor(private prisma: PrismaService) {}

  /**
   * Initialize default account tiers
   */
  async initializeDefaultTiers(): Promise<void> {
    try {
      for (const tierData of this.LAUNCH_TIERS) {
        const existingTier = await this.prisma.accountTier.findUnique({
          where: { name: tierData.name },
        });

        if (!existingTier) {
          await this.prisma.accountTier.create({
            data: tierData,
          });
          this.logger.log(`Created default account tier: ${tierData.name}`);
        }
      }
    } catch (error) {
      this.logger.error('Error initializing default account tiers:', error);
    }
  }

  /**
   * Get all account tiers
   */
  async getAllTiers(): Promise<AccountTier[]> {
    try {
      const tiers = await this.prisma.accountTier.findMany({
        orderBy: { bidPriority: 'desc' },
      });

      return tiers.map(tier => ({
        id: tier.id,
        name: tier.name,
        walletBonus: tier.walletBonus,
        badge: tier.badge,
        bidPriority: tier.bidPriority,
        supportLevel: tier.supportLevel,
        description: tier.description || undefined,
      }));
    } catch (error) {
      this.logger.error('Error getting all account tiers:', error);
      throw error;
    }
  }

  /**
   * Get account tier by ID
   */
  async getTierById(tierId: string): Promise<AccountTier> {
    try {
      const tier = await this.prisma.accountTier.findUnique({
        where: { id: tierId },
      });

      if (!tier) {
        throw new Error('Account tier not found');
      }

      return {
        id: tier.id,
        name: tier.name,
        walletBonus: tier.walletBonus,
        badge: tier.badge,
        bidPriority: tier.bidPriority,
        supportLevel: tier.supportLevel,
        description: tier.description || undefined,
      };
    } catch (error) {
      this.logger.error(`Error getting account tier ${tierId}:`, error);
      throw error;
    }
  }

  /**
   * Create or update account tier
   */
  async createOrUpdateTier(tierData: {
    name: string;
    walletBonus: number;
    badge: string;
    bidPriority: number;
    supportLevel: string;
    description?: string;
    tierId?: string;
  }): Promise<AccountTier> {
    try {
      const tier = tierData.tierId
        ? await this.prisma.accountTier.update({
            where: { id: tierData.tierId },
            data: {
              name: tierData.name,
              walletBonus: tierData.walletBonus,
              badge: tierData.badge,
              bidPriority: tierData.bidPriority,
              supportLevel: tierData.supportLevel,
              description: tierData.description,
              updatedAt: new Date(),
            },
          })
        : await this.prisma.accountTier.create({
            data: {
              name: tierData.name,
              walletBonus: tierData.walletBonus,
              badge: tierData.badge,
              bidPriority: tierData.bidPriority,
              supportLevel: tierData.supportLevel,
              description: tierData.description,
            },
          });

      this.logger.log(`Account tier ${tierData.tierId ? 'updated' : 'created'}: ${tier.name}`);

      return {
        id: tier.id,
        name: tier.name,
        walletBonus: tier.walletBonus,
        badge: tier.badge,
        bidPriority: tier.bidPriority,
        supportLevel: tier.supportLevel,
        description: tier.description || undefined,
      };
    } catch (error) {
      this.logger.error('Error creating/updating account tier:', error);
      throw error;
    }
  }

  /**
   * Auto-assign launch tier to user during registration
   */
  async autoAssignLaunchTier(userId: string, userRole: string): Promise<UserTierInfo | null> {
    try {
      // Check if user already has a tier assigned
      const existingTier = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { accountTierId: true },
      });

      if (existingTier?.accountTierId) {
        return null; // User already has a tier
      }

      // Determine which tier to assign based on registration order and role
      const tierToAssign = await this.determineLaunchTier(userId, userRole);

      if (!tierToAssign) {
        return null; // No tier available for assignment
      }

      // Assign tier to user
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          accountTierId: tierToAssign.id,
        },
      });

      // Grant wallet bonus if applicable
      if (tierToAssign.walletBonus > 0) {
        await this.grantTierWalletBonus(userId, tierToAssign);
      }

      const tierInfo: UserTierInfo = {
        tier: tierToAssign,
        assignedAt: new Date(),
        reason: 'registration',
      };

      this.logger.log(`Auto-assigned tier ${tierToAssign.name} to user ${userId}`);

      return tierInfo;
    } catch (error) {
      this.logger.error(`Error auto-assigning launch tier to user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Manually assign tier to user
   */
  async assignTierToUser(
    userId: string,
    tierId: string,
    assignedBy: string,
    reason: string = 'manual',
  ): Promise<UserTierInfo> {
    try {
      const tier = await this.getTierById(tierId);

      // Update user's tier
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          accountTierId: tierId,
        },
      });

      // Grant wallet bonus if applicable
      if (tier.walletBonus > 0) {
        await this.grantTierWalletBonus(userId, tier);
      }

      const tierInfo: UserTierInfo = {
        tier,
        assignedAt: new Date(),
        reason,
      };

      this.logger.log(`Manually assigned tier ${tier.name} to user ${userId} by ${assignedBy}`);

      return tierInfo;
    } catch (error) {
      this.logger.error(`Error assigning tier ${tierId} to user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get user's current tier information
   */
  async getUserTierInfo(userId: string): Promise<UserTierInfo | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          accountTier: true,
        },
      });

      if (!user?.accountTier) {
        return null;
      }

      const tier: AccountTier = {
        id: user.accountTier.id,
        name: user.accountTier.name,
        walletBonus: user.accountTier.walletBonus,
        badge: user.accountTier.badge,
        bidPriority: user.accountTier.bidPriority,
        supportLevel: user.accountTier.supportLevel,
        description: user.accountTier.description || undefined,
      };

      return {
        tier,
        assignedAt: user.createdAt, // Approximate assignment time
        reason: 'registration', // Default assumption
      };
    } catch (error) {
      this.logger.error(`Error getting user tier info for ${userId}:`, error);
      return null;
    }
  }

  /**
   * Get tier statistics
   */
  async getTierStatistics(): Promise<{
    totalUsersByTier: Array<{ tierName: string; userCount: number; percentage: number }>;
    tierBenefits: Array<{ tierName: string; totalWalletBonusGranted: number }>;
  }> {
    try {
      // Get user count by tier
      const tierStats = await this.prisma.accountTier.findMany({
        select: {
          name: true,
          _count: {
            select: { users: true },
          },
        },
      });

      const totalUsers = tierStats.reduce((sum, tier) => sum + tier._count.users, 0);

      const totalUsersByTier = tierStats.map(tier => ({
        tierName: tier.name,
        userCount: tier._count.users,
        percentage: totalUsers > 0 ? (tier._count.users / totalUsers) * 100 : 0,
      }));

      // Get wallet bonuses granted by tier
      const tierBenefits = await this.prisma.accountTier.findMany({
        select: {
          name: true,
          walletBonus: true,
        },
      });

      // Calculate total bonuses (this is approximate - would need better tracking)
      const tierBenefitsWithTotals = tierBenefits.map(tier => ({
        tierName: tier.name,
        totalWalletBonusGranted: tier.walletBonus, // Placeholder - would need aggregation
      }));

      return {
        totalUsersByTier,
        tierBenefits: tierBenefitsWithTotals,
      };
    } catch (error) {
      this.logger.error('Error getting tier statistics:', error);
      throw error;
    }
  }

  /**
   * Determine which launch tier to assign based on registration order
   */
  private async determineLaunchTier(userId: string, userRole: string): Promise<AccountTier | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true },
      });

      if (!user) return null;

      // Check registration order for launch tiers
      if (userRole === 'BUYER') {
        // Count buyers registered before this user
        const buyersBefore = await this.prisma.user.count({
          where: {
            role: 'BUYER',
            createdAt: { lt: user.createdAt },
          },
        });

        if (buyersBefore < 1000) {
          return await this.prisma.accountTier.findUnique({
            where: { name: 'Founding Buyer' },
          }).then(tier => tier ? {
            id: tier.id,
            name: tier.name,
            walletBonus: tier.walletBonus,
            badge: tier.badge,
            bidPriority: tier.bidPriority,
            supportLevel: tier.supportLevel,
            description: tier.description || undefined,
          } : null);
        } else if (buyersBefore < 3000) {
          return await this.prisma.accountTier.findUnique({
            where: { name: 'Early Supporter' },
          }).then(tier => tier ? {
            id: tier.id,
            name: tier.name,
            walletBonus: tier.walletBonus,
            badge: tier.badge,
            bidPriority: tier.bidPriority,
            supportLevel: tier.supportLevel,
            description: tier.description || undefined,
          } : null);
        }
      } else if (userRole === 'SELLER') {
        // Count sellers registered before this user
        const sellersBefore = await this.prisma.user.count({
          where: {
            role: 'SELLER',
            createdAt: { lt: user.createdAt },
          },
        });

        if (sellersBefore < 500) {
          return await this.prisma.accountTier.findUnique({
            where: { name: 'Founding Seller' },
          }).then(tier => tier ? {
            id: tier.id,
            name: tier.name,
            walletBonus: tier.walletBonus,
            badge: tier.badge,
            bidPriority: tier.bidPriority,
            supportLevel: tier.supportLevel,
            description: tier.description || undefined,
          } : null);
        }
      }

      return null; // No special tier
    } catch (error) {
      this.logger.error('Error determining launch tier:', error);
      return null;
    }
  }

  /**
   * Grant wallet bonus for tier assignment
   */
  private async grantTierWalletBonus(userId: string, tier: AccountTier): Promise<void> {
    try {
      // Add wallet promotion for the bonus
      await this.prisma.walletPromotion.create({
        data: {
          userId,
          bonusAmount: tier.walletBonus,
          reason: 'tier_bonus',
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          createdBy: 'system',
        },
      });

      // Update wallet balance (this would normally be handled by wallet service)
      // For now, just log the bonus grant
      this.logger.log(`Granted wallet bonus of ₹${tier.walletBonus} to user ${userId} for tier ${tier.name}`);
    } catch (error) {
      this.logger.error(`Error granting wallet bonus to user ${userId}:`, error);
    }
  }

  /**
   * Update user tier (for upgrades/downgrades)
   */
  async updateUserTier(userId: string, newTierId: string, updatedBy: string): Promise<void> {
    try {
      const newTier = await this.getTierById(newTierId);

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          accountTierId: newTierId,
        },
      });

      this.logger.log(`Updated user ${userId} tier to ${newTier.name} by ${updatedBy}`);
    } catch (error) {
      this.logger.error(`Error updating user ${userId} tier to ${newTierId}:`, error);
      throw error;
    }
  }

  /**
   * Remove user from tier
   */
  async removeUserTier(userId: string, removedBy: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          accountTierId: null,
        },
      });

      this.logger.log(`Removed tier from user ${userId} by ${removedBy}`);
    } catch (error) {
      this.logger.error(`Error removing tier from user ${userId}:`, error);
      throw error;
    }
  }
}
