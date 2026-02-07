import { Injectable, NestMiddleware, ExecutionContext, CallHandler, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';

interface RateLimitInfo {
  count: number;
  resetTime: Date;
  windowMs: number;
}

interface AttemptInfo {
  count: number;
  lastAttempt: Date;
  lockUntil?: Date;
}

// In-memory storage for rate limiting and brute force protection
const rateLimitStore = new Map<string, RateLimitInfo>();
const attemptStore = new Map<string, AttemptInfo>();

@Injectable()
export class RateLimitGuard implements NestMiddleware {
  constructor() {}

  use(req: Request, res: Response, next: CallHandler) {
    const clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'] || '';
    
    // Skip rate limiting for health checks and static assets
    if (req.path.startsWith('/health') || req.path.startsWith('/assets') || req.path.startsWith('/favicon')) {
      return next();
    }

    // Apply stricter limits to auth endpoints
    const isAuthEndpoint = req.path.startsWith('/auth/');
    const maxRequests = isAuthEndpoint ? 5 : 100; // 5 requests per minute for auth, 100 for others
    const windowMs = 60 * 1000; // 1 minute window

    const now = new Date();
    const key = `${clientIp}:${req.path}`;
    
    // Get current rate limit info
    let rateLimitInfo = rateLimitStore.get(key);
    
    if (!rateLimitInfo || now > rateLimitInfo.resetTime) {
      rateLimitInfo = {
        count: 1,
        resetTime: new Date(now.getTime() + windowMs),
        windowMs,
      };
      rateLimitStore.set(key, rateLimitInfo);
    } else if (now <= rateLimitInfo.resetTime) {
      if (rateLimitInfo.count >= maxRequests) {
        const resetIn = Math.ceil((rateLimitInfo.resetTime.getTime() - now.getTime()) / 1000);
        
        res.setHeader('Retry-After', resetIn.toString());
        res.setHeader('X-RateLimit-Limit', maxRequests.toString());
        res.setHeader('X-RateLimit-Remaining', '0');
        res.setHeader('X-RateLimit-Reset', rateLimitInfo.resetTime.toUTCString());
        
        // Log rate limit exceeded
        console.warn(`🚨 Rate limit exceeded for ${clientIp} on ${req.path}: ${rateLimitInfo.count}/${maxRequests}`);
        
        return res.status(429).json({
          message: isAuthEndpoint 
            ? 'Too many authentication attempts. Please try again later.'
            : 'Rate limit exceeded. Please slow down your requests.',
          retryAfter: resetIn,
        });
      }
      
      rateLimitInfo.count++;
    } else {
      // Reset window has passed, start fresh
      rateLimitInfo = {
        count: 1,
        resetTime: new Date(now.getTime() + windowMs),
        windowMs,
      };
      rateLimitStore.set(key, rateLimitInfo);
    }

    // Check for brute force attempts on auth endpoints
    if (isAuthEndpoint) {
      const attemptKey = `${clientIp}:attempts`;
      let attemptInfo = attemptStore.get(attemptKey);
      
      if (!attemptInfo) {
        attemptInfo = {
          count: 1,
          lastAttempt: now,
        };
      } else {
        // Reset if last attempt was more than 15 minutes ago
        if (now.getTime() - attemptInfo.lastAttempt.getTime() > 15 * 60 * 1000) {
          attemptInfo = {
            count: 1,
            lastAttempt: now,
          };
        } else {
          attemptInfo.count++;
          attemptInfo.lastAttempt = now;
          
          // Lock account after 5 failed attempts
          if (attemptInfo.count >= 5) {
            attemptInfo.lockUntil = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes lock
            
            console.warn(`🚨 Account locked for ${clientIp} due to brute force attempts`);
            
            return res.status(429).json({
              message: 'Account temporarily locked due to too many failed attempts. Please try again later.',
              lockUntil: attemptInfo.lockUntil,
            });
          }
        }
      }
      
      attemptStore.set(attemptKey, attemptInfo);
      
      // Add security headers
      if (attemptInfo.count > 2) {
        res.setHeader('X-Auth-Attempts', attemptInfo.count.toString());
        res.setHeader('X-Auth-Lock-Remaining', attemptInfo.lockUntil 
          ? Math.ceil((attemptInfo.lockUntil.getTime() - now.getTime()) / 1000 / 60)
          : '0');
      }
    }

    // Add rate limit headers for all requests
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - rateLimitInfo.count).toString());
    res.setHeader('X-RateLimit-Reset', rateLimitInfo.resetTime.toUTCString());

    // Log suspicious activity
    if (rateLimitInfo.count > maxRequests * 0.8) {
      console.warn(`🚨 High rate of requests detected from ${clientIp}: ${rateLimitInfo.count}/${maxRequests} on ${req.path}`);
    }

    next();
  }
}
