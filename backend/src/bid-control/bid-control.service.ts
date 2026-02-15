import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FeatureFlagService } from '../feature-flag/feature-flag.service';

export interface BidControlSettings {
  minWalletBalance: number;
  maxBidsPerDay: number;
  autoBidEnabled: boolean;
  antiSnipingExtensionSeconds: number;
  emergencyPauseFlag: boolean;
}

export interface BidValidationResult {
  allowed: boolean;
  reason?: string;
  limits?: {
    walletBalance: number;
    bidsToday: number;
    maxBidsPerDay: number;
  };
}

@Injectable()
export class BidControlService {
  private readonly logger = new Logger(BidControlService.name);
  private controlCache: BidControlSettings | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_TTL = 30 * 1000; // 30 seconds

  constructor(
    private prisma: PrismaService,
    private featureFlagService: FeatureFlagService,
  ) {}

  /**
   * Get current bid control settings
   */
  async getBidControlSettings(): Promise<BidControlSettings> {
    // Check cache first
    if (this.controlCache && Date.now() < this.cacheExpiry) {
      return this.controlCache;
    }

    try {
      const control = await this.prisma.bidControl.findFirst({
        orderBy: { updatedAt: 'desc' },
      });

      if (!control) {
        // Return default settings
        const defaultSettings: BidControlSettings = {
          minWalletBalance: 0,
          maxBidsPerDay: 100,
          autoBidEnabled: true,
          antiSnipingExtensionSeconds: 30,
          emergencyPauseFlag: false,
        };

        // Create default record
        await this.prisma.bidControl.create({
          data: defaultSettings,
        });

        this.controlCache = defaultSettings;
        this.cacheExpiry = Date.now() + this.CACHE_TTL;

        return defaultSettings;
      }

      const settings: BidControlSettings = {
        minWalletBalance: control.minWalletBalance,
        maxBidsPerDay: control.maxBidsPerDay,
        autoBidEnabled: control.autoBidEnabled,
        antiSnipingExtensionSeconds: control.antiSnipingExtensionSeconds,
        emergencyPauseFlag: control.emergencyPauseFlag,
      };

      // Cache the settings
      this.controlCache = settings;
      this.cacheExpiry = Date.now() + this.CACHE_TTL;

      return settings;
    } catch (error) {
      this.logger.error('Error getting bid control settings:', error);
      throw error;
    }
  }

  /**
   * Update bid control settings
   */
  async updateBidControlSettings(
    settings: Partial<BidControlSettings>,
    updatedBy: string,
  ): Promise<BidControlSettings> {
    try {
      // Validate settings
      if (settings.minWalletBalance !== undefined && settings.minWalletBalance < 0) {
        throw new BadRequestException('Minimum wallet balance cannot be negative');
      }

      if (settings.maxBidsPerDay !== undefined && settings.maxBidsPerDay <= 0) {
        throw new BadRequestException('Maximum bids per day must be positive');
      }

      if (settings.antiSnipingExtensionSeconds !== undefined && settings.antiSnipingExtensionSeconds < 0) {
        throw new BadRequestException('Anti-sniping extension cannot be negative');
      }

      const updatedControl = await this.prisma.bidControl.upsert({
        where: { id: 'default' }, // Using a fixed ID for single record
        update: {
          ...settings,
          updatedBy,
          updatedAt: new Date(),
        },
        create: {
          id: 'default',
          minWalletBalance: settings.minWalletBalance ?? 0,
          maxBidsPerDay: settings.maxBidsPerDay ?? 100,
          autoBidEnabled: settings.autoBidEnabled ?? true,
          antiSnipingExtensionSeconds: settings.antiSnipingExtensionSeconds ?? 30,
          emergencyPauseFlag: settings.emergencyPauseFlag ?? false,
          updatedBy,
        },
      });

      const updatedSettings: BidControlSettings = {
        minWalletBalance: updatedControl.minWalletBalance,
        maxBidsPerDay: updatedControl.maxBidsPerDay,
        autoBidEnabled: updatedControl.autoBidEnabled,
        antiSnipingExtensionSeconds: updatedControl.antiSnipingExtensionSeconds,
        emergencyPauseFlag: updatedControl.emergencyPauseFlag,
      };

      // Clear cache
      this.controlCache = null;
      this.cacheExpiry = 0;

      this.logger.log(`Bid control settings updated by ${updatedBy}`);

      return updatedSettings;
    } catch (error) {
      this.logger.error('Error updating bid control settings:', error);
      throw error;
    }
  }

