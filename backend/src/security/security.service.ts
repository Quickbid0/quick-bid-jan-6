import { Injectable, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { RateLimiterMemory } from 'rate-limiter-flexible';
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
    auth: { windowMs: number; maxRequests: number };
    api: { windowMs: number; maxRequests: number };
    upload: { windowMs: number; maxRequests: number };
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

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  private config: SecurityConfig = {
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
    rateLimiting: {
      auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 auth attempts per 15 minutes
      api: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 API calls per minute
      upload: { windowMs: 60 * 60 * 1000, maxRequests: 10 }, // 10 uploads per hour
    },
    encryption: {
      algorithm: 'aes-256-gcm',
      keyLength: 32,
    },
    csrf: {
      enabled: true,
      tokenLength: 32,
      expiresIn: 3600000, // 1 hour
    },
  };

  // Rate limiters
  private authRateLimiter: RateLimiterMemory;
  private apiRateLimiter: RateLimiterMemory;
  private uploadRateLimiter: RateLimiterMemory;

  // CSRF tokens store
  private csrfTokens = new Map<string, { token: string; expiresAt: number }>();

  // Encryption key
  private encryptionKey: Buffer;

  constructor(
    private prismaService: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {
    this.initializeSecurity();
  }

  private initializeSecurity() {
    // Initialize rate limiters
    this.authRateLimiter = new RateLimiterMemory({
      keyPrefix: 'auth',
      duration: this.config.rateLimiting.auth.windowMs,
      points: this.config.rateLimiting.auth.maxRequests,
    });

    this.apiRateLimiter = new RateLimiterMemory({
      keyPrefix: 'api',
      duration: this.config.rateLimiting.api.windowMs,
      points: this.config.rateLimiting.api.maxRequests,
    });

    this.uploadRateLimiter = new RateLimiterMemory({
      keyPrefix: 'upload',
      duration: this.config.rateLimiting.upload.windowMs,
      points: this.config.rateLimiting.upload.maxRequests,
    });

    // Initialize encryption key
    const keyString = process.env.ENCRYPTION_KEY || 'default-encryption-key-32-chars-long';
    this.encryptionKey = crypto.scryptSync(keyString, 'salt', this.config.encryption.keyLength);

    this.logger.log('Security service initialized');
  }

  // Password Security
  async validatePassword(password: string): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (password.length < this.config.passwordPolicy.minLength) {
      errors.push(`Password must be at least ${this.config.passwordPolicy.minLength} characters long`);
    }

    if (this.config.passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (this.config.passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (this.config.passwordPolicy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (this.config.passwordPolicy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return { valid: errors.length === 0, errors };
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Rate Limiting
  async checkAuthRateLimit(identifier: string): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
    try {
      const result = await this.authRateLimiter.consume(identifier);
      return {
        allowed: true,
        remaining: result.remainingPoints,
        resetTime: new Date(Date.now() + result.msBeforeNext),
      };
    } catch (rejRes) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(Date.now() + rejRes.msBeforeNext),
      };
    }
  }

  async checkApiRateLimit(identifier: string): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
    try {
      const result = await this.apiRateLimiter.consume(identifier);
      return {
        allowed: true,
        remaining: result.remainingPoints,
        resetTime: new Date(Date.now() + result.msBeforeNext),
      };
    } catch (rejRes) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(Date.now() + rejRes.msBeforeNext),
      };
    }
  }

  async checkUploadRateLimit(identifier: string): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
    try {
      const result = await this.uploadRateLimiter.consume(identifier);
      return {
        allowed: true,
        remaining: result.remainingPoints,
        resetTime: new Date(Date.now() + result.msBeforeNext),
      };
    } catch (rejRes) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(Date.now() + rejRes.msBeforeNext),
      };
    }
  }

  // CSRF Protection
  generateCsrfToken(sessionId: string): string {
    const token = crypto.randomBytes(this.config.csrf.tokenLength).toString('hex');
    const expiresAt = Date.now() + this.config.csrf.expiresIn;

    this.csrfTokens.set(sessionId, { token, expiresAt });

    // Clean up expired tokens periodically
    this.cleanupExpiredCsrfTokens();

    return token;
  }

  validateCsrfToken(sessionId: string, token: string): boolean {
    const storedToken = this.csrfTokens.get(sessionId);

    if (!storedToken) {
      return false;
    }

    if (Date.now() > storedToken.expiresAt) {
      this.csrfTokens.delete(sessionId);
      return false;
    }

    return storedToken.token === token;
  }

  private cleanupExpiredCsrfTokens(): void {
    const now = Date.now();
    for (const [sessionId, tokenData] of this.csrfTokens.entries()) {
      if (now > tokenData.expiresAt) {
        this.csrfTokens.delete(sessionId);
      }
    }
  }

  // Data Encryption
  encryptData(data: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.config.encryption.algorithm, this.encryptionKey);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
  }

  decryptData(encryptedData: string): string {
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      throw new BadRequestException('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];

    const decipher = crypto.createDecipher(this.config.encryption.algorithm, this.encryptionKey);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  // Input Sanitization
  sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Remove HTML tags
    let sanitized = input.replace(/<[^>]*>/g, '');

    // Remove potentially dangerous characters
    sanitized = sanitized.replace(/[<>'"&]/g, (match) => {
      const entityMap = {
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#x27;',
        '"': '&quot;',
        '&': '&amp;',
      };
      return entityMap[match];
    });

    // Remove null bytes and other control characters
    sanitized = sanitized.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

    return sanitized.trim();
  }

  sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return this.sanitizeInput(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  }

  // Security Monitoring
  async logSecurityEvent(event: {
    type: 'suspicious_login' | 'rate_limit_exceeded' | 'csrf_violation' | 'sql_injection_attempt' | 'xss_attempt';
    userId?: string;
    ipAddress: string;
    userAgent: string;
    details: Record<string, any>;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<void> {
    const securityLog = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...event,
      timestamp: new Date(),
    };

    // In real implementation, store in security_logs table
    console.log('Security Event Logged:', securityLog);

    // Emit security alert for high-severity events
    if (event.severity === 'high' || event.severity === 'critical') {
      this.eventEmitter.emit('security.alert', securityLog);
    }

    this.logger.warn(`Security event: ${event.type} - Severity: ${event.severity}`);
  }

  // Fraud Detection Helpers
  detectSuspiciousPatterns(data: any): {
    isSuspicious: boolean;
    reasons: string[];
    riskScore: number;
  } {
    const reasons: string[] = [];
    let riskScore = 0;

    // Check for SQL injection patterns
    if (this.containsSqlInjection(data)) {
      reasons.push('Potential SQL injection detected');
      riskScore += 80;
    }

    // Check for XSS patterns
    if (this.containsXssPatterns(data)) {
      reasons.push('Potential XSS attack detected');
      riskScore += 60;
    }

    // Check for unusual request patterns
    if (this.hasUnusualPatterns(data)) {
      reasons.push('Unusual request patterns detected');
      riskScore += 30;
    }

    return {
      isSuspicious: riskScore > 50,
      reasons,
      riskScore: Math.min(100, riskScore),
    };
  }

  private containsSqlInjection(data: any): boolean {
    const sqlPatterns = [
      /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i,
      /('|(\\x27)|(\\x2D\\x2D)|(\\%27)|(\\%2D\\%2D))/i,
      /(\;|\%3B)/i,
    ];

    const dataString = JSON.stringify(data);
    return sqlPatterns.some(pattern => pattern.test(dataString));
  }

  private containsXssPatterns(data: any): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
    ];

    const dataString = JSON.stringify(data);
    return xssPatterns.some(pattern => pattern.test(dataString));
  }

  private hasUnusualPatterns(data: any): boolean {
    // Check for unusually long inputs
    const dataString = JSON.stringify(data);
    if (dataString.length > 10000) {
      return true;
    }

    // Check for too many nested objects
    const nestedLevel = this.getMaxNestedLevel(data);
    if (nestedLevel > 5) {
      return true;
    }

    return false;
  }

  private getMaxNestedLevel(obj: any, currentLevel = 0): number {
    if (obj === null || typeof obj !== 'object') {
      return currentLevel;
    }

    let maxLevel = currentLevel;

    if (Array.isArray(obj)) {
      for (const item of obj) {
        maxLevel = Math.max(maxLevel, this.getMaxNestedLevel(item, currentLevel + 1));
      }
    } else {
      for (const value of Object.values(obj)) {
        maxLevel = Math.max(maxLevel, this.getMaxNestedLevel(value, currentLevel + 1));
      }
    }

    return maxLevel;
  }

  // Security Headers Helper
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    };
  }

  // API Key Validation (for admin endpoints)
  async validateApiKey(apiKey: string): Promise<{ valid: boolean; userId?: string; permissions?: string[] }> {
    if (!apiKey) {
      return { valid: false };
    }

    // In real implementation, validate against api_keys table
    // For now, return mock validation
    if (apiKey.startsWith('qk_admin_')) {
      return {
        valid: true,
        userId: 'admin_001',
        permissions: ['read', 'write', 'delete', 'admin'],
      };
    }

    return { valid: false };
  }

  // Two-Factor Authentication Helpers
  generate2FASecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  generate2FAToken(secret: string): string {
    // Simple TOTP implementation (in production, use a proper TOTP library)
    const timeStep = Math.floor(Date.now() / 30000); // 30-second windows
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(timeStep.toString());
    return hmac.digest('hex').substring(0, 6).toUpperCase();
  }

  // Session Security
  generateSecureSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  validateSession(sessionId: string): boolean {
    // Check if session exists and is not expired
    // In real implementation, check against sessions table
    return sessionId && sessionId.length === 64;
  }
}
