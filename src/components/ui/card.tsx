import React from 'react';
import { colors, spacing, radii, shadows } from '@/design-system';

export type CardVariant = 'surface' | 'elevated';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

const variantClassMap: Record<CardVariant, string> = {
  surface: `bg-[${colors.surface}] border border-[${colors.border}] shadow-none`,
  elevated: `bg-[${colors.surface}] border border-transparent shadow-[${shadows.sm}]`,
};

const paddingClassMap: Record<CardPadding, string> = {
  none: 'p-0',
  sm: `p-${spacing.md}`,
  md: `p-${spacing.xl}`,
  lg: `p-${spacing.xxxl}`,
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
