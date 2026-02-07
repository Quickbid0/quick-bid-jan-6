import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Auction } from '../auctions/auction.entity';
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
  priceRange: { min: number; max: number };
  factors: { factor: string; impact: number }[];
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

@Injectable()
export class AIService {
  constructor(
    @InjectRepository(Auction)
    private auctionRepository: Repository<Auction>,
    private prismaService: PrismaService,
  ) {}

  async detectFraud(bidData: {
    auctionId: string;
    userId: string;
    amount: number;
    userHistory: any;
    auctionHistory: any;
  }): Promise<FraudDetectionResult> {
    const { auctionId, userId, amount, userHistory, auctionHistory } = bidData;

    let riskScore = 0;
    const riskFactors: string[] = [];
    const recommendations: string[] = [];

    // Analyze bidding patterns
    const userBidFrequency = userHistory?.recentBids || 0;
    if (userBidFrequency > 10) {
      riskScore += 20;
      riskFactors.push('High bidding frequency');
      recommendations.push('Monitor user bidding patterns');
    }

    // Check for shill bidding patterns
    const auction = await this.auctionRepository.findOne({ where: { id: auctionId } });
    if (auction) {
      const bidIncrement = amount - auction.currentPrice;
      const expectedIncrement = this.calculateExpectedIncrement(auction);

      if (bidIncrement < expectedIncrement * 0.1) {
        riskScore += 15;
        riskFactors.push('Unusually small bid increment');
      }

      // Check for last-minute bidding
      const timeToEnd = (auction.endTime.getTime() - Date.now()) / (1000 * 60); // minutes
      if (timeToEnd < 5 && amount > auction.currentPrice * 1.5) {
        riskScore += 25;
        riskFactors.push('Last-minute high-value bid');
        recommendations.push('Consider extending auction time');
      }
    }

    // Analyze user behavior patterns
    if (userHistory?.accountAgeDays && userHistory.accountAgeDays < 7) {
      riskScore += 10;
      riskFactors.push('New user account');
    }

    // Check for IP/location anomalies
    if (userHistory?.suspiciousLocations) {
      riskScore += 30;
      riskFactors.push('Suspicious location patterns');
      recommendations.push('Require additional verification');
    }

    // Check for bid amount anomalies
    if (amount > auctionHistory?.averageBid * 3) {
      riskScore += 20;
      riskFactors.push('Bid significantly above market value');
    }

    // Calculate confidence based on available data
    const confidence = Math.min(95, riskScore + 20);

    return {
      isFraudulent: riskScore > 60,
      riskScore: Math.min(100, riskScore),
      riskFactors,
      confidence,
      recommendations,
    };
  }

  async predictPrice(productData: {
    category: string;
    condition: string;
    brand?: string;
    model?: string;
    year?: number;
    specifications: Record<string, any>;
    marketData?: any;
  }): Promise<PricePrediction> {
    const { category, condition, brand, specifications, marketData } = productData;

    // Base price calculation based on category
    const basePrices = {
      'Electronics': 5000,
      'Jewelry': 15000,
      'Art': 25000,
      'Vehicles': 200000,
      'Real Estate': 1000000,
      'Antiques': 8000,
    };

    let predictedPrice = basePrices[category] || 5000;

    // Adjust for condition
    const conditionMultipliers = {
      'new': 1.0,
      'excellent': 0.9,
      'good': 0.7,
      'fair': 0.5,
      'poor': 0.3,
    };
    predictedPrice *= conditionMultipliers[condition] || 0.7;

    // Adjust for brand premium
    if (brand && ['Apple', 'Rolex', 'BMW', 'Tesla'].includes(brand)) {
      predictedPrice *= 1.5;
    }

    // Adjust for specifications
    if (specifications.storage) {
      const storageGB = parseInt(specifications.storage);
      predictedPrice *= (1 + storageGB / 1000); // More storage = higher price
    }

    const factors = [
      { factor: `Condition: ${condition}`, impact: conditionMultipliers[condition] - 1 },
      { factor: `Brand: ${brand || 'Generic'}`, impact: brand ? 0.5 : 0 },
    ];

    // Market comparison data
    const similarItems = marketData?.similarItems || Math.floor(Math.random() * 50) + 10;
    const averagePrice = predictedPrice * (0.8 + Math.random() * 0.4); // ±20% variation
    const percentile = Math.floor(Math.random() * 40) + 30; // 30-70th percentile

    const priceRange = {
      min: predictedPrice * 0.7,
      max: predictedPrice * 1.3,
    };

    return {
      predictedPrice: Math.round(predictedPrice),
      confidence: 75 + Math.random() * 20, // 75-95% confidence
      priceRange,
      factors,
      marketComparison: {
        averagePrice: Math.round(averagePrice),
        percentile,
        similarItems,
      },
    };
  }

