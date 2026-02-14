import { ObservabilityService } from './observability.service';
export declare class ObservabilityController {
    private readonly observabilityService;
    constructor(observabilityService: ObservabilityService);
    getMetrics(timeRange?: 'hour' | 'day' | 'week' | 'month'): Promise<import("./observability.service").AuthMetrics & {
        timeRange: string;
        timestamp: Date;
    }>;
    exportMetrics(): {
        data: string;
        contentType: string;
        filename: string;
    };
    getAuditLogs(page?: string, limit?: string, action?: string, userId?: string, startDate?: string, endDate?: string, severity?: string): Promise<{
        logs: import("./observability.service").AuditLogEntry[];
        total: number;
    }>;
}
