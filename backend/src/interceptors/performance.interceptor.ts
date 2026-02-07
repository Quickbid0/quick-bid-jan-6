import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const userAgent = request.get('user-agent') || 'unknown';
    
    // Log slow requests
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        
        // Log performance metrics
        if (duration > 1000) { // Log requests taking more than 1 second
          this.logger.warn(`Slow request detected: ${method} ${url} - ${duration}ms`);
        }
        
        // Add performance headers
        const response = context.switchToHttp().getResponse();
        response.setHeader('X-Response-Time', `${duration}ms`);
        response.setHeader('X-Request-ID', this.generateRequestId());
        
        // Log to performance monitoring
        this.logPerformanceMetrics({
          method,
          url,
          duration,
          userAgent,
          statusCode: response.statusCode,
          timestamp: new Date().toISOString(),
        });
      })
    );
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private logPerformanceMetrics(metrics: {
    method: string;
    url: string;
    duration: number;
    userAgent: string;
    statusCode: number;
    timestamp: string;
  }): void {
    // In production, this would send to a monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Send to monitoring service (e.g., DataDog, New Relic, etc.)
      console.log('PERFORMANCE_METRICS:', JSON.stringify(metrics));
    }
  }
}

// Performance monitoring decorator
export function PerformanceMonitor(threshold?: number) {
  return (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const start = Date.now();
      const result = await originalMethod.apply(this, args);
      const duration = Date.now() - start;
      
      if (threshold && duration > threshold) {
        // Performance threshold exceeded - log warning
        // In production, this would trigger alerts or notifications
      }
      
      return result;
    };
    
    return descriptor;
  };
}
