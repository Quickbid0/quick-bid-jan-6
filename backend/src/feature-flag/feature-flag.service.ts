import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface FeatureFlagConfig {
  key: string;
  defaultValue: boolean;
  description?: string;
  category?: string;
}

@Injectable()
export class FeatureFlagService {
  private readonly logger = new Logger(FeatureFlagService.name);
  private featureCache: Map<string, boolean> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Pre-defined launch mode feature flags
  private readonly DEFAULT_FLAGS: FeatureFlagConfig[] = [
    {
      key: 'launch_mode_active',
      defaultValue: false,
      description: 'Master switch for launch mode - overrides all fees and limits',
      category: 'launch'
    },
    {
      key: 'free_buyer_week',
      defaultValue: false,
      description: 'Free bidding for all buyers during launch week',
      category: 'launch'
    },
    {
      key: 'free_seller_week',
      defaultValue: false,
      description: 'Free listings for all sellers during launch week',
      category: 'launch'
    },
    {
      key: 'disable_commission',
      defaultValue: false,
      description: 'Disable commission fees for sellers',
      category: 'fees'
    },
    {
      key: 'disable_listing_fee',
      defaultValue: false,
      description: 'Disable listing fees for sellers',
      category: 'fees'
    },
    {
      key: 'disable_deposit_fee',
      defaultValue: false,
      description: 'Disable deposit fees for buyers',
      category: 'fees'
    },
    {
      key: 'bonus_referral_multiplier',
      defaultValue: false,
      description: 'Double referral rewards during launch',
      category: 'wallet'
    },
    {
      key: 'bonus_wallet_credit_enabled',
      defaultValue: false,
      description: 'Enable bonus wallet credits for new users',
      category: 'wallet'
    },
    {
      key: 'priority_listing_boost',
      defaultValue: false,
      description: 'Boost priority listings during launch',
      category: 'ui'
    },
    {
      key: 'bid_limit_override',
      defaultValue: false,
      description: 'Override bid limits during launch',
      category: 'bids'
    },
    {
      key: 'system_emergency_pause',
      defaultValue: false,
      description: 'EMERGENCY: Pause all marketplace activity',
      category: 'safety'
    }
  ];

  constructor(private prisma: PrismaService) {
    this.initializeDefaultFlags();
  }

  /**
   * Initialize default feature flags in database
   */
  private async initializeDefaultFlags(): Promise<void> {
    try {
      for (const flagConfig of this.DEFAULT_FLAGS) {
        const existingFlag = await this.prisma.featureFlag.findUnique({
          where: { key: flagConfig.key }
        });

        if (!existingFlag) {
          await this.prisma.featureFlag.create({
            data: {
              key: flagConfig.key,
              value: flagConfig.defaultValue,
              description: flagConfig.description,
              category: flagConfig.category,
            }
          });
          this.logger.log(`Created default feature flag: ${flagConfig.key}`);
        }
      }
    } catch (error) {
      this.logger.error('Error initializing default feature flags:', error);
    }
  }

  /**
   * Check if a feature flag is enabled
   */
  async isEnabled(flagKey: string, defaultValue: boolean = false): Promise<boolean> {
    try {
      // Check cache first
      const cachedValue = this.getCachedValue(flagKey);
      if (cachedValue !== null) {
        return cachedValue;
      }

      // Query database
      const flag = await this.prisma.featureFlag.findUnique({
        where: { key: flagKey },
        select: { value: true }
      });

      const value = flag?.value ?? defaultValue;

      // Cache the result
      this.setCachedValue(flagKey, value);

      return value;
    } catch (error) {
      this.logger.error(`Error checking feature flag ${flagKey}:`, error);
      return defaultValue;
    }
  }

  /**
   * Get multiple feature flags at once
   */
  async getMultipleFlags(flagKeys: string[]): Promise<Record<string, boolean>> {
    try {
      const results: Record<string, boolean> = {};

      // Check cache first for all keys
      const uncachedKeys: string[] = [];

      for (const key of flagKeys) {
        const cachedValue = this.getCachedValue(key);
        if (cachedValue !== null) {
          results[key] = cachedValue;
        } else {
          uncachedKeys.push(key);
        }
      }

      // Query database for uncached keys
      if (uncachedKeys.length > 0) {
        const flags = await this.prisma.featureFlag.findMany({
          where: { key: { in: uncachedKeys } },
          select: { key: true, value: true }
        });

        // Map results and cache them
        for (const flag of flags) {
          results[flag.key] = flag.value;
          this.setCachedValue(flag.key, flag.value);
        }

        // Set default values for flags not found in database
        for (const key of uncachedKeys) {
          if (!(key in results)) {
            const defaultFlag = this.DEFAULT_FLAGS.find(f => f.key === key);
            const defaultValue = defaultFlag?.defaultValue ?? false;
            results[key] = defaultValue;
            this.setCachedValue(key, defaultValue);
          }
        }
      }

      return results;
    } catch (error) {
      this.logger.error('Error getting multiple feature flags:', error);
      // Return default values on error
      const defaults: Record<string, boolean> = {};
      for (const key of flagKeys) {
        const defaultFlag = this.DEFAULT_FLAGS.find(f => f.key === key);
        defaults[key] = defaultFlag?.defaultValue ?? false;
      }
      return defaults;
    }
  }

