import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface LoadTestScenario {
  name: string;
  description: string;
  concurrentUsers: number;
  duration: number; // seconds
  targetRPS: number; // requests per second
  operations: {
    type: 'bid' | 'auction_close' | 'escrow_hold' | 'emi_check' | 'wallet_debit';
    weight: number; // percentage of total operations
    params?: any;
  }[];
}

export interface LoadTestResult {
  scenario: string;
  duration: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  throughput: number; // RPS
  bottlenecks: string[];
  recommendations: string[];
}

export interface SystemHealthCheck {
  redis: {
    status: 'healthy' | 'degraded' | 'critical';
    connections: number;
    memoryUsage: number;
    hitRate: number;
  };
  database: {
    status: 'healthy' | 'degraded' | 'critical';
    activeConnections: number;
    slowQueries: number;
    deadlockCount: number;
  };
  application: {
    status: 'healthy' | 'degraded' | 'critical';
    activeUsers: number;
    memoryUsage: number;
    cpuUsage: number;
    errorRate: number;
  };
}

@Injectable()
export class StabilityAuditService {
  private readonly logger = new Logger(StabilityAuditService.name);

  constructor(private prisma: PrismaService) {}

  async runLoadTest(scenario: LoadTestScenario): Promise<LoadTestResult> {
    this.logger.log(`Starting load test: ${scenario.name}`);
    this.logger.log(`Concurrent users: ${scenario.concurrentUsers}, Duration: ${scenario.duration}s, Target RPS: ${scenario.targetRPS}`);

    const startTime = Date.now();
    let totalRequests = 0;
    let successfulRequests = 0;
    let failedRequests = 0;
    const responseTimes: number[] = [];
    const errors: string[] = [];

    // Run load test for specified duration
    const endTime = startTime + (scenario.duration * 1000);

    while (Date.now() < endTime) {
      const batchStartTime = Date.now();
      const batchPromises: Promise<any>[] = [];

      // Generate concurrent requests
      for (let i = 0; i < scenario.concurrentUsers; i++) {
        const operation = this.selectWeightedOperation(scenario.operations);
        const promise = this.executeOperation(operation);
        batchPromises.push(promise);
      }

      try {
        const results = await Promise.allSettled(batchPromises);
        const batchEndTime = Date.now();
        const batchDuration = batchEndTime - batchStartTime;

        results.forEach((result, index) => {
          totalRequests++;
          responseTimes.push(batchDuration / scenario.concurrentUsers); // Average per request

          if (result.status === 'fulfilled') {
            successfulRequests++;
          } else {
            failedRequests++;
            errors.push(result.reason?.message || 'Unknown error');
          }
        });

        // Control request rate to not overwhelm the system
        const expectedBatchTime = (scenario.concurrentUsers / scenario.targetRPS) * 1000;
        const sleepTime = Math.max(0, expectedBatchTime - batchDuration);
        if (sleepTime > 0) {
          await this.sleep(sleepTime);
        }

      } catch (error) {
        this.logger.error('Batch execution error:', error);
        failedRequests += scenario.concurrentUsers;
        totalRequests += scenario.concurrentUsers;
      }
    }

    const duration = (Date.now() - startTime) / 1000;
    const errorRate = (failedRequests / totalRequests) * 100;
    const throughput = totalRequests / duration;

    // Calculate percentiles
    responseTimes.sort((a, b) => a - b);
    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p99Index = Math.floor(responseTimes.length * 0.99);
    const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;

    const bottlenecks = await this.identifyBottlenecks(errors, responseTimes);
    const recommendations = this.generateRecommendations(errorRate, throughput, bottlenecks);

    const result: LoadTestResult = {
      scenario: scenario.name,
      duration,
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      p95ResponseTime: responseTimes[p95Index] || 0,
      p99ResponseTime: responseTimes[p99Index] || 0,
      errorRate,
      throughput,
      bottlenecks,
      recommendations,
    };

    this.logger.log(`Load test completed: ${scenario.name}`);
    this.logger.log(`Success rate: ${((successfulRequests / totalRequests) * 100).toFixed(2)}%`);
    this.logger.log(`Throughput: ${throughput.toFixed(2)} RPS`);
    this.logger.log(`Avg response time: ${averageResponseTime.toFixed(2)}ms`);

    return result;
  }

