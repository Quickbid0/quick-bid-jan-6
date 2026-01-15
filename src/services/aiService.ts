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
  // AI-powered fake product detection
  async detectFakeProduct(product: {
    title: string;
    description: string;
    price: number;
    brand?: string;
    category?: string;
    sellerId?: string;
  }): Promise<FakeProductDetectionResult> {
    const flags: string[] = [];
    let riskScore = 0;

    const lowerTitle = product.title.toLowerCase();
    const lowerDesc = product.description.toLowerCase();

    // 1. Keyword Analysis
    SUSPICIOUS_KEYWORDS.forEach(keyword => {
      if (lowerTitle.includes(keyword) || lowerDesc.includes(keyword)) {
        flags.push(`Suspicious keyword found: "${keyword}"`);
        riskScore += 40; // High impact
      }
    });

    // 2. Brand Price Analysis
    if (product.brand) {
      const lowerBrand = product.brand.toLowerCase();
      // Simple fuzzy match for brand
      const matchedBrand = Object.keys(BRAND_PRICE_BASELINE).find(b => lowerBrand.includes(b));
      
      if (matchedBrand) {
        const expectedPrice = BRAND_PRICE_BASELINE[matchedBrand];
        // If price is less than 15% of expected baseline, it's very suspicious
        if (product.price < expectedPrice * 0.15) {
          flags.push(`Price (${product.price}) is suspiciously low for brand ${matchedBrand} (Expected > ${expectedPrice * 0.15})`);
          riskScore += 35;
        } else if (product.price < expectedPrice * 0.3) {
          flags.push(`Price is below market average for ${matchedBrand}`);
          riskScore += 15;
        }
      }
    }

    // 3. Description Quality (Heuristic: very short descriptions on high value items)
    if (product.price > 10000 && product.description.length < 20) {
      flags.push('High value item with very short description');
      riskScore += 10;
    }

    // 4. Seller Analysis (if ID provided)
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

    // Normalize risk score
    riskScore = Math.min(100, riskScore);

    // Determine recommendation
    let recommendation: FakeProductDetectionResult['recommendation'] = 'approve';
    if (riskScore > 75) recommendation = 'reject';
    else if (riskScore > 30) recommendation = 'manual_review';

    return {
      isFake: riskScore > 75,
      confidence: Math.min(100, 50 + (riskScore / 2)), // Higher risk = higher confidence in "fake" judgement, but let's be conservative
      riskScore,
      flags,
      recommendation
    };
  }

  // AI-powered product recommendations
  async getPersonalizedRecommendations(userId: string): Promise<AIRecommendation[]> {
    try {
      // Fetch user's bidding history and preferences
      const { data: userBids } = await supabase
        .from('bids')
        .select('auction:auctions(product:products(category, current_price))')
        .eq('user_id', userId)
        .limit(50);

      const { data: userWishlist } = await supabase
        .from('wishlist')
        .select('product:products(category)')
        .eq('user_id', userId);

      // Analyze user preferences
      const preferredCategories = this.analyzeUserPreferences(userBids ?? [], userWishlist ?? []);
      
      // Get trending products
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('view_count', { ascending: false })
        .limit(20);

      // Generate AI recommendations
      const recommendations = products?.map(product => ({
        productId: product.id,
        score: this.calculateRecommendationScore(product, preferredCategories),
        reason: this.generateRecommendationReason(product, preferredCategories),
        type: this.determineRecommendationType(product)
      })) || [];

      return recommendations.sort((a, b) => b.score - a.score).slice(0, 10);
    } catch (error) {
      console.error('AI Recommendations error:', error);
      return [];
    }
  }

  // AI-powered price prediction
  async predictPrice(productId: string): Promise<PricePrediction> {
    try {
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (!product) throw new Error('Product not found');

      // Fetch similar products for comparison
      const { data: similarProducts } = await supabase
        .from('products')
        .select('final_price, current_price')
        .eq('category', product.category)
        .eq('status', 'sold')
        .limit(50);

      const prediction = this.calculatePricePrediction(product, similarProducts ?? []);
      return prediction;
    } catch (error) {
      console.error('Price prediction error:', error);
      return {
        currentPrice: 0,
        predictedPrice: 0,
        confidence: 0,
        factors: ['Insufficient data']
      };
    }
  }

  // AI-powered media verification for photos/videos
  async verifyMedia(params: {
    mediaUrl: string;
    mediaType: 'image' | 'video';
    productType: string;
    shotType: string;
  }): Promise<MediaVerificationResult> {
    try {
      const response = await fetch('/api/ai/verify-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        console.error('verify-media HTTP error', response.status);
        return { ok: false, score: 0, reasons: ['Verification service unavailable'], suggestion: 'Please try again later or retake a clearer photo.' };
      }

      const data = await response.json();
      return {
        ok: !!data.ok,
        score: typeof data.score === 'number' ? data.score : 0,
        reasons: Array.isArray(data.reasons) ? data.reasons : [],
        suggestion: typeof data.suggestion === 'string' ? data.suggestion : undefined,
      };
    } catch (error) {
      console.error('verifyMedia error', error);
      return {
        ok: false,
        score: 0,
        reasons: ['Verification failed due to a network or AI error'],
        suggestion: 'Please retake the photo in good light and try again.',
      };
    }
  }

  // AI-powered fraud detection
  async detectFraud(userId: string, bidAmount: number, productId: string): Promise<FraudDetection> {
    try {
      const flags: string[] = [];
      let riskScore = 0;

      // Local heuristic analysis (works even without AI backend)
      const { data: userBids } = await supabase
        .from('bids')
        .select('amount_cents, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (userBids && userBids.length > 0) {
        const avgBid = userBids.reduce((sum, bid) => sum + (bid.amount_cents ? bid.amount_cents / 100 : 0), 0) / userBids.length;

        if (bidAmount > avgBid * 5) {
          flags.push('Unusually high bid amount');
          riskScore += 30;
        }

        const recentBids = userBids.filter(bid =>
          new Date(bid.created_at).getTime() > Date.now() - 60000
        );

        if (recentBids.length > 3) {
          flags.push('Rapid bidding pattern detected');
          riskScore += 20;
        }
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('created_at, is_verified')
        .eq('id', userId)
        .single();

      if (profile) {
        const accountAge = Date.now() - new Date(profile.created_at).getTime();
        const daysSinceCreation = accountAge / (1000 * 60 * 60 * 24);

        if (daysSinceCreation < 7) {
          flags.push('New account');
          riskScore += 25;
        }

        if (!profile.is_verified) {
          flags.push('Unverified account');
          riskScore += 40;
        }
      }

      let recommendation: FraudDetection['recommendation'] =
        riskScore > 70 ? 'reject' : riskScore > 40 ? 'review' : 'approve';

      // Try to refine with backend AI fraud check if configured
      try {
        const response = await fetch('/api/ai/fraud-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            productId,
            bidAmount,
            localRiskScore: riskScore,
            localFlags: flags,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.recommendation === 'approve' || data.recommendation === 'review' || data.recommendation === 'reject') {
            recommendation = data.recommendation;
          }
          if (Array.isArray(data.flags)) {
            for (const f of data.flags) {
              if (typeof f === 'string' && !flags.includes(f)) {
                flags.push(f);
              }
            }
          }
          if (typeof data.riskScore === 'number') {
            riskScore = data.riskScore;
          }
        }
      } catch (e) {
        // Backend/AI unavailable; fall back to local heuristic only
        console.warn('AI fraud endpoint unavailable, using heuristic only', e);
      }

      return {
        riskScore,
        flags,
        recommendation,
      };
    } catch (error) {
      console.error('Fraud detection error:', error);
      return {
        riskScore: 50,
        flags: ['Analysis failed'],
        recommendation: 'review',
      };
    }
  }

  // AI content moderation
  async moderateContent(content: string, type: 'text' | 'image'): Promise<{
    isAppropriate: boolean;
    confidence: number;
    flags: string[];
  }> {
    try {
      const flags: string[] = [];
      let inappropriateScore = 0;

      if (type === 'text') {
        // Check for inappropriate language
        const inappropriateWords = ['spam', 'fake', 'scam', 'fraud'];
        const lowerContent = content.toLowerCase();
        
        inappropriateWords.forEach(word => {
          if (lowerContent.includes(word)) {
            flags.push(`Contains inappropriate word: ${word}`);
            inappropriateScore += 20;
          }
        });

        // Check for excessive caps
        const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
        if (capsRatio > 0.5) {
          flags.push('Excessive capital letters');
          inappropriateScore += 10;
        }
      }

      return {
        isAppropriate: inappropriateScore < 50,
        confidence: Math.max(50, 100 - inappropriateScore),
        flags
      };
    } catch (error) {
      console.error('Content moderation error:', error);
      return {
        isAppropriate: true,
        confidence: 50,
        flags: ['Moderation failed']
      };
    }
  }

  // Helper methods
  private analyzeUserPreferences(bids: any[], wishlist: any[]): string[] {
    const categories = new Map<string, number>();
    
    bids?.forEach(bid => {
      const category = bid.auction?.product?.category || bid.product?.category;
      if (category) {
        categories.set(category, (categories.get(category) || 0) + 1);
      }
    });

    wishlist?.forEach(item => {
      const category = item.product?.category;
      if (category) {
        categories.set(category, (categories.get(category) || 0) + 0.5);
      }
    });

    return Array.from(categories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
  }

  private calculateRecommendationScore(product: any, preferredCategories: string[]): number {
    let score = 50; // Base score

    // Category preference
    if (preferredCategories.includes(product.category)) {
      score += 30;
    }

    // Trending factor
    if (product.is_trending) {
      score += 20;
    }

    // View count factor
    if (product.view_count > 100) {
      score += 15;
    }

    // Bid activity
    if (product.bid_count > 5) {
      score += 10;
    }

    // Time remaining
    const timeLeft = new Date(product.end_date).getTime() - Date.now();
    const hoursLeft = timeLeft / (1000 * 60 * 60);
    if (hoursLeft < 24) {
      score += 25; // Ending soon bonus
    }

    return Math.min(100, score);
  }

  private generateRecommendationReason(product: any, preferredCategories: string[]): string {
    if (preferredCategories.includes(product.category)) {
      return `Matches your interest in ${product.category}`;
    }
    if (product.is_trending) {
      return 'Trending item with high demand';
    }
    if (product.view_count > 100) {
      return 'Popular item with many views';
    }
    return 'Recommended based on market trends';
  }

  private determineRecommendationType(product: any): 'trending' | 'undervalued' | 'similar' | 'ending_soon' {
    const timeLeft = new Date(product.end_date).getTime() - Date.now();
    const hoursLeft = timeLeft / (1000 * 60 * 60);
    
    if (hoursLeft < 24) return 'ending_soon';
    if (product.is_trending) return 'trending';
    if (product.current_price < product.starting_price * 1.2) return 'undervalued';
    return 'similar';
  }

  private calculatePricePrediction(product: any, similarProducts: any[]): PricePrediction {
    if (!similarProducts || similarProducts.length === 0) {
      return {
        currentPrice: product.current_price,
        predictedPrice: product.current_price * 1.1,
        confidence: 30,
        factors: ['Limited market data']
      };
    }

    const avgFinalPrice = similarProducts.reduce((sum, p) => sum + (p.final_price || p.current_price), 0) / similarProducts.length;
    const priceIncrease = avgFinalPrice / product.current_price;
    
    return {
      currentPrice: product.current_price,
      predictedPrice: Math.round(product.current_price * priceIncrease),
      confidence: Math.min(95, similarProducts.length * 2),
      factors: [
        `Based on ${similarProducts.length} similar items`,
        `Average market performance: ${((priceIncrease - 1) * 100).toFixed(1)}%`,
        'Category trend analysis',
        'Historical price patterns'
      ]
    };
  }
}

export const aiService = new AIService();