// src/utils/performanceMonitoring.ts
// Production Performance Monitoring

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
  userAgent: string;
}

interface WebVitalsMetric {
  name: string;
  value: number;
  id: string;
  delta: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private webVitalsMetrics: WebVitalsMetric[] = [];

  constructor() {
    if (import.meta.env.PROD) {
      this.initPerformanceObserver();
      this.initWebVitals();
    }
  }

  private initPerformanceObserver() {
    try {
      // Core Web Vitals and other performance metrics
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const metric: PerformanceMetric = {
            name: entry.name,
            value: entry.startTime,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
          };

          this.metrics.push(metric);

          // Send to analytics if significant
          if (this.shouldReportMetric(entry)) {
            this.reportMetric(metric);
          }
        }
      });

      // Observe various performance metrics
      observer.observe({
        entryTypes: [
          'largest-contentful-paint',
          'first-input',
          'layout-shift',
          'paint',
          'navigation'
        ]
      });

      console.log('✅ Performance monitoring enabled');
    } catch (error) {
      console.warn('Performance monitoring not supported:', error);
    }
  }

  private initWebVitals() {
    // Web Vitals monitoring
    if ('web-vitals' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        // Core Web Vitals
        getCLS(this.handleWebVitals);
        getFID(this.handleWebVitals);
        getFCP(this.handleWebVitals);
        getLCP(this.handleWebVitals);
        getTTFB(this.handleWebVitals);
      }).catch(error => {
        console.warn('Web Vitals library not available:', error);
      });
    }
  }

  private handleWebVitals = (metric: WebVitalsMetric) => {
    this.webVitalsMetrics.push(metric);

    // Report Core Web Vitals
    this.reportWebVitals(metric);
  };

  private shouldReportMetric(entry: PerformanceEntry): boolean {
    // Report significant performance issues
    switch (entry.entryType) {
      case 'largest-contentful-paint':
        return entry.startTime > 2500; // LCP > 2.5s
      case 'first-input':
        const fidEntry = entry as PerformanceEventTiming;
        return fidEntry.processingStart - fidEntry.startTime > 100; // FID > 100ms
      case 'layout-shift':
        return entry.startTime > 0.1; // CLS > 0.1
      default:
        return false;
    }
  }

  private reportMetric(metric: PerformanceMetric) {
    // Send to analytics service
    if (import.meta.env.PROD) {
      try {
        // Import analytics dynamically to avoid circular dependencies
        import('./analytics').then(({ trackPerformanceMetric }) => {
          trackPerformanceMetric(metric.name, metric.value);
        });
      } catch (error) {
        console.warn('Failed to report performance metric:', error);
      }
    }

    console.log('Performance metric:', metric);
  }

  private reportWebVitals(metric: WebVitalsMetric) {
    if (import.meta.env.PROD) {
      try {
        import('./analytics').then(({ trackPerformanceMetric }) => {
          trackPerformanceMetric(`web_vitals_${metric.name}`, metric.value);
        });
      } catch (error) {
        console.warn('Failed to report Web Vitals:', error);
      }
    }

    console.log('Web Vitals:', metric);
  }

  // Public methods for manual performance tracking
  public trackCustomMetric(name: string, value: number, unit: string = 'ms') {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.metrics.push(metric);
    this.reportMetric(metric);
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getWebVitals(): WebVitalsMetric[] {
    return [...this.webVitalsMetrics];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();
