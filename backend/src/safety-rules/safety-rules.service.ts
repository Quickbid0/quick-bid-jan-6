import { Injectable, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FeatureFlagService } from '../feature-flag/feature-flag.service';

export interface SafetyValidation {
  isSafe: boolean;
  violations: string[];
  warnings: string[];
  recommendations: string[];
}

export interface OperationContext {
  userId?: string;
  operation: string;
  resource?: string;
  amount?: number;
  metadata?: Record<string, any>;
}

@Injectable()
export class SafetyRulesService {
  private readonly logger = new Logger(SafetyRulesService.name);

  // NON-NEGOTIABLE safety rules that CANNOT be overridden by launch mode
  private readonly ABSOLUTE_SAFETY_RULES = {
    escrow: {
      required: true,
      description: 'Escrow protection must remain active for all financial transactions',
      check: (context: OperationContext) => this.checkEscrowSafety(context),
    },
    wallet_balance: {
      required: true,
      description: 'Wallet balances cannot go negative',
      check: (context: OperationContext) => this.checkWalletBalanceSafety(context),
    },
    kyc_verification: {
      required: true,
      description: 'KYC verification cannot be bypassed',
      check: (context: OperationContext) => this.checkKYCSafety(context),
    },
    fraud_detection: {
      required: true,
      description: 'Fraud detection must remain active',
      check: (context: OperationContext) => this.checkFraudDetectionSafety(context),
    },
    bid_limits: {
      required: true,
      description: 'Bid limits and validation must be enforced',
      check: (context: OperationContext) => this.checkBidLimitsSafety(context),
    },
    role_guards: {
      required: true,
      description: 'Role-based access controls must remain active',
      check: (context: OperationContext) => this.checkRoleGuardsSafety(context),
    },
    data_privacy: {
      required: true,
      description: 'Data privacy and GDPR compliance must be maintained',
      check: (context: OperationContext) => this.checkDataPrivacySafety(context),
    },
  };

  constructor(
    private prisma: PrismaService,
    private featureFlagService: FeatureFlagService,
  ) {}

  /**
   * Validate operation against all safety rules
   */
  async validateOperationSafety(context: OperationContext): Promise<SafetyValidation> {
    const violations: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check each safety rule
    for (const [ruleKey, ruleConfig] of Object.entries(this.ABSOLUTE_SAFETY_RULES)) {
      try {
        const ruleResult = await ruleConfig.check(context);

        if (ruleResult.violations) {
          violations.push(...ruleResult.violations);
        }

        if (ruleResult.warnings) {
          warnings.push(...ruleResult.warnings);
        }

        if (ruleResult.recommendations) {
          recommendations.push(...ruleResult.recommendations);
        }
      } catch (error) {
        violations.push(`Safety rule '${ruleKey}' check failed: ${error.message}`);
      }
    }

    // Additional contextual checks
    await this.performContextualSafetyChecks(context, violations, warnings, recommendations);

    const isSafe = violations.length === 0;

    // Log safety validation results
    if (!isSafe) {
      this.logger.error(`SAFETY VIOLATION in operation ${context.operation}:`, {
        context,
        violations,
        warnings,
      });
    } else if (warnings.length > 0) {
      this.logger.warn(`Safety warnings for operation ${context.operation}:`, {
        context,
        warnings,
      });
    }

    return {
      isSafe,
      violations,
      warnings,
      recommendations,
    };
  }

  /**
   * Check escrow safety - escrow must ALWAYS be active
   */
  private async checkEscrowSafety(context: OperationContext): Promise<{
    violations: string[];
    warnings: string[];
    recommendations: string[];
  }> {
    const violations: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check if operation involves financial transactions
    if (this.isFinancialOperation(context.operation)) {
      // Verify escrow is not disabled by any feature flag
      const escrowDisabled = await this.featureFlagService.isEnabled('disable_escrow');
      if (escrowDisabled) {
        violations.push('CRITICAL: Escrow protection cannot be disabled for safety reasons');
      }

      // Check if transaction amount exceeds escrow threshold
      if (context.amount && context.amount > 50000) { // ₹50,000 threshold
        recommendations.push('High-value transaction: Ensure escrow protection is active');
      }
    }

    return { violations, warnings, recommendations };
  }

  /**
   * Check wallet balance safety - no negative balances allowed
   */
  private async checkWalletBalanceSafety(context: OperationContext): Promise<{
    violations: string[];
    warnings: string[];
    recommendations: string[];
  }> {
    const violations: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    if (context.userId && this.isWalletOperation(context.operation)) {
      try {
        const wallet = await this.prisma.wallet.findUnique({
          where: { userId: context.userId },
          select: { balance: true },
        });

        if (!wallet) {
          violations.push('Wallet not found - cannot proceed with wallet operation');
          return { violations, warnings, recommendations };
        }

        // Check for potential negative balance
        if (context.amount && context.amount > 0) {
          // Debit operation
          if (wallet.balance < context.amount) {
            violations.push(`Insufficient wallet balance: ₹${wallet.balance} < ₹${context.amount}`);
          }
        }

        // Check for very low balance warnings
        if (wallet.balance < 100) {
          warnings.push('Wallet balance below ₹100 - user may face restrictions');
        }

        // Check for unusually high amounts
        if (context.amount && context.amount > 100000) { // ₹1L threshold
          warnings.push('High-value transaction detected - additional verification recommended');
        }

      } catch (error) {
        violations.push(`Wallet safety check failed: ${error.message}`);
      }
    }

    return { violations, warnings, recommendations };
  }

