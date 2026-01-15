import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../config/supabaseClient';
import { Gavel, Clock, Zap, AlertTriangle, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useSession } from '../context/SessionContext';

interface RealTimeBiddingProps {
  auctionId: string;
  currentPrice: number;
  incrementAmount: number;
  onBidPlaced?: (amount: number) => void;
  placeBidAction?: (amount: number) => Promise<{ success: boolean; error?: string }>;
  sellerId?: string;
}

interface LiveBid {
  id: string;
  amount: number;
  bidder: string;
  timestamp: Date;
  isWinning: boolean;
}

const RealTimeBidding: React.FC<RealTimeBiddingProps> = ({
  auctionId,
  currentPrice,
  incrementAmount,
  onBidPlaced,
  placeBidAction,
  sellerId
}) => {
  const { user } = useSession();
  const [bidAmount, setBidAmount] = useState('');
  const [liveBids, setLiveBids] = useState<LiveBid[]>([]);
  const [bidding, setBidding] = useState(false);
  const [customBidMode, setCustomBidMode] = useState(false);
  
  // Safety & Context Signals
  const [isHighTraffic, setIsHighTraffic] = useState(false);
  const [timeSinceLastBid, setTimeSinceLastBid] = useState<string>('');
  const [bidStatus, setBidStatus] = useState<'winning' | 'outbid' | 'neutral'>('neutral');
  const [bidSuccess, setBidSuccess] = useState(false);
  const recentBidsRef = useRef<number[]>([]);

  useEffect(() => {
    // Fetch initial state to ensure persistence on refresh
    const fetchInitialState = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase
          .from('bids')
          .select('*')
          .eq('auction_id', auctionId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching initial bids:', error);
          return;
        }

        if (data && data.length > 0) {
          const history: LiveBid[] = data.map((b: any) => ({
            id: b.id,
            amount: b.amount,
            bidder: user && b.user_id === user.id ? 'You' : `Bidder #${b.user_id.slice(-4)}`,
            timestamp: new Date(b.created_at),
            isWinning: false // Calculated below
          }));

          // Determine winning status
          if (history.length > 0) {
            history[0].isWinning = true;
          }

          setLiveBids(history);

          // Populate recent bids for traffic detection
          const now = Date.now();
          const recentTimestamps = history
            .map(b => b.timestamp.getTime())
            .filter(t => now - t < 30000);
          recentBidsRef.current = recentTimestamps;
          setIsHighTraffic(recentTimestamps.length >= 3);

          // Determine user status
          if (history.length > 0) {
             if (history[0].bidder === 'You') {
               setBidStatus('winning');
             } else if (history.some(b => b.bidder === 'You')) {
               setBidStatus('outbid');
             }
          }
        }
      } catch (e) {
        console.error('Error in fetchInitialState:', e);
      }
    };

    fetchInitialState();

    // Subscribe to real-time bid updates
    const channel = supabase
      .channel(`auction:${auctionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'bids',
        filter: `auction_id=eq.${auctionId}`
      }, (payload) => {
        handleNewBid(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [auctionId, user]);

  // Timer for "Time Since Last Bid"
  useEffect(() => {
    const interval = setInterval(() => {
      if (liveBids.length > 0) {
        const lastBid = liveBids[0];
        const seconds = Math.floor((new Date().getTime() - lastBid.timestamp.getTime()) / 1000);
        
        if (seconds < 60) {
          setTimeSinceLastBid(`${seconds}s ago`);
        } else {
          setTimeSinceLastBid(`${Math.floor(seconds / 60)}m ago`);
        }
      } else {
        setTimeSinceLastBid('');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [liveBids]);

  const handleNewBid = (newBid: any) => {
    const now = Date.now();
    
    // Update rapid movement detection
    // Filter out bids older than 30 seconds
    recentBidsRef.current = [...recentBidsRef.current, now].filter(t => now - t < 30000);
    // If more than 3 bids in 30 seconds, trigger high traffic warning
    setIsHighTraffic(recentBidsRef.current.length >= 3);

    const bid: LiveBid = {
      id: newBid.id,
      amount: newBid.amount,
      bidder: newBid.user_id === user?.id ? 'You' : `Bidder #${newBid.user_id.slice(-4)}`,
      timestamp: new Date(newBid.created_at),
      isWinning: true
    };

    setLiveBids(prev => {
      // If the new bid is not from me, and I was previously winning, I am now outbid
      const wasWinning = prev.length > 0 && prev[0].bidder === 'You';
      if (newBid.user_id !== user?.id && wasWinning) {
        setBidStatus('outbid');
        toast('You have been outbid!', { icon: '⚠️' });
      } else if (newBid.user_id === user?.id) {
        setBidStatus('winning');
      }
      
      return [
        bid,
        ...prev.map(b => ({ ...b, isWinning: false })).slice(0, 9)
      ];
    });

    // Show toast for new bids if not from current user
    if (newBid.user_id !== user?.id) {
      toast(`New bid: ₹${newBid.amount.toLocaleString()}`, {
        icon: '🔥',
        duration: 2000
      });
    }
  };

  const placeBid = async (amountOverride?: number) => {
    if (!user?.id) {
      toast.error('Please login to place bids');
      return;
    }
    
    if (sellerId && user.id === sellerId) {
      toast.error('You cannot bid on your own auction');
      return;
    }

    const amount = amountOverride || parseFloat(bidAmount);
    if (!amount || amount <= currentPrice) {
      toast.error('Bid must be higher than current price');
      return;
    }

    if (amount < currentPrice + incrementAmount) {
      toast.error(`Minimum increment is ₹${incrementAmount.toLocaleString()}`);
      return;
    }

    setBidding(true);
    try {
      if (placeBidAction) {
        const result = await placeBidAction(amount);
        if (!result.success) {
           // Enhanced error feedback
           if (result.error?.includes('deposit')) {
             toast.error('Security deposit required to bid higher.');
           } else {
             toast.error(result.error || 'Failed to place bid');
           }
           return;
        }
        // Success handled by parent or subscription update
        setBidAmount('');
        setCustomBidMode(false);
        toast.success('Bid Accepted');
      } else {
        // Fallback for standalone usage
        const { error } = await supabase
          .from('bids')
          .insert([{
            auction_id: auctionId,
            user_id: user.id,
            amount,
            status: 'active'
          }]);

        if (error) throw error;

        // Update auction current price
        await supabase
          .from('auctions')
          .update({ current_price: amount })
          .eq('id', auctionId);

        setBidAmount('');
        setCustomBidMode(false);
        onBidPlaced?.(amount);
        setBidSuccess(true);
        setTimeout(() => setBidSuccess(false), 2000);
        toast.success(`Bid placed: ₹${amount.toLocaleString()}`);
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      toast.error('Connection error. Retrying...');
    } finally {
      setBidding(false);
    }
  };

  const isWinning = liveBids.length > 0 && liveBids[0].bidder === 'You';
  const nextMinBid = currentPrice + incrementAmount;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 relative">
      
      {/* Contextual Safety Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
           <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Bidding</h3>
           <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-full">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
             </span>
             <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Live</span>
           </div>
           {isHighTraffic && (
             <span className="animate-pulse px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full flex items-center gap-1">
               <Activity className="h-3 w-3" /> High Competition
             </span>
           )}
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {isWinning ? (
             <div className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full flex items-center gap-1 shadow-sm">
               <Zap className="h-3 w-3" /> YOU ARE WINNING
             </div>
          ) : liveBids.length > 0 && bidStatus === 'outbid' ? (
             <div className="px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-full flex items-center gap-1 shadow-sm animate-pulse">
               <AlertTriangle className="h-3 w-3" /> OUTBID
             </div>
          ) : (
            <span className="text-sm text-gray-500">
              {liveBids.length === 0 ? 'Be the first to bid' : `${liveBids.length} bids placed`}
            </span>
          )}
        </div>
      </div>

      {/* Current Price Display with Competitive Context */}
      <div className="text-center mb-8 bg-gray-50 dark:bg-gray-700/20 rounded-xl p-4">
        <div className="flex justify-between items-start">
           <div className="text-left">
             <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Current Bid</p>
             <div className="flex items-baseline gap-1">
               <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                 ₹{currentPrice.toLocaleString()}
               </span>
             </div>
           </div>
           
           <div className="text-right">
             <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Bid</p>
             <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-end gap-1">
               <Clock className="h-3 w-3" /> {timeSinceLastBid || 'Just now'}
             </p>
           </div>
        </div>
      </div>

      {/* Bidding Controls - Sticky on Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:relative md:bottom-auto md:bg-transparent md:p-0 md:border-none md:shadow-none z-50 pb-safe">
        {!customBidMode ? (
          <div className="space-y-3 max-w-7xl mx-auto">
             <button
              onClick={() => placeBid(nextMinBid)}
              disabled={bidding}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
                bidding 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.01] shadow-indigo-200 dark:shadow-none'
              } text-white`}
            >
              {bidding ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span className="text-lg font-bold">Submitting...</span>
                </>
              ) : (
                <>
                  <Gavel className="h-5 w-5" />
                  <span className="text-lg font-bold">Bid ₹{nextMinBid.toLocaleString()}</span>
                </>
              )}
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => placeBid(nextMinBid + incrementAmount)}
                disabled={bidding}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 text-sm transition-colors"
              >
                + Bid ₹{(nextMinBid + incrementAmount).toLocaleString()}
              </button>
              <button
                onClick={() => setCustomBidMode(true)}
                disabled={bidding}
                className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors"
              >
                Custom Amount...
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl max-w-7xl mx-auto">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enter Bid Amount
                </label>
                <button 
                  onClick={() => setCustomBidMode(false)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Cancel
                </button>
              </div>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={`Min: ₹${nextMinBid.toLocaleString()}`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-lg"
                autoFocus
              />
            </div>
            <button
              onClick={() => placeBid()}
              disabled={bidding || !bidAmount}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
            >
              {bidding ? 'Placing Bid...' : 'Place Custom Bid'}
            </button>
          </div>
        )}
      </div>

      {/* Spacer for Mobile Fixed Bottom */}
      <div className="h-32 md:hidden"></div>

      {/* Live Bid Feed */}
      <div className="border-t dark:border-gray-700 pt-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4 text-gray-500" />
          Live Activity
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          <AnimatePresence>
            {liveBids.map((bid) => (
              <motion.div
                key={bid.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  bid.isWinning ? 'bg-green-50 border border-green-200' : 'bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    bid.bidder === 'You' ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-gray-700'
                  }`}>
                    {bid.bidder === 'You' ? 'Y' : bid.bidder.slice(-1)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{bid.bidder}</p>
                    <p className="text-xs text-gray-500">
                      {bid.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">₹{bid.amount.toLocaleString()}</p>
                  {bid.isWinning && (
                    <p className="text-xs text-green-600">Winning</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default RealTimeBidding;
