import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

export interface EMIEligibilityCheck {
  isEligible: boolean;
  maxLoanAmount: number;
  monthlyEMI: number;
  interestRate: number;
  tenureMonths: number;
  processingFee: number;
  nbfcPartner: string;
  eligibilityScore: number;
  reasons: string[];
  recommendations: string[];
}

export interface NBFCPartner {
  id: string;
  name: string;
  minLoanAmount: number;
  maxLoanAmount: number;
  interestRateRange: [number, number];
  tenureRange: [number, number];
  processingFeePercent: number;
  eligibilityCriteria: {
    minAge: number;
    maxAge: number;
    minIncome: number;
    minCreditScore?: number;
    employmentTypes: string[];
  };
}

@Injectable()
export class EMIEligibilityService {
  private readonly logger = new Logger(EMIEligibilityService.name);

  // Simulated NBFC partners
  private readonly nbfcPartners: NBFCPartner[] = [
    {
      id: 'icici_bank',
      name: 'ICICI Bank',
      minLoanAmount: 100000,
      maxLoanAmount: 5000000,
      interestRateRange: [8.5, 15.5],
      tenureRange: [12, 84],
      processingFeePercent: 0.5,
      eligibilityCriteria: {
        minAge: 21,
        maxAge: 65,
        minIncome: 25000,
        minCreditScore: 650,
        employmentTypes: ['salaried', 'self-employed', 'business-owner'],
      },
    },
    {
      id: 'hdfc_bank',
      name: 'HDFC Bank',
      minLoanAmount: 50000,
      maxLoanAmount: 3000000,
      interestRateRange: [9.0, 16.0],
      tenureRange: [12, 72],
      processingFeePercent: 0.75,
      eligibilityCriteria: {
        minAge: 21,
        maxAge: 60,
        minIncome: 20000,
        minCreditScore: 600,
        employmentTypes: ['salaried', 'self-employed'],
      },
    },
    {
      id: 'bajaj_finance',
      name: 'Bajaj Finance',
      minLoanAmount: 100000,
      maxLoanAmount: 2500000,
      interestRateRange: [10.0, 18.0],
      tenureRange: [12, 60],
      processingFeePercent: 1.0,
      eligibilityCriteria: {
        minAge: 21,
        maxAge: 70,
        minIncome: 15000,
        employmentTypes: ['salaried', 'self-employed', 'business-owner', 'retired'],
      },
    },
    {
      id: 'shriram_finance',
      name: 'Shriram Finance',
      minLoanAmount: 50000,
      maxLoanAmount: 1500000,
      interestRateRange: [12.0, 24.0],
      tenureRange: [6, 48],
      processingFeePercent: 1.5,
      eligibilityCriteria: {
        minAge: 21,
        maxAge: 75,
        minIncome: 10000,
        employmentTypes: ['salaried', 'self-employed', 'business-owner', 'daily-wage'],
      },
    },
  ];

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async checkEMIEligibility(
    userId: string,
    vehiclePrice: number,
    downPayment: number = 0
  ): Promise<EMIEligibilityCheck[]> {
    this.logger.log(`Checking EMI eligibility for user ${userId}, vehicle price: ₹${vehiclePrice}`);

    // Get user profile and KYC information
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profiles: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get user's wallet balance and transaction history
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    const loanAmount = vehiclePrice - downPayment;
    const eligibilityChecks: EMIEligibilityCheck[] = [];

    for (const partner of this.nbfcPartners) {
      const check = await this.evaluatePartnerEligibility(
        user,
        wallet,
        loanAmount,
        partner
      );
      eligibilityChecks.push(check);
    }

    // Sort by best eligibility score
    eligibilityChecks.sort((a, b) => b.eligibilityScore - a.eligibilityScore);

    // Log the eligibility check
    await this.auditService.logActivity({
      userId,
      action: 'EMI_ELIGIBILITY_CHECKED',
      resource: 'emi',
      category: 'user',
      severity: 'low',
      metadata: {
        vehiclePrice,
        downPayment,
        loanAmount,
        eligiblePartners: eligibilityChecks.filter(c => c.isEligible).length,
        bestPartner: eligibilityChecks[0]?.nbfcPartner,
      },
    });

    return eligibilityChecks;
  }

