import { Controller, Post, Body, Req, UploadedFile, UseInterceptors, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { KYCService } from './kyc.service';

@ApiTags('kyc')
@Controller('kyc')
export class KYCController {
  constructor(private readonly kycService: KYCService) {}

  @Post('aadhaar-verify')
  @ApiOperation({ summary: 'Verify Aadhaar card with external KYC provider' })
  @ApiResponse({ status: 200, description: 'Aadhaar verification completed' })
  async verifyAadhaar(@Body() body: { aadhaarNumber: string; name: string; dob: string; consent?: boolean }) {
    try {
      const result = await this.kycService.verifyAadhaar({
        aadhaarNumber: body.aadhaarNumber,
        name: body.name,
        dob: body.dob,
        consent: body.consent ?? true,
      });

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Aadhaar verification failed',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('pan-verify')
  @ApiOperation({ summary: 'Verify PAN card with external KYC provider' })
  @ApiResponse({ status: 200, description: 'PAN verification completed' })
  async verifyPAN(@Body() body: { panNumber: string; name: string; dob?: string; consent?: boolean }) {
    try {
      const result = await this.kycService.verifyPAN({
        panNumber: body.panNumber,
        name: body.name,
        dob: body.dob,
        consent: body.consent ?? true,
      });

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'PAN verification failed',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('face-verify')
  @UseInterceptors(FileInterceptor('faceImage'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Face verification with computer vision' })
  @ApiResponse({ status: 200, description: 'Face verification completed' })
  async verifyFace(
    @UploadedFile() faceImage: Express.Multer.File,
    @Body() body: { userId: string; documentType?: string; consent?: boolean }
  ) {
    try {
      if (!faceImage) {
        throw new HttpException(
          {
            success: false,
            message: 'Face image is required',
          },
          HttpStatus.BAD_REQUEST
        );
      }

      const result = await this.kycService.verifyFace({
        userId: body.userId,
        faceImage: faceImage.buffer,
        documentType: body.documentType as 'aadhaar' | 'pan' | 'passport' || 'aadhaar',
        consent: typeof body.consent === 'string' ? body.consent === 'true' : (body.consent ?? true),
      });

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Face verification failed',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('bank-verify')
  @ApiOperation({ summary: 'Verify bank account details' })
  @ApiResponse({ status: 200, description: 'Bank verification completed' })
  async verifyBankAccount(@Body() body: { accountNumber: string; ifscCode: string; name: string; consent?: boolean }) {
    try {
      const result = await this.kycService.verifyBankAccount({
        accountNumber: body.accountNumber,
        ifscCode: body.ifscCode,
        name: body.name,
        consent: body.consent ?? true,
      });

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Bank verification failed',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('submit-kyc')
  @ApiOperation({ summary: 'Submit complete KYC application' })
  @ApiResponse({ status: 200, description: 'KYC application submitted' })
  async submitKYC(@Body() body: {
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
  }) {
    try {
      const result = await this.kycService.submitKYCApplication(body);
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'KYC submission failed',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('status/:userId')
  @ApiOperation({ summary: 'Check KYC status for a user' })
  @ApiResponse({ status: 200, description: 'KYC status retrieved' })
  async getKYCStatus(@Param('userId') userId: string) {
    try {
      const result = await this.kycService.getKYCStatus(userId);
      return {
        success: true,
        ...result,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Unable to check KYC status',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('upload-document')
  @UseInterceptors(FileInterceptor('document'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload KYC document' })
  @ApiResponse({ status: 200, description: 'Document uploaded successfully' })
  async uploadDocument(
    @UploadedFile() document: Express.Multer.File,
    @Body() body: { userId: string; documentType: string }
  ) {
    try {
      if (!document) {
        throw new HttpException(
          {
            success: false,
            message: 'Document file is required',
          },
          HttpStatus.BAD_REQUEST
        );
      }

      const result = await this.kycService.uploadDocument(
        body.userId,
        body.documentType,
        document.buffer,
        document.originalname
      );

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Document upload failed',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Legacy endpoint for backward compatibility
  @Post('check-status')
  @ApiOperation({ summary: 'Check KYC status (legacy endpoint)' })
  @ApiResponse({ status: 200, description: 'KYC status retrieved' })
  async checkKYCStatus(@Body() body: { userId: string }) {
    try {
      const result = await this.kycService.getKYCStatus(body.userId);
      return {
        success: true,
        status: result.status,
        message: this.getStatusMessage(result.status),
        lastUpdated: result.submittedAt || new Date(),
        verificationProgress: result.verificationProgress,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          success: false,
          message: 'Unable to check KYC status',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private getStatusMessage(status: string): string {
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
}
