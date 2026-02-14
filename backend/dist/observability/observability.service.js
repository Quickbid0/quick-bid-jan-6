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
var ObservabilityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservabilityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ObservabilityService = ObservabilityService_1 = class ObservabilityService {
    constructor(prismaService) {
        this.prismaService = prismaService;
        this.logger = new common_1.Logger(ObservabilityService_1.name);
        this.metrics = {
            loginSuccess: 0,
            loginFailure: 0,
            accountLocks: 0,
            tokenRefreshFailures: 0,
            adminActions: 0,
        };
    }
    generateCorrelationId() {
        return `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    incrementLoginSuccess() {
        this.metrics.loginSuccess++;
        this.logger.log(`📊 METRICS: Login success count: ${this.metrics.loginSuccess}`);
    }
    incrementLoginFailure() {
        this.metrics.loginFailure++;
        this.logger.log(`📊 METRICS: Login failure count: ${this.metrics.loginFailure}`);
    }
    incrementAccountLock() {
        this.metrics.accountLocks++;
        this.logger.log(`📊 METRICS: Account lock count: ${this.metrics.accountLocks}`);
    }
    incrementTokenRefreshFailure() {
        this.metrics.tokenRefreshFailures++;
        this.logger.log(`📊 METRICS: Token refresh failure count: ${this.metrics.tokenRefreshFailures}`);
    }
    incrementAdminAction() {
        this.metrics.adminActions++;
        this.logger.log(`📊 METRICS: Admin action count: ${this.metrics.adminActions}`);
    }
    getMetrics() {
        return { ...this.metrics };
    }
    async createAuditLog(entry) {
        try {
            const auditLog = {
                ...entry,
                id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date(),
            };
            await this.prismaService.auditLog.create({
                data: {
                    userId: auditLog.userId,
                    action: auditLog.action,
                    resource: auditLog.resource,
                    ipAddress: auditLog.ipAddress,
                    userAgent: auditLog.userAgent,
                    details: auditLog.details,
                    createdAt: auditLog.timestamp,
                }
            });
            this.logStructured(auditLog);
        }
        catch (error) {
            this.logger.error('Failed to create audit log:', error);
        }
    }
    logStructured(entry) {
        const logEntry = {
            timestamp: entry.timestamp.toISOString(),
            level: entry.severity.toUpperCase(),
            correlationId: entry.correlationId,
            action: entry.action,
            resource: entry.resource,
            userId: entry.userId || 'anonymous',
            ipAddress: entry.ipAddress || 'unknown',
            userAgent: entry.userAgent || 'unknown',
            details: entry.details || {},
        };
        this.logger.log(JSON.stringify(logEntry));
    }
    async getAuditLogs(options = {}) {
        const { page = 1, limit = 50, action, userId, startDate, endDate, severity } = options;
        const where = {};
        if (action) {
            where.action = { contains: action, mode: 'insensitive' };
        }
        if (userId) {
            where.userId = userId;
        }
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = startDate;
            }
            if (endDate) {
                where.createdAt.lte = endDate;
            }
        }
        const [logs, total] = await Promise.all([
            this.prismaService.auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true,
                    userId: true,
                    action: true,
                    resource: true,
                    ipAddress: true,
                    userAgent: true,
                    details: true,
                    createdAt: true,
                }
            }),
            this.prismaService.auditLog.count({ where })
        ]);
        const auditLogs = logs.map(log => ({
            id: log.id,
            userId: log.userId,
            action: log.action,
            resource: log.resource,
            ipAddress: log.ipAddress,
            userAgent: log.userAgent,
            details: log.details,
            correlationId: log.details?.correlationId || 'unknown',
            timestamp: log.createdAt,
            severity: (log.details?.severity || 'info'),
        }));
        return { logs: auditLogs, total };
    }
    async getMetricsSummary(timeRange = 'day') {
        const now = new Date();
        let startDate;
        switch (timeRange) {
            case 'hour':
                startDate = new Date(now.getTime() - 60 * 60 * 1000);
                break;
            case 'day':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
        }
        const [loginSuccess, loginFailure, accountLocks, tokenRefreshFailures, adminActions] = await Promise.all([
            this.prismaService.auditLog.count({
                where: {
                    action: 'LOGIN_SUCCESS',
                    createdAt: { gte: startDate }
                }
            }),
            this.prismaService.auditLog.count({
                where: {
                    action: 'LOGIN_FAILURE',
                    createdAt: { gte: startDate }
                }
            }),
            this.prismaService.auditLog.count({
                where: {
                    action: 'ACCOUNT_LOCK',
                    createdAt: { gte: startDate }
                }
            }),
            this.prismaService.auditLog.count({
                where: {
                    action: 'TOKEN_REFRESH_FAILURE',
                    createdAt: { gte: startDate }
                }
            }),
            this.prismaService.auditLog.count({
                where: {
                    action: { startsWith: 'ADMIN_' },
                    createdAt: { gte: startDate }
                }
            })
        ]);
        return {
            loginSuccess,
            loginFailure,
            accountLocks,
            tokenRefreshFailures,
            adminActions,
            timeRange,
            timestamp: now,
        };
    }
    exportMetrics() {
        return JSON.stringify({
            timestamp: new Date().toISOString(),
            metrics: this.metrics,
            service: 'quickbid-auth',
            version: '1.0.0'
        });
    }
};
exports.ObservabilityService = ObservabilityService;
exports.ObservabilityService = ObservabilityService = ObservabilityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ObservabilityService);
//# sourceMappingURL=observability.service.js.map