  /**
   * Validate if a user can place a bid
   */
  async validateBidPlacement(
    userId: string,
    auctionId: string,
    bidAmount: number,
  ): Promise<BidValidationResult> {
    try {
      // Check emergency pause first
      const isEmergencyPaused = await this.featureFlagService.isEnabled('system_emergency_pause');
      if (isEmergencyPaused) {
        return {
          allowed: false,
          reason: 'System is currently under emergency maintenance. Bidding is temporarily disabled.',
        };
      }

      const controlSettings = await this.getBidControlSettings();

      // Check wallet balance
      const userWallet = await this.prisma.wallet.findUnique({
        where: { userId },
        select: { balance: true },
      });

      if (!userWallet) {
        return {
          allowed: false,
          reason: 'Wallet not found. Please contact support.',
        };
      }

      if (userWallet.balance < controlSettings.minWalletBalance) {
        return {
          allowed: false,
          reason: `Insufficient wallet balance. Minimum required: ₹${controlSettings.minWalletBalance}`,
          limits: {
            walletBalance: userWallet.balance,
            bidsToday: 0,
            maxBidsPerDay: controlSettings.maxBidsPerDay,
          },
        };
      }

      // Check daily bid limit
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todaysBids = await this.prisma.bid.count({
        where: {
          userId,
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      });

      if (todaysBids >= controlSettings.maxBidsPerDay) {
        return {
          allowed: false,
          reason: `Daily bid limit exceeded. Maximum ${controlSettings.maxBidsPerDay} bids per day.`,
          limits: {
            walletBalance: userWallet.balance,
            bidsToday: todaysBids,
            maxBidsPerDay: controlSettings.maxBidsPerDay,
          },
        };
      }

      // Check subscription limits
      // This would integrate with the subscription service
      // For now, assume basic validation passes

      return {
        allowed: true,
        limits: {
          walletBalance: userWallet.balance,
          bidsToday: todaysBids,
          maxBidsPerDay: controlSettings.maxBidsPerDay,
        },
      };
    } catch (error) {
      this.logger.error(`Error validating bid placement for user ${userId}:`, error);
      return {
        allowed: false,
        reason: 'Bid validation failed. Please try again.',
      };
    }
  }

  /**
   * Check if anti-sniping extension should be applied
   */
  async shouldApplyAntiSnipingExtension(auctionId: string, timeLeftSeconds: number): Promise<boolean> {
    try {
      const controlSettings = await this.getBidControlSettings();

      // Apply anti-sniping if enabled and time is running low
      if (!controlSettings.autoBidEnabled) {
        return false;
      }

      // If time left is less than the extension threshold, apply extension
      return timeLeftSeconds <= controlSettings.antiSnipingExtensionSeconds;
    } catch (error) {
      this.logger.error('Error checking anti-sniping extension:', error);
      return false;
    }
  }

  /**
   * Get anti-sniping extension duration
   */
  async getAntiSnipingExtensionDuration(): Promise<number> {
    try {
      const controlSettings = await this.getBidControlSettings();
      return controlSettings.antiSnipingExtensionSeconds;
    } catch (error) {
      this.logger.error('Error getting anti-sniping extension duration:', error);
      return 30; // Default 30 seconds
    }
  }

  /**
   * Check if auto-bid is enabled
   */
  async isAutoBidEnabled(): Promise<boolean> {
    try {
      const controlSettings = await this.getBidControlSettings();
      return controlSettings.autoBidEnabled;
    } catch (error) {
      this.logger.error('Error checking auto-bid status:', error);
      return true; // Default enabled
    }
  }

  /**
   * Get user's bid statistics for today
   */
  async getUserBidStats(userId: string): Promise<{
    bidsToday: number;
    maxBidsPerDay: number;
    remainingBids: number;
    walletBalance: number;
    minWalletBalance: number;
  }> {
    try {
      const controlSettings = await this.getBidControlSettings();

      // Get today's bids
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todaysBids = await this.prisma.bid.count({
        where: {
          userId,
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      });

      // Get wallet balance
      const userWallet = await this.prisma.wallet.findUnique({
        where: { userId },
        select: { balance: true },
      });

      const walletBalance = userWallet?.balance ?? 0;
      const remainingBids = Math.max(0, controlSettings.maxBidsPerDay - todaysBids);

      return {
        bidsToday: todaysBids,
        maxBidsPerDay: controlSettings.maxBidsPerDay,
        remainingBids,
        walletBalance,
        minWalletBalance: controlSettings.minWalletBalance,
      };
    } catch (error) {
      this.logger.error(`Error getting bid stats for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Emergency pause all bidding
   */
  async emergencyPauseBidding(pausedBy: string): Promise<void> {
    try {
      await this.updateBidControlSettings(
        { emergencyPauseFlag: true },
        pausedBy,
      );

      // Also set the feature flag
      await this.featureFlagService.setFlag('system_emergency_pause', true, pausedBy);

      this.logger.warn(`EMERGENCY: Bidding paused by ${pausedBy}`);
    } catch (error) {
      this.logger.error('Error activating emergency pause:', error);
      throw error;
    }
  }

  /**
   * Resume bidding after emergency pause
   */
  async resumeBidding(resumedBy: string): Promise<void> {
    try {
      await this.updateBidControlSettings(
        { emergencyPauseFlag: false },
        resumedBy,
      );

      // Also clear the feature flag
      await this.featureFlagService.setFlag('system_emergency_pause', false, resumedBy);

      this.logger.warn(`EMERGENCY PAUSE LIFTED: Bidding resumed by ${resumedBy}`);
    } catch (error) {
      this.logger.error('Error resuming bidding:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive bid control status
   */
  async getBidControlStatus(): Promise<{
    settings: BidControlSettings;
    emergencyPaused: boolean;
    activeRestrictions: string[];
  }> {
    try {
      const settings = await this.getBidControlSettings();
      const emergencyPaused = await this.featureFlagService.isEnabled('system_emergency_pause');

      const activeRestrictions: string[] = [];

      if (emergencyPaused) {
        activeRestrictions.push('Emergency pause active');
      }

      if (!settings.autoBidEnabled) {
        activeRestrictions.push('Auto-bid disabled');
      }

      if (settings.minWalletBalance > 0) {
        activeRestrictions.push(`Minimum wallet balance: ₹${settings.minWalletBalance}`);
      }

      return {
        settings,
        emergencyPaused,
        activeRestrictions,
      };
    } catch (error) {
      this.logger.error('Error getting bid control status:', error);
      throw error;
    }
  }

  /**
   * Clear control cache (for testing/admin purposes)
   */
  clearCache(): void {
    this.controlCache = null;
    this.cacheExpiry = 0;
    this.logger.log('Bid control cache cleared');
  }
}
