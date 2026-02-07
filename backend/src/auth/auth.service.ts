import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  private users = new Map();
  private nextUserId = 1;
  private otpStore = new Map();

  constructor() {
    // Initialize with test users
    this.initializeTestUsers();
  }

  private initializeTestUsers() {
    // Create test buyers
    const buyers = [
      { email: 'arjun@quickmela.com', name: 'Arjun Kumar', password: 'BuyerPass123!' },
      { email: 'kavya@quickmela.com', name: 'Kavya Reddy', password: 'BuyerPass123!' },
      { email: 'vijay@quickmela.com', name: 'Vijay Singh', password: 'BuyerPass123!' },
      { email: 'neha@quickmela.com', name: 'Neha Sharma', password: 'BuyerPass123!' },
      { email: 'rohit@quickmela.com', name: 'Rohit Verma', password: 'BuyerPass123!' },
      { email: 'buyer@quickmela.com', name: 'Test Buyer', password: 'BuyerPass123!' },
      { email: '123abc@gmail.com', name: 'Test User', password: 'San@8897' } // User's registered account
    ];

    // Create test sellers
    const sellers = [
      { email: 'anita@quickmela.com', name: 'Anita Desai', password: 'SellerPass123!' },
      { email: 'suresh@quickmela.com', name: 'Suresh Mehta', password: 'SellerPass123!' },
      { email: 'deepa@quickmela.com', name: 'Deepa Patel', password: 'SellerPass123!' },
      { email: 'rajesh@quickmela.com', name: 'Rajesh Kumar', password: 'SellerPass123!' },
      { email: 'seller@quickmela.com', name: 'Test Seller', password: 'SellerPass123!' }
    ];

    // Create test admins
    const admins = [
      { email: 'system@quickmela.com', name: 'System Admin', password: 'AdminPass123!' },
      { email: 'support@quickmela.com', name: 'Support Admin', password: 'AdminPass123!' },
      { email: 'admin@quickmela.com', name: 'Test Admin', password: 'AdminPass123!' }
    ];

    // Add all users to the in-memory database
    [...buyers, ...sellers, ...admins].forEach(userData => {
      const role = userData.email.includes('admin') ? 'admin' : 
                  userData.email.includes('seller') ? 'seller' : 'buyer';
      
      this.users.set(userData.email, {
        id: (this.nextUserId++).toString(),
        email: userData.email,
        name: userData.name,
        password: userData.password,
        role: role,
        createdAt: new Date(),
        isActive: true,
        isVerified: true,
        walletBalance: role === 'admin' ? 500000 : 100000,
        kycStatus: 'verified',
        profile: {
          phone: '+91' + Math.floor(Math.random() * 9000000000 + 1000000000),
          address: 'Test Address, India',
          pincode: '400001'
        }
      });
    });

    // Test users initialized successfully
  }

  async login(loginDto: any) {
    const { email, password } = loginDto;
    
    // Find user
    const user = this.users.get(email);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (user.password !== password) {
      throw new Error('Invalid password');
    }
    
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }
    
    // Generate tokens (mock implementation)
    const accessToken = `mock-jwt-${user.id}-${Date.now()}`;
    const refreshToken = `mock-refresh-${user.id}-${Date.now()}`;
    
    // Update last login
    user.lastLogin = new Date();
    
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
    const { email, password, name, role = 'buyer' } = registerDto;
    
    // Check if user already exists
    if (this.users.has(email)) {
      throw new Error('User already exists');
    }
    
    // Create new user
    const newUser = {
      id: (this.nextUserId++).toString(),
      email,
      name,
      password,
      role,
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
    // Extract user from token (mock implementation)
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('No token provided');
    }
    
    // Mock token validation - extract user ID from token
    const userId = token.split('-')[2];
    
    // Find user by ID
    for (const [email, user] of this.users.entries()) {
      if (user.id === userId) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          walletBalance: user.walletBalance,
          kycStatus: user.kycStatus,
          profile: user.profile,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        };
      }
    }
    
    throw new Error('User not found');
  }

  async logout(req: any) {
    // Mock logout logic
    return { message: 'Logout successful' };
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
}
