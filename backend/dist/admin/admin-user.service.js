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
exports.AdminUserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcrypt");
const observability_service_1 = require("../observability/observability.service");
let AdminUserService = class AdminUserService {
    constructor(prismaService, observabilityService) {
        this.prismaService = prismaService;
        this.observabilityService = observabilityService;
    }
    async createUser(createUserDto, adminId) {
        const { email, name, role, status = 'PENDING_VERIFICATION', sendInvite = false } = createUserDto;
        const existingUser = await this.prismaService.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (existingUser) {
            throw new common_1.ConflictException(`User with email ${email} already exists`);
        }
        const generatePassword = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
            let password = '';
            for (let i = 0; i < 12; i++) {
                password += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return password;
        };
        const password = generatePassword();
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        const user = await this.prismaService.user.create({
            data: {
                email: email.toLowerCase(),
                passwordHash,
                name,
                role,
                status,
                isActive: true,
                emailVerified: 'UNVERIFIED',
                verificationToken: this.generateVerificationToken(),
            }
        });
        await this.prismaService.profile.create({
            data: {
                userId: user.id,
                bio: `${role.charAt(0).toUpperCase() + role.slice(1)} account`,
                isVerified: false,
            }
        });
        await this.observabilityService.createAuditLog({
            userId: adminId,
            action: 'ADMIN_USER_CREATED',
            resource: 'USER',
            details: {
                targetUserId: user.id,
                targetEmail: user.email,
                targetRole: user.role,
                correlationId: this.observabilityService.generateCorrelationId(),
                severity: 'info',
                sendInvite,
            },
            correlationId: this.observabilityService.generateCorrelationId(),
            severity: 'info',
        });
        this.observabilityService.incrementAdminAction();
        if (sendInvite) {
            try {
                const subject = 'Welcome to QuickMela - Your Account Has Been Created';
                const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Welcome to QuickMela!</h2>
            <p>Dear ${name || 'User'},</p>
            <p>Your account has been successfully created by our admin team.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1f2937;">Account Details:</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</p>
              <p><strong>Temporary Password:</strong> <code style="background-color: #e5e7eb; padding: 2px 4px; border-radius: 4px;">${password}</code></p>
              <p style="color: #dc2626; font-weight: bold;">⚠️ Please change this password immediately after first login.</p>
            </div>
            <p>You can now:</p>
            <ul>
              <li>Log in to your account</li>
              <li>Complete your profile verification</li>
              <li>Start ${role === 'SELLER' ? 'listing products for auction' : 'bidding on exciting auctions'}</li>
            </ul>
            <p>If you have any questions, please contact our support team.</p>
            <p>Best regards,<br>The QuickMela Team</p>
          </div>
        `;
                console.log(`Invitation email prepared for ${email}: ${subject}`);
                await this.observabilityService.createAuditLog({
                    userId: adminId,
                    action: 'ADMIN_INVITATION_EMAIL_SENT',
                    resource: 'USER',
                    details: {
                        targetUserId: user.id,
                        targetEmail: user.email,
                        invitationSent: true,
                        correlationId: this.observabilityService.generateCorrelationId(),
                        severity: 'info',
                    },
                    correlationId: this.observabilityService.generateCorrelationId(),
                    severity: 'info',
                });
            }
            catch (error) {
                console.error(`Failed to send invitation email to ${email}:`, error);
            }
        }
        const { passwordHash: _, verificationToken, resetPasswordToken, resetTokenExpiry, ...userResult } = user;
        return userResult;
    }
    async listUsers(userListDto, adminId) {
        const { page = 1, limit = 50, search, role, status, isActive, } = userListDto;
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
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        const [users, total] = await Promise.all([
            this.prismaService.user.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    profiles: {
                        select: {
                            avatarUrl: true,
                            bio: true,
                            isVerified: true,
                        },
                    },
                },
            }),
            this.prismaService.user.count({ where }),
        ]);
        await this.observabilityService.createAuditLog({
            userId: adminId,
            action: 'ADMIN_USERS_LISTED',
            resource: 'USER',
            details: {
                filters: { page, limit, search, role, status, isActive },
                resultCount: users.length,
                correlationId: this.observabilityService.generateCorrelationId(),
                severity: 'info',
            },
            correlationId: this.observabilityService.generateCorrelationId(),
            severity: 'info',
        });
        return { users, total };
    }
    async updateUser(userId, updateUserDto, adminId) {
        const { status, isActive } = updateUserDto;
        const existingUser = await this.prismaService.user.findUnique({
            where: { id: userId },
        });
        if (!existingUser) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        if (existingUser.role === 'ADMIN') {
            throw new common_1.BadRequestException('Cannot modify admin users through this endpoint');
        }
        const updateData = {};
        if (status !== undefined) {
            updateData.status = status;
        }
        if (isActive !== undefined) {
            updateData.isActive = isActive;
        }
        const updatedUser = await this.prismaService.user.update({
            where: { id: userId },
            data: updateData,
        });
        await this.observabilityService.createAuditLog({
            userId: adminId,
            action: 'ADMIN_USER_UPDATED',
            resource: 'USER',
            details: {
                targetUserId: userId,
                targetEmail: existingUser.email,
                previousState: {
                    status: existingUser.status,
                    isActive: existingUser.isActive,
                },
                newState: updateData,
                correlationId: this.observabilityService.generateCorrelationId(),
                severity: 'warning',
            },
            correlationId: this.observabilityService.generateCorrelationId(),
            severity: 'warning',
        });
        this.observabilityService.incrementAdminAction();
        return updatedUser;
    }
    async getUserById(userId, adminId) {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
            include: {
                profiles: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        await this.observabilityService.createAuditLog({
            userId: adminId,
            action: 'ADMIN_USER_VIEWED',
            resource: 'USER',
            details: {
                targetUserId: userId,
                targetEmail: user.email,
                correlationId: this.observabilityService.generateCorrelationId(),
                severity: 'info',
            },
            correlationId: this.observabilityService.generateCorrelationId(),
            severity: 'info',
        });
        return user;
    }
    async getUserStats(adminId) {
        const [totalCount, adminCount, sellerCount, buyerCount, activeCount, inactiveCount, pendingVerificationCount, suspendedCount, activeVerifiedCount, activeUnverifiedCount, inactiveVerifiedCount, inactiveUnverifiedCount, rejectedCount, deletedCount,] = await Promise.all([
            this.prismaService.user.count(),
            this.prismaService.user.count({ where: { role: 'ADMIN' } }),
            this.prismaService.user.count({ where: { role: 'SELLER' } }),
            this.prismaService.user.count({ where: { role: 'BUYER' } }),
            this.prismaService.user.count({ where: { isActive: true } }),
            this.prismaService.user.count({ where: { isActive: false } }),
            this.prismaService.user.count({ where: { status: 'PENDING_VERIFICATION' } }),
            this.prismaService.user.count({ where: { status: 'SUSPENDED' } }),
            this.prismaService.user.count({
                where: {
                    isActive: true,
                    emailVerified: 'VERIFIED'
                }
            }),
            this.prismaService.user.count({
                where: {
                    isActive: true,
                    emailVerified: 'UNVERIFIED'
                }
            }),
            this.prismaService.user.count({
                where: {
                    isActive: false,
                    emailVerified: 'VERIFIED'
                }
            }),
            this.prismaService.user.count({
                where: {
                    isActive: false,
                    emailVerified: 'UNVERIFIED'
                }
            }),
            this.prismaService.user.count({ where: { status: 'REJECTED' } }),
            this.prismaService.user.count({ where: { status: 'DELETED' } }),
        ]);
        return {
            total: totalCount,
            byRole: {
                ADMIN: adminCount,
                SELLER: sellerCount,
                BUYER: buyerCount,
            },
            byStatus: {
                ACTIVE: activeCount,
                INACTIVE: inactiveCount,
                PENDING_VERIFICATION: pendingVerificationCount,
                SUSPENDED: suspendedCount,
                REJECTED: rejectedCount,
                DELETED: deletedCount,
            },
            active: activeCount,
            inactive: inactiveCount,
            verified: activeVerifiedCount + inactiveVerifiedCount,
            unverified: activeUnverifiedCount + inactiveUnverifiedCount,
        };
    }
    generateVerificationToken() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        for (let i = 0; i < 32; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return token;
    }
    generateSecurePassword(length = 12) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }
};
exports.AdminUserService = AdminUserService;
exports.AdminUserService = AdminUserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        observability_service_1.ObservabilityService])
], AdminUserService);
//# sourceMappingURL=admin-user.service.js.map