  async getPreApprovedBadge(userId: string): Promise<{
    hasBadge: boolean;
    badgeLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
    maxLoanAmount: number;
    validUntil: Date;
    partners: string[];
  }> {
    // Check if user qualifies for pre-approved badge
    const eligibilityChecks = await this.checkEMIEligibility(userId, 100000); // Test with minimum amount

    const eligiblePartners = eligibilityChecks.filter(check => check.isEligible);

    if (eligiblePartners.length === 0) {
      return {
        hasBadge: false,
        badgeLevel: 'bronze',
        maxLoanAmount: 0,
        validUntil: new Date(),
        partners: [],
      };
    }

    // Determine badge level based on max loan amount and number of partners
    const maxLoanAmount = Math.max(...eligiblePartners.map(c => c.maxLoanAmount));
    let badgeLevel: 'bronze' | 'silver' | 'gold' | 'platinum' = 'bronze';

    if (maxLoanAmount >= 2000000 && eligiblePartners.length >= 3) {
      badgeLevel = 'platinum';
    } else if (maxLoanAmount >= 1500000 && eligiblePartners.length >= 2) {
      badgeLevel = 'gold';
    } else if (maxLoanAmount >= 1000000) {
      badgeLevel = 'silver';
    }

    return {
      hasBadge: true,
      badgeLevel,
      maxLoanAmount,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days validity
      partners: eligiblePartners.map(c => c.nbfcPartner),
    };
  }

  async calculateEMIOptions(
    loanAmount: number,
    tenureMonths: number,
    interestRate: number
  ): Promise<{
    monthlyEMI: number;
    totalAmount: number;
    totalInterest: number;
    amortizationSchedule: Array<{
      month: number;
      emi: number;
      principal: number;
      interest: number;
      balance: number;
    }>;
  }> {
    // Standard EMI calculation formula
    const monthlyRate = interestRate / (12 * 100);
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);

    const monthlyEMI = Math.round(emi);
    const totalAmount = monthlyEMI * tenureMonths;
    const totalInterest = totalAmount - loanAmount;

    // Generate amortization schedule
    const schedule = [];
    let balance = loanAmount;

    for (let month = 1; month <= tenureMonths; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyEMI - interestPayment;
      balance -= principalPayment;

      schedule.push({
        month,
        emi: monthlyEMI,
        principal: Math.round(principalPayment),
        interest: Math.round(interestPayment),
        balance: Math.max(0, Math.round(balance)),
      });
    }

