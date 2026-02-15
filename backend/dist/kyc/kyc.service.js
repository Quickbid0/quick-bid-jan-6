"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var KycService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let KycService = KycService_1 = class KycService {
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(KycService_1.name);
        this.kycProviderUrl = 'https://api.signzy.com';
        this.apiKey = this.configService.get('SIGNZY_API_KEY') || 'demo_api_key';
        this.apiSecret = this.configService.get('SIGNZY_API_SECRET') || 'demo_api_secret';
        this.logger.log('KYC Service initialized with Prisma integration');
    }
    async submitKYCApplication(request) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: request.userId }
            });
            if (!user) {
                throw new common_1.BadRequestException('User not found');
            }
            const existingKyc = await this.prisma.kYC.findUnique({
                where: { userId: request.userId }
            });
            if (existingKyc && existingKyc.status === 'APPROVED') {
                throw new common_1.BadRequestException('KYC already approved for this user');
            }
            this.validateDocumentData(request);
            this.logger.log(`Submitting KYC application for user: ${request.userId}`);
            const extractedData = await this.simulateOCR(request);
            const faceMatchScore = await this.simulateFaceMatch(request);
            const kycRecord = await this.prisma.kYC.upsert({
                where: { userId: request.userId },
                update: {
                    documentType: request.documentType,
                    documentNumber: request.documentNumber,
                    documentFrontUrl: request.documentFrontUrl,
                    documentBackUrl: request.documentBackUrl,
                    selfieUrl: request.selfieUrl,
                    aadhaarNumber: request.aadhaarNumber,
                    panNumber: request.panNumber,
                    extractedData,
                    faceMatchScore,
                    status: 'PENDING'
                },
                create: {
                    userId: request.userId,
                    documentType: request.documentType,
                    documentNumber: request.documentNumber,
                    documentFrontUrl: request.documentFrontUrl,
                    documentBackUrl: request.documentBackUrl,
                    selfieUrl: request.selfieUrl,
                    aadhaarNumber: request.aadhaarNumber,
                    panNumber: request.panNumber,
                    extractedData,
                    faceMatchScore
                }
            });
            await this.prisma.auditLog.create({
                data: {
                    userId: request.userId,
                    action: 'CREATE',
                    resource: 'kyc',
                    resourceId: kycRecord.id,
                    metadata: {
                        documentType: request.documentType,
                        faceMatchScore
                    }
                }
            });
            return {
                success: true,
                applicationId: kycRecord.id,
                status: 'pending',
                message: 'KYC application submitted successfully. Processing typically takes 24-48 hours.',
                estimatedProcessingTime: '24-48 hours',
            };
        }
        catch (error) {
            this.logger.error(`KYC submission error: ${error.message}`, error.stack);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('KYC submission failed');
        }
    }
    async reviewKYC(kycId, adminId, decision, rejectionReason) {
        try {
            const admin = await this.prisma.user.findUnique({
                where: { id: adminId }
            });
            if (!admin || !['SUPER_ADMIN', 'ADMIN'].includes(admin.role)) {
                throw new common_1.BadRequestException('Unauthorized: Only admins can review KYC');
            }
            const kycRecord = await this.prisma.kYC.findUnique({
                where: { id: kycId },
                include: { user: true }
            });
            if (!kycRecord) {
                throw new common_1.BadRequestException('KYC record not found');
            }
            if (kycRecord.status !== 'PENDING' && kycRecord.status !== 'UNDER_REVIEW') {
                throw new common_1.BadRequestException('KYC is not in a reviewable state');
            }
            const newStatus = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
            const updatedKyc = await this.prisma.kYC.update({
                where: { id: kycId },
                data: {
                    status: newStatus,
                    verifiedAt: decision === 'APPROVE' ? new Date() : null,
                    verifiedBy: decision === 'APPROVE' ? adminId : null,
                    rejectionReason: decision === 'REJECT' ? rejectionReason : null
                }
            });
            await this.prisma.user.update({
                where: { id: kycRecord.userId },
                data: {
                    isVerified: decision === 'APPROVE',
                    kycStatus: newStatus
                }
            });
            await this.prisma.auditLog.create({
                data: {
                    userId: adminId,
                    action: 'UPDATE',
                    resource: 'kyc',
                    resourceId: kycId,
                    oldValues: { status: kycRecord.status },
                    newValues: {
                        status: newStatus,
                        verifiedAt: updatedKyc.verifiedAt,
                        verifiedBy: updatedKyc.verifiedBy,
                        rejectionReason: updatedKyc.rejectionReason
                    }
                }
            });
            this.logger.log(`KYC ${decision.toLowerCase()}d for user ${kycRecord.user.email} by admin ${admin.email}`);
            return {
                success: true,
                kycId: updatedKyc.id,
                status: newStatus,
                message: `KYC application ${decision.toLowerCase()}d successfully`
            };
        }
        catch (error) {
            this.logger.error(`KYC review error: ${error.message}`, error.stack);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('KYC review failed');
        }
    }
    async getKYCStatus(userId) {
        try {
            const kyc = await this.prisma.kYC.findUnique({
                where: { userId },
                include: { user: true }
            });
            if (!kyc) {
                return {
                    userId,
                    status: 'not_started',
                    verificationProgress: {
                        aadhaar: false,
                        pan: false,
                        face: false,
                        bank: false,
                        documents: false
                    }
                };
            }
            const statusMap = {
                'PENDING': 'pending_review',
                'UNDER_REVIEW': 'pending_review',
                'APPROVED': 'approved',
                'REJECTED': 'rejected'
            };
            const status = statusMap[kyc.status] || 'in_progress';
            const response = {
                userId,
                status,
                verificationProgress: {
                    aadhaar: !!(kyc.aadhaarNumber && kyc.extractedData),
                    pan: !!(kyc.panNumber && kyc.extractedData),
                    face: !!kyc.faceMatchScore,
                    bank: false,
                    documents: !!(kyc.documentFrontUrl && kyc.selfieUrl)
                },
                submittedAt: kyc.createdAt,
                reviewedAt: kyc.verifiedAt,
                approvedAt: kyc.status === 'APPROVED' ? kyc.verifiedAt : undefined,
                rejectionReason: kyc.rejectionReason || undefined
            };
            if (kyc.status === 'APPROVED') {
                response.expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
            }
            return response;
        }
        catch (error) {
            this.logger.error(`KYC status check error: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Unable to check KYC status');
        }
    }
    async getPendingKYCReviews() {
        try {
            const pendingKyc = await this.prisma.kYC.findMany({
                where: {
                    status: {
                        in: ['PENDING', 'UNDER_REVIEW']
                    }
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phoneNumber: true,
                            createdAt: true
                        }
                    }
                },
                orderBy: { createdAt: 'asc' }
            });
            return pendingKyc.map(kyc => ({
                id: kyc.id,
                user: kyc.user,
                documentType: kyc.documentType,
                documentNumber: kyc.documentNumber,
                extractedData: kyc.extractedData,
                faceMatchScore: kyc.faceMatchScore,
                submittedAt: kyc.createdAt,
                status: kyc.status
            }));
        }
        catch (error) {
            this.logger.error(`Get pending KYC reviews error: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Unable to fetch pending KYC reviews');
        }
    }
    async getKYCStats() {
        try {
            const stats = await this.prisma.kYC.groupBy({
                by: ['status'],
                _count: {
                    status: true
                }
            });
            const total = stats.reduce((sum, stat) => sum + stat._count.status, 0);
            return {
                total,
                pending: stats.find(s => s.status === 'PENDING')?._count.status || 0,
                underReview: stats.find(s => s.status === 'UNDER_REVIEW')?._count.status || 0,
                approved: stats.find(s => s.status === 'APPROVED')?._count.status || 0,
                rejected: stats.find(s => s.status === 'REJECTED')?._count.status || 0
            };
        }
        catch (error) {
            this.logger.error(`Get KYC stats error: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Unable to fetch KYC statistics');
        }
    }
    async verifyAadhaar(request) {
        try {
            if (!this.validateAadhaarFormat(request.aadhaarNumber)) {
                throw new common_1.BadRequestException('Invalid Aadhaar number format');
            }
            if (!request.consent) {
                throw new common_1.BadRequestException('User consent is required for Aadhaar verification');
            }
            this.logger.log(`Initiating Aadhaar verification for user: ${request.name}`);
            const verificationResult = await this.callKYCProvider('aadhaar', {
                id_number: request.aadhaarNumber,
                name: request.name,
                dob: request.dob,
            });
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
        }
        catch (error) {
            this.logger.error(`Aadhaar verification error: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Aadhaar verification service unavailable');
        }
    }
    async verifyPAN(request) {
        try {
            if (!this.validatePANFormat(request.panNumber)) {
                throw new common_1.BadRequestException('Invalid PAN number format');
            }
            if (!request.consent) {
                throw new common_1.BadRequestException('User consent is required for PAN verification');
            }
            this.logger.log(`Initiating PAN verification for user: ${request.name}`);
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
        }
        catch (error) {
            this.logger.error(`PAN verification error: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('PAN verification service unavailable');
        }
    }
    async verifyFace(request) {
        try {
            if (!request.consent) {
                throw new common_1.BadRequestException('User consent is required for face verification');
            }
            this.logger.log(`Initiating face verification for user: ${request.userId}`);
            const imagePath = await this.saveTempImage(request.faceImage, request.userId);
            try {
                const verificationResult = await this.callFaceRecognitionAPI(imagePath, request.documentType);
                const confidence = verificationResult.confidence || 0;
                const isVerified = confidence >= 0.8;
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
            }
            finally {
                await this.deleteTempImage(imagePath);
            }
        }
        catch (error) {
            this.logger.error(`Face verification error: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Face verification service unavailable');
        }
    }
    async verifyBankAccount(request) {
        try {
            if (!request.consent) {
                throw new common_1.BadRequestException('User consent is required for bank verification');
            }
            this.logger.log(`Initiating bank account verification for: ${request.name}`);
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
        }
        catch (error) {
            this.logger.error(`Bank verification error: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Bank verification service unavailable');
        }
    }
    async submitKYCApplication(request) {
        try {
            const requiredVerifications = [request.aadhaarVerified, request.panVerified, request.faceVerified];
            if (requiredVerifications.some(v => !v)) {
                throw new common_1.BadRequestException('All required verifications (Aadhaar, PAN, Face) must be completed');
            }
            const requiredDocuments = ['aadhaarFront', 'panCard', 'selfie'];
            const missingDocuments = requiredDocuments.filter(doc => !request.documents[doc]);
            if (missingDocuments.length > 0) {
                throw new common_1.BadRequestException(`Missing required documents: ${missingDocuments.join(', ')}`);
            }
            this.logger.log(`Submitting KYC application for user: ${request.userId}`);
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
            this.logger.log(`KYC application created: ${applicationId}`);
            await this.triggerKYCProcessing(kycApplication);
            return {
                success: true,
                applicationId,
                status: 'pending_review',
                message: 'KYC application submitted successfully. Processing typically takes 24-48 hours.',
                estimatedProcessingTime: '24-48 hours',
            };
        }
        catch (error) {
            this.logger.error(`KYC submission error: ${error.message}`, error.stack);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('KYC submission failed');
        }
    }
    async getKYCStatus(userId) {
        try {
            const hash = crypto.createHash('md5').update(userId).digest('hex');
            const statusIndex = parseInt(hash.slice(0, 2), 16) % 5;
            const statuses = [
                'approved',
                'pending_review',
                'in_progress',
                'not_started',
                'rejected',
            ];
            const status = statuses[statusIndex];
            const response = {
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
            if (status !== 'not_started') {
                response.submittedAt = new Date(Date.now() - 86400000);
            }
            if (status === 'approved') {
                response.approvedAt = new Date(Date.now() - 43200000);
                response.reviewedAt = response.approvedAt;
            }
            else if (status === 'rejected') {
                response.reviewedAt = new Date(Date.now() - 43200000);
                response.rejectionReason = 'Document quality insufficient. Please resubmit with clearer images.';
            }
            if (status === 'approved') {
                response.expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
            }
            return response;
        }
        catch (error) {
            this.logger.error(`KYC status check error: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Unable to check KYC status');
        }
    }
    async uploadDocument(userId, documentType, file, filename) {
        try {
            const extension = path.extname(filename);
            const documentId = `${documentType}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${extension}`;
            const documentUrl = await this.uploadToCloudStorage(file, documentId, userId);
            this.logger.log(`Document uploaded: ${documentType} for user ${userId}`);
            return {
                success: true,
                documentUrl,
                documentId,
            };
        }
        catch (error) {
            this.logger.error(`Document upload error: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Document upload failed');
        }
    }
    validateAadhaarFormat(aadhaar) {
        const aadhaarRegex = /^\d{12}$/;
        if (!aadhaarRegex.test(aadhaar))
            return false;
        const digits = aadhaar.split('').map(Number);
        let sum = 0;
        for (let i = 0; i < 11; i++) {
            sum += digits[i] * (12 - i);
        }
        const checkDigit = (11 - (sum % 11)) % 10;
        return checkDigit === digits[11];
    }
    validatePANFormat(pan) {
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        return panRegex.test(pan.toUpperCase());
    }
    async callKYCProvider(endpoint, data) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const shouldSucceed = Math.random() > 0.1;
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
    async callFaceRecognitionAPI(imagePath, documentType) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const confidence = 0.7 + Math.random() * 0.25;
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
    async callBankVerificationAPI(data) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const isValid = Math.random() > 0.05;
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
    async saveTempImage(imageBuffer, userId) {
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        const filename = `face_${userId}_${Date.now()}.jpg`;
        const filepath = path.join(tempDir, filename);
        await fs.promises.writeFile(filepath, imageBuffer);
        return filepath;
    }
    async deleteTempImage(filepath) {
        try {
            await fs.promises.unlink(filepath);
        }
        catch (error) {
            this.logger.warn(`Failed to delete temp image: ${filepath}`);
        }
    }
    async uploadToCloudStorage(file, filename, userId) {
        return `https://storage.quickmela.com/kyc/${userId}/${filename}`;
    }
    async triggerKYCProcessing(kycApplication) {
        this.logger.log(`KYC processing triggered for application: ${kycApplication.id}`);
        setTimeout(() => {
            this.logger.log(`KYC processing completed for application: ${kycApplication.id}`);
        }, 5000);
    }
};
exports.KycService = KycService;
exports.KycService = KycService = KycService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], KycService);
//# sourceMappingURL=kyc.service.js.map