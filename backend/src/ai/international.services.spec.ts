import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyService } from '../ai/currency.service';
import { ComplianceService } from '../ai/compliance.service';
import { ConfigService } from '@nestjs/config';

describe('Currency Service Tests', () => {
  let currencyService: CurrencyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurrencyService,
        ConfigService,
      ],
    }).compile();

    currencyService = module.get<CurrencyService>(CurrencyService);
  });

  describe('Currency Operations', () => {
    it('should return all supported currencies', () => {
      const currencies = currencyService.getAllCurrencies();

      expect(currencies).toBeDefined();
      expect(Array.isArray(currencies)).toBe(true);
      expect(currencies.length).toBeGreaterThan(5);

      // Check that INR is included
      const inr = currencies.find(c => c.code === 'INR');
      expect(inr).toBeDefined();
      expect(inr?.name).toBe('Indian Rupee');
      expect(inr?.symbol).toBe('₹');
    });

    it('should get currency by code', () => {
      const usd = currencyService.getCurrency('USD');
      const invalid = currencyService.getCurrency('XYZ');

      expect(usd).toBeDefined();
      expect(usd?.code).toBe('USD');
      expect(usd?.name).toBe('US Dollar');
      expect(usd?.symbol).toBe('$');

      expect(invalid).toBeNull();
    });

    it('should validate currency codes', () => {
      expect(currencyService.isValidCurrency('INR')).toBe(true);
      expect(currencyService.isValidCurrency('EUR')).toBe(true);
      expect(currencyService.isValidCurrency('XYZ')).toBe(false);
    });

    it('should format currency amounts correctly', () => {
      expect(currencyService.formatAmount(1500, 'INR')).toBe('₹1,500');
      expect(currencyService.formatAmount(99.99, 'USD')).toBe('$99.99');
      expect(currencyService.formatAmount(2500.50, 'EUR')).toBe('€2,501'); // Rounded for EUR
    });

    it('should convert currencies accurately', () => {
      // INR to USD conversion
      const usdAmount = currencyService.convertAmount(8300, 'INR', 'USD');
      expect(usdAmount).toBeCloseTo(100, 0); // Approximately $100

      // Same currency should return same amount
      const sameAmount = currencyService.convertAmount(100, 'INR', 'INR');
      expect(sameAmount).toBe(100);

      // USD to EUR conversion
      const eurAmount = currencyService.convertAmount(100, 'USD', 'EUR');
      expect(eurAmount).toBeCloseTo(92, 0); // Approximately €92
    });

    it('should throw error for invalid conversions', () => {
      expect(() => {
        currencyService.convertAmount(100, 'INR', 'INVALID');
      }).toThrow('Exchange rate not available');
    });

    it('should detect user preferred currency by location', () => {
      expect(currencyService.getUserPreferredCurrency('India')).toBe('INR');
      expect(currencyService.getUserPreferredCurrency('United States')).toBe('USD');
      expect(currencyService.getUserPreferredCurrency('Germany')).toBe('EUR');
      expect(currencyService.getUserPreferredCurrency('UAE')).toBe('AED');
      expect(currencyService.getUserPreferredCurrency('Singapore')).toBe('SGD');
      expect(currencyService.getUserPreferredCurrency('Unknown')).toBe('USD'); // Default
    });

    it('should calculate payment fees correctly', () => {
      const fees = currencyService.calculatePaymentFees(1000, 'INR', 'USD');

      expect(fees).toBeDefined();
      expect(fees.baseAmount).toBe(1000);
      expect(fees.conversionFee).toBeGreaterThan(0);
      expect(fees.internationalFee).toBeGreaterThan(0); // Cross-border fee
      expect(fees.totalAmount).toBeGreaterThan(fees.baseAmount);

      // INR to INR should have no international fee
      const domesticFees = currencyService.calculatePaymentFees(1000, 'INR', 'INR');
      expect(domesticFees.internationalFee).toBe(0);
    });

    it('should get currency display names with flags', () => {
      expect(currencyService.getCurrencyDisplayName('INR')).toBe('🇮🇳 Indian Rupee');
      expect(currencyService.getCurrencyDisplayName('USD')).toBe('🇺🇸 US Dollar');
      expect(currencyService.getCurrencyDisplayName('EUR')).toBe('🇪🇺 Euro');
    });

    it('should handle high-value transactions with limits', () => {
      // Test transaction limits for different countries/currencies
      const highValueFees = currencyService.calculatePaymentFees(100000, 'INR', 'USD');
      expect(highValueFees.totalAmount).toBeGreaterThan(100000);

      // Verify fees are reasonable (not more than 10% total)
      const totalFees = highValueFees.conversionFee + highValueFees.internationalFee;
      expect(totalFees / highValueFees.baseAmount).toBeLessThan(0.1);
    });

    it('should handle decimal precision correctly', () => {
      const preciseAmount = currencyService.convertAmount(1.50, 'USD', 'INR');
      expect(preciseAmount).toBeCloseTo(124, 0); // Should be around ₹124

      const formattedPrecise = currencyService.formatAmount(preciseAmount, 'INR');
      expect(formattedPrecise).toMatch(/₹\d+/); // Should format as Indian Rupee
    });
  });
});

