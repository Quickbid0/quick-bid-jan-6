export interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  userName: string;
  amount: number;
  timestamp: Date;
  isBuyNow?: boolean;
}

export interface AuctionState {
  auctionId: string;
  status: 'waiting' | 'active' | 'paused' | 'ended';
  currentPrice: number;
  startPrice: number;
  reservePrice?: number;
  buyNowPrice?: number;
  endTime: Date;
  totalBids: number;
  activeUsers: number;
  lastBid?: {
    userId: string;
    userName: string;
    amount: number;
    timestamp: Date;
  };
  timeLeft: number; // seconds
  isExtended: boolean;
}

export interface AuctionParticipant {
  userId: string;
  userName: string;
  joinedAt: Date;
  bidCount: number;
  lastBidAmount?: number;
}

export interface AuctionRoom {
  auctionId: string;
  participants: AuctionParticipant[];
  auctionState: AuctionState;
  bidHistory: Bid[];
}

export interface BidRequest {
  auctionId: string;
  userId: string;
  amount: number;
  userName: string;
}

export interface BidResponse {
  success: boolean;
  bid?: Bid;
  auctionState?: AuctionState;
  shouldExtend?: boolean;
  newEndTime?: Date;
  reason?: string;
  message?: string;
}

export interface AuctionStats {
  auctionId: string;
  status: AuctionState['status'];
  currentPrice: number;
  totalBids: number;
  timeLeft: number;
  isExtended: boolean;
  lastBid?: Bid;
  participantCount: number;
  averageBidAmount: number;
  highestBid: number;
  lowestBid: number;
}

export interface AuctionSettings {
  auctionId: string;
  startPrice: number;
  reservePrice?: number;
  buyNowPrice?: number;
  duration: number; // minutes
  autoExtend: boolean;
  extendTime: number; // minutes
  triggerTime: number; // minutes before end
  minBidIncrement: number;
  maxBidsPerUser?: number;
  allowProxyBidding: boolean;
}
