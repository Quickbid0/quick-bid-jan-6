"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KYCController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const kyc_service_1 = require("./kyc.service");
let KYCController = class KYCController {
    constructor(kycService) {
        this.kycService = kycService;
    }
    async verifyAadhaar(body) {
        try {
            const result = await this.kycService.verifyAadhaar({
                aadhaarNumber: body.aadhaarNumber,
                name: body.name,
                dob: body.dob,
                consent: body.consent ?? true,
            });
            return result;
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Aadhaar verification failed',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async verifyPAN(body) {
        try {
            const result = await this.kycService.verifyPAN({
                panNumber: body.panNumber,
                name: body.name,
                dob: body.dob,
                consent: body.consent ?? true,
            });
            return result;
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'PAN verification failed',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async verifyFace(faceImage, body) {
        try {
            if (!faceImage) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Face image is required',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.kycService.verifyFace({
                userId: body.userId,
                faceImage: faceImage.buffer,
                documentType: body.documentType || 'aadhaar',
                consent: typeof body.consent === 'string' ? body.consent === 'true' : (body.consent ?? true),
            });
            return result;
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Face verification failed',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async verifyBankAccount(body) {
        try {
            const result = await this.kycService.verifyBankAccount({
                accountNumber: body.accountNumber,
                ifscCode: body.ifscCode,
                name: body.name,
                consent: body.consent ?? true,
            });
            return result;
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Bank verification failed',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async submitKYC(body) {
        try {
            const result = await this.kycService.submitKYCApplication(body);
            return result;
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'KYC submission failed',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getKYCStatus(userId) {
        try {
            const result = await this.kycService.getKYCStatus(userId);
            return {
                success: true,
                ...result,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Unable to check KYC status',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async uploadDocument(document, body) {
        try {
            if (!document) {
                throw new common_1.HttpException({
                    success: false,
                    message: 'Document file is required',
                }, common_1.HttpStatus.BAD_REQUEST);
            }
            const result = await this.kycService.uploadDocument(body.userId, body.documentType, document.buffer, document.originalname);
            return result;
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: error.message || 'Document upload failed',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async checkKYCStatus(body) {
        try {
            const result = await this.kycService.getKYCStatus(body.userId);
            return {
                success: true,
                status: result.status,
                message: this.getStatusMessage(result.status),
                lastUpdated: result.submittedAt || new Date(),
                verificationProgress: result.verificationProgress,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException({
                success: false,
                message: 'Unable to check KYC status',
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    getStatusMessage(status) {
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
};
exports.KYCController = KYCController;
__decorate([
    (0, common_1.Post)('aadhaar-verify'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify Aadhaar card with external KYC provider' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Aadhaar verification completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KYCController.prototype, "verifyAadhaar", null);
__decorate([
    (0, common_1.Post)('pan-verify'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify PAN card with external KYC provider' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'PAN verification completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KYCController.prototype, "verifyPAN", null);
__decorate([
    (0, common_1.Post)('face-verify'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('faceImage')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Face verification with computer vision' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Face verification completed' }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], KYCController.prototype, "verifyFace", null);
__decorate([
    (0, common_1.Post)('bank-verify'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify bank account details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bank verification completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KYCController.prototype, "verifyBankAccount", null);
__decorate([
    (0, common_1.Post)('submit-kyc'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit complete KYC application' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KYC application submitted' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KYCController.prototype, "submitKYC", null);
__decorate([
    (0, common_1.Get)('status/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Check KYC status for a user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KYC status retrieved' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KYCController.prototype, "getKYCStatus", null);
__decorate([
    (0, common_1.Post)('upload-document'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('document')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload KYC document' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Document uploaded successfully' }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], KYCController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Post)('check-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Check KYC status (legacy endpoint)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'KYC status retrieved' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KYCController.prototype, "checkKYCStatus", null);
exports.KYCController = KYCController = __decorate([
    (0, swagger_1.ApiTags)('kyc'),
    (0, common_1.Controller)('kyc'),
    __metadata("design:paramtypes", [kyc_service_1.KYCService])
], KYCController);
//# sourceMappingURL=kyc.controller.js.map