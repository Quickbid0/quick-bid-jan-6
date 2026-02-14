import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
export interface SecurityConfig {
    passwordPolicy: {
        minLength: number;
        requireUppercase: boolean;
        requireLowercase: boolean;
        requireNumbers: boolean;
        requireSpecialChars: boolean;
    };
    rateLimiting: {
        auth: {
            windowMs: number;
            maxRequests: number;
        };
        api: {
            windowMs: number;
            maxRequests: number;
        };
        upload: {
            windowMs: number;
            maxRequests: number;
        };
    };
    encryption: {
        algorithm: string;
        keyLength: number;
    };
    csrf: {
        enabled: boolean;
        tokenLength: number;
        expiresIn: number;
    };
}
export declare class SecurityService {
    private prismaService;
    private eventEmitter;
    private readonly logger;
    private config;
    private authRateLimiter;
    private apiRateLimiter;
    private uploadRateLimiter;
    private csrfTokens;
    private encryptionKey;
    constructor(prismaService: PrismaService, eventEmitter: EventEmitter2);
    private initializeSecurity;
    validatePassword(password: string): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    hashPassword(password: string): Promise<string>;
    verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
    checkAuthRateLimit(identifier: string): Promise<{
        allowed: boolean;
        remaining: number;
        resetTime: Date;
    }>;
    checkApiRateLimit(identifier: string): Promise<{
        allowed: boolean;
        remaining: number;
        resetTime: Date;
    }>;
    checkUploadRateLimit(identifier: string): Promise<{
        allowed: boolean;
        remaining: number;
        resetTime: Date;
    }>;
    generateCsrfToken(sessionId: string): string;
    validateCsrfToken(sessionId: string, token: string): boolean;
    private cleanupExpiredCsrfTokens;
    encryptData(data: string): string;
    decryptData(encryptedData: string): string;
    sanitizeInput(input: string): string;
    sanitizeObject(obj: any): any;
    logSecurityEvent(event: {
        type: 'suspicious_login' | 'rate_limit_exceeded' | 'csrf_violation' | 'sql_injection_attempt' | 'xss_attempt';
        userId?: string;
        ipAddress: string;
        userAgent: string;
        details: Record<string, any>;
        severity: 'low' | 'medium' | 'high' | 'critical';
    }): Promise<void>;
    detectSuspiciousPatterns(data: any): {
        isSuspicious: boolean;
        reasons: string[];
        riskScore: number;
    };
    private containsSqlInjection;
    private containsXssPatterns;
    private hasUnusualPatterns;
    private getMaxNestedLevel;
    getSecurityHeaders(): Record<string, string>;
    validateApiKey(apiKey: string): Promise<{
        valid: boolean;
        userId?: string;
        permissions?: string[];
    }>;
    generate2FASecret(): string;
    generate2FAToken(secret: string): string;
    generateSecureSessionId(): string;
    validateSession(sessionId: string): boolean;
}
