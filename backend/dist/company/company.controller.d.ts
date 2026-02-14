import { Request } from 'express';
export declare class CompanyController {
    private companies;
    private nextCompanyId;
    constructor();
    private initializeSampleCompanies;
    private getFeaturesByTier;
    private getLimitsByTier;
    registerCompany(companyData: any): Promise<{
        message: string;
        company: {
            id: string;
            companyName: any;
            email: any;
            status: string;
            subscriptionTier: any;
        };
    }>;
    bulkRegister(bulkData: any): Promise<{
        message: string;
        company: {
            id: string;
            companyName: any;
            email: any;
            status: string;
            subscriptionTier: any;
        };
        usersRegistered: any;
        userCredentials: any;
    }>;
    getDashboard(req: Request): Promise<{
        overview: {
            totalListings: number;
            activeListings: number;
            soldVehicles: number;
            pendingBids: number;
            totalRevenue: number;
            monthlyRevenue: number;
        };
        recentActivity: {
            type: string;
            title: string;
            time: string;
        }[];
        analytics: {
            listingsByCategory: {
                car: number;
                suv: number;
                mpv: number;
            };
            salesByMonth: number[];
            topPerformingListings: {
                title: string;
                views: number;
                bids: number;
            }[];
        };
        subscription: {
            tier: string;
            usedListings: number;
            totalListings: number;
            usedUsers: number;
            totalUsers: number;
            daysRemaining: number;
        };
    }>;
    getAnalytics(period?: string): Promise<{
        period: string;
        revenue: {
            total: number;
            growth: number;
            byMonth: {
                month: string;
                revenue: number;
            }[];
        };
        listings: {
            total: number;
            active: number;
            sold: number;
            averageSalePrice: number;
            averageTimeToSale: number;
        };
        performance: {
            conversionRate: number;
            averageViewsPerListing: number;
            averageBidsPerListing: number;
            customerSatisfaction: number;
        };
        topCategories: {
            category: string;
            count: number;
            revenue: number;
        }[];
    }>;
    getCompanies(): Promise<{
        companies: {
            id: any;
            companyName: any;
            email: any;
            phone: any;
            businessType: any;
            subscriptionTier: any;
            status: any;
            createdAt: any;
        }[];
    }>;
    getCompany(req: Request): Promise<{
        company: {
            id: any;
            companyName: any;
            email: any;
            phone: any;
            gstin: any;
            pan: any;
            businessType: any;
            subscriptionTier: any;
            status: any;
            address: any;
            contactPerson: any;
            subscription: any;
            createdAt: any;
        };
    }>;
}
