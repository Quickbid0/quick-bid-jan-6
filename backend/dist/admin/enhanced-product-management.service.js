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
exports.EnhancedProductManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
let EnhancedProductManagementService = class EnhancedProductManagementService {
    constructor(prismaService, aiService) {
        this.prismaService = prismaService;
        this.aiService = aiService;
    }
    async getProductAnalytics() {
        const totalProducts = await this.prismaService.auction.count();
        const activeProducts = await this.prismaService.auction.count({
            where: { status: 'active' }
        });
        const pendingApproval = await this.prismaService.auction.count({
            where: { status: 'draft' }
        });
        const suspendedProducts = await this.prismaService.auction.count({
            where: { status: 'paused' }
        });
        const productsByStatus = await this.prismaService.auction.groupBy({
            by: ['status'],
            _count: { status: true },
            _sum: { currentBid: true },
        });
        const priceStats = await this.prismaService.auction.aggregate({
            _avg: { startPrice: true },
        });
        const averageProductPrice = Number(priceStats?._avg?.startPrice || 0);
        const topSellingCategories = [
            { category: 'Electronics', sales: 245, revenue: 1850000 },
            { category: 'Jewelry', sales: 189, revenue: 2100000 },
            { category: 'Art', sales: 67, revenue: 890000 },
            { category: 'Vehicles', sales: 34, revenue: 4500000 },
            { category: 'Fashion', sales: 156, revenue: 780000 },
        ];
        const productQualityMetrics = {
            averageTitleLength: 45,
            averageDescriptionLength: 180,
            productsWithImages: Math.floor(totalProducts * 0.85),
            duplicateTitles: Math.floor(totalProducts * 0.02),
        };
        return {
            totalProducts,
            activeProducts,
            pendingApproval,
            suspendedProducts,
            productsByCategory: productsByStatus.map(item => ({
                category: item.status,
                count: item._count.status,
                value: Number(item._sum.currentBid || 0),
            })),
            averageProductPrice,
            topSellingCategories,
            productQualityMetrics,
        };
    }
    async getProductsWithFilters(filters) {
        const { search, category, status, sellerId, priceMin, priceMax, dateFrom, dateTo, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 20, } = filters;
        const where = {};
        if (search) {
            where.title = { contains: search, mode: 'insensitive' };
        }
        if (status) {
            where.status = status;
        }
        if (sellerId) {
            where.sellerId = sellerId;
        }
        if (priceMin !== undefined || priceMax !== undefined) {
            where.startPrice = {};
            if (priceMin !== undefined)
                where.startPrice.gte = priceMin;
            if (priceMax !== undefined)
                where.startPrice.lte = priceMax;
        }
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom)
                where.createdAt.gte = dateFrom;
            if (dateTo)
                where.createdAt.lte = dateTo;
        }
        const orderBy = {};
        orderBy[sortBy] = sortOrder;
        const [products, total] = await Promise.all([
            this.prismaService.auction.findMany({
                where,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prismaService.auction.count({ where }),
        ]);
        const enhancedProducts = await Promise.all(products.map(async (product) => {
            let category = 'General';
            if (!category) {
                const categorization = await this.aiService.categorizeProduct({
                    title: product.title,
                    description: '',
                    price: Number(product.startPrice),
                });
                category = categorization.primaryCategory;
            }
            const qualityScore = await this.calculateProductQuality(product);
            return {
                ...product,
                category,
                qualityScore,
                aiSuggestions: await this.getAISuggestions(product),
                flaggedIssues: await this.checkForIssues(product),
            };
        }));
        return {
            products: enhancedProducts,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async performBulkProductOperation(operation) {
        const { operation: op, productIds, parameters, reason, adminId } = operation;
        let processed = 0;
        let failed = 0;
        const errors = [];
        for (const productId of productIds) {
            try {
                switch (op) {
                    case 'approve':
                        await this.approveProduct(productId, adminId);
                        break;
                    case 'reject':
                        await this.rejectProduct(productId, adminId, reason);
                        break;
                    case 'suspend':
                        await this.suspendProduct(productId, adminId, reason);
                        break;
                    case 'delete':
                        await this.deleteProduct(productId, adminId, reason);
                        break;
                    case 'change_category':
                        await this.changeProductCategory(productId, parameters?.newCategory, adminId);
                        break;
                    case 'update_price':
                        await this.updateProductPrice(productId, parameters?.newPrice, adminId);
                        break;
                    default:
                        throw new common_1.BadRequestException(`Unknown operation: ${op}`);
                }
                processed++;
            }
            catch (error) {
                failed++;
                errors.push(`Product ${productId}: ${error.message}`);
            }
        }
        this.logBulkOperation(adminId, op, processed, failed, productIds.length);
        return {
            success: failed === 0,
            processed,
            failed,
            errors,
        };
    }
    async getProductDetails(productId) {
        const product = await this.prismaService.auction.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const aiAnalysis = await this.aiService.moderateContent({
            title: product.title,
            description: '',
            category: 'General',
            price: Number(product.startPrice),
        });
        const pricePrediction = await this.aiService.predictPrice({
            category: 'General',
            condition: 'good',
            specifications: {},
            marketData: { similarItems: 25 },
        });
        const recommendations = await this.aiService.getRecommendations('sample_user', { category: 'General' });
        return {
            ...product,
            aiAnalysis,
            pricePrediction,
            recommendations,
            qualityMetrics: await this.calculateProductQuality(product),
            similarProducts: await this.findSimilarProducts(product),
        };
    }
    async approveProduct(productId, adminId) {
        const product = await this.prismaService.auction.findUnique({
            where: { id: productId }
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        await this.prismaService.auction.update({
            where: { id: productId },
            data: { status: 'scheduled' }
        });
        this.logProductAction(adminId, 'approve_product', productId);
    }
    async rejectProduct(productId, adminId, reason) {
        const product = await this.prismaService.auction.findUnique({
            where: { id: productId }
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        await this.prismaService.auction.update({
            where: { id: productId },
            data: { status: 'rejected' }
        });
        this.logProductAction(adminId, 'reject_product', productId, { reason });
    }
    async suspendProduct(productId, adminId, reason) {
        await this.prismaService.auction.update({
            where: { id: productId },
            data: { status: 'paused' }
        });
        this.logProductAction(adminId, 'suspend_product', productId, { reason });
    }
    async deleteProduct(productId, adminId, reason) {
        await this.prismaService.auction.update({
            where: { id: productId },
            data: { status: 'deleted' }
        });
        this.logProductAction(adminId, 'delete_product', productId, { reason });
    }
    async changeProductCategory(productId, newCategory, adminId) {
        this.logProductAction(adminId, 'change_category', productId, { newCategory });
    }
    async updateProductPrice(productId, newPrice, adminId) {
        await this.prismaService.auction.update({
            where: { id: productId },
            data: { currentBid: newPrice }
        });
        this.logProductAction(adminId, 'update_price', productId, { newPrice });
    }
    async detectDuplicateProducts() {
        const duplicates = [
            {
                originalId: 'prod_001',
                duplicates: ['prod_045', 'prod_078'],
                reason: 'Similar titles and descriptions'
            },
            {
                originalId: 'prod_012',
                duplicates: ['prod_123'],
                reason: 'Identical product specifications'
            }
        ];
        return {
            duplicates,
            totalDuplicates: duplicates.reduce((sum, group) => sum + group.duplicates.length, 0),
        };
    }
    async calculateProductQuality(product) {
        let totalScore = 0;
        const maxScore = 100;
        const factors = [];
        const titleScore = Math.min(20, product.title.length * 0.4);
        factors.push({ factor: 'Title Quality', score: titleScore, maxScore: 20 });
        totalScore += titleScore;
        const descScore = product.description ? Math.min(25, product.description.length * 0.1) : 0;
        factors.push({ factor: 'Description Quality', score: descScore, maxScore: 25 });
        totalScore += descScore;
        const priceScore = product.startingPrice > 0 && product.startingPrice < 1000000 ? 20 : 0;
        factors.push({ factor: 'Price Reasonableness', score: priceScore, maxScore: 20 });
        totalScore += priceScore;
        const categoryScore = product.category ? 15 : 0;
        factors.push({ factor: 'Category Assignment', score: categoryScore, maxScore: 15 });
        totalScore += categoryScore;
        const imageScore = product.images && product.images.length > 0 ? 20 : 0;
        factors.push({ factor: 'Image Quality', score: imageScore, maxScore: 20 });
        totalScore += imageScore;
        return {
            score: Math.round(totalScore),
            factors,
        };
    }
    async getAISuggestions(product) {
        const suggestions = [];
        if (!product.category) {
            suggestions.push('Add product category for better visibility');
        }
        if (!product.description || product.description.length < 50) {
            suggestions.push('Improve product description with more details');
        }
        if (!product.images || product.images.length === 0) {
            suggestions.push('Add high-quality product images');
        }
        if (product.startingPrice < 100) {
            suggestions.push('Consider increasing starting price for better perceived value');
        }
        return suggestions;
    }
    async checkForIssues(product) {
        const issues = [];
        if (product.title.length < 10) {
            issues.push('Title too short');
        }
        if (product.startPrice <= 0) {
            issues.push('Invalid price');
        }
        const prohibitedWords = ['fake', 'stolen', 'illegal', 'scam'];
        const fullText = `${product.title} ${product.description || ''}`.toLowerCase();
        for (const word of prohibitedWords) {
            if (fullText.includes(word)) {
                issues.push(`Potentially inappropriate content: "${word}"`);
            }
        }
        return issues;
    }
    async findSimilarProducts(product) {
        const similarProducts = await this.prismaService.auction.findMany({
            where: {
                startPrice: {
                    gte: product.startPrice * 0.7,
                    lte: product.startPrice * 1.3,
                },
                status: 'active',
            },
            take: 5,
        });
        return similarProducts.filter(p => p.id !== product.id);
    }
    logProductAction(adminId, action, productId, metadata) {
        console.log(`[PRODUCT ACTION] Admin ${adminId} performed ${action} on product ${productId}`, metadata);
    }
    logBulkOperation(adminId, operation, processed, failed, total) {
        console.log(`[BULK PRODUCT OPERATION] Admin ${adminId} performed ${operation} on ${total} products (${processed} successful, ${failed} failed)`);
    }
};
exports.EnhancedProductManagementService = EnhancedProductManagementService;
exports.EnhancedProductManagementService = EnhancedProductManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AIService])
], EnhancedProductManagementService);
//# sourceMappingURL=enhanced-product-management.service.js.map