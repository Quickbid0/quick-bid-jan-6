// Performance Optimization Utilities
import React from 'react';

// Lazy loading component wrapper
export const lazyLoad = (importFunc: () => Promise<any>) => {
  return React.lazy(importFunc);
};

// Image optimization utilities
export const optimizeImage = (src: string, width: number, height?: number) => {
  // Add image optimization parameters
  const params = new URLSearchParams({
    w: width.toString(),
    h: height?.toString() || '',
    q: '80', // quality
    fm: 'webp' // format
  });
  
  return `${src}?${params.toString()}`;
};

// Debounce utility for search and other input events
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Virtual scrolling utilities for large lists
export const calculateVisibleItems = (
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number
) => {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    totalItems
  );
  
  return { startIndex, endIndex };
};

// Cache utilities
class SimpleCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  private ttl: number;

  constructor(ttl: number = 5 * 60 * 1000) { // 5 minutes default
    this.ttl = ttl;
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const apiCache = new SimpleCache(5 * 60 * 1000); // 5 minutes
export const imageCache = new SimpleCache(10 * 60 * 1000); // 10 minutes

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
) => {
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  });
};

// Bundle size optimization utilities
export const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export const loadStylesheet = (href: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve();
    link.onerror = reject;
    document.head.appendChild(link);
  });
};

// Memory management utilities
export const cleanup = {
  // Clear event listeners
  clearEventListeners: (element: Element) => {
    const clone = element.cloneNode(true);
    element.parentNode?.replaceChild(clone, element);
    return clone;
  },
  
  // Clear intervals and timeouts
  clearTimers: () => {
    const highestId = window.setTimeout(() => {}, 0);
    for (let i = 0; i < highestId; i++) {
      window.clearInterval(i);
      window.clearTimeout(i);
    }
  }
};

// Service Worker registration for offline support
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

// Critical resource preloading
export const preloadCriticalResources = () => {
  const resources = [
    '/api/products/featured',
    '/api/user/profile',
    '/images/hero-banner.webp'
  ];

  resources.forEach(resource => {
    if (resource.startsWith('/api/')) {
      // Preload API calls
      fetch(resource, { priority: 'high' });
    } else {
      // Preload images
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = resource.endsWith('.webp') ? 'image' : 'fetch';
      link.href = resource;
      document.head.appendChild(link);
    }
  });
};

// Performance metrics collection
export const collectMetrics = () => {
  if ('performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const metrics = {
      // Core Web Vitals
      LCP: 0, // Largest Contentful Paint
      FID: 0, // First Input Delay
      CLS: 0, // Cumulative Layout Shift
      
      // Navigation timing
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstPaint: 0,
      firstContentfulPaint: 0
    };

    // Get paint timing
    const paintEntries = performance.getEntriesByType('paint');
    paintEntries.forEach(entry => {
      if (entry.name === 'first-paint') {
        metrics.firstPaint = entry.startTime;
      }
      if (entry.name === 'first-contentful-paint') {
        metrics.firstContentfulPaint = entry.startTime;
      }
    });

    return metrics;
  }
  return null;
};

// Resource hints for better performance
export const addResourceHints = () => {
  // DNS prefetch for external domains
  const domains = [
    'https://api.quickmela.com',
    'https://cdn.quickmela.com',
    'https://fonts.googleapis.com'
  ];

  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });

  // Preconnect for critical domains
  const criticalDomains = [
    'https://api.quickmela.com'
  ];

  criticalDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    document.head.appendChild(link);
  });
};

// Optimized fetch with caching and retry logic
export const optimizedFetch = async (
  url: string,
  options: RequestInit = {},
  retries: number = 3
): Promise<Response> => {
  const cacheKey = `${url}:${JSON.stringify(options)}`;
  
  // Check cache first
  const cached = apiCache.get(cacheKey);
  if (cached && !options.method || options.method === 'GET') {
    return new Response(JSON.stringify(cached), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Fetch with retry logic
  let lastError: Error;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Cache-Control': 'max-age=300', // 5 minutes
          ...options.headers
        }
      });

      if (response.ok) {
        // Cache successful GET requests
        if (!options.method || options.method === 'GET') {
          const data = await response.clone().json();
          apiCache.set(cacheKey, data);
        }
        
        return response;
      }
    } catch (error) {
      lastError = error as Error;
      if (i < retries - 1) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }

  throw lastError!;
};

// Bundle splitting utilities
export const loadComponent = (componentName: string) => {
  return import(`../components/${componentName}`).then(module => module.default);
};

export const loadPage = (pageName: string) => {
  return import(`../pages/${pageName}`).then(module => module.default);
};

// Memory leak prevention
export const preventMemoryLeaks = () => {
  // Clear unused event listeners
  window.addEventListener('beforeunload', () => {
    cleanup.clearTimers();
    apiCache.clear();
    imageCache.clear();
  });

  // Monitor memory usage (development only)
  if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        console.log('Memory usage:', {
          used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
          total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
        });
      }
    }, 30000); // Every 30 seconds
  }
};
