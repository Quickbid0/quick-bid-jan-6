import { PrismaService } from '../prisma/prisma.service';
export interface FraudDetectionResult {
    isFraudulent: boolean;
    riskScore: number;
    riskFactors: string[];
    confidence: number;
    recommendations: string[];
}
export interface PricePrediction {
    predictedPrice: number;
    confidence: number;
    priceRange: {
        min: number;
        max: number;
    };
    factors: {
        factor: string;
        impact: number;
    }[];
    marketComparison: {
        averagePrice: number;
        percentile: number;
        similarItems: number;
    };
}
export interface ProductRecommendation {
    productId: string;
    title: string;
    score: number;
    reason: string;
    category: string;
}
export interface SmartModerationResult {
    shouldApprove: boolean;
    confidence: number;
    flags: string[];
    suggestions: string[];
    autoCategorization: string[];
}
export declare class AIService {
    private prismaService;
    constructor(prismaService: PrismaService);
    detectFraud(bidData: {
        auctionId: string;
        userId: string;
        amount: number;
        userHistory: any;
        auctionHistory: any;
    }): Promise<FraudDetectionResult>;
    predictPrice(productData: {
        category: string;
        condition: string;
        brand?: string;
        model?: string;
        year?: number;
        specifications: Record<string, any>;
        marketData?: any;
    }): Promise<PricePrediction>;
    getRecommendations(userId: string, context: {
        currentAuction?: string;
        category?: string;
        priceRange?: {
            min: number;
            max: number;
        };
        limit?: number;
    }): Promise<ProductRecommendation[]>;
    moderateContent(contentData: {
        title: string;
        description: string;
        images?: string[];
        category: string;
        price: number;
    }): Promise<SmartModerationResult>;
    categorizeProduct(productData: {
        title: string;
        description: string;
        images?: string[];
        price: number;
    }): Promise<{
        primaryCategory: string;
        subcategories: string[];
        confidence: number;
        alternatives: {
            category: string;
            confidence: number;
        }[];
    }>;
    private calculateExpectedIncrement;
    private getSubcategories;
}
