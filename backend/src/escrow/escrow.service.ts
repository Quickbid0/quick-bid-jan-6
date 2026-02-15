import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { EscrowStatus, Prisma } from '@prisma/client';

export interface EscrowHoldRequest {
  auctionId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  transactionRef?: string;
  paymentMethod?: string;
}

export interface EscrowReleaseRequest {
  escrowId: string;
  releaseTo: 'buyer' | 'seller' | 'split';
  releaseReason: string;
  releaseNotes?: string;
  buyerAmount?: number;
  sellerAmount?: number;
  disputeId?: string;
}

export interface EscrowSettlementRequest {
  auctionId: string;
  deliveryConfirmed: boolean;
  deliveryNotes?: string;
  settlementType?: 'auto' | 'manual';
}

@Injectable()
export class EscrowService {
  private readonly logger = new Logger(EscrowService.name);
  private readonly escrowFeePercent = 0.001; // 0.1% escrow fee
  private readonly processingFeePercent = 0.002; // 0.2% processing fee

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async holdInEscrow(request: EscrowHoldRequest): Promise<any> {
    this.logger.log(`Holding ₹${request.amount} in escrow for auction ${request.auctionId}`);

    // Check if escrow already exists for this auction
    const existingEscrow = await this.prisma.escrowTransaction.findFirst({
      where: {
        auctionId: request.auctionId,
        buyerId: request.buyerId,
        status: EscrowStatus.HELD,
      },
    });

    if (existingEscrow) {
      throw new BadRequestException('Escrow already exists for this auction');
    }

    // Calculate fees
    const escrowFee = request.amount * this.escrowFeePercent;
    const processingFee = request.amount * this.processingFeePercent;

    // Create escrow transaction
    const escrow = await this.prisma.escrowTransaction.create({
      data: {
        auctionId: request.auctionId,
        buyerId: request.buyerId,
        sellerId: request.sellerId,
        amount: request.amount,
        transactionRef: request.transactionRef,
        paymentMethod: request.paymentMethod,
        escrowFee,
        processingFee,
        status: EscrowStatus.HELD,
      },
    });

    // Log escrow hold
    await this.auditService.logActivity({
      userId: request.buyerId,
      action: 'ESCROW_HOLD_CREATED',
      resource: 'escrow',
      resourceId: escrow.id,
      category: 'system',
      severity: 'high',
      metadata: {
        auctionId: request.auctionId,
        amount: request.amount,
        escrowFee,
        processingFee,
      },
    });

    this.logger.log(`Escrow created: ${escrow.id} for auction ${request.auctionId}`);
    return escrow;
  }

  async releaseEscrow(request: EscrowReleaseRequest): Promise<any> {
    const escrow = await this.prisma.escrowTransaction.findUnique({
      where: { id: request.escrowId },
    });

    if (!escrow) {
      throw new BadRequestException('Escrow transaction not found');
    }

    if (escrow.status !== EscrowStatus.HELD) {
      throw new BadRequestException('Escrow is not in held status');
    }

    // Determine release amounts
    let buyerAmount = 0;
    let sellerAmount = 0;

    switch (request.releaseTo) {
      case 'buyer':
        buyerAmount = escrow.amount - escrow.escrowFee - escrow.processingFee;
        break;
      case 'seller':
        sellerAmount = escrow.amount - escrow.escrowFee - escrow.processingFee;
        break;
      case 'split':
        buyerAmount = request.buyerAmount || 0;
        sellerAmount = request.sellerAmount || 0;
        if (buyerAmount + sellerAmount > escrow.amount) {
          throw new BadRequestException('Split amounts exceed escrow amount');
        }
        break;
    }

    // Determine new status
    let newStatus: EscrowStatus;
    switch (request.releaseTo) {
      case 'buyer':
        newStatus = EscrowStatus.RELEASED_TO_BUYER;
        break;
      case 'seller':
        newStatus = EscrowStatus.RELEASED_TO_SELLER;
        break;
      case 'split':
        newStatus = EscrowStatus.PARTIAL_RELEASE;
        break;
    }

    // Update escrow
    const updatedEscrow = await this.prisma.escrowTransaction.update({
      where: { id: request.escrowId },
      data: {
        status: newStatus,
        releasedAt: new Date(),
        releasedBy: 'system', // In real implementation, get from auth
        releaseReason: request.releaseReason,
        releaseNotes: request.releaseNotes,
        disputeId: request.disputeId,
      },
    });

    // Handle wallet transfers
    if (buyerAmount > 0) {
      await this.transferToWallet(escrow.buyerId, buyerAmount, `Escrow release: ${request.releaseReason}`);
    }

    if (sellerAmount > 0) {
      await this.transferToWallet(escrow.sellerId, sellerAmount, `Escrow release: ${request.releaseReason}`);
    }

    // Process fees (platform revenue)
    const totalFees = escrow.escrowFee + escrow.processingFee;
    if (totalFees > 0) {
      await this.processPlatformFees(totalFees, escrow.id);
    }

    // Log escrow release
    await this.auditService.logActivity({
      userId: escrow.buyerId,
      action: 'ESCROW_RELEASED',
      resource: 'escrow',
      resourceId: request.escrowId,
      category: 'system',
      severity: 'high',
      metadata: {
        releaseTo: request.releaseTo,
        buyerAmount,
        sellerAmount,
        releaseReason: request.releaseReason,
        disputeId: request.disputeId,
      },
    });

    this.logger.log(`Escrow ${request.escrowId} released: ${request.releaseTo}`);
    return updatedEscrow;
  }

