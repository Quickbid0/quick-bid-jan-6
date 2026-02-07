import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}

interface RateLimitStore {
  [key: string]: {
    requests: number;
    resetTime: number;
  };
}

@Injectable()
export class RateLimitingMiddleware implements NestMiddleware {
  private store: RateLimitStore = {};
  private options: RateLimitOptions;

  constructor() {
    this.options = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100, // 100 requests per window
      message: 'Too many requests, please try again later.',
      skipSuccessfulRequests: true,
    };

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

  configure(options?: Partial<RateLimitOptions>) {
    this.options = { ...this.options, ...options };
  }

  private getKey(request: Request): string {
    // Use IP address as key for rate limiting
    const ip = request.ip || request.connection.remoteAddress;
    const userAgent = request.get('user-agent') || 'unknown';
    return `${ip}:${userAgent}`;
  }

  private isSuccessfulRequest(statusCode: number): boolean {
    return this.options.skipSuccessfulRequests && 
           statusCode >= 200 && statusCode < 300;
  }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const key = this.getKey(req);
    const now = Date.now();
    const windowStart = now - this.options.windowMs;
    
    // Get or create rate limit record
    if (!this.store[key]) {
      this.store[key] = {
        requests: 0,
        resetTime: now + this.options.windowMs,
      };
    }

    // Check if window has expired
    if (windowStart > this.store[key].resetTime) {
      this.store[key] = {
        requests: 0,
        resetTime: now + this.options.windowMs,
      };
    }

    // Increment request count for non-successful requests
    if (!this.isSuccessfulRequest(res.statusCode)) {
      this.store[key].requests++;
    }

    // Check if rate limit exceeded
    if (this.store[key].requests >= this.options.maxRequests) {
      const resetTime = this.store[key].resetTime;
      const waitTime = Math.ceil((resetTime - now) / 1000);
      
      // Set rate limit headers
      res.setHeader('Retry-After', `${waitTime}s`);
      res.setHeader('X-RateLimit-Limit', this.options.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', new Date(resetTime).toISOString());
      
      throw new HttpException(
        this.options.message || 'Too many requests, please try again later.',
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', this.options.maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', 
      Math.max(0, this.options.maxRequests - this.store[key].requests).toString()
    );
    res.setHeader('X-RateLimit-Reset', new Date(this.store[key].resetTime).toISOString());

    next();
  }
}
