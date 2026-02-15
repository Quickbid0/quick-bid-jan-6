import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WalletService } from '../wallet/wallet.service';
import { WhatsAppService } from '../notification/whatsapp.service';

export interface ReferralData {
  referrerId: string;
  referredUserId: string;
  referralCode: string;
  rewardAmount: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface ReferralRewardData {
  referralId: string;
  rewardAmount: number;
  rewardReason: string;
  creditedBy: string;
}

@Injectable()
export class ReferralService {
  private readonly logger = new Logger(ReferralService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private walletService: WalletService,
    private whatsAppService: WhatsAppService,
  ) {}

  /**
   * Generate unique referral code for user
   */
  generateReferralCode(userId: string): string {
    // Create a short, readable referral code
    const baseCode = `QM${userId.substring(0, 6).toUpperCase()}`;
    const randomSuffix = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `${baseCode}${randomSuffix}`;
  }

  /**
   * Process referral during user registration
   */
  async processReferralOnRegistration(
    newUserId: string,
    referralCode: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      // Validate referral code exists and is not self-referral
      if (!referralCode || referralCode.trim() === '') {
        return; // No referral code provided
      }

      // Find referrer by referral code
      const referrer = await this.prisma.user.findFirst({
        where: { referralCode: referralCode.trim() },
        select: { id: true, name: true },
      });

      if (!referrer) {
        this.logger.warn(`Invalid referral code used: ${referralCode}`);
        return;
      }

      // Prevent self-referral
      if (referrer.id === newUserId) {
        this.logger.warn(`Self-referral attempt blocked for user ${newUserId}`);
        return;
      }

      // Check if referral already exists
      const existingReferral = await this.prisma.referral.findFirst({
        where: {
          referrerId: referrer.id,
          referredUserId: newUserId,
        },
      });

      if (existingReferral) {
        this.logger.warn(`Duplicate referral attempt for user ${newUserId} by referrer ${referrer.id}`);
        return;
      }

      // Create referral record
      const referral = await this.prisma.referral.create({
        data: {
          referrerId: referrer.id,
          referredUserId: newUserId,
          referralCode: referralCode.trim(),
          rewardAmount: 0, // Will be set when reward is credited
          rewardStatus: 'pending',
          ipAddress,
          userAgent,
        },
      });

      // Update referred user's referredBy field
      await this.prisma.user.update({
        where: { id: newUserId },
        data: { referredBy: referrer.id },
      });

      this.logger.log(`Referral created: ${referrer.id} -> ${newUserId} (${referralCode})`);

      // Emit referral event for tracking
      this.eventEmitter.emit('referral.created', {
        referralId: referral.id,
        referrerId: referrer.id,
        referredUserId: newUserId,
        referralCode,
      });

    } catch (error) {
      this.logger.error(`Error processing referral on registration:`, error);
      // Don't throw error - registration should continue even if referral fails
    }
  }

  /**
   * Credit referral reward to referrer
   */
  async creditReferralReward(
    referralId: string,
    rewardAmount: number,
    rewardReason: string,
    creditedBy: string = 'system',
  ): Promise<void> {
    const transaction = await this.prisma.$transaction(async (tx) => {
      try {
        // Get referral details
        const referral = await tx.referral.findUnique({
          where: { id: referralId },
          include: {
            referrer: {
              select: { id: true, name: true, whatsappNumber: true, whatsappOptIn: true },
            },
          },
        });

        if (!referral) {
          throw new NotFoundException('Referral not found');
        }

        if (referral.rewardStatus === 'credited') {
          throw new BadRequestException('Referral reward already credited');
        }

        // Credit reward to referrer's wallet
        await this.walletService.addFunds(referral.referrerId, rewardAmount, {
          purpose: 'referral_reward',
          description: `Referral reward for ${rewardReason}`,
          referenceId: referralId,
          creditedBy,
        });

        // Update referral status
        await tx.referral.update({
          where: { id: referralId },
          data: {
            rewardAmount,
            rewardStatus: 'credited',
            rewardCreditedAt: new Date(),
            transactionId: `ref_${referralId}_${Date.now()}`, // Would be actual transaction ID
          },
        });

        // Update referral metrics
        await this.updateReferralMetrics(referral.referrerId, rewardAmount);

        this.logger.log(`Referral reward credited: ₹${rewardAmount} to ${referral.referrerId} for referral ${referralId}`);

        // Send WhatsApp notification if opted in
        if (referral.referrer.whatsappNumber && referral.referrer.whatsappOptIn) {
          try {
            await this.whatsAppService.sendReferralReward(
              referral.referrer.whatsappNumber,
              {
                rewardAmount: rewardAmount.toLocaleString(),
                referrerName: referral.referrer.name,
                totalReferrals: await this.getTotalReferrals(referral.referrerId),
              }
            );
          } catch (error) {
            this.logger.error(`Failed to send WhatsApp referral notification:`, error);
            // Don't fail the reward process if WhatsApp fails
          }
        }

        return referral;

      } catch (error) {
        this.logger.error(`Error crediting referral reward:`, error);
        throw error;
      }
    });

    // Emit reward credited event
    this.eventEmitter.emit('referral.reward_credited', {
      referralId,
      referrerId: transaction.referrerId,
      referredUserId: transaction.referredUserId,
      rewardAmount,
      rewardReason,
    });
  }

