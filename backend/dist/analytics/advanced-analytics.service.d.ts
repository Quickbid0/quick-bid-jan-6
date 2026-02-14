import { PrismaService } from '../prisma/prisma.service';
export interface DateRange {
    startDate: Date;
    endDate: Date;
}
export interface AnalyticsFilters {
    dateRange?: DateRange;
    auctionType?: string;
    sellerId?: string;
    category?: string;
    status?: string;
}
export interface RevenueAnalytics {
    totalRevenue: number;
    revenueByMonth: {
        month: string;
        revenue: number;
    }[];
    revenueByAuctionType: {
        type: string;
        revenue: number;
        percentage: number;
    }[];
    revenueByCategory: {
        category: string;
        revenue: number;
        auctions: number;
    }[];
    averageRevenuePerAuction: number;
    topRevenueAuctions: {
        auctionId: string;
        title: string;
        revenue: number;
        endDate: Date;
    }[];
}
export interface UserAnalytics {
    totalUsers: number;
    activeUsers: number;
    newUsersByMonth: {
        month: string;
        newUsers: number;
    }[];
    userRetentionRate: number;
    userEngagementMetrics: {
        averageBidsPerUser: number;
        averageAuctionsWonPerUser: number;
        averageSessionDuration: number;
        conversionRate: number;
    };
    userDemographics: {
        topCountries: {
            country: string;
            users: number;
        }[];
        deviceTypes: {
            device: string;
            users: number;
        }[];
        userSegments: {
            segment: string;
            users: number;
            percentage: number;
        }[];
    };
}
export interface AuctionAnalytics {
    totalAuctions: number;
    auctionsByStatus: {
        status: string;
        count: number;
        percentage: number;
    }[];
    auctionsByType: {
        type: string;
        count: number;
        percentage: number;
    }[];
    auctionPerformance: {
        averageAuctionDuration: number;
        averageBidCount: number;
        averageFinalPrice: number;
        successRate: number;
    };
    popularCategories: {
        category: string;
        auctions: number;
        avgPrice: number;
        totalValue: number;
    }[];
    timeBasedMetrics: {
        auctionsByHour: {
            hour: number;
            auctions: number;
        }[];
        auctionsByDayOfWeek: {
            day: string;
            auctions: number;
        }[];
        peakAuctionTimes: {
            hour: number;
            day: string;
            auctionCount: number;
        }[];
    };
}
export interface BusinessIntelligenceReport {
    executiveSummary: {
        totalRevenue: number;
        totalUsers: number;
        totalAuctions: number;
        platformGrowth: number;
        keyMetrics: {
            metric: string;
            value: string;
            change: number;
        }[];
    };
    revenueAnalysis: RevenueAnalytics;
    userAnalysis: UserAnalytics;
    auctionAnalysis: AuctionAnalytics;
    marketInsights: {
        trendingCategories: {
            category: string;
            growth: number;
            demand: number;
        }[];
        priceTrends: {
            category: string;
            avgPrice: number;
            priceChange: number;
        }[];
        competitorAnalysis: {
            competitor: string;
            marketShare: number;
            strengths: string[];
        }[];
    };
    recommendations: {
        priority: 'high' | 'medium' | 'low';
        category: string;
        recommendation: string;
        expectedImpact: string;
        implementationEffort: string;
    }[];
}
export declare class AdvancedAnalyticsService {
    private prismaService;
    private readonly logger;
    constructor(prismaService: PrismaService);
    generateRevenueAnalytics(filters?: AnalyticsFilters): Promise<RevenueAnalytics>;
    generateUserAnalytics(filters?: AnalyticsFilters): Promise<UserAnalytics>;
    generateAuctionAnalytics(filters?: AnalyticsFilters): Promise<AuctionAnalytics>;
    generateBusinessIntelligenceReport(filters?: AnalyticsFilters): Promise<BusinessIntelligenceReport>;
    exportReportToExcel(report: BusinessIntelligenceReport, filename?: string): Promise<Buffer>;
    exportReportToPDF(report: BusinessIntelligenceReport, filename?: string): Promise<Buffer>;
    scheduleReport(reportType: 'daily' | 'weekly' | 'monthly', recipients: string[], filters?: AnalyticsFilters): Promise<{
        success: boolean;
        reportId: string;
    }>;
    getCustomReport(metrics: string[], filters: AnalyticsFilters, groupBy?: string[], dateRange?: DateRange): Promise<any>;
    private calculateRevenueByMonth;
    private calculateRevenueByAuctionType;
    private calculateRevenueByCategory;
    private calculateNewUsersByMonth;
    private calculateUserRetention;
    private calculateUserEngagementMetrics;
    private calculateUserDemographics;
    private calculateAuctionsByStatus;
    private calculateAuctionsByType;
    private calculateAuctionPerformance;
    private calculatePopularCategories;
    private calculateTimeBasedMetrics;
    private calculatePlatformGrowth;
    private calculateKeyMetrics;
    private generateMarketInsights;
    private generateAIRecommendations;
}
