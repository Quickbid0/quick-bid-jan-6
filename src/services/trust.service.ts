// 🛡️ TRUST FEATURES - HIGH ROI, LOW COMPLEXITY
// src/services/trust.service.ts

export interface VerificationStatus {
  isVerified: boolean;
  verificationType: 'none' | 'basic' | 'enhanced' | 'premium';
  verificationDate?: Date;
  verificationMethod?: 'manual' | 'document' | 'video' | 'id';
  badgeLevel: 'none' | 'verified' | 'trusted' | 'premium';
  trustScore: number; // 0-100
}

export interface SellerVerification {
  sellerId: string;
  businessName: string;
  businessLicense?: string;
  taxId?: string;
  bankAccount?: {
    accountNumber: string;
    routingNumber: string;
    accountName: string;
  };
  documents: VerificationDocument[];
  status: VerificationStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  notes?: string;
}

export interface VerificationDocument {
  id: string;
  type: 'business_license' | 'tax_id' | 'id_document' | 'proof_of_address' | 'bank_statement';
  filename: string;
  url: string;
  uploadedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface AuctionStatus {
  auctionId: string;
  status: 'draft' | 'live' | 'ended' | 'cancelled' | 'suspended';
  statusMessage?: string;
  startTime?: Date;
  endTime?: Date;
  winnerId?: string;
  finalPrice?: number;
  bids: number;
  views: number;
  lastActivity?: Date;
}

export interface DisputeResolution {
  disputeId: string;
  auctionId: string;
  buyerId: string;
  sellerId: string;
  adminId: string;
  status: 'opened' | 'investigating' | 'resolved' | 'closed';
  issue: 'item_not_as_described' | 'payment_issue' | 'delivery_issue' | 'fraud_suspicion' | 'other';
  description: string;
  evidence: DisputeEvidence[];
  resolution?: string;
  resolutionType: 'refund' | 'return' | 'exchange' | 'compensation' | 'no_action';
  createdAt: Date;
  resolvedAt?: Date;
}

export interface DisputeEvidence {
  id: string;
  type: 'photo' | 'video' | 'document' | 'message';
  url: string;
  filename: string;
  uploadedBy: 'buyer' | 'seller' | 'admin';
  uploadedAt: Date;
}

export class TrustService {
  private verifications: Map<string, SellerVerification> = new Map();
  private auctionStatuses: Map<string, AuctionStatus> = new Map();
  private disputes: Map<string, DisputeResolution> = new Map();

  constructor() {
    this.initializeTrustSystem();
  }

  // Initialize trust system
  private initializeTrustSystem(): void {
    // Load from localStorage (will be replaced with backend API)
    const savedVerifications = localStorage.getItem('sellerVerifications');
    if (savedVerifications) {
      const verifications = JSON.parse(savedVerifications);
      verifications.forEach((v: SellerVerification) => {
        this.verifications.set(v.sellerId, v);
      });
    }

    const savedAuctionStatuses = localStorage.getItem('auctionStatuses');
    if (savedAuctionStatuses) {
      const statuses = JSON.parse(savedAuctionStatuses);
      statuses.forEach((s: AuctionStatus) => {
        this.auctionStatuses.set(s.auctionId, s);
      });
    }

    const savedDisputes = localStorage.getItem('disputes');
    if (savedDisputes) {
      const disputes = JSON.parse(savedDisputes);
      disputes.forEach((d: DisputeResolution) => {
        this.disputes.set(d.disputeId, d);
      });
    }
  }

