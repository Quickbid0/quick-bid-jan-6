// src/notifications/sms.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';

interface SMSOptions {
  to: string;
  message: string;
  priority?: 'low' | 'normal' | 'high';
}

interface OTPData {
  phone: string;
  otp: string;
  purpose: 'registration' | 'login' | 'payment' | 'verification' | 'reset_password';
  expiryMinutes?: number;
}

interface PaymentSMSData {
  phone: string;
  amount: number;
  orderId: string;
  status: 'success' | 'failed' | 'pending';
  paymentMethod: string;
}

interface AuctionSMSData {
  phone: string;
  auctionId: string;
  productName: string;
  bidAmount?: number;
  type: 'bid_placed' | 'bid_won' | 'auction_ending' | 'outbid';
}

@Injectable()
export class SMSService {
  private readonly logger = new Logger(SMSService.name);
  private twilioClient: twilio.Twilio;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get('TWILIO_AUTH_TOKEN');

    if (accountSid && authToken) {
      this.twilioClient = twilio(accountSid, authToken);
    }
  }

  /**
   * Send OTP SMS
   */
  async sendOTP(otpData: OTPData): Promise<boolean> {
    try {
      const message = this.generateOTPMessage(otpData);

      await this.sendSMS({
        to: otpData.phone,
        message,
        priority: 'high',
      });

      this.logger.log(`OTP sent successfully to ${this.maskPhoneNumber(otpData.phone)} for ${otpData.purpose}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send OTP to ${this.maskPhoneNumber(otpData.phone)}:`, error);
      return false;
    }
  }

  /**
   * Send Payment Confirmation SMS
   */
  async sendPaymentConfirmation(paymentData: PaymentSMSData): Promise<boolean> {
    try {
      const message = this.generatePaymentMessage(paymentData);

      await this.sendSMS({
        to: paymentData.phone,
        message,
        priority: 'high',
      });

      this.logger.log(`Payment SMS sent to ${this.maskPhoneNumber(paymentData.phone)} for order ${paymentData.orderId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send payment SMS to ${this.maskPhoneNumber(paymentData.phone)}:`, error);
      return false;
    }
  }

  /**
   * Send Auction Notification SMS
   */
  async sendAuctionNotification(auctionData: AuctionSMSData): Promise<boolean> {
    try {
      const message = this.generateAuctionMessage(auctionData);

      await this.sendSMS({
        to: auctionData.phone,
        message,
        priority: auctionData.type === 'bid_won' ? 'high' : 'normal',
      });

      this.logger.log(`Auction SMS sent to ${this.maskPhoneNumber(auctionData.phone)} for ${auctionData.type}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send auction SMS to ${this.maskPhoneNumber(auctionData.phone)}:`, error);
      return false;
    }
  }

  /**
   * Send KYC Verification SMS
   */
  async sendKYCUpdate(phone: string, status: 'approved' | 'rejected' | 'pending'): Promise<boolean> {
    try {
      const message = this.generateKYCMessage(status);

      await this.sendSMS({
        to: phone,
        message,
        priority: status === 'approved' ? 'high' : 'normal',
      });

      this.logger.log(`KYC SMS sent to ${this.maskPhoneNumber(phone)} with status ${status}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send KYC SMS to ${this.maskPhoneNumber(phone)}:`, error);
      return false;
    }
  }

  /**
   * Send Dealer Onboarding SMS
   */
  async sendDealerNotification(phone: string, status: 'approved' | 'rejected' | 'application_received'): Promise<boolean> {
    try {
      const message = this.generateDealerMessage(status);

      await this.sendSMS({
        to: phone,
        message,
        priority: status === 'approved' ? 'high' : 'normal',
      });

      this.logger.log(`Dealer SMS sent to ${this.maskPhoneNumber(phone)} with status ${status}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send dealer SMS to ${this.maskPhoneNumber(phone)}:`, error);
      return false;
    }
  }

  /**
   * Send Inspection Report SMS
   */
  async sendInspectionReport(phone: string, vehicleName: string, status: 'completed' | 'failed'): Promise<boolean> {
    try {
      const message = this.generateInspectionMessage(vehicleName, status);

      await this.sendSMS({
        to: phone,
        message,
        priority: 'normal',
      });

      this.logger.log(`Inspection SMS sent to ${this.maskPhoneNumber(phone)} for ${vehicleName}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send inspection SMS to ${this.maskPhoneNumber(phone)}:`, error);
      return false;
    }
  }

  /**
   * Core SMS sending method
   */
  private async sendSMS(options: SMSOptions): Promise<void> {
    if (!this.twilioClient) {
      this.logger.warn('Twilio client not configured, SMS not sent');
      return;
    }

    const fromNumber = this.configService.get('TWILIO_PHONE_NUMBER');

    try {
      const message = await this.twilioClient.messages.create({
        body: options.message,
        from: fromNumber,
        to: options.to,
        // Add priority handling if needed
      });

      this.logger.debug(`SMS sent successfully: ${message.sid}`);
    } catch (error) {
      this.logger.error('Twilio SMS error:', error);
      throw error;
    }
  }

  /**
   * Generate OTP message
   */
  private generateOTPMessage(data: OTPData): string {
    const expiry = data.expiryMinutes || 10;

    switch (data.purpose) {
      case 'registration':
        return `QuickMela: Welcome! Your verification code is ${data.otp}. Valid for ${expiry} minutes. Do not share this code.`;
      case 'login':
        return `QuickMela: Your login OTP is ${data.otp}. Valid for ${expiry} minutes.`;
      case 'payment':
        return `QuickMela: Your payment verification code is ${data.otp}. Valid for ${expiry} minutes.`;
      case 'verification':
        return `QuickMela: Your verification code is ${data.otp}. Valid for ${expiry} minutes.`;
      case 'reset_password':
        return `QuickMela: Your password reset code is ${data.otp}. Valid for ${expiry} minutes.`;
      default:
        return `QuickMela: Your code is ${data.otp}. Valid for ${expiry} minutes.`;
    }
  }

  /**
   * Generate payment confirmation message
   */
  private generatePaymentMessage(data: PaymentSMSData): string {
    const amount = `₹${data.amount.toLocaleString()}`;

    switch (data.status) {
      case 'success':
        return `QuickMela: Payment successful! ${amount} paid for Order ${data.orderId} via ${data.paymentMethod}. Thank you for using QuickMela!`;
      case 'failed':
        return `QuickMela: Payment failed for Order ${data.orderId}. Please try again or contact support.`;
      case 'pending':
        return `QuickMela: Payment of ${amount} for Order ${data.orderId} is being processed. We'll notify you once confirmed.`;
      default:
        return `QuickMela: Payment status update for Order ${data.orderId}.`;
    }
  }

  /**
   * Generate auction notification message
   */
  private generateAuctionMessage(data: AuctionSMSData): string {
    switch (data.type) {
      case 'bid_placed':
        return `QuickMela: Bid placed! ₹${data.bidAmount?.toLocaleString()} for ${data.productName} (Auction ${data.auctionId}). Good luck!`;
      case 'bid_won':
        return `QuickMela: Congratulations! You won ${data.productName} (Auction ${data.auctionId}) for ₹${data.bidAmount?.toLocaleString()}. Complete payment to claim your vehicle!`;
      case 'auction_ending':
        return `QuickMela: Auction ending soon! ${data.productName} (Auction ${data.auctionId}) closes in 10 minutes. Place your final bid now!`;
      case 'outbid':
        return `QuickMela: You've been outbid on ${data.productName} (Auction ${data.auctionId}). Current highest bid: ₹${data.bidAmount?.toLocaleString()}. Bid again to stay in the lead!`;
      default:
        return `QuickMela: Auction update for ${data.productName} (Auction ${data.auctionId}).`;
    }
  }

  /**
   * Generate KYC status message
   */
  private generateKYCMessage(status: string): string {
    switch (status) {
      case 'approved':
        return `QuickMela: Congratulations! Your KYC verification is approved. You can now participate in auctions and make payments.`;
      case 'rejected':
        return `QuickMela: KYC verification failed. Please check your submitted documents and try again, or contact support for assistance.`;
      case 'pending':
        return `QuickMela: Your KYC documents are being reviewed. We'll notify you once verification is complete (usually within 24 hours).`;
      default:
        return `QuickMela: KYC status update. Please check your dashboard for details.`;
    }
  }

  /**
   * Generate dealer onboarding message
   */
  private generateDealerMessage(status: string): string {
    switch (status) {
      case 'approved':
        return `QuickMela: Welcome to our dealer network! Your application is approved. Start listing vehicles and earning commissions today!`;
      case 'rejected':
        return `QuickMela: Dealer application status: Not approved. Please review our requirements and apply again, or contact support.`;
      case 'application_received':
        return `QuickMela: Thanks for applying to be a dealer! Your application is received and under review. We'll notify you within 48 hours.`;
      default:
        return `QuickMela: Dealer application update. Please check your dashboard for status.`;
    }
  }

  /**
   * Generate inspection report message
   */
  private generateInspectionMessage(vehicleName: string, status: string): string {
    switch (status) {
      case 'completed':
        return `QuickMela: Inspection completed for ${vehicleName}. View detailed report in your dashboard. Authenticity verified!`;
      case 'failed':
        return `QuickMela: Inspection could not be completed for ${vehicleName}. Please contact support or try again.`;
      default:
        return `QuickMela: Inspection update for ${vehicleName}. Check your dashboard for details.`;
    }
  }

  /**
   * Mask phone number for logging
   */
  private maskPhoneNumber(phone: string): string {
    if (phone.length <= 4) return phone;
    return phone.substring(0, 2) + '*'.repeat(phone.length - 4) + phone.substring(phone.length - 2);
  }

  /**
   * Check if SMS service is available
   */
  isAvailable(): boolean {
    return !!this.twilioClient;
  }

  /**
   * Get SMS service status
   */
  getStatus() {
    return {
      available: this.isAvailable(),
      provider: 'twilio',
      configured: !!this.configService.get('TWILIO_ACCOUNT_SID'),
    };
  }
}
