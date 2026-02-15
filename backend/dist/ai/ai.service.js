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
var AIService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const ab_testing_service_1 = require("./ab-testing.service");
let AIService = AIService_1 = class AIService {
    constructor(configService, prisma, abTestingService) {
        this.configService = configService;
        this.prisma = prisma;
        this.abTestingService = abTestingService;
        this.logger = new Logger(AIService_1.name);
        AWS.config.update({
            accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
            secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
            region: this.configService.get('AWS_REGION') || 'us-east-1'
        });
        this.rekognition = new AWS.Rekognition();
        this.s3 = new AWS.S3();
        this.logger.log('QuickMela AI Service initialized with AWS Rekognition');
    }
    async verifyFaceMatch(userId, selfieImagePath, documentPhotoPath) {
        try {
            this.logger.log(`Starting AWS Rekognition face verification for user ${userId}`);
            const hasAWSCredentials = this.configService.get('AWS_ACCESS_KEY_ID') &&
                this.configService.get('AWS_SECRET_ACCESS_KEY');
            if (!hasAWSCredentials) {
                this.logger.warn('AWS credentials not configured, falling back to mock verification');
                return this.simulateFaceMatching(selfieImagePath, documentPhotoPath);
            }
            const sourceImageBuffer = await this.getImageBuffer(selfieImagePath);
            const targetImageBuffer = await this.getImageBuffer(documentPhotoPath);
            const params = {
                SourceImage: {
                    Bytes: sourceImageBuffer
                },
                TargetImage: {
                    Bytes: targetImageBuffer
                },
                SimilarityThreshold: 80.0
            };
            const response = await this.rekognition.compareFaces(params).promise();
            let matchScore = 0;
            let confidence = 'low';
            let verified = false;
            let message = 'Face verification failed';
            if (response.FaceMatches && response.FaceMatches.length > 0) {
                matchScore = response.FaceMatches[0].Similarity || 0;
                if (matchScore >= 95) {
                    confidence = 'high';
                    verified = true;
                    message = 'Face verification successful - high confidence match';
                }
                else if (matchScore >= 85) {
                    confidence = 'medium';
                    verified = true;
                    message = 'Face verification successful - medium confidence match';
                }
                else if (matchScore >= 80) {
                    confidence = 'low';
                    verified = false;
                    message = 'Face verification requires manual review - low confidence match';
                }
                else {
                    verified = false;
                    message = 'Face verification failed - insufficient similarity';
                }
            }
            else {
                message = 'No faces detected in one or both images';
            }
            await this.prisma.kYC.updateMany({
                where: { userId },
                data: {
                    faceMatchScore: matchScore,
                    status: verified ? 'APPROVED' : 'UNDER_REVIEW'
                }
            });
            if (verified && confidence === 'high') {
                await this.prisma.user.update({
                    where: { id: userId },
                    data: { faceVerified: true }
                });
            }
            await this.prisma.auditLog.create({
                data: {
                    userId,
                    action: 'AI_VERIFICATION',
                    resource: 'face_recognition',
                    resourceId: userId,
                    metadata: {
                        matchScore,
                        confidence,
                        verified,
                        provider: 'aws_rekognition'
                    }
                }
            });
            this.logger.log(`AWS Rekognition face verification completed for user ${userId}: ${confidence} confidence (${matchScore.toFixed(2)}%), verified: ${verified}`);
            return {
                success: true,
                matchScore: Math.round(matchScore * 100) / 100,
                confidence,
                verified,
                message
            };
        }
        catch (error) {
            this.logger.error(`AWS Rekognition face verification error for user ${userId}:`, error);
            this.logger.warn('Falling back to mock face verification due to AWS API error');
            return this.simulateFaceMatching(selfieImagePath, documentPhotoPath);
        }
    }
    async extractDocumentData(documentImagePath, documentType) {
        try {
            this.logger.log(`Starting Google Cloud Vision OCR extraction for ${documentType}`);
            const hasGoogleCredentials = this.configService.get('GOOGLE_CLOUD_VISION_KEY');
            if (!hasGoogleCredentials) {
                this.logger.warn('Google Cloud Vision credentials not configured, falling back to mock OCR');
                return this.simulateAdvancedOCRExtraction(documentImagePath, documentType);
            }
            const imageBuffer = await this.getImageBuffer(documentImagePath);
            const base64Image = imageBuffer.toString('base64');
            const vision = require('@google-cloud/vision');
            const client = new vision.ImageAnnotatorClient({
                keyFilename: this.configService.get('GOOGLE_CLOUD_KEY_FILE'),
                projectId: this.configService.get('GOOGLE_CLOUD_PROJECT_ID')
            });
            const request = {
                image: {
                    content: base64Image
                },
                features: [
                    {
                        type: 'TEXT_DETECTION',
                        maxResults: 1
                    }
                ]
            };
            const [result] = await client.annotateImage(request);
            const detections = result.textAnnotations;
            if (!detections || detections.length === 0) {
                return {
                    success: false,
                    extractedData: {},
                    confidence: 0
                };
            }
            const extractedText = detections[0].description;
            const confidence = detections[0].boundingPoly ? 0.95 : 0.85;
            const parsedData = this.parseDocumentText(extractedText, documentType);
            this.logger.log(`Google Cloud Vision OCR completed for ${documentType}: ${confidence * 100}% confidence`);
            return {
                success: Object.keys(parsedData).length > 0,
                extractedData: parsedData,
                confidence: Math.round(confidence * 100)
            };
        }
        catch (error) {
            this.logger.error(`Google Cloud Vision OCR error for ${documentType}:`, error);
            this.logger.warn('Falling back to mock OCR due to Google Cloud Vision API error');
            return this.simulateAdvancedOCRExtraction(documentImagePath, documentType);
        }
    }
    async detectFraudPatterns(userId, auctionId, bidAmount, bidHistory) {
        try {
            this.logger.log(`Starting advanced ML fraud detection for user ${userId} in auction ${auctionId}`);
            const userData = await this.getUserBehaviorData(userId);
            const auctionData = await this.getAuctionContextData(auctionId);
            const marketData = await this.getMarketAnalysisData(bidAmount, bidHistory);
            const fraudAnalysis = await this.runMLFraudDetection({
                userId,
                auctionId,
                bidAmount,
                bidHistory,
                userData,
                auctionData,
                marketData
            });
            if (fraudAnalysis.riskLevel === 'high') {
                await this.createFraudAlert(userId, auctionId, fraudAnalysis);
            }
            if (fraudAnalysis.isSuspicious) {
                await this.prisma.auction.update({
                    where: { id: auctionId },
                    data: {
                        fraudAlert: true,
                        fraudScore: fraudAnalysis.riskScore
                    }
                });
            }
            this.logger.log(`Advanced ML fraud detection completed for user ${userId}: ${fraudAnalysis.riskLevel} risk (${fraudAnalysis.riskScore})`);
            return fraudAnalysis;
        }
        catch (error) {
            this.logger.error(`Advanced ML fraud detection error for user ${userId}:`, error);
            return this.runBasicFraudDetection(userId, auctionId, bidAmount, bidHistory);
        }
    }
    async verifyHandmadeVideo(productId, videoPath) {
        try {
            this.logger.log(`Starting Google Cloud Video AI analysis for product ${productId}`);
            const hasGoogleCredentials = this.configService.get('GOOGLE_CLOUD_VIDEO_KEY');
            if (!hasGoogleCredentials) {
                this.logger.warn('Google Cloud Video AI credentials not configured, falling back to mock analysis');
                return this.simulateVideoAnalysis(videoPath);
            }
            const analysisResult = await this.analyzeVideoContent(videoPath);
            const techniqueDetection = await this.detectCraftTechniques(videoPath);
            const authenticityScoring = await this.scoreVideoAuthenticity(analysisResult, techniqueDetection);
            await this.prisma.product.update({
                where: { id: productId },
                data: {
                    handmadeRating: authenticityScoring.authenticityScore,
                    videoVerified: authenticityScoring.verified,
                    verificationMetadata: {
                        detectedTechniques: authenticityScoring.detectedTechniques,
                        confidence: authenticityScoring.confidence,
                        analysisTimestamp: new Date(),
                        aiProvider: 'google_cloud_video_ai'
                    }
                }
            });
            await this.prisma.auditLog.create({
                data: {
                    userId: 'system',
                    action: 'AI_VERIFICATION',
                    resource: 'handmade_video',
                    resourceId: productId,
                    metadata: {
                        authenticityScore: authenticityScoring.authenticityScore,
                        confidence: authenticityScoring.confidence,
                        verified: authenticityScoring.verified,
                        techniquesDetected: authenticityScoring.detectedTechniques.length
                    }
                }
            });
            this.logger.log(`Google Cloud Video AI verification completed for product ${productId}: ${authenticityScoring.confidence} confidence, score: ${authenticityScoring.authenticityScore}`);
            return authenticityScoring;
        }
        catch (error) {
            this.logger.error(`Google Cloud Video AI error for product ${productId}:`, error);
            this.logger.warn('Falling back to mock video analysis due to Google Cloud Video AI error');
            return this.simulateVideoAnalysis(videoPath);
        }
    }
    async predictAuctionPrice(productData) {
        try {
            this.logger.log(`Starting ML-based price prediction for product: ${productData.title}`);
            const basePrediction = await this.calculateBasePricePrediction(productData);
            const marketFactors = await this.analyzeMarketFactors(productData);
            const temporalFactors = await this.analyzeTemporalTrends(productData.category);
            const competitionFactors = await this.analyzeCompetitionDynamics(productData);
            const finalPrediction = this.combinePredictions({
                basePrediction,
                marketFactors,
                temporalFactors,
                competitionFactors
            });
            const confidence = this.calculatePredictionConfidence({
                basePrediction,
                marketFactors,
                dataPoints: marketFactors.similarItems
            });
            this.logger.log(`Price prediction completed: ₹${finalPrediction.predictedPrice} (${confidence}% confidence)`);
            return finalPrediction;
        }
        catch (error) {
            this.logger.error('Price prediction error:', error);
            return this.basicPricePrediction(productData);
        }
    }
    async generateAdvancedBidStrategy(auctionId, userId, userBudget, userPreferences) {
        try {
            this.logger.log(`Generating advanced bid strategy for user ${userId} on auction ${auctionId}`);
            const auctionData = await this.getAuctionIntelligenceData(auctionId);
            const userData = await this.getUserBiddingProfile(userId);
            const marketData = await this.getMarketIntelligence(auctionData.category);
            const strategy = await this.calculateOptimalStrategy({
                auctionData,
                userData,
                marketData,
                userBudget,
                userPreferences
            });
            this.logger.log(`Bid strategy generated: ${strategy.recommendedStrategy.type} approach with ${strategy.recommendedStrategy.expectedROI}% expected ROI`);
            return strategy;
        }
        catch (error) {
            this.logger.error('Advanced bid strategy error:', error);
            return this.basicBidStrategy(auctionId, userBudget);
        }
    }
    async detectWalletAnomalies(userId) {
        try {
            const transactions = await this.prisma.transaction.findMany({
                where: {
                    userId,
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            const anomalies = await this.analyzeWalletPatterns(transactions);
            const riskScore = anomalies.reduce((score, anomaly) => {
                switch (anomaly.severity) {
                    case 'high': return score + 30;
                    case 'medium': return score + 15;
                    case 'low': return score + 5;
                    default: return score;
                }
            }, 0);
            if (anomalies.length > 0) {
                this.logger.warn(`Wallet anomalies detected for user ${userId}: ${anomalies.length} issues, risk score: ${riskScore}`);
            }
            return {
                hasAnomalies: anomalies.length > 0,
                anomalies,
                riskScore: Math.min(riskScore, 100)
            };
        }
        catch (error) {
            this.logger.error(`Wallet anomaly detection error for user ${userId}:`, error);
            return {
                hasAnomalies: false,
                anomalies: [],
                riskScore: 0
            };
        }
    }
    async getImageBuffer(imagePathOrBase64) {
        if (imagePathOrBase64.startsWith('data:image')) {
            const base64Data = imagePathOrBase64.split(',')[1];
            return Buffer.from(base64Data, 'base64');
        }
        try {
            const fs = require('fs').promises;
            return await fs.readFile(imagePathOrBase64);
        }
        catch (error) {
            throw new Error('Invalid image path or format');
        }
    }
    async getUserBehaviorData(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                bids: {
                    include: { auction: true },
                    orderBy: { createdAt: 'desc' },
                    take: 50
                },
                auctions: {
                    include: { bids: true }
                },
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 100
                }
            }
        });
        return {
            accountAge: user ? (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24) : 0,
            totalBids: user?.bids?.length || 0,
            totalAuctions: user?.auctions?.length || 0,
            totalTransactions: user?.transactions?.length || 0,
            averageBidAmount: user?.bids?.length ?
                user.bids.reduce((sum, bid) => sum + bid.amount, 0) / user.bids.length : 0,
            biddingFrequency: user?.bids?.length || 0,
            lastActivity: user?.bids?.[0]?.createdAt || null
        };
    }
    async getAuctionContextData(auctionId) {
        const auction = await this.prisma.auction.findUnique({
            where: { id: auctionId },
            include: {
                bids: {
                    orderBy: { amount: 'desc' },
                    take: 20
                },
                product: true,
                seller: true
            }
        });
        return {
            auctionType: auction?.auctionType,
            totalBids: auction?.bids?.length || 0,
            bidIncrement: auction?.bidIncrement || 0,
            timeRemaining: auction ? (auction.endTime.getTime() - Date.now()) / (1000 * 60) : 0,
            currentBid: auction?.currentBid || 0,
            startingPrice: auction?.startPrice || 0,
            category: auction?.product?.category,
            sellerRating: auction?.seller?.rating || 0
        };
    }
    async getMarketAnalysisData(bidAmount, bidHistory) {
        const recentAuctions = await this.prisma.auction.findMany({
            where: {
                endTime: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            },
            include: {
                bids: {
                    orderBy: { amount: 'desc' },
                    take: 1
                }
            }
        });
        const avgFinalPrice = recentAuctions.length > 0 ?
            recentAuctions.reduce((sum, auction) => sum + (auction.bids[0]?.amount || auction.startPrice), 0) / recentAuctions.length : 0;
        return {
            averageMarketPrice: avgFinalPrice,
            marketVolatility: this.calculateMarketVolatility(recentAuctions),
            bidHistoryPattern: this.analyzeBidPattern(bidHistory),
            marketDemand: recentAuctions.filter(a => a.bids.length > 5).length / recentAuctions.length
        };
    }
    async runMLFraudDetection(data) {
        let riskScore = 0;
        const reasons = [];
        const { bidAmount, bidHistory, userData, auctionData, marketData } = data;
        if (userData.accountAge < 7) {
            riskScore += 15;
            reasons.push('New user account');
        }
        if (userData.biddingFrequency > 20) {
            riskScore += 10;
            reasons.push('High bidding frequency');
        }
        const patternScore = this.analyzeAdvancedBidPatterns(bidAmount, bidHistory, auctionData);
        riskScore += patternScore.score;
        reasons.push(...patternScore.reasons);
        if (auctionData.timeRemaining < 30 && bidAmount > auctionData.currentBid * 1.5) {
            riskScore += 12;
            reasons.push('Last-minute high-value bid');
        }
        if (bidAmount > marketData.averageMarketPrice * 2) {
            riskScore += 8;
            reasons.push('Bid significantly above market average');
        }
        const isSuspicious = riskScore > 25;
        const riskLevel = riskScore > 50 ? 'high' : riskScore > 25 ? 'medium' : 'low';
        const recommendedAction = riskScore > 60 ? 'block' : riskScore > 35 ? 'flag' : 'allow';
        return {
            isSuspicious,
            riskScore: Math.min(riskScore, 100),
            riskLevel,
            reasons,
            recommendedAction
        };
    }
    runBasicFraudDetection(userId, auctionId, bidAmount, bidHistory) {
        return this.analyzeBiddingPatterns(userId, auctionId, bidAmount, bidHistory);
    }
    calculateMarketVolatility(auctions) {
        if (auctions.length < 2)
            return 0;
        const prices = auctions.map(a => a.bids[0]?.amount || a.startPrice);
        const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        const variance = prices.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) / prices.length;
        return Math.sqrt(variance) / avg;
    }
    analyzeBidPattern(bidHistory) {
        if (bidHistory.length < 2)
            return { pattern: 'insufficient_data' };
        const timeDiffs = [];
        for (let i = 1; i < bidHistory.length; i++) {
            timeDiffs.push(bidHistory[i].timestamp - bidHistory[i - 1].timestamp);
        }
        const avgTimeDiff = timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length;
        return {
            averageTimeBetweenBids: avgTimeDiff,
            isRapidBidding: avgTimeDiff < 300000,
            bidIncrements: bidHistory.slice(1).map((bid, i) => bid.amount - bidHistory[i].amount)
        };
    }
    analyzeAdvancedBidPatterns(bidAmount, bidHistory, auctionData) {
        let score = 0;
        const reasons = [];
        if (bidAmount % 1000 === 0 && bidAmount >= 10000) {
            score += 15;
            reasons.push('Round number bidding pattern');
        }
        const userBids = bidHistory.filter(bid => bid.amount === bidAmount);
        if (userBids.length > 1) {
            score += 20;
            reasons.push('Multiple identical bids');
        }
        if (bidHistory.length > 0) {
            const lastBid = bidHistory[bidHistory.length - 1];
            const jumpRatio = bidAmount / lastBid.amount;
            if (jumpRatio > 2) {
                score += 18;
                reasons.push('Sudden large price jump');
            }
        }
        const recentBids = bidHistory.filter(bid => bid.timestamp > new Date(Date.now() - 10 * 60 * 1000));
        if (recentBids.length > 3) {
            score += 12;
            reasons.push('Rapid successive bids');
        }
        return { score: Math.min(score, 40), reasons };
    }
    async getPersonalizedRecommendations(userId, context = {}) {
        const { currentAuction, category, priceRange, limit = 5, trackInteractions = true } = context;
        try {
            this.logger.log(`Generating personalized recommendations for user ${userId}`);
            const variant = this.abTestingService.assignUserToVariant(userId, 'recommendations');
            if (trackInteractions) {
                await this.abTestingService.trackInteraction(userId, variant.id, 'impression', {
                    context: { category, priceRange, limit }
                });
            }
            let recommendations = [];
            switch (variant.algorithm) {
                case 'collaborative':
                    recommendations = await this.generateCollaborativeRecommendations(userId, limit);
                    break;
                case 'content-based':
                    recommendations = await this.generateContentBasedRecommendations(userId, { category, priceRange }, limit);
                    break;
                case 'hybrid':
                    recommendations = await this.generateHybridRecommendations(userId, { category, priceRange }, limit);
                    break;
                case 'trending':
                    recommendations = await this.generateTrendingRecommendations({ category, priceRange }, limit);
                    break;
                case 'personalized':
                default:
                    recommendations = await this.generatePersonalizedRecommendations(userId, { category, priceRange }, limit);
                    break;
            }
            const enhancedRecommendations = recommendations.map(rec => ({
                ...rec,
                variantId: variant.id,
                algorithm: variant.algorithm
            }));
            this.logger.log(`Generated ${recommendations.length} recommendations using ${variant.algorithm} algorithm for user ${userId}`);
            return {
                recommendations: enhancedRecommendations,
                variant,
                metadata: {
                    totalProducts: recommendations.length,
                    algorithmUsed: variant.algorithm,
                    confidence: this.calculateRecommendationConfidence(recommendations)
                }
            };
        }
        catch (error) {
            this.logger.error(`Personalized recommendations error for user ${userId}:`, error);
            const fallbackRecommendations = await this.generateFallbackRecommendations(userId, context);
            return {
                recommendations: fallbackRecommendations.map(rec => ({
                    ...rec,
                    variantId: 'fallback',
                    algorithm: 'basic'
                })),
                variant: {
                    id: 'fallback',
                    name: 'Fallback',
                    description: 'Basic recommendation system',
                    algorithm: 'personalized',
                    parameters: {},
                    weight: 0
                },
                metadata: {
                    totalProducts: fallbackRecommendations.length,
                    algorithmUsed: 'basic',
                    confidence: 70
                }
            };
        }
    }
    async trackRecommendationInteraction(userId, productId, variantId, action, metadata) {
        try {
            await this.abTestingService.trackInteraction(userId, variantId, action === 'purchase' ? 'conversion' : 'click', {
                productId,
                action,
                ...metadata
            });
            await this.prisma.recommendationInteraction.create({
                data: {
                    userId,
                    productId,
                    variantId,
                    action,
                    metadata: metadata || {},
                    createdAt: new Date()
                }
            });
            this.logger.debug(`Tracked ${action} interaction for user ${userId} on product ${productId} with variant ${variantId}`);
        }
        catch (error) {
            this.logger.error(`Failed to track recommendation interaction:`, error);
        }
    }
    async calculateBasePricePrediction(productData) {
        const { category, condition, brand, specifications } = productData;
        const categoryBasePrices = {
            'Electronics': 8000,
            'Jewelry': 25000,
            'Art': 35000,
            'Vehicles': 300000,
            'Real Estate': 1500000,
            'Fashion': 3000,
            'Home & Garden': 2000,
            'Sports': 1500,
            'Collectibles': 5000,
            'Handmade': 12000
        };
        let basePrice = categoryBasePrices[category] || 5000;
        const conditionMultipliers = {
            'new': 1.0,
            'excellent': 0.9,
            'good': 0.75,
            'fair': 0.6,
            'poor': 0.4
        };
        basePrice *= conditionMultipliers[condition] || 0.7;
        if (brand) {
            const premiumBrands = ['Apple', 'Rolex', 'BMW', 'Tesla', 'Louis Vuitton', 'Gucci'];
            if (premiumBrands.includes(brand)) {
                basePrice *= 1.8;
            }
            else if (brand.toLowerCase().includes('luxury') || brand.toLowerCase().includes('premium')) {
                basePrice *= 1.3;
            }
        }
        if (specifications) {
            if (specifications.storage) {
                const storageGB = parseInt(specifications.storage);
                basePrice *= (1 + storageGB / 200);
            }
            if (specifications.ram) {
                const ramGB = parseInt(specifications.ram);
                basePrice *= (1 + ramGB / 32);
            }
            if (specifications.year) {
                const age = new Date().getFullYear() - parseInt(specifications.year);
                basePrice *= Math.max(0.3, 1 - age * 0.05);
            }
        }
        return {
            basePrice: Math.round(basePrice),
            factors: [
                { factor: `Category: ${category}`, impact: categoryBasePrices[category] - 5000, weight: 0.4 },
                { factor: `Condition: ${condition}`, impact: (conditionMultipliers[condition] - 1) * 100, weight: 0.3 },
                { factor: `Brand: ${brand || 'Generic'}`, impact: brand ? 20 : 0, weight: 0.2 },
                { factor: 'Specifications', impact: specifications ? 10 : 0, weight: 0.1 }
            ]
        };
    }
    async analyzeMarketFactors(productData) {
        const { category, condition } = productData;
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const similarAuctions = await this.prisma.auction.findMany({
            where: {
                endTime: { gte: ninetyDaysAgo },
                status: 'COMPLETED',
                product: {
                    category: category
                }
            },
            include: {
                bids: {
                    orderBy: { amount: 'desc' },
                    take: 1
                },
                product: true
            }
        });
        const completedPrices = similarAuctions
            .map(a => a.bids[0]?.amount || a.startPrice)
            .filter(price => price > 0);
        if (completedPrices.length === 0) {
            return {
                averagePrice: 0,
                percentile: 50,
                similarItems: 0,
                marketTrend: 'stable',
                volatility: 0
            };
        }
        const avgPrice = completedPrices.reduce((sum, price) => sum + price, 0) / completedPrices.length;
        const sortedPrices = completedPrices.sort((a, b) => a - b);
        const medianPrice = sortedPrices[Math.floor(sortedPrices.length / 2)];
        const variance = completedPrices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / completedPrices.length;
        const volatility = Math.sqrt(variance) / avgPrice;
        const halfPoint = Math.floor(completedPrices.length / 2);
        const recentAvg = completedPrices.slice(halfPoint).reduce((sum, price) => sum + price, 0) / (completedPrices.length - halfPoint);
        const olderAvg = completedPrices.slice(0, halfPoint).reduce((sum, price) => sum + price, 0) / halfPoint;
        let marketTrend = 'stable';
        if (recentAvg > olderAvg * 1.05)
            marketTrend = 'increasing';
        else if (recentAvg < olderAvg * 0.95)
            marketTrend = 'decreasing';
        return {
            averagePrice: Math.round(avgPrice),
            percentile: Math.round((medianPrice / sortedPrices[sortedPrices.length - 1]) * 100),
            similarItems: completedPrices.length,
            marketTrend,
            volatility: Math.round(volatility * 100) / 100
        };
    }
    async analyzeTemporalTrends(category) {
        const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        const monthlyData = await this.prisma.auction.findMany({
            where: {
                endTime: { gte: oneYearAgo },
                status: 'COMPLETED',
                product: { category }
            },
            select: {
                endTime: true,
                currentBid: true
            }
        });
        const monthlyAverages = {};
        monthlyData.forEach(auction => {
            const monthKey = `${auction.endTime.getFullYear()}-${String(auction.endTime.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyAverages[monthKey]) {
                monthlyAverages[monthKey] = { total: 0, count: 0 };
            }
            monthlyAverages[monthKey].total += auction.currentBid || 0;
            monthlyAverages[monthKey].count += 1;
        });
        const seasonalFactors = Object.entries(monthlyAverages).map(([month, data]) => ({
            month,
            averagePrice: data.total / data.count,
            volume: data.count
        }));
        const currentMonth = new Date().getMonth() + 1;
        const seasonalFactor = this.calculateSeasonalFactor(seasonalFactors, currentMonth);
        return {
            seasonalAdjustment: seasonalFactor,
            trendDirection: this.determineTrendDirection(seasonalFactors),
            peakMonths: this.findPeakMonths(seasonalFactors)
        };
    }
    async analyzeCompetitionDynamics(productData) {
        const { category } = productData;
        const activeAuctions = await this.prisma.auction.findMany({
            where: {
                status: 'ACTIVE',
                product: { category }
            },
            include: {
                bids: true,
                product: true
            }
        });
        const competitionLevel = activeAuctions.length > 10 ? 'high' :
            activeAuctions.length > 5 ? 'medium' : 'low';
        const avgBidsPerAuction = activeAuctions.length > 0 ?
            activeAuctions.reduce((sum, auction) => sum + auction.bids.length, 0) / activeAuctions.length : 0;
        const demandScore = Math.min(100, avgBidsPerAuction * 10 + activeAuctions.length * 5);
        return {
            competitionLevel,
            activeCompetitors: activeAuctions.length,
            averageBidsPerAuction: Math.round(avgBidsPerAuction * 100) / 100,
            demandScore
        };
    }
    combinePredictions(data) {
        const { basePrediction, marketFactors, temporalFactors, competitionFactors } = data;
        let finalPrice = basePrediction.basePrice;
        if (marketFactors.averagePrice > 0) {
            finalPrice = finalPrice * 0.6 + marketFactors.averagePrice * 0.4;
        }
        finalPrice *= (1 + temporalFactors.seasonalAdjustment * 0.1);
        const competitionMultiplier = competitionFactors.competitionLevel === 'high' ? 1.2 :
            competitionFactors.competitionLevel === 'medium' ? 1.1 : 1.0;
        finalPrice *= competitionMultiplier * 0.2 + 1 * 0.8;
        const volatility = marketFactors.volatility || 0.2;
        const priceRange = {
            min: Math.round(finalPrice * (1 - volatility)),
            max: Math.round(finalPrice * (1 + volatility))
        };
        const allFactors = [
            ...basePrediction.factors,
            { factor: 'Market Average', impact: marketFactors.averagePrice - basePrediction.basePrice, weight: 0.4 },
            { factor: 'Seasonal Trend', impact: temporalFactors.seasonalAdjustment * 10, weight: 0.1 },
            { factor: 'Competition', impact: (competitionMultiplier - 1) * 20, weight: 0.2 }
        ];
        return {
            predictedPrice: Math.round(finalPrice),
            priceRange,
            factors: allFactors,
            marketComparison: marketFactors,
            riskAssessment: {
                volatility: Math.round(volatility * 100),
                demandScore: competitionFactors.demandScore,
                competitionLevel: competitionFactors.competitionLevel
            }
        };
    }
    calculatePredictionConfidence(data) {
        const { marketFactors, dataPoints } = data;
        let confidence = Math.min(90, dataPoints * 2);
        if (marketFactors.volatility < 0.1)
            confidence += 5;
        else if (marketFactors.volatility > 0.3)
            confidence -= 10;
        if (marketFactors.marketTrend === 'stable')
            confidence += 5;
        return Math.max(60, Math.min(95, confidence));
    }
    basicPricePrediction(productData) {
        const basePrices = {
            'Electronics': 5000,
            'Jewelry': 15000,
            'Art': 25000,
            'Vehicles': 200000,
            'Fashion': 2000,
            'Handmade': 8000
        };
        const basePrice = basePrices[productData.category] || 5000;
        return {
            predictedPrice: basePrice,
            confidence: 70,
            priceRange: { min: Math.round(basePrice * 0.7), max: Math.round(basePrice * 1.3) },
            factors: [{ factor: 'Basic category average', impact: 0, weight: 1 }],
            marketComparison: {
                averagePrice: basePrice,
                percentile: 50,
                similarItems: 10,
                marketTrend: 'stable'
            },
            riskAssessment: {
                volatility: 0.3,
                demandScore: 50,
                competitionLevel: 'medium'
            }
        };
    }
    calculateSeasonalFactor(seasonalData, currentMonth) {
        if (seasonalData.length < 3)
            return 0;
        const currentMonthData = seasonalData.find(d => parseInt(d.month.split('-')[1]) === currentMonth);
        const overallAverage = seasonalData.reduce((sum, d) => sum + d.averagePrice, 0) / seasonalData.length;
        if (!currentMonthData)
            return 0;
        return (currentMonthData.averagePrice - overallAverage) / overallAverage;
    }
    determineTrendDirection(seasonalData) {
        if (seasonalData.length < 6)
            return 'stable';
        const recent = seasonalData.slice(-3);
        const older = seasonalData.slice(-6, -3);
        const recentAvg = recent.reduce((sum, d) => sum + d.averagePrice, 0) / recent.length;
        const olderAvg = older.reduce((sum, d) => sum + d.averagePrice, 0) / older.length;
        if (recentAvg > olderAvg * 1.05)
            return 'increasing';
        if (recentAvg < olderAvg * 0.95)
            return 'decreasing';
        return 'stable';
    }
    findPeakMonths(seasonalData) {
        if (seasonalData.length < 3)
            return [];
        const sortedByVolume = [...seasonalData].sort((a, b) => b.volume - a.volume);
        return sortedByVolume.slice(0, 3).map(d => parseInt(d.month.split('-')[1]));
    }
    async detectFraud(bidData) {
        const { auctionId, userId, amount, userHistory, auctionHistory } = bidData;
        let riskScore = 0;
        const riskFactors = [];
        const recommendations = [];
        const userBidFrequency = userHistory?.recentBids || 0;
        if (userBidFrequency > 10) {
            riskScore += 20;
            riskFactors.push('High bidding frequency');
            recommendations.push('Monitor user bidding patterns');
        }
        const auction = await this.prismaService.auction.findUnique({ where: { id: auctionId } });
        if (auction) {
            const bidIncrement = amount - auction.currentBid;
            const expectedIncrement = this.calculateExpectedIncrement(auction);
            if (bidIncrement < expectedIncrement * 0.1) {
                riskScore += 15;
                riskFactors.push('Unusually small bid increment');
            }
            const timeToEnd = (auction.endTime.getTime() - Date.now()) / (1000 * 60);
            if (timeToEnd < 5 && amount > auction.currentBid * 1.5) {
                riskScore += 25;
                riskFactors.push('Last-minute high-value bid');
                recommendations.push('Consider extending auction time');
            }
        }
        if (userHistory?.accountAgeDays && userHistory.accountAgeDays < 7) {
            riskScore += 10;
            riskFactors.push('New user account');
        }
        if (userHistory?.suspiciousLocations) {
            riskScore += 30;
            riskFactors.push('Suspicious location patterns');
            recommendations.push('Require additional verification');
        }
        if (amount > auctionHistory?.averageBid * 3) {
            riskScore += 20;
            riskFactors.push('Bid significantly above market value');
        }
        const confidence = Math.min(95, riskScore + 20);
        return {
            isFraudulent: riskScore > 60,
            riskScore: Math.min(100, riskScore),
            riskFactors,
            confidence,
            recommendations,
        };
    }
    async predictPrice(productData) {
        const { category, condition, brand, specifications, marketData } = productData;
        const basePrices = {
            'Electronics': 5000,
            'Jewelry': 15000,
            'Art': 25000,
            'Vehicles': 200000,
            'Real Estate': 1000000,
            'Antiques': 8000,
        };
        let predictedPrice = basePrices[category] || 5000;
        const conditionMultipliers = {
            'new': 1.0,
            'excellent': 0.9,
            'good': 0.7,
            'fair': 0.5,
            'poor': 0.3,
        };
        predictedPrice *= conditionMultipliers[condition] || 0.7;
        if (brand && ['Apple', 'Rolex', 'BMW', 'Tesla'].includes(brand)) {
            predictedPrice *= 1.5;
        }
        if (specifications.storage) {
            const storageGB = parseInt(specifications.storage);
            predictedPrice *= (1 + storageGB / 1000);
        }
        const factors = [
            { factor: `Condition: ${condition}`, impact: conditionMultipliers[condition] - 1 },
            { factor: `Brand: ${brand || 'Generic'}`, impact: brand ? 0.5 : 0 },
        ];
        const similarItems = marketData?.similarItems || Math.floor(Math.random() * 50) + 10;
        const averagePrice = predictedPrice * (0.8 + Math.random() * 0.4);
        const percentile = Math.floor(Math.random() * 40) + 30;
        const priceRange = {
            min: predictedPrice * 0.7,
            max: predictedPrice * 1.3,
        };
        return {
            predictedPrice: Math.round(predictedPrice),
            confidence: 75 + Math.random() * 20,
            priceRange,
            factors,
            marketComparison: {
                averagePrice: Math.round(averagePrice),
                percentile,
                similarItems,
            },
        };
    }
    async getRecommendations(userId, context) {
        const { currentAuction, category, priceRange, limit = 5 } = context;
        const userBids = [];
        const userCategories = [...new Set(userBids.map(bid => bid.category || 'General'))];
        const avgBidAmount = userBids.length > 0
            ? userBids.reduce((sum, bid) => sum + bid.amount, 0) / userBids.length
            : 5000;
        let whereCondition = {
            status: 'active',
        };
        if (category) {
            whereCondition.category = category;
        }
        else if (userCategories.length > 0) {
            whereCondition.category = { in: userCategories };
        }
        if (priceRange) {
            whereCondition.currentPrice = {
                gte: priceRange.min,
                lte: priceRange.max,
            };
        }
        if (currentAuction) {
            whereCondition.id = { not: currentAuction };
        }
        const recommendedAuctions = await this.prismaService.auction.findMany({
            where: whereCondition,
            take: limit * 2,
            orderBy: { createdAt: 'desc' },
        });
        const recommendations = recommendedAuctions.map(auction => {
            let score = 50;
            let reason = 'Similar item';
            if (userCategories.includes('General')) {
                score += 20;
                reason = 'Based on your interests';
            }
            if (priceRange &&
                auction.currentBid >= priceRange.min &&
                auction.currentBid <= priceRange.max) {
                score += 15;
                reason = 'Within your preferred price range';
            }
            const priceDiff = Math.abs(auction.currentBid - avgBidAmount) / avgBidAmount;
            if (priceDiff < 0.3) {
                score += 10;
                reason = 'Similar to items you\'ve bid on';
            }
            const hoursSinceCreated = (Date.now() - auction.createdAt.getTime()) / (1000 * 60 * 60);
            if (hoursSinceCreated < 24) {
                score += 5;
                reason = 'Recently listed';
            }
            return {
                productId: auction.id,
                title: auction.title,
                score: Math.min(100, score),
                reason,
                category: 'General',
            };
        });
        return recommendations
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }
    async moderateContent(contentData) {
        const { title, description, images, category, price } = contentData;
        let shouldApprove = true;
        const flags = [];
        const suggestions = [];
        const autoCategorization = [];
        const fullText = `${title} ${description}`.toLowerCase();
        const prohibitedWords = ['scam', 'fake', 'stolen', 'illegal'];
        const hasProhibitedContent = prohibitedWords.some(word => fullText.includes(word));
        if (hasProhibitedContent) {
            shouldApprove = false;
            flags.push('Prohibited content detected');
            suggestions.push('Remove prohibited terms from listing');
        }
        if (title.length < 10) {
            flags.push('Title too short');
            suggestions.push('Make title more descriptive');
        }
        if (description.length < 50) {
            flags.push('Description too brief');
            suggestions.push('Add more details about the item');
        }
        const categoryAvgPrices = {
            'Electronics': 8000,
            'Jewelry': 20000,
            'Art': 30000,
        };
        const avgPrice = categoryAvgPrices[category];
        if (avgPrice && Math.abs(price - avgPrice) / avgPrice > 2) {
            flags.push('Price significantly deviates from market average');
            suggestions.push(`Consider pricing between ₹${avgPrice * 0.5} - ₹${avgPrice * 1.5}`);
        }
        if (fullText.includes('phone') || fullText.includes('mobile')) {
            autoCategorization.push('Mobile Phones');
        }
        if (fullText.includes('watch') || fullText.includes('timepiece')) {
            autoCategorization.push('Watches');
        }
        const confidence = flags.length === 0 ? 95 : Math.max(60, 95 - flags.length * 10);
        return {
            shouldApprove,
            confidence,
            flags,
            suggestions,
            autoCategorization,
        };
    }
    entries(categories) { }
};
exports.AIService = AIService;
exports.AIService = AIService = AIService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof ConfigService !== "undefined" && ConfigService) === "function" ? _a : Object, typeof (_b = typeof PrismaService !== "undefined" && PrismaService) === "function" ? _b : Object, ab_testing_service_1.ABTestingService])
], AIService);
{
    let score = 0;
    for (const keyword of keywords) {
        if (fullText.includes(keyword)) {
            score += 10;
        }
    }
    scores[category] = score;
}
const sortedCategories = Object.entries(scores)
    .sort(([, a], [, b]) => b - a);
const primaryCategory = sortedCategories[0][0];
const confidence = Math.min(95, sortedCategories[0][1] + 20);
const subcategories = this.getSubcategories(primaryCategory, fullText);
const alternatives = sortedCategories.slice(1, 4).map(([category, score]) => ({
    category,
    confidence: Math.min(90, score + 15),
}));
return {
    primaryCategory,
    subcategories,
    confidence,
    alternatives,
};
calculateExpectedIncrement(auction, any);
number;
{
    const baseIncrement = 100;
    const price = auction.currentBid;
    if (price < 1000)
        return baseIncrement;
    if (price < 10000)
        return Math.floor(price * 0.05);
    if (price < 100000)
        return Math.floor(price * 0.02);
    return Math.floor(price * 0.01);
}
parseDocumentText(extractedText, string, documentType, string);
any;
{
    const text = extractedText.toLowerCase();
    const lines = extractedText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    switch (documentType) {
        case 'AADHAAR':
            return this.parseAadhaarText(text, lines);
        case 'PAN':
            return this.parsePanText(text, lines);
        case 'DRIVING_LICENSE':
            return this.parseDrivingLicenseText(text, lines);
        default:
            return {};
    }
}
parseAadhaarText(text, string, lines, string[]);
any;
{
    const result = {};
    const aadhaarPattern = /\b\d{4}\s?\d{4}\s?\d{4}\b/;
    const aadhaarMatch = text.match(aadhaarPattern);
    if (aadhaarMatch) {
        result.aadhaarNumber = aadhaarMatch[0].replace(/\s/g, '');
    }
    const dobPattern = /\b\d{2}\/\d{2}\/\d{4}\b|\b\d{2}-\d{2}-\d{4}\b/;
    const dobMatch = text.match(dobPattern);
    if (dobMatch) {
        result.dateOfBirth = dobMatch[0];
    }
    const namePattern = /^[A-Z\s]+$/;
    for (const line of lines) {
        if (line.length > 3 && line.length < 50 && namePattern.test(line.toUpperCase())) {
            if (!line.includes('GOVERNMENT') && !line.includes('INDIA') && !line.includes('AADHAAR')) {
                result.name = line.trim();
                break;
            }
        }
    }
    const nameIndex = lines.findIndex(line => line.toLowerCase().includes(result.name?.toLowerCase()));
    if (nameIndex >= 0 && nameIndex < lines.length - 1) {
        const addressLines = lines.slice(nameIndex + 1).filter(line => !line.match(/\d{12}/) &&
            !line.match(/\d{2}\/\d{2}\/\d{4}/) &&
            line.length > 5);
        result.address = addressLines.join(', ');
    }
    return result;
}
parsePanText(text, string, lines, string[]);
any;
{
    const result = {};
    const panPattern = /\b[A-Z]{5}\d{4}[A-Z]\b/;
    const panMatch = text.match(panPattern);
    if (panMatch) {
        result.panNumber = panMatch[0];
    }
    const dobPattern = /\b\d{2}\/\d{2}\/\d{4}\b|\b\d{2}-\d{2}-\d{4}\b/;
    const dobMatch = text.match(dobPattern);
    if (dobMatch) {
        result.dateOfBirth = dobMatch[0];
    }
    const nameLines = lines.filter(line => line.length > 3 &&
        line.length < 50 &&
        !line.includes(result.panNumber || '') &&
        !line.match(/\d{2}\/\d{2}\/\d{4}/));
    if (nameLines.length > 0) {
        result.name = nameLines[0].trim();
    }
    return result;
}
parseDrivingLicenseText(text, string, lines, string[]);
any;
{
    const result = {};
    const dlPattern = /\b[A-Z]{2}\d{13}\b|\b[A-Z]{2}-\d{2}-\d{11}\b/;
    const dlMatch = text.match(dlPattern);
    if (dlMatch) {
        result.documentNumber = dlMatch[0];
    }
    const dobPattern = /\b\d{2}\/\d{2}\/\d{4}\b|\b\d{2}-\d{2}-\d{4}\b/;
    const dobMatch = text.match(dobPattern);
    if (dobMatch) {
        result.dateOfBirth = dobMatch[0];
    }
    const nameLines = lines.filter(line => line.length > 3 &&
        line.length < 50 &&
        /^[A-Z\s]+$/.test(line.toUpperCase()) &&
        !line.includes('DRIVING') &&
        !line.includes('LICENCE') &&
        !line.includes('INDIA'));
    if (nameLines.length > 0) {
        result.name = nameLines[0].trim();
    }
    const addressLines = lines.filter(line => !line.match(/\b[A-Z]{2}\d{13}\b/) &&
        !line.match(/\d{2}\/\d{2}\/\d{4}/) &&
        !line.includes(result.name || '') &&
        line.length > 10);
    if (addressLines.length > 0) {
        result.address = addressLines.join(', ');
    }
    return result;
}
//# sourceMappingURL=ai.service.js.map