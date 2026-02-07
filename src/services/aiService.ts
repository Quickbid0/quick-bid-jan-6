import { supabase } from '../config/supabaseClient';

export interface AIRecommendation {
  productId: string;
  score: number;
  reason: string;
  type: 'trending' | 'undervalued' | 'similar' | 'ending_soon';
}

export interface PricePrediction {
  currentPrice: number;
  predictedPrice: number;
  confidence: number;
  factors: string[];
}

export interface FraudDetection {
  riskScore: number;
  flags: string[];
  recommendation: 'approve' | 'review' | 'reject';
}

export interface MediaVerificationResult {
  ok: boolean;
  score: number;
  reasons: string[];
  suggestion?: string;
}

export interface FakeProductDetectionResult {
  isFake: boolean;
  confidence: number; // 0-100
  riskScore: number; // 0-100
  flags: string[];
  recommendation: 'approve' | 'manual_review' | 'reject';
}

export interface PricingSuggestion {
  suggestedPrice: number;
  minPrice: number;
  maxPrice: number;
  reasoning: string;
  marketComparison: {
    averagePrice: number;
    lowestPrice: number;
    highestPrice: number;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface FraudAnalysis {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  flags: string[];
  recommendations: string[];
  confidence: number;
}

const BRAND_PRICE_BASELINE: Record<string, number> = {
  'apple': 50000,
  'samsung': 30000,
  'rolex': 500000,
  'gucci': 20000,
  'louis vuitton': 40000,
  'nike': 5000,
  'adidas': 3000,
  'sony': 15000,
};

const SUSPICIOUS_KEYWORDS = [
  'first copy',
  '1st copy',
  'clone',
  'replica',
  'duplicate',
  'same as original',
  'master copy',
  'aaa copy',
  'fake',
  'counterfeit'
];

class AIService {
  private initialized = false;

  constructor() {
    this.initialized = true; // Always initialized since we use backend APIs
    console.log('🤖 AI Service initialized with backend APIs');
  }

  // Enhanced AI-powered fake product detection
  async detectFakeProduct(product: {
    title: string;
    description: string;
    price: number;
    brand?: string;
    category?: string;
    sellerId?: string;
  }): Promise<FakeProductDetectionResult> {
    try {
      const response = await fetch('/api/ai/fake-product-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product }),
      });

      if (!response.ok) {
        console.error('Fake product detection API error:', response.status);
        return this.runHeuristicAnalysis(product);
      }

      const result = await response.json();
      return {
        isFake: result.isFake,
        confidence: result.confidence,
        riskScore: result.riskScore,
        flags: result.flags || [],
        recommendation: result.recommendation
      };
    } catch (error) {
      console.error('AI fake product detection failed, using heuristic:', error);
      return this.runHeuristicAnalysis(product);
    }
  }

  private async runHeuristicAnalysis(product: any): Promise<FakeProductDetectionResult> {
    const flags: string[] = [];
    let riskScore = 0;

    const lowerTitle = product.title.toLowerCase();
    const lowerDesc = product.description.toLowerCase();

    // 1. Keyword Analysis
    SUSPICIOUS_KEYWORDS.forEach(keyword => {
      if (lowerTitle.includes(keyword) || lowerDesc.includes(keyword)) {
        flags.push(`Suspicious keyword found: "${keyword}"`);
        riskScore += 40;
      }
    });

    // 2. Brand Price Analysis
    if (product.brand) {
      const lowerBrand = product.brand.toLowerCase();
      const matchedBrand = Object.keys(BRAND_PRICE_BASELINE).find(b => lowerBrand.includes(b));

      if (matchedBrand) {
        const expectedPrice = BRAND_PRICE_BASELINE[matchedBrand];
        if (product.price < expectedPrice * 0.15) {
          flags.push(`Price (${product.price}) is suspiciously low for brand ${matchedBrand}`);
          riskScore += 35;
        } else if (product.price < expectedPrice * 0.3) {
          flags.push(`Price is below market average for ${matchedBrand}`);
          riskScore += 15;
        }
      }
    }

    // 3. Description Quality
    if (product.price > 10000 && product.description.length < 20) {
      flags.push('High value item with very short description');
      riskScore += 10;
    }

    // 4. Seller Analysis
    if (product.sellerId) {
      try {
        const { data: seller } = await supabase
          .from('profiles')
          .select('is_verified, created_at')
          .eq('id', product.sellerId)
          .single();

        if (seller) {
          if (!seller.is_verified) {
            flags.push('Unverified seller');
            riskScore += 10;
          }
          const daysOld = (Date.now() - new Date(seller.created_at).getTime()) / (1000 * 60 * 60 * 24);
          if (daysOld < 3) {
            flags.push('Seller account is brand new (< 3 days)');
            riskScore += 15;
          }
        }
      } catch (err) {
        console.warn('Could not fetch seller for AI check', err);
      }
    }

    riskScore = Math.min(100, riskScore);

    let recommendation: FakeProductDetectionResult['recommendation'] = 'approve';
    if (riskScore > 75) recommendation = 'reject';
    else if (riskScore > 30) recommendation = 'manual_review';

    return {
      isFake: riskScore > 75,
      confidence: Math.min(100, 50 + (riskScore / 2)),
      riskScore,
      flags,
      recommendation
    };
  }

  private async runAIAnalysis(product: any, heuristicResult: FakeProductDetectionResult): Promise<FakeProductDetectionResult> {
    if (!this.openai) return heuristicResult;

    try {
      const prompt = `
        Analyze this product listing for authenticity and potential fraud. Consider:

        Product Details:
        - Title: "${product.title}"
        - Description: "${product.description}"
        - Price: ₹${product.price}
        - Brand: ${product.brand || 'Not specified'}
        - Category: ${product.category || 'Not specified'}

        Heuristic Analysis Results:
        - Risk Score: ${heuristicResult.riskScore}/100
        - Flags: ${heuristicResult.flags.join(', ')}

        Provide enhanced analysis in JSON format:
        {
          "isFake": boolean,
          "confidence": number (0-100),
          "riskScore": number (0-100),
          "flags": ["additional AI-detected flags"],
          "recommendation": "approve|manual_review|reject",
          "aiReasoning": "brief explanation of AI analysis"
        }
      `;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 300
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        const aiAnalysis = JSON.parse(response);

        // Combine heuristic and AI results
        const combinedFlags = [...heuristicResult.flags, ...aiAnalysis.flags];
        const combinedRiskScore = Math.max(heuristicResult.riskScore, aiAnalysis.riskScore);

        return {
          isFake: aiAnalysis.isFake,
          confidence: aiAnalysis.confidence,
          riskScore: combinedRiskScore,
          flags: combinedFlags,
          recommendation: aiAnalysis.recommendation
        };
      }
    } catch (error) {
      console.error('AI product analysis failed:', error);
    }

    return heuristicResult;
  }

