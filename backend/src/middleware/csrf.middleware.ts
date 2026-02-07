import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly csrfTokens: Map<string, { token: string; expires: number }> = new Map();
  private readonly tokenLength = 32;
  private readonly tokenExpiry = 60 * 60 * 1000; // 1 hour

  private generateToken(): string {
    return crypto.randomBytes(this.tokenLength).toString('hex');
  }

  private getCsrfToken(req: Request): string | null {
    const token = req.headers['x-csrf-token'] as string;
    return token || null;
  }

  private setCsrfToken(req: Request, res: Response): void {
    const sessionId = this.getSessionId(req);
    const now = Date.now();
    
    // Check if existing token is valid
    const existingToken = this.csrfTokens.get(sessionId);
    if (existingToken && existingToken.expires > now) {
      res.setHeader('X-CSRF-Token', existingToken.token);
      return;
    }

    // Generate new token
    const token = this.generateToken();
    const expires = now + this.tokenExpiry;
    
    this.csrfTokens.set(sessionId, { token, expires });
    res.setHeader('X-CSRF-Token', token);
    res.setHeader('X-CSRF-Expires', new Date(expires).toISOString());
  }

  private getSessionId(req: Request): string {
    // Use session ID or IP address as fallback
    const sessionId = (req as any).session?.id || 
                     req.headers['x-session-id'] || 
                     req.ip || 
                     req.connection.remoteAddress;
    return sessionId as string;
  }

  private validateCsrfToken(req: Request): boolean {
    const sessionId = this.getSessionId(req);
    const token = this.getCsrfToken(req);
    const storedToken = this.csrfTokens.get(sessionId);
    
    if (!token || !storedToken) {
      return false;
    }

    // Check if token matches
    if (token !== storedToken.token) {
      return false;
    }

    // Check if token is expired
    if (Date.now() > storedToken.expires) {
      this.csrfTokens.delete(sessionId);
      return false;
    }

    return true;
  }

  private isSafeMethod(method: string): boolean {
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    return safeMethods.includes(method.toUpperCase());
  }

  private isApiRequest(req: Request): boolean {
    const path = req.path;
    return path.startsWith('/api/') || path.startsWith('/admin/');
  }

  private isFormRequest(req: Request): boolean {
    const contentType = req.headers['content-type'] || '';
    return contentType.includes('application/x-www-form-urlencoded') || 
           contentType.includes('multipart/form-data');
  }

  use(req: Request, res: Response, next: NextFunction): void {
    // Skip CSRF for safe methods
    if (this.isSafeMethod(req.method)) {
      this.setCsrfToken(req, res);
      return next();
    }

    // Skip CSRF for API requests that don't need protection
    if (this.isApiRequest(req) && !this.isFormRequest(req)) {
      return next();
    }

    // Validate CSRF token for unsafe methods
    if (!this.validateCsrfToken(req)) {
      throw new HttpException(
        'CSRF token validation failed. Please refresh the page and try again.',
        HttpStatus.FORBIDDEN
      );
    }

    // Set new CSRF token for next request
    this.setCsrfToken(req, res);
    next();
  }
}

// CSRF token decorator for endpoints
export function RequireCsrf() {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const req = args[0];
      const res = args[1];
      
      // Check if CSRF token is valid
      const csrfToken = req.headers['x-csrf-token'];
      const sessionId = req.session?.id || req.ip;
      
      if (!csrfToken) {
        throw new HttpException(
          'CSRF token is required',
          HttpStatus.FORBIDDEN
        );
      }
      
      return originalMethod.apply(this, args);
    };
    return descriptor;
  };
}
