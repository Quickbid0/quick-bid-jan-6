import { PrismaService } from '../prisma/prisma.service';
export interface AdminDashboardStats {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    usersByRole: {
        role: string;
        count: number;
    }[];
    totalAuctions: number;
    activeAuctions: number;
    endedAuctions: number;
    totalAuctionValue: number;
    auctionsByType: {
        type: string;
        count: number;
    }[];
    totalTransactions: number;
    totalRevenue: number;
    averageTransactionValue: number;
    transactionsThisMonth: number;
    systemUptime: number;
    activeSessions: number;
    pendingApprovals: number;
    reportedIssues: number;
    recentUsers: any[];
    recentAuctions: any[];
    recentTransactions: any[];
}
export interface AdminAnalyticsData {
    userGrowth: {
        date: string;
        users: number;
    }[];
    auctionActivity: {
        date: string;
        auctions: number;
        bids: number;
    }[];
    revenueTrends: {
        date: string;
        revenue: number;
    }[];
    popularCategories: {
        category: string;
        auctions: number;
        value: number;
    }[];
    topSellers: {
        sellerId: string;
        sellerName: string;
        totalSales: number;
        auctions: number;
    }[];
    platformMetrics: {
        averageAuctionDuration: number;
        averageBidCount: number;
        conversionRate: number;
        userRetention: number;
    };
}
export declare class AdminDashboardService {
    private prismaService;
    constructor(prismaService: PrismaService);
    getDashboardStats(): Promise<AdminDashboardStats>;
    getAnalyticsData(days?: number): Promise<AdminAnalyticsData>;
    getSystemHealth(): Promise<{
        status: 'healthy' | 'warning' | 'critical';
        uptime: number;
        memoryUsage: number;
        cpuUsage: number;
        activeConnections: number;
        errorRate: number;
        lastBackup: Date;
        alerts: string[];
    }>;
    getPendingApprovals(): Promise<{
        userRegistrations: number;
        productListings: number;
        auctionRequests: number;
        sellerVerifications: number;
        totalPending: number;
    }>;
    approveUserRegistration(userId: string, adminId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    rejectUserRegistration(userId: string, adminId: string, reason: string): Promise<{
        success: boolean;
        message: string;
    }>;
    approveAuction(auctionId: string, adminId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private logAdminAction;
}
