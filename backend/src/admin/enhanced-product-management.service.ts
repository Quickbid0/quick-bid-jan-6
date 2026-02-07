import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Auction } from '../auctions/auction.entity';
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
  productsByCategory: { category: string; count: number; value: number }[];
  averageProductPrice: number;
  topSellingCategories: { category: string; sales: number; revenue: number }[];
  productQualityMetrics: {
    averageTitleLength: number;
    averageDescriptionLength: number;
    productsWithImages: number;
    duplicateTitles: number;
  };
}

@Injectable()
export class EnhancedProductManagementService {
  constructor(
    @InjectRepository(Auction)
    private auctionRepository: Repository<Auction>,
    private prismaService: PrismaService,
    private aiService: AIService,
  ) {}

  async getProductAnalytics(): Promise<ProductAnalytics> {
    const totalProducts = await this.auctionRepository.count();
    const activeProducts = await this.auctionRepository.count({
      where: { status: 'active' }
    });
    const pendingApproval = await this.auctionRepository.count({
      where: { status: 'draft' }
    });
    const suspendedProducts = await this.auctionRepository.count({
      where: { status: 'paused' }
    });

    // Products by category
    const productsByCategory = await this.auctionRepository
      .createQueryBuilder('auction')
      .select('auction.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(auction.currentPrice)', 'value')
      .where('auction.category IS NOT NULL')
      .groupBy('auction.category')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // Calculate average price
    const priceStats = await this.auctionRepository
      .createQueryBuilder('auction')
      .select('AVG(auction.startingPrice)', 'averagePrice')
      .getRawOne();

    const averageProductPrice = Number(priceStats?.averagePrice || 0);

    // Mock additional analytics
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
      productsByCategory: productsByCategory.map(item => ({
        category: item.category || 'Uncategorized',
        count: parseInt(item.count),
        value: Number(item.value || 0),
      })),
      averageProductPrice,
      topSellingCategories,
      productQualityMetrics,
    };
  }

  async getProductsWithFilters(filters: ProductFilters): Promise<{
    products: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      search,
      category,
      status,
      sellerId,
      priceMin,
      priceMax,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = filters;

    // Build where clause
    const where: any = {};

    if (search) {
      where.title = Like(`%${search}%`);
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    if (priceMin !== undefined || priceMax !== undefined) {
      where.startingPrice = {};
      if (priceMin !== undefined) where.startingPrice.gte = priceMin;
      if (priceMax !== undefined) where.startingPrice.lte = priceMax;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    // Build order clause
    const order: any = {};
    order[sortBy] = sortOrder;

    // Execute query
    const [products, total] = await Promise.all([
      this.auctionRepository.find({
        where,
        order,
        skip: (page - 1) * limit,
        take: limit,
        relations: ['seller'], // Assuming there's a seller relation
      }),
      this.auctionRepository.count({ where }),
    ]);

    // Enhance products with additional data
    const enhancedProducts = await Promise.all(
      products.map(async (product) => {
        // Get AI categorization if category is missing
        let category = product.category;
        if (!category) {
          const categorization = await this.aiService.categorizeProduct({
            title: product.title,
            description: product.description || '',
            price: Number(product.startingPrice),
          });
          category = categorization.primaryCategory;
        }

        // Get quality score
        const qualityScore = await this.calculateProductQuality(product);

        return {
          ...product,
          category,
          qualityScore,
          aiSuggestions: await this.getAISuggestions(product),
          flaggedIssues: await this.checkForIssues(product),
        };
      })
    );

    return {
      products: enhancedProducts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async performBulkProductOperation(operation: BulkProductOperation): Promise<{
    success: boolean;
    processed: number;
    failed: number;
    errors: string[];
  }> {
    const { operation: op, productIds, parameters, reason, adminId } = operation;

    let processed = 0;
    let failed = 0;
    const errors: string[] = [];

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
            throw new BadRequestException(`Unknown operation: ${op}`);
        }

        processed++;
      } catch (error) {
        failed++;
        errors.push(`Product ${productId}: ${error.message}`);
      }
    }

    // Log bulk operation
    this.logBulkOperation(adminId, op, processed, failed, productIds.length);

    return {
      success: failed === 0,
      processed,
      failed,
      errors,
    };
  }

  async getProductDetails(productId: string): Promise<any> {
    const product = await this.auctionRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Get AI analysis
    const aiAnalysis = await this.aiService.moderateContent({
      title: product.title,
      description: product.description || '',
      category: product.category || 'General',
      price: Number(product.startingPrice),
    });

    // Get price prediction
    const pricePrediction = await this.aiService.predictPrice({
      category: product.category || 'General',
      condition: 'good', // Would be stored in product data
      specifications: {},
      marketData: { similarItems: 25 },
    });

    // Get recommendations
    const recommendations = await this.aiService.getRecommendations(
      'sample_user',
      { category: product.category }
    );

    return {
      ...product,
      aiAnalysis,
      pricePrediction,
      recommendations,
      qualityMetrics: await this.calculateProductQuality(product),
      similarProducts: await this.findSimilarProducts(product),
    };
  }

  async approveProduct(productId: string, adminId: string): Promise<void> {
    const product = await this.auctionRepository.findOne({
      where: { id: productId }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.auctionRepository.update(productId, { status: 'scheduled' });

    // Log approval
    this.logProductAction(adminId, 'approve_product', productId);
  }

  async rejectProduct(productId: string, adminId: string, reason?: string): Promise<void> {
    const product = await this.auctionRepository.findOne({
      where: { id: productId }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.auctionRepository.update(productId, { status: 'rejected' });

    // Log rejection
    this.logProductAction(adminId, 'reject_product', productId, { reason });
  }

  async suspendProduct(productId: string, adminId: string, reason?: string): Promise<void> {
    await this.auctionRepository.update(productId, { status: 'paused' });

    // Log suspension
    this.logProductAction(adminId, 'suspend_product', productId, { reason });
  }

  async deleteProduct(productId: string, adminId: string, reason?: string): Promise<void> {
    // Soft delete
    await this.auctionRepository.update(productId, { status: 'deleted' });

    // Log deletion
    this.logProductAction(adminId, 'delete_product', productId, { reason });
  }

  async changeProductCategory(productId: string, newCategory: string, adminId: string): Promise<void> {
    await this.auctionRepository.update(productId, { category: newCategory });

    // Log category change
    this.logProductAction(adminId, 'change_category', productId, { newCategory });
  }

  async updateProductPrice(productId: string, newPrice: number, adminId: string): Promise<void> {
    await this.auctionRepository.update(productId, { currentPrice: newPrice });

    // Log price update
    this.logProductAction(adminId, 'update_price', productId, { newPrice });
  }

  async detectDuplicateProducts(): Promise<{
    duplicates: { originalId: string; duplicates: string[]; reason: string }[];
    totalDuplicates: number;
  }> {
    // Mock duplicate detection - in real implementation, use text similarity algorithms
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

  private async calculateProductQuality(product: Auction): Promise<{
    score: number;
    factors: { factor: string; score: number; maxScore: number }[];
  }> {
    let totalScore = 0;
    const maxScore = 100;
    const factors = [];

    // Title quality (0-20 points)
    const titleScore = Math.min(20, product.title.length * 0.4);
    factors.push({ factor: 'Title Quality', score: titleScore, maxScore: 20 });
    totalScore += titleScore;

    // Description quality (0-25 points)
    const descScore = product.description ? Math.min(25, product.description.length * 0.1) : 0;
    factors.push({ factor: 'Description Quality', score: descScore, maxScore: 25 });
    totalScore += descScore;

    // Price reasonableness (0-20 points)
    const priceScore = product.startingPrice > 0 && product.startingPrice < 1000000 ? 20 : 0;
    factors.push({ factor: 'Price Reasonableness', score: priceScore, maxScore: 20 });
    totalScore += priceScore;

    // Category assignment (0-15 points)
    const categoryScore = product.category ? 15 : 0;
    factors.push({ factor: 'Category Assignment', score: categoryScore, maxScore: 15 });
    totalScore += categoryScore;

    // Images (0-20 points)
    const imageScore = product.images && product.images.length > 0 ? 20 : 0;
    factors.push({ factor: 'Image Quality', score: imageScore, maxScore: 20 });
    totalScore += imageScore;

    return {
      score: Math.round(totalScore),
      factors,
    };
  }

  private async getAISuggestions(product: Auction): Promise<string[]> {
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

  private async checkForIssues(product: Auction): Promise<string[]> {
    const issues = [];

    if (product.title.length < 10) {
      issues.push('Title too short');
    }

    if (product.startingPrice <= 0) {
      issues.push('Invalid price');
    }

    // Check for potentially inappropriate content
    const prohibitedWords = ['fake', 'stolen', 'illegal', 'scam'];
    const fullText = `${product.title} ${product.description || ''}`.toLowerCase();

    for (const word of prohibitedWords) {
      if (fullText.includes(word)) {
        issues.push(`Potentially inappropriate content: "${word}"`);
      }
    }

    return issues;
  }

  private async findSimilarProducts(product: Auction): Promise<any[]> {
    // Find products in same category with similar price range
    const similarProducts = await this.auctionRepository.find({
      where: {
        category: product.category,
        startingPrice: MoreThanOrEqual(product.startingPrice * 0.7),
        status: 'active',
      },
      take: 5,
    });

    return similarProducts.filter(p => p.id !== product.id);
  }

  private logProductAction(adminId: string, action: string, productId: string, metadata?: any): void {
    console.log(`[PRODUCT ACTION] Admin ${adminId} performed ${action} on product ${productId}`, metadata);
  }

  private logBulkOperation(adminId: string, operation: string, processed: number, failed: number, total: number): void {
    console.log(`[BULK PRODUCT OPERATION] Admin ${adminId} performed ${operation} on ${total} products (${processed} successful, ${failed} failed)`);
  }
}
