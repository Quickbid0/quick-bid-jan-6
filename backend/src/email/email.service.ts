import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private sgMail: any = null;

  constructor(private configService: ConfigService) {
    this.initializeSendGrid();
  }

  private initializeSendGrid() {
    try {
      const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
      if (apiKey) {
        // Lazy load SendGrid when available
        const sgMailModule = require('@sendgrid/mail');
        this.sgMail = sgMailModule;
        this.sgMail.setApiKey(apiKey);
        this.logger.log('SendGrid initialized successfully');
      } else {
        this.logger.warn('SENDGRID_API_KEY not found - running in dev mode (emails will be logged only)');
      }
    } catch (error) {
      this.logger.warn('SendGrid not available - running in dev mode');
    }
  }

  async sendVerificationEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to QuickMela!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for registering. Please verify your email address to activate your account.</p>
        <p>
          <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
        </p>
        <p>Or copy this link: <a href="${verificationUrl}">${verificationUrl}</a></p>
        <p style="color: #999; font-size: 12px;">This link expires in 24 hours.</p>
      </div>
    `;

    await this.sendEmail(
      email,
      'Verify Your QuickMela Account',
      html,
    );
  }

  async sendPasswordResetEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Password Reset Request</h1>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the link below to proceed:</p>
        <p>
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
        <p style="color: #999; font-size: 12px;">This link expires in 1 hour.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this, ignore this email.</p>
      </div>
    `;

    await this.sendEmail(
      email,
      'QuickMela - Password Reset Request',
      html,
    );
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome, ${name}!</h1>
        <p>Your QuickMela account is now active and ready to use.</p>
        <h2>What's Next?</h2>
        <ul>
          <li>Browse live auctions</li>
          <li>Place bids on items you love</li>
          <li>Win amazing deals</li>
        </ul>
        <p>
          <a href="${frontendUrl}/auctions" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Explore Auctions
          </a>
        </p>
      </div>
    `;

    await this.sendEmail(
      email,
      'Welcome to QuickMela - Your Account is Ready!',
      html,
    );
  }

  async sendOrderConfirmation(
    email: string,
    name: string,
    orderId: string,
    amount: number,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Order Confirmed!</h1>
        <p>Hi ${name},</p>
        <p>Your order has been confirmed.</p>
        <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Amount:</strong> ₹${amount.toLocaleString('en-IN')}</p>
        </div>
        <p>You will receive tracking information soon.</p>
      </div>
    `;

    await this.sendEmail(
      email,
      'Order Confirmation - QuickMela',
      html,
    );
  }

  private async sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    try {
      if (!this.sgMail) {
        // Development mode - log email instead of sending
        this.logger.log(`[DEV MODE] Email to: ${to}`);
        this.logger.log(`[DEV MODE] Subject: ${subject}`);
        this.logger.log(`[DEV MODE] Body: ${html.substring(0, 100)}...`);
        return;
      }

      const msg = {
        to,
        from: this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@quickmela.com',
        subject,
        html,
      };

      await this.sgMail.send(msg);
      this.logger.log(`Email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`, error);
      // Don't throw - email failures shouldn't block other operations
      // In production, you might want to queue failed emails for retry
    }
  }
}
