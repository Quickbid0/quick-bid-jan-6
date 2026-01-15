import React from 'react';
import { colors, spacing, radii, shadows, typography } from '@/design-system';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const variantClassMap: Record<ButtonVariant, string> = {
  primary: `bg-[${colors.primary}] text-white shadow-[${shadows.sm}] hover:brightness-95`,
  secondary: `bg-[${colors.secondary}] text-white shadow-[${shadows.xs}] hover:brightness-95`,
  outline: `border border-[${colors.border}] text-[${colors.primary}] bg-transparent shadow-none hover:bg-[${colors.surface}]`,
  ghost: `bg-transparent text-[${colors.primary}] shadow-none hover:bg-[${colors.surface}]`,
  danger: `bg-[${colors.error}] text-white shadow-[${shadows.xs}] hover:brightness-95`,
};

const sizeClassMap: Record<ButtonSize, string> = {
  sm: `py-${spacing.sm} px-${spacing.md} text-[${typography.caption.fontSize}]`,
  md: `py-${spacing.md} px-${spacing.xl} text-[${typography.body.fontSize}]`,
  lg: `py-${spacing.xxl} px-${spacing.xxxl} text-[${typography.h2.fontSize}]`,
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
  const baseClasses = `inline-flex items-center justify-center gap-2 rounded-[${radii.md}] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[${colors.primary}] focus-visible:ring-offset-[${colors.surface}] disabled:opacity-60 disabled:pointer-events-none`;
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
