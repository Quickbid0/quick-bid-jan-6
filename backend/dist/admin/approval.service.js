"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
let ApprovalService = class ApprovalService {
    constructor(prismaService, aiService) {
        this.prismaService = prismaService;
        this.aiService = aiService;
    }
    async createApprovalRequest(requestData) {
        const { type, entityId, submittedBy, priority = 'medium', metadata = {} } = requestData;
        await this.validateEntityExists(type, entityId);
        const aiRecommendation = await this.getAIRecommendation(type, entityId);
        let initialStatus = 'pending';
        let initialPriority = priority;
        if (aiRecommendation.shouldApprove && aiRecommendation.confidence > 85) {
            initialStatus = 'approved';
        }
        else if (aiRecommendation.confidence < 30) {
            initialStatus = 'under_review';
            initialPriority = 'high';
        }
        const approvalRequest = {
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
        this.storeApprovalRequest(approvalRequest);
        if (initialStatus === 'approved') {
            await this.executeApproval(approvalRequest.id, 'system', 'Auto-approved by AI');
        }
        return approvalRequest;
    }
    async reviewApprovalRequest(approvalId, reviewerId, action, notes) {
        const approvalRequest = await this.getApprovalRequest(approvalId);
        if (!approvalRequest) {
            throw new common_1.NotFoundException('Approval request not found');
        }
        if (approvalRequest.status !== 'pending' && approvalRequest.status !== 'under_review') {
            throw new common_1.BadRequestException('Approval request has already been processed');
        }
        approvalRequest.status = action === 'approve' ? 'approved' : 'rejected';
        approvalRequest.reviewedBy = reviewerId;
        approvalRequest.reviewedAt = new Date();
        approvalRequest.reviewNotes = notes;
        this.updateApprovalRequest(approvalRequest);
        if (action === 'approve') {
            await this.executeApproval(approvalId, reviewerId, notes);
        }
        else if (action === 'reject') {
            await this.executeRejection(approvalId, reviewerId, notes);
        }
        return {
            success: true,
            message: `Approval request ${action}d successfully`
        };
    }
    async getPendingApprovals(filters) {
        const mockApprovals = [
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
    async getApprovalWorkflows() {
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
    async validateEntityExists(type, entityId) {
        switch (type) {
            case 'user_registration':
                const user = await this.prismaService.user.findUnique({ where: { id: entityId } });
                if (!user)
                    throw new common_1.NotFoundException('User not found');
                break;
            case 'auction_request':
                const auction = await this.prismaService.auction.findUnique({ where: { id: entityId } });
                if (!auction)
                    throw new common_1.NotFoundException('Auction not found');
                break;
            case 'product_listing':
                break;
            case 'seller_verification':
                break;
        }
    }
    async getAIRecommendation(type, entityId) {
        switch (type) {
            case 'user_registration':
                return { shouldApprove: true, confidence: 80 };
            case 'auction_request':
                const auction = await this.prismaService.auction.findUnique({ where: { id: entityId } });
                if (!auction)
                    return { shouldApprove: false, confidence: 0 };
                const moderation = await this.aiService.moderateContent({
                    title: auction.title,
                    description: '',
                    category: 'General',
                    price: Number(auction.startPrice),
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
    async executeApproval(approvalId, reviewerId, notes) {
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
    async executeRejection(approvalId, reviewerId, notes) {
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
    async approveUserRegistration(userId, reviewerId) {
        await this.prismaService.user.update({
            where: { id: userId },
            data: { status: 'ACTIVE' }
        });
    }
    async approveAuction(auctionId, reviewerId) {
        await this.prismaService.auction.update({
            where: { id: auctionId },
            data: { status: 'scheduled' }
        });
    }
    async approveProductListing(productId, reviewerId) {
    }
    async approveSellerVerification(sellerId, reviewerId) {
    }
    async rejectUserRegistration(userId, reviewerId, reason) {
        await this.prismaService.user.update({
            where: { id: userId },
            data: { status: 'REJECTED' }
        });
    }
    async rejectAuction(auctionId, reviewerId, reason) {
        await this.prismaService.auction.update({
            where: { id: auctionId },
            data: { status: 'rejected' }
        });
    }
    generateApprovalId() {
        return `apr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    storeApprovalRequest(request) {
        console.log('Storing approval request:', request.id);
    }
    updateApprovalRequest(request) {
        console.log('Updating approval request:', request.id);
    }
    async getApprovalRequest(approvalId) {
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
};
exports.ApprovalService = ApprovalService;
exports.ApprovalService = ApprovalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AIService])
], ApprovalService);
//# sourceMappingURL=approval.service.js.map