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
export declare class ApprovalService {
    private prismaService;
    private aiService;
    constructor(prismaService: PrismaService, aiService: AIService);
    createApprovalRequest(requestData: {
        type: ApprovalRequest['type'];
        entityId: string;
        submittedBy: string;
        priority?: ApprovalRequest['priority'];
        metadata?: Record<string, any>;
    }): Promise<ApprovalRequest>;
    reviewApprovalRequest(approvalId: string, reviewerId: string, action: 'approve' | 'reject' | 'escalate', notes?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getPendingApprovals(filters?: {
        type?: ApprovalRequest['type'];
        priority?: ApprovalRequest['priority'];
        limit?: number;
        offset?: number;
    }): Promise<{
        approvals: ApprovalRequest[];
        total: number;
    }>;
    getApprovalWorkflows(): Promise<ApprovalWorkflow[]>;
    private validateEntityExists;
    private getAIRecommendation;
    private executeApproval;
    private executeRejection;
    private approveUserRegistration;
    private approveAuction;
    private approveProductListing;
    private approveSellerVerification;
    private rejectUserRegistration;
    private rejectAuction;
    private generateApprovalId;
    private storeApprovalRequest;
    private updateApprovalRequest;
    private getApprovalRequest;
}
