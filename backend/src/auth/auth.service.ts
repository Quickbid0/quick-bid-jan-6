import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ReferralService } from '../referral/referral.service';
import { EmailVerificationStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private users = new Map();
  private nextUserId = 1;
  private otpStore = new Map();
  private readonly logger = new Logger(AuthService.name);
  private refreshTokens = new Map<string, {userId: string, expiresAt: Date}>();
  private csrfTokens = new Map<string, string>();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
    private referralService: ReferralService,
  ) {
    // Validate JWT_SECRET at startup
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET missing');
    }
    // Ensure JWT secret is not logged
    this.initializeTestUsers();
  }

  private async initializeTestUsers() {
    // Create test users with QuickMela roles
    const users = [
      // Super Admin
      {
        email: 'superadmin@quickmela.com',
        name: 'QuickMela Super Admin',
        password: 'SuperAdmin123!',
        role: 'SUPER_ADMIN' as const,
        phoneNumber: '+919876543210',
        status: 'ACTIVE' as const,
        isVerified: true,
        emailVerified: true,
        phoneVerified: true,
        faceVerified: true,
        kycStatus: 'APPROVED' as const
      },
      // Admins
      {
        email: 'admin@quickmela.com',
        name: 'QuickMela Admin',
        password: 'AdminPass123!',
        role: 'ADMIN' as const,
        phoneNumber: '+919876543211',
        status: 'ACTIVE' as const,
        isVerified: true,
        emailVerified: true,
        phoneVerified: true,
        faceVerified: true,
        kycStatus: 'APPROVED' as const
      },
      // Sellers
      {
        email: 'seller.hyderabad@quickmela.com',
        name: 'Hyderabad Seller',
        password: 'SellerPass123!',
        role: 'SELLER' as const,
        phoneNumber: '+919876543212',
        status: 'ACTIVE' as const,
        isVerified: true,
        emailVerified: true,
        phoneVerified: true,
        faceVerified: true,
        kycStatus: 'APPROVED' as const
      },
      {
        email: 'seller.mumbai@quickmela.com',
        name: 'Mumbai Seller',
        password: 'SellerPass123!',
        role: 'SELLER' as const,
        phoneNumber: '+919876543213',
        status: 'ACTIVE' as const,
        isVerified: true,
        emailVerified: true,
        phoneVerified: true,
        faceVerified: true,
        kycStatus: 'APPROVED' as const
      },
      // Buyers
      {
        email: 'arjun@quickmela.com',
        name: 'Arjun Kumar',
        password: 'BuyerPass123!',
        role: 'BUYER' as const,
        phoneNumber: '+919876543214',
        status: 'ACTIVE' as const,
        isVerified: true,
        emailVerified: true,
        phoneVerified: true,
        faceVerified: true,
        kycStatus: 'APPROVED' as const
      },
      {
        email: 'kavya@quickmela.com',
        name: 'Kavya Reddy',
        password: 'BuyerPass123!',
        role: 'BUYER' as const,
        phoneNumber: '+919876543215',
        status: 'ACTIVE' as const,
        isVerified: true,
        emailVerified: true,
        phoneVerified: true,
        faceVerified: true,
        kycStatus: 'APPROVED' as const
      },
      {
        email: 'rahul@quickmela.com',
        name: 'Rahul Gupta',
        password: 'BuyerPass123!',
        role: 'BUYER' as const,
        phoneNumber: '+919876543216',
        status: 'ACTIVE' as const,
        isVerified: true,
        emailVerified: true,
        phoneVerified: true,
        faceVerified: true,
        kycStatus: 'APPROVED' as const
      },
      // Delivery Agents
      {
        email: 'agent.hyderabad@quickmela.com',
        name: 'Hyderabad Delivery Agent',
        password: 'AgentPass123!',
        role: 'DELIVERY_AGENT' as const,
        phoneNumber: '+919876543217',
        status: 'ACTIVE' as const,
        isVerified: true,
        emailVerified: true,
        phoneVerified: true,
        faceVerified: true,
        kycStatus: 'APPROVED' as const
      },
      // Telecallers
      {
        email: 'telecaller@quickmela.com',
        name: 'QuickMela Telecaller',
        password: 'TelePass123!',
        role: 'TELECALLER' as const,
        phoneNumber: '+919876543218',
        status: 'ACTIVE' as const,
        isVerified: true,
        emailVerified: true,
        phoneVerified: true,
        faceVerified: true,
        kycStatus: 'APPROVED' as const
      }
    ];

    // Create users in database (skip if already exist)
    for (const userData of users) {
      try {
        const existingUser = await this.prisma.user.findUnique({
          where: { email: userData.email }
        });

        if (!existingUser) {
          const hashedPassword = await this.hashPassword(userData.password);
          const user = await this.prisma.user.create({
            data: {
              email: userData.email,
              name: userData.name,
              passwordHash: hashedPassword, // Now properly hashed
              role: userData.role as any,
              status: userData.status,
              emailVerified: userData.emailVerified ? EmailVerificationStatus.VERIFIED : EmailVerificationStatus.UNVERIFIED,
              wallet: {
                create: {
                  balance: userData.role === 'SUPER_ADMIN' ? 1000000 : userData.role === 'ADMIN' ? 500000 : 10000
                }
              }
            }
          });
          this.logger.log(`Created test user: ${user.email} (${user.role})`);
        }
      } catch (error) {
        this.logger.error(`Failed to create user ${userData.email}:`, error);
      }
    }
  }

  async login(loginDto: any) {
    try {
      const { email, password } = loginDto;

      this.logger.log(`Login attempt for email: ${email}`);

      // Find user in database
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        this.logger.warn(`Failed login attempt: User not found for email ${email}`);
        throw new Error('Invalid credentials');
      }

      // Check if account is active
      if (!user.isActive || user.status !== 'ACTIVE') {
        this.logger.warn(`Login attempt blocked: Account not active for email ${email}`);
        throw new Error('Account is not active. Please contact support.');
      }

      // Verify password against stored hash
      const isPasswordValid = await this.verifyPassword(password, user.passwordHash);
      if (!isPasswordValid) {
        this.logger.warn(`Failed login attempt: Invalid password for email ${email}`);
        throw new Error('Invalid credentials');
      }

      // Generate tokens
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      if (!jwtSecret || jwtSecret.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters long');
      }

      this.logger.log(`Generating secure JWT tokens for user ${email}`);
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
      };

      const accessToken = this.jwtService.sign(payload, {
        expiresIn: '15m',
        algorithm: 'HS256'
      });

      const refreshToken = this.jwtService.sign(
        { sub: user.id, type: 'refresh' },
        {
          expiresIn: '7d',
          algorithm: 'HS256'
        }
      );

      this.logger.log(`JWT tokens generated successfully for user ${email}`);

      const crypto = require('crypto');
      const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      this.refreshTokens.set(hash, { userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });

      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: {}
      });

      this.logger.log(`Successful login for user ${email}`);

      return {
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        accessToken,
        refreshToken
      };
    } catch (error) {
      this.logger.error(`LOGIN ERROR for email ${loginDto?.email || 'unknown'}:`, error);
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async register(registerDto: any) {
    const { email, password, name, referralCode } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Generate referral code for new user
    const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const referralCodeForNewUser = this.referralService.generateReferralCode(newUserId);

    // Create new user - always assign 'BUYER' role for security
    const newUser = await this.prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
        role: 'BUYER', // Strict RBAC: new users are buyers only
        status: 'ACTIVE',
        referralCode: referralCodeForNewUser,
      },
    });

    // Process referral if referral code provided
    if (referralCode) {
      // await this.referralService.processReferralOnRegistration(
      //   newUser.id,
      //   referralCode,
      //   undefined, // ipAddress - would be from request
      //   undefined, // userAgent - would be from request
      // );
    }

    // Send welcome notification via WhatsApp if opted in
    // Note: WhatsApp opt-in would happen separately after registration

    this.logger.log(`New user registered: ${email} with referral code: ${referralCodeForNewUser}`);

    return {
      message: 'Registration successful',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        referralCode: newUser.referralCode,
      },
    };
  }

  async getProfile(req: any) {
    const user = req.user;
    if (!user) throw new Error('Not authenticated');
    const fullUser = this.users.get(user.email);
    return {
      id: fullUser.id,
      email: fullUser.email,
      name: fullUser.name,
      role: fullUser.role,
      walletBalance: fullUser.walletBalance,
      kycStatus: fullUser.kycStatus,
      profile: fullUser.profile,
      createdAt: fullUser.createdAt,
      lastLogin: fullUser.lastLogin
    };
  }

  async logout(refreshToken: string) {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    this.refreshTokens.delete(hash);
    this.logger.log('User logged out, refresh token invalidated');
    return { message: 'Logout successful' };
  }

  async refresh(token: string): Promise<any> {
    try {
      const crypto = require('crypto');
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      const stored = this.refreshTokens.get(hash);

      if (!stored) {
        // Check if JWT is valid to detect reuse
        try {
          const payload = this.jwtService.verify(token);
          this.logger.warn(`Refresh token reuse detected for user ${payload.sub}`);
          // Invalidate all refresh tokens for this user
          for (const [h, data] of this.refreshTokens.entries()) {
            if (data.userId === payload.sub) {
              this.refreshTokens.delete(h);
            }
          }
          throw new Error('Refresh token reuse detected');
        } catch (e) {
          throw new Error('Invalid refresh token');
        }
      }

      if (stored.expiresAt < new Date()) {
        this.refreshTokens.delete(hash);
        throw new Error('Expired refresh token');
      }

      // Find user to get email and role
      const user = Array.from(this.users.values()).find(u => u.id === stored.userId);
      if (!user) throw new Error('User not found');

      // Generate new tokens
      const newPayload = { sub: user.id, email: user.email, role: user.role };
      const newAccessToken = this.jwtService.sign(newPayload, { expiresIn: '15m' });
      const newRefreshToken = this.jwtService.sign({ sub: user.id }, { expiresIn: '7d' });

      // Update refresh token store
      this.refreshTokens.delete(hash);
      const newHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
      this.refreshTokens.set(newHash, { userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      this.logger.error(`Refresh token validation failed: ${error.message}`);
      throw new Error('Invalid refresh token');
    }
  }

  async getAllUsers() {
    const users = Array.from(this.users.values()).map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified,
      walletBalance: user.walletBalance,
      kycStatus: user.kycStatus,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }));
    
    return { users };
  }

  async updateUserStatus(userId: string, status: boolean) {
    for (const [email, user] of this.users.entries()) {
      if (user.id === userId) {
        user.isActive = status;
        return { message: `User ${status ? 'activated' : 'deactivated'} successfully` };
      }
    }
    
    throw new Error('User not found');
  }

  async sendOTP(email: string) {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP for verification (in production, this would be sent via SMS/email)
    this.otpStore = this.otpStore || new Map();
    this.otpStore.set(email, {
      otp,
      timestamp: Date.now(),
      attempts: 0
    });

    return {
      message: 'OTP sent successfully',
      otp, // Only for development - remove in production
      email
    };
  }

  async verifyOTP(email: string, otp: string) {
    if (!this.otpStore || !this.otpStore.has(email)) {
      throw new Error('OTP not found or expired');
    }

    const storedOTP = this.otpStore.get(email);
    
    // Check if OTP is expired (5 minutes)
    if (Date.now() - storedOTP.timestamp > 5 * 60 * 1000) {
      this.otpStore.delete(email);
      throw new Error('OTP expired');
    }

    // Check attempts (max 3 attempts)
    if (storedOTP.attempts >= 3) {
      this.otpStore.delete(email);
      throw new Error('Too many attempts. Please request a new OTP.');
    }

    storedOTP.attempts++;

    if (storedOTP.otp !== otp) {
      throw new Error('Invalid OTP');
    }

    // Clear OTP after successful verification
    this.otpStore.delete(email);

    return {
      message: 'OTP verified successfully',
      verified: true
    };
  }

  // Helper method for testing
  getUserCount() {
    return this.users.size;
  }

  // Helper method for testing
  getUserByEmail(email: string) {
    return this.users.get(email);
  }

  async generateCsrfToken(userId: string): Promise<string> {
    // Use cryptographically secure random bytes for CSRF token
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex'); // 64 character hex string
    this.csrfTokens.set(userId, token);
    this.logger.debug(`Generated secure CSRF token for user ${userId}`);
    return token;
  }

  async forgotPassword(email: string) {
    // TODO: Implement email sending
    this.logger.log(`Password reset requested for ${email}`);
    return { message: 'Password reset email sent' };
  }

  async resetPassword(token: string, password: string) {
    // TODO: Implement token verification and password update
    this.logger.log(`Password reset for token ${token}`);
    return { message: 'Password reset successful' };
  }

  async verifyEmail(token: string) {
    // TODO: Implement email verification
    this.logger.log(`Email verification for token ${token}`);
    return { message: 'Email verified' };
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
