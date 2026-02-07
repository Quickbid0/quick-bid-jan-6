import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

// Simple in-memory rate limiting
class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();

  isAllowed(key: string, windowMs: number, max: number): boolean {
    const now = Date.now();
    const requestData = this.requests.get(key);

    if (!requestData || now > requestData.resetTime) {
      this.requests.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (requestData.count >= max) {
      return false;
    }

    requestData.count++;
    return true;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, data] of this.requests.entries()) {
      if (now > data.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

const rateLimiter = new RateLimiter();

// Clean up expired entries every 5 minutes
setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);

// Rate limiting middleware factory
export const createRateLimit = (windowMs: number, max: number, message: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    
    if (!rateLimiter.isAllowed(key, windowMs, max)) {
      return res.status(429).json({ error: message });
    }
    
    next();
  };
};

// Rate limiters for different endpoints
export const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many authentication attempts, please try again later'
);

export const generalRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests
  'Too many requests, please try again later'
);

export const bidRateLimit = createRateLimit(
  60 * 1000, // 1 minute
  10, // 10 bids per minute
  'Too many bids, please wait before bidding again'
);

export const paymentRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  3, // 3 payment attempts
  'Too many payment attempts, please try again later'
);

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://api.razorpay.com https://lyhxzcfsbpufswqrumqd.supabase.co"
  );
  
  next();
};

// Input validation and sanitization
export class SecurityValidator {
  // Validate and sanitize email
  static validateEmail(email: string): { valid: boolean; sanitized?: string; error?: string } {
    if (!email || typeof email !== 'string') {
      return { valid: false, error: 'Email is required' };
    }

    const sanitized = validator.escape(email.trim().toLowerCase());
    
    if (!validator.isEmail(sanitized)) {
      return { valid: false, error: 'Invalid email format' };
    }

    if (sanitized.length > 255) {
      return { valid: false, error: 'Email too long' };
    }

    return { valid: true, sanitized };
  }

  // Validate and sanitize password
  static validatePassword(password: string): { valid: boolean; error?: string } {
    if (!password || typeof password !== 'string') {
      return { valid: false, error: 'Password is required' };
    }

    if (password.length < 8) {
      return { valid: false, error: 'Password must be at least 8 characters long' };
    }

    if (password.length > 128) {
      return { valid: false, error: 'Password too long' };
    }

    // Check for strong password requirements
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return { 
        valid: false, 
        error: 'Password must contain uppercase, lowercase, numbers, and special characters' 
      };
    }

