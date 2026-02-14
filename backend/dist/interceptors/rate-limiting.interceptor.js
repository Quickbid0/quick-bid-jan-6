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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let RateLimitingInterceptor = class RateLimitingInterceptor {
    constructor() {
        this.store = {};
        this.configs = new Map();
        this.logger = new common_1.Logger('RateLimitingInterceptor');
        if (process.env.NODE_ENV === 'development') {
            this.configs.set('auth', {
                windowMs: 60 * 1000,
                maxRequests: 100,
                message: 'Auth rate limit exceeded. Please wait before trying again.',
            });
            this.configs.set('admin', {
                windowMs: 60 * 60 * 1000,
                maxRequests: 1000,
                message: 'Admin rate limit exceeded. Please contact support.',
            });
            this.configs.set('payment', {
                windowMs: 10 * 60 * 1000,
                maxRequests: 100,
                message: 'Payment rate limit exceeded. Please wait before trying again.',
            });
            this.configs.set('default', {
                windowMs: 15 * 60 * 1000,
                maxRequests: 1000,
                message: 'Too many requests, please try again later.',
            });
        }
        else {
            this.configs.set('auth', {
                windowMs: 5 * 60 * 1000,
                maxRequests: 5,
                message: 'Auth rate limit exceeded. Please wait before trying again.',
            });
            this.configs.set('admin', {
                windowMs: 60 * 60 * 1000,
                maxRequests: 50,
                message: 'Admin rate limit exceeded. Please contact support.',
            });
            this.configs.set('payment', {
                windowMs: 10 * 60 * 1000,
                maxRequests: 10,
                message: 'Payment rate limit exceeded. Please wait before trying again.',
            });
            this.configs.set('default', {
                windowMs: 15 * 60 * 1000,
                maxRequests: 100,
                message: 'Too many requests, please try again later.',
            });
        }
        setInterval(() => {
            const now = Date.now();
            Object.keys(this.store).forEach(key => {
                if (this.store[key].resetTime < now) {
                    delete this.store[key];
                }
            });
        }, 60 * 1000);
    }
    getConfig(context) {
        const request = context.switchToHttp().getRequest();
        const path = request.route?.path || request.path;
        if (path.includes('/auth')) {
            return this.configs.get('auth');
        }
        else if (path.includes('/admin')) {
            return this.configs.get('admin');
        }
        else if (path.includes('/payment')) {
            return this.configs.get('payment');
        }
        return this.configs.get('default');
    }
    getKey(context) {
        const request = context.switchToHttp().getRequest();
        const ip = request.ip || request.connection.remoteAddress;
        const userAgent = request.get('user-agent') || 'unknown';
        const path = request.route?.path || request.path;
        let key = `${ip}:${userAgent}:${path}`;
        if (path.includes('/auth/login') || path.includes('/auth/send-otp') || path.includes('/auth/verify-otp')) {
            const email = request.body?.email;
            if (email) {
                key += `:${email}`;
            }
        }
        return key;
    }
    intercept(context, next) {
        const config = this.getConfig(context);
        const key = this.getKey(context);
        const now = Date.now();
        const windowStart = now - config.windowMs;
        if (!this.store[key]) {
            this.store[key] = {
                requests: 0,
                resetTime: now + config.windowMs,
            };
        }
        if (windowStart > this.store[key].resetTime) {
            this.store[key] = {
                requests: 0,
                resetTime: now + config.windowMs,
            };
        }
        this.store[key].requests++;
        if (this.store[key].requests > config.maxRequests) {
            const resetTime = this.store[key].resetTime;
            const waitTime = Math.ceil((resetTime - now) / 1000);
            const req = context.switchToHttp().getRequest();
            this.logger.warn(`Rate limit breached: key=${key}, path=${req.path}, IP=${req.ip}, attempts=${this.store[key].requests}`);
            const response = context.switchToHttp().getResponse();
            response.setHeader('Retry-After', `${waitTime}s`);
            response.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
            response.setHeader('X-RateLimit-Remaining', '0');
            response.setHeader('X-RateLimit-Reset', new Date(resetTime).toISOString());
            throw new common_1.HttpException(config.message || 'Too many requests, please try again later.', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        const response = context.switchToHttp().getResponse();
        response.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
        response.setHeader('X-RateLimit-Remaining', Math.max(0, config.maxRequests - this.store[key].requests).toString());
        response.setHeader('X-RateLimit-Reset', new Date(this.store[key].resetTime).toISOString());
        return next.handle().pipe((0, operators_1.tap)(() => {
        }));
    }
};
exports.RateLimitingInterceptor = RateLimitingInterceptor;
exports.RateLimitingInterceptor = RateLimitingInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RateLimitingInterceptor);
//# sourceMappingURL=rate-limiting.interceptor.js.map