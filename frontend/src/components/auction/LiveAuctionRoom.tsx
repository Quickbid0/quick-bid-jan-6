// src/components/auction/LiveAuctionRoom.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import {
  Heart,
  Share,
  Flag,
  Clock,
  Users,
  TrendingUp,
  Zap,
  Eye,
  DollarSign,
  Gavel
} from 'lucide-react';

interface LiveAuctionRoomProps {
  user: User;
}

interface AuctionState {
  id: string;
  status: 'scheduled' | 'live' | 'paused' | 'ended';
  currentBid: number;
  startingPrice: number;
  bidIncrement: number;
  totalBids: number;
  uniqueBidders: number;
  watchers: number;
  timeRemaining: number;
  lastBidTime?: Date;
  winner?: {
    id: string;
    name: string;
    bid: number;
  };
  product: {
    id: string;
    title: string;
    description: string;
    images: string[];
    category: string;
    condition: string;
    location: string;
    specifications: Record<string, string>;
  };
  seller: {
    id: string;
    name: string;
    trustScore: number;
    badges: string[];
    responseTime: string;
  };
}

interface BidEvent {
  id: string;
  auctionId: string;
  bidderId: string;
  bidderName: string;
  amount: number;
  timestamp: Date;
  isAutoBid?: boolean;
  bidType: 'manual' | 'auto' | 'proxy';
}

