import { toast } from 'react-hot-toast';

export interface AadhaarVerificationRequest {
  aadhaarNumber: string;
  name: string;
  dob: string;
  consent?: boolean;
}

export interface PANVerificationRequest {
  panNumber: string;
  name: string;
  dob?: string;
  consent?: boolean;
}

export interface FaceVerificationRequest {
  userId: string;
  faceImage: File;
  documentType?: 'aadhaar' | 'pan' | 'passport';
  consent?: boolean;
}

export interface BankVerificationRequest {
  accountNumber: string;
  ifscCode: string;
  name: string;
  consent?: boolean;
}

export interface KYCSubmissionRequest {
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

export interface KYCStatus {
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

export interface VerificationResult {
  success: boolean;
  verified: boolean;
  requestId: string;
  message: string;
  confidence?: number;
  details?: any;
}

class KYCService {
  private readonly baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4011';

  /**
   * Verify Aadhaar with external KYC provider
   */
  async verifyAadhaar(request: AadhaarVerificationRequest): Promise<VerificationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/kyc/aadhaar-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Aadhaar verification failed');
      }

      if (data.verified) {
        toast.success('Aadhaar verification successful!');
      } else {
        toast.error(data.message || 'Aadhaar verification failed');
      }

      return data;
    } catch (error) {
      console.error('Error verifying Aadhaar:', error);
      const message = error instanceof Error ? error.message : 'Aadhaar verification failed';
      toast.error(message);
      throw new Error(message);
    }
  }

  /**
   * Verify PAN with external KYC provider
   */
  async verifyPAN(request: PANVerificationRequest): Promise<VerificationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/kyc/pan-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'PAN verification failed');
      }

      if (data.verified) {
        toast.success('PAN verification successful!');
      } else {
        toast.error(data.message || 'PAN verification failed');
      }

      return data;
    } catch (error) {
      console.error('Error verifying PAN:', error);
      const message = error instanceof Error ? error.message : 'PAN verification failed';
      toast.error(message);
      throw new Error(message);
    }
  }

  /**
   * Perform face verification with computer vision
   */
  async verifyFace(request: FaceVerificationRequest): Promise<VerificationResult> {
    try {
      const formData = new FormData();
      formData.append('faceImage', request.faceImage);
      formData.append('userId', request.userId);
      if (request.documentType) {
        formData.append('documentType', request.documentType);
      }
      formData.append('consent', String(request.consent ?? true));

      const response = await fetch(`${this.baseUrl}/api/kyc/face-verify`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Face verification failed');
      }

      if (data.verified) {
        toast.success('Face verification successful!');
      } else {
        toast.error(data.message || 'Face verification failed');
      }

      return data;
    } catch (error) {
      console.error('Error verifying face:', error);
      const message = error instanceof Error ? error.message : 'Face verification failed';
      toast.error(message);
      throw new Error(message);
    }
  }

  /**
   * Verify bank account details
   */
  async verifyBankAccount(request: BankVerificationRequest): Promise<VerificationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/kyc/bank-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Bank verification failed');
      }

      if (data.verified) {
        toast.success('Bank account verification successful!');
      } else {
        toast.error(data.message || 'Bank verification failed');
      }

      return data;
    } catch (error) {
      console.error('Error verifying bank account:', error);
      const message = error instanceof Error ? error.message : 'Bank verification failed';
      toast.error(message);
      throw new Error(message);
    }
  }

  /**
   * Upload KYC document
   */
  async uploadDocument(
    userId: string,
    documentType: string,
    file: File
  ): Promise<{
    success: boolean;
    documentUrl: string;
    documentId: string;
  }> {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('userId', userId);
      formData.append('documentType', documentType);

      const response = await fetch(`${this.baseUrl}/api/kyc/upload-document`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Document upload failed');
      }

      toast.success('Document uploaded successfully!');
      return data;
    } catch (error) {
      console.error('Error uploading document:', error);
      const message = error instanceof Error ? error.message : 'Document upload failed';
      toast.error(message);
      throw new Error(message);
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
      const response = await fetch(`${this.baseUrl}/api/kyc/submit-kyc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'KYC submission failed');
      }

      toast.success('KYC application submitted successfully!');
      return data;
    } catch (error) {
      console.error('Error submitting KYC application:', error);
      const message = error instanceof Error ? error.message : 'KYC submission failed';
      toast.error(message);
      throw new Error(message);
    }
  }

  /**
   * Get KYC status for a user
   */
  async getKYCStatus(userId: string): Promise<KYCStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/api/kyc/status/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch KYC status');
      }

      return data;
    } catch (error) {
      console.error('Error fetching KYC status:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch KYC status');
    }
  }

  /**
   * Validate Aadhaar format (client-side)
   */
  validateAadhaarFormat(aadhaar: string): boolean {
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

  /**
   * Validate PAN format (client-side)
   */
  validatePANFormat(pan: string): boolean {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan.toUpperCase());
  }

  /**
   * Validate IFSC code format (client-side)
   */
  validateIFSCFormat(ifsc: string): boolean {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(ifsc.toUpperCase());
  }

  /**
   * Validate account number format (basic client-side validation)
   */
  validateAccountNumber(accountNumber: string): boolean {
    // Basic validation: 9-18 digits
    const accountRegex = /^\d{9,18}$/;
    return accountRegex.test(accountNumber);
  }

  /**
   * Get status display message
   */
  getStatusMessage(status: KYCStatus['status']): string {
    switch (status) {
      case 'not_started':
        return 'KYC verification not started. Please complete the verification process.';
      case 'in_progress':
        return 'KYC verification is in progress.';
      case 'pending_review':
        return 'Your KYC application is pending review. You will be notified within 24-48 hours.';
      case 'approved':
        return 'Your KYC has been approved successfully! You can now participate in auctions.';
      case 'rejected':
        return 'Your KYC application has been rejected. Please contact support for more details.';
      case 'expired':
        return 'Your KYC verification has expired. Please re-verify your documents.';
      default:
        return 'KYC status unknown.';
    }
  }

  /**
   * Get verification progress percentage
   */
  getVerificationProgress(verificationProgress: KYCStatus['verificationProgress']): number {
    const steps = ['aadhaar', 'pan', 'face', 'bank', 'documents'];
    const completedSteps = steps.filter(step => verificationProgress[step as keyof typeof verificationProgress]);
    return Math.round((completedSteps.length / steps.length) * 100);
  }
}

// Export singleton instance
export const kycService = new KYCService();
export default kycService;