  // Submit seller verification
  async submitVerification(sellerId: string, verificationData: Partial<SellerVerification>): Promise<SellerVerification> {
    const verification: SellerVerification = {
      sellerId,
      businessName: verificationData.businessName || '',
      businessLicense: verificationData.businessLicense,
      taxId: verificationData.taxId,
      bankAccount: verificationData.bankAccount,
      documents: verificationData.documents || [],
      status: {
        isVerified: false,
        verificationType: 'none',
        badgeLevel: 'none',
        trustScore: 0
      },
      submittedAt: new Date()
    };

    // Store verification
    this.verifications.set(sellerId, verification);
    
    // Save to localStorage (will be replaced with backend API)
    const allVerifications = Array.from(this.verifications.values());
    localStorage.setItem('sellerVerifications', JSON.stringify(allVerifications));

    console.log('🛡️ Seller verification submitted:', sellerId, verification.businessName);
    
    // In production, this would trigger admin review
    return verification;
  }

  // Review seller verification (admin action)
  async reviewVerification(
    sellerId: string, 
    approved: boolean, 
    adminId: string, 
    notes?: string
  ): Promise<SellerVerification> {
    const verification = this.verifications.get(sellerId);
    if (!verification) {
      throw new Error(`Verification not found for seller: ${sellerId}`);
    }

    const badgeLevel = approved ? this.calculateBadgeLevel(verification) : 'none';
    const trustScore = approved ? this.calculateTrustScore(verification) : 0;

    verification.status = {
      isVerified: approved,
      verificationType: approved ? this.calculateVerificationType(verification) : 'none',
      badgeLevel,
      trustScore,
      verificationDate: approved ? new Date() : undefined
    };
    verification.reviewedAt = new Date();
    verification.reviewedBy = adminId;
    verification.notes = notes;

    // Update verification
    this.verifications.set(sellerId, verification);
    
    // Save to localStorage
    const allVerifications = Array.from(this.verifications.values());
    localStorage.setItem('sellerVerifications', JSON.stringify(allVerifications));

    console.log('🛡️ Verification reviewed:', sellerId, approved ? 'APPROVED' : 'REJECTED');
    
    return verification;
  }

  // Get seller verification status
  getVerificationStatus(sellerId: string): VerificationStatus {
    const verification = this.verifications.get(sellerId);
    return verification?.status || {
      isVerified: false,
      verificationType: 'none',
      badgeLevel: 'none',
      trustScore: 0
    };
  }

  // Update auction status
  updateAuctionStatus(auctionId: string, status: AuctionStatus): void {
    this.auctionStatuses.set(auctionId, status);
    
    // Save to localStorage
    const allStatuses = Array.from(this.auctionStatuses.values());
    localStorage.setItem('auctionStatuses', JSON.stringify(allStatuses));

    console.log('🛡️ Auction status updated:', auctionId, status.status);
  }

  // Get auction status
  getAuctionStatus(auctionId: string): AuctionStatus | null {
    return this.auctionStatuses.get(auctionId) || null;
  }

  // Create dispute
  async createDispute(
    auctionId: string,
    buyerId: string,
    sellerId: string,
    issue: string,
    description: string
  ): Promise<DisputeResolution> {
    const dispute: DisputeResolution = {
      disputeId: `dispute-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      auctionId,
      buyerId,
      sellerId,
      adminId: 'system', // Will be assigned to admin
      status: 'opened',
      issue: issue as any,
      description,
      evidence: [],
      createdAt: new Date(),
      resolutionType: 'no_action' // Default resolution type
    };

    // Store dispute
    this.disputes.set(dispute.disputeId, dispute);
    
    // Save to localStorage
    const allDisputes = Array.from(this.disputes.values());
    localStorage.setItem('disputes', JSON.stringify(allDisputes));

    console.log('🛡️ Dispute created:', dispute.disputeId, issue);
    
    return dispute;
  }

  // Add evidence to dispute
  async addEvidence(
    disputeId: string,
    type: 'photo' | 'video' | 'document' | 'message',
    url: string,
    filename: string,
    uploadedBy: 'buyer' | 'seller' | 'admin'
  ): Promise<void> {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) {
      throw new Error(`Dispute not found: ${disputeId}`);
    }

    const evidence: DisputeEvidence = {
      id: `evidence-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      url,
      filename,
      uploadedBy,
      uploadedAt: new Date()
    };

    dispute.evidence.push(evidence);
    
    // Update dispute
    this.disputes.set(disputeId, dispute);
    
    // Save to localStorage
    const allDisputes = Array.from(this.disputes.values());
    localStorage.setItem('disputes', JSON.stringify(allDisputes));

    console.log('🛡️ Evidence added to dispute:', disputeId, type);
  }

