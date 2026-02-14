import { PrismaService } from '../prisma/prisma.service';
export interface SystemMetrics {
    timestamp: Date;
    cpu: {
        usage: number;
        loadAverage: number[];
        cores: number;
    };
    memory: {
        used: number;
        total: number;
        usage: number;
        heapUsed: number;
        heapTotal: number;
        external: number;
    };
    disk: {
        used: number;
        total: number;
        usage: number;
    };
    network: {
        connections: number;
        bytesReceived: number;
        bytesSent: number;
    };
}
export interface ApplicationMetrics {
    timestamp: Date;
    responseTime: {
        average: number;
        p95: number;
        p99: number;
    };
    throughput: {
        requestsPerSecond: number;
        totalRequests: number;
        activeConnections: number;
    };
    errorRate: {
        totalErrors: number;
        errorRate: number;
        errorsByType: Record<string, number>;
    };
    database: {
        connectionPool: {
            used: number;
            available: number;
            pending: number;
        };
        queryPerformance: {
            slowQueries: number;
            averageQueryTime: number;
        };
    };
    cache: {
        hitRate: number;
        missRate: number;
        size: number;
    };
}
export interface PerformanceAlert {
    id: string;
    type: 'cpu' | 'memory' | 'disk' | 'response_time' | 'error_rate' | 'database';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    value: number;
    threshold: number;
    timestamp: Date;
    resolved: boolean;
    resolvedAt?: Date;
}
export interface MonitoringConfig {
    enabled: boolean;
    collectionInterval: number;
    retentionPeriod: number;
    alerts: {
        cpuThreshold: number;
        memoryThreshold: number;
        diskThreshold: number;
        responseTimeThreshold: number;
        errorRateThreshold: number;
    };
}
export declare class PerformanceMonitoringService {
    private prismaService;
    private readonly logger;
    private config;
    private metrics;
    private appMetrics;
    private alerts;
    private lastCpuUsage;
    private requestCount;
    private errorCount;
    private responseTimes;
    private monitoringInterval;
    constructor(prismaService: PrismaService);
    private initializeMonitoring;
    onModuleDestroy(): void;
    private collectSystemMetrics;
    private collectApplicationMetrics;
    private checkThresholds;
    private createAlert;
    private setupRequestMonitoring;
    recordRequest(responseTime: number, statusCode: number): void;
    getSystemMetrics(hours?: number): Promise<SystemMetrics[]>;
    getApplicationMetrics(hours?: number): Promise<ApplicationMetrics[]>;
    getCurrentHealth(): Promise<{
        status: 'healthy' | 'warning' | 'critical';
        uptime: number;
        metrics: {
            system: SystemMetrics;
            application: ApplicationMetrics;
        };
        alerts: PerformanceAlert[];
    }>;
    resolveAlert(alertId: string): Promise<boolean>;
    getPerformanceReport(timeRange: {
        start: Date;
        end: Date;
    }): Promise<{
        summary: {
            averageResponseTime: number;
            averageCpuUsage: number;
            averageMemoryUsage: number;
            totalRequests: number;
            totalErrors: number;
            uptimePercentage: number;
        };
        trends: {
            responseTime: {
                timestamp: Date;
                value: number;
            }[];
            cpuUsage: {
                timestamp: Date;
                value: number;
            }[];
            memoryUsage: {
                timestamp: Date;
                value: number;
            }[];
            requestRate: {
                timestamp: Date;
                value: number;
            }[];
        };
        bottlenecks: string[];
        recommendations: string[];
    }>;
    updateConfig(newConfig: Partial<MonitoringConfig>): void;
    getConfig(): MonitoringConfig;
    private cleanupOldMetrics;
    exportMetrics(format?: 'json' | 'prometheus'): Promise<string>;
    private convertToPrometheusFormat;
}
