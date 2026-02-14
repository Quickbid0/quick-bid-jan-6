"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PerformanceInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceInterceptor = void 0;
exports.PerformanceMonitor = PerformanceMonitor;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let PerformanceInterceptor = PerformanceInterceptor_1 = class PerformanceInterceptor {
    constructor() {
        this.logger = new common_1.Logger(PerformanceInterceptor_1.name);
    }
    intercept(context, next) {
        const now = Date.now();
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        const url = request.url;
        const userAgent = request.get('user-agent') || 'unknown';
        return next.handle().pipe((0, operators_1.tap)(() => {
            const duration = Date.now() - now;
            if (duration > 1000) {
                this.logger.warn(`Slow request detected: ${method} ${url} - ${duration}ms`);
            }
            const response = context.switchToHttp().getResponse();
            response.setHeader('X-Response-Time', `${duration}ms`);
            response.setHeader('X-Request-ID', this.generateRequestId());
            this.logPerformanceMetrics({
                method,
                url,
                duration,
                userAgent,
                statusCode: response.statusCode,
                timestamp: new Date().toISOString(),
            });
        }));
    }
    generateRequestId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    logPerformanceMetrics(metrics) {
        if (process.env.NODE_ENV === 'production') {
            console.log('PERFORMANCE_METRICS:', JSON.stringify(metrics));
        }
    }
};
exports.PerformanceInterceptor = PerformanceInterceptor;
exports.PerformanceInterceptor = PerformanceInterceptor = PerformanceInterceptor_1 = __decorate([
    (0, common_1.Injectable)()
], PerformanceInterceptor);
function PerformanceMonitor(threshold) {
    return (target, propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            const start = Date.now();
            const result = await originalMethod.apply(this, args);
            const duration = Date.now() - start;
            if (threshold && duration > threshold) {
            }
            return result;
        };
        return descriptor;
    };
}
//# sourceMappingURL=performance.interceptor.js.map