  /**
   * Check KYC safety - KYC cannot be bypassed
   */
  private async checkKYCSafety(context: OperationContext): Promise<{
    violations: string[];
    warnings: string[];
    recommendations: string[];
  }> {
    const violations: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    if (context.userId && this.requiresKYC(context.operation)) {
      try {
        const user = await this.prisma.user.findUnique({
          where: { id: context.userId },
          select: {
            isVerified: true,
            kycStatus: true,
            emailVerified: true,
          },
        });

        if (!user) {
          violations.push('User not found for KYC verification');
          return { violations, warnings, recommendations };
        }

        // Check KYC status
        if (!user.isVerified || user.kycStatus !== 'VERIFIED') {
          violations.push('KYC verification required but not completed');
        }

        // Check email verification for critical operations
        if (!user.emailVerified && this.isCriticalOperation(context.operation)) {
          violations.push('Email verification required for this operation');
        }

        // Check if KYC bypass is attempted
        const kycBypassEnabled = await this.featureFlagService.isEnabled('bypass_kyc');
        if (kycBypassEnabled) {
          violations.push('CRITICAL: KYC bypass is not allowed for safety and compliance reasons');
        }

      } catch (error) {
        violations.push(`KYC safety check failed: ${error.message}`);
      }
    }

    return { violations, warnings, recommendations };
  }

  /**
   * Check fraud detection safety - fraud detection must remain active
   */
  private async checkFraudDetectionSafety(context: OperationContext): Promise<{
    violations: string[];
    warnings: string[];
    recommendations: string[];
  }> {
    const violations: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check if fraud detection is disabled
    const fraudDetectionDisabled = await this.featureFlagService.isEnabled('disable_fraud_detection');
    if (fraudDetectionDisabled) {
      violations.push('CRITICAL: Fraud detection cannot be disabled for security reasons');
    }

    // Perform basic fraud pattern checks
    if (context.userId && context.amount) {
      try {
        // Check for rapid successive transactions
        const recentTransactions = await this.prisma.walletTransaction.count({
          where: {
            userId: context.userId,
            createdAt: {
              gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
            },
          },
        });

        if (recentTransactions > 10) {
          warnings.push('High frequency of transactions detected - potential fraud pattern');
        }

        // Check for unusually large amounts
        if (context.amount > 500000) { // ₹5L threshold
          warnings.push('Unusually large transaction amount - additional verification recommended');
        }

      } catch (error) {
        this.logger.error('Fraud detection check error:', error);
      }
    }

    return { violations, warnings, recommendations };
  }

  /**
   * Check bid limits safety - bid validation must be enforced
   */
  private async checkBidLimitsSafety(context: OperationContext): Promise<{
    violations: string[];
    warnings: string[];
    recommendations: string[];
  }> {
    const violations: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    if (context.operation === 'place_bid' && context.userId) {
      // Check if unlimited bids are enabled (should not be allowed)
      const unlimitedBids = await this.featureFlagService.isEnabled('unlimited_bids');
      if (unlimitedBids) {
        violations.push('CRITICAL: Unlimited bids are not allowed for marketplace integrity');
      }

      // Additional bid validation would be performed here
      // (Detailed bid validation is handled by BidControlService)
    }

    return { violations, warnings, recommendations };
  }

  /**
   * Check role guards safety - role-based access must remain active
   */
  private async checkRoleGuardsSafety(context: OperationContext): Promise<{
    violations: string[];
    warnings: string[];
    recommendations: string[];
  }> {
    const violations: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check if role guards are disabled
    const roleGuardsDisabled = await this.featureFlagService.isEnabled('disable_role_guards');
    if (roleGuardsDisabled) {
      violations.push('CRITICAL: Role-based access controls cannot be disabled for security reasons');
    }

    // Check if operation requires specific role
    if (this.requiresAdminRole(context.operation)) {
      // Additional admin role validation would be performed here
      // (Detailed role validation is handled by RolesGuard)
    }

    return { violations, warnings, recommendations };
  }

  /**
   * Check data privacy safety - GDPR compliance must be maintained
   */
  private async checkDataPrivacySafety(context: OperationContext): Promise<{
    violations: string[];
    warnings: string[];
    recommendations: string[];
  }> {
    const violations: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check if data export without consent is attempted
    if (context.operation.includes('export') && !context.metadata?.consentGiven) {
      violations.push('Data export requires explicit user consent for GDPR compliance');
    }

    // Check data retention policies
    if (context.operation.includes('store') && context.metadata?.retentionDays) {
      const maxRetention = 2555; // 7 years for financial data
      if (context.metadata.retentionDays > maxRetention) {
        warnings.push(`Data retention period exceeds recommended maximum of ${maxRetention} days`);
      }
    }

    return { violations, warnings, recommendations };
  }

