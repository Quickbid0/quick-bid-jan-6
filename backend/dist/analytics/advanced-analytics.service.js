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
var AdvancedAnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
let AdvancedAnalyticsService = AdvancedAnalyticsService_1 = class AdvancedAnalyticsService {
    constructor(prismaService) {
        this.prismaService = prismaService;
        this.logger = new common_1.Logger(AdvancedAnalyticsService_1.name);
    }
    async generateRevenueAnalytics(filters) {
        const { dateRange } = filters || {};
        const whereCondition = { status: 'ended' };
        if (dateRange) {
            whereCondition.endTime = {
                gte: dateRange.startDate,
                lte: dateRange.endDate,
            };
        }
        const completedAuctions = await this.prismaService.auction.findMany({
            where: whereCondition,
        });
        const commissionRate = 0.05;
        const totalRevenue = completedAuctions.reduce((sum, auction) => {
            return sum + (Number(auction.currentBid) * commissionRate);
        }, 0);
        const revenueByMonth = await this.calculateRevenueByMonth(dateRange);
        const revenueByAuctionType = await this.calculateRevenueByAuctionType(dateRange);
        const revenueByCategory = await this.calculateRevenueByCategory(dateRange);
        const averageRevenuePerAuction = completedAuctions.length > 0
            ? totalRevenue / completedAuctions.length
            : 0;
        const topRevenueAuctions = completedAuctions
            .sort((a, b) => Number(b.currentBid) - Number(a.currentBid))
            .slice(0, 10)
            .map(auction => ({
            auctionId: auction.id,
            title: auction.title,
            revenue: Number(auction.currentBid) * commissionRate,
            endDate: auction.endTime,
        }));
        return {
            totalRevenue,
            revenueByMonth,
            revenueByAuctionType,
            revenueByCategory,
            averageRevenuePerAuction,
            topRevenueAuctions,
        };
    }
    async generateUserAnalytics(filters) {
        const { dateRange } = filters || {};
        const totalUsers = await this.prismaService.user.count();
        const activeUsers = await this.prismaService.user.count({
            where: { status: 'ACTIVE' }
        });
        const newUsersByMonth = await this.calculateNewUsersByMonth(dateRange);
        const userRetentionRate = await this.calculateUserRetention();
        const userEngagementMetrics = await this.calculateUserEngagementMetrics();
        const userDemographics = await this.calculateUserDemographics();
        return {
            totalUsers,
            activeUsers,
            newUsersByMonth,
            userRetentionRate,
            userEngagementMetrics,
            userDemographics,
        };
    }
    async generateAuctionAnalytics(filters) {
        const { dateRange } = filters || {};
        const totalAuctions = await this.prismaService.auction.count();
        const auctionsByStatus = await this.calculateAuctionsByStatus();
        const auctionsByType = await this.calculateAuctionsByType();
        const auctionPerformance = await this.calculateAuctionPerformance();
        const popularCategories = await this.calculatePopularCategories();
        const timeBasedMetrics = await this.calculateTimeBasedMetrics();
        return {
            totalAuctions,
            auctionsByStatus,
            auctionsByType,
            auctionPerformance,
            popularCategories,
            timeBasedMetrics,
        };
    }
    async generateBusinessIntelligenceReport(filters) {
        const [revenueAnalysis, userAnalysis, auctionAnalysis] = await Promise.all([
            this.generateRevenueAnalytics(filters),
            this.generateUserAnalytics(filters),
            this.generateAuctionAnalytics(filters),
        ]);
        const executiveSummary = {
            totalRevenue: revenueAnalysis.totalRevenue,
            totalUsers: userAnalysis.totalUsers,
            totalAuctions: auctionAnalysis.totalAuctions,
            platformGrowth: this.calculatePlatformGrowth(revenueAnalysis, userAnalysis),
            keyMetrics: this.calculateKeyMetrics(revenueAnalysis, userAnalysis, auctionAnalysis),
        };
        const marketInsights = await this.generateMarketInsights();
        const recommendations = await this.generateAIRecommendations(revenueAnalysis, userAnalysis, auctionAnalysis);
        return {
            executiveSummary,
            revenueAnalysis,
            userAnalysis,
            auctionAnalysis,
            marketInsights,
            recommendations,
        };
    }
    async exportReportToExcel(report, filename) {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'QuickMela Analytics';
        workbook.created = new Date();
        const summarySheet = workbook.addWorksheet('Executive Summary');
        summarySheet.addRow(['QuickMela Business Intelligence Report']);
        summarySheet.addRow(['Generated on', new Date().toLocaleDateString()]);
        summarySheet.addRow([]);
        summarySheet.addRow(['Total Revenue', report.executiveSummary.totalRevenue]);
        summarySheet.addRow(['Total Users', report.executiveSummary.totalUsers]);
        summarySheet.addRow(['Total Auctions', report.executiveSummary.totalAuctions]);
        summarySheet.addRow(['Platform Growth', `${report.executiveSummary.platformGrowth}%`]);
        const revenueSheet = workbook.addWorksheet('Revenue Analysis');
        revenueSheet.addRow(['Month', 'Revenue']);
        report.revenueAnalysis.revenueByMonth.forEach(item => {
            revenueSheet.addRow([item.month, item.revenue]);
        });
        const userSheet = workbook.addWorksheet('User Analysis');
        userSheet.addRow(['Month', 'New Users']);
        report.userAnalysis.newUsersByMonth.forEach(item => {
            userSheet.addRow([item.month, item.newUsers]);
        });
        const auctionSheet = workbook.addWorksheet('Auction Analysis');
        auctionSheet.addRow(['Category', 'Auctions', 'Avg Price', 'Total Value']);
        report.auctionAnalysis.popularCategories.forEach(item => {
            auctionSheet.addRow([item.category, item.auctions, item.avgPrice, item.totalValue]);
        });
        return await workbook.xlsx.writeBuffer();
    }
    async exportReportToPDF(report, filename) {
        return new Promise((resolve) => {
            const buffers = [];
            const doc = new PDFDocument();
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });
            doc.fontSize(20).text('QuickMela Business Intelligence Report', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });
            doc.moveDown(2);
            doc.fontSize(16).text('Executive Summary');
            doc.moveDown();
            doc.fontSize(10)
                .text(`Total Revenue: ₹${report.executiveSummary.totalRevenue.toLocaleString()}`)
                .text(`Total Users: ${report.executiveSummary.totalUsers}`)
                .text(`Total Auctions: ${report.executiveSummary.totalAuctions}`)
                .text(`Platform Growth: ${report.executiveSummary.platformGrowth}%`);
            doc.end();
        });
    }
    async scheduleReport(reportType, recipients, filters) {
        const reportId = `report_${Date.now()}`;
        console.log(`Scheduled ${reportType} report for ${recipients.join(', ')}`);
        return { success: true, reportId };
    }
    async getCustomReport(metrics, filters, groupBy, dateRange) {
        const report = {};
        for (const metric of metrics) {
            switch (metric) {
                case 'revenue':
                    report.revenue = await this.generateRevenueAnalytics(filters);
                    break;
                case 'users':
                    report.users = await this.generateUserAnalytics(filters);
                    break;
                case 'auctions':
                    report.auctions = await this.generateAuctionAnalytics(filters);
                    break;
            }
        }
        return report;
    }
    async calculateRevenueByMonth(dateRange) {
        const months = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            months.push({
                month: monthStr,
                revenue: Math.floor(Math.random() * 100000) + 50000,
            });
        }
        return months;
    }
    async calculateRevenueByAuctionType(dateRange) {
        const totalRevenue = 500000;
        return [
            { type: 'live', revenue: 200000, percentage: 40 },
            { type: 'timed', revenue: 250000, percentage: 50 },
            { type: 'flash', revenue: 35000, percentage: 7 },
            { type: 'tender', revenue: 15000, percentage: 3 },
        ];
    }
    async calculateRevenueByCategory(dateRange) {
        return [
            { category: 'Electronics', revenue: 150000, auctions: 45 },
            { category: 'Jewelry', revenue: 120000, auctions: 38 },
            { category: 'Art', revenue: 80000, auctions: 25 },
            { category: 'Vehicles', revenue: 100000, auctions: 15 },
        ];
    }
    async calculateNewUsersByMonth(dateRange) {
        const months = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            months.push({
                month: monthStr,
                newUsers: Math.floor(Math.random() * 200) + 50,
            });
        }
        return months;
    }
    async calculateUserRetention() {
        return 78.5;
    }
    async calculateUserEngagementMetrics() {
        return {
            averageBidsPerUser: 12.4,
            averageAuctionsWonPerUser: 2.1,
            averageSessionDuration: 25.3,
            conversionRate: 68.5,
        };
    }
    async calculateUserDemographics() {
        return {
            topCountries: [
                { country: 'India', users: 1250 },
                { country: 'United States', users: 340 },
                { country: 'United Kingdom', users: 180 },
            ],
            deviceTypes: [
                { device: 'Mobile', users: 890 },
                { device: 'Desktop', users: 650 },
                { device: 'Tablet', users: 230 },
            ],
            userSegments: [
                { segment: 'High Value', users: 150, percentage: 12 },
                { segment: 'Regular', users: 850, percentage: 68 },
                { segment: 'New', users: 300, percentage: 24 },
            ],
        };
    }
    async calculateAuctionsByStatus() {
        const total = await this.prismaService.auction.count();
        const statusCounts = await this.prismaService.auction.groupBy({
            by: ['status'],
            _count: { status: true },
        });
        return statusCounts.map(item => ({
            status: item.status,
            count: item._count.status,
            percentage: total > 0 ? (item._count.status / total) * 100 : 0,
        }));
    }
    async calculateAuctionsByType() {
        const total = await this.prismaService.auction.count();
        const typeCounts = await this.prismaService.auction.groupBy({
            by: ['status'],
            _count: { status: true },
        });
        return typeCounts.map(item => ({
            type: item.status,
            count: item._count.status,
            percentage: total > 0 ? (item._count.status / total) * 100 : 0,
        }));
    }
    async calculateAuctionPerformance() {
        const completedAuctions = await this.prismaService.auction.findMany({
            where: { status: 'ended' }
        });
        if (completedAuctions.length === 0) {
            return {
                averageAuctionDuration: 0,
                averageBidCount: 0,
                averageFinalPrice: 0,
                successRate: 0,
            };
        }
        const totalDuration = completedAuctions.reduce((sum, auction) => {
            const duration = auction.endTime.getTime() - auction.createdAt.getTime();
            return sum + (duration / (1000 * 60 * 60));
        }, 0);
        const averageDuration = totalDuration / completedAuctions.length;
        const averageBidCount = 0;
        const averageFinalPrice = completedAuctions.reduce((sum, auction) => sum + Number(auction.currentBid), 0) / completedAuctions.length;
        const totalAuctions = await this.prismaService.auction.count();
        const successRate = totalAuctions > 0 ? (completedAuctions.length / totalAuctions) * 100 : 0;
        return {
            averageAuctionDuration: averageDuration,
            averageBidCount,
            averageFinalPrice,
            successRate,
        };
    }
    async calculatePopularCategories() {
        const statusStats = await this.prismaService.auction.groupBy({
            by: ['status'],
            _count: { status: true },
            _sum: { currentBid: true },
            _avg: { startPrice: true },
        });
        return statusStats.slice(0, 10).map((item, index) => ({
            category: item.status,
            auctions: item._count.status,
            avgPrice: Number(item._avg.startPrice || 0),
            totalValue: Number(item._sum.currentBid || 0),
        }));
    }
    async calculateTimeBasedMetrics() {
        const auctionsByHour = Array.from({ length: 24 }, (_, hour) => ({
            hour,
            auctions: Math.floor(Math.random() * 50) + 10,
        }));
        const auctionsByDayOfWeek = [
            { day: 'Monday', auctions: 120 },
            { day: 'Tuesday', auctions: 135 },
            { day: 'Wednesday', auctions: 148 },
            { day: 'Thursday', auctions: 142 },
            { day: 'Friday', auctions: 165 },
            { day: 'Saturday', auctions: 180 },
            { day: 'Sunday', auctions: 156 },
        ];
        const peakAuctionTimes = [
            { hour: 20, day: 'Friday', auctionCount: 45 },
            { hour: 19, day: 'Saturday', auctionCount: 42 },
            { hour: 21, day: 'Thursday', auctionCount: 38 },
        ];
        return {
            auctionsByHour,
            auctionsByDayOfWeek,
            peakAuctionTimes,
        };
    }
    calculatePlatformGrowth(revenue, users) {
        if (revenue.revenueByMonth.length < 2)
            return 0;
        const currentMonth = revenue.revenueByMonth[revenue.revenueByMonth.length - 1];
        const previousMonth = revenue.revenueByMonth[revenue.revenueByMonth.length - 2];
        if (previousMonth.revenue === 0)
            return 0;
        return ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100;
    }
    calculateKeyMetrics(revenue, users, auctions) {
        return [
            {
                metric: 'Monthly Revenue',
                value: `₹${revenue.revenueByMonth[revenue.revenueByMonth.length - 1]?.revenue.toLocaleString() || '0'}`,
                change: this.calculatePlatformGrowth(revenue, users),
            },
            {
                metric: 'Active Users',
                value: users.activeUsers.toString(),
                change: 12.5,
            },
            {
                metric: 'Total Auctions',
                value: auctions.totalAuctions.toString(),
                change: 8.3,
            },
            {
                metric: 'Conversion Rate',
                value: `${users.userEngagementMetrics.conversionRate}%`,
                change: 5.2,
            },
        ];
    }
    async generateMarketInsights() {
        return {
            trendingCategories: [
                { category: 'AI Technology', growth: 45.2, demand: 8.7 },
                { category: 'Sustainable Fashion', growth: 32.1, demand: 6.4 },
                { category: 'Electric Vehicles', growth: 28.9, demand: 7.2 },
            ],
            priceTrends: [
                { category: 'Electronics', avgPrice: 15000, priceChange: 12.5 },
                { category: 'Jewelry', avgPrice: 25000, priceChange: -3.2 },
                { category: 'Art', avgPrice: 35000, priceChange: 18.7 },
            ],
            competitorAnalysis: [
                {
                    competitor: 'Competitor A',
                    marketShare: 25.4,
                    strengths: ['Large user base', 'Established brand']
                },
                {
                    competitor: 'Competitor B',
                    marketShare: 18.7,
                    strengths: ['Mobile-first design', 'Fast auctions']
                },
            ],
        };
    }
    async generateAIRecommendations(revenue, users, auctions) {
        const recommendations = [];
        if (revenue.averageRevenuePerAuction < 1000) {
            recommendations.push({
                priority: 'high',
                category: 'Revenue Optimization',
                recommendation: 'Implement dynamic pricing suggestions for sellers to increase average auction values',
                expectedImpact: '15-20% increase in average revenue per auction',
                implementationEffort: 'Medium',
            });
        }
        if (users.userEngagementMetrics.conversionRate < 70) {
            recommendations.push({
                priority: 'high',
                category: 'User Engagement',
                recommendation: 'Enhance onboarding flow and provide personalized auction recommendations',
                expectedImpact: '10-15% improvement in user conversion rate',
                implementationEffort: 'Medium',
            });
        }
        if (auctions.auctionPerformance.successRate < 80) {
            recommendations.push({
                priority: 'medium',
                category: 'Auction Optimization',
                recommendation: 'Implement auction ending notifications and extend popular auctions automatically',
                expectedImpact: 'Increase auction completion rate by 15%',
                implementationEffort: 'Low',
            });
        }
        recommendations.push({
            priority: 'medium',
            category: 'Market Expansion',
            recommendation: 'Launch targeted marketing campaigns for high-growth categories like AI Technology',
            expectedImpact: '25% increase in new user acquisition',
            implementationEffort: 'High',
        });
        return recommendations;
    }
};
exports.AdvancedAnalyticsService = AdvancedAnalyticsService;
exports.AdvancedAnalyticsService = AdvancedAnalyticsService = AdvancedAnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdvancedAnalyticsService);
//# sourceMappingURL=advanced-analytics.service.js.map