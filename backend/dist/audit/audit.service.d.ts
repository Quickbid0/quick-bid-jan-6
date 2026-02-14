import { PrismaService } from '../prisma/prisma.service';
export interface AuditLogEntry {
    id: string;
    timestamp: Date;
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    method: string;
    endpoint?: string;
    ipAddress?: string;
    userAgent?: string;
    statusCode?: number;
    responseTime?: number;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    metadata?: Record<string, any>;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'auth' | 'auction' | 'user' | 'admin' | 'payment' | 'system' | 'security';
}
export interface AuditQuery {
    userId?: string;
    action?: string;
    resource?: string;
    category?: AuditLogEntry['category'];
    severity?: AuditLogEntry['severity'];
    startDate?: Date;
    endDate?: Date;
    ipAddress?: string;
    limit?: number;
    offset?: number;
}
export interface AuditStats {
    totalLogs: number;
    logsByCategory: {
        category: string;
        count: number;
        percentage: number;
    }[];
    logsBySeverity: {
        severity: string;
        count: number;
        percentage: number;
    }[];
    recentActivity: AuditLogEntry[];
    suspiciousActivity: AuditLogEntry[];
    topActions: {
        action: string;
        count: number;
    }[];
    topUsers: {
        userId: string;
        count: number;
    }[];
}
export declare class AuditService {
    private prismaService;
    private readonly logger;
    private readonly logRetentionDays;
    private readonly maxLogsPerBatch;
    private auditLogs;
    private logsFilePath;
    constructor(prismaService: PrismaService);
    private initializeAuditLogging;
    logActivity(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<string>;
    logUserAction(userId: string, action: string, resource: string, resourceId: string, metadata?: Record<string, any>, oldValues?: Record<string, any>, newValues?: Record<string, any>): Promise<string>;
    logSystemAction(action: string, resource: string, resourceId?: string, metadata?: Record<string, any>): Promise<string>;
    logSecurityEvent(userId: string | undefined, action: string, ipAddress: string, userAgent: string, metadata?: Record<string, any>): Promise<string>;
    logApiRequest(userId: string | undefined, method: string, endpoint: string, statusCode: number, responseTime: number, ipAddress: string, userAgent: string, metadata?: Record<string, any>): Promise<string>;
    queryLogs(query: AuditQuery): Promise<{
        logs: AuditLogEntry[];
        total: number;
    }>;
    getAuditStats(startDate?: Date, endDate?: Date): Promise<AuditStats>;
    exportLogs(query: AuditQuery, format?: 'json' | 'csv'): Promise<string>;
    cleanupOldLogs(): Promise<{
        deletedCount: number;
    }>;
    generateComplianceReport(startDate: Date, endDate: Date): Promise<{
        period: {
            start: Date;
            end: Date;
        };
        summary: {
            totalEvents: number;
            securityEvents: number;
            dataModifications: number;
            adminActions: number;
        };
        violations: AuditLogEntry[];
        recommendations: string[];
    }>;
    private categorizeAction;
    private calculateSeverity;
    private calculateSecuritySeverity;
    private convertToCSV;
    private scheduleLogCleanup;
    getLogRetentionDays(): number;
    getTotalLogsCount(): number;
    getResourceLogs(resource: string, resourceId: string): Promise<AuditLogEntry[]>;
}
