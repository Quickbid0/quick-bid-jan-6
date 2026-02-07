// Production Service Worker Registration
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.log('Service Worker registration failed:', error);
    }
  }
};

// Production Error Reporting
export const setupErrorReporting = () => {
  if (import.meta.env.PROD) {
    // Global error handler
    window.addEventListener('error', (event) => {
      // Send to error reporting service
      console.error('Global error:', event.error);
      // In production, this would send to services like Sentry, LogRocket, etc.
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      // In production, this would send to error reporting service
    });
  }
};

// Production Analytics Setup
export const setupAnalytics = () => {
  if (import.meta.env.PROD) {
    // Basic analytics - in production, integrate with Google Analytics, Mixpanel, etc.
    const trackPageView = (page: string) => {
      console.log('Page view:', page);
      // In production, send to analytics service
    };

    // Track initial page load
    trackPageView(window.location.pathname);
  }
};
