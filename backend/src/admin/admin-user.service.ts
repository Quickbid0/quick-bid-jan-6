import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ObservabilityService } from '../observability/observability.service';

// Define types locally since Prisma enums aren't exporting properly
type Role = 'ADMIN' | 'SELLER' | 'BUYER';
type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION' | 'REJECTED' | 'DELETED';

// Define Account type based on Prisma model
type Account = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  status: UserStatus;
  isActive: boolean;
  emailVerified: string;
  createdAt: Date;
  updatedAt: Date;
};

export interface CreateUserDto {
  email: string;
  name: string;
  role: 'SELLER' | 'BUYER';
  status?: UserStatus;
  sendInvite?: boolean;
}

export interface UpdateUserDto {
  status?: UserStatus;
  isActive?: boolean;
}

export interface UserListDto {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  status?: UserStatus;
  isActive?: boolean;
}

@Injectable()
export class AdminUserService {
  constructor(
    private prismaService: PrismaService,
    private observabilityService: ObservabilityService,
  ) {}

  // Create new user (seller or buyer only)
  async createUser(createUserDto: CreateUserDto, adminId: string): Promise<Account> {
    const { email, name, role, status = 'PENDING_VERIFICATION', sendInvite = false } = createUserDto;

    // Validate role - only seller and buyer roles are allowed through this endpoint
    // Role parameter is already constrained to 'seller' | 'buyer' by TypeScript

    // Check if user already exists
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException(`User with email ${email} already exists`);
    }

    // Generate secure password
    const generatePassword = (): string => {
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

    // Create user
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

    // Create profile
    await this.prismaService.profile.create({
      data: {
        userId: user.id,
        bio: `${role.charAt(0).toUpperCase() + role.slice(1)} account`,
        isVerified: false,
      }
    });

    // Log admin action
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

    // Increment admin action metrics
    this.observabilityService.incrementAdminAction();

    // Send invitation email if requested
    if (sendInvite) {
      try {
        // Generate invitation email content
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

        // In production, send actual email
        // For now, log the invitation details
        console.log(`Invitation email prepared for ${email}: ${subject}`);

        // TODO: Implement actual email sending
        // await this.emailService.sendEmail({
        //   to: email,
        //   subject,
        //   html: htmlContent,
        // });

        // Log the email sending action
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

      } catch (error) {
        console.error(`Failed to send invitation email to ${email}:`, error);
        // Don't fail the user creation if email sending fails
      }
    }

    // Return user without sensitive data
    const { passwordHash: _, verificationToken, resetPasswordToken, resetTokenExpiry, ...userResult } = user;
    return userResult;
  }

  // List users with filtering and pagination
  async listUsers(userListDto: UserListDto, adminId: string): Promise<{ users: Account[], total: number }> {
    const {
      page = 1,
      limit = 50,
      search,
      role,
      status,
      isActive,
    } = userListDto;

    const where: any = {};

    // Search by email or name
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by role
    if (role) {
      where.role = role;
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by active status
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

    // Log admin action
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

  // Update user (activate/deactivate)
  async updateUser(userId: string, updateUserDto: UpdateUserDto, adminId: string): Promise<Account> {
    const { status, isActive } = updateUserDto;

    // Check if user exists
    const existingUser = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Prevent admin from modifying other admins
    if (existingUser.role === 'ADMIN') {
      throw new BadRequestException('Cannot modify admin users through this endpoint');
    }

    // Prepare update data
    const updateData: any = {};
    
    if (status !== undefined) {
      updateData.status = status;
    }
    
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    // Update user
    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Log admin action
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

  // Get user by ID
  async getUserById(userId: string, adminId: string): Promise<Account> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
          profiles: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Log admin action
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

  // Get user statistics
  async getUserStats(adminId: string): Promise<{
    total: number;
    byRole: Record<Role, number>;
    byStatus: Record<UserStatus, number>;
    active: number;
    inactive: number;
    verified: number;
    unverified: number;
  }> {
    const [
      totalCount,
      adminCount,
      sellerCount,
      buyerCount,
      activeCount,
      inactiveCount,
      pendingVerificationCount,
      suspendedCount,
      activeVerifiedCount,
      activeUnverifiedCount,
      inactiveVerifiedCount,
      inactiveUnverifiedCount,
      rejectedCount,
      deletedCount,
    ] = await Promise.all([
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

  // Generate verification token
  private generateVerificationToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  // Generate secure password
  private generateSecurePassword(length: number = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
