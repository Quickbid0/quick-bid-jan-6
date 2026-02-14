import { AdminDashboardService } from './admin-dashboard.service';
import { ApprovalService } from './approval.service';
import { EnhancedUserManagementService } from './enhanced-user-management.service';
import { EnhancedProductManagementService } from './enhanced-product-management.service';
import { AIService } from '../ai/ai.service';
export declare class AdminController {
    private readonly dashboardService;
    private readonly approvalService;
    private readonly userManagementService;
    private readonly productManagementService;
    private readonly aiService;
    constructor(dashboardService: AdminDashboardService, approvalService: ApprovalService, userManagementService: EnhancedUserManagementService, productManagementService: EnhancedProductManagementService, aiService: AIService);
    getDashboardStats(): Promise<import("./admin-dashboard.service").AdminDashboardStats>;
    getAnalyticsData(days?: number): Promise<import("./admin-dashboard.service").AdminAnalyticsData>;
    getSystemHealth(): Promise<{
        status: "healthy" | "warning" | "critical";
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
    createApprovalRequest(data: any): Promise<import("./approval.service").ApprovalRequest>;
    getPendingApprovalsList(filters: any): Promise<{
        approvals: import("./approval.service").ApprovalRequest[];
        total: number;
    }>;
    reviewApprovalRequest(approvalId: string, data: {
        action: 'approve' | 'reject' | 'escalate';
        reviewerId: string;
        notes?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getApprovalWorkflows(): Promise<import("./approval.service").ApprovalWorkflow[]>;
    getUserAnalytics(): Promise<import("./enhanced-user-management.service").UserAnalytics>;
    getUsersWithFilters(filters: any): Promise<{
        users: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    performBulkUserOperation(operation: any): Promise<{
        success: boolean;
        processed: number;
        failed: number;
        errors: string[];
    }>;
    getUserDetails(userId: string): Promise<any>;
    suspendUser(userId: string, data: {
        adminId: string;
        reason?: string;
    }): Promise<void>;
    activateUser(userId: string, data: {
        adminId: string;
    }): Promise<void>;
    changeUserRole(userId: string, data: {
        newRole: string;
        adminId: string;
    }): Promise<void>;
    sendUserNotification(userId: string, data: {
        message: string;
        adminId: string;
    }): Promise<void>;
    getProductAnalytics(): Promise<import("./enhanced-product-management.service").ProductAnalytics>;
    getProductsWithFilters(filters: any): Promise<{
        products: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    performBulkProductOperation(operation: any): Promise<{
        success: boolean;
        processed: number;
        failed: number;
        errors: string[];
    }>;
    getProductDetails(productId: string): Promise<any>;
    approveProduct(productId: string, data: {
        adminId: string;
    }): Promise<void>;
    rejectProduct(productId: string, data: {
        adminId: string;
        reason?: string;
    }): Promise<void>;
    suspendProduct(productId: string, data: {
        adminId: string;
        reason?: string;
    }): Promise<void>;
    changeProductCategory(productId: string, data: {
        newCategory: string;
        adminId: string;
    }): Promise<void>;
    updateProductPrice(productId: string, data: {
        newPrice: number;
        adminId: string;
    }): Promise<void>;
    detectDuplicateProducts(): Promise<{
        duplicates: {
            originalId: string;
            duplicates: string[];
            reason: string;
        }[];
        totalDuplicates: number;
    }>;
    detectFraud(bidData: any): Promise<import("../ai/ai.service").FraudDetectionResult>;
    predictPrice(productData: any): Promise<import("../ai/ai.service").PricePrediction>;
    getRecommendations(userId: string, context: any): Promise<import("../ai/ai.service").ProductRecommendation[]>;
    moderateContent(contentData: any): Promise<import("../ai/ai.service").SmartModerationResult>;
    categorizeProduct(productData: any): Promise<{
        primaryCategory: string;
        subcategories: string[];
        confidence: number;
        alternatives: {
            category: string;
            confidence: number;
        }[];
    }>;
    approveUserRegistration(userId: string, data: {
        adminId: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    rejectUserRegistration(userId: string, data: {
        adminId: string;
        reason: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    approveAuction(auctionId: string, data: {
        adminId: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