const LiveAuctionRoom: React.FC<LiveAuctionRoomProps> = ({ user }) => {
  const { auctionId } = useParams<{ auctionId: string }>();
  const navigate = useNavigate();

  const [auction, setAuction] = useState<AuctionState | null>(null);
  const [bidHistory, setBidHistory] = useState<BidEvent[]>([]);
  const [bidAmount, setBidAmount] = useState(0);
  const [isWatching, setIsWatching] = useState(false);
  const [showBidConfirmation, setShowBidConfirmation] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [activityMetrics, setActivityMetrics] = useState({
    watchers: 0,
    bidders: 0,
    bidVelocity: 0,
  });

  const socketRef = useRef<Socket | null>(null);
  const bidSoundRef = useRef<HTMLAudioElement | null>(null);
  const outbidSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize auction data
  useEffect(() => {
    if (!auctionId) return;

    // Fetch initial auction data
    fetchAuctionData();

    // Initialize socket connection
    initializeSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [auctionId]);

  // Update bid amount when auction changes
  useEffect(() => {
    if (auction) {
      const minBid = auction.currentBid + auction.bidIncrement;
      setBidAmount(minBid);
    }
  }, [auction?.currentBid, auction?.bidIncrement]);

  const fetchAuctionData = async () => {
    try {
      const response = await fetch(`/api/auctions/${auctionId}`);
      const data = await response.json();
      setAuction(data);
      setActivityMetrics({
        watchers: data.watchers,
        bidders: data.uniqueBidders,
        bidVelocity: data.bidVelocity || 0,
      });
    } catch (error) {
      console.error('Failed to fetch auction:', error);
    }
  };

  const initializeSocket = () => {
    socketRef.current = io('/auctions', {
      transports: ['websocket', 'polling'],
      timeout: 5000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setConnectionStatus('connected');
      socket.emit('join_auction', {
        auctionId,
        userId: user.id,
        role: 'bidder'
      });
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    socket.on('auction_update', (update: Partial<AuctionState>) => {
      setAuction(prev => prev ? { ...prev, ...update } : null);
    });

    socket.on('bid_placed', (bid: BidEvent) => {
      setBidHistory(prev => [bid, ...prev.slice(0, 19)]); // Keep last 20 bids

      // Play sound if not our bid
      if (bid.bidderId !== user.id) {
        playBidSound();
      }
    });

    socket.on('outbid', (data: { newBid: BidEvent; yourMaxBid?: number }) => {
      // Handle outbid notification
      showOutbidNotification(data);
      playOutbidSound();
    });

    socket.on('auction_ending', (data: { timeLeft: number }) => {
      if (data.timeLeft <= 300) { // 5 minutes
        showUrgentNotification(data.timeLeft);
      }
    });

    socket.on('auction_ended', (data: { winner: any; finalBid: number }) => {
      if (data.winner.id === user.id) {
        showWinCelebration(data.finalBid);
      } else {
        showAuctionEnded();
      }
    });

    socket.on('activity_update', (metrics: typeof activityMetrics) => {
      setActivityMetrics(metrics);
    });

    socket.on('error', (error: any) => {
      console.error('Socket error:', error);
      showErrorNotification(error.message);
    });
  };

  const playBidSound = () => {
    if (bidSoundRef.current) {
      bidSoundRef.current.play().catch(() => {}); // Ignore autoplay restrictions
    }
  };

  const playOutbidSound = () => {
    if (outbidSoundRef.current) {
      outbidSoundRef.current.play().catch(() => {});
    }
  };

  const handleBidSubmit = async () => {
    if (!auction || bidAmount <= auction.currentBid) {
      showError('Bid must be higher than current bid');
      return;
    }

    if (bidAmount > user.walletBalance) {
      showError('Insufficient wallet balance');
      return;
    }

    setShowBidConfirmation(true);
  };

  const confirmBid = async () => {
    setShowBidConfirmation(false);

    if (!socketRef.current) return;

    try {
      const response = await socketRef.current.emitWithAck('place_bid', {
        auctionId,
        amount: bidAmount,
        timestamp: Date.now(),
      });

      if (response.success) {
        // Update local bid amount for next bid
        setBidAmount(bidAmount + auction.bidIncrement);
      } else {
        showError(response.error || 'Failed to place bid');
      }
    } catch (error) {
      showError('Failed to place bid. Please try again.');
    }
  };

  const toggleWatch = () => {
    setIsWatching(!isWatching);
    if (socketRef.current) {
      socketRef.current.emit('toggle_watch', { auctionId, watching: !isWatching });
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.share?.({
      title: auction?.product.title,
      text: `Check out this auction: ${auction?.product.title}`,
      url,
    }) || navigator.clipboard.writeText(url);
  };

  const handleReport = () => {
    navigate(`/report/auction/${auctionId}`);
  };

  if (!auction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading auction...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="live-auction-room min-h-screen bg-gray-50">
      {/* Auction Header */}
      <AuctionHeader
        auction={auction}
        activityMetrics={activityMetrics}
        connectionStatus={connectionStatus}
        isWatching={isWatching}
        onWatch={toggleWatch}
        onShare={handleShare}
        onReport={handleReport}
      />

      {/* Main Auction Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Product Display */}
          <div className="lg:col-span-2">
            <ProductDisplay
              product={auction.product}
              isLive={auction.status === 'live'}
              currentBid={auction.currentBid}
            />
          </div>

          {/* Right Column - Bidding Interface */}
          <div className="space-y-6">
            <BiddingInterface
              auction={auction}
              bidAmount={bidAmount}
              onBidAmountChange={setBidAmount}
              onBidSubmit={handleBidSubmit}
              user={user}
            />

            <LiveActivityFeed
              bids={bidHistory}
              currentUserId={user.id}
              activityMetrics={activityMetrics}
            />
          </div>
        </div>
      </div>

      {/* Audio Elements */}
      <audio ref={bidSoundRef} src="/sounds/bid-placed.mp3" preload="auto" />
      <audio ref={outbidSoundRef} src="/sounds/outbid-alert.mp3" preload="auto" />

      {/* Modals */}
      <BidConfirmationModal
        isOpen={showBidConfirmation}
        bidAmount={bidAmount}
        auction={auction}
        onConfirm={confirmBid}
        onCancel={() => setShowBidConfirmation(false)}
      />

      {/* Notifications will be handled by a global notification system */}
    </div>
  );
};

// Auction Header Component
interface AuctionHeaderProps {
  auction: AuctionState;
  activityMetrics: typeof activityMetrics;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  isWatching: boolean;
  onWatch: () => void;
  onShare: () => void;
  onReport: () => void;
}

const AuctionHeader: React.FC<AuctionHeaderProps> = ({
  auction,
  activityMetrics,
  connectionStatus,
  isWatching,
  onWatch,
  onShare,
  onReport,
}) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          {/* Title and Status */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <LiveIndicator status={auction.status} />
              <HeatMeter level={calculateHeatLevel(activityMetrics.bidVelocity)} />
              <ConnectionStatus status={connectionStatus} />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onWatch}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                  isWatching
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Eye className={`h-4 w-4 ${isWatching ? 'fill-current' : ''}`} />
                {isWatching ? 'Watching' : 'Watch'}
              </button>

              <button
                onClick={onShare}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
              >
                <Share className="h-4 w-4" />
                Share
              </button>

              <button
                onClick={onReport}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
              >
                <Flag className="h-4 w-4" />
                Report
              </button>
            </div>
          </div>

          {/* Auction Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {auction.product.title}
          </h1>

          <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
            <span>Auction #{auction.id}</span>
            <span>•</span>
            <span>{auction.product.category}</span>
            <span>•</span>
            <span>{auction.product.location}</span>
          </div>

          {/* Activity Stats */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {activityMetrics.watchers} watching
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Gavel className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {activityMetrics.bidders} bidders
              </span>
            </div>

            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {activityMetrics.bidVelocity}/min
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Live Indicator
const LiveIndicator: React.FC<{ status: AuctionState['status'] }> = ({ status }) => {
  const configs = {
    scheduled: { label: 'Scheduled', color: 'bg-blue-500', animate: false },
    live: { label: 'LIVE', color: 'bg-red-500', animate: true },
    paused: { label: 'Paused', color: 'bg-yellow-500', animate: false },
    ended: { label: 'Ended', color: 'bg-gray-500', animate: false },
  };

  const config = configs[status];

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${config.color} ${
        config.animate ? 'animate-pulse' : ''
      }`} />
      <span className="text-sm font-medium text-gray-900">{config.label}</span>
    </div>
  );
};

// Heat Meter
const HeatMeter: React.FC<{ level: 'low' | 'medium' | 'high' | 'extreme' }> = ({ level }) => {
  const configs = {
    low: { text: 'Low Activity', color: 'text-gray-600' },
    medium: { text: 'Medium Activity', color: 'text-yellow-600' },
    high: { text: 'High Activity 🔥', color: 'text-orange-600' },
    extreme: { text: 'Extreme Activity 🔥🔥', color: 'text-red-600' },
  };

  const config = configs[level];

  return (
    <div className="flex items-center gap-2">
      <Zap className={`h-4 w-4 ${config.color}`} />
      <span className={`text-sm font-medium ${config.color}`}>{config.text}</span>
    </div>
  );
};

// Connection Status
const ConnectionStatus: React.FC<{ status: 'connecting' | 'connected' | 'disconnected' }> = ({ status }) => {
  const configs = {
    connecting: { text: 'Connecting...', color: 'text-yellow-600' },
    connected: { text: 'Connected', color: 'text-green-600' },
    disconnected: { text: 'Disconnected', color: 'text-red-600' },
  };

  const config = configs[status];

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${
        status === 'connected' ? 'bg-green-500' :
        status === 'connecting' ? 'bg-yellow-500 animate-pulse' :
        'bg-red-500'
      }`} />
      <span className={`text-sm ${config.color}`}>{config.text}</span>
    </div>
  );
};

// Calculate heat level based on bid velocity
const calculateHeatLevel = (bidVelocity: number): 'low' | 'medium' | 'high' | 'extreme' => {
  if (bidVelocity >= 10) return 'extreme';
  if (bidVelocity >= 5) return 'high';
  if (bidVelocity >= 2) return 'medium';
  return 'low';
};

// Placeholder functions for notifications
const showOutbidNotification = (data: any) => {
  // Implement notification system
  console.log('Outbid notification:', data);
};

const showUrgentNotification = (timeLeft: number) => {
  // Implement urgent notification
  console.log('Urgent notification:', timeLeft);
};

const showWinCelebration = (finalBid: number) => {
  // Implement win celebration
  console.log('Win celebration:', finalBid);
};

const showAuctionEnded = () => {
  // Implement auction ended notification
  console.log('Auction ended');
};

const showError = (message: string) => {
  // Implement error notification
  console.error('Error:', message);
};

const showErrorNotification = (message: string) => {
  // Implement error notification
  console.error('Socket error:', message);
};

export default LiveAuctionRoom;
