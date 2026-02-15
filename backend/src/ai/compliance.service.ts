import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ComplianceCheck {
  checkId: string;
  checkType: 'kyc' | 'aml' | 'sanctions' | 'age' | 'location' | 'payment' | 'data_protection';
  status: 'passed' | 'failed' | 'pending' | 'requires_review';
  score: number; // 0-100 compliance score
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  violations: string[];
  recommendations: string[];
  lastChecked: Date;
  expiresAt?: Date;
}

export interface UserComplianceProfile {
  userId: string;
  country: string;
  region: string; // EU, US, IN, etc.
  complianceChecks: ComplianceCheck[];
  overallComplianceScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  dataRetentionPolicy: string;
  consentStatus: {
    marketing: boolean;
    dataProcessing: boolean;
    crossBorderTransfer: boolean;
    lastUpdated: Date;
  };
  sanctionsCheck: {
    status: 'clear' | 'flagged' | 'restricted';
    lastChecked: Date;
    riskScore: number;
  };
}

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  // Regional compliance requirements
  private readonly regionalRequirements = {
    EU: {
      gdpr: true,
      dataRetention: 30, // days for non-essential data
      consentRequired: ['marketing', 'dataProcessing', 'crossBorderTransfer'],
      sanctionsList: 'EU Sanctions',
      ageVerification: 16,
      currencyRestrictions: []
    },
    US: {
      gdpr: false,
      dataRetention: 365, // days
      consentRequired: ['marketing'],
      sanctionsList: 'OFAC',
      ageVerification: 18,
      currencyRestrictions: []
    },
    IN: {
      gdpr: false,
      dataRetention: 180, // days
      consentRequired: ['marketing', 'dataProcessing'],
      sanctionsList: 'UN Sanctions',
      ageVerification: 18,
      currencyRestrictions: []
    },
    UAE: {
      gdpr: false,
      dataRetention: 90,
      consentRequired: ['marketing', 'dataProcessing'],
      sanctionsList: 'UN Sanctions',
      ageVerification: 18,
      currencyRestrictions: []
    },
    SG: {
      gdpr: false,
      dataRetention: 180,
      consentRequired: ['marketing', 'dataProcessing', 'crossBorderTransfer'],
      sanctionsList: 'MAS Sanctions',
      ageVerification: 18,
      currencyRestrictions: []
    }
  };

  // Restricted countries (high-risk jurisdictions)
  private readonly restrictedCountries = [
    'KP', // North Korea
    'IR', // Iran
    'CU', // Cuba
    'SY', // Syria
    'VE'  // Venezuela
  ];

  // Sanctions list (simplified - in production, use real sanctions APIs)
  private readonly sanctionsList = new Set([
    'example-sanctioned-entity-1',
    'example-sanctioned-entity-2'
  ]);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Create or update user compliance profile
   */
  async createComplianceProfile(
    userId: string,
    userData: {
      country: string;
      dateOfBirth?: Date;
      fullName: string;
      email: string;
      phone?: string;
      ipAddress?: string;
    }
  ): Promise<UserComplianceProfile> {
    const region = this.determineRegion(userData.country);
    const requirements = this.regionalRequirements[region] || this.regionalRequirements['IN'];

    // Perform initial compliance checks
    const complianceChecks = await this.performInitialComplianceChecks(userId, userData, requirements);

    const overallScore = this.calculateOverallComplianceScore(complianceChecks);
    const riskLevel = this.determineRiskLevel(overallScore);

    const profile: UserComplianceProfile = {
      userId,
      country: userData.country,
      region,
      complianceChecks,
      overallComplianceScore: overallScore,
      riskLevel,
      dataRetentionPolicy: `${requirements.dataRetention} days`,
      consentStatus: {
        marketing: false,
        dataProcessing: false,
        crossBorderTransfer: false,
        lastUpdated: new Date()
      },
      sanctionsCheck: {
        status: 'clear',
        lastChecked: new Date(),
        riskScore: 0
      }
    };

    // Store profile (in production, save to database)
    this.logger.log(`Created compliance profile for user ${userId}: ${overallScore}% compliance, ${riskLevel} risk`);

    return profile;
  }

  /**
   * Update user consent status
   */
  async updateUserConsent(
    userId: string,
    consents: {
      marketing?: boolean;
      dataProcessing?: boolean;
      crossBorderTransfer?: boolean;
    }
  ): Promise<void> {
    // In production, update database
    this.logger.log(`Updated consent for user ${userId}:`, consents);
  }

  /**
   * Check if transaction is compliant with regulations
   */
  async checkTransactionCompliance(
    userId: string,
    transactionData: {
      amount: number;
      currency: string;
      recipientCountry: string;
      transactionType: 'payment' | 'withdrawal' | 'transfer';
    }
  ): Promise<{
    compliant: boolean;
    riskScore: number;
    requiredActions: string[];
    blockedReason?: string;
  }> {
    const userProfile = await this.getUserComplianceProfile(userId);
    if (!userProfile) {
      return {
        compliant: false,
        riskScore: 100,
        requiredActions: ['Complete compliance profile'],
        blockedReason: 'User compliance profile not found'
      };
    }

    let riskScore = 0;
    const requiredActions: string[] = [];

    // Check transaction amount limits
    if (transactionData.amount > this.getTransactionLimit(userProfile.country, transactionData.currency)) {
      riskScore += 50;
      requiredActions.push('Enhanced due diligence required for high-value transaction');
    }

    // Check cross-border restrictions
    if (userProfile.country !== transactionData.recipientCountry) {
      if (this.restrictedCountries.includes(transactionData.recipientCountry)) {
        return {
          compliant: false,
          riskScore: 100,
          requiredActions: [],
          blockedReason: 'Transaction to restricted country not allowed'
        };
      }

      riskScore += 20;
      requiredActions.push('Cross-border transaction requires additional verification');
    }

    // Check sanctions
    if (await this.checkSanctionsList(userId, transactionData)) {
      return {
        compliant: false,
        riskScore: 100,
        requiredActions: [],
        blockedReason: 'Transaction involves sanctioned entity'
      };
    }

    // Check AML compliance
    if (transactionData.amount > 50000) { // INR threshold
      riskScore += 30;
      requiredActions.push('AML compliance check required');
    }

    const compliant = riskScore < 70; // Risk threshold

    return {
      compliant,
      riskScore,
      requiredActions
    };
  }

  /**
   * Check data retention compliance
   */
  async checkDataRetentionCompliance(userId: string): Promise<{
    compliant: boolean;
    actionsRequired: string[];
    dataToDelete: string[];
  }> {
    // In production, check user data against retention policies
    const userProfile = await this.getUserComplianceProfile(userId);
    if (!userProfile) {
      return {
        compliant: true,
        actionsRequired: [],
        dataToDelete: []
      };
    }

    const retentionDays = this.getRetentionPeriod(userProfile.region);
    // Simplified check - in production, check actual data timestamps

    return {
      compliant: true,
      actionsRequired: [],
      dataToDelete: []
    };
  }

  /**
   * Generate compliance report for user
   */
  async generateComplianceReport(userId: string): Promise<{
    userId: string;
    complianceScore: number;
    riskLevel: string;
    lastChecked: Date;
    nextReview: Date;
    violations: string[];
    recommendations: string[];
    regionalRequirements: string[];
  }> {
    const profile = await this.getUserComplianceProfile(userId);
    if (!profile) {
      throw new Error('Compliance profile not found');
    }

    const violations = profile.complianceChecks
      .filter(check => check.status === 'failed')
      .map(check => `${check.checkType}: ${check.violations.join(', ')}`);

    const recommendations = profile.complianceChecks
      .flatMap(check => check.recommendations);

    const regionalReqs = this.getRegionalRequirements(profile.region);

    return {
      userId,
      complianceScore: profile.overallComplianceScore,
      riskLevel: profile.riskLevel,
      lastChecked: new Date(),
      nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      violations,
      recommendations,
      regionalRequirements: regionalReqs
    };
  }

  /**
   * Check sanctions list
   */
  private async checkSanctionsList(userId: string, transactionData: any): Promise<boolean> {
    // In production, integrate with real sanctions APIs
    // For now, simplified check
    return false; // No sanctions violations
  }

  /**
   * Perform initial compliance checks
   */
  private async performInitialComplianceChecks(
    userId: string,
    userData: any,
    requirements: any
  ): Promise<ComplianceCheck[]> {
    const checks: ComplianceCheck[] = [];

    // Age verification
    const ageCheck = this.performAgeCheck(userData.dateOfBirth, requirements.ageVerification);
    checks.push(ageCheck);

    // Location compliance
    const locationCheck = this.performLocationCheck(userData.country);
    checks.push(locationCheck);

    // Sanctions check
    const sanctionsCheck = await this.performSanctionsCheck(userData.fullName, userData.country);
    checks.push(sanctionsCheck);

    // KYC compliance
    const kycCheck = this.performKycCheck(userData);
    checks.push(kycCheck);

    return checks;
  }

  private performAgeCheck(dateOfBirth: Date | undefined, minAge: number): ComplianceCheck {
    if (!dateOfBirth) {
      return {
        checkId: 'age-verification',
        checkType: 'age',
        status: 'requires_review',
        score: 50,
        riskLevel: 'medium',
        violations: ['Date of birth not provided'],
        recommendations: ['Complete age verification process'],
        lastChecked: new Date()
      };
    }

    const age = Math.floor((Date.now() - dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    if (age >= minAge) {
      return {
        checkId: 'age-verification',
        checkType: 'age',
        status: 'passed',
        score: 100,
        riskLevel: 'low',
        violations: [],
        recommendations: [],
        lastChecked: new Date()
      };
    } else {
      return {
        checkId: 'age-verification',
        checkType: 'age',
        status: 'failed',
        score: 0,
        riskLevel: 'critical',
        violations: ['User below minimum age requirement'],
        recommendations: ['Age verification failed - access restricted'],
        lastChecked: new Date()
      };
    }
  }

  private performLocationCheck(country: string): ComplianceCheck {
    if (this.restrictedCountries.includes(country)) {
      return {
        checkId: 'location-compliance',
        checkType: 'location',
        status: 'failed',
        score: 0,
        riskLevel: 'critical',
        violations: ['Service not available in this jurisdiction'],
        recommendations: ['Contact support for alternative access options'],
        lastChecked: new Date()
      };
    }

    return {
      checkId: 'location-compliance',
      checkType: 'location',
      status: 'passed',
      score: 100,
      riskLevel: 'low',
      violations: [],
      recommendations: [],
      lastChecked: new Date()
    };
  }

  private async performSanctionsCheck(fullName: string, country: string): Promise<ComplianceCheck> {
    // Simplified sanctions check - in production, use real APIs
    const nameLower = fullName.toLowerCase();

    if (this.sanctionsList.has(nameLower)) {
      return {
        checkId: 'sanctions-check',
        checkType: 'sanctions',
        status: 'failed',
        score: 0,
        riskLevel: 'critical',
        violations: ['Name matches sanctions list'],
        recommendations: ['Contact compliance team for review'],
        lastChecked: new Date()
      };
    }

    return {
      checkId: 'sanctions-check',
      checkType: 'sanctions',
      status: 'passed',
      score: 100,
      riskLevel: 'low',
      violations: [],
      recommendations: [],
      lastChecked: new Date()
    };
  }

  private performKycCheck(userData: any): ComplianceCheck {
    // Simplified KYC check - in production, integrate with KYC providers
    const hasRequiredFields = userData.fullName && userData.email;

    if (!hasRequiredFields) {
      return {
        checkId: 'kyc-compliance',
        checkType: 'kyc',
        status: 'requires_review',
        score: 30,
        riskLevel: 'high',
        violations: ['Incomplete KYC information'],
        recommendations: ['Complete full KYC verification process'],
        lastChecked: new Date()
      };
    }

    return {
      checkId: 'kyc-compliance',
      checkType: 'kyc',
      status: 'passed',
      score: 90,
      riskLevel: 'low',
      violations: [],
      recommendations: ['Consider enhanced KYC for high-value transactions'],
      lastChecked: new Date()
    };
  }

  private determineRegion(country: string): string {
    const euCountries = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'FI', 'SE', 'DK', 'IE', 'LU', 'MT', 'CY', 'EE', 'LV', 'LT', 'SK', 'SI', 'HR', 'BG', 'RO', 'GR', 'CZ', 'HU', 'PL'];
    const countryCode = country.substring(0, 2).toUpperCase();

    if (euCountries.includes(countryCode)) return 'EU';
    if (countryCode === 'US') return 'US';
    if (countryCode === 'AE') return 'UAE';
    if (countryCode === 'SG') return 'SG';
    if (countryCode === 'IN') return 'IN';

    return 'IN'; // Default to IN for unknown regions
  }

  private calculateOverallComplianceScore(checks: ComplianceCheck[]): number {
    if (checks.length === 0) return 0;

    const totalScore = checks.reduce((sum, check) => sum + check.score, 0);
    return Math.round(totalScore / checks.length);
  }

  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'high';
    return 'critical';
  }

  private getTransactionLimit(country: string, currency: string): number {
    // Simplified limits - in production, use real regulatory limits
    const limits = {
      INR: 500000, // ₹5 lakh per transaction
      USD: 10000,
      EUR: 10000,
      AED: 50000
    };

    return limits[currency] || 10000;
  }

  private getRetentionPeriod(region: string): number {
    return this.regionalRequirements[region]?.dataRetention || 180;
  }

  private getRegionalRequirements(region: string): string[] {
    const reqs = this.regionalRequirements[region];
    if (!reqs) return [];

    const requirements = [];
    if (reqs.gdpr) requirements.push('GDPR Compliance');
    requirements.push(`Data Retention: ${reqs.dataRetention} days`);
    requirements.push(`Minimum Age: ${reqs.ageVerification} years`);
    requirements.push(`${reqs.sanctionsList} Compliance`);

    return requirements;
  }

  private async getUserComplianceProfile(userId: string): Promise<UserComplianceProfile | null> {
    // In production, fetch from database
    // For now, return null to indicate profile needs to be created
    return null;
  }
}
