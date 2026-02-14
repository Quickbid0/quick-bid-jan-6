import { KYCService } from './kyc.service';
export declare class KYCController {
    private readonly kycService;
    constructor(kycService: KYCService);
    verifyAadhaar(body: {
        aadhaarNumber: string;
        name: string;
        dob: string;
        consent?: boolean;
    }): Promise<{
        success: boolean;
        verified: boolean;
        requestId: string;
        message: string;
        details?: any;
    }>;
    verifyPAN(body: {
        panNumber: string;
        name: string;
        dob?: string;
        consent?: boolean;
    }): Promise<{
        success: boolean;
        verified: boolean;
        requestId: string;
        message: string;
        details?: any;
    }>;
    verifyFace(faceImage: Express.Multer.File, body: {
        userId: string;
        documentType?: string;
        consent?: boolean;
    }): Promise<{
        success: boolean;
        verified: boolean;
        confidence: number;
        requestId: string;
        message: string;
        details?: any;
    }>;
    verifyBankAccount(body: {
        accountNumber: string;
        ifscCode: string;
        name: string;
        consent?: boolean;
    }): Promise<{
        success: boolean;
        verified: boolean;
        requestId: string;
        message: string;
        details?: any;
    }>;
    submitKYC(body: {
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
    }): Promise<{
        success: boolean;
        applicationId: string;
        status: string;
        message: string;
        estimatedProcessingTime: string;
    }>;
    getKYCStatus(userId: string): Promise<{
        userId: string;
        status: "not_started" | "in_progress" | "pending_review" | "approved" | "rejected" | "expired";
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
        success: boolean;
    }>;
    uploadDocument(document: Express.Multer.File, body: {
        userId: string;
        documentType: string;
    }): Promise<{
        success: boolean;
        documentUrl: string;
        documentId: string;
    }>;
    checkKYCStatus(body: {
        userId: string;
    }): Promise<{
        success: boolean;
        status: "approved" | "not_started" | "in_progress" | "pending_review" | "rejected" | "expired";
        message: string;
        lastUpdated: Date;
        verificationProgress: {
            aadhaar: boolean;
            pan: boolean;
            face: boolean;
            bank?: boolean;
            documents: boolean;
        };
    }>;
    private getStatusMessage;
}
