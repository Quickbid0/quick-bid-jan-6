import React from 'react';
import { colors, spacing, radii, shadows, typography } from '@/design-system';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const variantClassMap: Record<ButtonVariant, string> = {
  primary: 'bg-primary-500 text-white shadow-sm hover:brightness-95',
  secondary: 'bg-secondary-500 text-white shadow-xs hover:brightness-95',
  outline: 'border border-gray-300 text-primary-600 bg-transparent shadow-none hover:bg-gray-50',
  ghost: 'bg-transparent text-primary-600 shadow-none hover:bg-gray-50',
  danger: 'bg-red-500 text-white shadow-xs hover:brightness-95',
};

const sizeClassMap: Record<ButtonSize, string> = {
  sm: 'py-2 px-3 text-sm',
  md: 'py-2 px-4 text-base',
  lg: 'py-3 px-6 text-lg',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon,
    disabled,
    className = '',
    children,
    ...rest
  } = props;
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:ring-offset-gray-50 disabled:opacity-60 disabled:pointer-events-none';
  const variantClasses = variantClassMap[variant];
  const sizeClasses = sizeClassMap[size];

  return (
    <button
      ref={ref}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`.trim()}
      aria-busy={isLoading}
      aria-disabled={disabled || isLoading}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading && <span className="h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full" aria-hidden="true" />}
      {icon && !isLoading && <span className="text-lg">{icon}</span>}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

/**
 * Usage example:
 * <Button variant="primary" size="md">Place Bid</Button>
 */
