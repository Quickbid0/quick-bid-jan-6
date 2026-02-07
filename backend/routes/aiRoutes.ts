import { Router } from 'express';
import { Pool } from 'pg';
import OpenAI from 'openai';
import { aiSupportHandler } from '../controllers/aiSupportController.ts';

// Initialize OpenAI client server-side
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Router for AI endpoints
export function createAiRouter(authMiddleware: any) {
  const router = Router();

  router.post('/support', authMiddleware, aiSupportHandler);
  
  // AI Recommendations
  router.post('/recommendations', authMiddleware, async (req, res) => {
    try {
      const { userId, userPreferences } = req.body;
      
      // Mock AI recommendation logic
      const recommendations = await generateRecommendations(userId, userPreferences);
      
      res.json({ recommendations });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      res.status(500).json({ error: 'Failed to generate recommendations' });
    }
  });

  // AI Price Prediction
  router.post('/price-prediction', authMiddleware, async (req, res) => {
    try {
      const { productId, includeHistoricalData, includeMarketFactors } = req.body;
      
      const prediction = await generatePricePrediction(productId, {
        includeHistoricalData,
        includeMarketFactors,
      });
      
      res.json({ prediction });
    } catch (error) {
      console.error('Error generating price prediction:', error);
      res.status(500).json({ error: 'Failed to generate price prediction' });
    }
  });

  // AI Auction Analysis
  router.post('/auction-analysis', authMiddleware, async (req, res) => {
    try {
      const { auctionId, includeHistoricalData, includeCompetitorAnalysis } = req.body;
      
      const analysis = await analyzeAuction(auctionId, {
        includeHistoricalData,
        includeCompetitorAnalysis,
      });
      
      const recommendation = await generateBidRecommendation(auctionId, analysis);
      
      res.json({ analysis, recommendation });
    } catch (error) {
      console.error('Error analyzing auction:', error);
      res.status(500).json({ error: 'Failed to analyze auction' });
    }
  });

  // AI Fraud Detection - Signals
  router.post('/fraud-detection/signals', authMiddleware, async (req, res) => {
    try {
      const { timeframe, includeHistorical } = req.body;
      
      const signals = await detectFraudSignals(timeframe, includeHistorical);
      
      res.json({ signals });
    } catch (error) {
      console.error('Error detecting fraud signals:', error);
      res.status(500).json({ error: 'Failed to detect fraud signals' });
    }
  });

  // AI Fraud Detection - Risk Score
  router.post('/fraud-detection/risk-score', authMiddleware, async (req, res) => {
    try {
      const { timeframe, includeTrends } = req.body;
      
      const riskScore = await calculateRiskScore(timeframe, includeTrends);
      
      res.json({ riskScore });
    } catch (error) {
      console.error('Error calculating risk score:', error);
      res.status(500).json({ error: 'Failed to calculate risk score' });
    }
  });

  // AI Fraud Detection - Patterns
  router.post('/fraud-detection/patterns', authMiddleware, async (req, res) => {
    try {
      const { timeframe, minFrequency } = req.body;
      
      const patterns = await detectFraudPatterns(timeframe, minFrequency);
      
      res.json({ patterns });
    } catch (error) {
      console.error('Error detecting fraud patterns:', error);
      res.status(500).json({ error: 'Failed to detect fraud patterns' });
    }
  });

  // AI Market Insights
  router.post('/market-insights', authMiddleware, async (req, res) => {
    try {
      const { timeframe, categories } = req.body;
      
      const insights = await generateMarketInsights(timeframe, categories);
      
      res.json({ insights });
    } catch (error) {
      console.error('Error generating market insights:', error);
      res.status(500).json({ error: 'Failed to generate market insights' });
    }
  });

  // AI Fraud Analysis
  router.post('/fraud-analysis', authMiddleware, async (req, res) => {
    try {
      const { userData } = req.body;
      const result = await analyzeFraudServer(userData);
      res.json(result);
    } catch (error) {
      console.error('Error analyzing fraud:', error);
      res.status(500).json({ error: 'Failed to analyze fraud' });
    }
  });

  // AI Image Recognition
  router.post('/image-recognition', authMiddleware, async (req, res) => {
    try {
      const { imageData, filename } = req.body;
      
      const analysis = await analyzeImage(imageData, filename);
      
      res.json({ analysis });
    } catch (error) {
      console.error('Error analyzing image:', error);
      res.status(500).json({ error: 'Failed to analyze image' });
    }
  });

  // AI Natural Language Search
  router.post('/natural-search', authMiddleware, async (req, res) => {
    try {
      const { query, filters } = req.body;
      
      const intent = await analyzeSearchIntent(query);
      const results = await performNaturalSearch(query, intent, filters);
      
      res.json({ intent, results });
    } catch (error) {
      console.error('Error performing natural search:', error);
      res.status(500).json({ error: 'Failed to perform search' });
    }
  });

  // AI Metrics
  router.post('/metrics', authMiddleware, async (req, res) => {
    try {
      const { timeframe } = req.body;
      
      const metrics = await getAIMetrics(timeframe);
      
      res.json({ metrics });
    } catch (error) {
      console.error('Error fetching AI metrics:', error);
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  });

  return router;
}

// Server-side AI functions using OpenAI

async function detectFakeProductServer(product: any) {
  try {
    const prompt = `
      Analyze this product listing for authenticity and potential fraud. Consider:

      Product Details:
      - Title: "${product.title}"
      - Description: "${product.description}"
      - Price: ₹${product.price}
      - Brand: ${product.brand || 'Not specified'}
      - Category: ${product.category || 'Not specified'}

      Provide enhanced analysis in JSON format:
      {
        "isFake": boolean,
        "confidence": number (0-100),
        "riskScore": number (0-100),
        "flags": ["AI-detected flags"],
        "recommendation": "approve|manual_review|reject",
        "aiReasoning": "brief explanation of AI analysis"
      }
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 300
    });

    const response = completion.choices[0]?.message?.content;
    if (response) {
      const aiAnalysis = JSON.parse(response);
      return {
        isFake: aiAnalysis.isFake,
        confidence: aiAnalysis.confidence,
        riskScore: aiAnalysis.riskScore,
        flags: aiAnalysis.flags || [],
        recommendation: aiAnalysis.recommendation,
        aiReasoning: aiAnalysis.aiReasoning
      };
    }
  } catch (error) {
    console.error('AI fake product detection failed:', error);
  }

async function generatePricingSuggestionsServer(productTitle: string, category: string, condition: string, originalPrice?: number) {
  try {
    const prompt = `
      Suggest optimal pricing for this auction item. Consider:
      1. Current market rates for similar items
      2. Product condition and age
      3. Demand and popularity
      4. Platform competition
      5. Seller goals (quick sale vs. maximum profit)

      Product: "${productTitle}"
      Category: "${category}"
      Condition: "${condition}"
      ${originalPrice ? `Original Price: ₹${originalPrice}` : ''}

      Provide pricing analysis in JSON format:
      {
        "suggestedPrice": number,
        "minPrice": number,
        "maxPrice": number,
        "reasoning": "detailed explanation",
        "marketComparison": {
          "averagePrice": number,
          "lowestPrice": number,
          "highestPrice": number
        }
      }
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 400
    });

    const response = completion.choices[0]?.message?.content;
    if (response) {
      return JSON.parse(response);
    }
  } catch (error) {
    console.error('AI pricing suggestions failed:', error);
  }

  // Fallback pricing
  return {
    suggestedPrice: originalPrice || 10000,
    minPrice: (originalPrice || 10000) * 0.7,
    maxPrice: (originalPrice || 10000) * 1.5,
    reasoning: `Based on ${condition} condition and ${category} category market trends.`,
    marketComparison: {
      averagePrice: originalPrice || 10000,
      lowestPrice: (originalPrice || 10000) * 0.5,
      highestPrice: (originalPrice || 10000) * 2.0
    }
async function generateChatResponseServer(userMessage: string, context: any) {
  try {
    const recentHistory = context.conversationHistory?.slice(-5) || [];
    const historyText = recentHistory.map((msg: any) =>
      `${msg.role}: ${msg.content}`
    ).join('\n');

    const prompt = `
      You are QuickMela's AI support assistant. Help users with auction-related questions.

      User Context:
      - Role: ${context.userRole}
      - Current Page: ${context.currentPage}
      - Recent Conversation:
      ${historyText}

      User Question: "${userMessage}"

      Provide a helpful, professional response. Keep it concise but informative.
      If this is a technical issue, suggest contacting human support.
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'system', content: prompt }],
      temperature: 0.7,
      max_tokens: 200
    });

    return completion.choices[0]?.message?.content || getFallbackChatResponse(userMessage, context);
  } catch (error) {
    console.error('AI chat response failed:', error);
    return getFallbackChatResponse(userMessage, context);
async function analyzeFraudServer(userData: any) {
  try {
    const prompt = `
      Analyze this user for potential fraud risk. Consider:

      User Profile:
      - Account Age: ${Math.floor((Date.now() - userData.registrationDate.getTime()) / (1000 * 60 * 60 * 24))} days
      - Email: ${userData.email}
      - Phone: ${userData.phone || 'Not provided'}
      - Bidding History: ${userData.biddingHistory.length} bids
      - Payment History: ${userData.paymentHistory.length} payments

      Common fraud indicators:
      1. New accounts with high-value bids
      2. Suspicious email patterns
      3. Rapid bidding patterns
      4. Failed payment attempts
      5. Multiple accounts from same IP

      Provide fraud analysis in JSON format:
      {
        "riskScore": number (0-100),
        "riskLevel": "low|medium|high",
        "flags": ["flag1", "flag2"],
        "recommendations": ["rec1", "rec2"],
        "confidence": number (0-100)
      }
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 300
    });

    const response = completion.choices[0]?.message?.content;
    if (response) {
      return JSON.parse(response);
    }
  } catch (error) {
    console.error('AI fraud analysis failed:', error);
  }

  // Fallback analysis
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

