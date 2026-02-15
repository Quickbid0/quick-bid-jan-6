// UI System - Buttons
// Standardized button components for consistent interactions

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';
import { colors } from './colors';

// Button variants using class-variance-authority
const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        // Primary - Main actions, trust-building
        primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm hover:shadow-md',

        // Secondary - Supporting actions
        secondary: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 focus:ring-neutral-500',

        // Success - Positive confirmations
        success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500',

        // Warning - Caution actions
        warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500',

        // Error - Destructive actions
        error: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500',

        // Outline - Less prominent actions
        outline: 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 focus:ring-primary-500',

        // Ghost - Minimal styling
        ghost: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 focus:ring-neutral-500',

        // Trust - Special variant for trust indicators
        trust: 'bg-trust-verified text-white hover:bg-success-700 focus:ring-success-500',

        // Bid - Special variant for bidding actions
        bid: 'bg-semantic-bid text-white hover:bg-primary-700 focus:ring-primary-500 font-bold shadow-lg hover:shadow-xl transform hover:scale-105',
      },
      size: {
        xs: 'px-2.5 py-1.5 text-xs gap-1.5',
        sm: 'px-3 py-2 text-sm gap-2',
        md: 'px-4 py-2.5 text-sm gap-2',
        lg: 'px-6 py-3 text-base gap-2.5',
        xl: 'px-8 py-4 text-lg gap-3',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Main Button Component
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}

        {!loading && leftIcon && leftIcon}

        <span className={loading ? 'ml-2' : ''}>{children}</span>

        {!loading && rightIcon && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Specialized Button Components
export const PrimaryButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="secondary" {...props} />
);

export const SuccessButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="success" {...props} />
);

export const WarningButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="warning" {...props} />
);

export const ErrorButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="error" {...props} />
);

export const OutlineButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="outline" {...props} />
);

export const GhostButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="ghost" {...props} />
);

export const TrustButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="trust" {...props} />
);

export const BidButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="bid" {...props} />
);

// Icon Button Component
interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, icon, 'aria-label': ariaLabel, ...props }, ref) => (
    <Button
      className={cn('p-2', className)}
      ref={ref}
      aria-label={ariaLabel}
      {...props}
    >
      {icon}
    </Button>
  )
);

IconButton.displayName = 'IconButton';

// Button Group Component
interface ButtonGroupProps {
  children: React.ReactNode;
  variant?: 'horizontal' | 'vertical';
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  variant = 'horizontal',
  className
}) => (
  <div
    className={cn(
      'inline-flex',
      variant === 'horizontal' ? 'flex-row' : 'flex-col',
      className
    )}
  >
    {React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return child;

      const isFirst = index === 0;
      const isLast = index === React.Children.count(children) - 1;

      return React.cloneElement(child as React.ReactElement<ButtonProps>, {
        className: cn(
          child.props.className,
          variant === 'horizontal' ? {
            'rounded-r-none border-r-0': !isLast,
            'rounded-l-none': !isFirst,
          } : {
            'rounded-b-none border-b-0': !isLast,
            'rounded-t-none': !isFirst,
          }
        ),
      });
    })}
  </div>
);

export default Button;
