// src/notifications/notifications.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Logger,
  UseGuards
} from '@nestjs/common';
import { SMSService } from './sms.service';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(
    private readonly smsService: SMSService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Send OTP via SMS
   */
  @Post('otp/sms')
  async sendOTPSMS(@Body() body: any) {
    try {
      const { phone, purpose = 'verification', expiryMinutes = 10 } = body;

      if (!phone) {
        throw new HttpException('Phone number is required', HttpStatus.BAD_REQUEST);
      }

      // Generate OTP (in production, use a proper OTP service)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      const success = await this.smsService.sendOTP({
        phone,
        otp,
        purpose,
        expiryMinutes,
      });

      if (success) {
        return {
          success: true,
          message: 'OTP sent successfully',
          // In production, don't return the OTP - just confirm it was sent
          otp: process.env.NODE_ENV === 'development' ? otp : undefined,
        };
      } else {
        throw new HttpException('Failed to send OTP', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      this.logger.error('OTP SMS error:', error);
      throw new HttpException(
        error.message || 'Failed to send OTP',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Send Welcome Email
   */
  @Post('email/welcome')
  async sendWelcomeEmail(@Body() body: any) {
    try {
      const { email, name, verificationLink } = body;

      if (!email || !name) {
        throw new HttpException('Email and name are required', HttpStatus.BAD_REQUEST);
      }

      const success = await this.emailService.sendWelcomeEmail({
        email,
        name,
        verificationLink,
      });

      if (success) {
        return {
          success: true,
          message: 'Welcome email sent successfully',
        };
      } else {
        throw new HttpException('Failed to send welcome email', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      this.logger.error('Welcome email error:', error);
      throw new HttpException(
        error.message || 'Failed to send welcome email',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Send Payment Confirmation
   */
  @Post('payment/confirmation')
  async sendPaymentConfirmation(@Body() body: any) {
    try {
      const {
        email,
        phone,
        name,
        amount,
        orderId,
        paymentMethod,
        transactionId,
        status,
      } = body;

      if (!email || !phone || !amount || !orderId) {
        throw new HttpException('Missing required payment details', HttpStatus.BAD_REQUEST);
      }

      // Send SMS
      await this.smsService.sendPaymentConfirmation({
        phone,
        amount,
        orderId,
        status: status || 'success',
        paymentMethod: paymentMethod || 'card',
      });

      // Send Email
      await this.emailService.sendPaymentConfirmationEmail({
        email,
        name: name || 'User',
        amount,
        orderId,
        paymentMethod: paymentMethod || 'card',
        transactionId: transactionId || 'N/A',
        status: status || 'success',
      });

      return {
        success: true,
        message: 'Payment confirmations sent successfully',
      };
    } catch (error) {
      this.logger.error('Payment confirmation error:', error);
      throw new HttpException(
        error.message || 'Failed to send payment confirmations',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Send Auction Notification
   */
  @Post('auction/notification')
  async sendAuctionNotification(@Body() body: any) {
    try {
      const {
        email,
        phone,
        name,
        auctionId,
        productName,
        bidAmount,
        type,
        auctionEndTime,
      } = body;

      if (!email || !phone || !auctionId || !productName || !type) {
        throw new HttpException('Missing required auction details', HttpStatus.BAD_REQUEST);
      }

      // Send SMS
      await this.smsService.sendAuctionNotification({
        phone,
        auctionId,
        productName,
        bidAmount,
        type,
      });

      // Send Email
      await this.emailService.sendAuctionNotificationEmail({
        email,
        name: name || 'User',
        auctionId,
        productName,
        bidAmount,
        type,
        auctionEndTime,
      });

      return {
        success: true,
        message: 'Auction notifications sent successfully',
      };
    } catch (error) {
      this.logger.error('Auction notification error:', error);
      throw new HttpException(
        error.message || 'Failed to send auction notifications',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Send KYC Success Notification
   */
  @Post('kyc/success')
  async sendKYCSuccess(@Body() body: any) {
    try {
      const { email, phone, name, status } = body;

      if (!email || !phone || !name) {
        throw new HttpException('Missing required KYC details', HttpStatus.BAD_REQUEST);
      }

      // Send SMS
      await this.smsService.sendKYCUpdate(phone, status || 'approved');

      // Send Email
      await this.emailService.sendKYCSuccessEmail({
        email,
        name,
      });

      return {
        success: true,
        message: 'KYC notifications sent successfully',
      };
    } catch (error) {
      this.logger.error('KYC notification error:', error);
      throw new HttpException(
        error.message || 'Failed to send KYC notifications',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Send Dealer Welcome Notification
   */
  @Post('dealer/welcome')
  async sendDealerWelcome(@Body() body: any) {
    try {
      const { email, phone, name, dealerId, status } = body;

      if (!email || !phone || !name || !dealerId) {
        throw new HttpException('Missing required dealer details', HttpStatus.BAD_REQUEST);
      }

      // Send SMS
      await this.smsService.sendDealerNotification(phone, status || 'approved');

      // Send Email
      await this.emailService.sendDealerWelcomeEmail({
        email,
        name,
        dealerId,
      });

      return {
        success: true,
        message: 'Dealer notifications sent successfully',
      };
    } catch (error) {
      this.logger.error('Dealer notification error:', error);
      throw new HttpException(
        error.message || 'Failed to send dealer notifications',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Send Password Reset Email
   */
  @Post('password/reset')
  async sendPasswordReset(@Body() body: any) {
    try {
      const { email, resetLink } = body;

      if (!email || !resetLink) {
        throw new HttpException('Email and reset link are required', HttpStatus.BAD_REQUEST);
      }

      const success = await this.emailService.sendPasswordResetEmail(email, resetLink);

      if (success) {
        return {
          success: true,
          message: 'Password reset email sent successfully',
        };
      } else {
        throw new HttpException('Failed to send password reset email', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      this.logger.error('Password reset email error:', error);
      throw new HttpException(
        error.message || 'Failed to send password reset email',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Send Inspection Report
   */
  @Post('inspection/report')
  async sendInspectionReport(@Body() body: any) {
    try {
      const { email, phone, name, vehicleName, reportUrl, status } = body;

      if (!email || !phone || !name || !vehicleName || !reportUrl) {
        throw new HttpException('Missing required inspection details', HttpStatus.BAD_REQUEST);
      }

      // Send SMS
      await this.smsService.sendInspectionReport(phone, vehicleName, status || 'completed');

      // Send Email
      await this.emailService.sendInspectionReportEmail(email, name, vehicleName, reportUrl);

      return {
        success: true,
        message: 'Inspection report notifications sent successfully',
      };
    } catch (error) {
      this.logger.error('Inspection report notification error:', error);
      throw new HttpException(
        error.message || 'Failed to send inspection notifications',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get Notification Service Status
   */
  @Post('status')
  async getNotificationStatus() {
    try {
      const smsStatus = this.smsService.getStatus();
      const emailStatus = this.emailService.getStatus();

      return {
        success: true,
        services: {
          sms: smsStatus,
          email: emailStatus,
        },
        overall: {
          available: smsStatus.available || emailStatus.available,
          configured: smsStatus.configured && emailStatus.configured,
        },
      };
    } catch (error) {
      this.logger.error('Notification status error:', error);
      throw new HttpException(
        'Failed to get notification status',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
