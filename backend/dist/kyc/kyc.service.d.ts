import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
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
export declare class KycService {
    private configService;
    private prisma;
    private readonly logger;
    private readonly kycProviderUrl;
    private readonly apiKey;
    private readonly apiSecret;
    constructor(configService: ConfigService, prisma: PrismaService);
    reviewKYC(kycId: string, adminId: string, decision: 'APPROVE' | 'REJECT', rejectionReason?: string): Promise<{
        success: boolean;
        kycId: string;
        status: string;
        message: string;
    }>;
    getPendingKYCReviews(): Promise<any[]>;
    getKYCStats(): Promise<{
        total: number;
        pending: number;
        underReview: number;
        approved: number;
        rejected: number;
    }>;
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
