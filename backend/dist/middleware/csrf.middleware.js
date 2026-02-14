"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsrfMiddleware = void 0;
exports.RequireCsrf = RequireCsrf;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
let CsrfMiddleware = class CsrfMiddleware {
    constructor() {
        this.csrfTokens = new Map();
        this.tokenLength = 32;
        this.tokenExpiry = 60 * 60 * 1000;
    }
    generateToken() {
        return crypto.randomBytes(this.tokenLength).toString('hex');
    }
    getCsrfToken(req) {
        const token = req.headers['x-csrf-token'];
        return token || null;
    }
    setCsrfToken(req, res) {
        const sessionId = this.getSessionId(req);
        const now = Date.now();
        const existingToken = this.csrfTokens.get(sessionId);
        if (existingToken && existingToken.expires > now) {
            res.setHeader('X-CSRF-Token', existingToken.token);
            return;
        }
        const token = this.generateToken();
        const expires = now + this.tokenExpiry;
        this.csrfTokens.set(sessionId, { token, expires });
        res.setHeader('X-CSRF-Token', token);
        res.setHeader('X-CSRF-Expires', new Date(expires).toISOString());
    }
    getSessionId(req) {
        const sessionId = req.session?.id ||
            req.headers['x-session-id'] ||
            req.ip ||
            req.connection.remoteAddress;
        return sessionId;
    }
    validateCsrfToken(req) {
        const sessionId = this.getSessionId(req);
        const token = this.getCsrfToken(req);
        const storedToken = this.csrfTokens.get(sessionId);
        if (!token || !storedToken) {
            return false;
        }
        if (token !== storedToken.token) {
            return false;
        }
        if (Date.now() > storedToken.expires) {
            this.csrfTokens.delete(sessionId);
            return false;
        }
        return true;
    }
    isSafeMethod(method) {
        const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
        return safeMethods.includes(method.toUpperCase());
    }
    isApiRequest(req) {
        const path = req.path;
        return path.startsWith('/api/') || path.startsWith('/admin/');
    }
    isFormRequest(req) {
        const contentType = req.headers['content-type'] || '';
        return contentType.includes('application/x-www-form-urlencoded') ||
            contentType.includes('multipart/form-data');
    }
    use(req, res, next) {
        if (this.isSafeMethod(req.method)) {
            this.setCsrfToken(req, res);
            return next();
        }
        if (this.isApiRequest(req) && !this.isFormRequest(req)) {
            return next();
        }
        if (!this.validateCsrfToken(req)) {
            throw new common_1.HttpException('CSRF token validation failed. Please refresh the page and try again.', common_1.HttpStatus.FORBIDDEN);
        }
        this.setCsrfToken(req, res);
        next();
    }
};
exports.CsrfMiddleware = CsrfMiddleware;
exports.CsrfMiddleware = CsrfMiddleware = __decorate([
    (0, common_1.Injectable)()
], CsrfMiddleware);
function RequireCsrf() {
    return (target, propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            const req = args[0];
            const res = args[1];
            const csrfToken = req.headers['x-csrf-token'];
            const sessionId = req.session?.id || req.ip;
            if (!csrfToken) {
                throw new common_1.HttpException('CSRF token is required', common_1.HttpStatus.FORBIDDEN);
            }
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}
//# sourceMappingURL=csrf.middleware.js.map