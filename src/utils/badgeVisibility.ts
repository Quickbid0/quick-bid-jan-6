/**
 * Badge Visibility Utility
 * Determines which badges to display based on user/seller/auction attributes
 * 
 * Usage:
 *   import { getBadgesForSeller, getBadgesForAuction } from '../utils/badgeVisibility';
 * 
 *   const badges = getBadgesForSeller(sellerData);
 *   // Returns: ['verified', 'topSeller']
 * 
 *   const auctionBadges = getBadgesForAuction(auctionData);
 *   // Returns: ['escrow', 'aiInspected']
 */

export interface SellerData {
  isVerified: boolean;
  isTopSeller?: boolean;
  isFoundingMember?: boolean;
  joinedDate?: string;
}

export interface AuctionData {
  escrowEnabled: boolean;
  aiInspected: boolean;
  inspectionGrade?: 'ACE' | 'GOOD' | 'FAIR' | 'POOR';
}

export interface BuyerData {
  isVerified: boolean;
  isTopBuyer?: boolean;
  isFoundingMember?: boolean;
  joinedDate?: string;
}

/**
 * Get badges that should be displayed for a seller
 */
export function getBadgesForSeller(seller: SellerData): string[] {
  const badges: string[] = [];

  if (seller.isVerified) {
    badges.push('verified');
  }

  if (seller.isTopSeller) {
    badges.push('topSeller');
  }

  if (seller.isFoundingMember) {
    badges.push('foundingMember');
  }

  return badges;
}

/**
 * Get badges that should be displayed for an auction
 */
export function getBadgesForAuction(auction: AuctionData): string[] {
  const badges: string[] = [];

  if (auction.escrowEnabled) {
    badges.push('escrow');
  }

  if (auction.aiInspected) {
    badges.push('aiInspected');
  }

  return badges;
}

/**
 * Get badges that should be displayed for a buyer
 */
export function getBadgesForBuyer(buyer: BuyerData): string[] {
  const badges: string[] = [];

  if (buyer.isVerified) {
    badges.push('verified');
  }

  if (buyer.isTopBuyer) {
    badges.push('topBuyer');
  }

  if (buyer.isFoundingMember) {
    badges.push('foundingMember');
  }

  return badges;
}

/**
 * Combine seller and auction badges for display on auction card
 */
export function getAuctionCardBadges(
  seller: SellerData,
  auction: AuctionData
): string[] {
  const sellerBadges = getBadgesForSeller(seller);
  const auctionBadges = getBadgesForAuction(auction);
  
  // Return combined unique badges
  return Array.from(new Set([...sellerBadges, ...auctionBadges]));
}

/**
 * Get all badges for display on auction detail page (buyer perspective)
 */
export function getAuctionDetailBadges(
  seller: SellerData,
  auction: AuctionData
): {
  sellerBadges: string[];
  auctionBadges: string[];
  allBadges: string[];
} {
  const sellerBadges = getBadgesForSeller(seller);
  const auctionBadges = getBadgesForAuction(auction);
  const allBadges = Array.from(new Set([...sellerBadges, ...auctionBadges]));

  return {
    sellerBadges,
    auctionBadges,
    allBadges
  };
}

/**
 * Get inspection grade badge info
 */
export function getInspectionGradeBadge(grade?: string): {
  type: 'ACE' | 'GOOD' | 'FAIR' | 'POOR';
  color: string;
  description: string;
} | null {
  if (!grade) return null;

  const gradeMap = {
    ACE: {
      type: 'ACE' as const,
      color: 'green',
      description: 'Excellent condition - minimal wear'
    },
    GOOD: {
      type: 'GOOD' as const,
      color: 'blue',
      description: 'Good condition - normal wear'
    },
    FAIR: {
      type: 'FAIR' as const,
      color: 'amber',
      description: 'Fair condition - visible wear'
    },
    POOR: {
      type: 'POOR' as const,
      color: 'red',
      description: 'Poor condition - significant wear'
    }
  };

  return gradeMap[grade as keyof typeof gradeMap] || null;
}
