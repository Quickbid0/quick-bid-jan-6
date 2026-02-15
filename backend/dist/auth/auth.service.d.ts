import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ReferralService } from '../referral/referral.service';
export declare class AuthService {
    private jwtService;
    private configService;
    private prisma;
    private referralService;
    private users;
    private nextUserId;
    private otpStore;
    private readonly logger;
    private refreshTokens;
    private csrfTokens;
    constructor(jwtService: JwtService, configService: ConfigService, prisma: PrismaService, referralService: ReferralService);
    private initializeTestUsers;
    login(loginDto: any): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            phoneNumber: any;
            isVerified: any;
            kycStatus: any;
            walletBalance: any;
            subscriptionPlan: any;
            profile: any;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    register(registerDto: any): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            referralCode: any;
        };
    }>;
    getProfile(req: any): Promise<{
        id: any;
        email: any;
        name: any;
        role: any;
        walletBalance: any;
        kycStatus: any;
        profile: any;
        createdAt: any;
        lastLogin: any;
    }>;
    logout(refreshToken: string): Promise<{
        message: string;
    }>;
    refresh(token: string): Promise<any>;
    getAllUsers(): Promise<{
        users: {
            id: any;
            email: any;
            name: any;
            role: any;
            isActive: any;
            isVerified: any;
            walletBalance: any;
            kycStatus: any;
            createdAt: any;
            lastLogin: any;
        }[];
    }>;
    updateUserStatus(userId: string, status: boolean): Promise<{
        message: string;
    }>;
    sendOTP(email: string): Promise<{
        message: string;
        otp: string;
        email: string;
    }>;
    verifyOTP(email: string, otp: string): Promise<{
        message: string;
        verified: boolean;
    }>;
    getUserCount(): number;
    getUserByEmail(email: string): any;
    generateCsrfToken(userId: string): Promise<string>;
}