    return {
      monthlyEMI,
      totalAmount,
      totalInterest,
      amortizationSchedule: schedule,
    };
  }

  async getNBFCPartners(): Promise<NBFCPartner[]> {
    return this.nbfcPartners;
  }

  async applyForLoan(
    userId: string,
    partnerId: string,
    loanAmount: number,
    vehicleId: string,
    tenureMonths: number
  ): Promise<{
    applicationId: string;
    status: 'submitted' | 'pre-approved' | 'under-review';
    estimatedApprovalTime: string;
    nextSteps: string[];
  }> {
    // Verify user eligibility
    const eligibility = await this.checkEMIEligibility(userId, loanAmount);
    const partnerEligibility = eligibility.find(e => e.nbfcPartner.toLowerCase().replace(/\s+/g, '_') === partnerId);

    if (!partnerEligibility?.isEligible) {
      throw new Error('User not eligible for this loan amount with selected partner');
    }

    // Generate application ID
    const applicationId = `EMI_${Date.now()}_${userId.slice(-6)}`;

    // Log loan application
    await this.auditService.logActivity({
      userId,
      action: 'EMI_LOAN_APPLICATION_SUBMITTED',
      resource: 'emi',
      resourceId: applicationId,
      category: 'user',
      severity: 'medium',
      metadata: {
        partnerId,
        loanAmount,
        vehicleId,
        tenureMonths,
        monthlyEMI: partnerEligibility.monthlyEMI,
      },
    });

    return {
      applicationId,
      status: 'submitted',
      estimatedApprovalTime: '2-3 business days',
      nextSteps: [
        'NBFC will verify your documents',
        'Credit score and income verification',
        'Loan sanction letter will be shared',
        'Vehicle booking confirmation after approval',
      ],
    };
  }

  private async evaluatePartnerEligibility(
    user: any,
    wallet: any,
    loanAmount: number,
    partner: NBFCPartner
  ): Promise<EMIEligibilityCheck> {
    const reasons: string[] = [];
    const recommendations: string[] = [];
    let eligibilityScore = 100;

    // Check loan amount range
    if (loanAmount < partner.minLoanAmount) {
      reasons.push(`Loan amount below minimum ₹${partner.minLoanAmount.toLocaleString()}`);
      eligibilityScore -= 50;
    } else if (loanAmount > partner.maxLoanAmount) {
      reasons.push(`Loan amount exceeds maximum ₹${partner.maxLoanAmount.toLocaleString()}`);
      eligibilityScore -= 50;
    }

    // Check age (simulated - would come from user profile)
    const userAge = 30; // Simulated age
    if (userAge < partner.eligibilityCriteria.minAge) {
      reasons.push(`Age below minimum ${partner.eligibilityCriteria.minAge} years`);
      eligibilityScore -= 30;
    } else if (userAge > partner.eligibilityCriteria.maxAge) {
      reasons.push(`Age exceeds maximum ${partner.eligibilityCriteria.maxAge} years`);
      eligibilityScore -= 30;
    }

    // Check income (simulated)
    const monthlyIncome = 45000; // Simulated income
    if (monthlyIncome < partner.eligibilityCriteria.minIncome) {
      reasons.push(`Income below minimum ₹${partner.eligibilityCriteria.minIncome.toLocaleString()}`);
      eligibilityScore -= 40;
    }

    // Check employment type
    const employmentType = 'salaried'; // Simulated
    if (!partner.eligibilityCriteria.employmentTypes.includes(employmentType)) {
      reasons.push(`Employment type not eligible`);
      eligibilityScore -= 20;
    }

    // Check wallet balance and transaction history
    if (wallet) {
      const walletBalance = wallet.balance || 0;
      if (walletBalance < loanAmount * 0.1) { // Require 10% down payment capability
        recommendations.push('Maintain sufficient wallet balance for down payment');
        eligibilityScore -= 10;
      }
    }

    // Check KYC status
    if (!user.emailVerified) {
      reasons.push('KYC verification required');
      eligibilityScore -= 25;
    }

    const isEligible = eligibilityScore >= 60;

    if (isEligible) {
      // Calculate EMI for eligible amount
      const maxLoanAmount = Math.min(loanAmount, partner.maxLoanAmount);
      const interestRate = this.calculateInterestRate(user, maxLoanAmount, partner);
      const tenureMonths = 60; // Default 5 years

      const emiCalculation = await this.calculateEMIOptions(maxLoanAmount, tenureMonths, interestRate);

      return {
        isEligible: true,
        maxLoanAmount,
        monthlyEMI: emiCalculation.monthlyEMI,
        interestRate,
        tenureMonths,
        processingFee: maxLoanAmount * (partner.processingFeePercent / 100),
        nbfcPartner: partner.name,
        eligibilityScore,
        reasons: reasons.length > 0 ? reasons : ['All criteria met'],
        recommendations,
      };
    } else {
      return {
        isEligible: false,
        maxLoanAmount: 0,
        monthlyEMI: 0,
        interestRate: 0,
        tenureMonths: 0,
        processingFee: 0,
        nbfcPartner: partner.name,
        eligibilityScore,
        reasons,
        recommendations: ['Complete KYC verification', 'Provide income proof', 'Check credit score'],
      };
    }
  }

  private calculateInterestRate(user: any, loanAmount: number, partner: NBFCPartner): number {
    // Base rate from partner range
    let rate = partner.interestRateRange[0];

    // Adjust based on loan amount (higher amounts get better rates)
    if (loanAmount > 1000000) {
      rate -= 1.0;
    } else if (loanAmount > 500000) {
      rate -= 0.5;
    }

    // Adjust based on user profile (simulated credit score)
    const creditScore = 750; // Simulated
    if (creditScore >= 800) {
      rate -= 1.5;
    } else if (creditScore >= 700) {
      rate -= 1.0;
    } else if (creditScore < 650) {
      rate += 2.0;
    }

    // Ensure within partner range
    return Math.max(partner.interestRateRange[0], Math.min(partner.interestRateRange[1], rate));
  }
}
