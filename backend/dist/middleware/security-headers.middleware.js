"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityHeadersMiddleware = void 0;
exports.SecurityHeaders = SecurityHeaders;
const common_1 = require("@nestjs/common");
let SecurityHeadersMiddleware = class SecurityHeadersMiddleware {
    constructor() {
        this.isProduction = process.env.NODE_ENV === 'production';
    }
    getSecurityHeaders() {
        const headers = {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': this.getPermissionsPolicy(),
        };
        if (this.isProduction) {
            headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
            headers['Content-Security-Policy'] = this.getContentSecurityPolicy();
        }
        return headers;
    }
    getContentSecurityPolicy() {
        const directives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google-analytics.com https://www.googletagmanager.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: https: blob:",
            "font-src 'self' data: https://fonts.gstatic.com",
            "connect-src 'self' https://api.quickbid.com https://quickbid.com https://www.google-analytics.com",
            "media-src 'self' https:",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "upgrade-insecure-requests",
        ];
        return directives.join('; ');
    }
    getPermissionsPolicy() {
        const policies = [
            'geolocation=()',
            'microphone=()',
            'camera=()',
            'payment=()',
            'usb=()',
            'magnetometer=()',
            'gyroscope=()',
            'accelerometer=()',
            'ambient-light-sensor=()',
            'autoplay=(self)',
            'encrypted-media=(self)',
            'fullscreen=(self)',
            'picture-in-picture=(self)',
        ];
        return policies.join(', ');
    }
    getCacheHeaders() {
        return {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store',
        };
    }
    getApiHeaders() {
        return {
            'X-API-Version': '1.0.0',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Expose-Headers': 'X-Total-Count, X-Page-Count, X-Current-Page, X-Per-Page',
        };
    }
    use(req, res, next) {
        const path = req.path;
        const isApiRequest = path.startsWith('/api/') || path.startsWith('/admin/');
        const isStaticRequest = path.startsWith('/assets/') || path.startsWith('/images/');
        const securityHeaders = this.getSecurityHeaders();
        Object.entries(securityHeaders).forEach(([key, value]) => {
            res.setHeader(key, value);
        });
        if (isApiRequest) {
            const apiHeaders = this.getApiHeaders();
            Object.entries(apiHeaders).forEach(([key, value]) => {
                res.setHeader(key, value);
            });
        }
        if (path.includes('/auth/') || path.includes('/admin/') || path.includes('/profile/')) {
            const cacheHeaders = this.getCacheHeaders();
            Object.entries(cacheHeaders).forEach(([key, value]) => {
                res.setHeader(key, value);
            });
        }
        if (isStaticRequest) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            res.setHeader('ETag', 'W/"' + Date.now() + '"');
        }
        res.setHeader('X-Request-ID', this.generateRequestId());
        res.setHeader('X-Response-Time', Date.now().toString());
        next();
    }
    generateRequestId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
};
exports.SecurityHeadersMiddleware = SecurityHeadersMiddleware;
exports.SecurityHeadersMiddleware = SecurityHeadersMiddleware = __decorate([
    (0, common_1.Injectable)()
], SecurityHeadersMiddleware);
function SecurityHeaders(options) {
    return (target, propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            const req = args[0];
            const res = args[1];
            if (options?.csp) {
                res.setHeader('Content-Security-Policy', options.csp);
            }
            if (options?.hsts) {
                res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
            }
            if (options?.frameOptions) {
                res.setHeader('X-Frame-Options', options.frameOptions);
            }
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}
//# sourceMappingURL=security-headers.middleware.js.map