  /**
   * Check if user is eligible for referral reward
   */
  async checkReferralEligibility(referredUserId: string): Promise<{
    eligible: boolean;
    referralId?: string;
    reason?: string;
  }> {
    try {
      // Find active referral for user
      const referral = await this.prisma.referral.findFirst({
        where: {
          referredUserId,
          rewardStatus: 'pending',
        },
        select: {
          id: true,
          referrerId: true,
          createdAt: true,
        },
      });

      if (!referral) {
        return { eligible: false, reason: 'No active referral found' };
      }

      // Check if referred user has completed minimum activity
      // (e.g., verified account, made first purchase, etc.)
      const referredUser = await this.prisma.user.findUnique({
        where: { id: referredUserId },
        select: {
          isVerified: true,
          status: true,
          createdAt: true,
        },
      });

      if (!referredUser?.isVerified) {
        return { eligible: false, reason: 'User account not verified' };
      }

      if (referredUser.status !== 'ACTIVE') {
        return { eligible: false, reason: 'User account not active' };
      }

      // Check minimum account age (e.g., 24 hours)
      const accountAge = Date.now() - referredUser.createdAt.getTime();
      const minAge = 24 * 60 * 60 * 1000; // 24 hours

      if (accountAge < minAge) {
        return {
          eligible: false,
          reason: `Account too new (${Math.floor(accountAge / (60 * 60 * 1000))} hours old, minimum 24 hours required)`
        };
      }

      return { eligible: true, referralId: referral.id };

    } catch (error) {
      this.logger.error(`Error checking referral eligibility:`, error);
      return { eligible: false, reason: 'Error checking eligibility' };
    }
  }

  /**
   * Process automatic referral rewards based on user actions
   */
  async processAutomaticReferralReward(
    userId: string,
    action: 'first_purchase' | 'first_bid' | 'account_verification',
  ): Promise<void> {
    try {
      // Check eligibility
      const eligibility = await this.checkReferralEligibility(userId);

      if (!eligibility.eligible || !eligibility.referralId) {
        this.logger.debug(`User ${userId} not eligible for referral reward: ${eligibility.reason}`);
        return;
      }

      // Determine reward amount based on action
      let rewardAmount = 0;
      let rewardReason = '';

      switch (action) {
        case 'account_verification':
          rewardAmount = 50; // ₹50 for verification
          rewardReason = 'account verification';
          break;
        case 'first_bid':
          rewardAmount = 100; // ₹100 for first bid
          rewardReason = 'first auction bid';
          break;
        case 'first_purchase':
          rewardAmount = 200; // ₹200 for first purchase
          rewardReason = 'first auction win';
          break;
      }

      if (rewardAmount > 0) {
        await this.creditReferralReward(
          eligibility.referralId,
          rewardAmount,
          rewardReason,
          'system_auto'
        );

        this.logger.log(`Auto-credited referral reward: ₹${rewardAmount} for ${action} by user ${userId}`);
      }

    } catch (error) {
      this.logger.error(`Error processing automatic referral reward:`, error);
      // Don't throw - this shouldn't break the main user flow
    }
  }

  /**
   * Get referral statistics for user
   */
  async getReferralStats(userId: string): Promise<{
    totalReferrals: number;
    successfulReferrals: number;
    pendingRewards: number;
    totalEarned: number;
    referralCode: string;
  }> {
    const [referrals, user] = await Promise.all([
      this.prisma.referral.findMany({
        where: { referrerId: userId },
        select: {
          rewardStatus: true,
          rewardAmount: true,
        },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { referralCode: true },
      }),
    ]);

    const totalReferrals = referrals.length;
    const successfulReferrals = referrals.filter(r => r.rewardStatus === 'credited').length;
    const pendingRewards = referrals.filter(r => r.rewardStatus === 'pending').length;
    const totalEarned = referrals
      .filter(r => r.rewardStatus === 'credited')
      .reduce((sum, r) => sum + r.rewardAmount, 0);

    return {
      totalReferrals,
      successfulReferrals,
      pendingRewards,
      totalEarned,
      referralCode: user?.referralCode || '',
    };
  }

  /**
   * Get total referrals count for user
   */
  private async getTotalReferrals(userId: string): Promise<string> {
    const count = await this.prisma.referral.count({
      where: { referrerId: userId },
    });

    return count.toString();
  }

