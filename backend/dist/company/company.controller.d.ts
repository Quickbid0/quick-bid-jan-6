import { Request } from 'express';
import { CompanyService, BulkUploadResult } from './company.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: string;
                companyId?: string;
                twoFactorEnabled?: boolean;
            };
        }
    }
}
export declare class CompanyController {
    private readonly companyService;
    private readonly prisma;
    private readonly auditService;
    constructor(companyService: CompanyService, prisma: PrismaService, auditService: AuditService);
    registerCompany(companyData: any, req: Request): Promise<{
        id: string;
        createdAt: Date;
        isVerified: boolean;
        companyName: string;
        companyType: string;
        registrationNumber: string;
        gstNumber: string;
        createdByAdminId: string;
    }>;
    requestCompanyRegistration(requestData: any): Promise<{
        message: string;
        requestId: string;
        status: string;
        nextSteps: string[];
    }>;
    approveRegistration(requestId: string, approvalData: any, req: Request): Promise<{
        message: string;
        company: {
            id: string;
            companyName: string;
            companyType: string;
            isVerified: boolean;
            createdAt: Date;
        };
        ownerAccount: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            companyId: string;
            temporaryPassword: string;
        };
        branchAllocation: any;
        securityLevel: any;
    }>;
    createCompanyOwnerAccount(companyId: string, accountData: any, req: Request): Promise<{
        message: string;
        company: {
            id: string;
            companyName: string;
        };
        ownerAccount: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            companyId: string;
            temporaryPassword: string;
        };
        branchAllocation: any;
        securityLevel: any;
    }>;
    bulkUploadVehicles(file: Express.Multer.File, req: Request): Promise<BulkUploadResult>;
    private parseCSV;
    private parseExcel;
    approveBulkUpload(batchId: string, req: Request): Promise<{
        message: string;
    }>;
    getDashboard(req: Request): Promise<{
        overview: {
            totalListings: number;
            activeListings: number;
            soldVehicles: number;
            pendingApprovals: number;
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
                bike: number;
            };
            salesByMonth: number[];
            topPerformingListings: {
                title: string;
                views: number;
                bids: number;
            }[];
        };
    }>;
    getBulkUploadHistory(req: Request): Promise<{
        status: string;
        id: string;
        createdAt: Date;
        title: string;
        bulkUploadBatchId: string;
    }[]>;
    getAnalytics(period: string, req: Request): Promise<{
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
    getCompanies(): Promise<({
        users: {
            status: import(".prisma/client").$Enums.UserStatus;
            id: string;
            email: string;
            passwordHash: string;
            name: string | null;
            role: import(".prisma/client").$Enums.Role;
            isActive: boolean;
            emailVerified: import(".prisma/client").$Enums.EmailVerificationStatus;
            verificationToken: string | null;
            resetPasswordToken: string | null;
            resetTokenExpiry: Date | null;
            companyId: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        products: {
            status: string;
            id: string;
            companyId: string | null;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            title: string;
            sellerId: string;
            category: string;
            price: number;
            images: string[];
            bulkUploadBatchId: string | null;
            uploadSource: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        isVerified: boolean;
        companyName: string;
        companyType: string;
        registrationNumber: string;
        gstNumber: string;
        createdByAdminId: string;
    })[]>;
    addStaffMember(staffData: any, req: Request): Promise<{
        message: string;
        staffMember: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            companyId: string;
            temporaryPassword: string;
        };
    }>;
    getCompanyStaff(req: Request): Promise<{
        staffMembers: {
            status: import(".prisma/client").$Enums.UserStatus;
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            emailVerified: import(".prisma/client").$Enums.EmailVerificationStatus;
            createdAt: Date;
            updatedAt: Date;
        }[];
        totalCount: number;
    }>;
    updateStaffMember(staffId: string, updateData: any, req: Request): Promise<{
        message: string;
        staffMember: {
            status: import(".prisma/client").$Enums.UserStatus;
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            updatedAt: Date;
        };
    }>;
    removeStaffMember(staffId: string, req: Request): Promise<{
        message: string;
    }>;
}
