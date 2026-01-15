// Performance monitoring and optimization utilities

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  bundleSize?: number;
}

export interface PageMetrics {
  page: string;
  timestamp: number;
  metrics: PerformanceMetrics;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PageMetrics[] = [];
  private startTime: number = 0;
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Initialize performance monitoring
  init(): void {
    if (typeof window === 'undefined') return;

    this.startTime = performance.now();
    
    // Monitor navigation timing
    this.observeNavigation();
    
    // Monitor resource loading
    this.observeResources();
    
    // Monitor long tasks
    this.observeLongTasks();
    
    // Monitor memory usage
    this.observeMemory();
  }

  // Start measuring page load
  startPageLoad(pageName: string): void {
    if (typeof window === 'undefined') return;
    
    const startTime = performance.now();
    
    // Store start time for this page
    (window as any).__pageStartTime = startTime;
    (window as any).__currentPageName = pageName;
  }

  // End measuring page load
  endPageLoad(): PerformanceMetrics | null {
    if (typeof window === 'undefined') return null;
    
    const startTime = (window as any).__pageStartTime;
    const pageName = (window as any).__currentPageName;
    
    if (!startTime) return null;
    
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    // Get navigation timing if available
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const renderTime = navigation ? navigation.loadEventEnd - navigation.domContentLoadedEventEnd : 0;
    
    // Get memory usage if available
    const memoryUsage = this.getMemoryUsage();
    
    const metrics: PerformanceMetrics = {
      loadTime,
      renderTime,
      memoryUsage,
    };
    
    // Store metrics
    this.metrics.push({
      page: pageName || 'unknown',
      timestamp: Date.now(),
      metrics,
    });
    
    // Clean up
    delete (window as any).__pageStartTime;
    delete (window as any).__currentPageName;
    
    // Log performance
    this.logPerformance(pageName, metrics);
    
    return metrics;
  }

  // Observe navigation timing
  private observeNavigation(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            console.log('Navigation timing:', {
              domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
              totalTime: navEntry.loadEventEnd - navEntry.fetchStart,
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['navigation'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Navigation timing not supported:', error);
    }
  }

  // Observe resource loading
  private observeResources(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const resources = list.getEntriesByType('resource');
        const slowResources = resources.filter((resource) => 
          resource.duration > 1000 // Resources taking more than 1 second
        );
        
        if (slowResources.length > 0) {
          console.warn('Slow resources detected:', slowResources.map(r => ({
            name: r.name,
            duration: r.duration,
            size: (r as any).transferSize || 'unknown',
          })));
        }
      });
      
      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Resource timing not supported:', error);
    }
  }

  // Observe long tasks
  private observeLongTasks(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'longtask') {
            console.warn('Long task detected:', {
              duration: entry.duration,
              startTime: entry.startTime,
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['longtask'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Long task timing not supported:', error);
    }
  }

  // Observe memory usage
  private observeMemory(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        const memoryUsage = {
          used: Math.round(memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(memory.totalJSHeapSize / 1048576), // MB
          limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
        };
        
        // Log if memory usage is high
        if (memoryUsage.used > memoryUsage.limit * 0.8) {
          console.warn('High memory usage detected:', memoryUsage);
        }
      }, 30000); // Check every 30 seconds
    }
  }

  // Get current memory usage
  private getMemoryUsage(): number | undefined {
    if ('memory' in performance) {
      return Math.round((performance as any).memory.usedJSHeapSize / 1048576); // MB
    }
    return undefined;
  }

  // Log performance metrics
  private logPerformance(page: string, metrics: PerformanceMetrics): void {
    console.log(`Performance metrics for ${page}:`, {
      loadTime: `${metrics.loadTime.toFixed(2)}ms`,
      renderTime: `${metrics.renderTime.toFixed(2)}ms`,
      memoryUsage: metrics.memoryUsage ? `${metrics.memoryUsage}MB` : 'N/A',
    });
    
    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      this.sendToMonitoring(page, metrics);
    }
  }

  // Send metrics to monitoring service
  private sendToMonitoring(page: string, metrics: PerformanceMetrics): void {
    // In production, this would send to analytics/monitoring service
    try {
      // Example: Send to Google Analytics, DataDog, etc.
      if ((window as any).gtag) {
        (window as any).gtag('event', 'page_performance', {
          page_name: page,
          load_time: metrics.loadTime,
          render_time: metrics.renderTime,
          memory_usage: metrics.memoryUsage,
        });
      }
    } catch (error) {
      console.warn('Failed to send performance metrics:', error);
    }
  }

  // Get performance summary
  getSummary(): {
    averageLoadTime: number;
    averageRenderTime: number;
    slowestPages: Array<{ page: string; loadTime: number }>;
    totalPageViews: number;
  } {
    if (this.metrics.length === 0) {
      return {
        averageLoadTime: 0,
        averageRenderTime: 0,
        slowestPages: [],
        totalPageViews: 0,
      };
    }

    const totalLoadTime = this.metrics.reduce((sum, m) => sum + m.metrics.loadTime, 0);
    const totalRenderTime = this.metrics.reduce((sum, m) => sum + m.metrics.renderTime, 0);
    
    const slowestPages = this.metrics
      .map(m => ({ page: m.page, loadTime: m.metrics.loadTime }))
      .sort((a, b) => b.loadTime - a.loadTime)
      .slice(0, 5);

    return {
      averageLoadTime: totalLoadTime / this.metrics.length,
      averageRenderTime: totalRenderTime / this.metrics.length,
      slowestPages,
      totalPageViews: this.metrics.length,
    };
  }

  // Clear metrics
  clear(): void {
    this.metrics = [];
  }

  // Disconnect observers
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// React hook for performance monitoring
export const usePerformanceMonitor = (pageName: string) => {
  const startMonitoring = () => {
    performanceMonitor.startPageLoad(pageName);
  };

  const endMonitoring = () => {
    return performanceMonitor.endPageLoad();
  };

  return { startMonitoring, endMonitoring };
};

// Utility functions for performance optimization
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

// Image optimization utility
export const optimizeImage = (
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  } = {}
): string => {
  const { width, height, quality = 80, format = 'webp' } = options;
  
  // If it's already an optimized URL, return as is
  if (src.includes('?')) return src;
  
  // Build optimization parameters
  const params = new URLSearchParams();
  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());
  params.append('q', quality.toString());
  params.append('f', format);
  
  return `${src}?${params.toString()}`;
};

// Lazy loading utility
export const lazyLoad = (
  element: HTMLElement,
  callback: () => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null => {
  if (!('IntersectionObserver' in window)) {
    callback();
    return null;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
          observer.unobserve(element);
        }
      });
    },
    { threshold: 0.1, ...options }
  );

  observer.observe(element);
  return observer;
};

// Bundle size analyzer
export const analyzeBundleSize = (): {
  total: number;
  chunks: Array<{ name: string; size: number; percentage: number }>;
} => {
  // This would typically be done at build time
  // Here's a runtime approximation
  const total = 1500000; // 1.5MB estimated
  
  return {
    total,
    chunks: [
      { name: 'vendor', size: 500000, percentage: 33.3 },
      { name: 'main', size: 300000, percentage: 20.0 },
      { name: 'ui', size: 200000, percentage: 13.3 },
      { name: 'charts', size: 150000, percentage: 10.0 },
      { name: 'other', size: 350000, percentage: 23.4 },
    ],
  };
};
