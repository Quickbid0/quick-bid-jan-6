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

// Production Error Reporting with Sentry
export const setupErrorReporting = () => {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    try {
      // Dynamic import for Sentry to avoid bundling in development
      import('@sentry/react').then(({ init, captureException, captureMessage }) => {
        init({
          dsn: import.meta.env.VITE_SENTRY_DSN,
          environment: 'production',
          tracesSampleRate: 0.1,
          replaysOnErrorSampleRate: 1.0,
          replaysSessionSampleRate: 0.1,
          integrations: [],
        });

        // Global error handler
        window.addEventListener('error', (event) => {
          captureException(event.error);
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
          captureException(event.reason);
        });

        console.log('✅ Sentry error tracking enabled');
      });
    } catch (error) {
      console.warn('Failed to load Sentry:', error);
    }
  } else {
    setupFallbackErrorReporting();
  }
};

// Production Analytics Setup with Google Analytics
export const setupAnalytics = () => {
  if (import.meta.env.PROD && import.meta.env.VITE_GA_TRACKING_ID) {
    try {
      // Load Google Analytics
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_TRACKING_ID}`;
      document.head.appendChild(script);

      script.onload = () => {
        // Initialize Google Analytics
        (window as any).dataLayer = (window as any).dataLayer || [];
        function gtag(...args: any[]) {
          (window as any).dataLayer.push(args);
        }
        gtag('js', new Date());
        gtag('config', import.meta.env.VITE_GA_TRACKING_ID, {
          page_title: document.title,
          page_location: window.location.href,
        });

        // Track initial page view
        gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
        });

        console.log('✅ Google Analytics enabled');
      };
    } catch (error) {
      console.warn('Failed to load Google Analytics:', error);
    }
  }

  // Track page views for all analytics
  const trackPageView = (page: string) => {
    console.log('Page view:', page);
    // Amplitude tracking (already handled in analytics.ts)
  };

  // Track initial page load
  trackPageView(window.location.pathname);
};
