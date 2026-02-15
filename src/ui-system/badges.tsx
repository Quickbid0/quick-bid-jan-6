// UI System - Badges
// Standardized badge components for status indicators and trust signals

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';
import { colors } from './colors';

const badgeVariants = cva(
  // Base styles
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        // Status badges
        default: 'bg-neutral-100 text-neutral-800',
        primary: 'bg-primary-100 text-primary-800',
        success: 'bg-success-100 text-success-800',
        warning: 'bg-warning-100 text-warning-800',
        error: 'bg-error-100 text-error-800',

        // Trust badges (most important for QuickMela)
        verified: 'bg-success-100 text-success-800 border border-success-200',
        escrow: 'bg-primary-100 text-primary-800 border border-primary-200',
        inspected: 'bg-warning-100 text-warning-800 border border-warning-200',
        premium: 'bg-purple-100 text-purple-800 border border-purple-200',

        // Action badges
        bid: 'bg-blue-100 text-blue-800',
        win: 'bg-success-100 text-success-800 animate-pulse',
        lose: 'bg-error-100 text-error-800',

        // Size variants
        sm: 'px-1.5 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
      size: {
        sm: 'px-1.5 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Main Badge Component
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, leftIcon, rightIcon, children, ...props }, ref) => (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      ref={ref}
      {...props}
    >
      {leftIcon && <span className="mr-1">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-1">{rightIcon}</span>}
    </span>
  )
);

Badge.displayName = 'Badge';

// Specialized Trust Badges (Critical for QuickMela)

export const VerifiedBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => (
  <Badge variant="verified" {...props}>
    ✓ Verified Seller
  </Badge>
);

export const EscrowBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => (
  <Badge variant="escrow" {...props}>
    🛡️ Escrow Protected
  </Badge>
);

export const InspectedBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => (
  <Badge variant="inspected" {...props}>
    🔍 AI Inspected
  </Badge>
);

export const PremiumBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => (
  <Badge variant="premium" {...props}>
    ⭐ Premium Listing
  </Badge>
);

// Status Badges

export const ActiveBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => (
  <Badge variant="success" {...props}>
    Active
  </Badge>
);

export const PendingBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => (
  <Badge variant="warning" {...props}>
    Pending
  </Badge>
);

export const EndedBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => (
  <Badge variant="error" {...props}>
    Ended
  </Badge>
);

// Auction-specific Badges

export const WinningBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => (
  <Badge variant="win" {...props}>
    🏆 You're Winning!
  </Badge>
);

export const OutbidBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => (
  <Badge variant="lose" {...props}>
    📉 Outbid
  </Badge>
);

export const ReserveMetBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => (
  <Badge variant="success" {...props}>
    Reserve Met
  </Badge>
);

// Badge Group Component
interface BadgeGroupProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

export const BadgeGroup: React.FC<BadgeGroupProps> = ({
  children,
  className,
  spacing = 'sm'
}) => {
  const gapClass = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-3',
  }[spacing];

  return (
    <div className={cn('flex flex-wrap items-center', gapClass, className)}>
      {children}
    </div>
  );
};

// Trust Indicators Component (Key for QuickMela)
interface TrustIndicatorsProps {
  verified?: boolean;
  escrow?: boolean;
  inspected?: boolean;
  premium?: boolean;
  className?: string;
}

export const TrustIndicators: React.FC<TrustIndicatorsProps> = ({
  verified,
  escrow,
  inspected,
  premium,
  className
}) => {
  const badges = [];

  if (verified) badges.push(<VerifiedBadge key="verified" />);
  if (escrow) badges.push(<EscrowBadge key="escrow" />);
  if (inspected) badges.push(<InspectedBadge key="inspected" />);
  if (premium) badges.push(<PremiumBadge key="premium" />);

  if (badges.length === 0) return null;

  return (
    <BadgeGroup className={className} spacing="sm">
      {badges}
    </BadgeGroup>
  );
};

// Product Status Badges
interface ProductStatusBadgesProps {
  status: 'active' | 'ended' | 'pending' | 'draft';
  reserveMet?: boolean;
  featured?: boolean;
  className?: string;
}

export const ProductStatusBadges: React.FC<ProductStatusBadgesProps> = ({
  status,
  reserveMet,
  featured,
  className
}) => {
  const badges = [];

  // Status badge
  switch (status) {
    case 'active':
      badges.push(<ActiveBadge key="status" />);
      break;
    case 'ended':
      badges.push(<EndedBadge key="status" />);
      break;
    case 'pending':
      badges.push(<PendingBadge key="status" />);
      break;
  }

  // Special badges
  if (reserveMet) {
    badges.push(<ReserveMetBadge key="reserve" />);
  }

  if (featured) {
    badges.push(<PremiumBadge key="featured" />);
  }

  return (
    <BadgeGroup className={className} spacing="sm">
      {badges}
    </BadgeGroup>
  );
};

export default Badge;
