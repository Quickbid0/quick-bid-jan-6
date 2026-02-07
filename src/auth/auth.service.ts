import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { Account, Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  role: Role;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    emailVerified: boolean;
    profile?: {
      avatarUrl?: string;
      bio?: string;
    };
  };
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, password: string): Promise<Account | null> {
    const user = await this.prismaService.account.findUnique({
      where: { 
        email: email.toLowerCase(),
        isActive: true,
        status: UserStatus.ACTIVE
      },
      include: {
        profile: true
      }
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Validate user credentials
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT tokens
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    };
    
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Create user session
    await this.prismaService.userSession.create({
      data: {
        userId: user.id,
        token: accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      }
    });

    // Log successful login
    await this.prismaService.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        resource: 'AUTH',
        details: { email: user.email }
      }
    });

    // Remove sensitive data from response
    const { passwordHash, verificationToken, resetPasswordToken, resetTokenExpiry, ...userResult } = user;
    
    return {
      user: userResult,
      accessToken,
      refreshToken,
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, name, role } = registerDto;

    // Check if user already exists
    const existingUser = await this.prismaService.account.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = await this.prismaService.account.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        role,
        status: UserStatus.PENDING_VERIFICATION,
        emailVerified: 'UNVERIFIED',
        verificationToken: this.generateVerificationToken(),
      }
    });

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(user.email, user.verificationToken);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Continue with registration even if email fails
    }

    // Generate JWT tokens
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    };
    
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Create user session
    await this.prismaService.userSession.create({
      data: {
        userId: user.id,
        token: accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      }
    });

    // Log registration
    await this.prismaService.auditLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        resource: 'AUTH',
        details: { email: user.email, role: user.role }
      }
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: false,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    // Find valid session
    const session = await this.prismaService.userSession.findFirst({
      where: {
        refreshToken,
        expiresAt: { gt: new Date() }
      },
      include: {
        account: {
          include: {
            profile: true
          }
        }
      }
    });

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generate new tokens
    const payload = { 
      sub: session.account.id, 
      email: session.account.email, 
      role: session.account.role 
    };
    
    const newAccessToken = this.jwtService.sign(payload);
    const newRefreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Update session
    await this.prismaService.userSession.update({
      where: { id: session.id },
      data: {
        token: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      }
    });

    // Remove sensitive data from response
    const { passwordHash, verificationToken, resetPasswordToken, resetTokenExpiry, ...userResult } = session.account;

    return {
      user: userResult,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string): Promise<void> {
    // Remove all user sessions
    await this.prismaService.userSession.deleteMany({
      where: { userId }
    });

    // Log logout
    await this.prismaService.auditLog.create({
      data: {
        userId,
        action: 'LOGOUT',
        resource: 'AUTH',
      }
    });
  }

  async getProfile(userId: string): Promise<Account | null> {
    return await this.prismaService.account.findUnique({
      where: { 
        id: userId,
        isActive: true,
        status: UserStatus.ACTIVE
      },
      include: {
        profile: true
      }
    });
  }

  private generateVerificationToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  async sendOTP(email: string): Promise<{ message: string; otp: string }> {
    const otp = this.generateOTP();
    
    try {
      await this.emailService.sendOTPEmail(email, otp);
      return { message: 'OTP sent successfully', otp }; // Return OTP for development
    } catch (error) {
      console.error('Failed to send OTP:', error);
      throw new Error('Failed to send OTP');
    }
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.prismaService.account.findFirst({
      where: { 
        verificationToken: token,
        status: UserStatus.PENDING_VERIFICATION 
      }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired verification token');
    }

    await this.prismaService.account.update({
      where: { id: user.id },
      data: {
        status: UserStatus.ACTIVE,
        emailVerified: 'VERIFIED',
        verificationToken: null
      }
    });

    return { message: 'Email verified successfully' };
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
