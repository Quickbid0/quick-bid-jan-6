import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

export interface FraudDetectionResult {
  isFraudulent: boolean;
  riskScore: number;
  reasons: string[];
  recommendations: string[];
}

export interface AuctionOptimizationSuggestion {
  auctionType: 'timed' | 'flash' | 'live';
  suggestedPrice: number;
  duration: number;
  confidence: number;
  reasoning: string[];
}

export interface AssetCategorization {
  category: string;
  subcategory: string;
  predictedValue: number;
  riskScore: number;
  marketTrends: string[];
  recommendations: string[];
}

export interface SupportQuery {
  query: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  suggestedResponse: string;
  escalationRequired: boolean;
}

export interface TelecallerAssignment {
  telecallerId: string;
  leadId: string;
  priority: number;
  reasoning: string;
  expectedConversionRate: number;
}

@Injectable()
export class CompanyAIAgentsService {
  private readonly logger = new Logger(CompanyAIAgentsService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  // 1️⃣ AI Fraud Detection Agent
  async detectFraud(productId: string, companyId: string): Promise<FraudDetectionResult> {
    this.logger.log(`Running fraud detection for product ${productId} in company ${companyId}`);

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { company: true },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Simulated fraud detection logic
    const fraudIndicators: string[] = [];
    let riskScore = 0;

    // Check for duplicate uploads
    const duplicates = await this.checkForDuplicates(product);
    if (duplicates.length > 0) {
      fraudIndicators.push(`Found ${duplicates.length} potential duplicate listings`);
      riskScore += 30;
    }

    // Check price manipulation
    const priceAnomaly = await this.detectPriceManipulation(product);
    if (priceAnomaly) {
      fraudIndicators.push('Price significantly deviates from market average');
      riskScore += 25;
    }

    // Check suspicious bidding patterns on company vehicles
    const biddingAnomaly = await this.detectSuspiciousBidding(productId);
    if (biddingAnomaly) {
      fraudIndicators.push('Unusual bidding activity detected');
      riskScore += 20;
    }

    // Additional checks
    if (product.bulkUploadBatchId) {
      fraudIndicators.push('Bulk uploaded vehicle - requires manual verification');
      riskScore += 10;
    }

    const isFraudulent = riskScore > 50;
    const recommendations = this.generateRecommendations(isFraudulent, riskScore, fraudIndicators);

    // Log fraud detection result
    await this.auditService.logActivity(product.sellerId, 'FRAUD_DETECTION_COMPLETED', {
      productId,
      companyId,
      riskScore,
      isFraudulent,
      indicators: fraudIndicators,
    });

    return {
      isFraudulent,
      riskScore,
      reasons: fraudIndicators,
      recommendations,
    };
  }

  // 2️⃣ AI Auction Optimizer Agent
  async optimizeAuction(productId: string): Promise<AuctionOptimizationSuggestion> {
    this.logger.log(`Optimizing auction for product ${productId}`);

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        _count: {
          select: { auctions: true },
        },
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Analyze past auction data
    const pastAuctions = await this.getPastAuctionData(product.category);
    const marketTrends = await this.analyzeMarketTrends(product.category);

    // Determine optimal auction type
    let auctionType: 'timed' | 'flash' | 'live' = 'timed';
    let duration = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    let suggestedPrice = product.price;
    let confidence = 0.7;

    // Logic for auction type selection
    if (marketTrends.highDemand && marketTrends.competition > 0.8) {
      auctionType = 'live';
      duration = 2 * 60 * 60 * 1000; // 2 hours
      suggestedPrice = product.price * 1.1; // Increase by 10%
    } else if (pastAuctions.averageDuration < 3 * 24 * 60 * 60 * 1000) {
      auctionType = 'flash';
      duration = 1 * 60 * 60 * 1000; // 1 hour
    }

    // Price optimization based on historical data
    if (pastAuctions.averageFinalPrice > product.price * 1.2) {
      suggestedPrice = product.price * 1.15;
    } else if (pastAuctions.averageFinalPrice < product.price * 0.8) {
      suggestedPrice = product.price * 0.9;
    }

    const reasoning = [
      `Market demand for ${product.category}: ${marketTrends.highDemand ? 'High' : 'Moderate'}`,
      `Competition level: ${(marketTrends.competition * 100).toFixed(1)}%`,
      `Historical average final price: ₹${pastAuctions.averageFinalPrice.toLocaleString()}`,
      `Suggested auction type: ${auctionType} based on market conditions`,
    ];

    return {
      auctionType,
      suggestedPrice,
      duration,
      confidence,
      reasoning,
    };
  }

  // 3️⃣ AI Repo Asset Categorizer
  async categorizeAsset(productId: string): Promise<AssetCategorization> {
    this.logger.log(`Categorizing asset for product ${productId}`);

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Simulated asset categorization
    const category = this.determineCategory(product.title, product.description);
    const subcategory = this.determineSubcategory(product.title, product.description);
    const predictedValue = await this.predictAssetValue(product);
    const riskScore = this.calculateRiskScore(product);

    // Market trends analysis
    const marketTrends = await this.getMarketTrends(category, subcategory);

    // Generate recommendations
    const recommendations = this.generateAssetRecommendations(predictedValue, riskScore, marketTrends);

    return {
      category,
      subcategory,
      predictedValue,
      riskScore,
      marketTrends,
      recommendations,
    };
  }

  // 4️⃣ AI Support Agent
  async processSupportQuery(query: string, userId: string, companyId?: string): Promise<SupportQuery> {
    this.logger.log(`Processing support query from user ${userId}`);

    // Categorize the query
    const category = this.categorizeQuery(query);
    const priority = this.determinePriority(query, category);

    // Generate suggested response
    const suggestedResponse = this.generateSupportResponse(query, category);

    // Determine if escalation is required
    const escalationRequired = this.needsEscalation(query, category, priority);

    return {
      query,
      category,
      priority,
      suggestedResponse,
      escalationRequired,
    };
  }

  // 5️⃣ AI Telecaller Assignment Agent
  async assignTelecaller(companyId: string, leadId: string): Promise<TelecallerAssignment> {
    this.logger.log(`Assigning telecaller for lead ${leadId} in company ${companyId}`);

    // Get available telecallers for the company
    const telecallers = await this.getAvailableTelecallers(companyId);
    const leadData = await this.getLeadData(leadId);

    if (telecallers.length === 0) {
      throw new Error('No available telecallers');
    }

    // Calculate assignment priority and expected conversion rate
    const assignments = await Promise.all(
      telecallers.map(async (telecaller) => {
        const priority = await this.calculateAssignmentPriority(telecaller, leadData);
        const conversionRate = await this.predictConversionRate(telecaller, leadData);
        return { telecaller, priority, conversionRate };
      })
    );

    // Select best telecaller
    const bestAssignment = assignments.sort((a, b) => b.priority - a.priority)[0];

    const reasoning = [
      `Selected telecaller ${bestAssignment.telecaller.name}`,
      `Priority score: ${bestAssignment.priority.toFixed(2)}`,
      `Expected conversion rate: ${(bestAssignment.conversionRate * 100).toFixed(1)}%`,
      `Based on telecaller performance history and lead characteristics`,
    ];

    return {
      telecallerId: bestAssignment.telecaller.id,
      leadId,
      priority: bestAssignment.priority,
      reasoning: reasoning.join('. '),
      expectedConversionRate: bestAssignment.conversionRate,
    };
  }

  // Helper methods
  private async checkForDuplicates(product: any): Promise<any[]> {
    // Simulated duplicate detection
    return []; // In real implementation, would check similar products
  }

  private async detectPriceManipulation(product: any): Promise<boolean> {
    // Simulated price anomaly detection
    return Math.random() > 0.8; // 20% chance of anomaly
  }

  private async detectSuspiciousBidding(productId: string): Promise<boolean> {
    // Simulated bidding anomaly detection
    return Math.random() > 0.9; // 10% chance of suspicious activity
  }

  private generateRecommendations(isFraudulent: boolean, riskScore: number, indicators: string[]): string[] {
    const recommendations = [];

    if (isFraudulent) {
      recommendations.push('Block this listing immediately');
      recommendations.push('Investigate seller account');
      recommendations.push('Review all listings from this company');
    } else if (riskScore > 30) {
      recommendations.push('Require additional documentation');
      recommendations.push('Manual review recommended');
      recommendations.push('Monitor bidding activity closely');
    } else {
      recommendations.push('Listing appears legitimate');
      recommendations.push('Proceed with standard approval process');
    }

    return recommendations;
  }

  private async getPastAuctionData(category: string): Promise<any> {
    // Simulated historical data
    return {
      averageDuration: 5 * 24 * 60 * 60 * 1000, // 5 days
      averageFinalPrice: 750000,
      successRate: 0.85,
    };
  }

  private async analyzeMarketTrends(category: string): Promise<any> {
    // Simulated market analysis
    return {
      highDemand: Math.random() > 0.5,
      competition: Math.random(),
      priceTrend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
    };
  }

  private determineCategory(title: string, description: string): string {
    if (title.toLowerCase().includes('car')) return 'Car';
    if (title.toLowerCase().includes('bike')) return 'Bike';
    return 'Vehicle';
  }

  private determineSubcategory(title: string, description: string): string {
    // Simplified subcategory logic
    if (title.toLowerCase().includes('honda')) return 'Honda';
    if (title.toLowerCase().includes('maruti')) return 'Maruti Suzuki';
    return 'Other';
  }

  private async predictAssetValue(product: any): Promise<number> {
    // Simulated value prediction
    return product.price * (0.9 + Math.random() * 0.2); // ±10% variation
  }

  private calculateRiskScore(product: any): number {
    let score = 0;
    if (product.bulkUploadBatchId) score += 20;
    if (product.price < 100000) score += 15;
    if (!product.images || product.images.length === 0) score += 10;
    return Math.min(score, 100);
  }

  private async getMarketTrends(category: string, subcategory: string): Promise<string[]> {
    // Simulated market trends
    return [
      'Increasing demand for fuel-efficient vehicles',
      'Growing preference for electric vehicles',
      'Stable prices in mid-range segment',
    ];
  }

  private generateAssetRecommendations(predictedValue: number, riskScore: number, trends: string[]): string[] {
    const recommendations = [];

    if (predictedValue > 1000000) {
      recommendations.push('High-value asset - consider premium auction type');
    }

    if (riskScore > 50) {
      recommendations.push('High-risk asset - additional verification required');
    }

    recommendations.push('Monitor market trends for optimal timing');
    recommendations.push('Consider bundling with similar assets');

    return recommendations;
  }

  private categorizeQuery(query: string): string {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('upload') || lowerQuery.includes('bulk')) return 'Bulk Upload';
    if (lowerQuery.includes('auction') || lowerQuery.includes('bid')) return 'Auction Support';
    if (lowerQuery.includes('payment') || lowerQuery.includes('wallet')) return 'Payment Issues';
    return 'General Support';
  }

