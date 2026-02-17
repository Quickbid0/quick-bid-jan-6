"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const referral_service_1 = require("../referral/referral.service");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = AuthService_1 = class AuthService {
    constructor(jwtService, configService, prisma, referralService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.prisma = prisma;
        this.referralService = referralService;
        this.users = new Map();
        this.nextUserId = 1;
        this.otpStore = new Map();
        this.logger = new common_1.Logger(AuthService_1.name);
        this.refreshTokens = new Map();
        this.csrfTokens = new Map();
        const jwtSecret = this.configService.get('JWT_SECRET');
        if (!jwtSecret) {
            throw new Error('JWT_SECRET missing');
        }
        this.initializeTestUsers();
    }
    async initializeTestUsers() {
        const users = [
            {
                email: 'superadmin@quickmela.com',
                name: 'QuickMela Super Admin',
                password: 'SuperAdmin123!',
                role: 'SUPER_ADMIN',
                phoneNumber: '+919876543210',
                status: 'ACTIVE',
                isVerified: true,
                emailVerified: true,
                phoneVerified: true,
                faceVerified: true,
                kycStatus: 'APPROVED'
            },
            {
                email: 'admin@quickmela.com',
                name: 'QuickMela Admin',
                password: 'AdminPass123!',
                role: 'ADMIN',
                phoneNumber: '+919876543211',
                status: 'ACTIVE',
                isVerified: true,
                emailVerified: true,
                phoneVerified: true,
                faceVerified: true,
                kycStatus: 'APPROVED'
            },
            {
                email: 'seller.hyderabad@quickmela.com',
                name: 'Hyderabad Seller',
                password: 'SellerPass123!',
                role: 'SELLER',
                phoneNumber: '+919876543212',
                status: 'ACTIVE',
                isVerified: true,
                emailVerified: true,
                phoneVerified: true,
                faceVerified: true,
                kycStatus: 'APPROVED'
            },
            {
                email: 'seller.mumbai@quickmela.com',
                name: 'Mumbai Seller',
                password: 'SellerPass123!',
                role: 'SELLER',
                phoneNumber: '+919876543213',
                status: 'ACTIVE',
                isVerified: true,
                emailVerified: true,
                phoneVerified: true,
                faceVerified: true,
                kycStatus: 'APPROVED'
            },
            {
                email: 'arjun@quickmela.com',
                name: 'Arjun Kumar',
                password: 'BuyerPass123!',
                role: 'BUYER',
                phoneNumber: '+919876543214',
                status: 'ACTIVE',
                isVerified: true,
                emailVerified: true,
                phoneVerified: true,
                faceVerified: true,
                kycStatus: 'APPROVED'
            },
            {
                email: 'kavya@quickmela.com',
                name: 'Kavya Reddy',
                password: 'BuyerPass123!',
                role: 'BUYER',
                phoneNumber: '+919876543215',
                status: 'ACTIVE',
                isVerified: true,
                emailVerified: true,
                phoneVerified: true,
                faceVerified: true,
                kycStatus: 'APPROVED'
            },
            {
                email: 'rahul@quickmela.com',
                name: 'Rahul Gupta',
                password: 'BuyerPass123!',
                role: 'BUYER',
                phoneNumber: '+919876543216',
                status: 'ACTIVE',
                isVerified: true,
                emailVerified: true,
                phoneVerified: true,
                faceVerified: true,
                kycStatus: 'APPROVED'
            },
            {
                email: 'agent.hyderabad@quickmela.com',
                name: 'Hyderabad Delivery Agent',
                password: 'AgentPass123!',
                role: 'DELIVERY_AGENT',
                phoneNumber: '+919876543217',
                status: 'ACTIVE',
                isVerified: true,
                emailVerified: true,
                phoneVerified: true,
                faceVerified: true,
                kycStatus: 'APPROVED'
            },
            {
                email: 'telecaller@quickmela.com',
                name: 'QuickMela Telecaller',
                password: 'TelePass123!',
                role: 'TELECALLER',
                phoneNumber: '+919876543218',
                status: 'ACTIVE',
                isVerified: true,
                emailVerified: true,
                phoneVerified: true,
                faceVerified: true,
                kycStatus: 'APPROVED'
            }
        ];
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
                            passwordHash: hashedPassword,
                            phoneNumber: userData.phoneNumber,
                            role: userData.role,
                            status: userData.status,
                            isVerified: userData.isVerified,
                            emailVerified: userData.emailVerified,
                            phoneVerified: userData.phoneVerified,
                            faceVerified: userData.faceVerified,
                            kycStatus: userData.kycStatus,
                            profile: {
                                create: {
                                    bio: `Professional ${userData.role.toLowerCase()} on QuickMela platform`,
                                    city: userData.role === 'SELLER' ? 'Hyderabad' : userData.role === 'BUYER' ? 'Mumbai' : 'Delhi',
                                    state: userData.role === 'SELLER' ? 'Telangana' : userData.role === 'BUYER' ? 'Maharashtra' : 'Delhi',
                                    pincode: userData.role === 'SELLER' ? '500001' : userData.role === 'BUYER' ? '400001' : '110001'
                                }
                            },
                            wallet: {
                                create: {
                                    balance: userData.role === 'SUPER_ADMIN' ? 1000000 : userData.role === 'ADMIN' ? 500000 : 10000,
                                    totalCredits: userData.role === 'SUPER_ADMIN' ? 1000000 : userData.role === 'ADMIN' ? 500000 : 10000
                                }
                            },
                            subscription: {
                                create: {
                                    plan: userData.role === 'BUYER' ? 'SILVER' : 'ENTERPRISE',
                                    status: 'ACTIVE',
                                    bidLimit: userData.role === 'BUYER' ? 10 : 1000,
                                    price: userData.role === 'BUYER' ? 499 : 9999,
                                    startDate: new Date(),
                                    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                                }
                            }
                        }
                    });
                    this.logger.log(`Created test user: ${user.email} (${user.role})`);
                }
            }
            catch (error) {
                this.logger.error(`Failed to create user ${userData.email}:`, error);
            }
        }
    }
    async login(loginDto) {
        try {
            const { email, password } = loginDto;
            this.logger.log(`Login attempt for email: ${email}`);
            const user = await this.prisma.user.findUnique({
                where: { email },
            });
            if (!user) {
                this.logger.warn(`Failed login attempt: User not found for email ${email}`);
                throw new Error('Invalid credentials');
            }
            if (!user.isActive || user.status !== 'ACTIVE') {
                this.logger.warn(`Login attempt blocked: Account not active for email ${email}`);
                throw new Error('Account is not active. Please contact support.');
            }
            const isPasswordValid = await this.verifyPassword(password, user.passwordHash);
            if (!isPasswordValid) {
                this.logger.warn(`Failed login attempt: Invalid password for email ${email}`);
                throw new Error('Invalid credentials');
            }
            const jwtSecret = this.configService.get('JWT_SECRET');
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
            const refreshToken = this.jwtService.sign({ sub: user.id, type: 'refresh' }, {
                expiresIn: '7d',
                algorithm: 'HS256'
            });
            this.logger.log(`JWT tokens generated successfully for user ${email}`);
            const crypto = require('crypto');
            const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
            this.refreshTokens.set(hash, { userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
            await this.prisma.user.update({
                where: { id: user.id },
                data: { lastLogin: new Date() }
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
        }
        catch (error) {
            this.logger.error(`LOGIN ERROR for email ${loginDto?.email || 'unknown'}:`, error);
            throw new Error(`Login failed: ${error.message}`);
        }
    }
    async register(registerDto) {
        const { email, password, name, referralCode } = registerDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new Error('User already exists');
        }
        const hashedPassword = await this.hashPassword(password);
        const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const referralCodeForNewUser = this.referralService.generateReferralCode(newUserId);
        const newUser = await this.prisma.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                name,
                role: 'BUYER',
                status: 'ACTIVE',
                referralCode: referralCodeForNewUser,
            },
        });
        if (referralCode) {
        }
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
    async getProfile(req) {
        const user = req.user;
        if (!user)
            throw new Error('Not authenticated');
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
    async logout(refreshToken) {
        const crypto = require('crypto');
        const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        this.refreshTokens.delete(hash);
        this.logger.log('User logged out, refresh token invalidated');
        return { message: 'Logout successful' };
    }
    async refresh(token) {
        try {
            const crypto = require('crypto');
            const hash = crypto.createHash('sha256').update(token).digest('hex');
            const stored = this.refreshTokens.get(hash);
            if (!stored) {
                try {
                    const payload = this.jwtService.verify(token);
                    this.logger.warn(`Refresh token reuse detected for user ${payload.sub}`);
                    for (const [h, data] of this.refreshTokens.entries()) {
                        if (data.userId === payload.sub) {
                            this.refreshTokens.delete(h);
                        }
                    }
                    throw new Error('Refresh token reuse detected');
                }
                catch (e) {
                    throw new Error('Invalid refresh token');
                }
            }
            if (stored.expiresAt < new Date()) {
                this.refreshTokens.delete(hash);
                throw new Error('Expired refresh token');
            }
            const user = Array.from(this.users.values()).find(u => u.id === stored.userId);
            if (!user)
                throw new Error('User not found');
            const newPayload = { sub: user.id, email: user.email, role: user.role };
            const newAccessToken = this.jwtService.sign(newPayload, { expiresIn: '15m' });
            const newRefreshToken = this.jwtService.sign({ sub: user.id }, { expiresIn: '7d' });
            this.refreshTokens.delete(hash);
            const newHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
            this.refreshTokens.set(newHash, { userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
            return { accessToken: newAccessToken, refreshToken: newRefreshToken };
        }
        catch (error) {
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
    async updateUserStatus(userId, status) {
        for (const [email, user] of this.users.entries()) {
            if (user.id === userId) {
                user.isActive = status;
                return { message: `User ${status ? 'activated' : 'deactivated'} successfully` };
            }
        }
        throw new Error('User not found');
    }
    async sendOTP(email) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        this.otpStore = this.otpStore || new Map();
        this.otpStore.set(email, {
            otp,
            timestamp: Date.now(),
            attempts: 0
        });
        return {
            message: 'OTP sent successfully',
            otp,
            email
        };
    }
    async verifyOTP(email, otp) {
        if (!this.otpStore || !this.otpStore.has(email)) {
            throw new Error('OTP not found or expired');
        }
        const storedOTP = this.otpStore.get(email);
        if (Date.now() - storedOTP.timestamp > 5 * 60 * 1000) {
            this.otpStore.delete(email);
            throw new Error('OTP expired');
        }
        if (storedOTP.attempts >= 3) {
            this.otpStore.delete(email);
            throw new Error('Too many attempts. Please request a new OTP.');
        }
        storedOTP.attempts++;
        if (storedOTP.otp !== otp) {
            throw new Error('Invalid OTP');
        }
        this.otpStore.delete(email);
        return {
            message: 'OTP verified successfully',
            verified: true
        };
    }
    getUserCount() {
        return this.users.size;
    }
    getUserByEmail(email) {
        return this.users.get(email);
    }
    async generateCsrfToken(userId) {
        const crypto = require('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        this.csrfTokens.set(userId, token);
        this.logger.debug(`Generated secure CSRF token for user ${userId}`);
        return token;
    }
    async forgotPassword(email) {
        this.logger.log(`Password reset requested for ${email}`);
        return { message: 'Password reset email sent' };
    }
    async resetPassword(token, password) {
        this.logger.log(`Password reset for token ${token}`);
        return { message: 'Password reset successful' };
    }
    async verifyEmail(token) {
        this.logger.log(`Email verification for token ${token}`);
        return { message: 'Email verified' };
    }
    async hashPassword(password) {
        return bcrypt.hash(password, 10);
    }
    async verifyPassword(password, hash) {
        return bcrypt.compare(password, hash);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        prisma_service_1.PrismaService, typeof (_a = typeof referral_service_1.ReferralService !== "undefined" && referral_service_1.ReferralService) === "function" ? _a : Object])
], AuthService);
//# sourceMappingURL=auth.service.js.map