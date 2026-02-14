import { ConfigService } from '@nestjs/config';
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
export declare class KYCService {
    private configService;
    private readonly logger;
    private readonly kycProviderUrl;
    private readonly apiKey;
    private readonly apiSecret;
    constructor(configService: ConfigService);
    verifyAadhaar(request: AadhaarVerificationRequest): Promise<{
        success: boolean;
        verified: boolean;
        requestId: string;
        message: string;
        details?: any;
    }>;
    verifyPAN(request: PANVerificationRequest): Promise<{
        success: boolean;
        verified: boolean;
        requestId: string;
        message: string;
        details?: any;
    }>;
    verifyFace(request: FaceVerificationRequest): Promise<{
        success: boolean;
        verified: boolean;
        confidence: number;
        requestId: string;
        message: string;
        details?: any;
    }>;
    verifyBankAccount(request: BankAccountVerificationRequest): Promise<{
        success: boolean;
        verified: boolean;
        requestId: string;
        message: string;
        details?: any;
    }>;
    submitKYCApplication(request: KYCSubmissionRequest): Promise<{
        success: boolean;
        applicationId: string;
        status: string;
        message: string;
        estimatedProcessingTime: string;
    }>;
    getKYCStatus(userId: string): Promise<KYCStatusResponse>;
    uploadDocument(userId: string, documentType: string, file: Buffer, filename: string): Promise<{
        success: boolean;
        documentUrl: string;
        documentId: string;
    }>;
    private validateAadhaarFormat;
    private validatePANFormat;
    private callKYCProvider;
    private callFaceRecognitionAPI;
    private callBankVerificationAPI;
    private saveTempImage;
    private deleteTempImage;
    private uploadToCloudStorage;
    private triggerKYCProcessing;
}
export {};
