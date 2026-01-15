// Security utilities for client-side protection

export interface SecurityConfig {
  enableCSRFProtection: boolean;
  enableXSSProtection: boolean;
  enableInputSanitization: boolean;
  maxInputLength: number;
  allowedDomains: string[];
}

class SecurityManager {
  private static instance: SecurityManager;
  private config: SecurityConfig;
  private csrfToken: string | null = null;

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  constructor() {
    this.config = {
      enableCSRFProtection: true,
      enableXSSProtection: true,
      enableInputSanitization: true,
      maxInputLength: 10000,
      allowedDomains: [
        'quickbid.example.com',
        'www.quickbid.example.com',
        'localhost:3000',
        '127.0.0.1:3000',
      ],
    };
  }

  // Initialize security measures
  init(): void {
    if (typeof window === 'undefined') return;

    this.setupCSRFProtection();
    this.setupXSSProtection();
    this.setupContentSecurityPolicy();
    this.detectSuspiciousActivity();
  }

  // Setup CSRF protection
  private setupCSRFProtection(): void {
    if (!this.config.enableCSRFProtection) return;

    // Generate CSRF token
    this.csrfToken = this.generateCSRFToken();
    
    // Add token to all forms
    document.addEventListener('DOMContentLoaded', () => {
      this.addCSRFTokenToForms();
    });

    // Intercept fetch requests
    this.interceptFetch();
  }

