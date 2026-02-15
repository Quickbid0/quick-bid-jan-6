// UI System - Bug Prevention Utilities
// Utilities to prevent common UI bugs and improve reliability

import { useState, useCallback, useRef, useEffect } from 'react';

// Hook to prevent double clicks and race conditions
export const useSafeClick = (callback: (...args: any[]) => void, delay = 1000) => {
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const safeCallback = useCallback(async (...args: any[]) => {
    if (isLoading) return; // Prevent double clicks

    setIsLoading(true);

    try {
      await callback(...args);
    } catch (error) {
      console.error('Safe click error:', error);
      throw error; // Re-throw to allow error handling
    } finally {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set minimum loading time to prevent UI flicker
      timeoutRef.current = setTimeout(() => {
        setIsLoading(false);
      }, delay);
    }
  }, [callback, isLoading, delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [safeCallback, isLoading] as const;
};

// Hook to prevent form double submission
export const useFormSubmission = (onSubmit: (data: any) => Promise<void>) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  const handleSubmit = useCallback(async (data: any) => {
    if (isSubmitting) {
      console.warn('Form submission already in progress');
      return;
    }

    setIsSubmitting(true);
    setSubmitCount(prev => prev + 1);

    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, isSubmitting]);

  return {
    handleSubmit,
    isSubmitting,
    submitCount,
    canSubmit: !isSubmitting
  };
};

// Hook to prevent scroll jumps on content changes
export const useScrollLock = () => {
  const scrollPositionRef = useRef(0);

  const lockScroll = useCallback(() => {
    scrollPositionRef.current = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPositionRef.current}px`;
    document.body.style.width = '100%';
  }, []);

  const unlockScroll = useCallback(() => {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollPositionRef.current);
  }, []);

  return { lockScroll, unlockScroll };
};

// Hook to prevent layout shift during loading states
export const useLayoutStable = (isLoading: boolean) => {
  const [stableHeight, setStableHeight] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && !isLoading && !stableHeight) {
      setStableHeight(containerRef.current.offsetHeight);
    }
  }, [isLoading, stableHeight]);

  const minHeight = stableHeight ? `${stableHeight}px` : undefined;

  return { containerRef, minHeight };
};

// Hook to fix React key warnings and optimize re-renders
export const useStableKey = (items: any[], keyField = 'id') => {
  const [stableItems, setStableItems] = useState(items);

  useEffect(() => {
    // Only update if items actually changed (not just reference)
    if (JSON.stringify(items) !== JSON.stringify(stableItems)) {
      setStableItems(items);
    }
  }, [items, stableItems]);

  const getKey = useCallback((item: any, index: number) => {
    return item[keyField] || item.id || `item-${index}`;
  }, [keyField]);

  return { items: stableItems, getKey };
};

// Hook to prevent memory leaks from event listeners
export const useEventListener = (
  eventName: string,
  handler: (event: Event) => void,
  element: HTMLElement | Window = window,
  options?: boolean | AddEventListenerOptions
) => {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (event: Event) => savedHandler.current(event);
    element.addEventListener(eventName, eventListener, options);
    return () => {
      element.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, options]);
};

// Hook to prevent hydration mismatches
export const useHydrated = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
};

// Hook to prevent unnecessary API calls
export const useDebounce = <T extends any[]>(callback: (...args: T) => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback((...args: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

// Utility to safely access nested object properties
export const safeGet = (obj: any, path: string, defaultValue?: any): any => {
  try {
    return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue;
  } catch {
    return defaultValue;
  }
};

// Utility to prevent console errors from missing properties
export const safeInvoke = (fn: Function | undefined, ...args: any[]) => {
  try {
    return fn?.(...args);
  } catch (error) {
    console.error('Safe invoke error:', error);
    return undefined;
  }
};

// Component to prevent hydration issues with dynamic content
import React from 'react';

export const NoSSR: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback = null
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return <>{mounted ? children : fallback}</>;
};

// Error boundary that prevents crashes
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class SafeErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
          <p className="text-error-700 text-sm">
            Something went wrong. Please refresh the page.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default {
  useSafeClick,
  useFormSubmission,
  useScrollLock,
  useLayoutStable,
  useStableKey,
  useEventListener,
  useHydrated,
  useDebounce,
  safeGet,
  safeInvoke,
  NoSSR,
  SafeErrorBoundary
};
