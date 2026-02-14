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
    topUserLocations: {
        country: string;
        count: number;
    }[];
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
export declare class EnhancedUserManagementService {
    private prismaService;
    private aiService;
    constructor(prismaService: PrismaService, aiService: AIService);
    getUserAnalytics(): Promise<UserAnalytics>;
    getUsersWithFilters(filters: UserManagementFilters): Promise<{
        users: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    performBulkUserOperation(operation: BulkUserOperation): Promise<{
        success: boolean;
        processed: number;
        failed: number;
        errors: string[];
    }>;
    suspendUser(userId: string, adminId: string, reason?: string): Promise<void>;
    activateUser(userId: string, adminId: string): Promise<void>;
    deleteUser(userId: string, adminId: string, reason?: string): Promise<void>;
    changeUserRole(userId: string, newRole: string, adminId: string): Promise<void>;
    getUserDetails(userId: string): Promise<any>;
    sendUserNotification(userId: string, message: string, adminId: string): Promise<void>;
    private getUserActivity;
    private logUserAction;
    private logBulkOperation;
}
