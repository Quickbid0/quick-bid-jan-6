import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from '../ai/ai.service';

export interface BulkUserOperation {
  operation: 'suspend' | 'activate' | 'delete' | 'change_role' | 'send_notification';
  userIds: string[];
  parameters?: Record<string, any>;
  reason?: string;
  adminId: string;
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  newUsersThisMonth: number;
  userRetentionRate: number;
  averageSessionDuration: number;
  topUserLocations: { country: string; count: number }[];
  userEngagementMetrics: {
    averageBidsPerUser: number;
    averageAuctionsWon: number;
    conversionRate: number;
  };
}

export interface UserManagementFilters {
  search?: string;
  role?: string;
  status?: string;
  registrationDateFrom?: Date;
  registrationDateTo?: Date;
  lastLoginFrom?: Date;
  lastLoginTo?: Date;
  sortBy?: 'name' | 'email' | 'registrationDate' | 'lastLogin' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

@Injectable()
export class EnhancedUserManagementService {
  constructor(
    private prismaService: PrismaService,
    private aiService: AIService,
  ) {}

  async getUserAnalytics(): Promise<UserAnalytics> {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Basic user counts
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

    // Mock additional analytics
    const userRetentionRate = 78.5;
    const averageSessionDuration = 25.3; // minutes

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

  async getUsersWithFilters(filters: UserManagementFilters): Promise<{
    users: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      search,
      role,
      status,
      registrationDateFrom,
      registrationDateTo,
      lastLoginFrom,
      lastLoginTo,
      sortBy = 'registrationDate',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = filters;

    // Build where clause
    const where: any = {};

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
      if (registrationDateFrom) where.createdAt.gte = registrationDateFrom;
      if (registrationDateTo) where.createdAt.lte = registrationDateTo;
    }

    // Build order clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Execute query
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
          // Add mock additional fields that would be in a real user table
        },
      }),
      this.prismaService.user.count({ where }),
    ]);

    // Add computed fields for each user
    const enhancedUsers = users.map(user => ({
      ...user,
      // Mock computed fields
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

  async performBulkUserOperation(operation: BulkUserOperation): Promise<{
    success: boolean;
    processed: number;
    failed: number;
    errors: string[];
  }> {
    const { operation: op, userIds, parameters, reason, adminId } = operation;

    let processed = 0;
    let failed = 0;
    const errors: string[] = [];

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
            throw new BadRequestException(`Unknown operation: ${op}`);
        }

        processed++;
      } catch (error) {
        failed++;
        errors.push(`User ${userId}: ${error.message}`);
      }
    }

    // Log bulk operation
    this.logBulkOperation(adminId, op, processed, failed, userIds.length);

    return {
      success: failed === 0,
      processed,
      failed,
      errors,
    };
  }

  async suspendUser(userId: string, adminId: string, reason?: string): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prismaService.user.update({
      where: { id: userId },
      data: { status: 'SUSPENDED' }
    });

    // Log suspension
    this.logUserAction(adminId, 'suspend_user', userId, { reason });
  }

  async activateUser(userId: string, adminId: string): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prismaService.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' }
    });

    // Log activation
    this.logUserAction(adminId, 'activate_user', userId);
  }

  async deleteUser(userId: string, adminId: string, reason?: string): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete - mark as deleted instead of actual deletion
    await this.prismaService.user.update({
      where: { id: userId },
      data: { status: 'DELETED' }
    });

    // Log deletion
    this.logUserAction(adminId, 'delete_user', userId, { reason });
  }

  async changeUserRole(userId: string, newRole: string, adminId: string): Promise<void> {
    if (!['ADMIN', 'SELLER', 'BUYER'].includes(newRole)) {
      throw new BadRequestException('Invalid role');
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prismaService.user.update({
      where: { id: userId },
      data: { role: newRole as any }
    });

    // Log role change
    this.logUserAction(adminId, 'change_role', userId, { oldRole: user.role, newRole });
  }

  async getUserDetails(userId: string): Promise<any> {
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
      throw new NotFoundException('User not found');
    }

    // Get additional user data
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

  async sendUserNotification(userId: string, message: string, adminId: string): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // In a real implementation, this would send a notification via email/SMS/push
    console.log(`Sending notification to user ${userId}: ${message}`);

    // Log notification
    this.logUserAction(adminId, 'send_notification', userId, { message });
  }

  private async getUserActivity(userId: string): Promise<any> {
    // Mock user activity data
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

  private logUserAction(adminId: string, action: string, targetUserId: string, metadata?: any): void {
    // In a real implementation, this would log to an audit table
    console.log(`[USER ACTION] Admin ${adminId} performed ${action} on user ${targetUserId}`, metadata);
  }

  private logBulkOperation(adminId: string, operation: string, processed: number, failed: number, total: number): void {
    console.log(`[BULK OPERATION] Admin ${adminId} performed ${operation} on ${total} users (${processed} successful, ${failed} failed)`);
  }
}
