import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class RateLimitingInterceptor implements NestInterceptor {
    private store;
    private configs;
    private readonly logger;
    constructor();
    private getConfig;
    private getKey;
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
