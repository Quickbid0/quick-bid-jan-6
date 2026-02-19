// UI System - Simplified Status Components
// Components that reduce cognitive overload by using icons, badges, and tooltips

import React from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Shield,
  Camera,
  Truck,
  CreditCard,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

// Import design system components
import { Badge, TrustIndicators } from './badges';
import { Flex, Stack } from './layout';

// Simplified Status Badge - replaces complex status text
interface StatusBadgeProps {
  status: 'active' | 'pending' | 'completed' | 'failed' | 'locked' | 'verified';
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showTooltip = true,
  className
}) => {
  const statusConfig = {
    active: {
      icon: CheckCircle,
      variant: 'success' as const,
      label: 'Active',
      tooltip: 'This item is currently active and available'
    },
    pending: {
      icon: Clock,
      variant: 'warning' as const,
      label: 'Pending',
      tooltip: 'This item is being processed and will be available soon'
    },
    completed: {
      icon: CheckCircle,
      variant: 'success' as const,
      label: 'Done',
      tooltip: 'This process has been completed successfully'
    },
    failed: {
      icon: XCircle,
      variant: 'error' as const,
      label: 'Failed',
      tooltip: 'This process encountered an error and needs attention'
    },
    locked: {
      icon: Lock,
      variant: 'neutral' as const,
      label: 'Locked',
      tooltip: 'This item is temporarily locked for security'
    },
    verified: {
      icon: Shield,
      variant: 'trust' as const,
      label: 'Verified',
      tooltip: 'This item has been verified and is trustworthy'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;
  const badgeId = `status-${status}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <>
      <Badge
        variant={config.variant}
        size={size}
        className={className}
        data-tooltip-id={showTooltip ? badgeId : undefined}
        data-tooltip-content={showTooltip ? config.tooltip : undefined}
      >
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>

      {showTooltip && (
        <Tooltip
          id={badgeId}
          place="top"
          className="!bg-neutral-900 !text-white !text-xs !rounded-lg !px-3 !py-2 !max-w-xs"
        />
      )}
    </>
  );
};

// Simplified Trust Score - replaces complex trust calculations
interface TrustScoreProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

export const TrustScore: React.FC<TrustScoreProps> = ({
  score,
  size = 'md',
  showDetails = false,
  className
}) => {
  const getTrustLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', color: 'success', icon: Shield };
    if (score >= 75) return { level: 'Good', color: 'primary', icon: CheckCircle };
    if (score >= 60) return { level: 'Fair', color: 'warning', icon: AlertTriangle };
    return { level: 'Low', color: 'error', icon: XCircle };
  };

  const { level, color, icon: Icon } = getTrustLevel(score);
  const scoreId = `trust-score-${Math.random().toString(36).substr(2, 9)}`;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <>
      <div className={`inline-flex items-center gap-1 ${className}`}>
        <Icon className={`${sizeClasses[size]} text-${color}-600`} />
        {!showDetails && (
          <span className={`text-xs font-medium text-${color}-700`}>
            {level}
          </span>
        )}
        {showDetails && (
          <span className="text-sm font-medium text-neutral-700">
            {score}% Trust
          </span>
        )}
      </div>
    </>
  );
};

// Simplified Auction Status - replaces complex auction state text
interface AuctionStatusProps {
  status: 'draft' | 'active' | 'ended' | 'cancelled' | 'won' | 'lost';
  timeLeft?: string;
  bidCount?: number;
  isWinning?: boolean;
  className?: string;
}

export const AuctionStatus: React.FC<AuctionStatusProps> = ({
  status,
  timeLeft,
  bidCount,
  isWinning,
  className
}) => {
  const statusConfig = {
    draft: { icon: EyeOff, variant: 'neutral' as const, label: 'Draft' },
    active: { icon: Clock, variant: 'primary' as const, label: 'Live' },
    ended: { icon: XCircle, variant: 'error' as const, label: 'Ended' },
    cancelled: { icon: XCircle, variant: 'error' as const, label: 'Cancelled' },
    won: { icon: CheckCircle, variant: 'success' as const, label: 'Won' },
    lost: { icon: XCircle, variant: 'error' as const, label: 'Lost' }
  };

  const config = statusConfig[status];
  const Icon = config.icon;
  const statusId = `auction-status-${Math.random().toString(36).substr(2, 9)}`;

  let tooltipText = config.label;
  if (status === 'active' && timeLeft) tooltipText += ` • ${timeLeft} remaining`;
  if (bidCount) tooltipText += ` • ${bidCount} bids`;
  if (isWinning) tooltipText += ' • You\'re winning!';

  return (
    <>
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <StatusBadge status={status === 'won' ? 'completed' : status === 'lost' ? 'failed' : 'active'} />

        {status === 'active' && timeLeft && (
          <span className="text-sm text-neutral-600 font-medium">
            {timeLeft}
          </span>
        )}

        {bidCount && (
          <span className="text-xs text-neutral-500 flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {bidCount}
          </span>
        )}

        {isWinning && (
          <Badge variant="success" size="sm">
            🏆 Leading
          </Badge>
        )}
      </div>
    </>
  );
};

// Simplified Payment Status - replaces complex payment flow text
interface PaymentStatusProps {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  method?: string;
  amount?: number;
  className?: string;
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({
  status,
  method,
  amount,
  className
}) => {
  const statusConfig = {
    pending: { icon: Clock, variant: 'warning' as const, label: 'Pending' },
    processing: { icon: CreditCard, variant: 'primary' as const, label: 'Processing' },
    completed: { icon: CheckCircle, variant: 'success' as const, label: 'Paid' },
    failed: { icon: XCircle, variant: 'error' as const, label: 'Failed' },
    refunded: { icon: AlertTriangle, variant: 'warning' as const, label: 'Refunded' }
  };

  const config = statusConfig[status];
  const Icon = config.icon;
  const paymentId = `payment-${Math.random().toString(36).substr(2, 9)}`;

  let tooltipText = config.label;
  if (method) tooltipText += ` via ${method}`;
  if (amount) tooltipText += ` • ₹${amount.toLocaleString()}`;

  return (
    <>
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <Icon className={`w-4 h-4 text-${config.variant}-600`} />
        <span className={`text-sm font-medium text-${config.variant}-700`}>
          {config.label}
        </span>
      </div>
    </>
  );
};

// Simplified Delivery Status - replaces complex delivery tracking text
interface DeliveryStatusProps {
  status: 'ordered' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  estimatedDate?: string;
  className?: string;
}

export const DeliveryStatus: React.FC<DeliveryStatusProps> = ({
  status,
  trackingNumber,
  estimatedDate,
  className
}) => {
  const statusConfig = {
    ordered: { icon: Clock, variant: 'neutral' as const, label: 'Ordered' },
    confirmed: { icon: CheckCircle, variant: 'primary' as const, label: 'Confirmed' },
    shipped: { icon: Truck, variant: 'warning' as const, label: 'Shipped' },
    delivered: { icon: CheckCircle, variant: 'success' as const, label: 'Delivered' },
    cancelled: { icon: XCircle, variant: 'error' as const, label: 'Cancelled' }
  };

  const config = statusConfig[status];
  const Icon = config.icon;
  const deliveryId = `delivery-${Math.random().toString(36).substr(2, 9)}`;

  let tooltipText = config.label;
  if (trackingNumber) tooltipText += ` • Tracking: ${trackingNumber}`;
  if (estimatedDate) tooltipText += ` • ETA: ${estimatedDate}`;

  return (
    <>
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <Icon className={`w-4 h-4 text-${config.variant}-600`} />
        <span className={`text-sm font-medium text-${config.variant}-700`}>
          {config.label}
        </span>
      </div>
    </>
  );
};

// Simplified Progress Indicator - replaces complex progress text
interface ProgressIndicatorProps {
  current: number;
  total: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  current,
  total,
  label,
  size = 'md',
  showPercentage = true,
  className
}) => {
  const percentage = Math.round((current / total) * 100);
  const progressId = `progress-${Math.random().toString(36).substr(2, 9)}`;

  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <>
      <div className={`flex items-center gap-3 ${className}`}>
        {label && (
          <span className="text-sm font-medium text-neutral-700 min-w-fit">
            {label}
          </span>
        )}

        <div className={`flex-1 bg-neutral-200 rounded-full ${heightClasses[size]}`}>
          <div
            className={`bg-primary-600 rounded-full transition-all duration-500 ${heightClasses[size]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {showPercentage && (
          <span className="text-xs font-medium text-neutral-600 min-w-fit">
            {percentage}%
          </span>
        )}
      </div>
    </>
  );
};

