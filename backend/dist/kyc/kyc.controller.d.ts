import { KYCService } from './kyc.service';
export declare class KYCController {
    private readonly kycService;
    constructor(kycService: KYCService);
    verifyAadhaar(body: {
        aadhaarNumber: string;
        name: string;
        dob: string;
        consent?: boolean;
    }): Promise<any>;
    verifyPAN(body: {
        panNumber: string;
        name: string;
        dob?: string;
        consent?: boolean;
    }): Promise<any>;
    verifyFace(faceImage: Express.Multer.File, body: {
        userId: string;
        documentType?: string;
        consent?: boolean;
    }): Promise<any>;
    verifyBankAccount(body: {
        accountNumber: string;
        ifscCode: string;
        name: string;
        consent?: boolean;
    }): Promise<any>;
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
    }): Promise<any>;
    getKYCStatus(userId: string): Promise<any>;
    uploadDocument(document: Express.Multer.File, body: {
        userId: string;
        documentType: string;
    }): Promise<any>;
    checkKYCStatus(body: {
        userId: string;
    }): Promise<{
        success: boolean;
        status: any;
        message: string;
        lastUpdated: any;
        verificationProgress: any;
    }>;
    private getStatusMessage;
}