  /**
   * Update referral metrics
   */
  private async updateReferralMetrics(referrerId: string, rewardAmount: number): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.prisma.referralMetrics.upsert({
      where: { date: today },
      update: {
        totalReferrals: { increment: 1 },
        successfulConversions: { increment: 1 },
        walletRewardsPaid: { increment: rewardAmount },
      },
      create: {
        date: today,
        totalReferrals: 1,
        successfulConversions: 1,
        walletRewardsPaid: rewardAmount,
        totalShares: 0,
        whatsappShares: 0,
        whatsappCTR: 0,
        whatsappConversions: 0,
        referralRevenue: 0,
        averageOrderValue: 0,
      },
    });
  }

  /**
   * Validate referral code format and prevent abuse
   */
  validateReferralCode(code: string): boolean {
    // Basic format validation (QM + 6 chars + 4 digits)
    const codeRegex = /^QM[A-Z0-9]{10}$/;
    return codeRegex.test(code);
  }

  /**
   * Check for referral abuse patterns with enhanced security
   */
  async checkReferralAbuseEnhanced(
    userId: string,
    referralCode: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{
    isAbusive: boolean;
    reasons: string[];
    riskScore: number;
    recommendedAction: 'allow' | 'block' | 'flag' | 'require_review';
  }> {
    const reasons: string[] = [];
    let riskScore = 0;

    try {
      // Check for self-referral
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { referralCode: true },
      });

      if (user?.referralCode === referralCode) {
        reasons.push('Self-referral attempt');
        riskScore += 100;
      }

      // Check referral code validity and usage patterns
      const referrer = await this.prisma.user.findFirst({
        where: { referralCode: referralCode.trim() },
        select: { id: true, createdAt: true },
      });

      if (!referrer) {
        reasons.push('Invalid referral code');
        riskScore += 50;
      } else {
        // Check if referrer account is too new
        const referrerAge = Date.now() - referrer.createdAt.getTime();
        const minReferrerAge = 7 * 24 * 60 * 60 * 1000; // 7 days

        if (referrerAge < minReferrerAge) {
          reasons.push('Referrer account too new');
          riskScore += 30;
        }

        // Check excessive referrals from same referrer in short time
        const recentReferrals = await this.prisma.referral.count({
          where: {
            referrerId: referrer.id,
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
        });

        if (recentReferrals > 5) {
          reasons.push('Excessive referrals in short time period');
          riskScore += 40;
        }
      }

      // Check IP-based abuse patterns
      if (ipAddress) {
        const recentIPReferrals = await this.prisma.referral.count({
          where: {
            ipAddress,
            createdAt: {
              gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
            },
          },
        });

        if (recentIPReferrals > 3) {
          reasons.push('Multiple referrals from same IP recently');
          riskScore += 25;
        }
      }

      // Check user agent patterns (detect automated scripts)
      if (userAgent) {
        const suspiciousPatterns = [
          'python',
          'curl',
          'wget',
          'bot',
          'crawler',
          'spider'
        ];

        const lowerUserAgent = userAgent.toLowerCase();
        if (suspiciousPatterns.some(pattern => lowerUserAgent.includes(pattern))) {
          reasons.push('Suspicious user agent detected');
          riskScore += 35;
        }
      }

      // Check user's referral history
      const userReferralHistory = await this.prisma.referral.count({
        where: {
          referredUserId: userId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      });

      if (userReferralHistory > 0) {
        reasons.push('User already used a referral code');
        riskScore += 60;
      }

      // Determine recommended action based on risk score
      let recommendedAction: 'allow' | 'block' | 'flag' | 'require_review' = 'allow';

      if (riskScore >= 100) {
        recommendedAction = 'block';
      } else if (riskScore >= 70) {
        recommendedAction = 'require_review';
      } else if (riskScore >= 40) {
        recommendedAction = 'flag';
      }

      // Log security event for high-risk attempts
      if (riskScore >= 40) {
        await this.logReferralSecurityEvent({
          type: 'referral_abuse_attempt',
          userId,
          ipAddress,
          userAgent,
          details: {
            referralCode,
            riskScore,
            reasons,
            recommendedAction,
          },
          severity: riskScore >= 70 ? 'high' : 'medium',
        });
      }

      return {
        isAbusive: riskScore >= 50,
        reasons,
        riskScore,
        recommendedAction,
      };

    } catch (error) {
      this.logger.error(`Error checking referral abuse:`, error);
      return {
        isAbusive: false,
        reasons: ['Error during validation'],
        riskScore: 0,
        recommendedAction: 'require_review',
      };
    }
  }

  /**
   * Log referral security events to audit trail
   */
  private async logReferralSecurityEvent(event: {
    type: 'referral_abuse_attempt' | 'suspicious_activity' | 'reward_fraud_attempt';
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    details: Record<string, any>;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<void> {
    try {
      await this.prisma.complianceAuditLog.create({
        data: {
          userId: event.userId,
          action: event.type,
          resource: 'referral_system',
          riskLevel: event.severity === 'critical' ? 'critical' : event.severity === 'high' ? 'high' : 'medium',
          jurisdiction: 'india',
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          dataProcessing: true,
          personalData: true,
          financialData: true, // Referral rewards involve financial transactions
          requiresRetention: true,
          oldValues: null,
          newValues: event.details,
        },
      });

      this.logger.warn(`Referral security event logged: ${event.type}`, {
        userId: event.userId,
        severity: event.severity,
        details: event.details,
      });
    } catch (error) {
      this.logger.error('Failed to log referral security event:', error);
    }
  }
}
