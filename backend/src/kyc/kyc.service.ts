import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

interface AadhaarVerificationRequest {
  aadhaarNumber: string;
  name: string;
  dob: string;
  consent?: boolean;
}

interface PANVerificationRequest {
  panNumber: string;
  name: string;
  dob?: string;
  consent?: boolean;
}

interface FaceVerificationRequest {
  userId: string;
  faceImage: Buffer;
  documentType?: 'aadhaar' | 'pan' | 'passport';
  consent?: boolean;
}

interface BankAccountVerificationRequest {
  accountNumber: string;
  ifscCode: string;
  name: string;
  consent?: boolean;
}

interface KYCSubmissionRequest {
  userId: string;
  aadhaarVerified: boolean;
  panVerified: boolean;
  faceVerified: boolean;
  bankVerified?: boolean;
  documents: {
    aadhaarFront?: string;
    aadhaarBack?: string;
    panCard?: string;
    selfie?: string;
    bankStatement?: string;
  };
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    dob: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
}

interface KYCStatusResponse {
  userId: string;
  status: 'not_started' | 'in_progress' | 'pending_review' | 'approved' | 'rejected' | 'expired';
  verificationProgress: {
    aadhaar: boolean;
    pan: boolean;
    face: boolean;
    bank?: boolean;
    documents: boolean;
  };
  submittedAt?: Date;
  reviewedAt?: Date;
  approvedAt?: Date;
  rejectionReason?: string;
  expiryDate?: Date;
}

@Injectable()
export class KYCService {
  private readonly logger = new Logger(KYCService.name);
  private readonly kycProviderUrl = 'https://api.signzy.com'; // Example: Signzy API
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(private configService: ConfigService) {
    // In production, configure these from environment variables
    this.apiKey = this.configService.get<string>('SIGNZY_API_KEY') || 'demo_api_key';
    this.apiSecret = this.configService.get<string>('SIGNZY_API_SECRET') || 'demo_api_secret';

    this.logger.log('KYC Service initialized with provider integration');
  }

