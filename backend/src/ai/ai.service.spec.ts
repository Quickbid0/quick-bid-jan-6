import { Test, TestingModule } from '@nestjs/testing';
import { AIService } from '../ai.service';
import { ABTestingService } from '../ab-testing.service';
import { VoiceBiddingService } from '../voice-bidding.service';
import { CurrencyService } from '../currency.service';
import { ComplianceService } from '../compliance.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

describe('AIService Integration Tests', () => {
  let aiService: AIService;
  let abTestingService: ABTestingService;
  let voiceService: VoiceBiddingService;
  let currencyService: CurrencyService;
  let complianceService: ComplianceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIService,
        ABTestingService,
        VoiceBiddingService,
        CurrencyService,
        ComplianceService,
        ConfigService,
        PrismaService,
      ],
    }).compile();

    aiService = module.get<AIService>(AIService);
    abTestingService = module.get<ABTestingService>(ABTestingService);
    voiceService = module.get<VoiceBiddingService>(VoiceBiddingService);
    currencyService = module.get<CurrencyService>(CurrencyService);
    complianceService = module.get<ComplianceService>(ComplianceService);
  });

  describe('AI Recommendations Testing', () => {
    it('should generate personalized recommendations', async () => {
      const userId = 'test-user-123';
      const context = {
        category: 'Electronics',
        limit: 5,
        trackInteractions: false
      };

      const result = await aiService.getPersonalizedRecommendations(userId, context);

      expect(result).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.recommendations.length).toBeLessThanOrEqual(5);
      expect(result.variant).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should track recommendation interactions', async () => {
      const userId = 'test-user-123';
      const productId = 'product-456';
      const variantId = 'test-variant';

      await expect(
        aiService.trackRecommendationInteraction(userId, productId, variantId, 'click')
      ).resolves.not.toThrow();
    });

    it('should handle A/B testing variant assignment', async () => {
      const userId = 'test-user-123';
      const variant = abTestingService.assignUserToVariant(userId, 'recommendations');

      expect(variant).toBeDefined();
      expect(variant.id).toBeDefined();
      expect(variant.algorithm).toBeDefined();
      expect(['collaborative', 'content-based', 'hybrid', 'trending', 'personalized']).toContain(variant.algorithm);
    });
  });

  describe('Voice Bidding Testing', () => {
    it('should process voice commands', async () => {
      const userId = 'test-user-123';
      const auctionId = 'auction-456';
      const voiceText = 'bid 5000 rupees';
      const confidence = 0.85;

      const result = await voiceService.processVoiceCommand(userId, auctionId, voiceText, confidence);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.command).toBeDefined();
      expect(result.response).toBeDefined();
      expect(result.session).toBeDefined();
    });

    it('should handle bid commands', async () => {
      const userId = 'test-user-123';
      const auctionId = 'auction-456';
      const voiceText = 'place bid for 25000';
      const confidence = 0.9;

      const result = await voiceService.processVoiceCommand(userId, auctionId, voiceText, confidence);

      expect(result.command.type).toBe('bid');
      expect(result.command.amount).toBe(25000);
    });

    it('should handle status requests', async () => {
      const userId = 'test-user-123';
      const auctionId = 'auction-456';
      const voiceText = 'what is the current price';
      const confidence = 0.88;

      const result = await voiceService.processVoiceCommand(userId, auctionId, voiceText, confidence);

      expect(result.command.type).toBe('status');
    });

    it('should reject low confidence commands', async () => {
      const userId = 'test-user-123';
      const auctionId = 'auction-456';
      const voiceText = 'bid something';
      const confidence = 0.3; // Too low

      const result = await voiceService.processVoiceCommand(userId, auctionId, voiceText, confidence);

      expect(result.response.text).toContain("didn't hear you clearly");
    });
  });

  describe('Currency Service Testing', () => {
    it('should convert currencies correctly', () => {
      const amount = 1000;
      const result = currencyService.convertAmount(amount, 'INR', 'USD');

      expect(result).toBeDefined();
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });

    it('should format currency amounts', () => {
      const amount = 1500.50;
      const formatted = currencyService.formatAmount(amount, 'INR');

      expect(formatted).toBe('₹1,501'); // Rounded for INR
    });

    it('should validate currency codes', () => {
      expect(currencyService.isValidCurrency('INR')).toBe(true);
      expect(currencyService.isValidCurrency('XYZ')).toBe(false);
    });

    it('should get user preferred currency', () => {
      const usdUser = currencyService.getUserPreferredCurrency('United States');
      const inrUser = currencyService.getUserPreferredCurrency('India');

      expect(usdUser).toBe('USD');
      expect(inrUser).toBe('INR');
    });

    it('should calculate payment fees', () => {
      const fees = currencyService.calculatePaymentFees(1000, 'INR', 'USD');

      expect(fees).toBeDefined();
      expect(fees.totalAmount).toBeGreaterThan(fees.baseAmount);
      expect(fees.conversionFee).toBeDefined();
      expect(fees.internationalFee).toBeDefined();
    });
  });

  describe('Compliance Service Testing', () => {
    it('should create compliance profile', async () => {
      const userData = {
        country: 'IN',
        dateOfBirth: new Date('1990-01-01'),
        fullName: 'John Doe',
        email: 'john@example.com'
      };

      const profile = await complianceService.createComplianceProfile('test-user', userData);

      expect(profile).toBeDefined();
      expect(profile.userId).toBe('test-user');
      expect(profile.country).toBe('IN');
      expect(profile.complianceChecks).toBeDefined();
      expect(profile.overallComplianceScore).toBeDefined();
    });

    it('should check transaction compliance', async () => {
      const transactionData = {
        amount: 50000,
        currency: 'INR',
        recipientCountry: 'US',
        transactionType: 'payment'
      };

      const result = await complianceService.checkTransactionCompliance('test-user', transactionData);

      expect(result).toBeDefined();
      expect(typeof result.compliant).toBe('boolean');
      expect(typeof result.riskScore).toBe('number');
    });

    it('should generate compliance reports', async () => {
      const report = await complianceService.generateComplianceReport('test-user');

      expect(report).toBeDefined();
      expect(report.userId).toBe('test-user');
      expect(typeof report.complianceScore).toBe('number');
      expect(report.violations).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });

    it('should validate age compliance', async () => {
      const userData = {
        country: 'IN',
        dateOfBirth: new Date('2010-01-01'), // Underage
        fullName: 'Young User',
        email: 'young@example.com'
      };

      const profile = await complianceService.createComplianceProfile('young-user', userData);

      const ageCheck = profile.complianceChecks.find(check => check.checkType === 'age');
      expect(ageCheck?.status).toBe('failed');
      expect(profile.riskLevel).toBe('critical');
    });
  });

  describe('Fraud Detection Testing', () => {
    it('should detect fraud patterns', async () => {
      const userId = 'test-user-123';
      const auctionId = 'auction-456';
      const bidAmount = 10000;
      const bidHistory = [
        { amount: 5000, timestamp: new Date(Date.now() - 60000) },
        { amount: 6000, timestamp: new Date(Date.now() - 30000) },
        { amount: 9500, timestamp: new Date(Date.now() - 10000) }
      ];

      const result = await aiService.detectFraudPatterns(userId, auctionId, bidAmount, bidHistory);

      expect(result).toBeDefined();
      expect(typeof result.isSuspicious).toBe('boolean');
      expect(typeof result.riskScore).toBe('number');
      expect(result.riskLevel).toBeDefined();
      expect(result.reasons).toBeDefined();
      expect(result.recommendedAction).toBeDefined();
    });

    it('should handle normal bidding patterns', async () => {
      const userId = 'normal-user';
      const auctionId = 'normal-auction';
      const bidAmount = 5500;
      const bidHistory = [
        { amount: 5000, timestamp: new Date(Date.now() - 300000) } // 5 minutes ago
      ];

      const result = await aiService.detectFraudPatterns(userId, auctionId, bidAmount, bidHistory);

      expect(result.isSuspicious).toBe(false);
      expect(result.riskScore).toBeLessThan(30);
      expect(result.riskLevel).toBe('low');
    });

    it('should detect suspicious rapid bidding', async () => {
      const userId = 'suspicious-user';
      const auctionId = 'suspicious-auction';
      const bidAmount = 20000;
      const bidHistory = [
        { amount: 5000, timestamp: new Date(Date.now() - 10000) },
        { amount: 8000, timestamp: new Date(Date.now() - 8000) },
        { amount: 12000, timestamp: new Date(Date.now() - 6000) },
        { amount: 15000, timestamp: new Date(Date.now() - 4000) }
      ];

      const result = await aiService.detectFraudPatterns(userId, auctionId, bidAmount, bidHistory);

      expect(result.isSuspicious).toBe(true);
      expect(result.riskScore).toBeGreaterThan(20);
      expect(result.reasons).toContain('Rapid successive bids');
    });
  });

  describe('Face Recognition Testing', () => {
    it('should verify face matches', async () => {
      const userId = 'test-user-123';
      const selfiePath = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ'; // Mock base64
      const documentPath = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ'; // Mock base64

      const result = await aiService.verifyFaceMatch(userId, selfiePath, documentPath);

      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.matchScore).toBe('number');
      expect(result.confidence).toBeDefined();
      expect(typeof result.verified).toBe('boolean');
      expect(result.message).toBeDefined();
    });

    it('should handle invalid image formats', async () => {
      const userId = 'test-user-123';
      const invalidPath = 'invalid-image-path';

      await expect(
        aiService.verifyFaceMatch(userId, invalidPath, invalidPath)
      ).rejects.toThrow('Invalid image path or format');
    });
  });

  describe('OCR Testing', () => {
    it('should extract document data', async () => {
      const documentPath = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ'; // Mock base64

      const result = await aiService.extractDocumentData(documentPath, 'AADHAAR');

      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.confidence).toBe('number');
      expect(result.extractedData).toBeDefined();
    });

    it('should handle different document types', async () => {
      const documentPath = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ';

      const aadhaarResult = await aiService.extractDocumentData(documentPath, 'AADHAAR');
      const panResult = await aiService.extractDocumentData(documentPath, 'PAN');

      expect(aadhaarResult.extractedData).toHaveProperty('aadhaarNumber');
      expect(panResult.extractedData).toHaveProperty('panNumber');
    });
  });

  describe('Video Analysis Testing', () => {
    it('should analyze handmade videos', async () => {
      const productId = 'test-product-123';
      const videoPath = 'test-video-path.mp4';

      const result = await aiService.verifyHandmadeVideo(productId, videoPath);

      expect(result).toBeDefined();
      expect(typeof result.verified).toBe('boolean');
      expect(typeof result.authenticityScore).toBe('number');
      expect(result.confidence).toBeDefined();
      expect(result.detectedTechniques).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    it('should detect craft techniques', async () => {
      const productId = 'test-product-456';
      const videoPath = 'craft-video.mp4';

      const result = await aiService.verifyHandmadeVideo(productId, videoPath);

      expect(Array.isArray(result.detectedTechniques)).toBe(true);
      expect(result.detectedTechniques.length).toBeGreaterThan(0);
      expect(result.authenticityScore).toBeGreaterThan(0);
    });
  });

  describe('A/B Testing Optimization', () => {
    it('should optimize variant weights', async () => {
      // Track some interactions first
      await abTestingService.trackInteraction('user1', 'collaborative-filtering', 'conversion');
      await abTestingService.trackInteraction('user2', 'content-based', 'click');
      await abTestingService.trackInteraction('user3', 'hybrid-advanced', 'conversion');
      await abTestingService.trackInteraction('user4', 'hybrid-advanced', 'conversion');

      // Before optimization
      const variant1 = abTestingService.assignUserToVariant('test-user-1', 'recommendations');

      // Optimize based on performance
      await abTestingService.optimizeVariantWeights('recommendations');

      // After optimization
      const variant2 = abTestingService.assignUserToVariant('test-user-2', 'recommendations');

      expect(variant1).toBeDefined();
      expect(variant2).toBeDefined();
    });

    it('should get performance results', async () => {
      const results = await abTestingService.getTestResults('recommendations', 30);

      expect(Array.isArray(results)).toBe(true);
      results.forEach(result => {
        expect(result.variantId).toBeDefined();
        expect(typeof result.impressions).toBe('number');
        expect(typeof result.clicks).toBe('number');
        expect(typeof result.conversions).toBe('number');
        expect(typeof result.ctr).toBe('number');
        expect(typeof result.conversionRate).toBe('number');
      });
    });
  });
});
