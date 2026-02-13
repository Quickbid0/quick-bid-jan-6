// Secure API Client with rate limiting and CSRF protection
import { RateLimiter, validateCSRFToken, generateCSRFToken, sanitizeInput } from './securityUtils';

class SecureAPIClient {
  private static readonly BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:4011'}/`;
  private static csrfToken: string | null = null;

  // Rate limiting configurations
  private static readonly RATE_LIMITS = {
    auth: { calls: 5, windowMs: 60000 }, // 5 auth calls per minute
    bids: { calls: 10, windowMs: 30000 }, // 10 bids per 30 seconds
    general: { calls: 100, windowMs: 60000 }, // 100 general API calls per minute
  };

  private static async getCSRFToken(): Promise<string> {
    if (!this.csrfToken) {
      this.csrfToken = generateCSRFToken();
    }
    return this.csrfToken;
  }

  private static checkRateLimit(endpoint: string): boolean {
    // Determine rate limit category based on endpoint
    let limitKey = 'general';
    if (endpoint.includes('/auth/')) {
      limitKey = 'auth';
    } else if (endpoint.includes('/bids')) {
      limitKey = 'bids';
    }

    const limit = this.RATE_LIMITS[limitKey as keyof typeof this.RATE_LIMITS];
    return RateLimiter.checkLimit(limitKey, limit.calls, limit.windowMs);
  }

  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Check rate limiting
    if (!this.checkRateLimit(endpoint)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Get CSRF token for state-changing requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method || 'GET')) {
      const csrfToken = await this.getCSRFToken();
      options.headers = {
        ...options.headers,
        'X-CSRF-Token': csrfToken,
        'X-Requested-With': 'XMLHttpRequest',
      };
    }

    // Add security headers
    const secureHeaders = {
      'Content-Type': 'application/json',
      'X-Client-Version': '1.0.0',
      'X-Requested-At': new Date().toISOString(),
      ...options.headers,
    };

    const url = endpoint.startsWith('http') ? endpoint : `${this.BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: secureHeaders,
        // Add timeout
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      // Check for CSRF token validation on server
      const responseCsrfToken = response.headers.get('X-CSRF-Token');
      if (responseCsrfToken && !validateCSRFToken(responseCsrfToken)) {
        throw new Error('CSRF token validation failed');
      }

      if (!response.ok) {
        // Handle different error types
        if (response.status === 429) {
          throw new Error('Too many requests. Please try again later.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Please check your permissions.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        // Log security-related errors
        if (error.message.includes('CSRF') || error.message.includes('Rate limit')) {
          console.warn('Security error:', error.message);
        }
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Sanitize input data
  private static sanitizeData(data: any): any {
    if (typeof data === 'string') {
      return sanitizeInput(data);
    } else if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    } else if (data && typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeData(value);
      }
      return sanitized;
    }
    return data;
  }

  // Public API methods
  static async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.makeRequest<T>(url, { method: 'GET' });
  }

  static async post<T>(endpoint: string, data?: any): Promise<T> {
    const sanitizedData = data ? this.sanitizeData(data) : undefined;
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: sanitizedData ? JSON.stringify(sanitizedData) : undefined,
    });
  }

  static async put<T>(endpoint: string, data?: any): Promise<T> {
    const sanitizedData = data ? this.sanitizeData(data) : undefined;
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: sanitizedData ? JSON.stringify(sanitizedData) : undefined,
    });
  }

  static async delete<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }

  // Authentication-specific methods with enhanced security
  static async login(credentials: { email: string; password: string }) {
    // Additional client-side validation
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    return this.post('api/auth/login', {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    });
  }

  static async register(userData: any) {
    // Enhanced validation for registration
    if (!userData.email || !userData.password || !userData.name) {
      throw new Error('Required fields are missing');
    }

    return this.post('/api/auth/register', userData);
  }

  // Bidding with enhanced security
  static async placeBid(auctionId: string, bidData: { amount: number; currency?: string }) {
    if (!auctionId || !bidData.amount || bidData.amount <= 0) {
      throw new Error('Invalid bid data');
    }

    return this.post(`/api/auctions/${auctionId}/bids`, bidData);
  }

  // Get rate limit status
  static getRateLimitStatus(): { auth: boolean; bids: boolean; general: boolean } {
    const now = Date.now();
    return {
      auth: RateLimiter.checkLimit('auth', 1, 1), // Just check if we can make a call
      bids: RateLimiter.checkLimit('bids', 1, 1),
      general: RateLimiter.checkLimit('general', 1, 1),
    };
  }

  // Reset rate limits (for testing)
  static resetRateLimits(): void {
    RateLimiter.reset('auth');
    RateLimiter.reset('bids');
    RateLimiter.reset('general');
  }
}

export default SecureAPIClient;
