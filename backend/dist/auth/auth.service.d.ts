import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private jwtService;
    private configService;
    private users;
    private nextUserId;
    private otpStore;
    private readonly logger;
    private refreshTokens;
    private csrfTokens;
    constructor(jwtService: JwtService, configService: ConfigService);
    private initializeTestUsers;
    login(loginDto: any): Promise<{
        message: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
            walletBalance: any;
            kycStatus: any;
            profile: any;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    register(registerDto: any): Promise<{
        message: string;
        user: {
            id: string;
            email: any;
            name: any;
            role: string;
            walletBalance: number;
            kycStatus: string;
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
