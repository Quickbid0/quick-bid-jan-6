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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
let AuthService = AuthService_1 = class AuthService {
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
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
    initializeTestUsers() {
        const buyers = [
            { email: 'arjun@quickmela.com', name: 'Arjun Kumar', password: 'BuyerPass123!' },
            { email: 'kavya@quickmela.com', name: 'Kavya Reddy', password: 'BuyerPass123!' },
            { email: 'vijay@quickmela.com', name: 'Vijay Singh', password: 'BuyerPass123!' },
            { email: 'neha@quickmela.com', name: 'Neha Sharma', password: 'BuyerPass123!' },
            { email: 'rahul@quickmela.com', name: 'Rahul Gupta', password: 'BuyerPass123!' },
            { email: 'priya@quickmela.com', name: 'Priya Patel', password: 'BuyerPass123!' },
            { email: 'buyer1@quickmela.com', name: 'Buyer One', password: 'BuyerPass123!' }
        ];
        const sellers = [
            { email: 'seller1@quickmela.com', name: 'Seller One', password: 'SellerPass123!' },
            { email: 'seller2@quickmela.com', name: 'Seller Two', password: 'SellerPass123!' },
            { email: 'seller3@quickmela.com', name: 'Seller Three', password: 'SellerPass123!' }
        ];
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
    async login(loginDto) {
        try {
            const { email, password } = loginDto;
            this.logger.log(`Login attempt for email: ${email}`);
            const user = this.users.get(email);
            if (!user) {
                this.logger.warn(`Failed login attempt: User not found for email ${email}`);
                throw new Error('Invalid credentials');
            }
            if (user.lockUntil && user.lockUntil > new Date()) {
                this.logger.warn(`Login attempt blocked: Account locked for email ${email}`);
                throw new Error('Account locked due to too many failed attempts. Try again later.');
            }
            if (user.password !== password) {
                user.failureCount = (user.failureCount || 0) + 1;
                if (user.failureCount > 5) {
                    user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
                    this.logger.warn(`Account locked for email ${email} due to too many failed attempts`);
                }
                this.logger.warn(`Failed login attempt: Invalid password for email ${email}`);
                throw new Error('Invalid credentials');
            }
            user.failureCount = 0;
            user.lockUntil = null;
            this.logger.log(`Generating JWT tokens for user ${email}`);
            const payload = { sub: user.id, email: user.email, role: user.role };
            const accessToken = this.jwtService.sign(payload);
            const refreshToken = this.jwtService.sign({ sub: user.id });
            this.logger.log(`JWT tokens generated successfully for user ${email}`);
            const crypto = require('crypto');
            const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
            this.refreshTokens.set(hash, { userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
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
        catch (error) {
            this.logger.error(`LOGIN ERROR for email ${loginDto?.email || 'unknown'}:`, error);
            throw new Error(`Login failed: ${error.message}`);
        }
    }
    async register(registerDto) {
        const { email, password, name } = registerDto;
        if (this.users.has(email)) {
            throw new Error('User already exists');
        }
        const newUser = {
            id: (this.nextUserId++).toString(),
            email,
            name,
            password,
            role: 'buyer',
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
        const token = Math.random().toString(36).substring(2);
        this.csrfTokens.set(userId, token);
        return token;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService, config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map