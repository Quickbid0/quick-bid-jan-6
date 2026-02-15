import React from 'react';
import { colors, spacing, radii, shadows } from '@/design-system';

export type CardVariant = 'surface' | 'elevated';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

const variantClassMap: Record<CardVariant, string> = {
  surface: 'bg-white border border-gray-200 shadow-none',
  elevated: 'bg-white border border-transparent shadow-sm',
};

const paddingClassMap: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  const {
    variant = 'surface',
    padding = 'md',
    className = '',
    children,
    ...rest
  } = props;

  const classes = `rounded-[${radii.lg}] ${variantClassMap[variant]} ${paddingClassMap[padding]} ${className}`.trim();

  return (
    <div ref={ref} className={classes} {...rest}>
      {children}
    </div>
  );
});

Card.displayName = 'Card';

/**
 * Usage example:
 * <Card variant="elevated" padding="lg">Content goes here</Card>
 */
