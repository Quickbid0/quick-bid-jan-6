// src/notifications/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  priority?: 'low' | 'normal' | 'high';
}

interface WelcomeEmailData {
  email: string;
  name: string;
  verificationLink?: string;
}

interface PaymentEmailData {
  email: string;
  name: string;
  amount: number;
  orderId: string;
  paymentMethod: string;
  transactionId: string;
  status: 'success' | 'failed' | 'pending';
}

interface AuctionEmailData {
  email: string;
  name: string;
  auctionId: string;
  productName: string;
  bidAmount?: number;
  type: 'bid_placed' | 'bid_won' | 'auction_ending' | 'outbid' | 'auction_created';
  auctionEndTime?: string;
}

interface KYCSuccessEmailData {
  email: string;
  name: string;
}

interface DealerWelcomeEmailData {
  email: string;
  name: string;
  dealerId: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('SENDGRID_API_KEY');
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    }
  }

  /**
   * Send Welcome Email
   */
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    try {
      const subject = 'Welcome to QuickMela - India\'s Trusted Auction Platform!';
      const html = this.generateWelcomeEmailHTML(data);

      await this.sendEmail({
        to: data.email,
        subject,
        html,
        priority: 'high',
      });

      this.logger.log(`Welcome email sent successfully to ${data.email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${data.email}:`, error);
      return false;
    }
  }

  /**
   * Send Payment Confirmation Email
   */
  async sendPaymentConfirmationEmail(data: PaymentEmailData): Promise<boolean> {
    try {
      const subject = data.status === 'success'
        ? `Payment Successful - QuickMela Order ${data.orderId}`
        : `Payment Update - QuickMela Order ${data.orderId}`;

      const html = this.generatePaymentEmailHTML(data);

      await this.sendEmail({
        to: data.email,
        subject,
        html,
        priority: 'high',
      });

      this.logger.log(`Payment email sent to ${data.email} for order ${data.orderId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send payment email to ${data.email}:`, error);
      return false;
    }
  }

  /**
   * Send Auction Notification Email
   */
  async sendAuctionNotificationEmail(data: AuctionEmailData): Promise<boolean> {
    try {
      const subject = this.getAuctionEmailSubject(data.type, data.productName);
      const html = this.generateAuctionEmailHTML(data);

      await this.sendEmail({
        to: data.email,
        subject,
        html,
        priority: data.type === 'bid_won' ? 'high' : 'normal',
      });

      this.logger.log(`Auction email sent to ${data.email} for ${data.type}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send auction email to ${data.email}:`, error);
      return false;
    }
  }

  /**
   * Send KYC Success Email
   */
  async sendKYCSuccessEmail(data: KYCSuccessEmailData): Promise<boolean> {
    try {
      const subject = 'KYC Verification Successful - Start Bidding on QuickMela!';
      const html = this.generateKYCSuccessEmailHTML(data);

      await this.sendEmail({
        to: data.email,
        subject,
        html,
        priority: 'high',
      });

      this.logger.log(`KYC success email sent to ${data.email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send KYC email to ${data.email}:`, error);
      return false;
    }
  }

  /**
   * Send Dealer Welcome Email
   */
  async sendDealerWelcomeEmail(data: DealerWelcomeEmailData): Promise<boolean> {
    try {
      const subject = 'Welcome to QuickMela Dealer Network!';
      const html = this.generateDealerWelcomeEmailHTML(data);

      await this.sendEmail({
        to: data.email,
        subject,
        html,
        priority: 'high',
      });

      this.logger.log(`Dealer welcome email sent to ${data.email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send dealer email to ${data.email}:`, error);
      return false;
    }
  }

  /**
   * Send Password Reset Email
   */
  async sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean> {
    try {
      const subject = 'Reset Your QuickMela Password';
      const html = this.generatePasswordResetEmailHTML(resetLink);

      await this.sendEmail({
        to: email,
        subject,
        html,
        priority: 'high',
      });

      this.logger.log(`Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
      return false;
    }
  }

  /**
   * Send Inspection Report Email
   */
  async sendInspectionReportEmail(
    email: string,
    name: string,
    vehicleName: string,
    reportUrl: string
  ): Promise<boolean> {
    try {
      const subject = `Inspection Report Ready - ${vehicleName}`;
      const html = this.generateInspectionReportEmailHTML(name, vehicleName, reportUrl);

      await this.sendEmail({
        to: email,
        subject,
        html,
        priority: 'normal',
      });

      this.logger.log(`Inspection report email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send inspection email to ${email}:`, error);
      return false;
    }
  }

  /**
   * Send Weekly Newsletter
   */
  async sendWeeklyNewsletter(email: string, name: string, content: any): Promise<boolean> {
    try {
      const subject = 'Your Weekly QuickMela Auction Digest';
      const html = this.generateNewsletterEmailHTML(name, content);

      await this.sendEmail({
        to: email,
        subject,
        html,
        priority: 'normal',
      });

      this.logger.log(`Newsletter sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send newsletter to ${email}:`, error);
      return false;
    }
  }

  /**
   * Core email sending method
   */
  private async sendEmail(options: EmailOptions): Promise<void> {
    if (!sgMail) {
      this.logger.warn('SendGrid not configured, email not sent');
      return;
    }

    const fromEmail = options.from || this.configService.get('EMAIL_FROM') || 'noreply@quickmela.com';

    try {
      const msg = {
        to: options.to,
        from: {
          email: fromEmail,
          name: 'QuickMela Team',
        },
        subject: options.subject,
        html: options.html,
        text: options.text,
        // SendGrid specific settings
        mail_settings: {
          sandbox_mode: {
            enable: process.env.NODE_ENV === 'development',
          },
        },
        tracking_settings: {
          click_tracking: {
            enable: true,
          },
          open_tracking: {
            enable: true,
          },
        },
      };

      const result = await sgMail.send(msg);
      this.logger.debug(`Email sent successfully: ${result[0]?.headers?.['x-message-id']}`);
    } catch (error) {
      this.logger.error('SendGrid email error:', error);
      throw error;
    }
  }

  // Email template generators
  private generateWelcomeEmailHTML(data: WelcomeEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to QuickMela</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <div style="background-color: #2563eb; padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome to QuickMela!</h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">India's Trusted Auction Platform</p>
            </div>

            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin-bottom: 20px;">Hi ${data.name}!</h2>

              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
                Thank you for joining QuickMela! You're now part of India's most trusted digital auction platform
                for repossessed vehicles.
              </p>

              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #1f2937; margin-top: 0;">What you can do now:</h3>
                <ul style="color: #4b5563; line-height: 1.6;">
                  <li>Browse verified repossessed vehicles</li>
                  <li>Participate in live auctions</li>
                  <li>Complete secure KYC verification</li>
                  <li>Access escrow-protected transactions</li>
                </ul>
              </div>

              ${data.verificationLink ? `
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${data.verificationLink}"
                     style="background-color: #2563eb; color: #ffffff; padding: 12px 30px;
                            text-decoration: none; border-radius: 6px; display: inline-block;">
                    Verify Your Email
                  </a>
                </div>
              ` : ''}

              <p style="color: #4b5563; line-height: 1.6;">
                Questions? Contact our support team at <a href="mailto:support@quickmela.com">support@quickmela.com</a>
              </p>
            </div>

            <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                © 2024 QuickMela. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generatePaymentEmailHTML(data: PaymentEmailData): string {
    const statusColors = {
      success: '#10b981',
      failed: '#ef4444',
      pending: '#f59e0b',
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Payment ${data.status}</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <div style="background-color: ${statusColors[data.status]}; padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">
                Payment ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}
              </h1>
            </div>

            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937;">Hi ${data.name}!</h2>

              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1f2937;">Payment Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Order ID:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${data.orderId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Amount:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">₹${data.amount.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Payment Method:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${data.paymentMethod}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Transaction ID:</strong></td>
                    <td style="padding: 8px 0;">${data.transactionId}</td>
                  </tr>
                </table>
              </div>

              <p style="color: #4b5563; line-height: 1.6;">
                ${data.status === 'success'
                  ? 'Your payment has been processed successfully. You will receive a confirmation SMS shortly.'
                  : data.status === 'failed'
                  ? 'Unfortunately, your payment could not be processed. Please try again or contact support.'
                  : 'Your payment is being processed. We\'ll send you an update once it\'s confirmed.'}
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://app.quickmela.com/orders/${data.orderId}"
                   style="background-color: #2563eb; color: #ffffff; padding: 12px 30px;
                          text-decoration: none; border-radius: 6px; display: inline-block;">
                  View Order Details
                </a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getAuctionEmailSubject(type: string, productName: string): string {
    switch (type) {
      case 'bid_won': return `Congratulations! You Won ${productName}`;
      case 'bid_placed': return `Bid Placed Successfully - ${productName}`;
      case 'auction_ending': return `Auction Ending Soon - ${productName}`;
      case 'outbid': return `You've Been Outbid - ${productName}`;
      case 'auction_created': return `New Auction Started - ${productName}`;
      default: return `Auction Update - ${productName}`;
    }
  }

  private generateAuctionEmailHTML(data: AuctionEmailData): string {
    // Implementation for auction email templates
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Auction Notification</title>
        </head>
        <body>
          <h1>Auction: ${data.productName}</h1>
          <p>Type: ${data.type}</p>
          ${data.bidAmount ? `<p>Bid Amount: ₹${data.bidAmount.toLocaleString()}</p>` : ''}
          <p>Auction ID: ${data.auctionId}</p>
        </body>
      </html>
    `;
  }

  private generateKYCSuccessEmailHTML(data: KYCSuccessEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>KYC Approved</title>
        </head>
        <body>
          <h1>KYC Verification Successful!</h1>
          <p>Hi ${data.name},</p>
          <p>Your KYC verification has been approved. You can now participate in auctions!</p>
        </body>
      </html>
    `;
  }

  private generateDealerWelcomeEmailHTML(data: DealerWelcomeEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome Dealer</title>
        </head>
        <body>
          <h1>Welcome to QuickMela Dealer Network!</h1>
          <p>Hi ${data.name},</p>
          <p>Your dealer application has been approved. Dealer ID: ${data.dealerId}</p>
        </body>
      </html>
    `;
  }

  private generatePasswordResetEmailHTML(resetLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset</title>
        </head>
        <body>
          <h1>Reset Your Password</h1>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
        </body>
      </html>
    `;
  }

  private generateInspectionReportEmailHTML(name: string, vehicleName: string, reportUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Inspection Report</title>
        </head>
        <body>
          <h1>Inspection Report Ready</h1>
          <p>Hi ${name},</p>
          <p>Your inspection report for ${vehicleName} is ready.</p>
          <a href="${reportUrl}">View Report</a>
        </body>
      </html>
    `;
  }

  private generateNewsletterEmailHTML(name: string, content: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Weekly Newsletter</title>
        </head>
        <body>
          <h1>Weekly QuickMela Digest</h1>
          <p>Hi ${name},</p>
          <p>Here's what's happening this week...</p>
        </body>
      </html>
    `;
  }

  /**
   * Check if email service is available
   */
  isAvailable(): boolean {
    return !!sgMail && !!this.configService.get('SENDGRID_API_KEY');
  }

  /**
   * Get email service status
   */
  getStatus() {
    return {
      available: this.isAvailable(),
      provider: 'sendgrid',
      configured: !!this.configService.get('SENDGRID_API_KEY'),
    };
  }
}
