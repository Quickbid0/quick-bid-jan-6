/**
 * Escrow Protected Badge
 * Shows transaction is protected by escrow service
 * Means QuickMela holds payment until buyer confirms receipt
 * 
 * Usage:
 *   import { EscrowBadge } from './badges/EscrowBadge';
 *   <EscrowBadge />
 */

import React from 'react';
import { Lock } from 'lucide-react';

export interface EscrowBadgeProps {
  className?: string;
}

export function EscrowBadge({ className = '' }: EscrowBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-full ${className}`}
      title="Transaction protected by escrow - QuickMela holds payment until you confirm receipt"
    >
      <Lock className="w-4 h-4 text-green-600" />
      <span className="text-xs font-semibold text-green-700">Escrow Protected</span>
    </div>
  );
}