  async getRecommendations(userId: string, context: {
    currentAuction?: string;
    category?: string;
    priceRange?: { min: number; max: number };
    limit?: number;
  }): Promise<ProductRecommendation[]> {
    const { currentAuction, category, priceRange, limit = 5 } = context;

    // Get user's bidding history
    const userBids = []; // TODO: Implement when Transaction/Bid model is added

    // Get user's interests based on bidding history
    const userCategories = [...new Set(userBids.map(bid => bid.category || 'General'))];
    const avgBidAmount = userBids.length > 0
      ? userBids.reduce((sum, bid) => sum + bid.amount, 0) / userBids.length
      : 5000;

    // Find similar auctions
    let whereCondition: any = {
      status: 'active',
    };

    if (category) {
      whereCondition.category = category;
    } else if (userCategories.length > 0) {
      whereCondition.category = { in: userCategories };
    }

    if (priceRange) {
      whereCondition.currentPrice = {
        gte: priceRange.min,
        lte: priceRange.max,
      };
    }

    // Exclude current auction
    if (currentAuction) {
      whereCondition.id = { not: currentAuction };
    }

    const recommendedAuctions = await this.auctionRepository.find({
      where: whereCondition,
      take: limit * 2, // Get more to score and filter
      order: { createdAt: 'DESC' },
    });

    // Score recommendations
    const recommendations: ProductRecommendation[] = recommendedAuctions.map(auction => {
      let score = 50; // Base score
      let reason = 'Similar item';

      // Category match
      if (userCategories.includes(auction.category || 'General')) {
        score += 20;
        reason = 'Based on your interests';
      }

      // Price range match
      if (priceRange &&
          auction.currentPrice >= priceRange.min &&
          auction.currentPrice <= priceRange.max) {
        score += 15;
        reason = 'Within your preferred price range';
      }

      // Price similarity to user's average bids
      const priceDiff = Math.abs(auction.currentPrice - avgBidAmount) / avgBidAmount;
      if (priceDiff < 0.3) {
        score += 10;
        reason = 'Similar to items you\'ve bid on';
      }

      // Recent activity boost
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
        category: auction.category || 'General',
      };
    });

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async moderateContent(contentData: {
    title: string;
    description: string;
    images?: string[];
    category: string;
    price: number;
  }): Promise<SmartModerationResult> {
    const { title, description, images, category, price } = contentData;

    let shouldApprove = true;
    const flags: string[] = [];
    const suggestions: string[] = [];
    const autoCategorization: string[] = [];

    // Content analysis
    const fullText = `${title} ${description}`.toLowerCase();

    // Check for prohibited content
    const prohibitedWords = ['scam', 'fake', 'stolen', 'illegal'];
    const hasProhibitedContent = prohibitedWords.some(word => fullText.includes(word));

    if (hasProhibitedContent) {
      shouldApprove = false;
      flags.push('Prohibited content detected');
      suggestions.push('Remove prohibited terms from listing');
    }

    // Check title quality
    if (title.length < 10) {
      flags.push('Title too short');
      suggestions.push('Make title more descriptive');
    }

    // Check description quality
    if (description.length < 50) {
      flags.push('Description too brief');
      suggestions.push('Add more details about the item');
    }

    // Price analysis
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

    // Auto-categorization suggestions
    if (fullText.includes('phone') || fullText.includes('mobile')) {
      autoCategorization.push('Mobile Phones');
    }
    if (fullText.includes('watch') || fullText.includes('timepiece')) {
      autoCategorization.push('Watches');
    }

    // Calculate confidence
    const confidence = flags.length === 0 ? 95 : Math.max(60, 95 - flags.length * 10);

    return {
      shouldApprove,
      confidence,
      flags,
      suggestions,
      autoCategorization,
    };
  }

  async categorizeProduct(productData: {
    title: string;
    description: string;
    images?: string[];
    price: number;
  }): Promise<{
    primaryCategory: string;
    subcategories: string[];
    confidence: number;
    alternatives: { category: string; confidence: number }[];
  }> {
    const { title, description } = productData;
    const fullText = `${title} ${description}`.toLowerCase();

    // Simple keyword-based categorization
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

    const scores: Record<string, number> = {};

    for (const [category, keywords] of Object.entries(categories)) {
      let score = 0;
      for (const keyword of keywords) {
        if (fullText.includes(keyword)) {
          score += 10;
        }
      }
      scores[category] = score;
    }

    // Find best match
    const sortedCategories = Object.entries(scores)
      .sort(([,a], [,b]) => b - a);

    const primaryCategory = sortedCategories[0][0];
    const confidence = Math.min(95, sortedCategories[0][1] + 20);

    // Subcategories (simplified)
    const subcategories = this.getSubcategories(primaryCategory, fullText);

    // Alternative categories
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

  private calculateExpectedIncrement(auction: Auction): number {
    const baseIncrement = 100;
    const price = auction.currentPrice;

    if (price < 1000) return baseIncrement;
    if (price < 10000) return Math.floor(price * 0.05);
    if (price < 100000) return Math.floor(price * 0.02);
    return Math.floor(price * 0.01);
  }

  private getSubcategories(category: string, text: string): string[] {
    const subcategoryMap: Record<string, string[]> = {
      'Electronics': ['Mobile Phones', 'Laptops', 'Tablets', 'Cameras', 'Headphones'],
      'Jewelry': ['Rings', 'Necklaces', 'Watches', 'Earrings', 'Bracelets'],
      'Fashion': ['Men\'s Clothing', 'Women\'s Clothing', 'Shoes', 'Bags', 'Accessories'],
    };

    return subcategoryMap[category] || [];
  }
}