// Fallback functions for when AI is unavailable
async function heuristicFakeProductDetection(product: any) {
  const flags: string[] = [];
  let riskScore = 0;

  const lowerTitle = product.title.toLowerCase();
  const lowerDesc = product.description.toLowerCase();

  // 1. Keyword Analysis
  const suspiciousKeywords = ['first copy', '1st copy', 'clone', 'replica', 'duplicate', 'same as original', 'master copy', 'aaa copy', 'fake', 'counterfeit'];
  suspiciousKeywords.forEach(keyword => {
    if (lowerTitle.includes(keyword) || lowerDesc.includes(keyword)) {
      flags.push(`Suspicious keyword found: "${keyword}"`);
      riskScore += 40;
    }
  });

  // 2. Brand Price Analysis
  if (product.brand) {
    const brandBaselines: Record<string, number> = {
      'apple': 50000, 'samsung': 30000, 'rolex': 500000, 'gucci': 20000,
      'louis vuitton': 40000, 'nike': 5000, 'adidas': 3000, 'sony': 15000
    };
    const lowerBrand = product.brand.toLowerCase();
    const matchedBrand = Object.keys(brandBaselines).find(b => lowerBrand.includes(b));

    if (matchedBrand) {
      const expectedPrice = brandBaselines[matchedBrand];
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

  riskScore = Math.min(100, riskScore);

  let recommendation: 'approve' | 'manual_review' | 'reject' = 'approve';
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

function getFallbackChatResponse(userMessage: string, context: any): string {
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
}

async function generatePricePrediction(productId: string, options: any) {
  // Mock implementation
  return {
    currentPrice: 250000,
    predictedPrice: 285000,
    confidence: 87,
    timeToAuctionEnd: '2h 15m',
    priceRange: { min: 260000, max: 310000 },
    factors: [
      { name: 'Market Demand', impact: 'positive', weight: 0.35, description: 'High demand (+15%)' },
      { name: 'Seasonal Trends', impact: 'positive', weight: 0.25, description: 'Peak season (+12%)' },
      { name: 'Competition', impact: 'negative', weight: 0.20, description: 'High activity (-8%)' },
    ],
    trend: 'rising',
    recommendation: 'bid_now',
  };
}

async function analyzeAuction(auctionId: string, options: any) {
  // Mock implementation
  return {
    currentPrice: 250000,
    estimatedFinalPrice: 295000,
    competitionLevel: 7,
    bidHistory: [
      { time: '10:30 AM', amount: 200000, bidderType: 'new' },
      { time: '11:15 AM', amount: 225000, bidderType: 'regular' },
      { time: '12:00 PM', amount: 237500, bidderType: 'aggressive' },
      { time: '1:30 PM', amount: 250000, bidderType: 'regular' },
    ],
    priceVelocity: 0.15,
    optimalBidTime: '2:45 PM',
  };
}

async function generateBidRecommendation(auctionId: string, analysis: any) {
  // Mock implementation
  return {
    action: 'bid',
    amount: analysis.currentPrice * 1.12,
    confidence: 78,
    reasoning: 'Market analysis shows moderate competition with rising trend',
    urgency: 'medium',
    marketContext: {
      competition: 'medium',
      priceTrend: 'rising',
      timeRemaining: '2h 15m',
    },
  };
}

async function detectFraudSignals(timeframe: string, includeHistorical: boolean) {
  // Mock implementation
  return [
    {
      id: '1',
      type: 'behavioral',
      severity: 'high',
      title: 'Unusual Bidding Pattern',
      description: 'User placing bids at maximum amount consistently',
      confidence: 87,
      timestamp: new Date(),
      entityId: 'user_123',
      entityType: 'user',
      indicators: ['Rapid bidding', 'Max amount bids'],
      recommendedAction: 'investigate',
    },
    {
      id: '2',
      type: 'network',
      severity: 'medium',
      title: 'Suspicious Network Activity',
      description: 'Multiple accounts from same IP',
      confidence: 72,
      timestamp: new Date(),
      entityId: 'network_456',
      entityType: 'user',
      indicators: ['Shared IP', 'Similar behavior'],
      recommendedAction: 'monitor',
    },
  ];
}

async function calculateRiskScore(timeframe: string, includeTrends: boolean) {
  // Mock implementation
  return {
    overall: 72,
    behavioral: 68,
    transactional: 85,
    network: 45,
    content: 62,
    trend: 'deteriorating',
    lastUpdated: new Date(),
  };
}

async function detectFraudPatterns(timeframe: string, minFrequency: number) {
  // Mock implementation
  return [
    {
      pattern: 'Bid Sniping',
      frequency: 23,
      riskLevel: 'medium',
      description: 'Last-second bidding',
      affectedEntities: ['user_123', 'user_456'],
    },
    {
      pattern: 'Shill Bidding',
      frequency: 8,
      riskLevel: 'high',
      description: 'Fake bids to increase prices',
      affectedEntities: ['user_789'],
    },
  ];
}

async function generateMarketInsights(timeframe: string, categories: string[]) {
  // Mock implementation
  return [
    {
      type: 'trending',
      title: 'Vintage Watches Surge',
      description: '40% increase in vintage watch auctions',
      products: ['Rolex Submariner', 'Omega Seamaster'],
    },
    {
      type: 'price_drop',
      title: 'Electronics Price Drop',
      description: 'Average prices down 15% for laptops',
      products: ['MacBook Pro', 'Dell XPS'],
    },
  ];
}

async function executeFraudAction(signalId: string, action: string) {
  // Mock implementation - in production, this would update database and notify systems
  console.log(`Executing ${action} on signal ${signalId}`);
}

async function analyzeImage(imageData: string, filename: string) {
  // Mock implementation - in production, this would call computer vision API
  return {
    categories: [
      { name: 'Vehicles', confidence: 92, description: 'Automobiles and motor vehicles' },
      { name: 'Cars', confidence: 88, description: 'Passenger vehicles' },
    ],
    objects: [
      { name: 'Car', confidence: 95, bbox: { x: 10, y: 20, width: 80, height: 60 } },
      { name: 'Headlight', confidence: 88, bbox: { x: 25, y: 35, width: 15, height: 10 } },
    ],
    attributes: [
      { name: 'Color', value: 'Silver', confidence: 90 },
      { name: 'Condition', value: 'Good', confidence: 85 },
      { name: 'Brand', value: 'Mercedes-Benz', confidence: 78 },
    ],
    quality: {
      score: 85,
      issues: ['Slightly blurry in areas'],
      suggestions: ['Use better lighting'],
    },
    tags: ['car', 'sedan', 'mercedes', 'luxury', 'silver'],
    suggestedCategory: 'Vehicles',
    suggestedPrice: 2850000,
    description: 'Luxury Mercedes-Benz sedan in silver color, appears to be in good condition.',
  };
}

async function analyzeSearchIntent(query: string) {
  // Mock implementation - in production, this would use NLP
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('under') || lowerQuery.includes('below')) {
    return {
      type: 'find_specific',
      priceRange: { min: 0, max: 50000 },
      keywords: query.toLowerCase().split(' ').filter(w => w.length > 2),
      confidence: 90,
    };
  }
  
  return {
    type: 'browse',
    keywords: query.toLowerCase().split(' ').filter(w => w.length > 2),
    confidence: 75,
  };
}

async function performNaturalSearch(query: string, intent: any, filters: any) {
  // Mock implementation - in production, this would use semantic search
  return [
    {
      id: '1',
      title: 'Luxury Mercedes-Benz C-Class',
      description: 'Premium sedan with advanced features',
      category: 'Vehicles',
      price: 2850000,
      image: 'https://example.com/car1.jpg',
      relevanceScore: 95,
      matchReasons: ['Matches category', 'Fits price range'],
    },
  ];
}

async function getAIMetrics(timeframe: string) {
  // Mock implementation
  return {
    totalPredictions: 15420,
    accuracy: 94.2,
    fraudDetected: 234,
    recommendationsGenerated: 8934,
    userSatisfaction: 87.5,
    processingTime: 1.2,
    modelVersion: '2.1.0',
    lastUpdated: new Date(),
  };
}
