import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

interface EscrowCreationInput {
  auctionId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  currency: string;
  escrowType: 'auction_deposit' | 'full_payment' | 'partial_escrow';
  conditions: {
    auctionCompletion: boolean;
    inspectionApproval?: boolean;
    deliveryConfirmation?: boolean;
    disputeResolution?: boolean;
  };
  bankPartnerId?: string;
}

interface EscrowReleaseInput {
  escrowId: string;
  releaseType: 'to_buyer' | 'to_seller' | 'partial_release' | 'forfeit';
  amount?: number; // For partial releases
  reason: string;
  approvedBy: string;
  bankReference?: string;
}

interface EscrowStatus {
  escrowId: string;
  status: 'active' | 'released' | 'disputed' | 'forfeited';
  heldAmount: number;
  releasedAmount: number;
  conditions: {
    met: string[];
    pending: string[];
  };
  bankReference: string;
}

@Injectable()
export class EscrowService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create escrow account for auction
   */
  async createEscrow(input: EscrowCreationInput): Promise<{ escrowId: string; bankReference: string }> {
    try {
      // Validate escrow creation
      await this.validateEscrowCreation(input);

      // Generate escrow reference
      const escrowId = `esc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // In production, call bank API to create escrow account
      const bankReference = await this.createBankEscrow(input);

      // Store escrow record
      await this.prisma.escrowTransaction.create({
        data: {
          auctionId: input.auctionId,
          buyerId: input.buyerId,
          sellerId: input.sellerId,
          amount: input.amount,
          currency: input.currency,
          status: 'HELD',
          heldAt: new Date(),
          escrowFee: this.calculateEscrowFee(input.amount),
          processingFee: 0, // Set by bank
          disputeId: null,
          releasedBy: null,
          releaseReason: null,
          releasedAt: null,
          metadata: {
            escrowType: input.escrowType,
            conditions: input.conditions,
            bankPartnerId: input.bankPartnerId,
            escrowId
          }
        }
      });

      // Log escrow creation
      await this.logEscrowAudit({
        escrowId,
        action: 'ESCROW_CREATED',
        auctionId: input.auctionId,
        buyerId: input.buyerId,
        sellerId: input.sellerId,
        amount: input.amount,
        bankReference,
        riskLevel: 'low'
      });

      return { escrowId, bankReference };
    } catch (error) {
      console.error('Escrow creation failed:', error);
      throw new InternalServerErrorException('Escrow creation failed');
    }
  }

  /**
   * Release escrow funds
   */
  async releaseEscrow(input: EscrowReleaseInput): Promise<{ success: boolean; bankReference: string }> {
    try {
      // Get escrow record
      const escrow = await this.prisma.escrowTransaction.findUnique({
        where: { id: input.escrowId }
      });

      if (!escrow) {
        throw new BadRequestException('Escrow not found');
      }

      if (escrow.status !== 'HELD') {
        throw new BadRequestException('Escrow already processed');
      }

      // Validate release conditions
      await this.validateEscrowRelease(escrow, input);

      // Calculate release amount
      const releaseAmount = input.releaseType === 'partial_release' ?
        (input.amount || escrow.amount) : escrow.amount;

      if (releaseAmount > escrow.amount) {
        throw new BadRequestException('Release amount exceeds escrow balance');
      }

      // Call bank API to release funds
      const bankReference = await this.releaseBankEscrow(escrow, input, releaseAmount);

      // Update escrow record
      const newStatus = input.releaseType === 'forfeit' ? 'FORFEITED' : 'RELEASED_TO_BUYER';
      if (input.releaseType === 'to_seller') {
        // Note: Adjust status enum as needed
      }

      await this.prisma.escrowTransaction.update({
        where: { id: input.escrowId },
        data: {
          status: newStatus,
          releasedAt: new Date(),
          releasedBy: input.approvedBy,
          releaseReason: input.reason,
          metadata: {
            ...escrow.metadata,
            releaseType: input.releaseType,
            bankReference
          }
        }
      });

      // Log escrow release
      await this.logEscrowAudit({
        escrowId: input.escrowId,
        action: 'ESCROW_RELEASED',
        auctionId: escrow.auctionId,
        buyerId: escrow.buyerId,
        sellerId: escrow.sellerId,
        amount: releaseAmount,
        releaseType: input.releaseType,
        bankReference,
        riskLevel: 'low'
      });

      return { success: true, bankReference };
    } catch (error) {
      console.error('Escrow release failed:', error);
      throw error;
    }
  }

  /**
   * Check escrow status and conditions
   */
  async getEscrowStatus(escrowId: string): Promise<EscrowStatus> {
    try {
      const escrow = await this.prisma.escrowTransaction.findUnique({
        where: { id: escrowId },
        include: {
          dispute: true
        }
      });

      if (!escrow) {
        throw new BadRequestException('Escrow not found');
      }

      // Check conditions (simplified)
      const conditions = escrow.metadata?.conditions || {};
      const metConditions: string[] = [];
      const pendingConditions: string[] = [];

      if (conditions.auctionCompletion) {
        // Check if auction is completed
        const auction = await this.prisma.auction.findUnique({
          where: { id: escrow.auctionId },
          select: { status: true }
        });
        if (auction?.status === 'ended') {
          metConditions.push('auction_completion');
        } else {
          pendingConditions.push('auction_completion');
        }
      }

      // Add other condition checks as needed

      return {
        escrowId,
        status: escrow.status.toLowerCase() as any,
        heldAmount: escrow.amount,
        releasedAmount: escrow.releasedAt ? escrow.amount : 0,
        conditions: {
          met: metConditions,
          pending: pendingConditions
        },
        bankReference: escrow.metadata?.bankReference || ''
      };
    } catch (error) {
      console.error('Escrow status check failed:', error);
      throw new InternalServerErrorException('Escrow status check failed');
    }
  }

  /**
   * Handle escrow dispute
   */
  async initiateEscrowDispute(
    escrowId: string,
    initiatorId: string,
    disputeReason: string,
    evidence: any[]
  ): Promise<{ disputeId: string }> {
    try {
      const escrow = await this.prisma.escrowTransaction.findUnique({
        where: { id: escrowId }
      });

      if (!escrow) {
        throw new BadRequestException('Escrow not found');
      }

      // Create dispute record
      const dispute = await this.prisma.dispute.create({
        data: {
          auctionId: escrow.auctionId,
          productId: escrow.auctionId, // Assuming product ID is auction ID for now
          buyerId: escrow.buyerId,
          sellerId: escrow.sellerId,
          disputeType: 'PAYMENT_DISPUTE',
          title: 'Escrow Release Dispute',
          description: disputeReason,
          evidence: evidence,
          status: 'PENDING_REVIEW',
          priority: 'HIGH',
          refundAmount: escrow.amount,
          penaltyAmount: 0
        }
      });

      // Link dispute to escrow
      await this.prisma.escrowTransaction.update({
        where: { id: escrowId },
        data: {
          status: 'DISPUTED',
          disputeId: dispute.id
        }
      });

      await this.logEscrowAudit({
        escrowId,
        action: 'ESCROW_DISPUTE_INITIATED',
        disputeId: dispute.id,
        riskLevel: 'high'
      });

      return { disputeId: dispute.id };
    } catch (error) {
      console.error('Escrow dispute initiation failed:', error);
      throw new InternalServerErrorException('Dispute initiation failed');
    }
  }

  /**
   * Get user's escrow accounts
   */
  async getUserEscrows(userId: string, role: 'buyer' | 'seller'): Promise<any[]> {
    try {
      const whereClause = role === 'buyer' ?
        { buyerId: userId } :
        { sellerId: userId };

      return await this.prisma.escrowTransaction.findMany({
        where: whereClause,
        include: {
          dispute: true
        },
        orderBy: { heldAt: 'desc' }
      });
    } catch (error) {
      console.error('Failed to retrieve user escrows:', error);
      return [];
    }
  }

  /**
   * Calculate escrow fee
   */
  private calculateEscrowFee(amount: number): number {
    // 0.5% escrow fee, minimum ₹50, maximum ₹5000
    const fee = amount * 0.005;
    return Math.max(50, Math.min(fee, 5000));
  }

  /**
   * Validate escrow creation
   */
  private async validateEscrowCreation(input: EscrowCreationInput): Promise<void> {
    // Check if auction exists and is active
    const auction = await this.prisma.auction.findUnique({
      where: { id: input.auctionId },
      select: { status: true, id: true }
    });

    if (!auction || auction.status !== 'active') {
      throw new BadRequestException('Invalid auction for escrow');
    }

    // Check minimum escrow amount
    if (input.amount < 1000) { // ₹1000 minimum
      throw new BadRequestException('Escrow amount too low');
    }

    // Check user roles
    const buyer = await this.prisma.user.findUnique({
      where: { id: input.buyerId },
      select: { role: true }
    });

    if (!buyer || buyer.role !== 'BUYER') {
      throw new BadRequestException('Invalid buyer');
    }
  }

  /**
   * Validate escrow release
   */
  private async validateEscrowRelease(escrow: any, input: EscrowReleaseInput): Promise<void> {
    // Check user permissions
    const approver = await this.prisma.user.findUnique({
      where: { id: input.approvedBy },
      select: { role: true }
    });

    if (!approver || !['ADMIN', 'SUPPORT_AGENT'].includes(approver.role)) {
      throw new BadRequestException('Unauthorized escrow release');
    }

    // Check release conditions based on type
    switch (input.releaseType) {
      case 'to_buyer':
        // Only release to buyer if auction failed or dispute resolved in buyer's favor
        break;
      case 'to_seller':
        // Only release to seller if auction completed successfully
        break;
      case 'forfeit':
        // Only admin can forfeit
        if (approver.role !== 'ADMIN') {
          throw new BadRequestException('Only admin can forfeit escrow');
        }
        break;
    }
  }

  /**
   * Create escrow with bank partner (mock implementation)
   */
  private async createBankEscrow(input: EscrowCreationInput): Promise<string> {
    // In production, integrate with bank APIs (Razorpay Escrow, HDFC, etc.)
    // Create escrow account and return bank reference

    const bankReference = `bank_esc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('Bank escrow created:', { input, bankReference });

    return bankReference;
  }

  /**
   * Release escrow through bank (mock implementation)
   */
  private async releaseBankEscrow(escrow: any, input: EscrowReleaseInput, amount: number): Promise<string> {
    // In production, call bank API to release funds
    // Transfer from escrow to appropriate account

    const bankReference = `bank_rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('Bank escrow released:', { escrowId: escrow.id, input, amount, bankReference });

    return bankReference;
  }

  /**
   * Log escrow audit event
   */
  private async logEscrowAudit(params: {
    escrowId: string;
    action: string;
    auctionId?: string;
    buyerId?: string;
    sellerId?: string;
    disputeId?: string;
    amount?: number;
    releaseType?: string;
    bankReference?: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<void> {
    try {
      console.log('Escrow audit logged:', params);
    } catch (error) {
      console.error('Escrow audit logging failed:', error);
    }
  }

  /**
   * Auto-release escrow after conditions are met
   */
  async processAutoRelease(): Promise<{ processed: number; failed: number }> {
    try {
      // Find escrows ready for auto-release
      const readyEscrows = await this.prisma.escrowTransaction.findMany({
        where: {
          status: 'HELD',
          // Add conditions for auto-release (e.g., auction completed 7 days ago)
        }
      });

      let processed = 0;
      let failed = 0;

      for (const escrow of readyEscrows) {
        try {
          // Check if all conditions are met
          const status = await this.getEscrowStatus(escrow.id);

          if (status.conditions.pending.length === 0) {
            // Auto-release to seller
            await this.releaseEscrow({
              escrowId: escrow.id,
              releaseType: 'to_seller',
              reason: 'Auto-release: All conditions met',
              approvedBy: 'SYSTEM'
            });
            processed++;
          }
        } catch (error) {
          console.error(`Auto-release failed for escrow ${escrow.id}:`, error);
          failed++;
        }
      }

      return { processed, failed };
    } catch (error) {
      console.error('Auto-release processing failed:', error);
      throw new InternalServerErrorException('Auto-release processing failed');
    }
  }
}
