// src/instrument.ts
// IMPORTANT: This file must be imported BEFORE any other imports in main.ts
// It initializes Sentry before NestJS application starts

import * as Sentry from '@sentry/nestjs';
import { ProfilingIntegration } from '@sentry/profiling-node';

// Initialize Sentry for production monitoring
Sentry.init({
  // Use environment variable - never hardcode DSN
  dsn: process.env.SENTRY_DSN_BACKEND,

  // Environment
  environment: process.env.SENTRY_ENVIRONMENT || 'production',

  // Enable tracing for performance monitoring
  tracesSampleRate: 0.1, // 10% for production (not 1.0 for cost control)

  // Enable profiling for performance insights
  profilesSampleRate: 0.1, // 10% profiling sample rate

  // Integrations
  integrations: [
    // Enable automatic instrumentation for NestJS
    // new Sentry.Integrations.Http({ tracing: true }),
    // new Sentry.Integrations.Console(),
    // new Sentry.Integrations.OnUncaughtException(),
    // new Sentry.Integrations.OnUnhandledRejection(),

    // Profiling integration for performance monitoring
    // new ProfilingIntegration(),
  ],

  // Release tracking
  release: process.env.npm_package_version,

  // Sampling rates optimized for production
  sampleRate: 1.0, // Sample all errors

  // Before send hook for data sanitization
  beforeSend: (event, hint) => {
    // Remove sensitive data from events
    if (event.request?.data) {
      // Sanitize request data
      const sanitizedData = { ...event.request.data };
      // Remove passwords, tokens, etc.
      delete sanitizedData.password;
      delete sanitizedData.token;
      delete sanitizedData.secret;
      event.request.data = sanitizedData;
    }

    return event;
  },

  // Debug mode (disable in production)
  debug: process.env.NODE_ENV !== 'production',

  // Server name for distributed tracing
  serverName: 'QuickMela-Backend',

  // Max breadcrumbs for context
  maxBreadcrumbs: 50,
});
