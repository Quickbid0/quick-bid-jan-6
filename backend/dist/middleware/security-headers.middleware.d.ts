import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export declare class SecurityHeadersMiddleware implements NestMiddleware {
    private readonly isProduction;
    private getSecurityHeaders;
    private getContentSecurityPolicy;
    private getPermissionsPolicy;
    private getCacheHeaders;
    private getApiHeaders;
    use(req: Request, res: Response, next: NextFunction): void;
    private generateRequestId;
}
export declare function SecurityHeaders(options?: {
    csp?: string;
    hsts?: boolean;
    frameOptions?: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
}): (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => PropertyDescriptor;
