import { PrismaService } from '../prisma/prisma.service';
import { AIService } from '../ai/ai.service';
export interface ProductFilters {
    search?: string;
    category?: string;
    status?: string;
    sellerId?: string;
    priceMin?: number;
    priceMax?: number;
    dateFrom?: Date;
    dateTo?: Date;
    sortBy?: 'title' | 'price' | 'createdAt' | 'status';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}
export interface BulkProductOperation {
    operation: 'approve' | 'reject' | 'suspend' | 'delete' | 'change_category' | 'update_price';
    productIds: string[];
    parameters?: Record<string, any>;
    reason?: string;
    adminId: string;
}
export interface ProductAnalytics {
    totalProducts: number;
    activeProducts: number;
    pendingApproval: number;
    suspendedProducts: number;
    productsByCategory: {
        category: string;
        count: number;
        value: number;
    }[];
    averageProductPrice: number;
    topSellingCategories: {
        category: string;
        sales: number;
        revenue: number;
    }[];
    productQualityMetrics: {
        averageTitleLength: number;
        averageDescriptionLength: number;
        productsWithImages: number;
        duplicateTitles: number;
    };
}
export declare class EnhancedProductManagementService {
    private prismaService;
    private aiService;
    constructor(prismaService: PrismaService, aiService: AIService);
    getProductAnalytics(): Promise<ProductAnalytics>;
    getProductsWithFilters(filters: ProductFilters): Promise<{
        products: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    performBulkProductOperation(operation: BulkProductOperation): Promise<{
        success: boolean;
        processed: number;
        failed: number;
        errors: string[];
    }>;
    getProductDetails(productId: string): Promise<any>;
    approveProduct(productId: string, adminId: string): Promise<void>;
    rejectProduct(productId: string, adminId: string, reason?: string): Promise<void>;
    suspendProduct(productId: string, adminId: string, reason?: string): Promise<void>;
    deleteProduct(productId: string, adminId: string, reason?: string): Promise<void>;
    changeProductCategory(productId: string, newCategory: string, adminId: string): Promise<void>;
    updateProductPrice(productId: string, newPrice: number, adminId: string): Promise<void>;
    detectDuplicateProducts(): Promise<{
        duplicates: {
            originalId: string;
            duplicates: string[];
            reason: string;
        }[];
        totalDuplicates: number;
    }>;
    private calculateProductQuality;
    private getAISuggestions;
    private checkForIssues;
    private findSimilarProducts;
    private logProductAction;
    private logBulkOperation;
}
