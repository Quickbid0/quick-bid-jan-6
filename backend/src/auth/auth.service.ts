import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private users = new Map();
  private nextUserId = 1;
  private otpStore = new Map();
  private readonly logger = new Logger(AuthService.name);
  private refreshTokens = new Map<string, {userId: string, expiresAt: Date}>();
  private csrfTokens = new Map<string, string>();

  constructor(private jwtService: JwtService, private configService: ConfigService) {
    // Validate JWT_SECRET at startup
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET missing');
    }
    // Ensure JWT secret is not logged
    this.initializeTestUsers();
  }

  private initializeTestUsers() {
    // Create test buyers
    const buyers = [
      { email: 'arjun@quickmela.com', name: 'Arjun Kumar', password: 'BuyerPass123!' },
      { email: 'kavya@quickmela.com', name: 'Kavya Reddy', password: 'BuyerPass123!' },
      { email: 'vijay@quickmela.com', name: 'Vijay Singh', password: 'BuyerPass123!' },
      { email: 'neha@quickmela.com', name: 'Neha Sharma', password: 'BuyerPass123!' },
      { email: 'rahul@quickmela.com', name: 'Rahul Gupta', password: 'BuyerPass123!' },
      { email: 'priya@quickmela.com', name: 'Priya Patel', password: 'BuyerPass123!' }
    ];

    // Create test sellers
    const sellers = [
      { email: 'seller1@quickmela.com', name: 'Seller One', password: 'SellerPass123!' },
      { email: 'seller2@quickmela.com', name: 'Seller Two', password: 'SellerPass123!' },
      { email: 'seller3@quickmela.com', name: 'Seller Three', password: 'SellerPass123!' }
    ];

    // Create test company (admin)
    const company = [
      { email: 'admin@quickmela.com', name: 'QuickMela Admin', password: 'AdminPass123!' }
    ];

    [...buyers, ...sellers, ...company].forEach(userData => {
      const role = userData.email.includes('admin') ? 'company' : userData.email.includes('seller') ? 'seller' : 'buyer';
      const user = {
        id: (this.nextUserId++).toString(),
        email: userData.email,
        name: userData.name,
        password: userData.password,
        role,
        createdAt: new Date(),
        isActive: true,
        isVerified: true,
        walletBalance: role === 'company' ? 500000 : 100000,
        kycStatus: 'verified',
        profile: {
          phone: '',
          address: '',
          pincode: ''
        },
        lastLogin: null,
        failureCount: 0,
        lockUntil: null
      };
      this.users.set(user.email, user);
    });
  }

  async login(loginDto: any) {
    const { email, password } = loginDto;
    
    // Find user
    const user = this.users.get(email);
    
    if (!user) {
      this.logger.warn(`Failed login attempt: User not found for email ${email}`);
      throw new Error('Invalid credentials');
    }
    
    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      this.logger.warn(`Login attempt blocked: Account locked for email ${email}`);
      throw new Error('Account locked due to too many failed attempts. Try again later.');
    }
    
    if (user.password !== password) {
      // Increment failure count
      user.failureCount = (user.failureCount || 0) + 1;
      if (user.failureCount > 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        this.logger.warn(`Account locked for email ${email} due to too many failed attempts`);
      }
      this.logger.warn(`Failed login attempt: Invalid password for email ${email}`);
      throw new Error('Invalid credentials');
    }
    
    // Reset failure count on success
    user.failureCount = 0;
    user.lockUntil = null;
    
    // Generate tokens
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign({ sub: user.id }, { expiresIn: '7d' });
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    this.refreshTokens.set(hash, { userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
    
    // Update last login
    user.lastLogin = new Date();
    
    this.logger.log(`Successful login for user ${email}`);
    
    return {
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        walletBalance: user.walletBalance,
        kycStatus: user.kycStatus,
        profile: user.profile
      },
      accessToken,
      refreshToken
    };
  }

  async register(registerDto: any) {
    const { email, password, name } = registerDto;
    
    // Check if user already exists
    if (this.users.has(email)) {
      throw new Error('User already exists');
    }
    
    // Create new user - always assign 'buyer' role for security
    const newUser = {
      id: (this.nextUserId++).toString(),
      email,
      name,
      password,
      role: 'buyer', // Strict RBAC: new users are buyers only
      createdAt: new Date(),
      isActive: true,
      isVerified: false,
      walletBalance: 0,
      kycStatus: 'pending',
      profile: {
        phone: '',
        address: '',
        pincode: ''
      }
    };
    
    this.users.set(email, newUser);
    
    return {
      message: 'Registration successful',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        walletBalance: newUser.walletBalance,
        kycStatus: newUser.kycStatus
      }
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
    const token = Math.random().toString(36).substring(2);
    this.csrfTokens.set(userId, token);
    return token;
  }
}
