// src/components/ErrorButton.tsx
import React from 'react';
import * as Sentry from '@sentry/react';

interface ErrorButtonProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * ErrorButton component for testing Sentry error reporting in frontend
 * This component can be temporarily added to any page to test error reporting
 */
export const ErrorButton: React.FC<ErrorButtonProps> = ({
  children = 'Trigger Test Error',
  className = 'bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'
}) => {
  const handleClick = () => {
    try {
      // This will trigger a test error to verify Sentry is working
      throw new Error('Test error from QuickMela frontend for Sentry verification');
    } catch (error) {
      // Capture the exception with Sentry
      Sentry.captureException(error);

      // Also log to console for debugging
      console.error('Test error triggered:', error);

      // Show user feedback
      alert('Test error triggered and sent to Sentry. Check your Sentry dashboard.');
    }
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      type="button"
      aria-label="Trigger test error for Sentry verification"
    >
      {children}
    </button>
  );
};

export default ErrorButton;
