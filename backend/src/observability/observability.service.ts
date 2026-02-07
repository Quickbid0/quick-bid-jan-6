import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class ObservabilityService {
  private readonly logger = new Logger(ObservabilityService.name);
  private metrics: AuthMetrics = {
    loginSuccess: 0,
    loginFailure: 0,
    accountLocks: 0,
    tokenRefreshFailures: 0,
    adminActions: 0,
  };

  constructor(private prismaService: PrismaService) {}

  // Generate correlation ID for request tracking
  generateCorrelationId(): string {
    return `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Increment metrics
  incrementLoginSuccess(): void {
    this.metrics.loginSuccess++;
    this.logger.log(`📊 METRICS: Login success count: ${this.metrics.loginSuccess}`);
  }

  incrementLoginFailure(): void {
    this.metrics.loginFailure++;
    this.logger.log(`📊 METRICS: Login failure count: ${this.metrics.loginFailure}`);
  }

  incrementAccountLock(): void {
    this.metrics.accountLocks++;
    this.logger.log(`📊 METRICS: Account lock count: ${this.metrics.accountLocks}`);
  }

  incrementTokenRefreshFailure(): void {
    this.metrics.tokenRefreshFailures++;
    this.logger.log(`📊 METRICS: Token refresh failure count: ${this.metrics.tokenRefreshFailures}`);
  }

  incrementAdminAction(): void {
    this.metrics.adminActions++;
    this.logger.log(`📊 METRICS: Admin action count: ${this.metrics.adminActions}`);
  }

  // Get current metrics
  getMetrics(): AuthMetrics {
    return { ...this.metrics };
  }

  // Create structured audit log entry
  async createAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    try {
      const auditLog = {
        ...entry,
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      };

      // Store in database
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

      // Log to console (structured)
      this.logStructured(auditLog);
    } catch (error) {
      this.logger.error('Failed to create audit log:', error);
    }
  }

  // Structured logging
  private logStructured(entry: AuditLogEntry): void {
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

    // Log in structured format (ready for external log aggregation)
    this.logger.log(JSON.stringify(logEntry));
  }

  // Query audit logs for admin viewer
  async getAuditLogs(options: {
    page?: number;
    limit?: number;
    action?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    severity?: string;
  } = {}): Promise<{ logs: AuditLogEntry[], total: number }> {
    const {
      page = 1,
      limit = 50,
      action,
      userId,
      startDate,
      endDate,
      severity
    } = options;

    const where: any = {};

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

    // Transform to audit log entries
    const auditLogs: AuditLogEntry[] = logs.map(log => ({
      id: log.id,
      userId: log.userId,
      action: log.action,
      resource: log.resource,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      details: log.details,
      correlationId: (log.details as any)?.correlationId || 'unknown',
      timestamp: log.createdAt,
      severity: ((log.details as any)?.severity || 'info') as 'info' | 'warning' | 'error' | 'critical',
    }));

    return { logs: auditLogs, total };
  }

  // Get metrics summary for admin dashboard
  async getMetricsSummary(timeRange: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<AuthMetrics & {
    timeRange: string;
    timestamp: Date;
  }> {
    const now = new Date();
    let startDate: Date;

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

    // Calculate metrics from audit logs
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

  // Export metrics for external monitoring systems
  exportMetrics(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      service: 'quickbid-auth',
      version: '1.0.0'
    });
  }
}
