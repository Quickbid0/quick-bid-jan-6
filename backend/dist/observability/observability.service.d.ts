import { PrismaService } from '../prisma/prisma.service';
export interface AuthMetrics {
    loginSuccess: number;
    loginFailure: number;
    accountLocks: number;
    tokenRefreshFailures: number;
    adminActions: number;
}
export interface AuditLogEntry {
    id: string;
    userId?: string;
    action: string;
    resource: string;
    ipAddress?: string;
    userAgent?: string;
    details?: any;
    correlationId: string;
    timestamp: Date;
    severity: 'info' | 'warning' | 'error' | 'critical';
}
export interface CorrelationContext {
    correlationId: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
}
export declare class ObservabilityService {
    private prismaService;
    private readonly logger;
    private metrics;
    constructor(prismaService: PrismaService);
    generateCorrelationId(): string;
    incrementLoginSuccess(): void;
    incrementLoginFailure(): void;
    incrementAccountLock(): void;
    incrementTokenRefreshFailure(): void;
    incrementAdminAction(): void;
    getMetrics(): AuthMetrics;
    createAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void>;
    private logStructured;
    getAuditLogs(options?: {
        page?: number;
        limit?: number;
        action?: string;
        userId?: string;
        startDate?: Date;
        endDate?: Date;
        severity?: string;
    }): Promise<{
        logs: AuditLogEntry[];
        total: number;
    }>;
    getMetricsSummary(timeRange?: 'hour' | 'day' | 'week' | 'month'): Promise<AuthMetrics & {
        timeRange: string;
        timestamp: Date;
    }>;
    exportMetrics(): string;
}
