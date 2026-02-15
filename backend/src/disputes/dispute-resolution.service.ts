import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  Dispute,
  DisputeType,
  DisputeStatus,
  DisputePriority,
  DisputeResolution,
  EscrowStatus,
  ArbitrationStatus,
  ArbitrationDecision,
  Prisma,
} from '@prisma/client';

export interface CreateDisputeData {
  auctionId: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  disputeType: DisputeType;
  title: string;
  description: string;
  evidence: string[];
  priority?: DisputePriority;
}

export interface DisputeAnalysisResult {
  aiAnalysis: string;
  aiRecommendation: DisputeResolution;
  aiConfidence: number;
  suggestedPriority: DisputePriority;
  requiresEscrowHold: boolean;
  requiresArbitration: boolean;
  estimatedResolutionTime: string;
}

export interface EscrowHoldData {
  auctionId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  holdReason: string;
  disputeId?: string;
}

export interface ArbitrationCaseData {
  disputeId: string;
  arbitratorId?: string;
  hearingDate?: Date;
  virtualHearing?: boolean;
  hearingNotes?: string;
}

@Injectable()
export class DisputeResolutionService {
  private readonly logger = new Logger(DisputeResolutionService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async createDispute(disputeData: CreateDisputeData): Promise<Dispute> {
    this.logger.log(`Creating dispute for auction ${disputeData.auctionId}`);

    // Verify the dispute involves valid participants
    await this.validateDisputeParticipants(disputeData);

    // Check for existing active disputes
    const existingDispute = await this.prisma.dispute.findFirst({
      where: {
        auctionId: disputeData.auctionId,
        buyerId: disputeData.buyerId,
        sellerId: disputeData.sellerId,
        status: {
          in: [
            DisputeStatus.PENDING_REVIEW,
            DisputeStatus.UNDER_INVESTIGATION,
            DisputeStatus.AI_REVIEW_PENDING,
            DisputeStatus.ESCALATED_TO_ADMIN,
            DisputeStatus.ARBITRATION_SCHEDULED,
          ],
        },
      },
    });

    if (existingDispute) {
      throw new BadRequestException('An active dispute already exists for this auction');
    }

    // Determine initial priority based on dispute type
    const priority = disputeData.priority || this.calculateInitialPriority(disputeData.disputeType);

    // Create the dispute
    const dispute = await this.prisma.dispute.create({
      data: {
        auctionId: disputeData.auctionId,
        productId: disputeData.productId,
        buyerId: disputeData.buyerId,
        sellerId: disputeData.sellerId,
        disputeType: disputeData.disputeType,
        title: disputeData.title,
        description: disputeData.description,
        evidence: disputeData.evidence,
        priority,
        status: DisputeStatus.PENDING_REVIEW,
      },
    });

    // Trigger AI analysis
    setTimeout(() => this.performAIAnalysis(dispute.id), 1000);

    // Log dispute creation
    await this.auditService.logActivity({
      userId: disputeData.buyerId,
      action: 'DISPUTE_CREATED',
      resource: 'dispute',
      resourceId: dispute.id,
      category: 'user',
      severity: priority === DisputePriority.CRITICAL ? 'high' : 'medium',
      metadata: {
        disputeType: disputeData.disputeType,
        auctionId: disputeData.auctionId,
        priority,
      },
    });

    this.logger.log(`Dispute created: ${dispute.id} with priority ${priority}`);
    return dispute;
  }

  async getDispute(disputeId: string, userId?: string): Promise<Dispute | null> {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        // Include related data as needed
      },
    });

    if (!dispute) return null;

    // Check if user has access to this dispute
    if (userId && dispute.buyerId !== userId && dispute.sellerId !== userId) {
      // In a real implementation, check admin roles
      return null;
    }

    return dispute;
  }

  async getUserDisputes(userId: string): Promise<Dispute[]> {
    return this.prisma.dispute.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: userId },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async analyzeDispute(disputeId: string): Promise<DisputeAnalysisResult> {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new BadRequestException('Dispute not found');
    }

    // Perform AI analysis (simulated)
    const analysis = await this.performAIAnalysis(disputeId);

    // Update dispute with AI analysis
    await this.prisma.dispute.update({
      where: { id: disputeId },
      data: {
        aiAnalysis: analysis.aiAnalysis,
        aiRecommendation: analysis.aiRecommendation,
        aiConfidence: analysis.aiConfidence,
        status: analysis.requiresArbitration
          ? DisputeStatus.ARBITRATION_SCHEDULED
          : DisputeStatus.UNDER_INVESTIGATION,
      },
    });

    return analysis;
  }

  async holdInEscrow(escrowData: EscrowHoldData): Promise<any> {
    this.logger.log(`Holding ₹${escrowData.amount} in escrow for auction ${escrowData.auctionId}`);

    // Create escrow hold
    const escrowHold = await this.prisma.escrowHold.create({
      data: {
        auctionId: escrowData.auctionId,
        buyerId: escrowData.buyerId,
        sellerId: escrowData.sellerId,
        amount: escrowData.amount,
        holdReason: escrowData.holdReason,
        disputeId: escrowData.disputeId,
        status: EscrowStatus.ACTIVE,
      },
    });

    // Log escrow hold
    await this.auditService.logActivity({
      userId: escrowData.buyerId,
      action: 'ESCROW_HOLD_CREATED',
      resource: 'escrow',
      resourceId: escrowHold.id,
      category: 'system',
      severity: 'high',
      metadata: {
        amount: escrowData.amount,
        reason: escrowData.holdReason,
        disputeId: escrowData.disputeId,
      },
    });

    return escrowHold;
  }

  async releaseEscrow(
    escrowId: string,
    releaseTo: 'buyer' | 'seller' | 'split',
    releaseNotes: string,
    releasedBy: string,
    buyerAmount?: number,
    sellerAmount?: number
  ): Promise<any> {
    const escrowHold = await this.prisma.escrowHold.findUnique({
      where: { id: escrowId },
    });

    if (!escrowHold || escrowHold.status !== EscrowStatus.ACTIVE) {
      throw new BadRequestException('Invalid escrow hold');
    }

    let status: EscrowStatus;
    switch (releaseTo) {
      case 'buyer':
        status = EscrowStatus.RELEASED_TO_BUYER;
        break;
      case 'seller':
        status = EscrowStatus.RELEASED_TO_SELLER;
        break;
      case 'split':
        status = EscrowStatus.PARTIAL_RELEASE;
        break;
    }

    // Update escrow hold
    const updatedEscrow = await this.prisma.escrowHold.update({
      where: { id: escrowId },
      data: {
        status,
        releaseDate: new Date(),
        releasedBy,
        releaseNotes,
      },
    });

    // Log escrow release
    await this.auditService.logActivity({
      userId: releasedBy,
      action: 'ESCROW_RELEASED',
      resource: 'escrow',
      resourceId: escrowId,
      category: 'system',
      severity: 'high',
      metadata: {
        releaseTo,
        buyerAmount,
        sellerAmount,
        releaseNotes,
      },
    });

    return updatedEscrow;
  }

  async createArbitrationCase(arbitrationData: ArbitrationCaseData): Promise<any> {
    // Verify dispute exists and is eligible for arbitration
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: arbitrationData.disputeId },
    });

    if (!dispute) {
      throw new BadRequestException('Dispute not found');
    }

    if (dispute.status !== DisputeStatus.ARBITRATION_SCHEDULED) {
      throw new BadRequestException('Dispute is not eligible for arbitration');
    }

    // Create arbitration case
    const arbitrationCase = await this.prisma.arbitrationCase.create({
      data: {
        disputeId: arbitrationData.disputeId,
        arbitratorId: arbitrationData.arbitratorId,
        assignedAt: arbitrationData.arbitratorId ? new Date() : null,
        hearingDate: arbitrationData.hearingDate,
        hearingNotes: arbitrationData.hearingNotes,
        virtualHearing: arbitrationData.virtualHearing ?? true,
        status: arbitrationData.arbitratorId ? ArbitrationStatus.ASSIGNED : ArbitrationStatus.PENDING,
        deadline: arbitrationData.hearingDate
          ? new Date(arbitrationData.hearingDate.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
          : null,
      },
    });

    // Update dispute status
    await this.prisma.dispute.update({
      where: { id: arbitrationData.disputeId },
      data: {
        status: DisputeStatus.ARBITRATION_SCHEDULED,
      },
    });

    // Log arbitration case creation
    await this.auditService.logActivity({
      userId: arbitrationData.arbitratorId || 'system',
      action: 'ARBITRATION_CASE_CREATED',
      resource: 'arbitration',
      resourceId: arbitrationCase.id,
      category: 'system',
      severity: 'high',
      metadata: {
        disputeId: arbitrationData.disputeId,
        arbitratorId: arbitrationData.arbitratorId,
        hearingDate: arbitrationData.hearingDate,
      },
    });

    return arbitrationCase;
  }

  async resolveDispute(
    disputeId: string,
    resolution: DisputeResolution,
    resolutionNotes: string,
    resolvedBy: string,
    refundAmount?: number,
    penaltyAmount?: number
  ): Promise<Dispute> {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new BadRequestException('Dispute not found');
    }

    // Update dispute resolution
    const resolvedDispute = await this.prisma.dispute.update({
      where: { id: disputeId },
      data: {
        resolution,
        resolutionNotes,
        resolvedBy,
        resolvedAt: new Date(),
        status: DisputeStatus.RESOLVED,
        refundAmount,
        penaltyAmount,
      },
    });

    // Log dispute resolution
    await this.auditService.logActivity({
      userId: resolvedBy,
      action: 'DISPUTE_RESOLVED',
      resource: 'dispute',
      resourceId: disputeId,
      category: 'system',
      severity: 'high',
      metadata: {
        resolution,
        refundAmount,
        penaltyAmount,
        resolutionNotes,
      },
    });

    // Handle escrow release based on resolution
    if (resolution === DisputeResolution.BUYER_REFUND) {
      await this.handleEscrowRelease(disputeId, 'buyer', resolvedBy);
    } else if (resolution === DisputeResolution.SELLER_COMPENSATION) {
      await this.handleEscrowRelease(disputeId, 'seller', resolvedBy);
    }

    this.logger.log(`Dispute ${disputeId} resolved with ${resolution}`);
    return resolvedDispute;
  }

  async getDisputeStatistics(): Promise<{
    totalDisputes: number;
    resolvedDisputes: number;
    pendingDisputes: number;
    averageResolutionTime: number;
    resolutionBreakdown: Record<DisputeResolution, number>;
    disputeTypeBreakdown: Record<DisputeType, number>;
  }> {
    // Mock statistics - would aggregate from database
    return {
      totalDisputes: 245,
      resolvedDisputes: 198,
      pendingDisputes: 47,
      averageResolutionTime: 7.3, // days
      resolutionBreakdown: {
        [DisputeResolution.BUYER_REFUND]: 45,
        [DisputeResolution.PARTIAL_REFUND]: 23,
        [DisputeResolution.MEDIATED_SETTLEMENT]: 67,
        [DisputeResolution.DISMISSED]: 34,
        [DisputeResolution.ARBITRATION_DECISION]: 12,
        [DisputeResolution.SELLER_COMPENSATION]: 8,
        [DisputeResolution.PRODUCT_RETURN]: 5,
        [DisputeResolution.EXCHANGE_OFFERED]: 3,
        [DisputeResolution.ESCALATED]: 1,
      },
      disputeTypeBreakdown: {
        [DisputeType.PRODUCT_CONDITION]: 98,
        [DisputeType.DELIVERY_ISSUE]: 67,
        [DisputeType.PAYMENT_DISPUTE]: 34,
        [DisputeType.FRAUD_SUSPICION]: 23,
        [DisputeType.CONTRACT_BREACH]: 12,
        [DisputeType.INSPECTION_DISCREPANCY]: 8,
        [DisputeType.OTHER]: 3,
      },
    };
  }

  // Private helper methods
  private async validateDisputeParticipants(disputeData: CreateDisputeData): Promise<void> {
    // Verify auction exists and participants are correct
    // This would validate against auction records in a real implementation
    if (disputeData.buyerId === disputeData.sellerId) {
      throw new BadRequestException('Buyer and seller cannot be the same');
    }
  }

  private calculateInitialPriority(disputeType: DisputeType): DisputePriority {
    switch (disputeType) {
      case DisputeType.FRAUD_SUSPICION:
      case DisputeType.CONTRACT_BREACH:
        return DisputePriority.CRITICAL;
      case DisputeType.PAYMENT_DISPUTE:
      case DisputeType.DELIVERY_ISSUE:
        return DisputePriority.HIGH;
      case DisputeType.PRODUCT_CONDITION:
      case DisputeType.INSPECTION_DISCREPANCY:
        return DisputePriority.MEDIUM;
      default:
        return DisputePriority.LOW;
    }
  }

  private async performAIAnalysis(disputeId: string): Promise<DisputeAnalysisResult> {
    // Simulated AI analysis
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new BadRequestException('Dispute not found');
    }

    // Simulate AI analysis based on dispute type
    let aiRecommendation: DisputeResolution;
    let confidence: number;
    let requiresEscrowHold = false;
    let requiresArbitration = false;
    let estimatedResolutionTime: string;

    switch (dispute.disputeType) {
      case DisputeType.FRAUD_SUSPICION:
        aiRecommendation = DisputeResolution.BUYER_REFUND;
        confidence = 0.85;
        requiresEscrowHold = true;
        requiresArbitration = true;
        estimatedResolutionTime = '10-15 days';
        break;
      case DisputeType.PRODUCT_CONDITION:
        aiRecommendation = DisputeResolution.MEDIATED_SETTLEMENT;
        confidence = 0.72;
        requiresEscrowHold = false;
        requiresArbitration = false;
        estimatedResolutionTime = '3-5 days';
        break;
      case DisputeType.PAYMENT_DISPUTE:
        aiRecommendation = DisputeResolution.DISMISSED;
        confidence = 0.68;
        requiresEscrowHold = false;
        requiresArbitration = false;
        estimatedResolutionTime = '1-2 days';
        break;
      default:
        aiRecommendation = DisputeResolution.ESCALATED;
        confidence = 0.55;
        requiresEscrowHold = false;
        requiresArbitration = false;
        estimatedResolutionTime = '5-7 days';
    }

    const aiAnalysis = `AI Analysis for dispute ${disputeId}:
- Dispute Type: ${dispute.disputeType}
- Evidence Quality: ${dispute.evidence.length > 0 ? 'Good' : 'Limited'}
- Urgency Level: ${dispute.priority}
- Recommended Action: ${aiRecommendation}
- Confidence: ${(confidence * 100).toFixed(1)}%
- Estimated Resolution: ${estimatedResolutionTime}`;

    return {
      aiAnalysis,
      aiRecommendation,
      aiConfidence: confidence,
      suggestedPriority: dispute.priority,
      requiresEscrowHold,
      requiresArbitration,
      estimatedResolutionTime,
    };
  }

  private async handleEscrowRelease(
    disputeId: string,
    releaseTo: 'buyer' | 'seller',
    releasedBy: string
  ): Promise<void> {
    // Find escrow hold for this dispute
    const escrowHold = await this.prisma.escrowHold.findFirst({
      where: { disputeId },
    });

    if (escrowHold) {
      await this.releaseEscrow(
        escrowHold.id,
        releaseTo,
        `Released due to dispute resolution`,
        releasedBy
      );
    }
  }
}
