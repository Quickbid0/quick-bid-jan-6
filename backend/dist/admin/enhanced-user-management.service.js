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
exports.EnhancedUserManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
let EnhancedUserManagementService = class EnhancedUserManagementService {
    constructor(prismaService, aiService) {
        this.prismaService = prismaService;
        this.aiService = aiService;
    }
    async getUserAnalytics() {
        const now = new Date();
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const totalUsers = await this.prismaService.user.count();
        const activeUsers = await this.prismaService.user.count({
            where: { status: 'ACTIVE' }
        });
        const suspendedUsers = await this.prismaService.user.count({
            where: { status: 'SUSPENDED' }
        });
        const newUsersThisMonth = await this.prismaService.user.count({
            where: { createdAt: { gte: monthAgo } }
        });
        const userRetentionRate = 78.5;
        const averageSessionDuration = 25.3;
        const topUserLocations = [
            { country: 'India', count: 1250 },
            { country: 'United States', count: 340 },
            { country: 'United Kingdom', count: 180 },
            { country: 'Germany', count: 95 },
            { country: 'Canada', count: 75 },
        ];
        const userEngagementMetrics = {
            averageBidsPerUser: 12.4,
            averageAuctionsWon: 2.1,
            conversionRate: 68.5,
        };
        return {
            totalUsers,
            activeUsers,
            suspendedUsers,
            newUsersThisMonth,
            userRetentionRate,
            averageSessionDuration,
            topUserLocations,
            userEngagementMetrics,
        };
    }
    async getUsersWithFilters(filters) {
        const { search, role, status, registrationDateFrom, registrationDateTo, lastLoginFrom, lastLoginTo, sortBy = 'registrationDate', sortOrder = 'desc', page = 1, limit = 20, } = filters;
        const where = {};
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (role) {
            where.role = role;
        }
        if (status) {
            where.status = status;
        }
        if (registrationDateFrom || registrationDateTo) {
            where.createdAt = {};
            if (registrationDateFrom)
                where.createdAt.gte = registrationDateFrom;
            if (registrationDateTo)
                where.createdAt.lte = registrationDateTo;
        }
        const orderBy = {};
        orderBy[sortBy] = sortOrder;
        const [users, total] = await Promise.all([
            this.prismaService.user.findMany({
                where,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    status: true,
                    emailVerified: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            this.prismaService.user.count({ where }),
        ]);
        const enhancedUsers = users.map(user => ({
            ...user,
            riskScore: Math.floor(Math.random() * 100),
            accountAge: Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
            engagementScore: Math.floor(Math.random() * 100),
        }));
        return {
            users: enhancedUsers,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async performBulkUserOperation(operation) {
        const { operation: op, userIds, parameters, reason, adminId } = operation;
        let processed = 0;
        let failed = 0;
        const errors = [];
        for (const userId of userIds) {
            try {
                switch (op) {
                    case 'suspend':
                        await this.suspendUser(userId, adminId, reason);
                        break;
                    case 'activate':
                        await this.activateUser(userId, adminId);
                        break;
                    case 'delete':
                        await this.deleteUser(userId, adminId, reason);
                        break;
                    case 'change_role':
                        await this.changeUserRole(userId, parameters?.newRole, adminId);
                        break;
                    case 'send_notification':
                        await this.sendUserNotification(userId, parameters?.message, adminId);
                        break;
                    default:
                        throw new common_1.BadRequestException(`Unknown operation: ${op}`);
                }
                processed++;
            }
            catch (error) {
                failed++;
                errors.push(`User ${userId}: ${error.message}`);
            }
        }
        this.logBulkOperation(adminId, op, processed, failed, userIds.length);
        return {
            success: failed === 0,
            processed,
            failed,
            errors,
        };
    }
    async suspendUser(userId, adminId, reason) {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.prismaService.user.update({
            where: { id: userId },
            data: { status: 'SUSPENDED' }
        });
        this.logUserAction(adminId, 'suspend_user', userId, { reason });
    }
    async activateUser(userId, adminId) {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.prismaService.user.update({
            where: { id: userId },
            data: { status: 'ACTIVE' }
        });
        this.logUserAction(adminId, 'activate_user', userId);
    }
    async deleteUser(userId, adminId, reason) {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.prismaService.user.update({
            where: { id: userId },
            data: { status: 'DELETED' }
        });
        this.logUserAction(adminId, 'delete_user', userId, { reason });
    }
    async changeUserRole(userId, newRole, adminId) {
        if (!['ADMIN', 'SELLER', 'BUYER'].includes(newRole)) {
            throw new common_1.BadRequestException('Invalid role');
        }
        const user = await this.prismaService.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        await this.prismaService.user.update({
            where: { id: userId },
            data: { role: newRole }
        });
        this.logUserAction(adminId, 'change_role', userId, { oldRole: user.role, newRole });
    }
    async getUserDetails(userId) {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const userActivity = await this.getUserActivity(userId);
        const riskAssessment = await this.aiService.detectFraud({
            auctionId: 'sample',
            userId,
            amount: 1000,
            userHistory: userActivity,
            auctionHistory: {},
        });
        return {
            ...user,
            activity: userActivity,
            riskAssessment,
            accountAge: Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
        };
    }
    async sendUserNotification(userId, message, adminId) {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        console.log(`Sending notification to user ${userId}: ${message}`);
        this.logUserAction(adminId, 'send_notification', userId, { message });
    }
    async getUserActivity(userId) {
        return {
            totalBids: Math.floor(Math.random() * 50) + 5,
            auctionsWon: Math.floor(Math.random() * 5),
            totalSpent: Math.floor(Math.random() * 10000) + 1000,
            lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            accountAgeDays: Math.floor(Math.random() * 365) + 30,
            suspiciousLocations: Math.random() > 0.8,
            recentBids: Math.floor(Math.random() * 20),
        };
    }
    logUserAction(adminId, action, targetUserId, metadata) {
        console.log(`[USER ACTION] Admin ${adminId} performed ${action} on user ${targetUserId}`, metadata);
    }
    logBulkOperation(adminId, operation, processed, failed, total) {
        console.log(`[BULK OPERATION] Admin ${adminId} performed ${operation} on ${total} users (${processed} successful, ${failed} failed)`);
    }
};
exports.EnhancedUserManagementService = EnhancedUserManagementService;
exports.EnhancedUserManagementService = EnhancedUserManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AIService])
], EnhancedUserManagementService);
//# sourceMappingURL=enhanced-user-management.service.js.map