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
exports.RateLimitingMiddleware = void 0;
const common_1 = require("@nestjs/common");
let RateLimitingMiddleware = class RateLimitingMiddleware {
    constructor() {
        this.store = {};
        this.options = {
            windowMs: 15 * 60 * 1000,
            maxRequests: 100,
            message: 'Too many requests, please try again later.',
            skipSuccessfulRequests: true,
        };
        setInterval(() => {
            const now = Date.now();
            Object.keys(this.store).forEach(key => {
                if (this.store[key].resetTime < now) {
                    delete this.store[key];
                }
            });
        }, 60 * 1000);
    }
    configure(options) {
        this.options = { ...this.options, ...options };
    }
    getKey(request) {
        const ip = request.ip || request.connection.remoteAddress;
        const userAgent = request.get('user-agent') || 'unknown';
        return `${ip}:${userAgent}`;
    }
    isSuccessfulRequest(statusCode) {
        return this.options.skipSuccessfulRequests &&
            statusCode >= 200 && statusCode < 300;
    }
    async use(req, res, next) {
        const key = this.getKey(req);
        const now = Date.now();
        const windowStart = now - this.options.windowMs;
        if (!this.store[key]) {
            this.store[key] = {
                requests: 0,
                resetTime: now + this.options.windowMs,
            };
        }
        if (windowStart > this.store[key].resetTime) {
            this.store[key] = {
                requests: 0,
                resetTime: now + this.options.windowMs,
            };
        }
        if (!this.isSuccessfulRequest(res.statusCode)) {
            this.store[key].requests++;
        }
        if (this.store[key].requests >= this.options.maxRequests) {
            const resetTime = this.store[key].resetTime;
            const waitTime = Math.ceil((resetTime - now) / 1000);
            res.setHeader('Retry-After', `${waitTime}s`);
            res.setHeader('X-RateLimit-Limit', this.options.maxRequests.toString());
            res.setHeader('X-RateLimit-Remaining', '0');
            res.setHeader('X-RateLimit-Reset', new Date(resetTime).toISOString());
            throw new common_1.HttpException(this.options.message || 'Too many requests, please try again later.', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        res.setHeader('X-RateLimit-Limit', this.options.maxRequests.toString());
        res.setHeader('X-RateLimit-Remaining', Math.max(0, this.options.maxRequests - this.store[key].requests).toString());
        res.setHeader('X-RateLimit-Reset', new Date(this.store[key].resetTime).toISOString());
        next();
    }
};
exports.RateLimitingMiddleware = RateLimitingMiddleware;
exports.RateLimitingMiddleware = RateLimitingMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RateLimitingMiddleware);
//# sourceMappingURL=rate-limiting.middleware.js.map