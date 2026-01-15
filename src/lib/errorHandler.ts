// Centralized error handling utility

export enum ErrorType {
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  DATABASE = 'DATABASE',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  code?: string;
  details?: any;
  timestamp: string;
  userId?: string;
  context?: string;
}

export class ApplicationError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly code?: string;
  public readonly details?: any;
  public readonly timestamp: string;
  public readonly userId?: string;
  public readonly context?: string;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    code?: string,
    details?: any,
    userId?: string,
    context?: string
  ) {
    super(message);
    this.name = 'ApplicationError';
    this.type = type;
    this.severity = severity;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.userId = userId;
    this.context = context;
  }
}

// Error handler class
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: AppError[] = [];
  private maxQueueSize = 100;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Handle and classify errors
  handleError(error: Error | ApplicationError, context?: string, userId?: string): AppError {
    let appError: AppError;

    if (error instanceof ApplicationError) {
      appError = {
        type: error.type,
        severity: error.severity,
        message: error.message,
        code: error.code,
        details: error.details,
        timestamp: error.timestamp,
        userId: error.userId || userId,
        context: error.context || context
      };
    } else {
      appError = this.classifyError(error, context, userId);
    }

    // Log error
    this.logError(appError);

    // Add to queue for monitoring
    this.addToQueue(appError);

    // Send to monitoring service if critical
    if (appError.severity === ErrorSeverity.HIGH || appError.severity === ErrorSeverity.CRITICAL) {
      this.sendToMonitoring(appError);
    }

    return appError;
  }

  // Classify different types of errors
  private classifyError(error: Error, context?: string, userId?: string): AppError {
    const message = error.message.toLowerCase();
    let type = ErrorType.UNKNOWN;
    let severity = ErrorSeverity.MEDIUM;

    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      type = ErrorType.NETWORK;
      severity = ErrorSeverity.HIGH;
    }
    // Database errors
    else if (message.includes('database') || message.includes('sql') || message.includes('query')) {
      type = ErrorType.DATABASE;
      severity = ErrorSeverity.HIGH;
    }
    // Authentication errors
    else if (message.includes('unauthorized') || message.includes('authentication') || message.includes('login')) {
      type = ErrorType.AUTHENTICATION;
      severity = ErrorSeverity.MEDIUM;
    }
    // Authorization errors
    else if (message.includes('forbidden') || message.includes('permission') || message.includes('access')) {
      type = ErrorType.AUTHORIZATION;
      severity = ErrorSeverity.MEDIUM;
    }
    // Not found errors
    else if (message.includes('not found') || message.includes('404')) {
      type = ErrorType.NOT_FOUND;
      severity = ErrorSeverity.LOW;
    }
    // Rate limiting
    else if (message.includes('rate limit') || message.includes('too many requests')) {
      type = ErrorType.RATE_LIMIT;
      severity = ErrorSeverity.MEDIUM;
    }
    // Server errors
    else if (message.includes('server error') || message.includes('500') || message.includes('internal')) {
      type = ErrorType.SERVER_ERROR;
      severity = ErrorSeverity.CRITICAL;
    }
    // Validation errors
    else if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      type = ErrorType.VALIDATION;
      severity = ErrorSeverity.LOW;
    }

    return {
      type,
      severity,
      message: error.message,
      timestamp: new Date().toISOString(),
      userId,
      context,
      details: {
        stack: error.stack,
        name: error.name
      }
    };
  }

  // Log errors to console (in production, would send to logging service)
  private logError(error: AppError): void {
    const logLevel = this.getLogLevel(error.severity);
    
    const logMessage = `[${error.timestamp}] ${logLevel}: ${error.type} - ${error.message}`;
    const logDetails = {
      code: error.code,
      userId: error.userId,
      context: error.context,
      details: error.details
    };

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        console.error(logMessage, logDetails);
        break;
      case ErrorSeverity.HIGH:
        console.error(logMessage, logDetails);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn(logMessage, logDetails);
        break;
      case ErrorSeverity.LOW:
        console.info(logMessage, logDetails);
        break;
    }
  }

  private getLogLevel(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.CRITICAL: return 'CRITICAL';
      case ErrorSeverity.HIGH: return 'ERROR';
      case ErrorSeverity.MEDIUM: return 'WARN';
      case ErrorSeverity.LOW: return 'INFO';
      default: return 'INFO';
    }
  }

  // Add error to monitoring queue
  private addToQueue(error: AppError): void {
    this.errorQueue.push(error);
    
    // Maintain queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  // Send to monitoring service (placeholder for real implementation)
  private sendToMonitoring(error: AppError): void {
    // In production, this would send to Sentry, DataDog, etc.
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(new Error(error.message), {
        tags: {
          type: error.type,
          severity: error.severity
        },
        extra: {
          code: error.code,
          userId: error.userId,
          context: error.context,
          details: error.details
        }
      });
    }
  }

  // Get error statistics
  getErrorStats(): {
    total: number;
    byType: Record<ErrorType, number>;
    bySeverity: Record<ErrorSeverity, number>;
    recent: AppError[];
  } {
    const byType = Object.values(ErrorType).reduce((acc, type) => {
      acc[type] = 0;
      return acc;
    }, {} as Record<ErrorType, number>);

    const bySeverity = Object.values(ErrorSeverity).reduce((acc, severity) => {
      acc[severity] = 0;
      return acc;
    }, {} as Record<ErrorSeverity, number>);

    this.errorQueue.forEach(error => {
      byType[error.type]++;
      bySeverity[error.severity]++;
    });

    return {
      total: this.errorQueue.length,
      byType,
      bySeverity,
      recent: this.errorQueue.slice(-10)
    };
  }

  // Clear error queue
  clearErrors(): void {
    this.errorQueue = [];
  }
}

// Singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Utility functions for common error scenarios
export const createValidationError = (message: string, details?: any): ApplicationError => {
  return new ApplicationError(
    message,
    ErrorType.VALIDATION,
    ErrorSeverity.LOW,
    'VALIDATION_ERROR',
    details
  );
};

export const createNetworkError = (message: string, details?: any): ApplicationError => {
  return new ApplicationError(
    message,
    ErrorType.NETWORK,
    ErrorSeverity.HIGH,
    'NETWORK_ERROR',
    details
  );
};

export const createAuthError = (message: string, details?: any): ApplicationError => {
  return new ApplicationError(
    message,
    ErrorType.AUTHENTICATION,
    ErrorSeverity.MEDIUM,
    'AUTH_ERROR',
    details
  );
};

export const createNotFoundError = (resource: string, id?: string): ApplicationError => {
  return new ApplicationError(
    `${resource}${id ? ` with ID ${id}` : ''} not found`,
    ErrorType.NOT_FOUND,
    ErrorSeverity.LOW,
    'NOT_FOUND',
    { resource, id }
  );
};

// React hook for error handling
export const useErrorHandler = () => {
  const handleError = (error: Error | ApplicationError, context?: string) => {
    const appError = errorHandler.handleError(error, context);
    
    // Show user-friendly toast for certain error types
    if (typeof window !== 'undefined' && (window as any).toast) {
      const toastMessage = getUserFriendlyMessage(appError);
      const toastType = getToastType(appError.severity);
      
      (window as any).toast[toastType](toastMessage);
    }
    
    return appError;
  };

  return { handleError };
};

const getUserFriendlyMessage = (error: AppError): string => {
  switch (error.type) {
    case ErrorType.VALIDATION:
      return 'Please check your input and try again.';
    case ErrorType.NETWORK:
      return 'Network error. Please check your connection and try again.';
    case ErrorType.AUTHENTICATION:
      return 'Please log in to continue.';
    case ErrorType.AUTHORIZATION:
      return 'You don\'t have permission to perform this action.';
    case ErrorType.NOT_FOUND:
      return 'The requested resource was not found.';
    case ErrorType.RATE_LIMIT:
      return 'Too many requests. Please try again later.';
    case ErrorType.SERVER_ERROR:
      return 'Server error. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

const getToastType = (severity: ErrorSeverity): string => {
  switch (severity) {
    case ErrorSeverity.CRITICAL:
    case ErrorSeverity.HIGH:
      return 'error';
    case ErrorSeverity.MEDIUM:
      return 'warning';
    case ErrorSeverity.LOW:
      return 'info';
    default:
      return 'info';
  }
};