  async settleAuctionEscrow(request: EscrowSettlementRequest): Promise<any> {
    const { auctionId, deliveryConfirmed, deliveryNotes, settlementType = 'auto' } = request;

    // Find escrow for this auction
    const escrow = await this.prisma.escrowTransaction.findFirst({
      where: {
        auctionId,
        status: EscrowStatus.HELD,
      },
    });

    if (!escrow) {
      throw new BadRequestException('No active escrow found for this auction');
    }

    if (!deliveryConfirmed) {
      // If delivery not confirmed, hold for dispute resolution
      await this.prisma.escrowTransaction.update({
        where: { id: escrow.id },
        data: {
          status: EscrowStatus.DISPUTED,
          disputedAt: new Date(),
        },
      });

      this.logger.log(`Escrow ${escrow.id} marked as disputed - delivery not confirmed`);
      return { status: 'held_for_dispute', escrowId: escrow.id };
    }

    // Auto-release to seller if delivery confirmed
    const releaseRequest: EscrowReleaseRequest = {
      escrowId: escrow.id,
      releaseTo: 'seller',
      releaseReason: `Auto-settlement: Delivery confirmed${deliveryNotes ? ` - ${deliveryNotes}` : ''}`,
      releaseNotes: deliveryNotes,
    };

    const result = await this.releaseEscrow(releaseRequest);

    this.logger.log(`Escrow ${escrow.id} auto-released to seller after delivery confirmation`);
    return {
      status: 'settled',
      escrowId: escrow.id,
      amountReleased: escrow.amount - escrow.escrowFee - escrow.processingFee,
      settlementType,
    };
  }

  async getEscrowStatus(auctionId: string): Promise<any> {
    const escrow = await this.prisma.escrowTransaction.findFirst({
      where: { auctionId },
      orderBy: { createdAt: 'desc' },
    });

    if (!escrow) {
      return { status: 'not_found' };
    }

    return {
      escrowId: escrow.id,
      status: escrow.status,
      amount: escrow.amount,
      heldAt: escrow.heldAt,
      releasedAt: escrow.releasedAt,
      escrowFee: escrow.escrowFee,
      processingFee: escrow.processingFee,
      disputeId: escrow.disputeId,
    };
  }

  async getUserEscrowHistory(userId: string): Promise<any[]> {
    const escrows = await this.prisma.escrowTransaction.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: userId },
        ],
      },
      include: {
        dispute: {
          select: {
            id: true,
            disputeType: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return escrows.map(escrow => ({
      id: escrow.id,
      auctionId: escrow.auctionId,
      role: escrow.buyerId === userId ? 'buyer' : 'seller',
      amount: escrow.amount,
      status: escrow.status,
      heldAt: escrow.heldAt,
      releasedAt: escrow.releasedAt,
      escrowFee: escrow.escrowFee,
      processingFee: escrow.processingFee,
      disputeId: escrow.disputeId,
      disputeType: escrow.dispute?.disputeType,
      disputeStatus: escrow.dispute?.status,
    }));
  }

  async getEscrowStatistics(): Promise<{
    totalEscrows: number;
    activeEscrows: number;
    releasedEscrows: number;
    disputedEscrows: number;
    totalValue: number;
    platformRevenue: number;
    averageSettlementTime: number;
  }> {
    // Mock statistics - would aggregate from database
    return {
      totalEscrows: 2450,
      activeEscrows: 120,
      releasedEscrows: 2280,
      disputedEscrows: 50,
      totalValue: 85000000, // ₹8.5 crore
      platformRevenue: 850000, // ₹8.5 lakh
      averageSettlementTime: 2.3, // days
    };
  }

  // Private helper methods
  private async transferToWallet(userId: string, amount: number, description: string): Promise<void> {
    // In real implementation, this would call the wallet service
    // For now, simulate wallet transfer
    this.logger.log(`Transferring ₹${amount} to wallet ${userId}: ${description}`);
  }

  private async processPlatformFees(amount: number, escrowId: string): Promise<void> {
    // Process platform fees as revenue
    this.logger.log(`Platform fees ₹${amount} processed from escrow ${escrowId}`);
  }
}
