// UI System - Cards
// Standardized card components for consistent content containers

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';
import { spacing } from './spacing';

const cardVariants = cva(
  // Base styles
  'rounded-lg border bg-white shadow-sm transition-shadow duration-200',
  {
    variants: {
      variant: {
        default: 'border-neutral-200',
        elevated: 'border-neutral-200 shadow-md hover:shadow-lg',
        outlined: 'border-neutral-300 bg-transparent',
        filled: 'border-transparent bg-neutral-50',
        trust: 'border-success-200 bg-success-50/50',
        warning: 'border-warning-200 bg-warning-50/50',
        error: 'border-error-200 bg-error-50/50',
        success: 'border-success-200 bg-success-50/50',
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      interactive: {
        true: 'cursor-pointer hover:shadow-md transition-all duration-200',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      interactive: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof cardVariants> {
  children: React.ReactNode;
  onClick?: () => void;
}

// Main Card Component
export const Card = React.forwardRef<HTMLElement, CardProps>(
  ({ className, variant, padding, interactive, onClick, children, ...props }, ref) => {
    const Component = interactive && onClick ? 'button' : 'div';

    return (
      <Component
        className={cn(cardVariants({ variant, padding, interactive }), className)}
        ref={ref as any}
        onClick={onClick}
        {...(Component === 'button' ? { type: 'button' } : {})}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

// Card Header Component
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ className, children, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 pb-4', className)} {...props}>
    {children}
  </div>
);

// Card Title Component
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const CardTitle: React.FC<CardTitleProps> = ({ className, children, ...props }) => (
  <h3 className={cn('text-lg font-semibold text-neutral-900', className)} {...props}>
    {children}
  </h3>
);

// Card Description Component
interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ className, children, ...props }) => (
  <p className={cn('text-sm text-neutral-600', className)} {...props}>
    {children}
  </p>
);

// Card Content Component
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({ className, children, ...props }) => (
  <div className={cn('pt-0', className)} {...props}>
    {children}
  </div>
);

// Card Footer Component
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({ className, children, ...props }) => (
  <div className={cn('flex items-center pt-4', className)} {...props}>
    {children}
  </div>
);

// Specialized Card Components

// Trust Card - For verified/safe content
export const TrustCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="trust" {...props} />
);

// Auction Card - For auction listings
export const AuctionCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="elevated" interactive {...props} />
);

// Stats Card - For dashboard metrics
export const StatsCard: React.FC<CardProps> = ({ className, children, ...props }) => (
  <Card
    className={cn('bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200', className)}
    {...props}
  >
    {children}
  </Card>
);

// Alert Card - For notifications/warnings
export const AlertCard: React.FC<Omit<CardProps, 'variant'> & { type?: 'warning' | 'error' | 'success' }> = ({
  type = 'warning',
  className,
  ...props
}) => (
  <Card
    variant={type}
    className={cn('border-l-4', className)}
    {...props}
  />
);

// Product Card - For marketplace items
interface ProductCardProps extends Omit<CardProps, 'variant'> {
  image?: string;
  title: string;
  price: number;
  location?: string;
  badges?: React.ReactNode;
  onFavorite?: () => void;
  isFavorited?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  image,
  title,
  price,
  location,
  badges,
  onFavorite,
  isFavorited,
  children,
  className,
  ...props
}) => (
  <Card variant="elevated" interactive className={cn('overflow-hidden', className)} {...props}>
    {/* Image */}
    {image && (
      <div className="aspect-square bg-neutral-100 relative overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        {badges && (
          <div className="absolute top-2 left-2 flex gap-1">
            {badges}
          </div>
        )}
        {onFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite();
            }}
            className={cn(
              'absolute top-2 right-2 p-1.5 rounded-full transition-colors',
              isFavorited
                ? 'bg-error-500 text-white hover:bg-error-600'
                : 'bg-white/80 text-neutral-600 hover:bg-white hover:text-neutral-900'
            )}
          >
            <svg className="w-4 h-4" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}
      </div>
    )}

    {/* Content */}
    <CardContent className="p-4">
      <h3 className="font-semibold text-neutral-900 mb-1 line-clamp-2">{title}</h3>

      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold text-primary-600">
          ₹{price.toLocaleString()}
        </span>
        {location && (
          <span className="text-sm text-neutral-500">{location}</span>
        )}
      </div>

      {children}
    </CardContent>
  </Card>
);

export default Card;
