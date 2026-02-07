import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

interface RateLimitStore {
  [key: string]: {
    requests: number;
    resetTime: number;
  };
}

@Injectable()
export class RateLimitingInterceptor implements NestInterceptor {
  private store: RateLimitStore = {};
  private configs: Map<string, RateLimitConfig> = new Map();

  constructor() {
    // Configure different rate limits for different endpoints
    // DEVELOPMENT: Much more lenient limits
    if (process.env.NODE_ENV === 'development') {
      this.configs.set('auth', {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 100, // Much higher for development
        message: 'Auth rate limit exceeded. Please wait before trying again.',
      });

      this.configs.set('admin', {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 1000, // Much higher for development
        message: 'Admin rate limit exceeded. Please contact support.',
      });

      this.configs.set('payment', {
        windowMs: 10 * 60 * 1000, // 10 minutes
        maxRequests: 100, // Much higher for development
        message: 'Payment rate limit exceeded. Please wait before trying again.',
      });

      this.configs.set('default', {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 1000, // Much higher for development
        message: 'Too many requests, please try again later.',
      });
    } else {
      // Production limits
      this.configs.set('auth', {
        windowMs: 5 * 60 * 1000, // 5 minutes
        maxRequests: 5,
        message: 'Auth rate limit exceeded. Please wait before trying again.',
      });

      this.configs.set('admin', {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 50,
        message: 'Admin rate limit exceeded. Please contact support.',
      });

      this.configs.set('payment', {
        windowMs: 10 * 60 * 1000, // 10 minutes
        maxRequests: 10,
        message: 'Payment rate limit exceeded. Please wait before trying again.',
      });

      this.configs.set('default', {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100,
        message: 'Too many requests, please try again later.',
      });
    }

    // Clean up old entries periodically
    setInterval(() => {
      const now = Date.now();
      Object.keys(this.store).forEach(key => {
        if (this.store[key].resetTime < now) {
          delete this.store[key];
        }
      });
    }, 60 * 1000); // Clean up every minute
  }

  private getConfig(context: ExecutionContext): RateLimitConfig {
    const request = context.switchToHttp().getRequest();
    const path = request.route?.path || request.path;
    
    // Determine rate limit based on path
    if (path.includes('/auth')) {
      return this.configs.get('auth')!;
    } else if (path.includes('/admin')) {
      return this.configs.get('admin')!;
    } else if (path.includes('/payment')) {
      return this.configs.get('payment')!;
    }
    
    return this.configs.get('default')!;
  }

  private getKey(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection.remoteAddress;
    const userAgent = request.get('user-agent') || 'unknown';
    const path = request.route?.path || request.path;
    return `${ip}:${userAgent}:${path}`;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const config = this.getConfig(context);
    const key = this.getKey(context);
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // Get or create rate limit record
    if (!this.store[key]) {
      this.store[key] = {
        requests: 0,
        resetTime: now + config.windowMs,
      };
    }

    // Check if window has expired
    if (windowStart > this.store[key].resetTime) {
      this.store[key] = {
        requests: 0,
        resetTime: now + config.windowMs,
      };
    }

    // Increment request count
    this.store[key].requests++;

    // Check if rate limit exceeded
    if (this.store[key].requests > config.maxRequests) {
      const resetTime = this.store[key].resetTime;
      const waitTime = Math.ceil((resetTime - now) / 1000);
      
      // Set rate limit headers
      const response = context.switchToHttp().getResponse();
      response.setHeader('Retry-After', `${waitTime}s`);
      response.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
      response.setHeader('X-RateLimit-Remaining', '0');
      response.setHeader('X-RateLimit-Reset', new Date(resetTime).toISOString());
      
      throw new HttpException(
        config.message || 'Too many requests, please try again later.',
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    // Add rate limit headers
    const response = context.switchToHttp().getResponse();
    response.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
    response.setHeader('X-RateLimit-Remaining', 
      Math.max(0, config.maxRequests - this.store[key].requests).toString()
    );
    response.setHeader('X-RateLimit-Reset', new Date(this.store[key].resetTime).toISOString());

    return next.handle().pipe(
      tap(() => {
        // Request processed successfully
      })
    );
  }
}
