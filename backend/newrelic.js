'use strict';

/**
 * New Relic agent configuration.
 *
 * See lib/config/default.js in the agent distribution for a more complete
 * description of configuration variables.
 */
exports.config = {
  /**
   * Array of application names.
   */
  app_name: [process.env.NEW_RELIC_APP_NAME || 'QuickMela-Production'],

  /**
   * Your New Relic license key.
   */
  license_key: process.env.NEW_RELIC_LICENSE_KEY,

  /**
   * This setting controls distributed tracing.
   * Set to `true` for highest security in serverless environments.
   * Set to `false` to get full distributed tracing.
   */
  distributed_tracing: {
    enabled: true,
  },

  /**
   * You may want to disable logging in serverless environments.
   */
  logging: {
    level: 'info',
  },

  /**
   * Enable or disable APM.
   */
  agent_enabled: process.env.NODE_ENV === 'production',

  /**
   * Application logging.
   */
  application_logging: {
    forwarding: {
      enabled: true,
    },
    metrics: {
      enabled: true,
    },
    local_decorating: {
      enabled: true,
    },
  },

  /**
   * Attributes.
   */
  attributes: {
    enabled: true,
    include: [
      'request.parameters.*',
      'response.statusCode',
      'response.headers.contentType',
      'response.headers.contentLength',
    ],
    exclude: [
      'request.parameters.password',
      'request.parameters.credit_card',
      'request.headers.authorization',
    ],
  },

  /**
   * Rules engine.
   */
  rules: {
    ignore_status_codes: [404, 405],
  },

  /**
   * Transaction tracer.
   */
  transaction_tracer: {
    enabled: true,
    transaction_threshold: 0.5,
    record_sql: 'obfuscated',
    explain_threshold: 0.5,
  },

  /**
   * Error collector.
   */
  error_collector: {
    enabled: true,
    ignore_status_codes: [400, 401, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 421, 422, 423, 424, 425, 426, 428, 429, 431, 451],
  },

  /**
   * Browser monitoring.
   */
  browser_monitoring: {
    enabled: false, // Disable since we have frontend Sentry
  },

  /**
   * Slow queries.
   */
  slow_sql: {
    enabled: true,
    max_samples: 10,
  },

  /**
   * Custom events.
   */
  custom_insights_events: {
    enabled: true,
    max_samples_stored: 5000,
  },

  /**
   * Code level metrics.
   */
  code_level_metrics: {
    enabled: true,
  },

  /**
   * Security agent.
   */
  security: {
    enabled: false, // Disable for now
  },
};
