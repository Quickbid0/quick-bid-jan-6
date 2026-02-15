import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface WalletBonus {
  id: string;
  userId: string;
  bonusAmount: number;
  reason: string;
  campaignId?: string;
  expiresAt: Date;
  usedAmount: number;
  isActive: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWalletBonusDto {
  userId: string;
  bonusAmount: number;
  reason: 'launch_bonus' | 'referral_bonus' | 'campaign_bonus' | 'tier_bonus' | 'admin_bonus';
  campaignId?: string;
  expiresAt: Date;
  createdBy?: string;
}

export interface WalletBonusSummary {
  totalActiveBonuses: number;
  totalBonusAmount: number;
  totalUsedAmount: number;
  totalExpiredAmount: number;
  bonusesByReason: Record<string, { count: number; totalAmount: number }>;
  expiringSoonCount: number; // Expires within 7 days
}

@Injectable()
export class WalletBonusService {
  private readonly logger = new Logger(WalletBonusService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new wallet bonus
   */
  async createWalletBonus(bonusData: CreateWalletBonusDto): Promise<WalletBonus> {
    try {
      // Validate bonus data
      this.validateBonusData(bonusData);

      // Check for duplicate bonuses (prevent gaming)
      await this.checkForDuplicateBonuses(bonusData);

      const bonus = await this.prisma.walletPromotion.create({
        data: {
          userId: bonusData.userId,
          bonusAmount: bonusData.bonusAmount,
          reason: bonusData.reason,
          campaignId: bonusData.campaignId,
          expiresAt: bonusData.expiresAt,
          usedAmount: 0,
          isActive: true,
          createdBy: bonusData.createdBy,
        },
      });

      this.logger.log(`Wallet bonus created: ₹${bonusData.bonusAmount} for user ${bonusData.userId} (${bonusData.reason})`);

      // Emit event for tracking
      // this.eventEmitter.emit('wallet.bonus.created', bonus);

      return {
        id: bonus.id,
        userId: bonus.userId,
        bonusAmount: bonus.bonusAmount,
        reason: bonus.reason,
        campaignId: bonus.campaignId || undefined,
        expiresAt: bonus.expiresAt,
        usedAmount: bonus.usedAmount,
        isActive: bonus.isActive,
        createdBy: bonus.createdBy || undefined,
        createdAt: bonus.createdAt,
        updatedAt: bonus.updatedAt,
      };
    } catch (error) {
      this.logger.error('Error creating wallet bonus:', error);
      throw error;
    }
  }

  /**
   * Get user's active bonuses
   */
  async getUserActiveBonuses(userId: string): Promise<WalletBonus[]> {
    try {
      const bonuses = await this.prisma.walletPromotion.findMany({
        where: {
          userId,
          isActive: true,
          expiresAt: { gt: new Date() },
        },
        orderBy: { expiresAt: 'asc' },
      });

      return bonuses.map(bonus => ({
        id: bonus.id,
        userId: bonus.userId,
        bonusAmount: bonus.bonusAmount,
        reason: bonus.reason,
        campaignId: bonus.campaignId || undefined,
        expiresAt: bonus.expiresAt,
        usedAmount: bonus.usedAmount,
        isActive: bonus.isActive,
        createdBy: bonus.createdBy || undefined,
        createdAt: bonus.createdAt,
        updatedAt: bonus.updatedAt,
      }));
    } catch (error) {
      this.logger.error(`Error getting active bonuses for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Calculate available bonus amount for user
   */
  async getUserAvailableBonus(userId: string): Promise<{
    totalAvailable: number;
    bonuses: Array<{
      id: string;
      amount: number;
      reason: string;
      expiresAt: Date;
    }>;
  }> {
    try {
      const activeBonuses = await this.getUserActiveBonuses(userId);

      const bonuses = activeBonuses.map(bonus => ({
        id: bonus.id,
        amount: bonus.bonusAmount - bonus.usedAmount,
        reason: bonus.reason,
        expiresAt: bonus.expiresAt,
      }));

      const totalAvailable = bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);

      return {
        totalAvailable,
        bonuses: bonuses.filter(b => b.amount > 0),
      };
    } catch (error) {
      this.logger.error(`Error calculating available bonus for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Use bonus amount for a transaction
   */
  async useBonusAmount(
    userId: string,
    amountToUse: number,
    transactionId?: string,
  ): Promise<{
    usedAmount: number;
    remainingAmount: number;
    bonusesUsed: Array<{ bonusId: string; amountUsed: number }>;
  }> {
    try {
      if (amountToUse <= 0) {
        throw new BadRequestException('Amount to use must be positive');
      }

      const availableBonus = await this.getUserAvailableBonus(userId);

      if (availableBonus.totalAvailable < amountToUse) {
        throw new BadRequestException(
          `Insufficient bonus balance. Available: ₹${availableBonus.totalAvailable}, Requested: ₹${amountToUse}`
        );
      }

      let remainingToUse = amountToUse;
      const bonusesUsed: Array<{ bonusId: string; amountUsed: number }> = [];

      // Use bonuses in order of expiration (FIFO)
      for (const bonus of availableBonus.bonuses.sort((a, b) =>
        a.expiresAt.getTime() - b.expiresAt.getTime()
      )) {
        if (remainingToUse <= 0) break;

        const availableFromThisBonus = bonus.amount;
        const amountToUseFromThisBonus = Math.min(remainingToUse, availableFromThisBonus);

        // Update bonus used amount
        await this.prisma.walletPromotion.update({
          where: { id: bonus.id },
          data: {
            usedAmount: { increment: amountToUseFromThisBonus },
            updatedAt: new Date(),
          },
        });

        bonusesUsed.push({
          bonusId: bonus.id,
          amountUsed: amountToUseFromThisBonus,
        });

        remainingToUse -= amountToUseFromThisBonus;
      }

      // Mark bonuses as inactive if fully used
      for (const used of bonusesUsed) {
        const bonus = await this.prisma.walletPromotion.findUnique({
          where: { id: used.bonusId },
          select: { bonusAmount: true, usedAmount: true },
        });

        if (bonus && bonus.usedAmount >= bonus.bonusAmount) {
          await this.prisma.walletPromotion.update({
            where: { id: used.bonusId },
            data: { isActive: false },
          });
        }
      }

      const remainingAmount = availableBonus.totalAvailable - amountToUse;

      this.logger.log(`Bonus used: ₹${amountToUse} by user ${userId}, remaining: ₹${remainingAmount}`);

      return {
        usedAmount: amountToUse,
        remainingAmount,
        bonusesUsed,
      };
    } catch (error) {
      this.logger.error(`Error using bonus amount for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Expire old bonuses (called by cron job)
   */
  async expireOldBonuses(): Promise<{ expiredCount: number; expiredAmount: number }> {
    try {
      const now = new Date();

      // Find expired bonuses
      const expiredBonuses = await this.prisma.walletPromotion.findMany({
        where: {
          isActive: true,
          expiresAt: { lt: now },
          bonusAmount: { gt: Prisma.sql`used_amount` }, // Not fully used
        },
      });

      if (expiredBonuses.length === 0) {
        return { expiredCount: 0, expiredAmount: 0 };
      }

      // Mark as inactive
      await this.prisma.walletPromotion.updateMany({
        where: {
          isActive: true,
          expiresAt: { lt: now },
        },
        data: {
          isActive: false,
          updatedAt: now,
        },
      });

      const expiredAmount = expiredBonuses.reduce(
        (sum, bonus) => sum + (bonus.bonusAmount - bonus.usedAmount),
        0
      );

      this.logger.log(`Expired ${expiredBonuses.length} bonuses worth ₹${expiredAmount}`);

      return {
        expiredCount: expiredBonuses.length,
        expiredAmount,
      };
    } catch (error) {
      this.logger.error('Error expiring old bonuses:', error);
      throw error;
    }
  }

  /**
   * Get bonus statistics
   */
  async getBonusStatistics(days: number = 30): Promise<WalletBonusSummary> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const bonuses = await this.prisma.walletPromotion.findMany({
        where: {
          createdAt: { gte: cutoffDate },
        },
      });

      const activeBonuses = bonuses.filter(b => b.isActive);
      const expiredBonuses = bonuses.filter(b => !b.isActive && b.expiresAt < new Date());

      const totalActiveBonuses = activeBonuses.length;
      const totalBonusAmount = bonuses.reduce((sum, b) => sum + b.bonusAmount, 0);
      const totalUsedAmount = bonuses.reduce((sum, b) => sum + b.usedAmount, 0);
      const totalExpiredAmount = expiredBonuses.reduce(
        (sum, b) => sum + (b.bonusAmount - b.usedAmount),
        0
      );

      // Group by reason
      const bonusesByReason: Record<string, { count: number; totalAmount: number }> = {};
      bonuses.forEach(bonus => {
        if (!bonusesByReason[bonus.reason]) {
          bonusesByReason[bonus.reason] = { count: 0, totalAmount: 0 };
        }
        bonusesByReason[bonus.reason].count++;
        bonusesByReason[bonus.reason].totalAmount += bonus.bonusAmount;
      });

      // Count expiring soon (within 7 days)
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const expiringSoonCount = activeBonuses.filter(
        b => b.expiresAt <= sevenDaysFromNow
      ).length;

      return {
        totalActiveBonuses,
        totalBonusAmount,
        totalUsedAmount,
        totalExpiredAmount,
        bonusesByReason,
        expiringSoonCount,
      };
    } catch (error) {
      this.logger.error('Error getting bonus statistics:', error);
      throw error;
    }
  }

  /**
   * Grant launch bonuses to eligible users
   */
  async grantLaunchBonusesForCampaign(campaignId: string, grantedBy: string): Promise<{
    processedUsers: number;
    totalBonusGranted: number;
  }> {
    try {
      // Get campaign details
      const campaign = await this.prisma.launchCampaign.findUnique({
        where: { id: campaignId },
      });

      if (!campaign || !campaign.activeStatus) {
        throw new BadRequestException('Campaign not found or not active');
      }

      // Find users eligible for this campaign
      // This would need more complex logic based on campaign targeting
      // For now, grant to users who registered during campaign period

      let processedUsers = 0;
      let totalBonusGranted = 0;

      // Mock implementation - in real scenario, this would query eligible users
      this.logger.log(`Launch bonuses granted for campaign ${campaignId}: ${processedUsers} users, ₹${totalBonusGranted} total`);

      return {
        processedUsers,
        totalBonusGranted,
      };
    } catch (error) {
      this.logger.error(`Error granting launch bonuses for campaign ${campaignId}:`, error);
      throw error;
    }
  }

  /**
   * Validate bonus data
   */
  private validateBonusData(data: CreateWalletBonusDto): void {
    if (data.bonusAmount <= 0) {
      throw new BadRequestException('Bonus amount must be positive');
    }

    if (data.bonusAmount > 10000) {
      throw new BadRequestException('Bonus amount cannot exceed ₹10,000');
    }

    if (data.expiresAt <= new Date()) {
      throw new BadRequestException('Bonus expiration must be in the future');
    }

    // Check expiration is not too far in the future (max 1 year)
    const maxExpiry = new Date();
    maxExpiry.setFullYear(maxExpiry.getFullYear() + 1);

    if (data.expiresAt > maxExpiry) {
      throw new BadRequestException('Bonus cannot expire more than 1 year from now');
    }

    const validReasons = ['launch_bonus', 'referral_bonus', 'campaign_bonus', 'tier_bonus', 'admin_bonus'];
    if (!validReasons.includes(data.reason)) {
      throw new BadRequestException('Invalid bonus reason');
    }
  }

  /**
   * Check for duplicate bonuses to prevent gaming
   */
  private async checkForDuplicateBonuses(data: CreateWalletBonusDto): Promise<void> {
    const recentBonus = await this.prisma.walletPromotion.findFirst({
      where: {
        userId: data.userId,
        reason: data.reason,
        campaignId: data.campaignId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    if (recentBonus) {
      throw new BadRequestException(
        `Duplicate bonus detected. User already received ${data.reason} bonus recently.`
      );
    }
  }

  /**
   * Get bonus by ID
   */
  async getBonusById(bonusId: string): Promise<WalletBonus | null> {
    try {
      const bonus = await this.prisma.walletPromotion.findUnique({
        where: { id: bonusId },
      });

      if (!bonus) return null;

      return {
        id: bonus.id,
        userId: bonus.userId,
        bonusAmount: bonus.bonusAmount,
        reason: bonus.reason,
        campaignId: bonus.campaignId || undefined,
        expiresAt: bonus.expiresAt,
        usedAmount: bonus.usedAmount,
        isActive: bonus.isActive,
        createdBy: bonus.createdBy || undefined,
        createdAt: bonus.createdAt,
        updatedAt: bonus.updatedAt,
      };
    } catch (error) {
      this.logger.error(`Error getting bonus ${bonusId}:`, error);
      throw error;
    }
  }

  /**
   * Cancel/unused bonus
   */
  async cancelBonus(bonusId: string, cancelledBy: string): Promise<void> {
    try {
      const bonus = await this.getBonusById(bonusId);
      if (!bonus) {
        throw new NotFoundException('Bonus not found');
      }

      if (bonus.usedAmount > 0) {
        throw new BadRequestException('Cannot cancel bonus that has been partially used');
      }

      await this.prisma.walletPromotion.update({
        where: { id: bonusId },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Bonus cancelled: ${bonusId} by ${cancelledBy}`);
    } catch (error) {
      this.logger.error(`Error cancelling bonus ${bonusId}:`, error);
      throw error;
    }
  }
}