  // AI-powered pricing suggestions
  async suggestPricing(
    productTitle: string,
    category: string,
    condition: string,
    originalPrice?: number
  ): Promise<PricingSuggestion> {
    try {
      const response = await fetch('/api/ai/pricing-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productTitle, category, condition, originalPrice }),
      });

      if (!response.ok) {
        console.error('Pricing suggestions API error:', response.status);
        return this.getFallbackPricing(productTitle, category, condition, originalPrice);
      }

      const result = await response.json();
      return {
        suggestedPrice: result.suggestedPrice,
        minPrice: result.minPrice,
        maxPrice: result.maxPrice,
        reasoning: result.reasoning,
        marketComparison: result.marketComparison
      };
    } catch (error) {
      console.error('AI pricing suggestions failed:', error);
      return this.getFallbackPricing(productTitle, category, condition, originalPrice);
    }
  }

  private getFallbackPricing(
    productTitle: string,
    category: string,
    condition: string,
    originalPrice?: number
  ): PricingSuggestion {
    const basePrice = originalPrice || 10000;
    const conditionMultiplier = {
      'excellent': 1.2,
      'good': 1.0,
      'fair': 0.7,
      'poor': 0.4
    }[condition.toLowerCase()] || 1.0;

    const categoryMultiplier = {
      'vehicles': 1.5,
      'electronics': 1.2,
      'jewelry': 1.3,
      'art': 1.4
    }[category.toLowerCase()] || 1.0;

    const suggestedPrice = Math.round(basePrice * conditionMultiplier * categoryMultiplier);

    return {
      suggestedPrice,
      minPrice: Math.round(suggestedPrice * 0.7),
      maxPrice: Math.round(suggestedPrice * 1.5),
      reasoning: `Based on ${condition} condition and ${category} category market trends.`,
      marketComparison: {
        averagePrice: suggestedPrice,
        lowestPrice: Math.round(suggestedPrice * 0.5),
        highestPrice: Math.round(suggestedPrice * 2.0)
      }
    };
  }

  // AI-powered chat support
  async generateChatResponse(
    userMessage: string,
    context: {
      userRole: string;
      currentPage: string;
      conversationHistory: ChatMessage[];
    }
  ): Promise<string> {
    try {
      const response = await fetch('/api/ai/chat-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage, context }),
      });

      if (!response.ok) {
        console.error('Chat support API error:', response.status);
        return this.getFallbackChatResponse(userMessage, context);
      }

      const result = await response.json();
      return result.response || this.getFallbackChatResponse(userMessage, context);
    } catch (error) {
      console.error('AI chat response failed:', error);
      return this.getFallbackChatResponse(userMessage, context);
    }
  }

  private getFallbackChatResponse(
    userMessage: string,
    context: { userRole: string; currentPage: string }
  ): string {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('bid') || lowerMessage.includes('bidding')) {
      return 'To place a bid, navigate to any active auction and click the "Place Bid" button. Make sure you have sufficient funds in your wallet and meet the minimum bid requirements.';
    }

    if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
      return 'Payments are processed securely through Razorpay. You can add funds to your wallet or pay directly for won auctions. All transactions are protected and secure.';
    }

    if (lowerMessage.includes('kyc') || lowerMessage.includes('verification')) {
      return 'KYC verification is required to access all platform features. Go to your profile settings and complete the KYC process by uploading your documents.';
    }

    if (lowerMessage.includes('seller') && context.userRole === 'buyer') {
      return 'To become a seller, you need to complete KYC verification and then apply for seller status through your profile settings.';
    }

    return 'I\'m here to help! For specific questions about auctions, payments, or account issues, please provide more details or contact our human support team at support@quickmela.com.';
  }

  // Enhanced AI-powered fraud detection
  async analyzeFraudRisk(userData: {
    userId: string;
    email: string;
    phone?: string;
    registrationDate: Date;
    biddingHistory: any[];
    paymentHistory: any[];
    ipAddress?: string;
    deviceFingerprint?: string;
  }): Promise<FraudAnalysis> {
    try {
      const response = await fetch('/api/ai/fraud-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userData }),
      });

      if (!response.ok) {
        console.error('Fraud analysis API error:', response.status);
        return this.getFallbackFraudAnalysis(userData);
      }

      const result = await response.json();
      return {
        riskScore: result.riskScore,
        riskLevel: result.riskLevel,
        flags: result.flags || [],
        recommendations: result.recommendations || [],
        confidence: result.confidence
      };
    } catch (error) {
      console.error('AI fraud analysis failed:', error);
      return this.getFallbackFraudAnalysis(userData);
    }
  }

  private getFallbackFraudAnalysis(userData: any): FraudAnalysis {
    const accountAge = Math.floor((Date.now() - userData.registrationDate.getTime()) / (1000 * 60 * 60 * 24));
    const riskScore = Math.max(0, 100 - (accountAge * 2) - (userData.biddingHistory.length * 5));

    return {
      riskScore,
      riskLevel: riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low',
      flags: riskScore > 50 ? ['New account with limited history'] : [],
      recommendations: [
        'Monitor account activity closely',
        'Require additional verification for high-value transactions',
        'Enable two-factor authentication'
      ],
      confidence: 75
    };
  }

  // Generate AI-powered text suggestions for product descriptions
  async generateProductDescription(
    productTitle: string,
    category: string,
    keyFeatures: string[]
  ): Promise<string> {
    if (!this.initialized || !this.openai) {
      return this.getFallbackDescription(productTitle, category, keyFeatures);
    }

    try {
      const prompt = `
        Write an engaging, professional product description for an auction listing.

        Product: ${productTitle}
        Category: ${category}
        Key Features: ${keyFeatures.join(', ')}

        Guidelines:
        - Keep it concise (100-200 words)
        - Highlight unique selling points
        - Use professional language
        - Include condition and specifications
        - End with call-to-action for bidding
      `;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 250
      });

      return completion.choices[0]?.message?.content || this.getFallbackDescription(productTitle, category, keyFeatures);
    } catch (error) {
      console.error('AI description generation failed:', error);
      return this.getFallbackDescription(productTitle, category, keyFeatures);
    }
  }

  private getFallbackDescription(productTitle: string, category: string, keyFeatures: string[]): string {
    return `${productTitle} - ${category}

This ${category.toLowerCase()} is in excellent condition with the following key features:
${keyFeatures.map(feature => `• ${feature}`).join('\n')}

Perfect for collectors or enthusiasts. Don't miss this opportunity to add this piece to your collection!

Bid now to secure this item before it's too late.`;
  }
}

export const aiService = new AIService();