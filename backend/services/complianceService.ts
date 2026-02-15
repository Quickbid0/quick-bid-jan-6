import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

interface UserComplianceCheck {
  userId: string;
  checkType: 'kyc' | 'aml' | 'sanctions' | 'pep' | 'age_verification';
  status: 'pending' | 'passed' | 'failed' | 'requires_review';
  details?: any;
  riskScore?: number;
}

interface ComplianceAuditLog {
  userId: string;
  action: string;
  resource: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  jurisdiction: 'india' | 'international';
  dataProcessing: boolean;
  personalData: boolean;
  financialData: boolean;
  requiresRetention: boolean;
  details?: any;
}

@Injectable()
export class ComplianceService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Perform KYC verification for user
   */
  async performKYCVerification(userId: string, documents: any): Promise<UserComplianceCheck> {
    try {
      // Simulate KYC verification process
      // In production, integrate with third-party KYC providers like DigiLocker, Aadhaar, etc.

      const kycCheck: UserComplianceCheck = {
        userId,
        checkType: 'kyc',
        status: 'passed', // Simulate passed for now
        details: {
          documentsVerified: true,
          verificationDate: new Date(),
          provider: 'mock_kyc_provider'
        },
        riskScore: 0.1 // Low risk
      };

      // Store compliance record
      await this.storeComplianceRecord(userId, kycCheck);

      // Update user KYC status
      await this.prisma.user.update({
        where: { id: userId },
        data: { emailVerified: 'VERIFIED' as any } // Adjust based on your enum
      });

      return kycCheck;
    } catch (error) {
      console.error('KYC verification failed:', error);
      throw new InternalServerErrorException('KYC verification service unavailable');
    }
  }

  /**
   * Perform AML (Anti-Money Laundering) screening
   */
  async performAMLScreening(userId: string, transactionData: any): Promise<UserComplianceCheck> {
    try {
      // Simulate AML screening
      // In production, integrate with AML databases and transaction monitoring

      const amlCheck: UserComplianceCheck = {
        userId,
        checkType: 'aml',
        status: 'passed',
        details: {
          screenedAt: new Date(),
          transactionAmount: transactionData.amount,
          riskFactors: [],
          screeningProvider: 'mock_aml_provider'
        },
        riskScore: 0.05
      };

      await this.storeComplianceRecord(userId, amlCheck);

      // Log AML audit
      await this.logComplianceAudit({
        userId,
        action: 'AML_SCREENING_COMPLETED',
        resource: 'transaction',
        riskLevel: 'low',
        jurisdiction: 'india',
        dataProcessing: true,
        personalData: false,
        financialData: true,
        requiresRetention: true,
        details: amlCheck.details
      });

      return amlCheck;
    } catch (error) {
      console.error('AML screening failed:', error);
      throw new InternalServerErrorException('AML screening service unavailable');
    }
  }

  /**
   * Perform sanctions screening
   */
  async performSanctionsScreening(userId: string, userData: any): Promise<UserComplianceCheck> {
    try {
      // Simulate sanctions screening against OFAC, UN, EU lists
      // In production, integrate with sanctions screening APIs

      const sanctionsCheck: UserComplianceCheck = {
        userId,
        checkType: 'sanctions',
        status: 'passed',
        details: {
          screenedAt: new Date(),
          listsChecked: ['OFAC', 'UN_SANCTIONS', 'EU_SANCTIONS'],
          matchesFound: [],
          screeningProvider: 'mock_sanctions_provider'
        },
        riskScore: 0.02
      };

      await this.storeComplianceRecord(userId, sanctionsCheck);

      await this.logComplianceAudit({
        userId,
        action: 'SANCTIONS_SCREENING_COMPLETED',
        resource: 'user_profile',
        riskLevel: 'low',
        jurisdiction: 'international',
        dataProcessing: true,
        personalData: true,
        financialData: false,
        requiresRetention: true,
        details: sanctionsCheck.details
      });

      return sanctionsCheck;
    } catch (error) {
      console.error('Sanctions screening failed:', error);
      throw new InternalServerErrorException('Sanctions screening service unavailable');
    }
  }

  /**
   * Perform PEP (Politically Exposed Person) screening
   */
  async performPEPScreening(userId: string, userData: any): Promise<UserComplianceCheck> {
    try {
      // Simulate PEP screening
      // In production, integrate with PEP databases

      const pepCheck: UserComplianceCheck = {
        userId,
        checkType: 'pep',
        status: 'passed',
        details: {
          screenedAt: new Date(),
          pepMatch: false,
          familyMembersChecked: true,
          closeAssociatesChecked: true,
          screeningProvider: 'mock_pep_provider'
        },
        riskScore: 0.03
      };

      await this.storeComplianceRecord(userId, pepCheck);

      await this.logComplianceAudit({
        userId,
        action: 'PEP_SCREENING_COMPLETED',
        resource: 'user_profile',
        riskLevel: 'low',
        jurisdiction: 'international',
        dataProcessing: true,
        personalData: true,
        financialData: false,
        requiresRetention: true,
        details: pepCheck.details
      });

      return pepCheck;
    } catch (error) {
      console.error('PEP screening failed:', error);
      throw new InternalServerErrorException('PEP screening service unavailable');
    }
  }

  /**
   * Perform age verification
   */
  async performAgeVerification(userId: string, dob: Date): Promise<UserComplianceCheck> {
    try {
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();

      const ageCheck: UserComplianceCheck = {
        userId,
        checkType: 'age_verification',
        status: age >= 18 ? 'passed' : 'failed',
        details: {
          dateOfBirth: dob,
          calculatedAge: age,
          minimumAge: 18,
          verifiedAt: new Date()
        },
        riskScore: age >= 18 ? 0.01 : 1.0
      };

      await this.storeComplianceRecord(userId, ageCheck);

      if (age < 18) {
        await this.logComplianceAudit({
          userId,
          action: 'AGE_VERIFICATION_FAILED',
          resource: 'user_profile',
          riskLevel: 'high',
          jurisdiction: 'india',
          dataProcessing: true,
          personalData: true,
          financialData: false,
          requiresRetention: true,
          details: { age, requiredAge: 18 }
        });
      }

      return ageCheck;
    } catch (error) {
      console.error('Age verification failed:', error);
      throw new InternalServerErrorException('Age verification service unavailable');
    }
  }

  /**
   * GDPR deletion workflow
   */
  async initiateGDPRDeletion(userId: string, reason: string): Promise<void> {
    try {
      // Log deletion request
      await this.logComplianceAudit({
        userId,
        action: 'GDPR_DELETION_REQUESTED',
        resource: 'user_account',
        riskLevel: 'medium',
        jurisdiction: 'international',
        dataProcessing: true,
        personalData: true,
        financialData: true,
        requiresRetention: true,
        details: { reason, requestDate: new Date() }
      });

      // Schedule deletion (typically 30 days for review)
      const deletionDate = new Date();
      deletionDate.setDate(deletionDate.getDate() + 30);

      // Use raw query to update deletedAt to avoid Prisma type issues
      await this.prisma.$executeRaw`
        UPDATE accounts
        SET deleted_at = ${deletionDate}, status = 'DELETED'
        WHERE id = ${userId}
      `;

    } catch (error) {
      console.error('GDPR deletion initiation failed:', error);
      throw new InternalServerErrorException('GDPR deletion service unavailable');
    }
  }

  /**
   * Check user's overall compliance status
   */
  async getComplianceStatus(userId: string): Promise<{
    overallStatus: 'compliant' | 'under_review' | 'non_compliant';
    checks: UserComplianceCheck[];
    riskScore: number;
  }> {
    // In production, query compliance records from database
    // For now, return mock data

    const checks: UserComplianceCheck[] = [
      {
        userId,
        checkType: 'kyc',
        status: 'passed',
        riskScore: 0.1
      },
      {
        userId,
        checkType: 'aml',
        status: 'passed',
        riskScore: 0.05
      },
      {
        userId,
        checkType: 'sanctions',
        status: 'passed',
        riskScore: 0.02
      }
    ];

    const overallRiskScore = checks.reduce((sum, check) => sum + (check.riskScore || 0), 0);
    const overallStatus = overallRiskScore < 0.3 ? 'compliant' :
                         overallRiskScore < 0.7 ? 'under_review' : 'non_compliant';

    return {
      overallStatus,
      checks,
      riskScore: overallRiskScore
    };
  }

  /**
   * Store compliance record in database
   */
  private async storeComplianceRecord(userId: string, check: UserComplianceCheck): Promise<void> {
    // In production, create compliance_records table and store here
    // For now, just log
    console.log('Compliance record stored:', { userId, check });
  }

  /**
   * Log compliance audit event
   */
  private async logComplianceAudit(log: ComplianceAuditLog): Promise<void> {
    try {
      await this.prisma.complianceAuditLog.create({
        data: {
          userId: log.userId,
          action: log.action,
          resource: log.resource,
          riskLevel: log.riskLevel,
          jurisdiction: log.jurisdiction,
          dataProcessing: log.dataProcessing,
          personalData: log.personalData,
          financialData: log.financialData,
          requiresRetention: log.requiresRetention,
          oldValues: null,
          newValues: null,
          ipAddress: null,
          userAgent: null,
          location: null,
          createdAt: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to log compliance audit:', error);
      // Don't throw - audit logging failure shouldn't break main flow
    }
  }

  /**
   * RBI compliance check for NBFC operations
   */
  async checkNBFCCompliance(userId: string, loanAmount: number): Promise<boolean> {
    try {
      // Simulate RBI NBFC compliance checks
      // In production, check:
      // - Credit score thresholds
      // - Loan-to-value ratios
      // - Regulatory limits
      // - NBFC licensing requirements

      const complianceStatus = await this.getComplianceStatus(userId);

      // RBI requires minimum credit score of 650 for NBFC loans
      const minCreditScore = 650;
      const maxLoanAmount = 5000000; // 50 lakhs max for NBFC

      const isCompliant = complianceStatus.overallStatus === 'compliant' &&
                         loanAmount <= maxLoanAmount;

      await this.logComplianceAudit({
        userId,
        action: 'NBFC_COMPLIANCE_CHECKED',
        resource: 'loan_application',
        riskLevel: isCompliant ? 'low' : 'high',
        jurisdiction: 'india',
        dataProcessing: true,
        personalData: true,
        financialData: true,
        requiresRetention: true,
        details: {
          loanAmount,
          maxAllowedAmount: maxLoanAmount,
          complianceStatus: complianceStatus.overallStatus,
          isCompliant
        }
      });

      return isCompliant;
    } catch (error) {
      console.error('NBFC compliance check failed:', error);
      return false;
    }
  }
}
