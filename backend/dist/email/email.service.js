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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
let EmailService = class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER || 'quickbid.test@gmail.com',
                pass: process.env.SMTP_PASS || 'your-app-password',
            },
        });
    }
    async sendVerificationEmail(email, verificationToken) {
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3021'}/verify-email?token=${verificationToken}`;
        const mailOptions = {
            from: process.env.SMTP_FROM || 'QuickBid <quickbid.test@gmail.com>',
            to: email,
            subject: 'Verify your QuickBid account',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to QuickBid!</h2>
          <p>Thank you for registering with QuickBid. Please verify your email address to complete your registration.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 16px;">Your verification code is:</p>
            <div style="background: #007bff; color: white; font-size: 24px; font-weight: bold; 
                        padding: 15px; text-align: center; border-radius: 6px; margin: 10px 0;">
              ${verificationToken}
            </div>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
              Or click the link below to verify automatically:
            </p>
            <a href="${verificationUrl}" 
               style="display: inline-block; background: #28a745; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; margin-top: 10px;">
              Verify Email
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If you didn't create an account with QuickBid, you can safely ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2026 QuickBid. All rights reserved.
          </p>
        </div>
      `,
        };
        try {
            await this.transporter.sendMail(mailOptions);
        }
        catch (error) {
            throw new Error('Failed to send verification email');
        }
    }
    async sendOTPEmail(email, otp) {
        const mailOptions = {
            from: process.env.SMTP_FROM || 'QuickBid <quickbid.test@gmail.com>',
            to: email,
            subject: 'QuickBid - Your OTP Code',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">QuickBid OTP Verification</h2>
          <p>Use the OTP code below to complete your verification:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <div style="background: #007bff; color: white; font-size: 32px; font-weight: bold; 
                        padding: 20px; border-radius: 6px; letter-spacing: 4px;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This OTP will expire in 10 minutes. For security reasons, do not share this code with anyone.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2026 QuickBid. All rights reserved.
          </p>
        </div>
      `,
        };
        try {
            await this.transporter.sendMail(mailOptions);
        }
        catch (error) {
            throw new Error('Failed to send OTP email');
        }
    }
    async sendPasswordResetEmail(email, resetToken) {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3021'}/reset-password?token=${resetToken}`;
        const mailOptions = {
            from: process.env.SMTP_FROM || 'QuickBid <quickbid.test@gmail.com>',
            to: email,
            subject: 'QuickBid - Reset Your Password',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Reset Your Password</h2>
          <p>You requested to reset your password. Click the link below to reset it:</p>
          
          <a href="${resetUrl}" 
             style="display: inline-block; background: #dc3545; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Reset Password
          </a>
          
          <p style="color: #666; font-size: 14px;">
            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2026 QuickBid. All rights reserved.
          </p>
        </div>
      `,
        };
        try {
            await this.transporter.sendMail(mailOptions);
        }
        catch (error) {
            throw new Error('Failed to send password reset email');
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map