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
exports.AdminDashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminDashboardService = class AdminDashboardService {
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async getDashboardStats() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
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
        const totalAuctions = await this.prismaService.auction.count();
        const activeAuctions = await this.prismaService.auction.count({
            where: { status: 'active' }
        });
        const endedAuctions = await this.prismaService.auction.count({
            where: { status: 'ended' }
        });
        const endedAuctionsData = await this.prismaService.auction.findMany({
            where: { status: 'ended' },
            select: { currentBid: true }
        });
        const totalAuctionValue = endedAuctionsData.reduce((sum, auction) => sum + Number(auction.currentBid), 0);
        const auctionsByType = await this.prismaService.auction.groupBy({
            by: ['status'],
            _count: { status: true },
        });
        const totalTransactions = 0;
        const totalRevenue = 1000000;
        const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
        const transactionsThisMonth = Math.floor(totalTransactions * 0.3);
        const systemUptime = 99.9;
        const activeSessions = 150;
        const pendingApprovals = await this.prismaService.auction.count({
            where: { status: 'draft' }
        });
        const reportedIssues = 5;
        const recentUsers = await this.prismaService.user.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, email: true, name: true, role: true, createdAt: true }
        });
        const recentAuctions = await this.prismaService.auction.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, status: true, currentBid: true, createdAt: true }
        });
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
            auctionsByType: auctionsByType.map(item => ({ type: item.status, count: item._count.status })),
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
    async getAnalyticsData(days = 30) {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
        const userGrowthData = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(endDate.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            const users = await this.prismaService.user.count({
                where: { createdAt: { lte: date } }
            });
            userGrowthData.push({ date: dateStr, users });
        }
        const auctionActivityData = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(endDate.getTime() - i * 24 * 60 * 60 * 1000);
            const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            const auctions = await this.prismaService.auction.count({
                where: {
                    createdAt: {
                        gte: date,
                        lt: nextDate
                    }
                }
            });
            const bids = Math.floor(Math.random() * 100) + 10;
            auctionActivityData.push({ date: dateStr, auctions, bids });
        }
        const revenueTrends = auctionActivityData.map(item => ({
            date: item.date,
            revenue: item.auctions * 5000 + Math.random() * 10000
        }));
        const popularCategories = [
            { category: 'Electronics', auctions: 25, value: 150000 },
            { category: 'Jewelry', auctions: 18, value: 200000 },
            { category: 'Art', auctions: 12, value: 180000 },
            { category: 'Vehicles', auctions: 8, value: 300000 },
            { category: 'Real Estate', auctions: 5, value: 500000 },
        ];
        const topSellers = [
            { sellerId: '1', sellerName: 'Premium Auctions', totalSales: 150000, auctions: 15 },
            { sellerId: '2', sellerName: 'Luxury Goods Co', totalSales: 120000, auctions: 12 },
            { sellerId: '3', sellerName: 'Estate Sales Pro', totalSales: 100000, auctions: 8 },
        ];
        const platformMetrics = {
            averageAuctionDuration: 45,
            averageBidCount: 12,
            conversionRate: 68.5,
            userRetention: 82.3,
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
    async getSystemHealth() {
        return {
            status: 'healthy',
            uptime: 99.9,
            memoryUsage: 68.5,
            cpuUsage: 42.1,
            activeConnections: 156,
            errorRate: 0.02,
            lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000),
            alerts: [
                'Scheduled maintenance in 24 hours',
                'Database backup completed successfully'
            ]
        };
    }
    async getPendingApprovals() {
        const userRegistrations = await this.prismaService.user.count({
            where: { status: 'PENDING_VERIFICATION' }
        });
        const auctionRequests = await this.prismaService.auction.count({
            where: { status: 'draft' }
        });
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
    async approveUserRegistration(userId, adminId) {
        try {
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
            this.logAdminAction(adminId, 'approve_user', `Approved user registration: ${user.email}`);
            return { success: true, message: 'User registration approved successfully' };
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
    async rejectUserRegistration(userId, adminId, reason) {
        try {
            const user = await this.prismaService.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            await this.prismaService.user.update({
                where: { id: userId },
                data: { status: 'INACTIVE' }
            });
            this.logAdminAction(adminId, 'reject_user', `Rejected user registration: ${user.email} - Reason: ${reason}`);
            return { success: true, message: 'User registration rejected' };
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
    async approveAuction(auctionId, adminId) {
        try {
            const auction = await this.prismaService.auction.findUnique({
                where: { id: auctionId }
            });
            if (!auction) {
                throw new common_1.NotFoundException('Auction not found');
            }
            await this.prismaService.auction.update({
                where: { id: auctionId },
                data: { status: 'scheduled' }
            });
            this.logAdminAction(adminId, 'approve_auction', `Approved auction: ${auction.title}`);
            return { success: true, message: 'Auction approved and scheduled successfully' };
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
    logAdminAction(adminId, action, details) {
        console.log(`[ADMIN ACTION] ${adminId} - ${action}: ${details}`);
    }
};
exports.AdminDashboardService = AdminDashboardService;
exports.AdminDashboardService = AdminDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminDashboardService);
//# sourceMappingURL=admin-dashboard.service.js.map