import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class PerformanceInterceptor implements NestInterceptor {
    private readonly logger;
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private generateRequestId;
    private logPerformanceMetrics;
}
export declare function PerformanceMonitor(threshold?: number): (target: any, propertyKey: string, descriptor?: PropertyDescriptor) => PropertyDescriptor;
