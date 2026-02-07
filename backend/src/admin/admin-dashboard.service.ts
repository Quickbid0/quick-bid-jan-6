import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan } from 'typeorm';
import { Auction, AuctionType, AuctionStatus } from '../auctions/auction.entity';
import { PrismaService } from '../prisma/prisma.service';

export interface AdminDashboardStats {
  // User Statistics
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  usersByRole: { role: string; count: number }[];

  // Auction Statistics
  totalAuctions: number;
  activeAuctions: number;
  endedAuctions: number;
  totalAuctionValue: number;
  auctionsByType: { type: AuctionType; count: number }[];

  // Transaction Statistics
  totalTransactions: number;
  totalRevenue: number;
  averageTransactionValue: number;
  transactionsThisMonth: number;

  // Platform Health
  systemUptime: number;
  activeSessions: number;
  pendingApprovals: number;
  reportedIssues: number;

  // Recent Activity
  recentUsers: any[];
  recentAuctions: any[];
  recentTransactions: any[];
}

export interface AdminAnalyticsData {
  userGrowth: { date: string; users: number }[];
  auctionActivity: { date: string; auctions: number; bids: number }[];
  revenueTrends: { date: string; revenue: number }[];
  popularCategories: { category: string; auctions: number; value: number }[];
  topSellers: { sellerId: string; sellerName: string; totalSales: number; auctions: number }[];
  platformMetrics: {
    averageAuctionDuration: number;
    averageBidCount: number;
    conversionRate: number;
    userRetention: number;
  };
}

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(Auction)
    private auctionRepository: Repository<Auction>,
    private prismaService: PrismaService,
  ) {}

  async getDashboardStats(): Promise<AdminDashboardStats> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // User Statistics
    const totalUsers = await this.prismaService.user.count();
    const activeUsers = await this.prismaService.user.count({
      where: { status: 'ACTIVE' }
    });
    const newUsersToday = await this.prismaService.user.count({
      where: { createdAt: { gte: today } }
    });
    const newUsersThisWeek = await this.prismaService.user.count({
      where: { createdAt: { gte: weekAgo } }
    });

    const usersByRole = await this.prismaService.user.groupBy({
      by: ['role'],
      _count: { role: true },
    });

    // Auction Statistics
    const totalAuctions = await this.auctionRepository.count();
    const activeAuctions = await this.auctionRepository.count({
      where: { status: 'active' }
    });
    const endedAuctions = await this.auctionRepository.count({
      where: { status: 'ended' }
    });

    // Calculate total auction value (sum of final prices for ended auctions)
    const endedAuctionsData = await this.auctionRepository.find({
      where: { status: 'ended' },
      select: ['currentPrice']
    });
    const totalAuctionValue = endedAuctionsData.reduce((sum, auction) => sum + Number(auction.currentPrice), 0);

    const auctionsByType = await this.auctionRepository
      .createQueryBuilder('auction')
      .select('auction.auctionType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('auction.auctionType')
      .getRawMany();

    // Transaction Statistics (mock data for now - would come from payments table)
    const totalTransactions = 0; // TODO: Implement when Transaction model is added
    const totalRevenue = 1000000; // Mock data
    const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const transactionsThisMonth = Math.floor(totalTransactions * 0.3); // Mock monthly data

    // Platform Health
    const systemUptime = 99.9; // Mock uptime percentage
    const activeSessions = 150; // Mock active sessions
    const pendingApprovals = await this.auctionRepository.count({
      where: { status: 'draft' }
    });
    const reportedIssues = 5; // Mock reported issues

    // Recent Activity
    const recentUsers = await this.prismaService.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });

    const recentAuctions = await this.auctionRepository.find({
      take: 5,
      order: { createdAt: 'DESC' },
      select: ['id', 'title', 'auctionType', 'status', 'currentPrice', 'createdAt']
    });

    // Mock recent transactions
    const recentTransactions = [
      { id: '1', amount: 5000, type: 'auction_win', createdAt: new Date() },
      { id: '2', amount: 2500, type: 'bid_refund', createdAt: new Date(Date.now() - 3600000) },
    ];

    return {
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
      usersByRole: usersByRole.map(item => ({ role: item.role, count: item._count.role })),
      totalAuctions,
      activeAuctions,
      endedAuctions,
      totalAuctionValue,
      auctionsByType: auctionsByType.map(item => ({ type: item.type as AuctionType, count: parseInt(item.count) })),
      totalTransactions,
      totalRevenue,
      averageTransactionValue,
      transactionsThisMonth,
      systemUptime,
      activeSessions,
      pendingApprovals,
      reportedIssues,
      recentUsers,
      recentAuctions,
      recentTransactions,
    };
  }

  async getAnalyticsData(days: number = 30): Promise<AdminAnalyticsData> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    // User growth data
    const userGrowthData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(endDate.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const users = await this.prismaService.user.count({
        where: { createdAt: { lte: date } }
      });
      userGrowthData.push({ date: dateStr, users });
    }

    // Auction activity data
    const auctionActivityData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(endDate.getTime() - i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];

      const auctions = await this.auctionRepository.count({
        where: { createdAt: Between(date, nextDate) }
      });

      // Mock bid count - would come from bids table
      const bids = Math.floor(Math.random() * 100) + 10;

      auctionActivityData.push({ date: dateStr, auctions, bids });
    }

    // Revenue trends (mock data)
    const revenueTrends = auctionActivityData.map(item => ({
      date: item.date,
      revenue: item.auctions * 5000 + Math.random() * 10000
    }));

    // Popular categories (mock data based on existing auctions)
    const popularCategories = [
      { category: 'Electronics', auctions: 25, value: 150000 },
      { category: 'Jewelry', auctions: 18, value: 200000 },
      { category: 'Art', auctions: 12, value: 180000 },
      { category: 'Vehicles', auctions: 8, value: 300000 },
      { category: 'Real Estate', auctions: 5, value: 500000 },
    ];

    // Top sellers (mock data)
    const topSellers = [
      { sellerId: '1', sellerName: 'Premium Auctions', totalSales: 150000, auctions: 15 },
      { sellerId: '2', sellerName: 'Luxury Goods Co', totalSales: 120000, auctions: 12 },
      { sellerId: '3', sellerName: 'Estate Sales Pro', totalSales: 100000, auctions: 8 },
    ];

    // Platform metrics
    const platformMetrics = {
      averageAuctionDuration: 45, // minutes
      averageBidCount: 12,
      conversionRate: 68.5, // percentage
      userRetention: 82.3, // percentage
    };

    return {
      userGrowth: userGrowthData,
      auctionActivity: auctionActivityData,
      revenueTrends,
      popularCategories,
      topSellers,
      platformMetrics,
    };
  }

  async getSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    memoryUsage: number;
    cpuUsage: number;
    activeConnections: number;
    errorRate: number;
    lastBackup: Date;
    alerts: string[];
  }> {
    // Mock system health data
    return {
      status: 'healthy',
      uptime: 99.9,
      memoryUsage: 68.5,
      cpuUsage: 42.1,
      activeConnections: 156,
      errorRate: 0.02,
      lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      alerts: [
        'Scheduled maintenance in 24 hours',
        'Database backup completed successfully'
      ]
    };
  }

  async getPendingApprovals(): Promise<{
    userRegistrations: number;
    productListings: number;
    auctionRequests: number;
    sellerVerifications: number;
    totalPending: number;
  }> {
    // Count pending user registrations
    const userRegistrations = await this.prismaService.user.count({
      where: { status: 'PENDING_VERIFICATION' }
    });

    // Count draft auctions (pending approval)
    const auctionRequests = await this.auctionRepository.count({
      where: { status: 'draft' }
    });

    // Mock data for other pending items
    const productListings = 8;
    const sellerVerifications = 3;

    return {
      userRegistrations,
      productListings,
      auctionRequests,
      sellerVerifications,
      totalPending: userRegistrations + productListings + auctionRequests + sellerVerifications
    };
  }

  async approveUserRegistration(userId: string, adminId: string): Promise<{ success: boolean; message: string }> {
    try {
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

      // Log admin action
      this.logAdminAction(adminId, 'approve_user', `Approved user registration: ${user.email}`);

      return { success: true, message: 'User registration approved successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async rejectUserRegistration(userId: string, adminId: string, reason: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.prismaService.user.update({
        where: { id: userId },
        data: { status: 'INACTIVE' }
      });

      // Log admin action
      this.logAdminAction(adminId, 'reject_user', `Rejected user registration: ${user.email} - Reason: ${reason}`);

      return { success: true, message: 'User registration rejected' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async approveAuction(auctionId: string, adminId: string): Promise<{ success: boolean; message: string }> {
    try {
      const auction = await this.auctionRepository.findOne({
        where: { id: auctionId }
      });

      if (!auction) {
        throw new NotFoundException('Auction not found');
      }

      await this.auctionRepository.update(auctionId, { status: 'scheduled' });

      // Log admin action
      this.logAdminAction(adminId, 'approve_auction', `Approved auction: ${auction.title}`);

      return { success: true, message: 'Auction approved and scheduled successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  private logAdminAction(adminId: string, action: string, details: string): void {
    // In a real implementation, this would log to an audit table
    console.log(`[ADMIN ACTION] ${adminId} - ${action}: ${details}`);
  }
}
