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
var AuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fs = require("fs");
const path = require("path");
let AuditService = AuditService_1 = class AuditService {
    constructor(prismaService) {
        this.prismaService = prismaService;
        this.logger = new common_1.Logger(AuditService_1.name);
        this.logRetentionDays = 90;
        this.maxLogsPerBatch = 1000;
        this.auditLogs = [];
        this.logsFilePath = path.join(process.cwd(), 'logs', 'audit.log');
        this.initializeAuditLogging();
    }
    initializeAuditLogging() {
        const logsDir = path.dirname(this.logsFilePath);
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
        if (fs.existsSync(this.logsFilePath)) {
            try {
                const logsData = fs.readFileSync(this.logsFilePath, 'utf8');
                const parsedLogs = JSON.parse(logsData);
                this.auditLogs = parsedLogs.map((log) => ({
                    ...log,
                    timestamp: new Date(log.timestamp),
                }));
                this.logger.log(`Loaded ${this.auditLogs.length} audit logs from file`);
            }
            catch (error) {
                this.logger.error('Failed to load audit logs from file:', error);
            }
        }
        this.scheduleLogCleanup();
        this.logger.log('Audit logging service initialized');
    }
    async logActivity(entry) {
        const auditEntry = {
            id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            ...entry,
        };
        this.auditLogs.push(auditEntry);
        if (this.auditLogs.length > 10000) {
            this.auditLogs = this.auditLogs.slice(-10000);
        }
        try {
            const logLine = JSON.stringify(auditEntry) + '\n';
            fs.appendFileSync(this.logsFilePath, logLine);
        }
        catch (error) {
            this.logger.error('Failed to write audit log to file:', error);
        }
        if (entry.severity === 'high' || entry.severity === 'critical') {
            this.logger.warn(`HIGH SEVERITY AUDIT EVENT: ${entry.action} by user ${entry.userId || 'system'}`);
        }
        if (global.eventEmitter) {
            global.eventEmitter.emit('audit.log', auditEntry);
        }
        return auditEntry.id;
    }
    async logUserAction(userId, action, resource, resourceId, metadata, oldValues, newValues) {
        return await this.logActivity({
            userId,
            action,
            resource,
            resourceId,
            category: this.categorizeAction(action),
            severity: this.calculateSeverity(action, metadata),
            method: 'INTERNAL',
            oldValues,
            newValues,
            metadata,
        });
    }
    async logSystemAction(action, resource, resourceId, metadata) {
        return await this.logActivity({
            action,
            resource,
            resourceId,
            category: 'system',
            severity: 'low',
            method: 'SYSTEM',
            metadata,
        });
    }
    async logSecurityEvent(userId, action, ipAddress, userAgent, metadata) {
        return await this.logActivity({
            userId,
            action,
            resource: 'security',
            category: 'security',
            severity: this.calculateSecuritySeverity(action),
            ipAddress,
            userAgent,
            method: 'SECURITY',
            metadata,
        });
    }
    async logApiRequest(userId, method, endpoint, statusCode, responseTime, ipAddress, userAgent, metadata) {
        return await this.logActivity({
            userId,
            action: `${method} ${endpoint}`,
            resource: 'api',
            method,
            endpoint,
            statusCode,
            responseTime,
            ipAddress,
            userAgent,
            category: 'system',
            severity: statusCode >= 400 ? 'medium' : 'low',
            metadata,
        });
    }
    async queryLogs(query) {
        let filteredLogs = [...this.auditLogs];
        if (query.userId) {
            filteredLogs = filteredLogs.filter(log => log.userId === query.userId);
        }
        if (query.action) {
            filteredLogs = filteredLogs.filter(log => log.action.includes(query.action));
        }
        if (query.resource) {
            filteredLogs = filteredLogs.filter(log => log.resource === query.resource);
        }
        if (query.category) {
            filteredLogs = filteredLogs.filter(log => log.category === query.category);
        }
        if (query.severity) {
            filteredLogs = filteredLogs.filter(log => log.severity === query.severity);
        }
        if (query.startDate) {
            filteredLogs = filteredLogs.filter(log => log.timestamp >= query.startDate);
        }
        if (query.endDate) {
            filteredLogs = filteredLogs.filter(log => log.timestamp <= query.endDate);
        }
        if (query.ipAddress) {
            filteredLogs = filteredLogs.filter(log => log.ipAddress === query.ipAddress);
        }
        filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        const total = filteredLogs.length;
        const logs = filteredLogs.slice(query.offset || 0, (query.offset || 0) + (query.limit || 100));
        return { logs, total };
    }
    async getAuditStats(startDate, endDate) {
        let logsToAnalyze = this.auditLogs;
        if (startDate || endDate) {
            logsToAnalyze = logsToAnalyze.filter(log => {
                if (startDate && log.timestamp < startDate)
                    return false;
                if (endDate && log.timestamp > endDate)
                    return false;
                return true;
            });
        }
        const totalLogs = logsToAnalyze.length;
        const categoryCounts = new Map();
        logsToAnalyze.forEach(log => {
            categoryCounts.set(log.category, (categoryCounts.get(log.category) || 0) + 1);
        });
        const logsByCategory = Array.from(categoryCounts.entries()).map(([category, count]) => ({
            category,
            count,
            percentage: totalLogs > 0 ? (count / totalLogs) * 100 : 0,
        }));
        const severityCounts = new Map();
        logsToAnalyze.forEach(log => {
            severityCounts.set(log.severity, (severityCounts.get(log.severity) || 0) + 1);
        });
        const logsBySeverity = Array.from(severityCounts.entries()).map(([severity, count]) => ({
            severity,
            count,
            percentage: totalLogs > 0 ? (count / totalLogs) * 100 : 0,
        }));
        const recentActivity = logsToAnalyze
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 50);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const suspiciousActivity = logsToAnalyze
            .filter(log => (log.severity === 'high' || log.severity === 'critical') &&
            log.timestamp >= oneDayAgo)
            .slice(0, 20);
        const actionCounts = new Map();
        logsToAnalyze.forEach(log => {
            actionCounts.set(log.action, (actionCounts.get(log.action) || 0) + 1);
        });
        const topActions = Array.from(actionCounts.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([action, count]) => ({ action, count }));
        const userCounts = new Map();
        logsToAnalyze.forEach(log => {
            if (log.userId) {
                userCounts.set(log.userId, (userCounts.get(log.userId) || 0) + 1);
            }
        });
        const topUsers = Array.from(userCounts.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([userId, count]) => ({ userId, count }));
        return {
            totalLogs,
            logsByCategory,
            logsBySeverity,
            recentActivity,
            suspiciousActivity,
            topActions,
            topUsers,
        };
    }
    async exportLogs(query, format = 'json') {
        const { logs } = await this.queryLogs({ ...query, limit: 10000 });
        if (format === 'csv') {
            return this.convertToCSV(logs);
        }
        return JSON.stringify(logs, null, 2);
    }
    async cleanupOldLogs() {
        const cutoffDate = new Date(Date.now() - this.logRetentionDays * 24 * 60 * 60 * 1000);
        const initialCount = this.auditLogs.length;
        this.auditLogs = this.auditLogs.filter(log => log.timestamp >= cutoffDate);
        const deletedCount = initialCount - this.auditLogs.length;
        try {
            const recentLogsData = this.auditLogs.map(log => JSON.stringify(log)).join('\n') + '\n';
            fs.writeFileSync(this.logsFilePath, recentLogsData);
        }
        catch (error) {
            this.logger.error('Failed to cleanup audit log file:', error);
        }
        this.logger.log(`Cleaned up ${deletedCount} old audit logs`);
        return { deletedCount };
    }
    async generateComplianceReport(startDate, endDate) {
        const logs = this.auditLogs.filter(log => log.timestamp >= startDate && log.timestamp <= endDate);
        const securityEvents = logs.filter(log => log.category === 'security');
        const dataModifications = logs.filter(log => ['user', 'auction', 'admin'].includes(log.category) &&
            ['create', 'update', 'delete'].some(action => log.action.includes(action)));
        const adminActions = logs.filter(log => log.category === 'admin');
        const violations = logs.filter(log => log.severity === 'high' || log.severity === 'critical' ||
            (log.category === 'security' && log.action.includes('failed')));
        const recommendations = [];
        if (securityEvents.length > logs.length * 0.1) {
            recommendations.push('High security event rate detected - review security measures');
        }
        if (violations.length > 10) {
            recommendations.push('Multiple violations detected - conduct security audit');
        }
        return {
            period: { start: startDate, end: endDate },
            summary: {
                totalEvents: logs.length,
                securityEvents: securityEvents.length,
                dataModifications: dataModifications.length,
                adminActions: adminActions.length,
            },
            violations,
            recommendations,
        };
    }
    categorizeAction(action) {
        if (action.includes('login') || action.includes('logout') || action.includes('password')) {
            return 'auth';
        }
        if (action.includes('bid') || action.includes('auction')) {
            return 'auction';
        }
        if (action.includes('user') || action.includes('profile')) {
            return 'user';
        }
        if (action.includes('admin') || action.includes('moderator')) {
            return 'admin';
        }
        if (action.includes('payment') || action.includes('transaction')) {
            return 'payment';
        }
        return 'system';
    }
    calculateSeverity(action, metadata) {
        if (action.includes('delete') && action.includes('user'))
            return 'high';
        if (action.includes('suspend') || action.includes('ban'))
            return 'high';
        if (action.includes('admin') && action.includes('create'))
            return 'high';
        if (metadata?.suspicious === true)
            return 'high';
        if (action.includes('update') && action.includes('password'))
            return 'medium';
        if (action.includes('failed') && action.includes('login'))
            return 'medium';
        return 'low';
    }
    calculateSecuritySeverity(action) {
        if (action.includes('brute_force') || action.includes('sql_injection'))
            return 'critical';
        if (action.includes('unauthorized') || action.includes('suspicious'))
            return 'high';
        if (action.includes('failed') && action.includes('login'))
            return 'medium';
        return 'low';
    }
    convertToCSV(logs) {
        if (logs.length === 0)
            return '';
        const headers = Object.keys(logs[0]);
        const csvRows = [
            headers.join(','),
            ...logs.map(log => headers.map(header => {
                const value = log[header];
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(','))
        ];
        return csvRows.join('\n');
    }
    scheduleLogCleanup() {
        setInterval(async () => {
            try {
                await this.cleanupOldLogs();
            }
            catch (error) {
                this.logger.error('Failed to cleanup old audit logs:', error);
            }
        }, 24 * 60 * 60 * 1000);
    }
    getLogRetentionDays() {
        return this.logRetentionDays;
    }
    getTotalLogsCount() {
        return this.auditLogs.length;
    }
    async getResourceLogs(resource, resourceId) {
        return this.auditLogs.filter(log => log.resource === resource && log.resourceId === resourceId).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = AuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map