  async runEnterpriseLoadTest(): Promise<{
    results: LoadTestResult[];
    overallHealth: SystemHealthCheck;
    criticalIssues: string[];
    nextSteps: string[];
  }> {
    this.logger.log('Starting enterprise stability audit');

    // Define enterprise load test scenarios
    const scenarios: LoadTestScenario[] = [
      {
        name: 'Concurrent Bidding Storm',
        description: '1000 users bidding simultaneously on multiple auctions',
        concurrentUsers: 1000,
        duration: 300, // 5 minutes
        targetRPS: 500,
        operations: [
          { type: 'bid', weight: 85 },
          { type: 'auction_close', weight: 10 },
          { type: 'wallet_debit', weight: 5 },
        ],
      },
      {
        name: 'Auction Closing Frenzy',
        description: '100 auctions closing simultaneously with escrow processing',
        concurrentUsers: 100,
        duration: 60, // 1 minute
        targetRPS: 200,
        operations: [
          { type: 'auction_close', weight: 60 },
          { type: 'escrow_hold', weight: 30 },
          { type: 'wallet_debit', weight: 10 },
        ],
      },
      {
        name: 'Financing Rush',
        description: 'High-volume EMI eligibility checks and loan applications',
        concurrentUsers: 500,
        duration: 180, // 3 minutes
        targetRPS: 200,
        operations: [
          { type: 'emi_check', weight: 70 },
          { type: 'escrow_hold', weight: 20 },
          { type: 'wallet_debit', weight: 10 },
        ],
      },
    ];

    // Run all scenarios
    const results: LoadTestResult[] = [];
    for (const scenario of scenarios) {
      try {
        const result = await this.runLoadTest(scenario);
        results.push(result);
      } catch (error) {
        this.logger.error(`Failed to run scenario ${scenario.name}:`, error);
        results.push({
          scenario: scenario.name,
          duration: 0,
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          averageResponseTime: 0,
          p95ResponseTime: 0,
          p99ResponseTime: 0,
          errorRate: 100,
          throughput: 0,
          bottlenecks: [`Test execution failed: ${error.message}`],
          recommendations: ['Fix test execution issues before proceeding'],
        });
      }
    }

    // Check system health
    const overallHealth = await this.performSystemHealthCheck();

    // Analyze results for critical issues
    const criticalIssues = this.identifyCriticalIssues(results, overallHealth);
    const nextSteps = this.generateNextSteps(results, overallHealth, criticalIssues);

    this.logger.log('Enterprise stability audit completed');

    return {
      results,
      overallHealth,
      criticalIssues,
      nextSteps,
    };
  }

  async performSystemHealthCheck(): Promise<SystemHealthCheck> {
    // Simulate system health checks
    // In a real implementation, this would query actual system metrics

    return {
      redis: {
        status: 'healthy',
        connections: 150,
        memoryUsage: 0.75, // 75%
        hitRate: 0.95, // 95%
      },
      database: {
        status: 'healthy',
        activeConnections: 25,
        slowQueries: 2,
        deadlockCount: 0,
      },
      application: {
        status: 'healthy',
        activeUsers: 1250,
        memoryUsage: 0.65, // 65%
        cpuUsage: 0.70, // 70%
        errorRate: 0.02, // 2%
      },
    };
  }

  // Private helper methods
  private selectWeightedOperation(operations: LoadTestScenario['operations']): LoadTestScenario['operations'][0] {
    const random = Math.random() * 100;
    let cumulativeWeight = 0;

    for (const operation of operations) {
      cumulativeWeight += operation.weight;
      if (random <= cumulativeWeight) {
        return operation;
      }
    }

    return operations[0]; // fallback
  }

  private async executeOperation(operation: LoadTestScenario['operations'][0]): Promise<any> {
    // Simulate operation execution with realistic delays and potential failures
    const baseDelay = Math.random() * 100 + 50; // 50-150ms base delay

    switch (operation.type) {
      case 'bid':
        await this.sleep(baseDelay);
        // Simulate occasional bid conflicts (race conditions)
        if (Math.random() < 0.05) { // 5% chance
          throw new Error('Concurrent bid conflict - auction already has higher bid');
        }
        return { success: true, type: 'bid' };

      case 'auction_close':
        await this.sleep(baseDelay + 200); // Slower operation
        // Simulate occasional closing failures
        if (Math.random() < 0.02) { // 2% chance
          throw new Error('Auction closing failed - database lock timeout');
        }
        return { success: true, type: 'auction_close' };

      case 'escrow_hold':
        await this.sleep(baseDelay + 150);
        // Simulate escrow failures
        if (Math.random() < 0.03) { // 3% chance
          throw new Error('Escrow hold failed - insufficient wallet balance');
        }
        return { success: true, type: 'escrow_hold' };

      case 'emi_check':
        await this.sleep(baseDelay + 100);
        // Simulate EMI check failures
        if (Math.random() < 0.01) { // 1% chance
          throw new Error('EMI check failed - external service timeout');
        }
        return { success: true, type: 'emi_check' };

      case 'wallet_debit':
        await this.sleep(baseDelay + 80);
        // Simulate double debit protection failures
        if (Math.random() < 0.04) { // 4% chance
          throw new Error('Double debit detected - transaction blocked');
        }
        return { success: true, type: 'wallet_debit' };

      default:
        await this.sleep(baseDelay);
        return { success: true, type: 'unknown' };
    }
  }

