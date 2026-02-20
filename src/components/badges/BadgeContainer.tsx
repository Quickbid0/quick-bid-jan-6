/**
 * Badge Container Component
 * Renders a set of badges with proper spacing
 * 
 * Usage:
 *   import { BadgeContainer } from './badges/BadgeContainer';
 *   import { getBadgesForSeller } from '../utils/badgeVisibility';
 * 
 *   const badges = getBadgesForSeller(seller);
 *   <BadgeContainer badges={badges} seller={seller} auction={auction} />
 */

import React from 'react';
import { VerifiedBadge } from './VerifiedBadge';
import { EscrowBadge } from './EscrowBadge';
import { AIInspectedBadge } from './AIInspectedBadge';
import { TopBadge } from './TopBadge';
import { FoundingMemberBadge } from './FoundingMemberBadge';

export interface BadgeContainerProps {
  badges: string[];
  seller?: {
    isVerified?: boolean;
    isTopSeller?: boolean;
    isFoundingMember?: boolean;
    joinedDate?: string;
  };
  auction?: {
    escrowEnabled?: boolean;
    aiInspected?: boolean;
    inspectionGrade?: 'ACE' | 'GOOD' | 'FAIR' | 'POOR';
  };
  buyer?: {
    isVerified?: boolean;
    isTopBuyer?: boolean;
    isFoundingMember?: boolean;
    joinedDate?: string;
  };
  className?: string;
  direction?: 'row' | 'col';
  gap?: 'sm' | 'md' | 'lg';
}

const gapMap = {
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4'
};

const directionMap = {
  row: 'flex-row flex-wrap',
  col: 'flex-col'
};

export function BadgeContainer({
  badges,
  seller,
  auction,
  buyer,
  className = '',
  direction = 'row',
  gap = 'md'
}: BadgeContainerProps) {
  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={`flex ${directionMap[direction]} ${gapMap[gap]} ${className}`}>
      {badges.includes('verified') && <VerifiedBadge />}
      
      {badges.includes('escrow') && auction?.escrowEnabled && <EscrowBadge />}
      
      {badges.includes('aiInspected') && auction?.aiInspected && auction?.inspectionGrade && (
        <AIInspectedBadge grade={auction.inspectionGrade} />
      )}
      
      {badges.includes('topSeller') && <TopBadge type="seller" />}
      
      {badges.includes('topBuyer') && <TopBadge type="buyer" />}
      
      {badges.includes('foundingMember') && (
        <FoundingMemberBadge joinedDate={seller?.joinedDate || buyer?.joinedDate} />
      )}
    </div>
  );
}
