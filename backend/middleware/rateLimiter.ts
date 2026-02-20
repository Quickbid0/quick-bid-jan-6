/**
 * FIX 27: Rate Limiting on Bid Endpoint (S-06)
 * Prevents bid spam: max 5 bids per 10 seconds per user
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const rateLimitStore: RateLimitStore = {};

export const bidRateLimiter = (
  windowMs: number = 10 * 1000, // 10 seconds
  maxRequests: number = 5
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Use userId if authenticated, fallback to IP
    const key = `bid:${req.user?.id || req.ip}`;
    const now = Date.now();

    // Initialize or check existing data
    if (!rateLimitStore[key]) {
      rateLimitStore[key] = { count: 0, resetTime: now + windowMs };
    }

    const limit = rateLimitStore[key];

    // Reset if window has passed
    if (now > limit.resetTime) {
      limit.count = 0;
      limit.resetTime = now + windowMs;
    }

    // Check if limit exceeded
    if (limit.count >= maxRequests) {
      const retryAfter = Math.ceil((limit.resetTime - now) / 1000);
      return res.status(429).json({
        error: 'Too many bids. Please wait before bidding again.',
        retryAfter,
      });
    }

    // Increment counter and continue
    limit.count++;
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - limit.count);
    res.setHeader('X-RateLimit-Reset', limit.resetTime);

    next();
  };
};

/**
 * Cleanup old entries (run periodically to prevent memory leak)
 */
export const cleanupRateLimitStore = (maxAge: number = 60 * 60 * 1000) => {
  const now = Date.now();
  for (const key in rateLimitStore) {
    if (now > rateLimitStore[key].resetTime + maxAge) {
      delete rateLimitStore[key];
    }
  }
};

// Clean up every 5 minutes
setInterval(() => cleanupRateLimitStore(), 5 * 60 * 1000);
