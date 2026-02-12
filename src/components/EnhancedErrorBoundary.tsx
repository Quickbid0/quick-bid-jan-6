import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from 'react-hot-toast';

// Error boundary props
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorToast?: boolean;
}

// Error boundary state
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// Enhanced error boundary component
class EnhancedErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console
    console.error('Error caught by boundary:', error, errorInfo);

    // Show error toast if enabled
    if (this.props.showErrorToast !== false) {
      toast.error('Something went wrong. Please refresh the page.', {
        duration: 5000,
        position: 'top-center'
      });
    }

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send error to monitoring service
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.retryCount
    };

    console.log('Error logged to service:', errorData);

    // Send to error monitoring service
    this.sendToMonitoringService(errorData);
  }

  private sendToMonitoringService(errorData: any) {
    // In production, this would send to services like:
    // - Sentry
    // - LogRocket  
    // - Custom error tracking API
    try {
      // Example: Sentry.captureException(error, { extra: errorData });
      console.log('Error sent to monitoring service:', errorData);
    } catch (e) {
      console.error('Failed to send error to monitoring service:', e);
    }
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null
      });
    } else {
      toast.error('Maximum retry attempts reached. Please refresh the page.');
    }
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 m-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.084 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
              Something went wrong
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              We're sorry, but something unexpected happened. Please try again or contact support if the problem persists.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                <summary className="cursor-pointer font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Error Details (Development Only)
                </summary>
                <div className="mt-2 space-y-2">
                  <div>
                    <strong className="text-gray-700 dark:text-gray-300">Error:</strong>
                    <pre className="mt-1 text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap break-all">
                      {this.state.error.message}
                    </pre>
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong className="text-gray-700 dark:text-gray-300">Stack Trace:</strong>
                      <pre className="mt-1 text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-all">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  <div>
                    <strong className="text-gray-700 dark:text-gray-300">Retry Count:</strong>
                    <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                      {this.retryCount}/{this.maxRetries}
                    </span>
                  </div>
                </div>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Try Again
              </button>
              
              <button
                onClick={this.handleRefresh}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Refresh Page
              </button>
            </div>

            <div className="mt-6 text-center">
              <a
                href="mailto:support@quickbid.com"
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specialized error boundaries for different contexts

// For auction components
export const AuctionErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <EnhancedErrorBoundary
    fallback={
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 m-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.084 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-red-800 dark:text-red-200 font-medium">
            Auction Error
          </span>
        </div>
        <p className="mt-2 text-red-700 dark:text-red-300 text-sm">
          There was an error with the auction. Please refresh and try again.
        </p>
      </div>
    }
    onError={(error, errorInfo) => {
      console.error('Auction component error:', error, errorInfo);
      // Send to auction-specific monitoring
    }}
  >
    {children}
  </EnhancedErrorBoundary>
);

// For payment components
export const PaymentErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <EnhancedErrorBoundary
    fallback={
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 m-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.084 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-yellow-800 dark:text-yellow-200 font-medium">
            Payment Error
          </span>
        </div>
        <p className="mt-2 text-yellow-700 dark:text-yellow-300 text-sm">
          There was an error processing your payment. Please check your payment method and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors text-sm"
        >
          Try Again
        </button>
      </div>
    }
    onError={(error, errorInfo) => {
      console.error('Payment component error:', error, errorInfo);
      // Send to payment-specific monitoring
    }}
  >
    {children}
  </EnhancedErrorBoundary>
);

// For navigation components
export const NavigationErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <EnhancedErrorBoundary
    fallback={
      <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 m-4">
        <div className="flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-gray-800 dark:text-gray-200 font-medium">
            Navigation Error
          </span>
        </div>
        <p className="mt-2 text-gray-700 dark:text-gray-300 text-sm text-center">
          Navigation encountered an error. Please refresh the page.
        </p>
      </div>
    }
    showErrorToast={false}
  >
    {children}
  </EnhancedErrorBoundary>
);

// Error monitoring service
class ErrorMonitoringService {
  private static errors: Array<{
    timestamp: Date;
    message: string;
    stack?: string;
    componentStack?: string;
    userAgent: string;
    url: string;
    userId?: string;
  }> = [];

  static logError(error: Error, errorInfo: ErrorInfo, userId?: string): void {
    const errorData = {
      timestamp: new Date(),
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack || undefined,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId
    };

    this.errors.push(errorData);

    // Keep only last 100 errors
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-100);
    }

    // Send to monitoring service
    this.sendToMonitoringService(errorData);
  }

  private static sendToMonitoringService(errorData: any): void {
    // In production, this would send to services like:
    // - Sentry
    // - LogRocket
    // - Custom error tracking API
    console.log('Error sent to monitoring service:', errorData);
  }

  static getRecentErrors(count: number = 50): any[] {
    return this.errors.slice(-count);
  }

  static getErrorStats(): {
    total: number;
    byHour: Record<string, number>;
    byComponent: Record<string, number>;
  } {
    const stats = {
      total: this.errors.length,
      byHour: {} as Record<string, number>,
      byComponent: {} as Record<string, number>
    };

    this.errors.forEach(error => {
      const hour = error.timestamp.getHours().toString();
      stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;

      const component = error.componentStack?.split('\n')[0] || 'Unknown';
      stats.byComponent[component] = (stats.byComponent[component] || 0) + 1;
    });

    return stats;
  }
}

// Hook for error logging
export const useErrorLogger = () => {
  const logError = (error: Error, errorInfo: ErrorInfo, userId?: string) => {
    ErrorMonitoringService.logError(error, errorInfo, userId);
  };

  const logAsyncError = async (promise: Promise<any>, userId?: string) => {
    try {
      return await promise;
    } catch (error) {
      ErrorMonitoringService.logError(error as Error, { componentStack: 'Async operation' }, userId);
      throw error;
    }
  };

  return { logError, logAsyncError };
};

// HOC for error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) => {
  const WrappedComponent = (props: P) => (
    <EnhancedErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </EnhancedErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default EnhancedErrorBoundary;
