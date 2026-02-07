import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Users, Gavel, TrendingUp, AlertCircle, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface LiveAuctionTimerProps {
  auctionId: string;
  endTime: string;
  currentBid: number;
  bidCount: number;
  onBidPlaced?: (amount: number) => void;
  isLive?: boolean;
}

interface Bid {
  id: string;
  amount: number;
  bidder: string;
  timestamp: string;
  isAutoBid?: boolean;
}

const LiveAuctionTimer: React.FC<LiveAuctionTimerProps> = ({
  auctionId,
  endTime,
  currentBid,
  bidCount,
  onBidPlaced,
  isLive = false
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isEnded, setIsEnded] = useState(false);
  const [recentBids, setRecentBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState(currentBid + 1000);
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [autoBidEnabled, setAutoBidEnabled] = useState(false);
  const [maxAutoBid, setMaxAutoBid] = useState(currentBid + 50000);
  const [watchers, setWatchers] = useState(Math.floor(Math.random() * 50) + 10);

  // Calculate time left
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endTime).getTime() - new Date().getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft({ days, hours, minutes, seconds });
        setIsEnded(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsEnded(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  // Simulate live bid updates
  useEffect(() => {
    if (!isLive || isEnded) return;

    const interval = setInterval(() => {
      const random = Math.random();
      
      // Simulate new bid (30% chance every 5 seconds)
      if (random < 0.3) {
        const newBid: Bid = {
          id: Date.now().toString(),
          amount: currentBid + Math.floor(Math.random() * 5000) + 1000,
          bidder: `User${Math.floor(Math.random() * 1000)}`,
          timestamp: new Date().toISOString(),
          isAutoBid: Math.random() < 0.4
        };
        
        setRecentBids(prev => [newBid, ...prev.slice(0, 4)]);
        setBidAmount(newBid.amount + 1000);
        
        // Update watchers
        setWatchers(prev => prev + Math.floor(Math.random() * 5) + 1);
        
        toast.success(`New bid: ${formatPrice(newBid.amount)} by ${newBid.bidder}`);
      }
      
      // Update watchers randomly
      if (random < 0.6) {
        setWatchers(prev => Math.max(5, prev + Math.floor(Math.random() * 3) - 1));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive, isEnded, currentBid]);

  const handleBid = useCallback(async () => {
    if (bidAmount <= currentBid) {
      toast.error('Bid amount must be higher than current bid');
      return;
    }

    setIsPlacingBid(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newBid: Bid = {
        id: Date.now().toString(),
        amount: bidAmount,
        bidder: 'You',
        timestamp: new Date().toISOString(),
        isAutoBid: false
      };
      
      setRecentBids(prev => [newBid, ...prev.slice(0, 4)]);
      setBidAmount(bidAmount + 1000);
      
      onBidPlaced?.(bidAmount);
      toast.success(`Bid placed successfully: ${formatPrice(bidAmount)}`);
      
      // Update watchers
      setWatchers(prev => prev + Math.floor(Math.random() * 3) + 1);
    } catch (error) {
      toast.error('Failed to place bid. Please try again.');
    } finally {
      setIsPlacingBid(false);
    }
  }, [bidAmount, currentBid, onBidPlaced]);

  const handleAutoBid = useCallback(async () => {
    if (maxAutoBid <= currentBid) {
      toast.error('Maximum auto-bid must be higher than current bid');
      return;
    }

    setAutoBidEnabled(!autoBidEnabled);
    
    if (!autoBidEnabled) {
      toast.success('Auto-bid enabled');
    } else {
      toast.error('Auto-bid disabled');
    }
  }, [autoBidEnabled, maxAutoBid, currentBid]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getTimeColor = () => {
    if (isEnded) return 'text-red-600';
    if (timeLeft.days > 0) return 'text-green-600';
    if (timeLeft.hours > 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isLive ? 'bg-red-100' : 'bg-gray-100'}`}>
            <Clock className={`w-5 h-5 ${isLive ? 'text-red-600' : 'text-gray-600'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {isLive ? 'Live Auction' : 'Auction Timer'}
            </h3>
            <p className="text-sm text-gray-600">
              {isLive ? 'Bidding in real-time' : 'Auction ends soon'}
            </p>
          </div>
        </div>
        
        {isLive && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
            <span className="text-sm text-red-600 font-medium">LIVE</span>
          </div>
        )}
      </div>

      {/* Timer Display */}
      <div className={`text-center p-4 rounded-lg ${isEnded ? 'bg-red-50' : 'bg-gray-50'}`}>
        {isEnded ? (
          <div className="space-y-2">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
            <p className="text-lg font-bold text-red-600">Auction Ended</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-center gap-4 text-2xl font-bold">
              {timeLeft.days > 0 && (
                <div className="text-center">
                  <div>{String(timeLeft.days).padStart(2, '0')}</div>
                  <div className="text-xs text-gray-500">Days</div>
                </div>
              )}
              <div className="text-center">
                <div>{String(timeLeft.hours).padStart(2, '0')}</div>
                <div className="text-xs text-gray-500">Hours</div>
              </div>
              <div className="text-center">
                <div>{String(timeLeft.minutes).padStart(2, '0')}</div>
                <div className="text-xs text-gray-500">Minutes</div>
              </div>
              <div className="text-center">
                <div className={getTimeColor()}>{String(timeLeft.seconds).padStart(2, '0')}</div>
                <div className="text-xs text-gray-500">Seconds</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Current Bid Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-600">Current Bid</span>
            <Gavel className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-xl font-bold text-green-900">{formatPrice(currentBid)}</p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-600">Total Bids</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-blue-900">{bidCount}</p>
        </div>
      </div>

      {/* Live Watchers */}
      {isLive && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{watchers} people watching</span>
        </div>
      )}

      {/* Recent Bids */}
      <AnimatePresence>
        {recentBids.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h4 className="font-medium text-gray-900">Recent Bids</h4>
            <div className="space-y-2">
              {recentBids.map((bid, index) => (
                <motion.div
                  key={bid.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      bid.bidder === 'You' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <span className="text-sm font-medium">{bid.bidder}</span>
                    {bid.isAutoBid && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                        Auto
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatPrice(bid.amount)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(bid.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bidding Controls */}
      {!isEnded && (
        <div className="space-y-4">
          {/* Manual Bid */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Your Bid Amount
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                min={currentBid + 1000}
                step={1000}
              />
              <button
                onClick={handleBid}
                disabled={isPlacingBid || bidAmount <= currentBid}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isPlacingBid ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Placing...
                  </>
                ) : (
                  <>
                    <Gavel className="w-4 h-4" />
                    Place Bid
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Auto Bid */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Auto-Bid (Maximum: {formatPrice(maxAutoBid)})
              </label>
              <button
                onClick={handleAutoBid}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoBidEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoBidEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <input
              type="number"
              value={maxAutoBid}
              onChange={(e) => setMaxAutoBid(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              min={currentBid + 1000}
              step={5000}
              placeholder="Set maximum auto-bid amount"
            />
          </div>
        </div>
      )}

      {/* Notifications */}
      {isLive && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
          <Bell className="w-4 h-4 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            Get notified when someone outbids you
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveAuctionTimer;
