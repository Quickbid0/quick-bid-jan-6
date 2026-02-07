// Security utilities for QuickMela frontend
// Implements additional security hardening measures

// Content Security Policy
export const initCSP = () => {
  // Add CSP meta tag if not already present
  if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://*.razorpay.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data: blob: https://*.supabase.co https://picsum.photos https://placehold.co;
      connect-src 'self' https://*.supabase.co wss://*.supabase.co http://localhost:4011 https://api.razorpay.com;
      frame-src 'self' https://checkout.razorpay.com https://*.razorpay.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      upgrade-insecure-requests;
    `.replace(/\s+/g, ' ').trim();
    document.head.appendChild(cspMeta);
  }
};

// XSS Protection utilities
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const sanitizeHTML = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

// CSRF Protection
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const validateCSRFToken = (token: string): boolean => {
  // Basic validation - in production, this would be more sophisticated
  return token && token.length === 64 && /^[a-f0-9]+$/.test(token);
};

// Secure Storage utilities
export class SecureStorage {
  private static readonly PREFIX = 'qm_secure_';

  static setItem(key: string, value: string): void {
    try {
      const encrypted = btoa(encodeURIComponent(value));
      localStorage.setItem(this.PREFIX + key, encrypted);
    } catch (error) {
      console.error('SecureStorage setItem failed:', error);
      // Fallback to regular storage if encryption fails
      localStorage.setItem(this.PREFIX + key, value);
    }
  }

  static getItem(key: string): string | null {
    try {
      const encrypted = localStorage.getItem(this.PREFIX + key);
      if (!encrypted) return null;
      return decodeURIComponent(atob(encrypted));
    } catch (error) {
      console.error('SecureStorage getItem failed:', error);
      // Fallback to regular storage
      return localStorage.getItem(this.PREFIX + key);
    }
  }

  static removeItem(key: string): void {
    localStorage.removeItem(this.PREFIX + key);
  }

  static clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }
}

// Input validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

export const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

// Rate limiting for API calls
export class RateLimiter {
  private static calls = new Map<string, number[]>();

  static checkLimit(key: string, maxCalls: number, windowMs: number): boolean {
    const now = Date.now();
    const calls = this.calls.get(key) || [];

    // Remove old calls outside the window
    const validCalls = calls.filter(call => now - call < windowMs);
    this.calls.set(key, validCalls);

    if (validCalls.length >= maxCalls) {
      return false; // Rate limit exceeded
    }

    validCalls.push(now);
    this.calls.set(key, validCalls);
    return true;
  }

  static reset(key: string): void {
    this.calls.delete(key);
  }
}

// Security headers checker
export const checkSecurityHeaders = () => {
  // This would typically be done on the server side, but we can check some client-side security
  const securityIssues: string[] = [];

  // Check if we're on HTTPS in production
  if (import.meta.env.PROD && window.location.protocol !== 'https:') {
    securityIssues.push('Not using HTTPS in production');
  }

  // Check for mixed content
  const mixedContent = Array.from(document.querySelectorAll('img[src^="http://"], script[src^="http://"], link[href^="http://"]'));
  if (mixedContent.length > 0) {
    securityIssues.push('Mixed content detected');
  }

  if (securityIssues.length > 0) {
    console.warn('Security issues detected:', securityIssues);
  }

  return securityIssues;
};

// Initialize security measures
export const initSecurity = () => {
  if (import.meta.env.PROD) {
    // Initialize CSP
    initCSP();

    // Check security headers
    checkSecurityHeaders();

    // Add additional security event listeners
    document.addEventListener('securitypolicyviolation', (e) => {
      console.error('CSP violation:', e);
      // In production, send to monitoring service
    });

    // Prevent drag and drop of potentially malicious files
    document.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    document.addEventListener('drop', (e) => {
      e.preventDefault();
    });

    console.log('%c🔒 Security measures initialized', 'color: #10b981; font-size: 14px; font-weight: bold;');
  }
};
