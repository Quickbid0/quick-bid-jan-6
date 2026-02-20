/**
 * AI Inspected Badge
 * Shows item has been inspected by AI inspection system
 * Color-coded by condition grade: ACE (green) > GOOD (blue) > FAIR (amber) > POOR (red)
 * 
 * Usage:
 *   import { AIInspectedBadge } from './badges/AIInspectedBadge';
 *   <AIInspectedBadge grade="ACE" />
 */

import React from 'react';
import { Sparkles } from 'lucide-react';

export interface AIInspectedBadgeProps {
  grade: 'ACE' | 'GOOD' | 'FAIR' | 'POOR';
  className?: string;
}

const gradeConfig = {
  ACE: {
    background: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    text: 'text-green-700',
    label: 'AI Excellent'
  },
  GOOD: {
    background: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    text: 'text-blue-700',
    label: 'AI Good'
  },
  FAIR: {
    background: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'text-amber-600',
    text: 'text-amber-700',
    label: 'AI Fair'
  },
  POOR: {
    background: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    text: 'text-red-700',
    label: 'AI Poor'
  }
};

export function AIInspectedBadge({ grade, className = '' }: AIInspectedBadgeProps) {
  const config = gradeConfig[grade];

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${config.background} border ${config.border} rounded-full ${className}`}
      title={`Item inspected by AI - Grade: ${grade}`}
    >
      <Sparkles className={`w-4 h-4 ${config.icon}`} />
      <span className={`text-xs font-semibold ${config.text}`}>{config.label}</span>
    </div>
  );
}
