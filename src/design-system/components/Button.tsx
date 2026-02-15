// Button Component - Enterprise Design System
import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'text';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = clsx(
    'inline-flex items-center justify-center font-medium transition-all duration-200',
    'whitespace-nowrap relative overflow-hidden',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    {
      'w-full': fullWidth,
      'cursor-not-allowed opacity-50': disabled || loading,
      'cursor-pointer': !disabled && !loading,
    }
  );

  const variantClasses = {
    primary: 'bg-primary-600 text-white border border-primary-600 hover:bg-primary-700 hover:border-primary-700 active:bg-primary-800',
    secondary: 'bg-transparent text-primary-600 border border-primary-600 hover:bg-primary-50 active:bg-primary-100',
    tertiary: 'bg-neutral-100 text-neutral-700 border border-neutral-200 hover:bg-neutral-200 hover:border-neutral-300 active:bg-neutral-300',
    text: 'bg-transparent text-primary-600 border border-transparent hover:bg-primary-50 hover:border-primary-50 active:bg-primary-100',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-md min-h-[2rem]',
    md: 'px-4 py-2 text-base rounded-lg min-h-[2.5rem]',
    lg: 'px-6 py-3 text-lg rounded-xl min-h-[3rem]',
  };

  return (
    <button
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className="flex items-center gap-2">
        {leftIcon && (
          <span className="flex items-center">
            {leftIcon}
          </span>
        )}

        <span className={loading ? 'opacity-0' : ''}>{children}</span>

        {rightIcon && (
          <span className="flex items-center">
            {rightIcon}
          </span>
        )}
      </div>
    </button>
  );
};