  // Resolve dispute (admin action)
  async resolveDispute(
    disputeId: string,
    resolution: string,
    resolutionType: 'refund' | 'return' | 'exchange' | 'compensation' | 'no_action',
    adminId: string
  ): Promise<DisputeResolution> {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) {
      throw new Error(`Dispute not found: ${disputeId}`);
    }

    dispute.status = 'resolved';
    dispute.resolution = resolution;
    dispute.resolutionType = resolutionType;
    dispute.adminId = adminId;
    dispute.resolvedAt = new Date();

    // Update dispute
    this.disputes.set(disputeId, dispute);
    
    // Save to localStorage
    const allDisputes = Array.from(this.disputes.values());
    localStorage.setItem('disputes', JSON.stringify(allDisputes));

    console.log('🛡️ Dispute resolved:', disputeId, resolutionType);
    
    return dispute;
  }

  // Get dispute
  getDispute(disputeId: string): DisputeResolution | null {
    return this.disputes.get(disputeId) || null;
  }

  // Get all disputes
  getAllDisputes(): DisputeResolution[] {
    return Array.from(this.disputes.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Get all verifications
  getAllVerifications(): SellerVerification[] {
    return Array.from(this.verifications.values()).sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }

  // Get trust metrics
  getTrustMetrics(): {
    totalSellers: number;
    verifiedSellers: number;
    verificationRate: number;
    badgeDistribution: Record<string, number>;
    averageTrustScore: number;
    pendingVerifications: number;
    activeDisputes: number;
    resolvedDisputes: number;
    disputeResolutionRate: number;
  } {
    const allVerifications = this.getAllVerifications();
    const allDisputes = this.getAllDisputes();

    const totalSellers = allVerifications.length;
    const verifiedSellers = allVerifications.filter(v => v.status.isVerified).length;
    const pendingVerifications = allVerifications.filter(v => !v.status.isVerified).length;
    const activeDisputes = allDisputes.filter(d => d.status !== 'resolved').length;
    const resolvedDisputes = allDisputes.filter(d => d.status === 'resolved').length;

    const badgeDistribution = {
      none: allVerifications.filter(v => v.status.badgeLevel === 'none').length,
      verified: allVerifications.filter(v => v.status.badgeLevel === 'verified').length,
      trusted: allVerifications.filter(v => v.status.badgeLevel === 'trusted').length,
      premium: allVerifications.filter(v => v.status.badgeLevel === 'premium').length
    };

    const averageTrustScore = verifiedSellers > 0 
      ? allVerifications
          .filter(v => v.status.isVerified)
          .reduce((sum, v) => sum + v.status.trustScore, 0) / verifiedSellers
      : 0;

    return {
      totalSellers,
      verifiedSellers,
      verificationRate: totalSellers > 0 ? (verifiedSellers / totalSellers) * 100 : 0,
      badgeDistribution,
      averageTrustScore,
      pendingVerifications,
      activeDisputes,
      resolvedDisputes,
      disputeResolutionRate: allDisputes.length > 0 ? (resolvedDisputes / allDisputes.length) * 100 : 0
    };
  }

  // Private helper methods
  private calculateVerificationType(verification: SellerVerification): 'basic' | 'enhanced' | 'premium' {
    const hasLicense = !!verification.businessLicense;
    const hasTaxId = !!verification.taxId;
    const hasBankAccount = !!verification.bankAccount;
    const hasDocuments = verification.documents.length > 0;

    if (hasLicense && hasTaxId && hasBankAccount && hasDocuments) {
      return 'premium';
    } else if (hasLicense && hasTaxId) {
      return 'enhanced';
    } else if (hasLicense) {
      return 'basic';
    }
    return 'basic'; // Default to basic instead of none
  }

  private calculateBadgeLevel(verification: SellerVerification): 'verified' | 'trusted' | 'premium' {
    const verificationType = this.calculateVerificationType(verification);
    
    switch (verificationType) {
      case 'premium':
        return 'premium';
      case 'enhanced':
        return 'trusted';
      case 'basic':
        return 'verified';
      default:
        return 'verified'; // Default to verified instead of none
    }
  }

  private calculateTrustScore(verification: SellerVerification): number {
    const verificationType = this.calculateVerificationType(verification);
    const documentCount = verification.documents.length;
    
    let score = 0;
    
    // Base score for verification type
    switch (verificationType) {
      case 'premium':
        score = 80;
        break;
      case 'enhanced':
        score = 60;
        break;
      case 'basic':
        score = 40;
        break;
      default:
        score = 0;
    }
    
    // Add points for documents
    score += Math.min(documentCount * 5, 20);
    
    // Cap at 100
    return Math.min(score, 100);
  }

  // Get seller trust badge
  getSellerBadge(sellerId: string): {
    badgeLevel: 'none' | 'verified' | 'trusted' | 'premium';
    trustScore: number;
    verificationType: 'none' | 'basic' | 'enhanced' | 'premium';
  } {
    const status = this.getVerificationStatus(sellerId);
    return {
      badgeLevel: status.badgeLevel,
      trustScore: status.trustScore,
      verificationType: status.verificationType
    };
  }

  // Check if seller is verified
  isSellerVerified(sellerId: string): boolean {
    return this.getVerificationStatus(sellerId).isVerified;
  }

  // Get auction status clarity
  getAuctionStatusDisplay(auctionId: string): {
    status: string;
    statusMessage: string;
    color: string;
    icon: string;
  } {
    const status = this.getAuctionStatus(auctionId);
    if (!status) {
      return {
        status: 'Unknown',
        statusMessage: 'Status not available',
        color: 'gray',
        icon: 'question'
      };
    }

    switch (status.status) {
      case 'draft':
        return {
          status: 'Draft',
          statusMessage: 'Auction is being prepared',
          color: 'gray',
          icon: 'edit'
        };
      case 'live':
        return {
          status: 'Live',
          statusMessage: 'Auction is active and accepting bids',
          color: 'green',
          icon: 'play'
        };
      case 'ended':
        return {
          status: 'Ended',
          statusMessage: status.winnerId 
            ? `Sold to ${status.winnerId} for $${status.finalPrice}` 
            : 'Auction ended without a winner',
          color: status.winnerId ? 'blue' : 'gray',
          icon: status.winnerId ? 'check-circle' : 'x-circle'
        };
      case 'cancelled':
        return {
          status: 'Cancelled',
          statusMessage: status.statusMessage || 'Auction was cancelled',
          color: 'orange',
          icon: 'x-circle'
        };
      case 'suspended':
        return {
          status: 'Suspended',
          statusMessage: 'Auction is temporarily suspended',
          color: 'red',
          icon: 'pause-circle'
        };
      default:
        return {
          status: 'Unknown',
          statusMessage: 'Status not available',
          color: 'gray',
          icon: 'question'
        };
    }
  }

  // Get winner confirmation details
  getWinnerConfirmation(auctionId: string): {
    winnerId?: string;
    finalPrice?: number;
    confirmationMessage: string;
    nextSteps: string[];
  } {
    const status = this.getAuctionStatus(auctionId);
    
    if (!status || status.status !== 'ended' || !status.winnerId) {
      return {
        confirmationMessage: 'No winner for this auction',
        nextSteps: []
      };
    }

    return {
      winnerId: status.winnerId,
      finalPrice: status.finalPrice,
      confirmationMessage: `Congratulations! You won the auction for $${status.finalPrice}`,
      nextSteps: [
        'Complete payment within 24 hours',
        'Arrange pickup or delivery',
        'Leave a review for the seller'
      ]
    };
  }
}

export default TrustService;
