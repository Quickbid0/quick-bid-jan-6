import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

interface CommissionCalculationInput {
  auctionId: string;
  finalPrice: number;
  dealerId: string;
  dealerTier?: 'basic' | 'premium' | 'enterprise';
  paymentMethod?: string;
  specialDiscounts?: number; // percentage
}

interface CommissionResult {
  baseCommission: number;
  tierDiscount: number;
  finalCommission: number;
  commissionRate: number;
  breakdown: {
    baseRate: number;
    tierAdjustment: number;
    specialDiscounts: number;
  };
}

@Injectable()
export class CommissionService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Calculate commission server-side only
   * NEVER expose calculation logic to client
   */
  async calculateCommission(input: CommissionCalculationInput): Promise<CommissionResult> {
    try {
      // Get dealer tier if not provided
      const dealerTier = input.dealerTier || await this.getDealerTier(input.dealerId);

      // Base commission rates by tier
      const baseRates = {
        basic: 0.12,      // 12%
        premium: 0.10,    // 10%
        enterprise: 0.08  // 8%
      };

      const baseRate = baseRates[dealerTier] || baseRates.basic;

      // Calculate base commission
      const baseCommission = input.finalPrice * baseRate;

      // Apply tier-based discounts
      const tierDiscounts = {
        basic: 0,
        premium: 0.02,    // 2% additional discount
        enterprise: 0.04  // 4% additional discount
      };

      const tierDiscount = input.finalPrice * (tierDiscounts[dealerTier] || 0);

      // Apply special discounts (if any)
      const specialDiscountAmount = input.specialDiscounts ?
        (baseCommission - tierDiscount) * (input.specialDiscounts / 100) : 0;

      // Final commission calculation
      const finalCommission = baseCommission - tierDiscount - specialDiscountAmount;

      // Ensure minimum commission (e.g., ₹100)
      const minimumCommission = 100;
      const adjustedFinalCommission = Math.max(finalCommission, minimumCommission);

      const result: CommissionResult = {
        baseCommission,
        tierDiscount,
        finalCommission: adjustedFinalCommission,
        commissionRate: (adjustedFinalCommission / input.finalPrice) * 100,
        breakdown: {
          baseRate: baseRate * 100,
          tierAdjustment: (tierDiscounts[dealerTier] || 0) * 100,
          specialDiscounts: input.specialDiscounts || 0
        }
      };

      // Log commission calculation for audit
      await this.logCommissionCalculation(input, result);

      return result;
    } catch (error) {
      console.error('Commission calculation failed:', error);
      throw new InternalServerErrorException('Commission calculation failed');
    }
  }

  /**
   * Process commission payment to platform
   */
  async processCommissionPayment(
    auctionId: string,
    dealerId: string,
    finalPrice: number,
    paymentTransactionId: string
  ): Promise<{ commissionId: string; status: 'calculated' | 'paid' }> {
    try {
      // Calculate commission
      const commissionResult = await this.calculateCommission({
        auctionId,
        finalPrice,
        dealerId
      });

      // Create commission record
      const commission = await this.prisma.commission.create({
        data: {
          auctionId,
          dealerId,
          finalPrice,
          commissionRate: commissionResult.commissionRate / 100, // Store as decimal
          commissionAmount: commissionResult.finalCommission,
          status: 'calculated',
          calculatedAt: new Date(),
          metadata: {
            breakdown: commissionResult.breakdown,
            paymentTransactionId
          }
        }
      });

      // Log commission processing
      await this.logCommissionAudit({
        commissionId: commission.id,
        action: 'COMMISSION_CALCULATED',
        dealerId,
        auctionId,
        amount: commissionResult.finalCommission,
        riskLevel: 'low'
      });

      return {
        commissionId: commission.id,
        status: 'calculated'
      };
    } catch (error) {
      console.error('Commission payment processing failed:', error);
      throw new InternalServerErrorException('Commission processing failed');
    }
  }

  /**
   * Mark commission as paid
   */
  async markCommissionPaid(commissionId: string, paymentReference: string): Promise<void> {
    try {
      await this.prisma.commission.update({
        where: { id: commissionId },
        data: {
          status: 'paid',
          paidAt: new Date(),
          metadata: {
            paymentReference
          }
        }
      });

      await this.logCommissionAudit({
        commissionId,
        action: 'COMMISSION_PAID',
        paymentReference,
        riskLevel: 'low'
      });
    } catch (error) {
      console.error('Commission payment marking failed:', error);
      throw new InternalServerErrorException('Failed to mark commission as paid');
    }
  }

  /**
   * Get dealer commission history
   */
  async getDealerCommissionHistory(
    dealerId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    try {
      return await this.prisma.commission.findMany({
        where: { dealerId },
        include: {
          auction: {
            select: {
              id: true,
              title: true,
              status: true
            }
          }
        },
        orderBy: { calculatedAt: 'desc' },
        take: limit,
        skip: offset
      });
    } catch (error) {
      console.error('Failed to retrieve commission history:', error);
      return [];
    }
  }

  /**
   * Calculate platform revenue from commissions
   */
  async calculatePlatformRevenue(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalCommissions: number;
    totalAuctions: number;
    averageCommission: number;
    revenueByTier: Record<string, number>;
  }> {
    try {
      const commissions = await this.prisma.commission.findMany({
        where: {
          calculatedAt: {
            gte: startDate,
            lte: endDate
          },
          status: 'paid'
        },
        include: {
          dealer: {
            select: {
              subscriptionTier: true
            }
          }
        }
      });

      const totalCommissions = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);
      const totalAuctions = commissions.length;
      const averageCommission = totalAuctions > 0 ? totalCommissions / totalAuctions : 0;

      const revenueByTier: Record<string, number> = {};
      commissions.forEach(c => {
        const tier = c.dealer?.subscriptionTier || 'basic';
        revenueByTier[tier] = (revenueByTier[tier] || 0) + c.commissionAmount;
      });

      return {
        totalCommissions,
        totalAuctions,
        averageCommission,
        revenueByTier
      };
    } catch (error) {
      console.error('Platform revenue calculation failed:', error);
      throw new InternalServerErrorException('Revenue calculation failed');
    }
  }

  /**
   * Get dealer tier
   */
  private async getDealerTier(dealerId: string): Promise<'basic' | 'premium' | 'enterprise'> {
    try {
      const dealer = await this.prisma.user.findUnique({
        where: { id: dealerId },
        select: {
          company: {
            select: {
              subscriptionTier: true
            }
          }
        }
      });

      return dealer?.company?.subscriptionTier as 'basic' | 'premium' | 'enterprise' || 'basic';
    } catch (error) {
      console.error('Failed to get dealer tier:', error);
      return 'basic';
    }
  }

  /**
   * Log commission calculation for audit
   */
  private async logCommissionCalculation(
    input: CommissionCalculationInput,
    result: CommissionResult
  ): Promise<void> {
    try {
      console.log('Commission calculated:', {
        auctionId: input.auctionId,
        dealerId: input.dealerId,
        finalPrice: input.finalPrice,
        commission: result.finalCommission,
        rate: result.commissionRate
      });
    } catch (error) {
      console.error('Commission calculation logging failed:', error);
    }
  }

  /**
   * Log commission audit event
   */
  private async logCommissionAudit(params: {
    commissionId?: string;
    action: string;
    dealerId?: string;
    auctionId?: string;
    amount?: number;
    paymentReference?: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<void> {
    try {
      // In production, log to audit table
      console.log('Commission audit logged:', params);
    } catch (error) {
      console.error('Commission audit logging failed:', error);
    }
  }

  /**
   * Validate commission calculation (for testing/debugging)
   */
  async validateCommissionCalculation(
    input: CommissionCalculationInput,
    expectedCommission: number,
    tolerance: number = 0.01
  ): Promise<{ isValid: boolean; difference: number }> {
    try {
      const result = await this.calculateCommission(input);
      const difference = Math.abs(result.finalCommission - expectedCommission);
      const isValid = difference <= tolerance;

      return { isValid, difference };
    } catch (error) {
      console.error('Commission validation failed:', error);
      return { isValid: false, difference: -1 };
    }
  }

  /**
   * Bulk commission processing (for admin operations)
   */
  async processBulkCommissions(auctionIds: string[]): Promise<{
    processed: number;
    failed: number;
    totalCommission: number;
  }> {
    let processed = 0;
    let failed = 0;
    let totalCommission = 0;

    for (const auctionId of auctionIds) {
      try {
        // Get auction details
        const auction = await this.prisma.auction.findUnique({
          where: { id: auctionId },
          select: {
            id: true,
            currentBid: true,
            sellerId: true
          }
        });

        if (!auction || !auction.currentBid) continue;

        // Process commission
        const result = await this.processCommissionPayment(
          auctionId,
          auction.sellerId,
          auction.currentBid,
          `bulk_${Date.now()}`
        );

        processed++;
        totalCommission += await this.getCommissionAmount(result.commissionId);

      } catch (error) {
        console.error(`Failed to process commission for auction ${auctionId}:`, error);
        failed++;
      }
    }

    return { processed, failed, totalCommission };
  }

  /**
   * Get commission amount by ID
   */
  private async getCommissionAmount(commissionId: string): Promise<number> {
    const commission = await this.prisma.commission.findUnique({
      where: { id: commissionId },
      select: { commissionAmount: true }
    });
    return commission?.commissionAmount || 0;
  }
}