  private async identifyBottlenecks(errors: string[], responseTimes: number[]): Promise<string[]> {
    const bottlenecks: string[] = [];

    // Analyze error patterns
    const errorCounts: Record<string, number> = {};
    errors.forEach(error => {
      errorCounts[error] = (errorCounts[error] || 0) + 1;
    });

    // Find most common errors
    const sortedErrors = Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    sortedErrors.forEach(([error, count]) => {
      if (count > 10) { // More than 10 occurrences
        bottlenecks.push(`${error}: ${count} occurrences`);
      }
    });

    // Analyze response time patterns
    const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    const slowRequests = responseTimes.filter(time => time > avgResponseTime * 2).length;

    if (slowRequests > responseTimes.length * 0.1) { // More than 10% slow requests
      bottlenecks.push(`Performance degradation: ${slowRequests} slow requests detected`);
    }

    // Check for specific system bottlenecks
    if (responseTimes.some(time => time > 5000)) { // Requests taking > 5 seconds
      bottlenecks.push('Critical performance issue: requests exceeding 5 seconds');
    }

    if (errors.some(error => error.includes('database lock'))) {
      bottlenecks.push('Database locking issues detected - potential deadlock risk');
    }

    if (errors.some(error => error.includes('Concurrent bid conflict'))) {
      bottlenecks.push('Race condition in bidding system - requires atomic operations');
    }

    return bottlenecks.length > 0 ? bottlenecks : ['No significant bottlenecks detected'];
  }

  private generateRecommendations(errorRate: number, throughput: number, bottlenecks: string[]): string[] {
    const recommendations: string[] = [];

    if (errorRate > 5) {
      recommendations.push('High error rate detected - implement circuit breakers and retry logic');
    }

    if (throughput < 100) {
      recommendations.push('Low throughput - consider horizontal scaling and database optimization');
    }

    if (bottlenecks.some(b => b.includes('database lock'))) {
      recommendations.push('Implement database connection pooling and optimize queries');
    }

    if (bottlenecks.some(b => b.includes('race condition'))) {
      recommendations.push('Implement atomic operations for bidding and wallet transactions');
    }

    if (bottlenecks.some(b => b.includes('Concurrent bid'))) {
      recommendations.push('Add optimistic locking and conflict resolution for concurrent bids');
    }

    recommendations.push('Implement comprehensive monitoring and alerting system');
    recommendations.push('Set up automated performance regression testing');

    return recommendations;
  }

  private identifyCriticalIssues(results: LoadTestResult[], health: SystemHealthCheck): string[] {
    const issues: string[] = [];

    // Check load test results
    results.forEach(result => {
      if (result.errorRate > 10) {
        issues.push(`Critical: ${result.scenario} has ${result.errorRate.toFixed(1)}% error rate`);
      }

      if (result.p99ResponseTime > 3000) { // 3 seconds
        issues.push(`Critical: ${result.scenario} has slow p99 response time (${result.p99ResponseTime.toFixed(0)}ms)`);
      }
    });

    // Check system health
    if (health.redis.status !== 'healthy') {
      issues.push(`Critical: Redis health is ${health.redis.status}`);
    }

    if (health.database.status !== 'healthy') {
      issues.push(`Critical: Database health is ${health.database.status}`);
    }

    if (health.application.status !== 'healthy') {
      issues.push(`Critical: Application health is ${health.application.status}`);
    }

    if (health.database.deadlockCount > 0) {
      issues.push(`Critical: ${health.database.deadlockCount} database deadlocks detected`);
    }

    return issues;
  }

  private generateNextSteps(results: LoadTestResult[], health: SystemHealthCheck, criticalIssues: string[]): string[] {
    const steps: string[] = [];

    if (criticalIssues.length > 0) {
      steps.push('IMMEDIATE: Address all critical issues before proceeding');
      steps.push('Implement fixes for identified bottlenecks and race conditions');
    }

    steps.push('Set up continuous performance monitoring');
    steps.push('Implement automated load testing in CI/CD pipeline');
    steps.push('Configure alerting for performance degradation');
    steps.push('Prepare horizontal scaling strategy');
    steps.push('Document performance baselines and SLAs');

    if (results.every(r => r.errorRate < 2 && r.p99ResponseTime < 1000)) {
      steps.push('SUCCESS: System ready for production scaling');
    } else {
      steps.push('RETEST: Run load tests again after implementing fixes');
    }

    return steps;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
