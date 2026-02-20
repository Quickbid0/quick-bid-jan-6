/**
 * Verified Seller Badge
 * Shows seller has completed identity verification
 * 
 * Usage:
 *   import { VerifiedBadge } from './badges/VerifiedBadge';
 *   <VerifiedBadge />
 */

import React from 'react';
import { BadgeCheck } from 'lucide-react';

export interface VerifiedBadgeProps {
  className?: string;
}

export function VerifiedBadge({ className = '' }: VerifiedBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full ${className}`}
      title="Seller identity verified"
    >
      <BadgeCheck className="w-4 h-4 text-blue-600" />
      <span className="text-xs font-semibold text-blue-700">Verified</span>
    </div>
  );
}
