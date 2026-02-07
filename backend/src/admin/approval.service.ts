import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auction, AuctionStatus } from '../auctions/auction.entity';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from '../ai/ai.service';

export interface ApprovalRequest {
  id: string;
  type: 'user_registration' | 'product_listing' | 'auction_request' | 'seller_verification';
  entityId: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  submittedBy: string;
  submittedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata: Record<string, any>;
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  type: ApprovalRequest['type'];
  steps: ApprovalStep[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalStep {
  id: string;
  name: string;
  order: number;
  requiredApprovers: number;
  approverRoles: string[];
  autoApprovalRules?: {
    condition: string;
    action: 'approve' | 'reject' | 'escalate';
  };
  timeoutHours: number;
}

@Injectable()
export class ApprovalService {
  constructor(
    @InjectRepository(Auction)
    private auctionRepository: Repository<Auction>,
    private prismaService: PrismaService,
    private aiService: AIService,
  ) {}

  async createApprovalRequest(requestData: {
    type: ApprovalRequest['type'];
    entityId: string;
    submittedBy: string;
    priority?: ApprovalRequest['priority'];
    metadata?: Record<string, any>;
  }): Promise<ApprovalRequest> {
    const { type, entityId, submittedBy, priority = 'medium', metadata = {} } = requestData;

    // Validate the entity exists based on type
    await this.validateEntityExists(type, entityId);

    // Get AI recommendations for auto-approval
    const aiRecommendation = await this.getAIRecommendation(type, entityId);

    // Determine initial status based on AI confidence and rules
    let initialStatus: ApprovalRequest['status'] = 'pending';
    let initialPriority = priority;

    if (aiRecommendation.shouldApprove && aiRecommendation.confidence > 85) {
      initialStatus = 'approved';
    } else if (aiRecommendation.confidence < 30) {
      initialStatus = 'under_review';
      initialPriority = 'high';
    }

    const approvalRequest: ApprovalRequest = {
      id: this.generateApprovalId(),
      type,
      entityId,
      status: initialStatus,
      submittedBy,
      submittedAt: new Date(),
      priority: initialPriority,
      metadata: {
        ...metadata,
        aiRecommendation,
        autoProcessed: initialStatus !== 'pending',
      },
    };

    // Store in database (mock implementation)
    this.storeApprovalRequest(approvalRequest);

    // If auto-approved, execute the approval
    if (initialStatus === 'approved') {
      await this.executeApproval(approvalRequest.id, 'system', 'Auto-approved by AI');
    }

    return approvalRequest;
  }

  async reviewApprovalRequest(
    approvalId: string,
    reviewerId: string,
    action: 'approve' | 'reject' | 'escalate',
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    const approvalRequest = await this.getApprovalRequest(approvalId);
    if (!approvalRequest) {
      throw new NotFoundException('Approval request not found');
    }

    if (approvalRequest.status !== 'pending' && approvalRequest.status !== 'under_review') {
      throw new BadRequestException('Approval request has already been processed');
    }

    approvalRequest.status = action === 'approve' ? 'approved' : 'rejected';
    approvalRequest.reviewedBy = reviewerId;
    approvalRequest.reviewedAt = new Date();
    approvalRequest.reviewNotes = notes;

    // Update in database
    this.updateApprovalRequest(approvalRequest);

    // Execute the approval or rejection
    if (action === 'approve') {
      await this.executeApproval(approvalId, reviewerId, notes);
    } else if (action === 'reject') {
      await this.executeRejection(approvalId, reviewerId, notes);
    }

    return {
      success: true,
      message: `Approval request ${action}d successfully`
    };
  }

  async getPendingApprovals(filters?: {
    type?: ApprovalRequest['type'];
    priority?: ApprovalRequest['priority'];
    limit?: number;
    offset?: number;
  }): Promise<{ approvals: ApprovalRequest[]; total: number }> {
    // Mock data - in real implementation, query database
    const mockApprovals: ApprovalRequest[] = [
      {
        id: 'apr_001',
        type: 'user_registration',
        entityId: 'user_123',
        status: 'pending',
        submittedBy: 'user_123',
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        priority: 'medium',
        metadata: { email: 'john@example.com' }
      },
      {
        id: 'apr_002',
        type: 'auction_request',
        entityId: 'auction_456',
        status: 'under_review',
        submittedBy: 'seller_789',
        submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        priority: 'high',
        metadata: { title: 'Vintage Watch Auction' }
      }
    ];

    const filteredApprovals = filters?.type
      ? mockApprovals.filter(approval => approval.type === filters.type)
      : mockApprovals;

    return {
      approvals: filteredApprovals.slice(filters?.offset || 0, (filters?.offset || 0) + (filters?.limit || 10)),
      total: filteredApprovals.length
    };
  }

  async getApprovalWorkflows(): Promise<ApprovalWorkflow[]> {
    // Mock workflows
    return [
      {
        id: 'wf_user_reg',
        name: 'User Registration Approval',
        type: 'user_registration',
        steps: [
          {
            id: 'step1',
            name: 'Initial Review',
            order: 1,
            requiredApprovers: 1,
            approverRoles: ['admin', 'moderator'],
            timeoutHours: 24,
          }
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'wf_auction',
        name: 'Auction Approval Workflow',
        type: 'auction_request',
        steps: [
          {
            id: 'step1',
            name: 'Content Review',
            order: 1,
            requiredApprovers: 1,
            approverRoles: ['moderator'],
            timeoutHours: 12,
          },
          {
            id: 'step2',
            name: 'Final Approval',
            order: 2,
            requiredApprovers: 1,
            approverRoles: ['admin'],
            timeoutHours: 24,
          }
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
  }

  private async validateEntityExists(type: ApprovalRequest['type'], entityId: string): Promise<void> {
    switch (type) {
      case 'user_registration':
        const user = await this.prismaService.user.findUnique({ where: { id: entityId } });
        if (!user) throw new NotFoundException('User not found');
        break;

      case 'auction_request':
        const auction = await this.auctionRepository.findOne({ where: { id: entityId } });
        if (!auction) throw new NotFoundException('Auction not found');
        break;

      case 'product_listing':
        // Would validate product exists
        break;

      case 'seller_verification':
        // Would validate seller exists
        break;
    }
  }

  private async getAIRecommendation(type: ApprovalRequest['type'], entityId: string): Promise<any> {
    switch (type) {
      case 'user_registration':
        // Basic user validation - check if email looks legitimate
        return { shouldApprove: true, confidence: 80 };

      case 'auction_request':
        const auction = await this.auctionRepository.findOne({ where: { id: entityId } });
        if (!auction) return { shouldApprove: false, confidence: 0 };

        // Use AI service to moderate content
        const moderation = await this.aiService.moderateContent({
          title: auction.title,
          description: auction.description || '',
          category: auction.category || 'General',
          price: Number(auction.startingPrice),
        });

        return {
          shouldApprove: moderation.shouldApprove,
          confidence: moderation.confidence,
          flags: moderation.flags,
        };

      default:
        return { shouldApprove: true, confidence: 70 };
    }
  }

  private async executeApproval(approvalId: string, reviewerId: string, notes?: string): Promise<void> {
    const approvalRequest = await this.getApprovalRequest(approvalId);

    switch (approvalRequest.type) {
      case 'user_registration':
        await this.approveUserRegistration(approvalRequest.entityId, reviewerId);
        break;

      case 'auction_request':
        await this.approveAuction(approvalRequest.entityId, reviewerId);
        break;

      case 'product_listing':
        await this.approveProductListing(approvalRequest.entityId, reviewerId);
        break;

      case 'seller_verification':
        await this.approveSellerVerification(approvalRequest.entityId, reviewerId);
        break;
    }
  }

  private async executeRejection(approvalId: string, reviewerId: string, notes?: string): Promise<void> {
    const approvalRequest = await this.getApprovalRequest(approvalId);

    switch (approvalRequest.type) {
      case 'user_registration':
        await this.rejectUserRegistration(approvalRequest.entityId, reviewerId, notes);
        break;

      case 'auction_request':
        await this.rejectAuction(approvalRequest.entityId, reviewerId, notes);
        break;
    }
  }

  private async approveUserRegistration(userId: string, reviewerId: string): Promise<void> {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' }
    });
  }

  private async approveAuction(auctionId: string, reviewerId: string): Promise<void> {
    await this.auctionRepository.update(auctionId, { status: 'scheduled' });
  }

  private async approveProductListing(productId: string, reviewerId: string): Promise<void> {
    // Would update product status to approved
  }

  private async approveSellerVerification(sellerId: string, reviewerId: string): Promise<void> {
    // Would update seller verification status
  }

  private async rejectUserRegistration(userId: string, reviewerId: string, reason?: string): Promise<void> {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { status: 'REJECTED' }
    });
  }

  private async rejectAuction(auctionId: string, reviewerId: string, reason?: string): Promise<void> {
    await this.auctionRepository.update(auctionId, { status: 'rejected' });
  }

  private generateApprovalId(): string {
    return `apr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Mock database methods - in real implementation, these would interact with actual database
  private storeApprovalRequest(request: ApprovalRequest): void {
    // Mock storage
    console.log('Storing approval request:', request.id);
  }

  private updateApprovalRequest(request: ApprovalRequest): void {
    // Mock update
    console.log('Updating approval request:', request.id);
  }

  private async getApprovalRequest(approvalId: string): Promise<ApprovalRequest | null> {
    // Mock retrieval
    return {
      id: approvalId,
      type: 'user_registration',
      entityId: 'user_123',
      status: 'pending',
      submittedBy: 'user_123',
      submittedAt: new Date(),
      priority: 'medium',
      metadata: {}
    };
  }
}