    return { valid: true };
  }

  // Validate and sanitize name
  static validateName(name: string): { valid: boolean; sanitized?: string; error?: string } {
    if (!name || typeof name !== 'string') {
      return { valid: false, error: 'Name is required' };
    }

    const trimmed = name.trim();
    
    if (trimmed.length < 2) {
      return { valid: false, error: 'Name must be at least 2 characters long' };
    }

    if (trimmed.length > 100) {
      return { valid: false, error: 'Name too long' };
    }

    // Allow only letters, spaces, and basic punctuation
    const sanitized = validator.escape(trimmed);
    
    if (!/^[a-zA-Z\s\-'.]+$/.test(sanitized)) {
      return { valid: false, error: 'Name contains invalid characters' };
    }

    return { valid: true, sanitized };
  }

  // Validate and sanitize phone number
  static validatePhone(phone: string): { valid: boolean; sanitized?: string; error?: string } {
    if (!phone || typeof phone !== 'string') {
      return { valid: false, error: 'Phone number is required' };
    }

    const sanitized = validator.escape(phone.trim());
    
    // Validate Indian phone numbers (E.164 format)
    if (!validator.isMobilePhone(sanitized, 'en-IN')) {
      return { valid: false, error: 'Invalid phone number format' };
    }

    return { valid: true, sanitized };
  }

  // Validate monetary amount
  static validateAmount(amount: any, min: number = 0, max: number = 10000000): { valid: boolean; sanitized?: number; error?: string } {
    const num = parseFloat(amount);
    
    if (isNaN(num)) {
      return { valid: false, error: 'Invalid amount format' };
    }

    if (num < min) {
      return { valid: false, error: `Amount must be at least ${min}` };
    }

    if (num > max) {
      return { valid: false, error: `Amount cannot exceed ${max}` };
    }

    // Check for reasonable decimal places (max 2 for currency)
    if (num.toString().split('.')[1]?.length > 2) {
      return { valid: false, error: 'Amount can have maximum 2 decimal places' };
    }

    return { valid: true, sanitized: num };
  }

  // Validate UUID
  static validateUUID(uuid: string): { valid: boolean; error?: string } {
    if (!uuid || typeof uuid !== 'string') {
      return { valid: false, error: 'ID is required' };
    }

    if (!validator.isUUID(uuid)) {
      return { valid: false, error: 'Invalid ID format' };
    }

    return { valid: true };
  }

  // Basic HTML sanitization
  static sanitizeHTML(html: string): string {
    // Remove script tags and dangerous attributes
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  }

  // Validate and sanitize auction data
  static validateAuctionData(data: any): { valid: boolean; sanitized?: any; errors: string[] } {
    const errors: string[] = [];
    const sanitized: any = {};

    // Validate title
    if (data.title) {
      const titleResult = this.validateName(data.title);
      if (!titleResult.valid) {
        errors.push(`Title: ${titleResult.error}`);
      } else {
        sanitized.title = titleResult.sanitized;
      }
    }

    // Validate description
    if (data.description) {
      if (typeof data.description !== 'string') {
        errors.push('Description must be a string');
      } else if (data.description.length > 5000) {
        errors.push('Description too long (max 5000 characters)');
      } else {
        sanitized.description = this.sanitizeHTML(data.description);
      }
    }

    // Validate start price
    if (data.startPrice !== undefined) {
      const priceResult = this.validateAmount(data.startPrice, 1, 10000000);
      if (!priceResult.valid) {
        errors.push(`Start price: ${priceResult.error}`);
      } else {
        sanitized.startPrice = priceResult.sanitized;
      }
    }

    // Validate reserve price
    if (data.reservePrice !== undefined) {
      const reserveResult = this.validateAmount(data.reservePrice, 1, 10000000);
      if (!reserveResult.valid) {
        errors.push(`Reserve price: ${reserveResult.error}`);
      } else {
        sanitized.reservePrice = reserveResult.sanitized;
      }
    }

    // Validate min increment
    if (data.minIncrement !== undefined) {
      const incrementResult = this.validateAmount(data.minIncrement, 0, 1000000);
      if (!incrementResult.valid) {
        errors.push(`Minimum increment: ${incrementResult.error}`);
      } else {
        sanitized.minIncrement = incrementResult.sanitized;
      }
    }

    // Validate end time
    if (data.endTime) {
      const endTime = new Date(data.endTime);
      const now = new Date();
      const minEndTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

      if (isNaN(endTime.getTime())) {
        errors.push('Invalid end time format');
      } else if (endTime <= minEndTime) {
        errors.push('Auction must end at least 1 hour from now');
      } else {
        sanitized.endTime = endTime.toISOString();
      }
    }

    return {
      valid: errors.length === 0,
      sanitized: errors.length === 0 ? sanitized : undefined,
      errors
    };
  }

  // Validate bid data
  static validateBidData(data: any): { valid: boolean; sanitized?: any; errors: string[] } {
    const errors: string[] = [];
    const sanitized: any = {};

    // Validate auction ID
    if (data.auctionId) {
      const uuidResult = this.validateUUID(data.auctionId);
      if (!uuidResult.valid) {
        errors.push(`Auction ID: ${uuidResult.error}`);
      } else {
        sanitized.auctionId = data.auctionId;
      }
    }

    // Validate amount
    if (data.amount !== undefined) {
      const amountResult = this.validateAmount(data.amount, 1, 10000000);
      if (!amountResult.valid) {
        errors.push(`Amount: ${amountResult.error}`);
      } else {
        sanitized.amount = amountResult.sanitized;
      }
    }

    // Validate bid type
    if (data.type) {
      const validTypes = ['manual', 'auto', 'admin_override'];
      if (!validTypes.includes(data.type)) {
        errors.push('Invalid bid type');
      } else {
        sanitized.type = data.type;
      }
    }

    return {
      valid: errors.length === 0,
      sanitized: errors.length === 0 ? sanitized : undefined,
      errors
    };
  }
}

// CSRF protection middleware (simplified)
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GET requests
  if (req.method === 'GET') {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'] as string;
  
  // For now, we'll use a simple token-based approach
  // In production, this should be more sophisticated
  if (!csrfToken || csrfToken.length < 10) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
};

// SQL injection protection
export const sanitizeSQLParams = (params: any): any => {
  if (typeof params !== 'object' || params === null) {
    return params;
  }

  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      // Basic SQL injection protection
      sanitized[key] = value.replace(/['"\\;]/g, '');
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => sanitizeSQLParams(item));
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeSQLParams(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

// Security audit logging
export class SecurityLogger {
  static logSecurityEvent(event: {
    type: 'auth_failure' | 'sql_injection_attempt' | 'xss_attempt' | 'csrf_failure' | 'rate_limit_exceeded';
    userId?: string;
    ip: string;
    userAgent?: string;
    details?: any;
  }) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: event.type,
      userId: event.userId || null,
      ip: event.ip,
      userAgent: event.userAgent || null,
      details: event.details || null,
      severity: this.getSeverityLevel(event.type)
    };

    console.warn('SECURITY EVENT:', logEntry);
    
    // In production, this would go to a security monitoring system
    // For now, we'll just log it
  }

  private static getSeverityLevel(type: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (type) {
      case 'auth_failure':
        return 'medium';
      case 'sql_injection_attempt':
      case 'xss_attempt':
        return 'high';
      case 'csrf_failure':
        return 'medium';
      case 'rate_limit_exceeded':
        return 'low';
      default:
        return 'medium';
    }
  }
}

// Input validation middleware
export const validateInput = (validator: (data: any) => { valid: boolean; errors: string[]; sanitized?: any }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = validator(req.body);
    
    if (!result.valid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.errors
      });
    }
    
    // Replace request body with sanitized data if available
    if (result.sanitized) {
      req.body = result.sanitized;
    }
    
    next();
  };
};

// IP-based rate limiting
export const createIPRateLimit = (windowMs: number, max: number, message: string) => {
  return createRateLimit(windowMs, max, message);
};
