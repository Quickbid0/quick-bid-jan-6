/**
 * Top Buyer/Seller Badge
 * Shows user is a top performer (high ratings and transaction volume)
 * Designates trusted power users on the platform
 * 
 * Usage:
 *   import { TopBadge } from './badges/TopBadge';
 *   <TopBadge type="buyer" />
 *   <TopBadge type="seller" />
 */

import React from 'react';
import { Award } from 'lucide-react';

export interface TopBadgeProps {
  type: 'buyer' | 'seller';
  className?: string;
}

const typeConfig = {
  buyer: {
    background: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'text-purple-600',
    text: 'text-purple-700',
    label: 'Top Buyer'
  },
  seller: {
    background: 'bg-indigo-50',
    border: 'border-indigo-200',
    icon: 'text-indigo-600',
    text: 'text-indigo-700',
    label: 'Top Seller'
  }
};

export function TopBadge({ type, className = '' }: TopBadgeProps) {
  const config = typeConfig[type];
  const tooltipText = type === 'buyer' 
    ? 'Trusted power buyer with high ratings'
    : 'Trusted power seller with high ratings and consistent delivery';

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${config.background} border ${config.border} rounded-full ${className}`}
      title={tooltipText}
    >
      <Award className={`w-4 h-4 ${config.icon}`} />
      <span className={`text-xs font-semibold ${config.text}`}>{config.label}</span>
    </div>
  );
}
