import React, { useState, useEffect } from 'react';
import { useSession } from '../context/SessionContext';
import { supabase } from '../config/supabaseClient';
import { toast } from 'react-hot-toast';
import { X, Gavel, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface BidModalProps {
  product: any;
  auctionId?: string;
  onClose: () => void;
  onBidPlaced: () => void;
}

const BidModal: React.FC<BidModalProps> = ({ product, auctionId, onClose, onBidPlaced }) => {
  const [bidAmount, setBidAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const { user } = useSession();
  const navigate = useNavigate();

  const currentPrice = product.current_price || product.starting_price || 0;
  const auctionType = product.auctionType || { type: 'standard', bidIncrement: 1000 };

  // Calculate minimum bid based on auction type
  const getMinBid = () => {
    switch (auctionType.type) {
      case 'reserve':
        return currentPrice + auctionType.bidIncrement;
      case 'dutch':
        // For Dutch auctions, minimum bid is the current Dutch price
        return currentPrice;
      case 'tender':
        // For tenders, there's no minimum - bidders can go lower
        return 1; // Very low minimum
      case 'standard':
      default:
        return currentPrice + (auctionType.bidIncrement || 1000);
    }
  };

  const minBid = getMinBid();

  useEffect(() => {
    fetchWalletBalance();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      // PRODUCTION: Disable demo session fallback
      const isProduction = import.meta.env.PROD || import.meta.env.VITE_AUTH_MODE === 'real';
      const demoSession = localStorage.getItem('demo-session');
      
      if (!isProduction && demoSession) {
        setWalletBalance(500000);
        return 500000;
      }
      
      // Use backend API for wallet balance - PRODUCTION PRIORITY
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:4011';
      const response = await fetch(`${serverUrl}/api/wallet/balance`);
      
      if (response.ok) {
        const data = await response.json();
        setWalletBalance(data.balance);
        return data.balance;
      }
      
      // Fallback to Supabase if backend fails
      if (!user) return 0;

      const { data, error } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setWalletBalance(data.wallet_balance || 0);
        return data.wallet_balance || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast.error('Failed to fetch wallet balance');
      return 0;
    } finally {
      setBalanceLoading(false);
    }
  };

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(bidAmount);

    if (isNaN(amount)) {
      toast.error('Please enter a valid bid amount');
      return;
    }

    // Auction type specific validation
    switch (auctionType.type) {
      case 'reserve':
        if (amount < auctionType.reservePrice!) {
          toast.error(`This is a reserve auction. Bid must be at least ₹${auctionType.reservePrice!.toLocaleString()}`);
          return;
        }
        if (amount <= currentPrice) {
          toast.error(`Bid must be higher than current bid of ₹${currentPrice.toLocaleString()}`);
          return;
        }
        break;

      case 'dutch':
        if (amount < currentPrice) {
          toast.error(`Dutch auction bid must match current price of ₹${currentPrice.toLocaleString()}`);
          return;
        }
        break;

      case 'tender':
        if (auctionType.minimumBid && amount > auctionType.minimumBid) {
          toast.error(`Tender bid cannot exceed ₹${auctionType.minimumBid.toLocaleString()}`);
          return;
        }
        if (product.highestBid && amount >= product.highestBid.amount) {
          toast.error('Tender bid must be lower than the current lowest bid');
          return;
        }
        break;

      case 'standard':
      default:
        if (amount <= currentPrice) {
          toast.error(`Bid must be higher than current bid of ₹${currentPrice.toLocaleString()}`);
          return;
        }
        break;
    }

    setLoading(true);
    try {
      const demoSession = localStorage.getItem('demo-session');
      if (demoSession) {
        toast.success('Bid placed successfully!');
        onBidPlaced();
        onClose();
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to bid');
        return;
      }

      // Prevent self-bidding
      if (product.seller_id === user?.id) {
        toast.error('You cannot bid on your own product');
        setLoading(false);
        return;
      }

      // Check if auction has ended
      if (product.end_date && new Date(product.end_date) < new Date()) {
        toast.error('This auction has ended');
        setLoading(false);
        return;
      }

      // Check wallet balance (fresh check)
      const currentBalance = await fetchWalletBalance();
      if (currentBalance < amount) {
        toast.error(
          <div className="flex flex-col gap-2">
            <span>Insufficient wallet balance!</span>
            <button 
              onClick={() => {
                onClose();
                navigate('/wallet');
              }}
              className="px-3 py-1 bg-white text-red-600 rounded text-sm font-bold"
            >
              Add Funds
            </button>
          </div>,
          { duration: 5000 }
        );
        setLoading(false);
        return;
      }

      // Concurrency Check: Fetch latest price AND status before submitting
      const { data: latestProduct } = await supabase
        .from('products')
        .select('current_price, starting_price, end_date, status')
        .eq('id', product.id)
        .single();
      
      if (latestProduct) {
        // Check if auction ended (Fresh Check)
        if (latestProduct.end_date && new Date(latestProduct.end_date) < new Date()) {
           toast.error('This auction has just ended!');
           setLoading(false);
           onClose();
           return;
        }

        const realTimePrice = latestProduct.current_price || latestProduct.starting_price || 0;
        if (amount <= realTimePrice) {
           toast.error(`Price updated! New minimum bid is ₹${(realTimePrice + (product.increment_amount || 100)).toLocaleString()}`);
           setLoading(false);
           // Optionally refresh data here
           return;
        }
      }

      // 1. Check if auction exists, if not create one (simplified logic, usually auction exists)
      // For now assume auctionId is passed or we use product.id as proxy if architecture allows
      // But based on schema, bids link to auctions.
      
      let targetAuctionId = auctionId;
      
      if (!targetAuctionId) {
          // Try to find active auction
          const { data: auction } = await supabase
            .from('auctions')
            .select('id')
            .eq('product_id', product.id)
            .in('status', ['active', 'live'])
            .single();
            
          if (auction) {
              targetAuctionId = auction.id;
          } else {
              toast.error('No active auction for this product');
              setLoading(false);
              return;
          }
      }

      // Use backend API for bidding
      const response = await fetch(`${process.env.VITE_SERVER_URL || 'http://localhost:4011'}/api/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          auctionId: product.id, // Use product.id as auctionId for now
          userId: user?.id || '',
          amount: amount
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to place bid');
      }

      const result = await response.json();

      toast.success('Bid placed successfully!');
      onBidPlaced();
      onClose();
    } catch (error: any) {
      console.error('Bid error:', error);
      toast.error(error.message || 'Failed to place bid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 500 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Mobile Handle */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Gavel className="h-5 w-5 text-indigo-600" />
            Place Bid
          </h3>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleBid} className="p-6 space-y-6">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
             <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
               <Wallet className="h-4 w-4" />
               <span>Balance:</span>
             </div>
             <div className="font-bold text-gray-900 dark:text-white">
               {balanceLoading ? '...' : `₹${walletBalance.toLocaleString()}`}
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {auctionType.type === 'tender' ? 'Current Lowest Bid' :
               auctionType.type === 'dutch' ? 'Current Dutch Price' :
               'Current Highest Bid'}
            </label>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ₹{currentPrice.toLocaleString()}
            </div>
            {/* Auction type specific info */}
            {auctionType.type === 'reserve' && auctionType.reservePrice && (
              <div className="text-xs text-purple-600 font-medium mt-1">
                Reserve Price: ₹{auctionType.reservePrice.toLocaleString()}
                {currentPrice < auctionType.reservePrice && ' (Not Met)'}
              </div>
            )}
            {auctionType.type === 'tender' && auctionType.minimumBid && (
              <div className="text-xs text-blue-600 font-medium mt-1">
                Maximum Bid Limit: ₹{auctionType.minimumBid.toLocaleString()}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="bidAmount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Your Bid Amount
              {auctionType.type === 'reserve' && ` (Min ₹${(auctionType.reservePrice! > currentPrice ? auctionType.reservePrice! : minBid).toLocaleString()})`}
              {auctionType.type === 'dutch' && ` (Must match current price: ₹${currentPrice.toLocaleString()})`}
              {auctionType.type === 'tender' && ` (Must be lower than current lowest bid)`}
              {auctionType.type === 'standard' && ` (Min ₹${minBid.toLocaleString()})`}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
              <input
                id="bidAmount"
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={
                  auctionType.type === 'dutch' ? currentPrice.toString() :
                  auctionType.type === 'tender' ? 'Enter lower amount' :
                  minBid.toString()
                }
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                min={auctionType.type === 'tender' ? 1 : minBid}
                step={auctionType.bidIncrement || 100}
                required
              />
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-xs text-indigo-700 dark:text-indigo-300">
            By placing this bid, you agree to the auction terms. This bid is <strong>legally binding</strong> and a hold may be placed on your wallet balance.
          </div>

          <button
            type="submit"
            disabled={loading}
            data-testid="confirm-bid"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={(e) => {
              e.preventDefault();
              const amount = parseFloat(bidAmount);
              
              // Show confirmation dialog
              const confirmed = window.confirm(
                `Are you sure you want to place a bid of ₹${amount.toLocaleString()}?\n\n` +
                `• Current highest bid: ₹${currentPrice.toLocaleString()}\n` +
                `• Your bid: ₹${amount.toLocaleString()}\n` +
                `• This action cannot be undone\n\n` +
                `By confirming, you agree to the auction terms and this bid is legally binding.`
              );
              
              if (confirmed) {
                handleBid(e);
              }
            }}
          >
            {loading ? 'Placing Bid...' : 'Confirm Bid'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default BidModal;
