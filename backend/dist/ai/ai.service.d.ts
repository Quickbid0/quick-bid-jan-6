import { ABTestingService, ABTestVariant } from './ab-testing.service';
export declare class AIService {
    private configService;
    private prisma;
    private abTestingService;
    private readonly logger;
    private rekognition;
    private s3;
    constructor(configService: ConfigService, prisma: PrismaService, abTestingService: ABTestingService);
    verifyFaceMatch(userId: string, selfieImagePath: string, documentPhotoPath: string): Promise<{
        success: boolean;
        matchScore: number;
        confidence: 'high' | 'medium' | 'low';
        verified: boolean;
        message: string;
    }>;
    extractDocumentData(documentImagePath: string, documentType: 'AADHAAR' | 'PAN' | 'DRIVING_LICENSE'): Promise<{
        success: boolean;
        extractedData: {
            name?: string;
            documentNumber?: string;
            dateOfBirth?: string;
            address?: string;
            panNumber?: string;
            aadhaarNumber?: string;
        };
        confidence: number;
    }>;
    detectFraudPatterns(userId: string, auctionId: string, bidAmount: number, bidHistory: Array<{
        amount: number;
        timestamp: Date;
    }>): Promise<{
        isSuspicious: boolean;
        riskScore: number;
        riskLevel: 'low' | 'medium' | 'high';
        reasons: string[];
        recommendedAction: 'allow' | 'flag' | 'block';
    }>;
    verifyHandmadeVideo(productId: string, videoPath: string): Promise<{
        verified: boolean;
        authenticityScore: number;
        confidence: 'high' | 'medium' | 'low';
        detectedTechniques: string[];
        recommendations: string[];
    }>;
    predictAuctionPrice(productData: {
        title: string;
        category: string;
        condition: string;
        brand?: string;
        specifications: Record<string, any>;
        images: string[];
        marketData?: any;
    }): Promise<{
        predictedPrice: number;
        confidence: number;
        priceRange: {
            min: number;
            max: number;
        };
        factors: Array<{
            factor: string;
            impact: number;
            weight: number;
        }>;
        marketComparison: {
            averagePrice: number;
            percentile: number;
            similarItems: number;
            marketTrend: 'increasing' | 'decreasing' | 'stable';
        };
        riskAssessment: {
            volatility: number;
            demandScore: number;
            competitionLevel: 'low' | 'medium' | 'high';
        };
    }>;
    generateAdvancedBidStrategy(auctionId: string, userId: string, userBudget: number, userPreferences: {
        riskTolerance: 'low' | 'medium' | 'high';
        biddingStyle: 'conservative' | 'aggressive' | 'strategic';
        maxBidPercentage: number;
    }): Promise<{
        recommendedStrategy: {
            type: 'conservative' | 'aggressive' | 'strategic' | 'sniping';
            reasoning: string[];
            riskLevel: 'low' | 'medium' | 'high';
            expectedROI: number;
        };
        optimalBids: Array<{
            amount: number;
            timing: 'immediate' | 'early' | 'mid' | 'late';
            confidence: number;
            reasoning: string;
            successProbability: number;
        }>;
        marketIntelligence: {
            competitionLevel: number;
            auctionMomentum: 'slow' | 'steady' | 'fast';
            shillBiddingRisk: number;
            optimalEntryPoint: number;
        };
        budgetOptimization: {
            suggestedMaxBid: number;
            reserveAmount: number;
            profitMargin: number;
        };
    }>;
    detectWalletAnomalies(userId: string): Promise<{
        hasAnomalies: boolean;
        anomalies: Array<{
            type: string;
            severity: 'low' | 'medium' | 'high';
            description: string;
            timestamp: Date;
        }>;
        riskScore: number;
    }>;
    private getImageBuffer;
    private getUserBehaviorData;
    private getAuctionContextData;
    private getMarketAnalysisData;
    private runMLFraudDetection;
    private runBasicFraudDetection;
    private calculateMarketVolatility;
    private analyzeBidPattern;
    private analyzeAdvancedBidPatterns;
    getPersonalizedRecommendations(userId: string, context?: {
        currentAuction?: string;
        category?: string;
        priceRange?: {
            min: number;
            max: number;
        };
        limit?: number;
        trackInteractions?: boolean;
    }): Promise<{
        recommendations: Array<{
            productId: string;
            title: string;
            score: number;
            reason: string;
            variantId: string;
            algorithm: string;
        }>;
        variant: ABTestVariant;
        metadata: {
            totalProducts: number;
            algorithmUsed: string;
            confidence: number;
        };
    }>;
    trackRecommendationInteraction(userId: string, productId: string, variantId: string, action: 'click' | 'view' | 'purchase' | 'bid', metadata?: Record<string, any>): Promise<void>;
    private calculateBasePricePrediction;
    private analyzeMarketFactors;
    private analyzeTemporalTrends;
    private analyzeCompetitionDynamics;
    private combinePredictions;
    private calculatePredictionConfidence;
    private basicPricePrediction;
    private calculateSeasonalFactor;
    private determineTrendDirection;
    private findPeakMonths;
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
        const: any;
        scores: Record<string, number>;
        for(: any, [category, keywords]: [any, any], of: any, Object: any): any;
    }>;
    entries(categories: any): any;
}
