import { Request, Response, NextFunction } from 'express';
import { SecurityLogger } from './security-simple';

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  BUSINESS_LOGIC = 'business_logic',
  DATABASE = 'database',
  EXTERNAL_API = 'external_api',
  SYSTEM = 'system',
  NETWORK = 'network',
  USER_INPUT = 'user_input'
}

// Custom error class
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly isOperational: boolean;
  public readonly context?: any;
  public readonly userId?: string;
  public readonly requestId?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.SYSTEM,
    isOperational: boolean = true,
    context?: any,
    userId?: string,
    requestId?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.severity = severity;
    this.category = category;
    this.isOperational = isOperational;
    this.context = context;
    this.userId = userId;
    this.requestId = requestId;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error types
export class ValidationError extends AppError {
  constructor(message: string, context?: any) {
    super(message, 400, ErrorSeverity.LOW, ErrorCategory.VALIDATION, true, context);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, context?: any) {
    super(message, 401, ErrorSeverity.MEDIUM, ErrorCategory.AUTHENTICATION, true, context);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string, context?: any) {
    super(message, 403, ErrorSeverity.MEDIUM, ErrorCategory.AUTHORIZATION, true, context);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(`${resource}${id ? ` with ID ${id}` : ''} not found`, 404, ErrorSeverity.LOW, ErrorCategory.VALIDATION, true);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, context?: any) {
    super(message, 409, ErrorSeverity.MEDIUM, ErrorCategory.BUSINESS_LOGIC, true, context);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, context?: any) {
    super(message, 500, ErrorSeverity.HIGH, ErrorCategory.DATABASE, false, context);
  }
}

export class ExternalAPIError extends AppError {
  constructor(message: string, service: string, context?: any) {
    super(`${service} API error: ${message}`, 502, ErrorSeverity.HIGH, ErrorCategory.EXTERNAL_API, true, context);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string, context?: any) {
    super(message, 429, ErrorSeverity.MEDIUM, ErrorCategory.SYSTEM, true, context);
  }
}

// Error logging service
export class ErrorLogger {
  private static logs: Array<{
    timestamp: Date;
    level: string;
    message: string;
    error: any;
    context?: any;
    userId?: string;
    requestId?: string;
    ip?: string;
    userAgent?: string;
  }> = [];

  static log(error: Error, req?: Request): void {
    const logEntry = {
      timestamp: new Date(),
      level: this.getLogLevel(error),
      message: error.message,
      error: {
        name: error.name,
        stack: error.stack,
        ...(error instanceof AppError && {
          statusCode: error.statusCode,
          severity: error.severity,
          category: error.category,
          isOperational: error.isOperational,
          context: error.context
        })
      },
      userId: req?.user?.id,
      requestId: req?.headers['x-request-id'] as string,
      ip: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.headers['user-agent']
    };

    // Add to in-memory logs (for development)
    this.logs.push(logEntry);

    // Keep only last 1000 logs in memory
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }

    // Log to console
    this.logToConsole(logEntry);

    // In production, send to external logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(logEntry);
    }

    // Log security events separately
    if (error instanceof AppError && error.category === ErrorCategory.AUTHENTICATION) {
      SecurityLogger.logSecurityEvent({
        type: 'auth_failure',
        userId: logEntry.userId,
        ip: logEntry.ip || 'unknown',
        userAgent: logEntry.userAgent,
        details: { error: error.message, context: error.context }
      });
    }
  }

  private static getLogLevel(error: Error): string {
    if (error instanceof AppError) {
      switch (error.severity) {
        case ErrorSeverity.LOW:
          return 'info';
        case ErrorSeverity.MEDIUM:
          return 'warn';
        case ErrorSeverity.HIGH:
          return 'error';
        case ErrorSeverity.CRITICAL:
          return 'critical';
        default:
          return 'error';
      }
    }
    return 'error';
  }

  private static logToConsole(logEntry: any): void {
    const message = `[${logEntry.timestamp.toISOString()}] ${logEntry.level.toUpperCase()}: ${logEntry.message}`;
    
    switch (logEntry.level) {
      case 'info':
        console.info(message, logEntry);
        break;
      case 'warn':
        console.warn(message, logEntry);
        break;
      case 'error':
        console.error(message, logEntry);
        break;
      case 'critical':
        console.error(`🚨 CRITICAL: ${message}`, logEntry);
        break;
      default:
        console.log(message, logEntry);
    }
  }

  private static sendToLoggingService(logEntry: any): void {
    // In production, this would send to services like:
    // - Sentry for error tracking
    // - DataDog for logging
    // - ELK stack for log aggregation
    // For now, we'll just simulate it
    console.log('Sending to logging service:', logEntry);
  }

  static getRecentLogs(count: number = 100): any[] {
    return this.logs.slice(-count);
  }

  static getLogsByLevel(level: string): any[] {
    return this.logs.filter(log => log.level === level);
  }

  static getLogsByUser(userId: string): any[] {
    return this.logs.filter(log => log.userId === userId);
  }
}

