// Rate limiting utilities for API endpoints

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
  skipSuccessfulRequests?: boolean; // Skip successful requests from counting
  skipFailedRequests?: boolean; // Skip failed requests from counting
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  message?: string;
}

class RateLimiter {
  private static instance: RateLimiter;
  private stores: Map<string, RateLimitStore> = new Map();

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  // Create a rate limiter for a specific endpoint
  createLimiter(key: string, config: RateLimitConfig): RateLimitStore {
    const store = new RateLimitStore(config);
    this.stores.set(key, store);
    return store;
  }

  // Check rate limit for a specific endpoint
  checkLimit(key: string, identifier: string): RateLimitResult {
    const store = this.stores.get(key);
    if (!store) {
      // If no limiter exists, allow by default
      return { allowed: true, remaining: Infinity, resetTime: Date.now() };
    }
    return store.check(identifier);
  }

  // Get rate limiter by key
  getLimiter(key: string): RateLimitStore | undefined {
    return this.stores.get(key);
  }

  // Clear all rate limiters
  clear(): void {
    this.stores.clear();
  }
}

class RateLimitStore {
  private requests: Map<string, RequestRecord[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.cleanup();
  }

  // Check if request is allowed
  check(identifier: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get existing requests for this identifier
    let userRequests = this.requests.get(identifier) || [];
    
    // Remove expired requests
    userRequests = userRequests.filter(request => request.timestamp > windowStart);
    
    // Check if limit exceeded
    const allowed = userRequests.length < this.config.maxRequests;
    
    if (allowed) {
      // Add new request
      userRequests.push({ timestamp: now });
      this.requests.set(identifier, userRequests);
    }

    const remaining = Math.max(0, this.config.maxRequests - userRequests.length);
    const resetTime = now + this.config.windowMs;

    return {
      allowed,
      remaining,
      resetTime,
      message: allowed ? undefined : (this.config.message || 'Too many requests, please try again later.')
    };
  }

  // Clean up old records
  private cleanup(): void {
    setInterval(() => {
      const now = Date.now();
      const windowStart = now - this.config.windowMs;

      for (const [identifier, requests] of this.requests.entries()) {
        const validRequests = requests.filter(request => request.timestamp > windowStart);
        
        if (validRequests.length === 0) {
          this.requests.delete(identifier);
        } else {
          this.requests.set(identifier, validRequests);
        }
      }
    }, this.config.windowMs);
  }

  // Get statistics
  getStats(): {
    totalUsers: number;
    totalRequests: number;
    averageRequestsPerUser: number;
  } {
    let totalRequests = 0;
    
    for (const requests of this.requests.values()) {
      totalRequests += requests.length;
    }

    const totalUsers = this.requests.size;
    const averageRequestsPerUser = totalUsers > 0 ? totalRequests / totalUsers : 0;

    return {
      totalUsers,
      totalRequests,
      averageRequestsPerUser
    };
  }

  // Reset specific user
  resetUser(identifier: string): void {
    this.requests.delete(identifier);
  }

  // Reset all users
  reset(): void {
    this.requests.clear();
  }
}

interface RequestRecord {
  timestamp: number;
}

// Singleton instance
export const rateLimiter = RateLimiter.getInstance();

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // Authentication endpoints - stricter limits
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    message: 'Too many login attempts, please try again later.',
  },
  
  // API endpoints - moderate limits
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
    message: 'Rate limit exceeded, please try again later.',
  },
  
  // Bidding endpoints - stricter limits
  bidding: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 bids per minute
    message: 'Too many bids, please slow down.',
  },
  
  // File upload endpoints - very strict limits
  upload: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 3, // 3 uploads per minute
    message: 'Too many uploads, please try again later.',
  },
  
  // Search endpoints - lenient limits
  search: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 searches per minute
    message: 'Too many searches, please try again later.',
  },
  
  // Contact/support endpoints - strict limits
  contact: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5, // 5 contacts per hour
    message: 'Too many contact requests, please try again later.',
  },
} as const;

// Initialize rate limiters
export const initializeRateLimiters = (): void => {
  Object.entries(RATE_LIMITS).forEach(([key, config]) => {
    rateLimiter.createLimiter(key, config);
  });
};

// React hook for client-side rate limiting
export const useRateLimit = (key: string, identifier: string) => {
  const checkLimit = (): RateLimitResult => {
    return rateLimiter.checkLimit(key, identifier);
  };

  const canMakeRequest = (): boolean => {
    const result = checkLimit();
    return result.allowed;
  };

  const getRemainingRequests = (): number => {
    return checkLimit().remaining;
  };

  const getTimeUntilReset = (): number => {
    return checkLimit().resetTime - Date.now();
  };

  return {
    checkLimit,
    canMakeRequest,
    getRemainingRequests,
    getTimeUntilReset,
  };
};

// Express.js middleware for server-side rate limiting
export const createRateLimitMiddleware = (key: string, getIdentifier: (req: any) => string) => {
  return (req: any, res: any, next: any) => {
    const identifier = getIdentifier(req);
    const result = rateLimiter.checkLimit(key, identifier);
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': RATE_LIMITS[key as keyof typeof RATE_LIMITS]?.maxRequests || 'unknown',
      'X-RateLimit-Remaining': result.remaining,
      'X-RateLimit-Reset': new Date(result.resetTime).toUTCString(),
    });

    if (!result.allowed) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: result.message,
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      });
    }

    next();
  };
};

// Client-side rate limiting utility
export class ClientRateLimiter {
  private queue: Array<{ fn: () => Promise<any>; resolve: (value: any) => void; reject: (error: any) => void }> = [];
  private processing = false;

  constructor(private config: RateLimitConfig) {}

  // Execute function with rate limiting
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.processing) return;
    
    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) break;

      try {
        const result = await item.fn();
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      }

      // Wait between requests if needed
      if (this.queue.length > 0) {
        await this.delay(this.config.windowMs / this.config.maxRequests);
      }
    }

    this.processing = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Utility functions
export const getIPFromRequest = (req: any): string => {
  return req.ip || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         (req.connection?.socket ? req.connection.socket.remoteAddress : null) ||
         'unknown';
};

export const getUserFromRequest = (req: any): string => {
  return req.user?.id || 
         req.session?.userId || 
         getIPFromRequest(req);
};

// Rate limiting for specific actions
export const createBidRateLimiter = (userId: string): ClientRateLimiter => {
  return new ClientRateLimiter(RATE_LIMITS.bidding);
};

export const createSearchRateLimiter = (userId: string): ClientRateLimiter => {
  return new ClientRateLimiter(RATE_LIMITS.search);
};

// Initialize rate limiters on module load
initializeRateLimiters();
