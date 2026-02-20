/**
 * FIX S-05: PII Exposure in API Responses
 * Never return raw DB documents. Always project only necessary fields.
 * Sensitive fields (email, phone, wallet, passwordHash, role) only returned for authenticated user's OWN profile.
 */

export interface PublicUser {
  id: string;
  displayName: string;
  avatarUrl?: string;
}

export interface PrivateUser extends PublicUser {
  email: string;
  phone?: string;
  role: string;
  walletBalance: number;
  emailVerified: boolean;
  createdAt: string;
}

/**
 * Sanitize user for public listing (auction bidders, seller info)
 * ✅ No email, phone, wallet, or role exposed
 */
export const sanitizePublicUser = (user: any): PublicUser => {
  if (!user) return null as any;
  return {
    id: user._id || user.id,
    displayName: user.displayName || user.name || 'Anonymous User',
    avatarUrl: user.profile?.avatarUrl || user.avatarUrl,
  };
};

/**
 * Sanitize user for private profile (authenticated user viewing their own profile)
 * ✅ Returns sensitive fields only for the user themselves
 */
export const sanitizePrivateUser = (user: any): PrivateUser => {
  if (!user) return null as any;
  return {
    id: user._id || user.id,
    displayName: user.displayName || user.name || 'User',
    avatarUrl: user.profile?.avatarUrl || user.avatarUrl,
    email: user.email,
    phone: user.phone,
    role: user.role || 'buyer',
    walletBalance: user.wallet?.balance || user.walletBalance || 0,
    emailVerified: user.emailVerified || false,
    createdAt: user.createdAt,
  };
};

/**
 * Apply to auction list responses to hide bidder details
 * Usage in GET /api/auctions endpoint:
 *   const auctions = await Auction.find().lean();
 *   const sanitized = auctions.map(auction => ({
 *     ...auction,
 *     highestBidderInfo: auction.highestBidderId ? sanitizePublicUser(bidderUser) : null,
 *     bids: auction.bids.map(bid => ({
 *       amount: bid.amount,
 *       timestamp: bid.timestamp,
 *       bidderInfo: sanitizePublicUser(bid.bidderUser)
 *     }))
 *   }));
 */

/**
 * Sanitize bids array in auction response
 */
export const sanitizeBids = (bids: any[]) => {
  return bids.map(bid => ({
    amount: bid.amount,
    timestamp: bid.timestamp,
    bidderInfo: bid.bidderUser ? sanitizePublicUser(bid.bidderUser) : {},
  }));
};

/**
 * Sanitize auction for public viewing
 */
export const sanitizeAuctionForPublic = (auction: any) => {
  return {
    id: auction._id || auction.id,
    title: auction.title,
    description: auction.description,
    imageUrl: auction.imageUrl,
    startPrice: auction.startPrice,
    currentHighestBid: auction.currentHighestBid,
    highestBidderInfo: auction.highestBidderId 
      ? sanitizePublicUser(auction.highestBidderData) 
      : null,
    endTime: auction.endTime,
    status: auction.status,
    bidsCount: auction.bids?.length || 0,
    // Exclude: full bids array, seller email/phone/wallet, starting buyer info
  };
};