  /**
   * Verify Aadhaar using external KYC provider
   */
  async verifyAadhaar(request: AadhaarVerificationRequest): Promise<{
    success: boolean;
    verified: boolean;
    requestId: string;
    message: string;
    details?: any;
  }> {
    try {
      // Validate input
      if (!this.validateAadhaarFormat(request.aadhaarNumber)) {
        throw new BadRequestException('Invalid Aadhaar number format');
      }

      if (!request.consent) {
        throw new BadRequestException('User consent is required for Aadhaar verification');
      }

      this.logger.log(`Initiating Aadhaar verification for user: ${request.name}`);

      // In production, integrate with actual KYC provider
      // Example with Signzy API
      const verificationResult = await this.callKYCProvider('aadhaar', {
        id_number: request.aadhaarNumber,
        name: request.name,
        dob: request.dob,
      });

      // Process verification result
      const isVerified = verificationResult.status === 'verified';

      return {
        success: true,
        verified: isVerified,
        requestId: verificationResult.requestId,
        message: isVerified
          ? 'Aadhaar verification successful'
          : 'Aadhaar verification failed. Please check your details.',
        details: verificationResult,
      };
    } catch (error) {
      this.logger.error(`Aadhaar verification error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Aadhaar verification service unavailable');
    }
  }

  /**
   * Verify PAN using external KYC provider
   */
  async verifyPAN(request: PANVerificationRequest): Promise<{
    success: boolean;
    verified: boolean;
    requestId: string;
    message: string;
    details?: any;
  }> {
    try {
      // Validate PAN format
      if (!this.validatePANFormat(request.panNumber)) {
        throw new BadRequestException('Invalid PAN number format');
      }

      if (!request.consent) {
        throw new BadRequestException('User consent is required for PAN verification');
      }

      this.logger.log(`Initiating PAN verification for user: ${request.name}`);

      // In production, integrate with actual KYC provider
      const verificationResult = await this.callKYCProvider('pan', {
        id_number: request.panNumber,
        name: request.name,
        dob: request.dob,
      });

      const isVerified = verificationResult.status === 'verified';

      return {
        success: true,
        verified: isVerified,
        requestId: verificationResult.requestId,
        message: isVerified
          ? 'PAN verification successful'
          : 'PAN verification failed. Please check your details.',
        details: verificationResult,
      };
    } catch (error) {
      this.logger.error(`PAN verification error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('PAN verification service unavailable');
    }
  }

  /**
   * Perform face verification using computer vision
   */
  async verifyFace(request: FaceVerificationRequest): Promise<{
    success: boolean;
    verified: boolean;
    confidence: number;
    requestId: string;
    message: string;
    details?: any;
  }> {
    try {
      if (!request.consent) {
        throw new BadRequestException('User consent is required for face verification');
      }

      this.logger.log(`Initiating face verification for user: ${request.userId}`);

      // Save uploaded image temporarily
      const imagePath = await this.saveTempImage(request.faceImage, request.userId);

      try {
        // In production, integrate with face recognition service (AWS Rekognition, Azure Face API, etc.)
        const verificationResult = await this.callFaceRecognitionAPI(imagePath, request.documentType);

        const confidence = verificationResult.confidence || 0;
        const isVerified = confidence >= 0.8; // 80% confidence threshold

        return {
          success: true,
          verified: isVerified,
          confidence,
          requestId: verificationResult.requestId,
          message: isVerified
            ? 'Face verification successful'
            : 'Face verification failed. Please ensure good lighting and clear image.',
          details: verificationResult,
        };
      } finally {
        // Clean up temporary image
        await this.deleteTempImage(imagePath);
      }
    } catch (error) {
      this.logger.error(`Face verification error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Face verification service unavailable');
    }
  }

  /**
   * Verify bank account details
   */
  async verifyBankAccount(request: BankAccountVerificationRequest): Promise<{
    success: boolean;
    verified: boolean;
    requestId: string;
    message: string;
    details?: any;
  }> {
    try {
      if (!request.consent) {
        throw new BadRequestException('User consent is required for bank verification');
      }

      this.logger.log(`Initiating bank account verification for: ${request.name}`);

      // In production, integrate with bank verification APIs (Razorpay, Cashfree, etc.)
      const verificationResult = await this.callBankVerificationAPI({
        account_number: request.accountNumber,
        ifsc_code: request.ifscCode,
        name: request.name,
      });

      const isVerified = verificationResult.status === 'verified';

      return {
        success: true,
        verified: isVerified,
        requestId: verificationResult.requestId,
        message: isVerified
          ? 'Bank account verification successful'
          : 'Bank account verification failed. Please check your details.',
        details: verificationResult,
      };
    } catch (error) {
      this.logger.error(`Bank verification error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Bank verification service unavailable');
    }
  }

  /**
   * Submit complete KYC application
   */
  async submitKYCApplication(request: KYCSubmissionRequest): Promise<{
    success: boolean;
    applicationId: string;
    status: string;
    message: string;
    estimatedProcessingTime: string;
  }> {
    try {
      // Validate all required verifications are complete
      const requiredVerifications = [request.aadhaarVerified, request.panVerified, request.faceVerified];
      if (requiredVerifications.some(v => !v)) {
        throw new BadRequestException('All required verifications (Aadhaar, PAN, Face) must be completed');
      }

      // Validate documents are provided
      const requiredDocuments = ['aadhaarFront', 'panCard', 'selfie'];
      const missingDocuments = requiredDocuments.filter(doc => !request.documents[doc as keyof typeof request.documents]);
      if (missingDocuments.length > 0) {
        throw new BadRequestException(`Missing required documents: ${missingDocuments.join(', ')}`);
      }

      this.logger.log(`Submitting KYC application for user: ${request.userId}`);

      // Create KYC application record
      const applicationId = `kyc_app_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

      const kycApplication = {
        id: applicationId,
        userId: request.userId,
        status: 'pending_review',
        submittedAt: new Date(),
        verifications: {
          aadhaar: request.aadhaarVerified,
          pan: request.panVerified,
          face: request.faceVerified,
          bank: request.bankVerified || false,
        },
        documents: request.documents,
        personalInfo: request.personalInfo,
        processingStartedAt: new Date(),
      };

      // In production, save to database
      this.logger.log(`KYC application created: ${applicationId}`);

      // Trigger async processing (webhook, manual review, etc.)
      await this.triggerKYCProcessing(kycApplication);

      return {
        success: true,
        applicationId,
        status: 'pending_review',
        message: 'KYC application submitted successfully. Processing typically takes 24-48 hours.',
        estimatedProcessingTime: '24-48 hours',
      };
    } catch (error) {
      this.logger.error(`KYC submission error: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('KYC submission failed');
    }
  }

  /**
   * Check KYC status for a user
   */
  async getKYCStatus(userId: string): Promise<KYCStatusResponse> {
    try {
      // In production, fetch from database
      // For now, return mock status based on user ID hash for consistency
      const hash = crypto.createHash('md5').update(userId).digest('hex');
      const statusIndex = parseInt(hash.slice(0, 2), 16) % 5;

      const statuses: KYCStatusResponse['status'][] = [
        'approved',      // Most users approved
        'pending_review', // Some pending
        'in_progress',   // Few in progress
        'not_started',  // New users
        'rejected',     // Few rejected
      ];

      const status = statuses[statusIndex];

      const response: KYCStatusResponse = {
        userId,
        status,
        verificationProgress: {
          aadhaar: status !== 'not_started',
          pan: status !== 'not_started',
          face: status !== 'not_started',
          bank: status === 'approved',
          documents: status !== 'not_started',
        },
      };

      // Add timestamps based on status
      if (status !== 'not_started') {
        response.submittedAt = new Date(Date.now() - 86400000); // 1 day ago
      }

      if (status === 'approved') {
        response.approvedAt = new Date(Date.now() - 43200000); // 12 hours ago
        response.reviewedAt = response.approvedAt;
      } else if (status === 'rejected') {
        response.reviewedAt = new Date(Date.now() - 43200000);
        response.rejectionReason = 'Document quality insufficient. Please resubmit with clearer images.';
      }

      if (status === 'approved') {
        response.expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
      }

      return response;
    } catch (error) {
      this.logger.error(`KYC status check error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Unable to check KYC status');
    }
  }

  /**
   * Upload and store KYC document
   */
  async uploadDocument(
    userId: string,
    documentType: string,
    file: Buffer,
    filename: string
  ): Promise<{
    success: boolean;
    documentUrl: string;
    documentId: string;
  }> {
    try {
      // Generate secure filename
      const extension = path.extname(filename);
      const documentId = `${documentType}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${extension}`;

      // In production, upload to cloud storage (AWS S3, Cloudinary, etc.)
      const documentUrl = await this.uploadToCloudStorage(file, documentId, userId);

      this.logger.log(`Document uploaded: ${documentType} for user ${userId}`);

      return {
        success: true,
        documentUrl,
        documentId,
      };
    } catch (error) {
      this.logger.error(`Document upload error: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Document upload failed');
    }
  }

  // Private helper methods

  private validateAadhaarFormat(aadhaar: string): boolean {
    const aadhaarRegex = /^\d{12}$/;
    if (!aadhaarRegex.test(aadhaar)) return false;

    // Additional checksum validation (last digit)
    const digits = aadhaar.split('').map(Number);
    let sum = 0;
    for (let i = 0; i < 11; i++) {
      sum += digits[i] * (12 - i);
    }
    const checkDigit = (11 - (sum % 11)) % 10;
    return checkDigit === digits[11];
  }

  private validatePANFormat(pan: string): boolean {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan.toUpperCase());
  }

  private async callKYCProvider(endpoint: string, data: any): Promise<any> {
    // In production, make actual API call to KYC provider
    // For now, simulate API response

    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

    // Mock response based on input
    const shouldSucceed = Math.random() > 0.1; // 90% success rate

    return {
      status: shouldSucceed ? 'verified' : 'failed',
      requestId: `req_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      verifiedAt: new Date().toISOString(),
      details: shouldSucceed ? {
        name: data.name,
        dob: data.dob,
        address: 'Mock Address',
      } : null,
      error: shouldSucceed ? null : 'Verification failed',
    };
  }

  private async callFaceRecognitionAPI(imagePath: string, documentType?: string): Promise<any> {
    // In production, integrate with face recognition service
    // For now, simulate processing

    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing delay

    const confidence = 0.7 + Math.random() * 0.25; // Random confidence 70-95%

    return {
      requestId: `face_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      confidence,
      matched: confidence >= 0.8,
      processedAt: new Date().toISOString(),
      landmarks: {
        eyes: 'detected',
        nose: 'detected',
        mouth: 'detected',
      },
    };
  }

  private async callBankVerificationAPI(data: any): Promise<any> {
    // In production, integrate with bank verification service
    // For now, simulate verification

    await new Promise(resolve => setTimeout(resolve, 1500));

    const isValid = Math.random() > 0.05; // 95% success rate

    return {
      status: isValid ? 'verified' : 'failed',
      requestId: `bank_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      accountDetails: isValid ? {
        name: data.name,
        accountNumber: data.account_number,
        ifscCode: data.ifsc_code,
        bankName: 'Mock Bank',
      } : null,
      verifiedAt: new Date().toISOString(),
    };
  }

  private async saveTempImage(imageBuffer: Buffer, userId: string): Promise<string> {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const filename = `face_${userId}_${Date.now()}.jpg`;
    const filepath = path.join(tempDir, filename);

    await fs.promises.writeFile(filepath, imageBuffer);
    return filepath;
  }

  private async deleteTempImage(filepath: string): Promise<void> {
    try {
      await fs.promises.unlink(filepath);
    } catch (error) {
      this.logger.warn(`Failed to delete temp image: ${filepath}`);
    }
  }

  private async uploadToCloudStorage(file: Buffer, filename: string, userId: string): Promise<string> {
    // In production, upload to cloud storage
    // For now, return mock URL
    return `https://storage.quickmela.com/kyc/${userId}/${filename}`;
  }

  private async triggerKYCProcessing(kycApplication: any): Promise<void> {
    // In production, trigger async processing:
    // 1. Send to manual review queue
    // 2. Trigger additional verification checks
    // 3. Send webhook to external systems
    // 4. Schedule follow-up notifications

    this.logger.log(`KYC processing triggered for application: ${kycApplication.id}`);

    // Simulate async processing
    setTimeout(() => {
      this.logger.log(`KYC processing completed for application: ${kycApplication.id}`);
    }, 5000);
  }
}
