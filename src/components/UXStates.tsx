// UX State Components - Consistent Empty, Error, and Disabled States
import React from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    text: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="text-gray-400 mb-4">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      
      {action && (
        <button
          onClick={action.onClick}
          className={`${
            action.variant === 'primary' 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          } px-6 py-3 rounded-lg font-medium transition-colors`}
        >
          {action.text}
        </button>
      )}
    </div>
  );
};

interface ErrorStateProps {
  title: string;
  message?: string;
  error?: Error | string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  error,
  onRetry,
  onDismiss,
  className = ''
}) => {
  const errorMessage = error instanceof Error ? error.message : error || message;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
      <div className="text-red-800">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-3">
              <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            
            {errorMessage && (
              <p className="text-red-700 mb-4">
                {errorMessage}
              </p>
            )}
          </div>
          
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-red-400 hover:text-red-600 transition-colors"
              aria-label="Dismiss error"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {(onRetry || onDismiss) && (
          <div className="flex space-x-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Try Again
              </button>
            )}
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="bg-white text-red-600 border border-red-300 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium"
              >
                Go Back
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface DisabledActionProps {
  children: React.ReactNode;
  reason: string;
  tooltip?: string;
  className?: string;
}

export const DisabledAction: React.FC<DisabledActionProps> = ({
  children,
  reason,
  tooltip,
  className = ''
}) => {
  return (
    <div className={`relative inline-block ${className}`}>
      <div className="opacity-50 cursor-not-allowed">
        {children}
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
        <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 max-w-xs">
          <div className="font-medium mb-1">Action Disabled</div>
          <div className="text-gray-300">{reason}</div>
          {tooltip && (
            <div className="text-gray-400 text-xs mt-1 pt-1 border-t border-gray-700">
              {tooltip}
            </div>
          )}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      </div>
      
      {/* Hover indicator */}
      <div className="absolute inset-0 border border-dashed border-gray-400 rounded-lg pointer-events-none"></div>
    </div>
  );
};

// Loading State Component
interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}></div>
      {message && (
        <p className="text-gray-600 mt-4">{message}</p>
      )}
    </div>
  );
};