  /**
   * Set a feature flag value
   */
  async setFlag(flagKey: string, value: boolean, updatedBy?: string): Promise<void> {
    try {
      await this.prisma.featureFlag.upsert({
        where: { key: flagKey },
        update: {
          value,
          updatedBy,
          updatedAt: new Date()
        },
        create: {
          key: flagKey,
          value,
          updatedBy,
          category: this.getFlagCategory(flagKey)
        }
      });

      // Update cache
      this.setCachedValue(flagKey, value);

      this.logger.log(`Feature flag ${flagKey} set to ${value} by ${updatedBy || 'system'}`);
    } catch (error) {
      this.logger.error(`Error setting feature flag ${flagKey}:`, error);
      throw error;
    }
  }

  /**
   * Get all feature flags
   */
  async getAllFlags(): Promise<Array<{
    key: string;
    value: boolean;
    description?: string;
    category: string;
    updatedBy?: string;
    updatedAt: Date;
  }>> {
    try {
      const flags = await this.prisma.featureFlag.findMany({
        orderBy: [
          { category: 'asc' },
          { key: 'asc' }
        ]
      });

      return flags.map(flag => ({
        key: flag.key,
        value: flag.value,
        description: flag.description || undefined,
        category: flag.category,
        updatedBy: flag.updatedBy || undefined,
        updatedAt: flag.updatedAt
      }));
    } catch (error) {
      this.logger.error('Error getting all feature flags:', error);
      throw error;
    }
  }

  /**
   * Get feature flags by category
   */
  async getFlagsByCategory(category: string): Promise<Array<{
    key: string;
    value: boolean;
    description?: string;
  }>> {
    try {
      const flags = await this.prisma.featureFlag.findMany({
        where: { category },
        orderBy: { key: 'asc' }
      });

      return flags.map(flag => ({
        key: flag.key,
        value: flag.value,
        description: flag.description || undefined
      }));
    } catch (error) {
      this.logger.error(`Error getting feature flags for category ${category}:`, error);
      throw error;
    }
  }

  /**
   * Clear cache (useful for testing or forced refresh)
   */
  clearCache(): void {
    this.featureCache.clear();
    this.cacheExpiry.clear();
    this.logger.log('Feature flag cache cleared');
  }

  /**
   * Get cached value if valid
   */
  private getCachedValue(key: string): boolean | null {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() < expiry) {
      return this.featureCache.get(key) ?? null;
    }

    // Cache expired or missing
    this.featureCache.delete(key);
    this.cacheExpiry.delete(key);
    return null;
  }

  /**
   * Set cached value with expiry
   */
  private setCachedValue(key: string, value: boolean): void {
    this.featureCache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
  }

  /**
   * Get flag category from default configuration
   */
  private getFlagCategory(key: string): string {
    const defaultFlag = this.DEFAULT_FLAGS.find(f => f.key === key);
    return defaultFlag?.category || 'general';
  }

  /**
   * Launch Mode Helper Methods
   */
  async isLaunchModeActive(): Promise<boolean> {
    return this.isEnabled('launch_mode_active', false);
  }

  async isFreeBuyerWeek(): Promise<boolean> {
    return this.isEnabled('free_buyer_week', false);
  }

  async isFreeSellerWeek(): Promise<boolean> {
    return this.isEnabled('free_seller_week', false);
  }

  async isCommissionDisabled(): Promise<boolean> {
    return this.isEnabled('disable_commission', false);
  }

  async isEmergencyPaused(): Promise<boolean> {
    return this.isEnabled('system_emergency_pause', false);
  }

  /**
   * Get launch mode status summary
   */
  async getLaunchModeStatus(): Promise<{
    launchModeActive: boolean;
    freeBuyerWeek: boolean;
    freeSellerWeek: boolean;
    commissionDisabled: boolean;
    emergencyPaused: boolean;
    activeFlags: string[];
  }> {
    const flags = await this.getMultipleFlags([
      'launch_mode_active',
      'free_buyer_week',
      'free_seller_week',
      'disable_commission',
      'system_emergency_pause'
    ]);

    const activeFlags = Object.entries(flags)
      .filter(([, value]) => value === true)
      .map(([key]) => key);

    return {
      launchModeActive: flags.launch_mode_active,
      freeBuyerWeek: flags.free_buyer_week,
      freeSellerWeek: flags.free_seller_week,
      commissionDisabled: flags.disable_commission,
      emergencyPaused: flags.system_emergency_pause,
      activeFlags
    };
  }
}
