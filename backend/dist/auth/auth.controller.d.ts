import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { Request, Response } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, res: Response): Promise<Response<any, Record<string, any>>>;
    register(registerDto: RegisterDto): Promise<{
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
    refresh(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getProfile(req: Request): Promise<{
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
    getCsrfToken(req: Request & {
        user: {
            userId: string;
        };
    }, res: Response): Promise<{
        csrfToken: string;
    }>;
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
    sendOTP(body: {
        email: string;
    }): Promise<{
        message: string;
        otp: string;
        email: string;
    }>;
    logout(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    verifyOtp(body: {
        email: string;
        otp: string;
    }): Promise<{
        message: string;
        verified: boolean;
    }>;
}
