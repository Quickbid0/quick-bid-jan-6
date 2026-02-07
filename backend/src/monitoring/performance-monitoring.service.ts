import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as os from 'os';
import * as process from 'process';
import { performance } from 'perf_hooks';

export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number; // percentage
    loadAverage: number[];
    cores: number;
  };
  memory: {
    used: number; // bytes
    total: number; // bytes
    usage: number; // percentage
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  disk: {
    used: number; // bytes
    total: number; // bytes
    usage: number; // percentage
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
    average: number; // ms
    p95: number; // ms
    p99: number; // ms
  };
  throughput: {
    requestsPerSecond: number;
    totalRequests: number;
    activeConnections: number;
  };
  errorRate: {
    totalErrors: number;
    errorRate: number; // percentage
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
  collectionInterval: number; // seconds
  retentionPeriod: number; // days
  alerts: {
    cpuThreshold: number;
    memoryThreshold: number;
    diskThreshold: number;
    responseTimeThreshold: number;
    errorRateThreshold: number;
  };
}

@Injectable()
export class PerformanceMonitoringService {
  private readonly logger = new Logger(PerformanceMonitoringService.name);

  private config: MonitoringConfig = {
    enabled: true,
    collectionInterval: 60, // 1 minute
    retentionPeriod: 7, // 7 days
    alerts: {
      cpuThreshold: 80, // 80%
      memoryThreshold: 85, // 85%
      diskThreshold: 90, // 90%
      responseTimeThreshold: 1000, // 1 second
      errorRateThreshold: 5, // 5%
    },
  };

  private metrics: SystemMetrics[] = [];
  private appMetrics: ApplicationMetrics[] = [];
  private alerts: PerformanceAlert[] = [];

  private lastCpuUsage = process.cpuUsage();
  private requestCount = 0;
  private errorCount = 0;
  private responseTimes: number[] = [];
  private monitoringInterval: NodeJS.Timeout;

  constructor(
    private prismaService: PrismaService,
  ) {
    if (this.config.enabled) {
      this.initializeMonitoring();
    }
  }

  private initializeMonitoring() {
    // Start collecting metrics
    this.monitoringInterval = setInterval(() => {
      this.collectSystemMetrics();
      this.collectApplicationMetrics();
      this.checkThresholds();
      this.cleanupOldMetrics();
    }, this.config.collectionInterval * 1000);

    // Set up request/response monitoring
    this.setupRequestMonitoring();

    this.logger.log('Performance monitoring initialized');
  }

  onModuleDestroy() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }

  private async collectSystemMetrics(): Promise<void> {
    const timestamp = new Date();

    // CPU metrics
    const cpuUsage = process.cpuUsage(this.lastCpuUsage);
    this.lastCpuUsage = process.cpuUsage();

    const cpuUsagePercent = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to percentage
    const loadAverage = os.loadavg();

    // Memory metrics
    const memInfo = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = (usedMemory / totalMemory) * 100;

    // Disk metrics (simplified - would need fs.statvfs in production)
    const diskUsage = 65; // Mock percentage
    const totalDisk = 1000000000000; // 1TB mock
    const usedDisk = totalDisk * (diskUsage / 100);

    // Network metrics (simplified)
    const networkConnections = 150; // Mock
    const bytesReceived = 1000000; // Mock
    const bytesSent = 800000; // Mock

    const metrics: SystemMetrics = {
      timestamp,
      cpu: {
        usage: Math.min(100, cpuUsagePercent),
        loadAverage,
        cores: os.cpus().length,
      },
      memory: {
        used: usedMemory,
        total: totalMemory,
        usage: memoryUsagePercent,
        heapUsed: memInfo.heapUsed,
        heapTotal: memInfo.heapTotal,
        external: memInfo.external,
      },
      disk: {
        used: usedDisk,
        total: totalDisk,
        usage: diskUsage,
      },
      network: {
        connections: networkConnections,
        bytesReceived,
        bytesSent,
      },
    };

    this.metrics.push(metrics);

    // Keep only recent metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  private async collectApplicationMetrics(): Promise<void> {
    const timestamp = new Date();

    // Response time metrics
    const responseTimes = [...this.responseTimes];
    this.responseTimes = []; // Reset for next collection

    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    const sortedResponseTimes = responseTimes.sort((a, b) => a - b);
    const p95ResponseTime = sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.95)] || 0;
    const p99ResponseTime = sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.99)] || 0;

    // Throughput metrics
    const requestsPerSecond = this.requestCount / this.config.collectionInterval;
    const totalRequests = this.requestCount;
    const activeConnections = 25; // Mock - would come from connection tracking

    // Error rate metrics
    const errorRate = this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;
    const errorsByType = {
      '4xx': 5,
      '5xx': 2,
    }; // Mock

    // Database metrics (simplified)
    const dbMetrics = {
      connectionPool: {
        used: 5,
        available: 15,
        pending: 1,
      },
      queryPerformance: {
        slowQueries: 2,
        averageQueryTime: 45, // ms
      },
    };

    // Cache metrics (simplified)
    const cacheMetrics = {
      hitRate: 85, // percentage
      missRate: 15, // percentage
      size: 1024, // KB
    };

    const appMetrics: ApplicationMetrics = {
      timestamp,
      responseTime: {
        average: avgResponseTime,
        p95: p95ResponseTime,
        p99: p99ResponseTime,
      },
      throughput: {
        requestsPerSecond,
        totalRequests,
        activeConnections,
      },
      errorRate: {
        totalErrors: this.errorCount,
        errorRate,
        errorsByType,
      },
      database: dbMetrics,
      cache: cacheMetrics,
    };

    this.appMetrics.push(appMetrics);

    // Reset counters
    this.requestCount = 0;
    this.errorCount = 0;

    // Keep only recent metrics
    if (this.appMetrics.length > 1000) {
      this.appMetrics = this.appMetrics.slice(-1000);
    }
  }

  private checkThresholds(): void {
    const latestSystemMetrics = this.metrics[this.metrics.length - 1];
    const latestAppMetrics = this.appMetrics[this.appMetrics.length - 1];

    if (!latestSystemMetrics || !latestAppMetrics) return;

    // Check CPU threshold
    if (latestSystemMetrics.cpu.usage > this.config.alerts.cpuThreshold) {
      this.createAlert({
        type: 'cpu',
        severity: latestSystemMetrics.cpu.usage > 95 ? 'critical' : 'high',
        message: `CPU usage is ${latestSystemMetrics.cpu.usage.toFixed(1)}%`,
        value: latestSystemMetrics.cpu.usage,
        threshold: this.config.alerts.cpuThreshold,
      });
    }

    // Check memory threshold
    if (latestSystemMetrics.memory.usage > this.config.alerts.memoryThreshold) {
      this.createAlert({
        type: 'memory',
        severity: latestSystemMetrics.memory.usage > 95 ? 'critical' : 'high',
        message: `Memory usage is ${latestSystemMetrics.memory.usage.toFixed(1)}%`,
        value: latestSystemMetrics.memory.usage,
        threshold: this.config.alerts.memoryThreshold,
      });
    }

    // Check response time threshold
    if (latestAppMetrics.responseTime.average > this.config.alerts.responseTimeThreshold) {
      this.createAlert({
        type: 'response_time',
        severity: latestAppMetrics.responseTime.average > 5000 ? 'critical' : 'medium',
        message: `Average response time is ${latestAppMetrics.responseTime.average.toFixed(0)}ms`,
        value: latestAppMetrics.responseTime.average,
        threshold: this.config.alerts.responseTimeThreshold,
      });
    }

    // Check error rate threshold
    if (latestAppMetrics.errorRate.errorRate > this.config.alerts.errorRateThreshold) {
      this.createAlert({
        type: 'error_rate',
        severity: 'high',
        message: `Error rate is ${latestAppMetrics.errorRate.errorRate.toFixed(1)}%`,
        value: latestAppMetrics.errorRate.errorRate,
        threshold: this.config.alerts.errorRateThreshold,
      });
    }
  }

  private createAlert(alertData: Omit<PerformanceAlert, 'id' | 'timestamp' | 'resolved'>): void {
    // Check if similar alert already exists and is unresolved
    const existingAlert = this.alerts.find(alert =>
      alert.type === alertData.type &&
      !alert.resolved &&
      Math.abs(alert.value - alertData.value) < 5 // Allow small variations
    );

    if (existingAlert) {
      // Update existing alert with new value
      existingAlert.value = alertData.value;
      existingAlert.timestamp = new Date();
      return;
    }

    const alert: PerformanceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...alertData,
      timestamp: new Date(),
      resolved: false,
    };

    this.alerts.push(alert);

    // Log alert
    this.logger.warn(`Performance Alert: ${alert.message}`);

    // In production, this would send notifications to administrators
    // this.notificationService.sendAlert(alert);
  }

  private setupRequestMonitoring(): void {
    // This would be integrated with the HTTP interceptor or middleware
    // to track request/response times and errors
    this.logger.log('Request monitoring setup (would integrate with HTTP pipeline)');
  }

  public recordRequest(responseTime: number, statusCode: number): void {
    this.requestCount++;
    this.responseTimes.push(responseTime);

    if (statusCode >= 400) {
      this.errorCount++;
    }

    // Keep only recent response times
    if (this.responseTimes.length > 10000) {
      this.responseTimes = this.responseTimes.slice(-5000);
    }
  }

  async getSystemMetrics(hours: number = 1): Promise<SystemMetrics[]> {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.metrics.filter(metric => metric.timestamp >= cutoffTime);
  }

  async getApplicationMetrics(hours: number = 1): Promise<ApplicationMetrics[]> {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.appMetrics.filter(metric => metric.timestamp >= cutoffTime);
  }

  async getCurrentHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    metrics: {
      system: SystemMetrics;
      application: ApplicationMetrics;
    };
    alerts: PerformanceAlert[];
  }> {
    const latestSystem = this.metrics[this.metrics.length - 1];
    const latestApp = this.appMetrics[this.appMetrics.length - 1];
    const activeAlerts = this.alerts.filter(alert => !alert.resolved);

    // Determine overall status
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    if (activeAlerts.some(alert => alert.severity === 'critical')) {
      status = 'critical';
    } else if (activeAlerts.some(alert => alert.severity === 'high') ||
               latestSystem?.cpu.usage > 80 ||
               latestSystem?.memory.usage > 85) {
      status = 'warning';
    }

    // Calculate uptime (simplified)
    const uptime = process.uptime();

    return {
      status,
      uptime,
      metrics: {
        system: latestSystem,
        application: latestApp,
      },
      alerts: activeAlerts.slice(-10), // Last 10 alerts
    };
  }

  async resolveAlert(alertId: string): Promise<boolean> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      return true;
    }
    return false;
  }

  async getPerformanceReport(timeRange: {
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
      responseTime: { timestamp: Date; value: number }[];
      cpuUsage: { timestamp: Date; value: number }[];
      memoryUsage: { timestamp: Date; value: number }[];
      requestRate: { timestamp: Date; value: number }[];
    };
    bottlenecks: string[];
    recommendations: string[];
  }> {
    const systemMetrics = this.metrics.filter(m =>
      m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
    );

    const appMetrics = this.appMetrics.filter(m =>
      m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
    );

    // Calculate summary statistics
    const avgResponseTime = appMetrics.reduce((sum, m) => sum + m.responseTime.average, 0) / appMetrics.length;
    const avgCpuUsage = systemMetrics.reduce((sum, m) => sum + m.cpu.usage, 0) / systemMetrics.length;
    const avgMemoryUsage = systemMetrics.reduce((sum, m) => sum + m.memory.usage, 0) / systemMetrics.length;
    const totalRequests = appMetrics.reduce((sum, m) => sum + m.throughput.totalRequests, 0);
    const totalErrors = appMetrics.reduce((sum, m) => sum + m.errorRate.totalErrors, 0);
    const uptimePercentage = 99.5; // Mock

    // Generate trends
    const responseTimeTrend = appMetrics.map(m => ({
      timestamp: m.timestamp,
      value: m.responseTime.average,
    }));

    const cpuUsageTrend = systemMetrics.map(m => ({
      timestamp: m.timestamp,
      value: m.cpu.usage,
    }));

    const memoryUsageTrend = systemMetrics.map(m => ({
      timestamp: m.timestamp,
      value: m.memory.usage,
    }));

    const requestRateTrend = appMetrics.map(m => ({
      timestamp: m.timestamp,
      value: m.throughput.requestsPerSecond,
    }));

    // Identify bottlenecks
    const bottlenecks: string[] = [];
    if (avgCpuUsage > 70) bottlenecks.push('High CPU usage detected');
    if (avgMemoryUsage > 80) bottlenecks.push('High memory usage detected');
    if (avgResponseTime > 1000) bottlenecks.push('Slow response times detected');
    if (totalErrors / totalRequests > 0.05) bottlenecks.push('High error rate detected');

    // Generate recommendations
    const recommendations: string[] = [];
    if (avgCpuUsage > 70) recommendations.push('Consider scaling CPU resources or optimizing CPU-intensive operations');
    if (avgMemoryUsage > 80) recommendations.push('Implement memory optimization or increase memory allocation');
    if (avgResponseTime > 1000) recommendations.push('Optimize database queries and implement caching');
    if (totalErrors / totalRequests > 0.05) recommendations.push('Review error logs and implement better error handling');

    return {
      summary: {
        averageResponseTime: avgResponseTime,
        averageCpuUsage: avgCpuUsage,
        averageMemoryUsage: avgMemoryUsage,
        totalRequests,
        totalErrors,
        uptimePercentage,
      },
      trends: {
        responseTime: responseTimeTrend,
        cpuUsage: cpuUsageTrend,
        memoryUsage: memoryUsageTrend,
        requestRate: requestRateTrend,
      },
      bottlenecks,
      recommendations,
    };
  }

  updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.log('Monitoring configuration updated');
  }

  getConfig(): MonitoringConfig {
    return { ...this.config };
  }

  private cleanupOldMetrics(): void {
    const retentionMs = this.config.retentionPeriod * 24 * 60 * 60 * 1000;
    const cutoffTime = new Date(Date.now() - retentionMs);

    this.metrics = this.metrics.filter(metric => metric.timestamp >= cutoffTime);
    this.appMetrics = this.appMetrics.filter(metric => metric.timestamp >= cutoffTime);
    this.alerts = this.alerts.filter(alert => alert.timestamp >= cutoffTime || !alert.resolved);
  }

  // Export methods for external monitoring systems
  async exportMetrics(format: 'json' | 'prometheus' = 'json'): Promise<string> {
    const latestSystem = this.metrics[this.metrics.length - 1];
    const latestApp = this.appMetrics[this.appMetrics.length - 1];

    if (format === 'prometheus') {
      return this.convertToPrometheusFormat(latestSystem, latestApp);
    }

    return JSON.stringify({
      system: latestSystem,
      application: latestApp,
      timestamp: new Date(),
    }, null, 2);
  }

  private convertToPrometheusFormat(system: SystemMetrics, app: ApplicationMetrics): string {
    return `
# HELP quickmela_cpu_usage CPU usage percentage
# TYPE quickmela_cpu_usage gauge
quickmela_cpu_usage ${system.cpu.usage}

# HELP quickmela_memory_usage Memory usage percentage
# TYPE quickmela_memory_usage gauge
quickmela_memory_usage ${system.memory.usage}

# HELP quickmela_response_time_average Average response time in milliseconds
# TYPE quickmela_response_time_average gauge
quickmela_response_time_average ${app.responseTime.average}

# HELP quickmela_requests_per_second Requests per second
# TYPE quickmela_requests_per_second gauge
quickmela_requests_per_second ${app.throughput.requestsPerSecond}

# HELP quickmela_error_rate Error rate percentage
# TYPE quickmela_error_rate gauge
quickmela_error_rate ${app.errorRate.errorRate}
    `.trim();
  }
}
