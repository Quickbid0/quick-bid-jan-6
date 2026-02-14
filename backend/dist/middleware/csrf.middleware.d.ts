import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export declare class CsrfMiddleware implements NestMiddleware {
    private readonly csrfTokens;
    private readonly tokenLength;
    private readonly tokenExpiry;
    private generateToken;
    private getCsrfToken;
    private setCsrfToken;
    private getSessionId;
    private validateCsrfToken;
    private isSafeMethod;
    private isApiRequest;
    private isFormRequest;
    use(req: Request, res: Response, next: NextFunction): void;
}
export declare function RequireCsrf(): (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => PropertyDescriptor;