  /**
   * Perform additional contextual safety checks
   */
  private async performContextualSafetyChecks(
    context: OperationContext,
    violations: string[],
    warnings: string[],
    recommendations: string[],
  ): Promise<void> {
    // Check for emergency pause
    const emergencyPaused = await this.featureFlagService.isEnabled('system_emergency_pause');
    if (emergencyPaused && this.isBlockedByEmergencyPause(context.operation)) {
      violations.push('CRITICAL: System is under emergency pause - operation blocked');
    }

    // Check launch mode safety
    const launchModeActive = await this.featureFlagService.isEnabled('launch_mode_active');
    if (launchModeActive) {
      // Ensure launch mode only affects allowed features
      if (this.isUnsafeForLaunchMode(context.operation)) {
        violations.push('CRITICAL: This operation cannot be modified by launch mode for safety reasons');
      }
    }

    // Rate limiting checks would be performed here
    // (Detailed rate limiting is handled by guards/interceptors)
  }

  /**
   * Helper methods for operation classification
   */
  private isFinancialOperation(operation: string): boolean {
    return [
      'transfer_funds',
      'place_bid',
      'withdraw_funds',
      'escrow_hold',
      'escrow_release',
      'wallet_bonus',
    ].includes(operation);
  }

  private isWalletOperation(operation: string): boolean {
    return [
      'wallet_debit',
      'wallet_credit',
      'place_bid',
      'withdraw_funds',
    ].includes(operation);
  }

  private requiresKYC(operation: string): boolean {
    return [
      'withdraw_funds',
      'sell_vehicle',
      'large_transaction',
    ].includes(operation);
  }

  private isCriticalOperation(operation: string): boolean {
    return [
      'change_password',
      'withdraw_funds',
      'sell_vehicle',
      'admin_action',
    ].includes(operation);
  }

  private requiresAdminRole(operation: string): boolean {
    return operation.includes('admin') || operation.includes('system');
  }

  private isBlockedByEmergencyPause(operation: string): boolean {
    return [
      'place_bid',
      'create_auction',
      'transfer_funds',
      'withdraw_funds',
    ].includes(operation);
  }

  private isUnsafeForLaunchMode(operation: string): boolean {
    // Operations that should NEVER be affected by launch mode
    return [
      'escrow_hold',
      'escrow_release',
      'kyc_verification',
      'fraud_check',
      'admin_access',
      'system_config',
    ].includes(operation);
  }

  /**
   * Execute safe operation with validation
   */
  async executeSafeOperation<T>(
    context: OperationContext,
    operation: () => Promise<T>,
  ): Promise<T> {
    const validation = await this.validateOperationSafety(context);

    if (!validation.isSafe) {
      throw new ForbiddenException(
        `Operation blocked by safety rules: ${validation.violations.join(', ')}`
      );
    }

    if (validation.warnings.length > 0) {
      this.logger.warn(`Operation warnings: ${validation.warnings.join(', ')}`);
    }

    try {
      const result = await operation();

      // Log successful safe operation
      this.logger.log(`Safe operation completed: ${context.operation}`, {
        userId: context.userId,
        warnings: validation.warnings,
      });

      return result;
    } catch (error) {
      this.logger.error(`Safe operation failed: ${context.operation}`, error);
      throw error;
    }
  }

  /**
   * Get safety rules summary
   */
  getSafetyRulesSummary(): {
    totalRules: number;
    criticalRules: number;
    enforcedRules: string[];
  } {
    const ruleKeys = Object.keys(this.ABSOLUTE_SAFETY_RULES);
    const criticalRules = ruleKeys.length; // All rules are critical

    return {
      totalRules: ruleKeys.length,
      criticalRules,
      enforcedRules: ruleKeys,
    };
  }

  /**
   * Validate feature flag safety before enabling
   */
  async validateFeatureFlagSafety(flagKey: string, value: boolean): Promise<SafetyValidation> {
    const violations: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check if enabling this flag would violate safety rules
    const unsafeFlags = [
      'disable_escrow',
      'bypass_kyc',
      'disable_fraud_detection',
      'unlimited_bids',
      'disable_role_guards',
    ];

    if (value && unsafeFlags.includes(flagKey)) {
      violations.push(`CRITICAL: Feature flag '${flagKey}' cannot be enabled for safety and compliance reasons`);
    }

    // Launch mode specific checks
    if (flagKey === 'launch_mode_active' && value) {
      recommendations.push('Launch mode enabled - ensure only fees, limits, and bonuses are affected');
      warnings.push('Monitor system performance and user feedback during launch mode');
    }

    return {
      isSafe: violations.length === 0,
      violations,
      warnings,
      recommendations,
    };
  }
}
