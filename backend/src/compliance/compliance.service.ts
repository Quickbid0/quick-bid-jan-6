import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  ComplianceDocument,
  DocumentAcceptance,
  LegalConsent,
  NBFCComplianceRecord,
  GSTInvoice,
  ComplianceAuditLog,
} from '@prisma/client';

export interface ComplianceDocumentData {
  documentType: string;
  version: string;
  title: string;
  content: string;
  effectiveDate?: Date;
  expiryDate?: Date;
}

export interface LegalConsentData {
  consentType: string;
  consentVersion: string;
  consentText: string;
  withdrawalNotice?: string;
  expiresAt?: Date;
}

export interface NBFCComplianceData {
  applicationId: string;
  nbfcPartnerId: string;
  loanAmount: number;
  processingFee: number;
  kycDocuments: string[];
  incomeProof: string[];
  addressProof: string[];
  creditReport?: string;
}

export interface GSTInvoiceData {
  transactionId: string;
  transactionType: string;
  sellerId: string;
  buyerId: string;
  baseAmount: number;
  gstRate: number;
  itemDescription: string;
  hsnCode?: string;
  quantity?: number;
  sellerGST?: string;
  buyerGST?: string;
}

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  // Compliance Document Management
  async createComplianceDocument(data: ComplianceDocumentData, createdBy: string): Promise<ComplianceDocument> {
    this.logger.log(`Creating compliance document: ${data.documentType} v${data.version}`);

    const document = await this.prisma.complianceDocument.create({
      data: {
        documentType: data.documentType,
        version: data.version,
        title: data.title,
        content: data.content,
        effectiveDate: data.effectiveDate || new Date(),
        expiryDate: data.expiryDate,
        createdBy,
      },
    });

    await this.logComplianceEvent('DOCUMENT_CREATED', 'compliance', document.id, createdBy, {
      documentType: data.documentType,
      version: data.version,
    });

    return document;
  }

  async getActiveComplianceDocument(documentType: string): Promise<ComplianceDocument | null> {
    return this.prisma.complianceDocument.findFirst({
      where: {
        documentType,
        isActive: true,
      },
      orderBy: {
        version: 'desc',
      },
    });
  }

  async acceptComplianceDocument(
    userId: string,
    documentId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<DocumentAcceptance> {
    // Get document details
    const document = await this.prisma.complianceDocument.findUnique({
      where: { id: documentId },
    });

    if (!document || !document.isActive) {
      throw new BadRequestException('Document not found or not active');
    }

    // Check if already accepted
    const existingAcceptance = await this.prisma.documentAcceptance.findFirst({
      where: {
        userId,
        documentId,
        version: document.version,
      },
    });

    if (existingAcceptance) {
      throw new BadRequestException('Document already accepted');
    }

    const acceptance = await this.prisma.documentAcceptance.create({
      data: {
        userId,
        documentId,
        version: document.version,
        ipAddress,
        userAgent,
      },
    });

    await this.logComplianceEvent('DOCUMENT_ACCEPTED', 'compliance', acceptance.id, userId, {
      documentType: document.documentType,
      version: document.version,
    });

    this.logger.log(`User ${userId} accepted ${document.documentType} v${document.version}`);
    return acceptance;
  }

  async getUserDocumentAcceptances(userId: string): Promise<DocumentAcceptance[]> {
    return this.prisma.documentAcceptance.findMany({
      where: { userId },
      include: {
        document: true,
      },
      orderBy: {
        acceptedAt: 'desc',
      },
    });
  }

  // Legal Consent Management
  async recordLegalConsent(
    userId: string,
    data: LegalConsentData,
    ipAddress?: string,
    userAgent?: string
  ): Promise<LegalConsent> {
    const consent = await this.prisma.legalConsent.create({
      data: {
        userId,
        consentType: data.consentType,
        consentVersion: data.consentVersion,
        consentText: data.consentText,
        withdrawalNotice: data.withdrawalNotice,
        expiresAt: data.expiresAt,
        ipAddress,
        userAgent,
      },
    });

    await this.logComplianceEvent('LEGAL_CONSENT_GIVEN', 'legal', consent.id, userId, {
      consentType: data.consentType,
      version: data.consentVersion,
    });

    this.logger.log(`Legal consent recorded for user ${userId}: ${data.consentType}`);
    return consent;
  }

  async getUserLegalConsents(userId: string): Promise<LegalConsent[]> {
    return this.prisma.legalConsent.findMany({
      where: { userId },
      orderBy: {
        consentedAt: 'desc',
      },
    });
  }

  async checkLegalConsent(userId: string, consentType: string): Promise<boolean> {
    const latestConsent = await this.prisma.legalConsent.findFirst({
      where: {
        userId,
        consentType,
      },
      orderBy: {
        consentedAt: 'desc',
      },
    });

    if (!latestConsent) return false;

    // Check if consent is still valid
    if (latestConsent.expiresAt && latestConsent.expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  // NBFC Compliance Management
  async createNBFCComplianceRecord(data: NBFCComplianceData, createdBy: string): Promise<NBFCComplianceRecord> {
    this.logger.log(`Creating NBFC compliance record for application ${data.applicationId}`);

    const record = await this.prisma.nbfcComplianceRecord.create({
      data: {
        applicationId: data.applicationId,
        userId: createdBy, // The user applying for the loan
        nbfcPartnerId: data.nbfcPartnerId,
        loanAmount: data.loanAmount,
        processingFee: data.processingFee,
        kycDocuments: data.kycDocuments,
        incomeProof: data.incomeProof,
        addressProof: data.addressProof,
        creditReport: data.creditReport,
        createdBy,
      },
    });

    await this.logComplianceEvent('NBFC_APPLICATION_CREATED', 'financial', record.id, createdBy, {
      loanAmount: data.loanAmount,
      nbfcPartnerId: data.nbfcPartnerId,
    });

    return record;
  }

  async updateNBFCComplianceStatus(
    recordId: string,
    status: string,
    approvedBy?: string,
    rejectionReason?: string
  ): Promise<NBFCComplianceRecord> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'approved') {
      updateData.approvedBy = approvedBy;
      updateData.approvalDate = new Date();
    } else if (status === 'rejected') {
      updateData.rejectionReason = rejectionReason;
    } else if (status === 'disbursed') {
      updateData.disbursementDate = new Date();
    }

    const record = await this.prisma.nbfcComplianceRecord.update({
      where: { id: recordId },
      data: updateData,
    });

    await this.logComplianceEvent('NBFC_APPLICATION_UPDATED', 'financial', recordId, approvedBy || record.userId, {
      status,
      rejectionReason,
    });

    this.logger.log(`NBFC compliance record ${recordId} updated to ${status}`);
    return record;
  }

  async getNBFCComplianceRecords(userId: string): Promise<NBFCComplianceRecord[]> {
    return this.prisma.nbfcComplianceRecord.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // GST Invoice Management
  async generateGSTInvoice(data: GSTInvoiceData): Promise<GSTInvoice> {
    // Calculate GST
    const gstAmount = (data.baseAmount * data.gstRate) / 100;
    const totalAmount = data.baseAmount + gstAmount;

    // Generate invoice number
    const invoiceNumber = this.generateInvoiceNumber(data.transactionId);

    const invoice = await this.prisma.gstInvoice.create({
      data: {
        invoiceNumber,
        transactionId: data.transactionId,
        transactionType: data.transactionType,
        sellerId: data.sellerId,
        buyerId: data.buyerId,
        sellerGST: data.sellerGST,
        buyerGST: data.buyerGST,
        baseAmount: data.baseAmount,
        gstRate: data.gstRate,
        gstAmount,
        totalAmount,
        itemDescription: data.itemDescription,
        hsnCode: data.hsnCode,
        quantity: data.quantity || 1,
      },
    });

    await this.logComplianceEvent('GST_INVOICE_GENERATED', 'financial', invoice.id, data.sellerId, {
      invoiceNumber,
      totalAmount,
      transactionType: data.transactionType,
    });

    this.logger.log(`GST invoice generated: ${invoiceNumber} for ₹${totalAmount}`);
    return invoice;
  }

  async getGSTInvoices(userId: string, role: 'seller' | 'buyer' = 'buyer'): Promise<GSTInvoice[]> {
    const whereClause = role === 'seller' ? { sellerId: userId } : { buyerId: userId };

    return this.prisma.gstInvoice.findMany({
      where: whereClause,
      orderBy: {
        invoiceDate: 'desc',
      },
    });
  }

  async updateInvoiceStatus(invoiceId: string, status: string, paymentDate?: Date): Promise<GSTInvoice> {
    const updateData: any = { status };

    if (paymentDate) {
      updateData.paymentDate = paymentDate;
    }

    const invoice = await this.prisma.gstInvoice.update({
      where: { id: invoiceId },
      data: updateData,
    });

    await this.logComplianceEvent('GST_INVOICE_UPDATED', 'financial', invoiceId, invoice.sellerId, {
      status,
      paymentDate,
    });

    return invoice;
  }

  // Compliance Audit Trail
  async exportComplianceAuditTrail(
    startDate: Date,
    endDate: Date,
    filters?: {
      userId?: string;
      complianceType?: string;
      riskLevel?: string;
    }
  ): Promise<ComplianceAuditLog[]> {
    return this.prisma.complianceAuditLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        ...(filters?.userId && { userId: filters.userId }),
        ...(filters?.complianceType && { complianceType: filters.complianceType }),
        ...(filters?.riskLevel && { riskLevel: filters.riskLevel }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getComplianceStatistics(): Promise<{
    totalDocuments: number;
    activeDocuments: number;
    totalAcceptances: number;
    totalConsents: number;
    totalInvoices: number;
    complianceByType: Record<string, number>;
  }> {
    const [documentCount, activeDocuments, acceptanceCount, consentCount, invoiceCount, complianceStats] = await Promise.all([
      this.prisma.complianceDocument.count(),
      this.prisma.complianceDocument.count({ where: { isActive: true } }),
      this.prisma.documentAcceptance.count(),
      this.prisma.legalConsent.count(),
      this.prisma.gstInvoice.count(),
      this.prisma.complianceAuditLog.groupBy({
        by: ['complianceType'],
        _count: { complianceType: true },
      }),
    ]);

    const complianceByType = complianceStats.reduce((acc, stat) => {
      acc[stat.complianceType] = stat._count.complianceType;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalDocuments: documentCount,
      activeDocuments,
      totalAcceptances: acceptanceCount,
      totalConsents: consentCount,
      totalInvoices: invoiceCount,
      complianceByType,
    };
  }

  // Private helper methods
  private generateInvoiceNumber(transactionId: string): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${timestamp}-${random}`;
  }

  private async logComplianceEvent(
    action: string,
    complianceType: string,
    resourceId: string,
    userId: string,
    metadata?: any
  ): Promise<void> {
    await this.prisma.complianceAuditLog.create({
      data: {
        userId,
        action,
        resource: 'compliance',
        resourceId,
        complianceType,
        riskLevel: this.determineRiskLevel(action),
        dataProcessing: this.involvesDataProcessing(complianceType),
        personalData: this.involvesPersonalData(complianceType),
        financialData: this.involvesFinancialData(complianceType),
        requiresRetention: this.requiresRetention(complianceType),
        oldValues: metadata?.oldValues,
        newValues: metadata?.newValues,
      },
    });
  }

  private determineRiskLevel(action: string): string {
    if (action.includes('REJECTED') || action.includes('VIOLATION')) return 'high';
    if (action.includes('APPROVED') || action.includes('ACCEPTED')) return 'medium';
    return 'low';
  }

  private involvesDataProcessing(complianceType: string): boolean {
    return ['gdpr', 'privacy_policy', 'personal_data'].includes(complianceType);
  }

  private involvesPersonalData(complianceType: string): boolean {
    return ['kyc', 'personal_data', 'gdpr'].includes(complianceType);
  }

  private involvesFinancialData(complianceType: string): boolean {
    return ['gst', 'financial', 'nbfc'].includes(complianceType);
  }

  private requiresRetention(complianceType: string): boolean {
    return ['gst', 'legal', 'financial', 'audit'].includes(complianceType);
  }
}