  // Generate CSRF token
  private generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Add CSRF token to forms
  private addCSRFTokenToForms(): void {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      if (!form.querySelector('input[name="csrf_token"]')) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'csrf_token';
        input.value = this.csrfToken || '';
        form.appendChild(input);
      }
    });
  }

  // Intercept fetch requests to add CSRF token
  private interceptFetch(): void {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [url, options = {}] = args;
      
      if (options.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method.toUpperCase())) {
        const headers = new Headers(options.headers);
        
        // Add CSRF token to headers
        if (this.csrfToken) {
          headers.set('X-CSRF-Token', this.csrfToken);
        }
        
        // Add security headers
        headers.set('X-Requested-With', 'XMLHttpRequest');
        
        options.headers = headers;
      }
      
      return originalFetch(url, options);
    };
  }

  // Setup XSS protection
  private setupXSSProtection(): void {
    if (!this.config.enableXSSProtection) return;

    // Sanitize dynamic content
    this.sanitizeDynamicContent();
    
    // Prevent inline scripts
    this.preventInlineScripts();
    
    // Validate URLs
    this.validateURLs();
  }

  // Sanitize dynamic content
  private sanitizeDynamicContent(): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.sanitizeElement(node as Element);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // Sanitize individual element
  private sanitizeElement(element: Element): void {
    // Remove dangerous attributes
    const dangerousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout'];
    dangerousAttrs.forEach(attr => {
      if (element.hasAttribute(attr)) {
        element.removeAttribute(attr);
      }
    });

    // Check for script tags
    if (element.tagName.toLowerCase() === 'script') {
      element.remove();
      return;
    }

    // Recursively sanitize children
    Array.from(element.children).forEach(child => {
      this.sanitizeElement(child);
    });
  }

  // Prevent inline scripts
  private preventInlineScripts(): void {
    const scriptTags = document.querySelectorAll('script');
    scriptTags.forEach(script => {
      if (script.innerHTML.includes('javascript:') || script.innerHTML.includes('eval(')) {
        script.remove();
      }
    });
  }

  // Validate URLs
  private validateURLs(): void {
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && !this.isValidURL(href)) {
        link.setAttribute('href', '#');
        console.warn('Invalid URL detected and blocked:', href);
      }
    });
  }

  // Check if URL is valid
  private isValidURL(url: string): boolean {
    try {
      const urlObj = new URL(url, window.location.href);
      
      // Allow same-origin URLs
      if (urlObj.origin === window.location.origin) {
        return true;
      }
      
      // Allow specific domains
      return this.config.allowedDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
      );
    } catch {
      return false;
    }
  }

  // Setup Content Security Policy monitoring
  private setupContentSecurityPolicy(): void {
    // Monitor CSP violations
    document.addEventListener('securitypolicyviolation', (event) => {
      console.warn('CSP Violation:', {
        blockedURI: event.blockedURI,
        violatedDirective: event.violatedDirective,
        originalPolicy: event.originalPolicy,
      });
      
      // Report to monitoring service
      this.reportSecurityViolation('CSP_VIOLATION', {
        blockedURI: event.blockedURI,
        violatedDirective: event.violatedDirective,
      });
    });
  }

  // Detect suspicious activity
  private detectSuspiciousActivity(): void {
    // Monitor for suspicious patterns
    this.monitorSuspiciousInputs();
    this.monitorRapidActions();
    this.monitorConsoleAccess();
  }

  // Monitor suspicious inputs
  private monitorSuspiciousInputs(): void {
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const value = (e.target as HTMLInputElement).value;
        
        // Check for suspicious patterns
        if (this.containsSuspiciousContent(value)) {
          console.warn('Suspicious input detected:', value);
          this.reportSecurityViolation('SUSPICIOUS_INPUT', { value });
        }
      });
    });
  }

  // Check for suspicious content
  private containsSuspiciousContent(value: string): boolean {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /expression\s*\(/i,
      /@import/i,
      /vbscript:/i,
      /data:text\/html/i,
    ];

    return suspiciousPatterns.some(pattern => pattern.test(value));
  }

  // Monitor rapid actions
  private monitorRapidActions(): void {
    let actionCount = 0;
    let lastActionTime = Date.now();
    
    document.addEventListener('click', () => {
      const now = Date.now();
      
      if (now - lastActionTime < 100) { // Less than 100ms between clicks
        actionCount++;
        
        if (actionCount > 10) { // More than 10 rapid clicks
          console.warn('Rapid clicking detected');
          this.reportSecurityViolation('RAPID_ACTIONS', { actionCount });
        }
      } else {
        actionCount = 0;
      }
      
      lastActionTime = now;
    });
  }

  // Monitor console access
  private monitorConsoleAccess(): void {
    const originalConsole = { ...console };
    
    // Override console methods in production
    if (process.env.NODE_ENV === 'production') {
      console.log = (...args) => {
        originalConsole.log(...args);
        this.reportSecurityViolation('CONSOLE_ACCESS', { method: 'log', args });
      };
      
      console.warn = (...args) => {
        originalConsole.warn(...args);
        this.reportSecurityViolation('CONSOLE_ACCESS', { method: 'warn', args });
      };
    }
  }

  // Report security violations
  private reportSecurityViolation(type: string, data: any): void {
    const violation = {
      type,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      data,
    };

    console.warn('Security violation detected:', violation);
    
    // Send to monitoring service
    this.sendToMonitoring(violation);
  }

  // Send to monitoring service
  private sendToMonitoring(violation: any): void {
    try {
      // Send to security monitoring endpoint
      fetch('/api/security/violations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(violation),
      }).catch(error => {
        console.warn('Failed to report security violation:', error);
      });
    } catch (error) {
      console.warn('Error reporting security violation:', error);
    }
  }

  // Sanitize input
  sanitizeInput(input: string): string {
    if (!this.config.enableInputSanitization) return input;
    
    // Check length
    if (input.length > this.config.maxInputLength) {
      throw new Error(`Input exceeds maximum length of ${this.config.maxInputLength}`);
    }
    
    // Remove dangerous characters
    const sanitized = input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/eval\s*\(/gi, '') // Remove eval calls
      .replace(/expression\s*\(/gi, ''); // Remove CSS expressions
    
    return sanitized.trim();
  }

  // Validate file upload
  validateFileUpload(file: File): { valid: boolean; error?: string } {
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds maximum limit of 10MB' };
    }
    
    // Check file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not allowed' };
    }
    
    // Check file name
    if (this.containsSuspiciousContent(file.name)) {
      return { valid: false, error: 'File name contains suspicious content' };
    }
    
    return { valid: true };
  }

  // Get CSRF token
  getCSRFToken(): string | null {
    return this.csrfToken;
  }

  // Update configuration
  updateConfig(config: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Get current configuration
  getConfig(): SecurityConfig {
    return { ...this.config };
  }
}

// Singleton instance
export const securityManager = SecurityManager.getInstance();

// React hook for security
export const useSecurity = () => {
  const sanitizeInput = (input: string): string => {
    return securityManager.sanitizeInput(input);
  };

  const validateFile = (file: File) => {
    return securityManager.validateFileUpload(file);
  };

  const getCSRFToken = () => {
    return securityManager.getCSRFToken();
  };

  return {
    sanitizeInput,
    validateFile,
    getCSRFToken,
  };
};

// Utility functions
export const escapeHTML = (str: string): string => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const validateURL = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Initialize security on module load
if (typeof window !== 'undefined') {
  securityManager.init();
}