describe('Compliance Service Tests', () => {
  let complianceService: ComplianceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplianceService,
        ConfigService,
      ],
    }).compile();

    complianceService = module.get<ComplianceService>(ComplianceService);
  });

  describe('User Compliance Profiles', () => {
    it('should create compliance profile for Indian user', async () => {
      const userData = {
        country: 'IN',
        dateOfBirth: new Date('1990-01-01'),
        fullName: 'John Doe',
        email: 'john@example.com'
      };

      const profile = await complianceService.createComplianceProfile('user-123', userData);

      expect(profile).toBeDefined();
      expect(profile.userId).toBe('user-123');
      expect(profile.country).toBe('IN');
      expect(profile.region).toBe('IN');
      expect(profile.complianceChecks).toBeDefined();
      expect(profile.overallComplianceScore).toBeGreaterThan(0);
    });

    it('should create compliance profile for EU user', async () => {
      const userData = {
        country: 'DE', // Germany
        dateOfBirth: new Date('1985-05-15'),
        fullName: 'Hans Mueller',
        email: 'hans@example.com'
      };

      const profile = await complianceService.createComplianceProfile('user-456', userData);

      expect(profile.region).toBe('EU');
      expect(profile.complianceChecks.some(check => check.checkType === 'data_protection')).toBe(true);
    });

    it('should reject underage users', async () => {
      const userData = {
        country: 'IN',
        dateOfBirth: new Date('2015-01-01'), // Under 18
        fullName: 'Young User',
        email: 'young@example.com'
      };

      const profile = await complianceService.createComplianceProfile('young-user', userData);

      const ageCheck = profile.complianceChecks.find(check => check.checkType === 'age');
      expect(ageCheck?.status).toBe('failed');
      expect(profile.riskLevel).toBe('critical');
      expect(profile.overallComplianceScore).toBeLessThan(50);
    });

    it('should flag restricted countries', async () => {
      const userData = {
        country: 'KP', // North Korea - restricted
        dateOfBirth: new Date('1990-01-01'),
        fullName: 'Test User',
        email: 'test@example.com'
      };

      const profile = await complianceService.createComplianceProfile('restricted-user', userData);

      const locationCheck = profile.complianceChecks.find(check => check.checkType === 'location');
      expect(locationCheck?.status).toBe('failed');
      expect(profile.riskLevel).toBe('critical');
    });
  });

  describe('Transaction Compliance', () => {
    it('should approve compliant domestic transactions', async () => {
      const transactionData = {
        amount: 50000,
        currency: 'INR',
        recipientCountry: 'IN',
        transactionType: 'payment'
      };

      const result = await complianceService.checkTransactionCompliance('user-123', transactionData);

      expect(result.compliant).toBe(true);
      expect(result.riskScore).toBeLessThan(50);
      expect(result.requiredActions.length).toBe(0);
    });

    it('should flag high-risk cross-border transactions', async () => {
      const transactionData = {
        amount: 50000,
        currency: 'INR',
        recipientCountry: 'US', // Different country
        transactionType: 'payment'
      };

      const result = await complianceService.checkTransactionCompliance('user-123', transactionData);

      expect(result.compliant).toBe(true); // May still be compliant but with actions
      expect(result.riskScore).toBeGreaterThan(0);
      expect(result.requiredActions.length).toBeGreaterThan(0);
    });

    it('should block transactions to restricted countries', async () => {
      const transactionData = {
        amount: 10000,
        currency: 'USD',
        recipientCountry: 'IR', // Iran - restricted
        transactionType: 'transfer'
      };

      const result = await complianceService.checkTransactionCompliance('user-123', transactionData);

      expect(result.compliant).toBe(false);
      expect(result.blockedReason).toContain('restricted');
    });

    it('should flag AML compliance for large transactions', async () => {
      const transactionData = {
        amount: 100000, // Large amount
        currency: 'INR',
        recipientCountry: 'IN',
        transactionType: 'payment'
      };

      const result = await complianceService.checkTransactionCompliance('user-123', transactionData);

      expect(result.riskScore).toBeGreaterThan(20);
      expect(result.requiredActions).toContain('AML compliance check required');
    });
  });

  describe('Compliance Reporting', () => {
    it('should generate compliance reports', async () => {
      const report = await complianceService.generateComplianceReport('user-123');

      expect(report).toBeDefined();
      expect(report.userId).toBe('user-123');
      expect(typeof report.complianceScore).toBe('number');
      expect(report.violations).toBeDefined();
      expect(report.recommendations).toBeDefined();
      expect(report.regionalRequirements).toBeDefined();
    });

    it('should include regional requirements in reports', async () => {
      const report = await complianceService.generateComplianceReport('user-123');

      expect(report.regionalRequirements.length).toBeGreaterThan(0);
      expect(report.regionalRequirements.some(req => req.includes('days'))).toBe(true);
    });
  });

  describe('Data Retention Compliance', () => {
    it('should check data retention compliance', async () => {
      const result = await complianceService.checkDataRetentionCompliance('user-123');

      expect(result).toBeDefined();
      expect(typeof result.compliant).toBe('boolean');
      expect(result.actionsRequired).toBeDefined();
      expect(result.dataToDelete).toBeDefined();
    });
  });

  describe('Consent Management', () => {
    it('should update user consent', async () => {
      const consents = {
        marketing: true,
        dataProcessing: true,
        crossBorderTransfer: false
      };

      await expect(
        complianceService.updateUserConsent('user-123', consents)
      ).resolves.not.toThrow();
    });
  });

  describe('Regional Compliance Rules', () => {
    it('should apply different rules for different regions', async () => {
      // EU user should have GDPR requirements
      const euUser = {
        country: 'DE',
        dateOfBirth: new Date('1990-01-01'),
        fullName: 'EU User',
        email: 'eu@example.com'
      };

      const euProfile = await complianceService.createComplianceProfile('eu-user', euUser);
      expect(euProfile.region).toBe('EU');

      // US user should have different requirements
      const usUser = {
        country: 'US',
        dateOfBirth: new Date('1990-01-01'),
        fullName: 'US User',
        email: 'us@example.com'
      };

      const usProfile = await complianceService.createComplianceProfile('us-user', usUser);
      expect(usProfile.region).toBe('US');
    });

    it('should enforce age restrictions by region', async () => {
      // EU requires 16+, India requires 18+
      const euYoungUser = {
        country: 'DE',
        dateOfBirth: new Date('2010-01-01'), // 14 years old
        fullName: 'EU Young',
        email: 'young-eu@example.com'
      };

      const euProfile = await complianceService.createComplianceProfile('eu-young', euYoungUser);
      const euAgeCheck = euProfile.complianceChecks.find(check => check.checkType === 'age');

      // EU allows 16+, so this should fail
      expect(euAgeCheck?.status).toBe('failed');
    });
  });

  describe('Sanctions Screening', () => {
    it('should pass clean users', async () => {
      const cleanUser = {
        country: 'IN',
        dateOfBirth: new Date('1990-01-01'),
        fullName: 'Clean User',
        email: 'clean@example.com'
      };

      const profile = await complianceService.createComplianceProfile('clean-user', cleanUser);
      const sanctionsCheck = profile.complianceChecks.find(check => check.checkType === 'sanctions');

      expect(sanctionsCheck?.status).toBe('passed');
    });

    it('should handle sanctions screening edge cases', async () => {
      // Test with various name formats that should pass screening
      const variousNames = [
        'John Smith',
        'Muhammad Ali',
        'Rajesh Kumar',
        'Maria Garcia'
      ];

      for (const name of variousNames) {
        const user = {
          country: 'IN',
          dateOfBirth: new Date('1990-01-01'),
          fullName: name,
          email: `${name.toLowerCase().replace(' ', '')}@example.com`
        };

        const profile = await complianceService.createComplianceProfile(`user-${name}`, user);
        const sanctionsCheck = profile.complianceChecks.find(check => check.checkType === 'sanctions');

        expect(sanctionsCheck?.status).toBe('passed');
      }
    });
  });
});