// Global error handler middleware
export const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error
  ErrorLogger.log(error, req);

  // Handle specific error types
  if (error instanceof AppError) {
    // Operational errors: send meaningful error to client
    if (error.isOperational) {
      res.status(error.statusCode).json({
        error: {
          message: error.message,
          code: error.name,
          category: error.category,
          severity: error.severity,
          requestId: req.headers['x-request-id'],
          ...(process.env.NODE_ENV === 'development' && { 
            stack: error.stack,
            context: error.context 
          })
        }
      });
      return;
    }

    // Programming errors: don't leak error details
    res.status(500).json({
      error: {
        message: 'Something went wrong',
        code: 'INTERNAL_SERVER_ERROR',
        requestId: req.headers['x-request-id']
      }
    });
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      error: {
        message: 'Invalid authentication token',
        code: 'INVALID_TOKEN'
      }
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      error: {
        message: 'Authentication token expired',
        code: 'TOKEN_EXPIRED'
      }
    });
    return;
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    res.status(400).json({
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.message
      }
    });
    return;
  }

  // Handle database errors
  if (error.message.includes('database') || error.message.includes('SQL')) {
    res.status(500).json({
      error: {
        message: 'Database operation failed',
        code: 'DATABASE_ERROR'
      }
    });
    return;
  }

  // Default error response
  res.status(500).json({
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message,
      code: 'INTERNAL_SERVER_ERROR',
      requestId: req.headers['x-request-id']
    }
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Request ID middleware
export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  req.headers['x-request-id'] = req.headers['x-request-id'] || 
    Math.random().toString(36).substring(2, 15) + 
    Math.random().toString(36).substring(2, 15);
  
  res.setHeader('x-request-id', req.headers['x-request-id']);
  next();
};

// Health check service
export class HealthCheckService {
  private static checks = new Map<string, () => Promise<boolean>>();

  static registerCheck(name: string, checkFn: () => Promise<boolean>): void {
    this.checks.set(name, checkFn);
  }

  static async runAllChecks(): Promise<{
    status: 'healthy' | 'unhealthy';
    checks: Record<string, { status: boolean; message?: string; responseTime?: number }>;
    timestamp: string;
  }> {
    const results: Record<string, { status: boolean; message?: string; responseTime?: number }> = {};
    let allHealthy = true;

    for (const [name, checkFn] of this.checks.entries()) {
      const startTime = Date.now();
      try {
        const isHealthy = await checkFn();
        const responseTime = Date.now() - startTime;
        
        results[name] = {
          status: isHealthy,
          responseTime
        };
        
        if (!isHealthy) {
          allHealthy = false;
        }
      } catch (error) {
        const responseTime = Date.now() - startTime;
        results[name] = {
          status: false,
          message: error instanceof Error ? error.message : 'Unknown error',
          responseTime
        };
        allHealthy = false;
      }
    }

    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      checks: results,
      timestamp: new Date().toISOString()
    };
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static metrics = new Map<string, {
    count: number;
    totalTime: number;
    minTime: number;
    maxTime: number;
    avgTime: number;
  }>();

  static recordMetric(name: string, duration: number): void {
    const existing = this.metrics.get(name) || {
      count: 0,
      totalTime: 0,
      minTime: duration,
      maxTime: duration,
      avgTime: duration
    };

    existing.count++;
    existing.totalTime += duration;
    existing.minTime = Math.min(existing.minTime, duration);
    existing.maxTime = Math.max(existing.maxTime, duration);
    existing.avgTime = existing.totalTime / existing.count;

    this.metrics.set(name, existing);
  }

  static getMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [name, metric] of this.metrics.entries()) {
      result[name] = {
        count: metric.count,
        avgTime: Math.round(metric.avgTime * 100) / 100,
        minTime: Math.round(metric.minTime * 100) / 100,
        maxTime: Math.round(metric.maxTime * 100) / 100,
        totalTime: Math.round(metric.totalTime * 100) / 100
      };
    }
    
    return result;
  }

  static resetMetrics(): void {
    this.metrics.clear();
  }
}

// Performance monitoring middleware
export const performanceMonitor = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const metricName = `${req.method} ${req.route?.path || req.path}`;
    
    PerformanceMonitor.recordMetric(metricName, duration);
    
    // Log slow requests
    if (duration > 1000) {
      ErrorLogger.log(
        new AppError(
          `Slow request: ${metricName} took ${duration}ms`,
          200,
          ErrorSeverity.LOW,
          ErrorCategory.SYSTEM,
          true,
          { duration, method: req.method, path: req.path }
        ),
        req
      );
    }
  });
  
  next();
};

// Circuit breaker pattern
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private readonly threshold: number,
    private readonly timeout: number,
    private readonly monitor?: (state: string, failures: number) => void
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
        this.monitor?.('HALF_OPEN', this.failures);
      } else {
        throw new AppError('Circuit breaker is OPEN', 503, ErrorSeverity.HIGH, ErrorCategory.SYSTEM);
      }
    }

    try {
      const result = await fn();
      
      if (this.state === 'HALF_OPEN') {
        this.reset();
      }
      
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      this.monitor?.('OPEN', this.failures);
    }
  }

  private reset(): void {
    this.failures = 0;
    this.state = 'CLOSED';
    this.monitor?.('CLOSED', 0);
  }

  getState(): string {
    return this.state;
  }

  getFailures(): number {
    return this.failures;
  }
}

// Utility functions
export const createError = (
  message: string,
  statusCode: number = 500,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  category: ErrorCategory = ErrorCategory.SYSTEM
): AppError => {
  return new AppError(message, statusCode, severity, category);
};

export const isOperationalError = (error: Error): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

// Initialize default health checks
HealthCheckService.registerCheck('database', async () => {
  // Check database connectivity
  try {
    // This would typically ping the database
    return true;
  } catch (error) {
    return false;
  }
});

HealthCheckService.registerCheck('memory', async () => {
  const usage = process.memoryUsage();
  const threshold = 0.9; // 90% threshold
  return usage.heapUsed / usage.heapTotal < threshold;
});

HealthCheckService.registerCheck('disk', async () => {
  // Check disk space (simplified)
  return true;
});
