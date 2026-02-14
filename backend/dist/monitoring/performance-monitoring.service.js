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
var PerformanceMonitoringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceMonitoringService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const os = require("os");
const process = require("process");
let PerformanceMonitoringService = PerformanceMonitoringService_1 = class PerformanceMonitoringService {
    constructor(prismaService) {
        this.prismaService = prismaService;
        this.logger = new common_1.Logger(PerformanceMonitoringService_1.name);
        this.config = {
            enabled: true,
            collectionInterval: 60,
            retentionPeriod: 7,
            alerts: {
                cpuThreshold: 80,
                memoryThreshold: 85,
                diskThreshold: 90,
                responseTimeThreshold: 1000,
                errorRateThreshold: 5,
            },
        };
        this.metrics = [];
        this.appMetrics = [];
        this.alerts = [];
        this.lastCpuUsage = process.cpuUsage();
        this.requestCount = 0;
        this.errorCount = 0;
        this.responseTimes = [];
        if (this.config.enabled) {
            this.initializeMonitoring();
        }
    }
    initializeMonitoring() {
        this.monitoringInterval = setInterval(() => {
            this.collectSystemMetrics();
            this.collectApplicationMetrics();
            this.checkThresholds();
            this.cleanupOldMetrics();
        }, this.config.collectionInterval * 1000);
        this.setupRequestMonitoring();
        this.logger.log('Performance monitoring initialized');
    }
    onModuleDestroy() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
    }
    async collectSystemMetrics() {
        const timestamp = new Date();
        const cpuUsage = process.cpuUsage(this.lastCpuUsage);
        this.lastCpuUsage = process.cpuUsage();
        const cpuUsagePercent = (cpuUsage.user + cpuUsage.system) / 1000000;
        const loadAverage = os.loadavg();
        const memInfo = process.memoryUsage();
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const usedMemory = totalMemory - freeMemory;
        const memoryUsagePercent = (usedMemory / totalMemory) * 100;
        const diskUsage = 65;
        const totalDisk = 1000000000000;
        const usedDisk = totalDisk * (diskUsage / 100);
        const networkConnections = 150;
        const bytesReceived = 1000000;
        const bytesSent = 800000;
        const metrics = {
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
        if (this.metrics.length > 1000) {
            this.metrics = this.metrics.slice(-1000);
        }
    }
    async collectApplicationMetrics() {
        const timestamp = new Date();
        const responseTimes = [...this.responseTimes];
        this.responseTimes = [];
        const avgResponseTime = responseTimes.length > 0
            ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
            : 0;
        const sortedResponseTimes = responseTimes.sort((a, b) => a - b);
        const p95ResponseTime = sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.95)] || 0;
        const p99ResponseTime = sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.99)] || 0;
        const requestsPerSecond = this.requestCount / this.config.collectionInterval;
        const totalRequests = this.requestCount;
        const activeConnections = 25;
        const errorRate = this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;
        const errorsByType = {
            '4xx': 5,
            '5xx': 2,
        };
        const dbMetrics = {
            connectionPool: {
                used: 5,
                available: 15,
                pending: 1,
            },
            queryPerformance: {
                slowQueries: 2,
                averageQueryTime: 45,
            },
        };
        const cacheMetrics = {
            hitRate: 85,
            missRate: 15,
            size: 1024,
        };
        const appMetrics = {
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
        this.requestCount = 0;
        this.errorCount = 0;
        if (this.appMetrics.length > 1000) {
            this.appMetrics = this.appMetrics.slice(-1000);
        }
    }
    checkThresholds() {
        const latestSystemMetrics = this.metrics[this.metrics.length - 1];
        const latestAppMetrics = this.appMetrics[this.appMetrics.length - 1];
        if (!latestSystemMetrics || !latestAppMetrics)
            return;
        if (latestSystemMetrics.cpu.usage > this.config.alerts.cpuThreshold) {
            this.createAlert({
                type: 'cpu',
                severity: latestSystemMetrics.cpu.usage > 95 ? 'critical' : 'high',
                message: `CPU usage is ${latestSystemMetrics.cpu.usage.toFixed(1)}%`,
                value: latestSystemMetrics.cpu.usage,
                threshold: this.config.alerts.cpuThreshold,
            });
        }
        if (latestSystemMetrics.memory.usage > this.config.alerts.memoryThreshold) {
            this.createAlert({
                type: 'memory',
                severity: latestSystemMetrics.memory.usage > 95 ? 'critical' : 'high',
                message: `Memory usage is ${latestSystemMetrics.memory.usage.toFixed(1)}%`,
                value: latestSystemMetrics.memory.usage,
                threshold: this.config.alerts.memoryThreshold,
            });
        }
        if (latestAppMetrics.responseTime.average > this.config.alerts.responseTimeThreshold) {
            this.createAlert({
                type: 'response_time',
                severity: latestAppMetrics.responseTime.average > 5000 ? 'critical' : 'medium',
                message: `Average response time is ${latestAppMetrics.responseTime.average.toFixed(0)}ms`,
                value: latestAppMetrics.responseTime.average,
                threshold: this.config.alerts.responseTimeThreshold,
            });
        }
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
    createAlert(alertData) {
        const existingAlert = this.alerts.find(alert => alert.type === alertData.type &&
            !alert.resolved &&
            Math.abs(alert.value - alertData.value) < 5);
        if (existingAlert) {
            existingAlert.value = alertData.value;
            existingAlert.timestamp = new Date();
            return;
        }
        const alert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...alertData,
            timestamp: new Date(),
            resolved: false,
        };
        this.alerts.push(alert);
        this.logger.warn(`Performance Alert: ${alert.message}`);
    }
    setupRequestMonitoring() {
        this.logger.log('Request monitoring setup (would integrate with HTTP pipeline)');
    }
    recordRequest(responseTime, statusCode) {
        this.requestCount++;
        this.responseTimes.push(responseTime);
        if (statusCode >= 400) {
            this.errorCount++;
        }
        if (this.responseTimes.length > 10000) {
            this.responseTimes = this.responseTimes.slice(-5000);
        }
    }
    async getSystemMetrics(hours = 1) {
        const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
        return this.metrics.filter(metric => metric.timestamp >= cutoffTime);
    }
    async getApplicationMetrics(hours = 1) {
        const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
        return this.appMetrics.filter(metric => metric.timestamp >= cutoffTime);
    }
    async getCurrentHealth() {
        const latestSystem = this.metrics[this.metrics.length - 1];
        const latestApp = this.appMetrics[this.appMetrics.length - 1];
        const activeAlerts = this.alerts.filter(alert => !alert.resolved);
        let status = 'healthy';
        if (activeAlerts.some(alert => alert.severity === 'critical')) {
            status = 'critical';
        }
        else if (activeAlerts.some(alert => alert.severity === 'high') ||
            latestSystem?.cpu.usage > 80 ||
            latestSystem?.memory.usage > 85) {
            status = 'warning';
        }
        const uptime = process.uptime();
        return {
            status,
            uptime,
            metrics: {
                system: latestSystem,
                application: latestApp,
            },
            alerts: activeAlerts.slice(-10),
        };
    }
    async resolveAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert && !alert.resolved) {
            alert.resolved = true;
            alert.resolvedAt = new Date();
            return true;
        }
        return false;
    }
    async getPerformanceReport(timeRange) {
        const systemMetrics = this.metrics.filter(m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end);
        const appMetrics = this.appMetrics.filter(m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end);
        const avgResponseTime = appMetrics.reduce((sum, m) => sum + m.responseTime.average, 0) / appMetrics.length;
        const avgCpuUsage = systemMetrics.reduce((sum, m) => sum + m.cpu.usage, 0) / systemMetrics.length;
        const avgMemoryUsage = systemMetrics.reduce((sum, m) => sum + m.memory.usage, 0) / systemMetrics.length;
        const totalRequests = appMetrics.reduce((sum, m) => sum + m.throughput.totalRequests, 0);
        const totalErrors = appMetrics.reduce((sum, m) => sum + m.errorRate.totalErrors, 0);
        const uptimePercentage = 99.5;
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
        const bottlenecks = [];
        if (avgCpuUsage > 70)
            bottlenecks.push('High CPU usage detected');
        if (avgMemoryUsage > 80)
            bottlenecks.push('High memory usage detected');
        if (avgResponseTime > 1000)
            bottlenecks.push('Slow response times detected');
        if (totalErrors / totalRequests > 0.05)
            bottlenecks.push('High error rate detected');
        const recommendations = [];
        if (avgCpuUsage > 70)
            recommendations.push('Consider scaling CPU resources or optimizing CPU-intensive operations');
        if (avgMemoryUsage > 80)
            recommendations.push('Implement memory optimization or increase memory allocation');
        if (avgResponseTime > 1000)
            recommendations.push('Optimize database queries and implement caching');
        if (totalErrors / totalRequests > 0.05)
            recommendations.push('Review error logs and implement better error handling');
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
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.logger.log('Monitoring configuration updated');
    }
    getConfig() {
        return { ...this.config };
    }
    cleanupOldMetrics() {
        const retentionMs = this.config.retentionPeriod * 24 * 60 * 60 * 1000;
        const cutoffTime = new Date(Date.now() - retentionMs);
        this.metrics = this.metrics.filter(metric => metric.timestamp >= cutoffTime);
        this.appMetrics = this.appMetrics.filter(metric => metric.timestamp >= cutoffTime);
        this.alerts = this.alerts.filter(alert => alert.timestamp >= cutoffTime || !alert.resolved);
    }
    async exportMetrics(format = 'json') {
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
    convertToPrometheusFormat(system, app) {
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
};
exports.PerformanceMonitoringService = PerformanceMonitoringService;
exports.PerformanceMonitoringService = PerformanceMonitoringService = PerformanceMonitoringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PerformanceMonitoringService);
//# sourceMappingURL=performance-monitoring.service.js.map