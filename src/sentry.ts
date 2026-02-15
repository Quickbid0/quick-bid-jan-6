// src/sentry.ts
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

// Initialize Sentry for React frontend
Sentry.init({
  // Use environment variable - never hardcode DSN
  dsn: import.meta.env.VITE_SENTRY_DSN,

  // Environment
  environment: import.meta.env.VITE_APP_ENVIRONMENT || 'production',

  // Performance monitoring
  tracesSampleRate: 0.1, // 10% for production (not 1.0 for cost control)

  // Enable profiling for performance insights
  profilesSampleRate: 0.1, // 10% profiling sample rate

  // Integrations
  integrations: [
    // Enable automatic instrumentation for React
    new BrowserTracing({
      // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: ['localhost', /^https:\/\/quickmela\.netlify\.app/],
    }),
    // Replay disabled - requires @sentry/replay package
    // new Sentry.Replay({
    //   // Enable PII (Personally Identifiable Information) scrubbing
    //   maskAllText: true,
    //   blockAllMedia: true,
    // }),
  ],

  // Release tracking
  release: import.meta.env.VITE_APP_VERSION,

  // Sampling rates optimized for production
  sampleRate: 1.0, // Sample all errors

  // Before send hook for data sanitization
  beforeSend: (event, hint) => {
    // Remove sensitive data from events
    if (event.request?.data) {
      // Sanitize request data
      const sanitizedData = { ...event.request.data };
      // Remove passwords, tokens, credit cards, etc.
      delete sanitizedData.password;
      delete sanitizedData.token;
      delete sanitizedData.creditCard;
      delete sanitizedData.cvv;
      event.request.data = sanitizedData;
    }

    return event;
  },

  // Replays
  replaysSessionSampleRate: 0.1, // 10% of sessions will be recorded
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors will be recorded

  // Debug mode (disable in production)
  debug: import.meta.env.DEV,

  // Server name for distributed tracing
  serverName: 'QuickMela-Frontend',

  // Max breadcrumbs for context
  maxBreadcrumbs: 50,
});
