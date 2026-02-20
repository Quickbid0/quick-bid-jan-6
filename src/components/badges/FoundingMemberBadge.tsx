/**
 * Founding Member Badge
 * Shows user was an early adopter of QuickMela
 * Designates members who joined during beta or early launch
 * 
 * Usage:
 *   import { FoundingMemberBadge } from './badges/FoundingMemberBadge';
 *   <FoundingMemberBadge joinedDate="2025-01-15" />
 */

import React from 'react';
import { Star } from 'lucide-react';

export interface FoundingMemberBadgeProps {
  joinedDate?: string;
  className?: string;
}

export function FoundingMemberBadge({ joinedDate, className = '' }: FoundingMemberBadgeProps) {
  const tooltipText = joinedDate
    ? `Founding member since ${new Date(joinedDate).toLocaleDateString()}`
    : 'Founding member - early supporter of QuickMela';

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 border border-yellow-200 rounded-full ${className}`}
      title={tooltipText}
    >
      <Star className="w-4 h-4 text-yellow-600 fill-current" />
      <span className="text-xs font-semibold text-yellow-700">Founding Member</span>
    </div>
  );
}
