import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

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
  logsByCategory: { category: string; count: number; percentage: number }[];
  logsBySeverity: { severity: string; count: number; percentage: number }[];
  recentActivity: AuditLogEntry[];
  suspiciousActivity: AuditLogEntry[];
  topActions: { action: string; count: number }[];
  topUsers: { userId: string; count: number }[];
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private readonly logRetentionDays = 90; // Keep logs for 90 days
  private readonly maxLogsPerBatch = 1000;

  // In-memory storage for logs (in production, use database or log aggregation service)
  private auditLogs: AuditLogEntry[] = [];
  private logsFilePath: string;

  constructor(
    private prismaService: PrismaService,
  ) {
    this.logsFilePath = path.join(process.cwd(), 'logs', 'audit.log');
    this.initializeAuditLogging();
  }

  private initializeAuditLogging() {
    // Create logs directory if it doesn't exist
    const logsDir = path.dirname(this.logsFilePath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Load existing logs if file exists
    if (fs.existsSync(this.logsFilePath)) {
      try {
        const logsData = fs.readFileSync(this.logsFilePath, 'utf8');
        const parsedLogs = JSON.parse(logsData);
        this.auditLogs = parsedLogs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }));
        this.logger.log(`Loaded ${this.auditLogs.length} audit logs from file`);
      } catch (error) {
        this.logger.error('Failed to load audit logs from file:', error);
      }
    }

    // Schedule log cleanup
    this.scheduleLogCleanup();

    this.logger.log('Audit logging service initialized');
  }

  async logActivity(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<string> {
    const auditEntry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...entry,
    };

    // Add to in-memory storage
    this.auditLogs.push(auditEntry);

    // Keep only recent logs in memory (last 10000 entries)
    if (this.auditLogs.length > 10000) {
      this.auditLogs = this.auditLogs.slice(-10000);
    }

    // Write to file (append mode)
    try {
      const logLine = JSON.stringify(auditEntry) + '\n';
      fs.appendFileSync(this.logsFilePath, logLine);
    } catch (error) {
      this.logger.error('Failed to write audit log to file:', error);
    }

    // Log high-severity events
    if (entry.severity === 'high' || entry.severity === 'critical') {
      this.logger.warn(`HIGH SEVERITY AUDIT EVENT: ${entry.action} by user ${entry.userId || 'system'}`);
    }

    // Emit event for real-time monitoring
    if (global.eventEmitter) {
      global.eventEmitter.emit('audit.log', auditEntry);
    }

    return auditEntry.id;
  }

  async logUserAction(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    metadata?: Record<string, any>,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>
  ): Promise<string> {
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

  async logSystemAction(
    action: string,
    resource: string,
    resourceId?: string,
    metadata?: Record<string, any>
  ): Promise<string> {
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

  async logSecurityEvent(
    userId: string | undefined,
    action: string,
    ipAddress: string,
    userAgent: string,
    metadata?: Record<string, any>
  ): Promise<string> {
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

  async logApiRequest(
    userId: string | undefined,
    method: string,
    endpoint: string,
    statusCode: number,
    responseTime: number,
    ipAddress: string,
    userAgent: string,
    metadata?: Record<string, any>
  ): Promise<string> {
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

  async queryLogs(query: AuditQuery): Promise<{ logs: AuditLogEntry[]; total: number }> {
    let filteredLogs = [...this.auditLogs];

    // Apply filters
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
      filteredLogs = filteredLogs.filter(log => log.timestamp >= query.startDate!);
    }

    if (query.endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= query.endDate!);
    }

    if (query.ipAddress) {
      filteredLogs = filteredLogs.filter(log => log.ipAddress === query.ipAddress);
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const total = filteredLogs.length;
    const logs = filteredLogs.slice(query.offset || 0, (query.offset || 0) + (query.limit || 100));

    return { logs, total };
  }

  async getAuditStats(
    startDate?: Date,
    endDate?: Date
  ): Promise<AuditStats> {
    let logsToAnalyze = this.auditLogs;

    // Filter by date range
    if (startDate || endDate) {
      logsToAnalyze = logsToAnalyze.filter(log => {
        if (startDate && log.timestamp < startDate) return false;
        if (endDate && log.timestamp > endDate) return false;
        return true;
      });
    }

    const totalLogs = logsToAnalyze.length;

    // Logs by category
    const categoryCounts = new Map<string, number>();
    logsToAnalyze.forEach(log => {
      categoryCounts.set(log.category, (categoryCounts.get(log.category) || 0) + 1);
    });

    const logsByCategory = Array.from(categoryCounts.entries()).map(([category, count]) => ({
      category,
      count,
      percentage: totalLogs > 0 ? (count / totalLogs) * 100 : 0,
    }));

    // Logs by severity
    const severityCounts = new Map<string, number>();
    logsToAnalyze.forEach(log => {
      severityCounts.set(log.severity, (severityCounts.get(log.severity) || 0) + 1);
    });

    const logsBySeverity = Array.from(severityCounts.entries()).map(([severity, count]) => ({
      severity,
      count,
      percentage: totalLogs > 0 ? (count / totalLogs) * 100 : 0,
    }));

    // Recent activity (last 50 entries)
    const recentActivity = logsToAnalyze
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 50);

    // Suspicious activity (high/critical severity in last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const suspiciousActivity = logsToAnalyze
      .filter(log =>
        (log.severity === 'high' || log.severity === 'critical') &&
        log.timestamp >= oneDayAgo
      )
      .slice(0, 20);

    // Top actions
    const actionCounts = new Map<string, number>();
    logsToAnalyze.forEach(log => {
      actionCounts.set(log.action, (actionCounts.get(log.action) || 0) + 1);
    });

    const topActions = Array.from(actionCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([action, count]) => ({ action, count }));

    // Top users
    const userCounts = new Map<string, number>();
    logsToAnalyze.forEach(log => {
      if (log.userId) {
        userCounts.set(log.userId, (userCounts.get(log.userId) || 0) + 1);
      }
    });

    const topUsers = Array.from(userCounts.entries())
      .sort(([,a], [,b]) => b - a)
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

  async exportLogs(
    query: AuditQuery,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    const { logs } = await this.queryLogs({ ...query, limit: 10000 }); // Export up to 10k logs

    if (format === 'csv') {
      return this.convertToCSV(logs);
    }

    return JSON.stringify(logs, null, 2);
  }

  async cleanupOldLogs(): Promise<{ deletedCount: number }> {
    const cutoffDate = new Date(Date.now() - this.logRetentionDays * 24 * 60 * 60 * 1000);

    const initialCount = this.auditLogs.length;
    this.auditLogs = this.auditLogs.filter(log => log.timestamp >= cutoffDate);

    const deletedCount = initialCount - this.auditLogs.length;

    // Rewrite the log file with only recent logs
    try {
      const recentLogsData = this.auditLogs.map(log => JSON.stringify(log)).join('\n') + '\n';
      fs.writeFileSync(this.logsFilePath, recentLogsData);
    } catch (error) {
      this.logger.error('Failed to cleanup audit log file:', error);
    }

    this.logger.log(`Cleaned up ${deletedCount} old audit logs`);
    return { deletedCount };
  }

  // Compliance and reporting methods
  async generateComplianceReport(
    startDate: Date,
    endDate: Date
  ): Promise<{
    period: { start: Date; end: Date };
    summary: {
      totalEvents: number;
      securityEvents: number;
      dataModifications: number;
      adminActions: number;
    };
    violations: AuditLogEntry[];
    recommendations: string[];
  }> {
    const logs = this.auditLogs.filter(log =>
      log.timestamp >= startDate && log.timestamp <= endDate
    );

    const securityEvents = logs.filter(log => log.category === 'security');
    const dataModifications = logs.filter(log =>
      ['user', 'auction', 'admin'].includes(log.category) &&
      ['create', 'update', 'delete'].some(action => log.action.includes(action))
    );
    const adminActions = logs.filter(log => log.category === 'admin');

    // Find potential violations
    const violations = logs.filter(log =>
      log.severity === 'high' || log.severity === 'critical' ||
      (log.category === 'security' && log.action.includes('failed'))
    );

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

  // Private helper methods
  private categorizeAction(action: string): AuditLogEntry['category'] {
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

  private calculateSeverity(action: string, metadata?: Record<string, any>): AuditLogEntry['severity'] {
    // High severity actions
    if (action.includes('delete') && action.includes('user')) return 'high';
    if (action.includes('suspend') || action.includes('ban')) return 'high';
    if (action.includes('admin') && action.includes('create')) return 'high';
    if (metadata?.suspicious === true) return 'high';

    // Medium severity actions
    if (action.includes('update') && action.includes('password')) return 'medium';
    if (action.includes('failed') && action.includes('login')) return 'medium';

    return 'low';
  }

  private calculateSecuritySeverity(action: string): AuditLogEntry['severity'] {
    if (action.includes('brute_force') || action.includes('sql_injection')) return 'critical';
    if (action.includes('unauthorized') || action.includes('suspicious')) return 'high';
    if (action.includes('failed') && action.includes('login')) return 'medium';
    return 'low';
  }

  private convertToCSV(logs: AuditLogEntry[]): string {
    if (logs.length === 0) return '';

    const headers = Object.keys(logs[0]);
    const csvRows = [
      headers.join(','),
      ...logs.map(log =>
        headers.map(header => {
          const value = (log as any)[header];
          // Escape commas and quotes in values
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ];

    return csvRows.join('\n');
  }

  private scheduleLogCleanup(): void {
    // Clean up old logs daily
    setInterval(async () => {
      try {
        await this.cleanupOldLogs();
      } catch (error) {
        this.logger.error('Failed to cleanup old audit logs:', error);
      }
    }, 24 * 60 * 60 * 1000); // Daily cleanup
  }

  // Public methods for external access
  getLogRetentionDays(): number {
    return this.logRetentionDays;
  }

  getTotalLogsCount(): number {
    return this.auditLogs.length;
  }

  // Method to get logs for a specific resource (for compliance)
  async getResourceLogs(resource: string, resourceId: string): Promise<AuditLogEntry[]> {
    return this.auditLogs.filter(log =>
      log.resource === resource && log.resourceId === resourceId
    ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}
