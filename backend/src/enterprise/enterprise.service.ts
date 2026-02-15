import { Injectable, Logger, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnterpriseService {
  private readonly logger = new Logger(EnterpriseService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * BRANCH MANAGEMENT
   */

  async createBranch(branchData: {
    name: string;
    code: string;
    type?: 'HEAD_OFFICE' | 'REGULAR' | 'FRANCHISE';
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone?: string;
    email?: string;
    managerId?: string;
  }, adminId: string) {
    try {
      // Verify admin permissions
      const admin = await this.prisma.user.findUnique({
        where: { id: adminId }
      });

      if (!admin || !['SUPER_ADMIN', 'ADMIN'].includes(admin.role)) {
        throw new BadRequestException('Unauthorized: Only admins can create branches');
      }

      // Check if branch code already exists
      const existingBranch = await this.prisma.branch.findUnique({
        where: { code: branchData.code }
      });

      if (existingBranch) {
        throw new BadRequestException('Branch code already exists');
      }

      // If manager is specified, verify they exist
      if (branchData.managerId) {
        const manager = await this.prisma.user.findUnique({
          where: { id: branchData.managerId }
        });

        if (!manager || manager.role !== 'ADMIN') {
          throw new BadRequestException('Invalid manager: Must be an admin user');
        }
      }

      const branch = await this.prisma.branch.create({
        data: {
          name: branchData.name,
          code: branchData.code,
          type: branchData.type || 'REGULAR',
          address: branchData.address,
          city: branchData.city,
          state: branchData.state,
          pincode: branchData.pincode,
          phone: branchData.phone,
          email: branchData.email,
          managerId: branchData.managerId
        }
      });

      // Create audit log
      await this.prisma.auditLog.create({
        data: {
          userId: adminId,
          action: 'CREATE',
          resource: 'branch',
          resourceId: branch.id,
          metadata: {
            branchCode: branch.code,
            branchType: branch.type
          }
        }
      });

      this.logger.log(`Branch created: ${branch.name} (${branch.code}) by admin ${admin.email}`);

      return branch;
    } catch (error) {
      this.logger.error(`Create branch error: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create branch');
    }
  }

  async getBranches(filters?: {
    type?: string;
    city?: string;
    isActive?: boolean;
  }) {
    try {
      const where: any = {};

      if (filters?.type) where.type = filters.type;
      if (filters?.city) where.city = filters.city;
      if (filters?.isActive !== undefined) where.isActive = filters.isActive;

      const branches = await this.prisma.branch.findMany({
        where,
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          staff: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true
                }
              }
            }
          },
          products: {
            where: { status: 'APPROVED' },
            select: {
              id: true,
              title: true,
              status: true
            }
          },
          deliveries: {
            where: { status: 'DELIVERED' },
            select: {
              id: true,
              status: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return branches.map(branch => ({
        ...branch,
        totalStaff: branch.staff.length,
        totalProducts: branch.products.length,
        totalDeliveries: branch.deliveries.length
      }));
    } catch (error) {
      this.logger.error(`Get branches error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch branches');
    }
  }

  async updateBranch(branchId: string, updateData: Partial<{
    name: string;
    address: string;
    phone: string;
    email: string;
    managerId: string;
    isActive: boolean;
  }>, adminId: string) {
    try {
      // Verify admin permissions
      const admin = await this.prisma.user.findUnique({
        where: { id: adminId }
      });

      if (!admin || !['SUPER_ADMIN', 'ADMIN'].includes(admin.role)) {
        throw new BadRequestException('Unauthorized: Only admins can update branches');
      }

      const branch = await this.prisma.branch.findUnique({
        where: { id: branchId }
      });

      if (!branch) {
        throw new NotFoundException('Branch not found');
      }

      // If manager is being updated, verify they exist
      if (updateData.managerId) {
        const manager = await this.prisma.user.findUnique({
          where: { id: updateData.managerId }
        });

        if (!manager || manager.role !== 'ADMIN') {
          throw new BadRequestException('Invalid manager: Must be an admin user');
        }
      }

      const updatedBranch = await this.prisma.branch.update({
        where: { id: branchId },
        data: updateData
      });

      // Create audit log
      await this.prisma.auditLog.create({
        data: {
          userId: adminId,
          action: 'UPDATE',
          resource: 'branch',
          resourceId: branchId,
          oldValues: {
            name: branch.name,
            managerId: branch.managerId,
            isActive: branch.isActive
          },
          newValues: updateData
        }
      });

      this.logger.log(`Branch updated: ${branch.code} by admin ${admin.email}`);

      return updatedBranch;
    } catch (error) {
      this.logger.error(`Update branch error: ${error.message}`, error.stack);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update branch');
    }
  }

  /**
   * STAFF MANAGEMENT
   */

  async assignStaffToBranch(staffData: {
    userId: string;
    branchId: string;
    role: 'MANAGER' | 'SUPERVISOR' | 'EXECUTIVE' | 'AGENT';
    permissions?: string[];
  }, adminId: string) {
    try {
      // Verify admin permissions
      const admin = await this.prisma.user.findUnique({
        where: { id: adminId }
      });

      if (!admin || !['SUPER_ADMIN', 'ADMIN'].includes(admin.role)) {
        throw new BadRequestException('Unauthorized: Only admins can assign staff');
      }

      // Verify user exists and is not already assigned
      const user = await this.prisma.user.findUnique({
        where: { id: staffData.userId },
        include: { branchStaff: true }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.branchStaff) {
        throw new BadRequestException('User is already assigned to a branch');
      }

      // Verify branch exists
      const branch = await this.prisma.branch.findUnique({
        where: { id: staffData.branchId }
      });

      if (!branch) {
        throw new NotFoundException('Branch not found');
      }

      // Validate role permissions based on user type
      const validRoles = {
        'ADMIN': ['MANAGER', 'SUPERVISOR'],
        'DELIVERY_AGENT': ['AGENT'],
        'TELECALLER': ['EXECUTIVE']
      };

      if (!validRoles[user.role]?.includes(staffData.role)) {
        throw new BadRequestException(`Invalid role ${staffData.role} for user type ${user.role}`);
      }

      // Set default permissions based on role
      const defaultPermissions = {
        'MANAGER': ['approve_products', 'manage_staff', 'view_reports', 'manage_deliveries'],
        'SUPERVISOR': ['approve_products', 'view_reports', 'manage_deliveries'],
        'EXECUTIVE': ['view_leads', 'update_leads', 'create_subscriptions'],
        'AGENT': ['pickup_deliveries', 'update_tracking']
      };

      const permissions = staffData.permissions || defaultPermissions[staffData.role];

      const branchStaff = await this.prisma.branchStaff.create({
        data: {
          userId: staffData.userId,
          branchId: staffData.branchId,
          role: staffData.role,
          permissions
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
              city: true
            }
          }
        }
      });

      // Create audit log
      await this.prisma.auditLog.create({
        data: {
          userId: adminId,
          action: 'CREATE',
          resource: 'branch_staff',
          resourceId: branchStaff.id,
          metadata: {
            staffUserId: staffData.userId,
            branchId: staffData.branchId,
            role: staffData.role
          }
        }
      });

      this.logger.log(`Staff assigned: ${user.name} (${user.role}) to ${branch.name} as ${staffData.role}`);

      return branchStaff;
    } catch (error) {
      this.logger.error(`Assign staff error: ${error.message}`, error.stack);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to assign staff');
    }
  }

  async getBranchStaff(branchId: string) {
    try {
      const staff = await this.prisma.branchStaff.findMany({
        where: { branchId, isActive: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
              role: true,
              isActive: true,
              lastLogin: true
            }
          }
        },
        orderBy: { assignedAt: 'desc' }
      });

      return staff.map(member => ({
        id: member.id,
        user: member.user,
        role: member.role,
        permissions: member.permissions,
        assignedAt: member.assignedAt,
        performance: {
          // This would be calculated based on actual metrics
          deliveriesCompleted: 0,
          customerSatisfaction: 0,
          responseTime: 0
        }
      }));
    } catch (error) {
      this.logger.error(`Get branch staff error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch branch staff');
    }
  }

  /**
   * SUBSCRIPTION MANAGEMENT
   */

  async createSubscription(userId: string, plan: 'FREE' | 'SILVER' | 'GOLD' | 'ENTERPRISE', adminId?: string) {
    try {
      // If adminId is provided, verify permissions
      if (adminId) {
        const admin = await this.prisma.user.findUnique({
          where: { id: adminId }
        });

        if (!admin || !['SUPER_ADMIN', 'ADMIN'].includes(admin.role)) {
          throw new BadRequestException('Unauthorized: Only admins can create subscriptions for others');
        }
      } else {
        // Self-subscription - verify user
        if (userId !== adminId) {
          throw new BadRequestException('Users can only subscribe themselves');
        }
      }

      // Check if user already has an active subscription
      const existingSubscription = await this.prisma.subscription.findUnique({
        where: { userId }
      });

      if (existingSubscription && existingSubscription.status === 'ACTIVE') {
        throw new BadRequestException('User already has an active subscription');
      }

      // Get plan details
      const planDetails = {
        'FREE': { bidLimit: 0, price: 0 },
        'SILVER': { bidLimit: 10, price: 499 },
        'GOLD': { bidLimit: 50, price: 1999 },
        'ENTERPRISE': { bidLimit: 1000, price: 9999 }
      };

      const planConfig = planDetails[plan];
      if (!planConfig) {
        throw new BadRequestException('Invalid subscription plan');
      }

      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year

      const subscription = await this.prisma.subscription.create({
        data: {
          userId,
          plan,
          bidLimit: planConfig.bidLimit,
          price: planConfig.price,
          startDate,
          endDate,
          bidsUsed: 0
        }
      });

      // Create audit log
      await this.prisma.auditLog.create({
        data: {
          userId: adminId || userId,
          action: 'CREATE',
          resource: 'subscription',
          resourceId: subscription.id,
          metadata: {
            plan,
            bidLimit: planConfig.bidLimit,
            price: planConfig.price
          }
        }
      });

      this.logger.log(`Subscription created: ${plan} for user ${userId}`);

      return subscription;
    } catch (error) {
      this.logger.error(`Create subscription error: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create subscription');
    }
  }

  async getSubscriptionStats() {
    try {
      const subscriptions = await this.prisma.subscription.findMany({
        include: {
          user: {
            select: {
              role: true
            }
          }
        }
      });

      const stats = {
        total: subscriptions.length,
        active: subscriptions.filter(s => s.status === 'ACTIVE').length,
        expired: subscriptions.filter(s => s.status === 'EXPIRED').length,
        cancelled: subscriptions.filter(s => s.status === 'CANCELLED').length,
        byPlan: {
          FREE: subscriptions.filter(s => s.plan === 'FREE').length,
          SILVER: subscriptions.filter(s => s.plan === 'SILVER').length,
          GOLD: subscriptions.filter(s => s.plan === 'GOLD').length,
          ENTERPRISE: subscriptions.filter(s => s.plan === 'ENTERPRISE').length
        },
        revenue: {
          total: subscriptions.reduce((sum, s) => sum + s.price, 0),
          monthly: Math.round(subscriptions.reduce((sum, s) => sum + s.price, 0) / 12)
        }
      };

      return stats;
    } catch (error) {
      this.logger.error(`Get subscription stats error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch subscription statistics');
    }
  }

  /**
   * DELIVERY MANAGEMENT
   */

  async assignDeliveryAgent(deliveryId: string, agentId: string, adminId: string) {
    try {
      // Verify admin permissions
      const admin = await this.prisma.user.findUnique({
        where: { id: adminId }
      });

      if (!admin || !['SUPER_ADMIN', 'ADMIN'].includes(admin.role)) {
        throw new BadRequestException('Unauthorized: Only admins can assign delivery agents');
      }

      // Verify delivery exists
      const delivery = await this.prisma.delivery.findUnique({
        where: { id: deliveryId }
      });

      if (!delivery) {
        throw new NotFoundException('Delivery not found');
      }

      if (delivery.deliveryAgentId) {
        throw new BadRequestException('Delivery agent already assigned');
      }

      // Verify agent exists and is a delivery agent
      const agent = await this.prisma.user.findUnique({
        where: { id: agentId }
      });

      if (!agent || agent.role !== 'DELIVERY_AGENT') {
        throw new BadRequestException('Invalid delivery agent');
      }

      // Verify agent is assigned to the relevant branch
      const agentStaff = await this.prisma.branchStaff.findUnique({
        where: { userId: agentId }
      });

      if (!agentStaff || agentStaff.branchId !== delivery.branchId) {
        throw new BadRequestException('Agent not assigned to the delivery branch');
      }

      // Assign agent
      const updatedDelivery = await this.prisma.delivery.update({
        where: { id: deliveryId },
        data: {
          deliveryAgentId: agentId,
          status: 'PENDING_PICKUP'
        }
      });

      // Create assignment record
      await this.prisma.deliveryAssignment.create({
        data: {
          deliveryId,
          agentId,
          assignedBy: adminId
        }
      });

      // Create audit log
      await this.prisma.auditLog.create({
        data: {
          userId: adminId,
          action: 'UPDATE',
          resource: 'delivery',
          resourceId: deliveryId,
          oldValues: { deliveryAgentId: null },
          newValues: { deliveryAgentId: agentId, status: 'PENDING_PICKUP' }
        }
      });

      this.logger.log(`Delivery agent assigned: ${agent.name} to delivery ${deliveryId} by ${admin.name}`);

      return updatedDelivery;
    } catch (error) {
      this.logger.error(`Assign delivery agent error: ${error.message}`, error.stack);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to assign delivery agent');
    }
  }

  /**
   * TELECALLER MANAGEMENT
   */

  async getTelecallerLeads(telecallerId: string) {
    try {
      // Verify user is a telecaller
      const telecaller = await this.prisma.user.findUnique({
        where: { id: telecallerId }
      });

      if (!telecaller || telecaller.role !== 'TELECALLER') {
        throw new BadRequestException('Unauthorized: Only telecallers can access leads');
      }

      // Get assigned leads (this would be more complex in real implementation)
      // For now, return recent users who might need follow-up
      const leads = await this.prisma.user.findMany({
        where: {
          role: 'SELLER',
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          createdAt: true,
          isVerified: true,
          products: {
            select: {
              id: true,
              status: true
            }
          }
        },
        take: 20
      });

      return leads.map(lead => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phoneNumber,
        signupDate: lead.createdAt,
        isVerified: lead.isVerified,
        productsCreated: lead.products.length,
        followUpStatus: lead.products.length > 0 ? 'ACTIVE_SELLER' : 'NEEDS_ONBOARDING'
      }));
    } catch (error) {
      this.logger.error(`Get telecaller leads error: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch telecaller leads');
    }
  }

  /**
   * ENTERPRISE DASHBOARD STATS
   */

  async getEnterpriseDashboard() {
    try {
      const [
        branches,
        subscriptions,
        kycStats,
        walletStats,
        recentAuditLogs
      ] = await Promise.all([
        this.prisma.branch.findMany({
          include: {
            products: { where: { status: 'APPROVED' } },
            staff: { where: { isActive: true } }
          }
        }),
        this.prisma.subscription.findMany(),
        this.prisma.kYC.groupBy({
          by: ['status'],
          _count: { status: true }
        }),
        this.prisma.wallet.aggregate({
          _sum: { balance: true, blockedBalance: true },
          _count: true
        }),
        this.prisma.auditLog.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { name: true, role: true }
            }
          }
        })
      ]);

      const totalBranches = branches.length;
      const totalStaff = branches.reduce((sum, branch) => sum + branch.staff.length, 0);
      const totalProducts = branches.reduce((sum, branch) => sum + branch.products.length, 0);

      const subscriptionStats = {
        total: subscriptions.length,
        active: subscriptions.filter(s => s.status === 'ACTIVE').length,
        revenue: subscriptions.reduce((sum, s) => sum + s.price, 0)
      };

      const kycStatsFormatted = {
        total: kycStats.reduce((sum, stat) => sum + stat._count.status, 0),
        pending: kycStats.find(s => s.status === 'PENDING')?._count.status || 0,
        approved: kycStats.find(s => s.status === 'APPROVED')?._count.status || 0,
        rejected: kycStats.find(s => s.status === 'REJECTED')?._count.status || 0
      };

      return {
        overview: {
          branches: totalBranches,
          staff: totalStaff,
          products: totalProducts,
          revenue: subscriptionStats.revenue
        },
        subscriptions: subscriptionStats,
        kyc: kycStatsFormatted,
        wallets: {
          totalWallets: walletStats._count,
          totalBalance: walletStats._sum.balance || 0,
          totalBlocked: walletStats._sum.blockedBalance || 0
        },
        recentActivity: recentAuditLogs.map(log => ({
          id: log.id,
          action: log.action,
          resource: log.resource,
          user: log.user?.name || 'System',
          userRole: log.user?.role || 'System',
          timestamp: log.createdAt
        }))
      };
    } catch (error) {
      this.logger.error(`Get enterprise dashboard error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch enterprise dashboard');
    }
  }
}
