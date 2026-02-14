import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
interface RateLimitOptions {
    windowMs: number;
    maxRequests: number;
    message?: string;
    skipSuccessfulRequests?: boolean;
}
export declare class RateLimitingMiddleware implements NestMiddleware {
    private store;
    private options;
    constructor();
    configure(options?: Partial<RateLimitOptions>): void;
    private getKey;
    private isSuccessfulRequest;
    use(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export {};
