// UI System - Performance & Mobile Optimization
// Performance utilities and mobile-first responsive components

import React, { memo, useMemo, useCallback, useState, useEffect } from 'react';
import { cn } from '../lib/utils';

// Performance Optimization Components

// Memoized wrapper for expensive components
export const Memoized = React.memo;

// Lazy loading wrapper with error boundary
export const LazyWrapper: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}> = ({ children, fallback, errorFallback }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (hasError && errorFallback) {
      console.error('Lazy component failed to load');
    }
  }, [hasError, errorFallback]);

  if (hasError && errorFallback) {
    return <>{errorFallback}</>;
  }

  return <>{children}</>;
};

// Optimized image component with lazy loading
interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  lazy?: boolean;
  placeholder?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  lazy = true,
  placeholder,
  className,
  ...props
}) => {
  const [loaded, setLoaded] = useState(!lazy);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(() => setLoaded(true), []);
  const handleError = useCallback(() => setError(true), []);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {!loaded && placeholder && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
        />
      )}
      {error ? (
        <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
          <span className="text-neutral-400 text-sm">Image unavailable</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={lazy ? 'lazy' : 'eager'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0'
          )}
          {...props}
        />
      )}
    </div>
  );
};

// Mobile-First Responsive Components

// Responsive container that adapts to screen size
interface ResponsiveContainerProps {
  children: React.ReactNode;
  mobileClass?: string;
  tabletClass?: string;
  desktopClass?: string;
  className?: string;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  mobileClass = 'px-4 py-4',
  tabletClass = 'px-6 py-6',
  desktopClass = 'px-8 py-8',
  className
}) => (
  <div className={cn(
    // Mobile first (default)
    mobileClass,
    // Tablet and up
    'md:' + tabletClass.replace('px-', 'md:px-').replace('py-', 'md:py-'),
    // Desktop and up
    'lg:' + desktopClass.replace('px-', 'lg:px-').replace('py-', 'lg:py-'),
    className
  )}>
    {children}
  </div>
);

// Touch-friendly button for mobile
interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  children,
  size = 'md',
  variant = 'primary',
  className,
  ...props
}) => {
  const sizeClasses = {
    sm: 'min-h-[44px] px-4 py-2 text-sm', // 44px minimum touch target
    md: 'min-h-[48px] px-6 py-3 text-base',
    lg: 'min-h-[56px] px-8 py-4 text-lg'
  };

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
    secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300',
    ghost: 'text-primary-600 hover:bg-primary-50 active:bg-primary-100'
  };

  return (
    <button
      className={cn(
        'rounded-lg font-medium transition-colors touch-manipulation',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

// Mobile-optimized modal
interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  fullScreen?: boolean;
}

export const MobileModal: React.FC<MobileModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  fullScreen = false
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={cn(
        'relative bg-white rounded-t-2xl md:rounded-2xl shadow-xl max-h-[90vh] overflow-hidden',
        fullScreen ? 'w-full h-full rounded-none' : 'w-full max-w-md mx-4 md:mx-auto'
      )}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-full touch-manipulation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] md:max-h-[70vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

// Trust-First Visual Enhancement Components

// Trust indicator bar
interface TrustBarProps {
  score: number;
  label?: string;
  className?: string;
}

export const TrustBar: React.FC<TrustBarProps> = ({ score, label = 'Trust Score', className }) => (
  <div className={cn('bg-white border border-neutral-200 rounded-lg p-4', className)}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      <span className="text-lg font-bold text-primary-600">{score}%</span>
    </div>
    <div className="w-full bg-neutral-200 rounded-full h-3">
      <div
        className="bg-gradient-to-r from-primary-500 to-success-500 h-3 rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${score}%` }}
      />
    </div>
    <div className="flex justify-between text-xs text-neutral-500 mt-1">
      <span>Risk</span>
      <span>Trust</span>
    </div>
  </div>
);

// Security badges component
interface SecurityBadgesProps {
  verified?: boolean;
  encrypted?: boolean;
  monitored?: boolean;
  insured?: boolean;
  className?: string;
}

export const SecurityBadges: React.FC<SecurityBadgesProps> = ({
  verified,
  encrypted,
  monitored,
  insured,
  className
}) => {
  const badges = [
    verified && { icon: '✓', label: 'Verified', color: 'text-success-600 bg-success-50' },
    encrypted && { icon: '🔒', label: 'Encrypted', color: 'text-primary-600 bg-primary-50' },
    monitored && { icon: '👁️', label: 'Monitored', color: 'text-warning-600 bg-warning-50' },
    insured && { icon: '🛡️', label: 'Insured', color: 'text-primary-600 bg-primary-50' }
  ].filter(Boolean);

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {badges.map((badge, index) => (
        <div
          key={index}
          className={cn(
            'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
            badge.color
          )}
        >
          <span>{badge.icon}</span>
          <span>{badge.label}</span>
        </div>
      ))}
    </div>
  );
};

// Error Handling UX Components

// Global error toast component
interface ErrorToastProps {
  error: string | Error;
  onRetry?: () => void;
  className?: string;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({ error, onRetry, className }) => (
  <div className={cn(
    'bg-error-50 border border-error-200 rounded-lg p-4 flex items-start gap-3',
    className
  )}>
    <div className="flex-shrink-0 w-5 h-5 text-error-600">
      <svg fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-error-800">
        {typeof error === 'string' ? error : 'An error occurred'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 text-sm font-medium text-error-600 hover:text-error-500"
        >
          Try again
        </button>
      )}
    </div>
  </div>
);

// Success feedback component
interface SuccessFeedbackProps {
  message: string;
  className?: string;
}

export const SuccessFeedback: React.FC<SuccessFeedbackProps> = ({ message, className }) => (
  <div className={cn(
    'bg-success-50 border border-success-200 rounded-lg p-4 flex items-center gap-3',
    className
  )}>
    <div className="flex-shrink-0 w-5 h-5 text-success-600">
      <svg fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    </div>
    <p className="text-sm font-medium text-success-800">{message}</p>
  </div>
);

// Loading states
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn('animate-spin rounded-full border-2 border-neutral-300 border-t-primary-600', sizeClasses[size], className)} />
  );
};

// Skeleton loader
interface SkeletonProps {
  className?: string;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, lines = 1 }) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="h-4 bg-neutral-200 rounded animate-pulse"
        style={{ width: `${Math.random() * 40 + 60}%` }}
      />
    ))}
  </div>
);

export default {
  Memoized,
  LazyWrapper,
  OptimizedImage,
  ResponsiveContainer,
  TouchButton,
  MobileModal,
  TrustBar,
  SecurityBadges,
  ErrorToast,
  SuccessFeedback,
  LoadingSpinner,
  Skeleton
};