  private determinePriority(query: string, category: string): 'low' | 'medium' | 'high' {
    if (category === 'Payment Issues') return 'high';
    if (query.toLowerCase().includes('urgent') || query.toLowerCase().includes('emergency')) return 'high';
    if (category === 'Bulk Upload') return 'medium';
    return 'low';
  }

  private generateSupportResponse(query: string, category: string): string {
    // Simulated response generation
    const responses = {
      'Bulk Upload': 'For bulk upload issues, please ensure your CSV file follows the correct format. Check our documentation for the required columns.',
      'Auction Support': 'Auction-related queries are handled by our specialized team. Please provide more details about your concern.',
      'Payment Issues': 'Payment issues require immediate attention. Our team will contact you within 1 hour.',
      'General Support': 'Thank you for your query. Our support team will get back to you within 24 hours.',
    };

    return responses[category] || responses['General Support'];
  }

  private needsEscalation(query: string, category: string, priority: string): boolean {
    return priority === 'high' || category === 'Payment Issues';
  }

  private async getAvailableTelecallers(companyId: string): Promise<any[]> {
    // Simulated telecaller data
    return [
      { id: 'tc1', name: 'Rahul Sharma', performance: 0.85, specialization: 'high-value' },
      { id: 'tc2', name: 'Priya Patel', performance: 0.92, specialization: 'general' },
      { id: 'tc3', name: 'Amit Kumar', performance: 0.78, specialization: 'repo-assets' },
    ];
  }

  private async getLeadData(leadId: string): Promise<any> {
    // Simulated lead data
    return {
      value: Math.random() * 1000000,
      category: 'car',
      urgency: Math.random() > 0.7 ? 'high' : 'normal',
      location: 'Mumbai',
    };
  }

  private async calculateAssignmentPriority(telecaller: any, lead: any): Promise<number> {
    let priority = telecaller.performance;

    // Specialization match
    if (telecaller.specialization === 'high-value' && lead.value > 500000) {
      priority += 0.2;
    }
    if (telecaller.specialization === 'repo-assets' && lead.category === 'repo') {
      priority += 0.15;
    }

    // Urgency factor
    if (lead.urgency === 'high') {
      priority += 0.1;
    }

    return Math.min(priority, 1.0);
  }

  private async predictConversionRate(telecaller: any, lead: any): Promise<number> {
    // Simulated conversion prediction
    return telecaller.performance * (0.7 + Math.random() * 0.3);
  }
}
