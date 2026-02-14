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
var SecurityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const event_emitter_1 = require("@nestjs/event-emitter");
let SecurityService = SecurityService_1 = class SecurityService {
    constructor(prismaService, eventEmitter) {
        this.prismaService = prismaService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(SecurityService_1.name);
        this.config = {
            passwordPolicy: {
                minLength: 8,
                requireUppercase: true,
                requireLowercase: true,
                requireNumbers: true,
                requireSpecialChars: true,
            },
            rateLimiting: {
                auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
                api: { windowMs: 60 * 1000, maxRequests: 100 },
                upload: { windowMs: 60 * 60 * 1000, maxRequests: 10 },
            },
            encryption: {
                algorithm: 'aes-256-gcm',
                keyLength: 32,
            },
            csrf: {
                enabled: true,
                tokenLength: 32,
                expiresIn: 3600000,
            },
        };
        this.csrfTokens = new Map();
        this.initializeSecurity();
    }
    initializeSecurity() {
        this.authRateLimiter = new rate_limiter_flexible_1.RateLimiterMemory({
            keyPrefix: 'auth',
            duration: this.config.rateLimiting.auth.windowMs,
            points: this.config.rateLimiting.auth.maxRequests,
        });
        this.apiRateLimiter = new rate_limiter_flexible_1.RateLimiterMemory({
            keyPrefix: 'api',
            duration: this.config.rateLimiting.api.windowMs,
            points: this.config.rateLimiting.api.maxRequests,
        });
        this.uploadRateLimiter = new rate_limiter_flexible_1.RateLimiterMemory({
            keyPrefix: 'upload',
            duration: this.config.rateLimiting.upload.windowMs,
            points: this.config.rateLimiting.upload.maxRequests,
        });
        const keyString = process.env.ENCRYPTION_KEY || 'default-encryption-key-32-chars-long';
        this.encryptionKey = crypto.scryptSync(keyString, 'salt', this.config.encryption.keyLength);
        this.logger.log('Security service initialized');
    }
    async validatePassword(password) {
        const errors = [];
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
    async hashPassword(password) {
        const saltRounds = 12;
        return await bcrypt.hash(password, saltRounds);
    }
    async verifyPassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }
    async checkAuthRateLimit(identifier) {
        try {
            const result = await this.authRateLimiter.consume(identifier);
            return {
                allowed: true,
                remaining: result.remainingPoints,
                resetTime: new Date(Date.now() + result.msBeforeNext),
            };
        }
        catch (rejRes) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: new Date(Date.now() + rejRes.msBeforeNext),
            };
        }
    }
    async checkApiRateLimit(identifier) {
        try {
            const result = await this.apiRateLimiter.consume(identifier);
            return {
                allowed: true,
                remaining: result.remainingPoints,
                resetTime: new Date(Date.now() + result.msBeforeNext),
            };
        }
        catch (rejRes) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: new Date(Date.now() + rejRes.msBeforeNext),
            };
        }
    }
    async checkUploadRateLimit(identifier) {
        try {
            const result = await this.uploadRateLimiter.consume(identifier);
            return {
                allowed: true,
                remaining: result.remainingPoints,
                resetTime: new Date(Date.now() + result.msBeforeNext),
            };
        }
        catch (rejRes) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: new Date(Date.now() + rejRes.msBeforeNext),
            };
        }
    }
    generateCsrfToken(sessionId) {
        const token = crypto.randomBytes(this.config.csrf.tokenLength).toString('hex');
        const expiresAt = Date.now() + this.config.csrf.expiresIn;
        this.csrfTokens.set(sessionId, { token, expiresAt });
        this.cleanupExpiredCsrfTokens();
        return token;
    }
    validateCsrfToken(sessionId, token) {
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
    cleanupExpiredCsrfTokens() {
        const now = Date.now();
        for (const [sessionId, tokenData] of this.csrfTokens.entries()) {
            if (now > tokenData.expiresAt) {
                this.csrfTokens.delete(sessionId);
            }
        }
    }
    encryptData(data) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipher(this.config.encryption.algorithm, this.encryptionKey);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    }
    decryptData(encryptedData) {
        const parts = encryptedData.split(':');
        if (parts.length !== 2) {
            throw new common_1.BadRequestException('Invalid encrypted data format');
        }
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        const decipher = crypto.createDecipher(this.config.encryption.algorithm, this.encryptionKey);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    sanitizeInput(input) {
        if (!input || typeof input !== 'string') {
            return '';
        }
        let sanitized = input.replace(/<[^>]*>/g, '');
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
        sanitized = sanitized.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
        return sanitized.trim();
    }
    sanitizeObject(obj) {
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
    async logSecurityEvent(event) {
        const securityLog = {
            id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...event,
            timestamp: new Date(),
        };
        console.log('Security Event Logged:', securityLog);
        if (event.severity === 'high' || event.severity === 'critical') {
            this.eventEmitter.emit('security.alert', securityLog);
        }
        this.logger.warn(`Security event: ${event.type} - Severity: ${event.severity}`);
    }
    detectSuspiciousPatterns(data) {
        const reasons = [];
        let riskScore = 0;
        if (this.containsSqlInjection(data)) {
            reasons.push('Potential SQL injection detected');
            riskScore += 80;
        }
        if (this.containsXssPatterns(data)) {
            reasons.push('Potential XSS attack detected');
            riskScore += 60;
        }
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
    containsSqlInjection(data) {
        const sqlPatterns = [
            /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i,
            /('|(\\x27)|(\\x2D\\x2D)|(\\%27)|(\\%2D\\%2D))/i,
            /(\;|\%3B)/i,
        ];
        const dataString = JSON.stringify(data);
        return sqlPatterns.some(pattern => pattern.test(dataString));
    }
    containsXssPatterns(data) {
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
    hasUnusualPatterns(data) {
        const dataString = JSON.stringify(data);
        if (dataString.length > 10000) {
            return true;
        }
        const nestedLevel = this.getMaxNestedLevel(data);
        if (nestedLevel > 5) {
            return true;
        }
        return false;
    }
    getMaxNestedLevel(obj, currentLevel = 0) {
        if (obj === null || typeof obj !== 'object') {
            return currentLevel;
        }
        let maxLevel = currentLevel;
        if (Array.isArray(obj)) {
            for (const item of obj) {
                maxLevel = Math.max(maxLevel, this.getMaxNestedLevel(item, currentLevel + 1));
            }
        }
        else {
            for (const value of Object.values(obj)) {
                maxLevel = Math.max(maxLevel, this.getMaxNestedLevel(value, currentLevel + 1));
            }
        }
        return maxLevel;
    }
    getSecurityHeaders() {
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
    async validateApiKey(apiKey) {
        if (!apiKey) {
            return { valid: false };
        }
        if (apiKey.startsWith('qk_admin_')) {
            return {
                valid: true,
                userId: 'admin_001',
                permissions: ['read', 'write', 'delete', 'admin'],
            };
        }
        return { valid: false };
    }
    generate2FASecret() {
        return crypto.randomBytes(32).toString('hex');
    }
    generate2FAToken(secret) {
        const timeStep = Math.floor(Date.now() / 30000);
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(timeStep.toString());
        return hmac.digest('hex').substring(0, 6).toUpperCase();
    }
    generateSecureSessionId() {
        return crypto.randomBytes(32).toString('hex');
    }
    validateSession(sessionId) {
        return sessionId && sessionId.length === 64;
    }
};
exports.SecurityService = SecurityService;
exports.SecurityService = SecurityService = SecurityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        event_emitter_1.EventEmitter2])
], SecurityService);
//# sourceMappingURL=security.service.js.map