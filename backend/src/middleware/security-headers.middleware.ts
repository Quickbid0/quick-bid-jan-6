import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  private readonly isProduction = process.env.NODE_ENV === 'production';

  private getSecurityHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      // Basic security headers
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': this.getPermissionsPolicy(),
    };

    // Production-only headers
    if (this.isProduction) {
      headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
      headers['Content-Security-Policy'] = this.getContentSecurityPolicy();
    }

    return headers;
  }

  private getContentSecurityPolicy(): string {
    const directives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google-analytics.com https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://api.quickbid.com https://quickbid.com https://www.google-analytics.com",
      "media-src 'self' https:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ];

    return directives.join('; ');
  }

  private getPermissionsPolicy(): string {
    const policies = [
      'geolocation=()',
      'microphone=()',
      'camera=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
      'ambient-light-sensor=()',
      'autoplay=(self)',
      'encrypted-media=(self)',
      'fullscreen=(self)',
      'picture-in-picture=(self)',
    ];

    return policies.join(', ');
  }

  private getCacheHeaders(): Record<string, string> {
    return {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
    };
  }

  private getApiHeaders(): Record<string, string> {
    return {
      'X-API-Version': '1.0.0',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Expose-Headers': 'X-Total-Count, X-Page-Count, X-Current-Page, X-Per-Page',
    };
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const path = req.path;
    const isApiRequest = path.startsWith('/api/') || path.startsWith('/admin/');
    const isStaticRequest = path.startsWith('/assets/') || path.startsWith('/images/');

    // Apply security headers
    const securityHeaders = this.getSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Apply API-specific headers
    if (isApiRequest) {
      const apiHeaders = this.getApiHeaders();
      Object.entries(apiHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
    }

    // Apply cache headers for sensitive pages
    if (path.includes('/auth/') || path.includes('/admin/') || path.includes('/profile/')) {
      const cacheHeaders = this.getCacheHeaders();
      Object.entries(cacheHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
    }

    // Apply static asset caching
    if (isStaticRequest) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('ETag', 'W/"' + Date.now() + '"');
    }

    // Add security-related response headers
    res.setHeader('X-Request-ID', this.generateRequestId());
    res.setHeader('X-Response-Time', Date.now().toString());

    next();
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

// Security headers decorator for endpoints
export function SecurityHeaders(options?: {
  csp?: string;
  hsts?: boolean;
  frameOptions?: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
}) {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const req = args[0];
      const res = args[1];
      
      // Apply custom security headers
      if (options?.csp) {
        res.setHeader('Content-Security-Policy', options.csp);
      }
      
      if (options?.hsts) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      }
      
      if (options?.frameOptions) {
        res.setHeader('X-Frame-Options', options.frameOptions);
      }
      
      return originalMethod.apply(this, args);
    };
    return descriptor;
  };
}
