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
exports.AIService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AIService = class AIService {
    constructor(prismaService) {
        this.prismaService = prismaService;
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
    async categorizeProduct(productData) {
        const { title, description } = productData;
        const fullText = `${title} ${description}`.toLowerCase();
        const categories = {
            'Electronics': ['phone', 'laptop', 'computer', 'tablet', 'tv', 'television', 'camera', 'headphones'],
            'Jewelry': ['ring', 'necklace', 'bracelet', 'watch', 'earrings', 'diamond', 'gold', 'silver'],
            'Art': ['painting', 'sculpture', 'artwork', 'canvas', 'artist', 'gallery'],
            'Vehicles': ['car', 'bike', 'motorcycle', 'scooter', 'truck', 'vehicle', 'automobile'],
            'Fashion': ['dress', 'shirt', 'pants', 'shoes', 'bag', 'jewelry', 'watch'],
            'Home & Garden': ['furniture', 'chair', 'table', 'lamp', 'decor', 'garden', 'plant'],
            'Sports': ['bicycle', 'equipment', 'gear', 'fitness', 'sports', 'exercise'],
            'Collectibles': ['antique', 'vintage', 'rare', 'collection', 'collectible'],
        };
        const scores = {};
        for (const [category, keywords] of Object.entries(categories)) {
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
    }
    calculateExpectedIncrement(auction) {
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
    getSubcategories(category, text) {
        const subcategoryMap = {
            'Electronics': ['Mobile Phones', 'Laptops', 'Tablets', 'Cameras', 'Headphones'],
            'Jewelry': ['Rings', 'Necklaces', 'Watches', 'Earrings', 'Bracelets'],
            'Fashion': ['Men\'s Clothing', 'Women\'s Clothing', 'Shoes', 'Bags', 'Accessories'],
        };
        return subcategoryMap[category] || [];
    }
};
exports.AIService = AIService;
exports.AIService = AIService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AIService);
//# sourceMappingURL=ai.service.js.map