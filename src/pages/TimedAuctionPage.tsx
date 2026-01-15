import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Timer, Clock, Gavel, Eye, Shield, Calendar, DollarSign, TrendingUp, Users, Heart, Share2, Star, MapPin, Award, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { auctionService } from '../services/auctionService';
import AuctionTypeBadge from '../components/auctions/AuctionTypeBadge';
import SellerTrustSummary from '../components/auctions/SellerTrustSummary';
import { AuctionCard } from '@/components/AuctionCard';

interface TimedAuction {
  id: string;
  productId?: string;
  title: string;
  description: string;
  current_price: number;
  starting_price: number;
  reserve_price?: number;
  end_time: string;
  status: 'active' | 'ended';
  bid_count: number;
  image_url: string;
  seller: {
    id?: string;
    name: string;
    type: 'individual' | 'company' | 'third_party';
    verified: boolean;
    rating: number;
    avatar_url: string;
    auctions_count?: number | null;
    total_sales_amount?: number | null;
  };
  category: string;
  condition: string;
  location: string;
  views: number;
  increment: number;
  auto_extend: boolean;
  extension_time: number;
  watchers: number;
}

const TimedAuctionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const goToAuctionDetail = (auctionId: string) => {
    navigate(`/timed-auction/${auctionId}`);
  };
  const [auctions, setAuctions] = useState<TimedAuction[]>([]);
  const [selectedAuction, setSelectedAuction] = useState<TimedAuction | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: string }>({});
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceRange, setPriceRange] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('ending_soon');
  const [isWatching, setIsWatching] = useState(false);
  const [bidHistory, setBidHistory] = useState([]);
  const [showBidModal, setShowBidModal] = useState(false);
  const [watchersCount, setWatchersCount] = useState(0);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  useEffect(() => {
    const loadAuctions = async () => {
      try {
        const forceMock = (typeof window !== 'undefined' && localStorage.getItem('test-mock-auctions') === 'true') || (import.meta as any)?.env?.VITE_TEST_MOCK_AUCTIONS === 'true';
        let activeAuctions: any[] = [];
        if (!forceMock) {
          try {
            const res: any = await Promise.race([
              auctionService.getActiveAuctions(50).then((r: any) => r),
              new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
            ]);
            activeAuctions = Array.isArray(res) ? res : [];
          } catch (_) {
            activeAuctions = [];
          }
        }
        if (forceMock || activeAuctions.length === 0) {
          activeAuctions = [
            {
              id: 'mock-timed-1',
              product: { id: 'p1', title: 'Mock Timed Auction', description: 'Test', image_url: 'https://images.unsplash.com/photo-1517940310602-2635cef8fd17?auto=format&fit=crop&w=800&q=80', category: 'General', condition: 'Good', location: 'India', view_count: 0 },
              current_price: 150000,
              starting_price: 100000,
              reserve_price: 120000,
              end_date: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
              status: 'active',
              bids_count: 3,
              seller: { id: 's1', name: 'Seller', is_verified: true },
              increment_amount: 5000,
              watchers: 12
            }
          ];
        }

        const mapped: TimedAuction[] = (activeAuctions || []).map((a: any) => ({
          id: a.id,
          productId: a.product?.id,
          title: a.product?.title || 'Auction',
          description: a.product?.description || '',
          current_price: a.current_price,
          starting_price: a.starting_price,
          reserve_price: a.reserve_price || undefined,
          end_time: a.end_date,
          status: a.status === 'ended' ? 'ended' : 'active',
          bid_count: a.bids_count || a.bid_count || 0,
          image_url: a.product?.image_url || '',
          seller: {
            id: a.seller?.id,
            name: a.seller?.name || 'Seller',
            type: 'individual',
            verified: !!a.seller?.is_verified,
            rating: 4.5,
            avatar_url: a.seller?.avatar_url || 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=100&q=80',
            auctions_count: (a.seller_metrics as any)?.total_auctions != null ? Number((a.seller_metrics as any).total_auctions) : null,
            total_sales_amount: (a.seller_metrics as any)?.total_sales != null ? Number((a.seller_metrics as any).total_sales) : null,
          },
          category: a.product?.category || 'General',
          condition: a.product?.condition || 'Good',
          location: a.product?.location || 'India',
          views: a.product?.view_count || 0,
          increment: a.increment_amount || 100,
          auto_extend: true,
          extension_time: 5,
          watchers: a.watchers || 0
        }));

        setAuctions(mapped);

        if (id) {
          const selected = mapped.find(a => a.id === id);
          if (selected) {
            setSelectedAuction(selected);
          }
        }
      } catch (e) {
        console.error('Error loading timed auctions', e);
        toast.error('Failed to load timed auctions');
      } finally {
        setLoading(false);
      }
    };

    loadAuctions();
  }, [id]);

  useEffect(() => {
    const loadBidHistory = async () => {
      if (!selectedAuction) return;

      try {
        const [{ data: bids, error }, { data: { user } }] = await Promise.all([
          supabase
            .from('bids')
            .select('amount, created_at, user_id')
            .eq('auction_id', selectedAuction.id)
            .order('amount', { ascending: false }),
          supabase.auth.getUser()
        ] as any);

        if (error) {
          console.error('Error loading bid history', error);
          return;
        }

        const mappedHistory = (bids || []).map((bid: any, index: number) => {
          const isCurrentUser = user && bid.user_id === user.id;
          const bidderLabel = isCurrentUser ? 'You' : `Bidder ****${String(bid.user_id || '').slice(-4)}`;
          return {
            bidder: bidderLabel,
            amount: bid.amount,
            time: new Date(bid.created_at).toLocaleString(),
            isWinning: index === 0
          };
        });

        setBidHistory(mappedHistory);
      } catch (e) {
        console.error('Error loading bid history', e);
      }
    };

    loadBidHistory();
  }, [selectedAuction]);

  // Update countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeLeft: { [key: string]: string } = {};
      
      auctions.forEach(auction => {
        const now = new Date().getTime();
        const endTime = new Date(auction.end_time).getTime();
        const distance = endTime - now;

        if (distance > 0) {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          
          if (days > 0) {
            newTimeLeft[auction.id] = `${days}d ${hours}h ${minutes}m`;
          } else if (hours > 0) {
            newTimeLeft[auction.id] = `${hours}h ${minutes}m ${seconds}s`;
          } else {
            newTimeLeft[auction.id] = `${minutes}m ${seconds}s`;
          }
        } else {
          newTimeLeft[auction.id] = 'Ended';
        }
      });
      
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [auctions]);

  const [bidError, setBidError] = useState('');
  const [placingBid, setPlacingBid] = useState(false);

  const handlePlaceBid = async () => {
    if (!selectedAuction) return;
    setBidError('');

    const amount = parseFloat(bidAmount);
    if (!amount || Number.isNaN(amount)) {
      setBidError('Enter a valid bid amount');
      return;
    }

    const minAllowed = selectedAuction.current_price + selectedAuction.increment;
    if (amount < minAllowed) {
      setBidError(`Minimum allowed bid is ₹${minAllowed.toLocaleString()}`);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setBidError('Please login to place a bid');
      return;
    }

    setPlacingBid(true);
    try {
      const result = await auctionService.placeBid({
        auctionId: selectedAuction.id,
        userId: user.id,
        amount,
      });

      if (!result.success) {
        if (result.error?.includes('wallet')) {
          setBidError('Insufficient wallet balance. Please add funds and try again.');
        } else if (result.error?.includes('security')) {
          setBidError('We could not place this bid due to security checks.');
        } else {
          setBidError(result.error || 'Failed to place bid');
        }
        return;
      }

      setSelectedAuction({
        ...selectedAuction,
        current_price: amount,
        bid_count: selectedAuction.bid_count + 1
      });

      setBidHistory(prev => [
        { bidder: 'You', amount, time: 'Just now', isWinning: true },
        ...prev.map(bid => ({ ...bid, isWinning: false }))
      ]);

      setBidAmount('');
      setShowBidModal(false);
      toast.success(`Bid of ₹${amount.toLocaleString()} placed successfully!`);
    } catch (e) {
      console.error('Error placing bid', e);
      setBidError('Something went wrong while placing your bid. Please try again.');
    } finally {
      setPlacingBid(false);
    }
  };
  useEffect(() => {
    const loadWalletBalance = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setWalletBalance(null);
          return;
        }

        const { data, error } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error loading wallet balance', error);
          return;
        }

        setWalletBalance(data?.balance ?? null);
      } catch (e) {
        console.error('Error loading wallet balance', e);
      }
    };

    loadWalletBalance();
  }, [selectedAuction]);
  useEffect(() => {
    const loadWatchlistState = async () => {
      if (!selectedAuction?.productId) return;

      try {
        const [{ data: { user } }, { data: userWishlist }, { count }] = await Promise.all([
          supabase.auth.getUser(),
          supabase
            .from('wishlist')
            .select('id')
            .eq('product_id', selectedAuction.productId)
            .limit(1),
          supabase
            .from('wishlist')
            .select('id', { count: 'exact', head: true })
            .eq('product_id', selectedAuction.productId)
        ] as any);

        if (user) {
          const { data: myRows } = await supabase
            .from('wishlist')
            .select('id')
            .eq('product_id', selectedAuction.productId)
            .eq('user_id', user.id);
          setIsWatching(!!myRows && myRows.length > 0);
        } else {
          setIsWatching(false);
        }

        setWatchersCount(count || 0);
      } catch (e) {
        console.error('Error loading watchlist state', e);
      }
    };

    loadWatchlistState();
  }, [selectedAuction]);

  const toggleWatchlist = async (productId?: string) => {
    const targetProductId = productId ?? selectedAuction?.productId;
    if (!targetProductId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please login to manage your watchlist');
      return;
    }

    try {
      const isCurrentSelected = targetProductId === selectedAuction?.productId;
      const currentlyWatching = isCurrentSelected ? isWatching : false;
      if (currentlyWatching) {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('product_id', targetProductId)
          .eq('user_id', user.id);
        if (error) throw error;
        if (isCurrentSelected) {
          setIsWatching(false);
          setWatchersCount(prev => (prev > 0 ? prev - 1 : 0));
        }
        toast.success('Removed from watchlist');
      } else {
        const { error } = await supabase
          .from('wishlist')
          .insert([{ product_id: selectedAuction.productId, user_id: user.id }]);
        if (error) throw error;
        if (isCurrentSelected) {
          setIsWatching(true);
          setWatchersCount(prev => prev + 1);
        }
        toast.success('Added to watchlist');
      }
    } catch (e) {
      console.error('Error updating watchlist', e);
      toast.error('Could not update watchlist. Please try again.');
    }
  };

  const filteredAuctions = auctions.filter(auction => {
    if (filter === 'ending_soon') {
      const endTime = new Date(auction.end_time).getTime();
      const now = new Date().getTime();
      if ((endTime - now) >= 24 * 60 * 60 * 1000) {
        return false;
      }
    }

    if (categoryFilter !== 'all') {
      if (!auction.category || !auction.category.toLowerCase().includes(categoryFilter.toLowerCase())) {
        return false;
      }
    }

    if (locationFilter) {
      if (!auction.location || !auction.location.toLowerCase().includes(locationFilter.toLowerCase())) {
        return false;
      }
    }

    if (priceRange) {
      const [minStr, maxStr] = priceRange.split('-');
      const min = Number(minStr) || 0;
      const max = maxStr ? Number(maxStr) : null;
      if (max !== null) {
        if (auction.current_price < min || auction.current_price > max) {
          return false;
        }
      } else {
        if (auction.current_price < min) {
          return false;
        }
      }
    }

    return true;
  });

  const sortedAuctions = [...filteredAuctions].sort((a, b) => {
    switch (sortBy) {
      case 'ending_soon':
        return new Date(a.end_time).getTime() - new Date(b.end_time).getTime();
      case 'price_low':
        return a.current_price - b.current_price;
      case 'price_high':
        return b.current_price - a.current_price;
      case 'most_bids':
        return b.bid_count - a.bid_count;
      case 'most_viewed':
        return b.views - a.views;
      default:
        return 0;
    }
  });

  const minBidForSelected = selectedAuction ? selectedAuction.current_price + selectedAuction.increment : 0;
  const parsedBidAmount = bidAmount ? parseFloat(bidAmount) : NaN;
  const effectiveBidAmount = !Number.isNaN(parsedBidAmount) && parsedBidAmount >= minBidForSelected
    ? parsedBidAmount
    : minBidForSelected;
  const estimatedSecurityDeposit = selectedAuction ? effectiveBidAmount * 0.1 : 0;
  const estimatedTotalRequired = effectiveBidAmount + estimatedSecurityDeposit;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {selectedAuction ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Image and Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative">
              <img
                src={selectedAuction.image_url}
                alt={selectedAuction.title}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
              <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center">
                <Timer className="h-4 w-4 mr-1" />
                TIMED AUCTION
              </div>
              <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {selectedAuction.views} views
              </div>
              <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {selectedAuction.watchers} watching
              </div>
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={() => toggleWatchlist(selectedAuction?.productId)}
                  className={`p-2 rounded-full ${isWatching ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-700'}`}
                >
                  <Heart className="h-5 w-5" />
                </button>
                <button className="p-2 bg-white/80 text-gray-700 rounded-full">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h1 className="text-3xl font-bold mb-2">{selectedAuction.title}</h1>
              {selectedAuction.seller && (
                <div className="mb-4">
                  <SellerTrustSummary
                    name={selectedAuction.seller.name}
                    avatarUrl={selectedAuction.seller.avatar_url}
                    verified={selectedAuction.seller.verified}
                    verificationLabelVerified="Trusted / KYC verified seller"
                    verificationLabelPending="Seller verification in progress"
                    rating={selectedAuction.seller.rating}
                    auctionsCount={selectedAuction.seller.auctions_count ?? undefined}
                    totalSalesAmount={selectedAuction.seller.total_sales_amount ?? undefined}
                    profileHref={selectedAuction.seller.id ? `/seller/${selectedAuction.seller.id}` : null}
                    profileLabel="View seller profile"
                    size="md"
                  />
                </div>
              )}
              <p className="text-gray-600 dark:text-gray-300 mb-2 text-lg leading-relaxed">{selectedAuction.description}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-6 max-w-xl">
                You pay the winning bid amount plus applicable taxes / delivery charges. Platform commissions are paid by the
                seller from their payout, not added on top of your price.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{selectedAuction.category}</p>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-gray-500">Condition</p>
                  <p className="font-medium">{selectedAuction.condition}</p>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium flex items-center justify-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {selectedAuction.location}
                  </p>
                </div>
              </div>

              {/* Seller Info */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedAuction.seller.avatar_url}
                      alt={selectedAuction.seller.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-lg">{selectedAuction.seller.name}</p>
                        {selectedAuction.seller.verified && (
                          <Shield className="h-5 w-5 text-green-500" />
                        )}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedAuction.seller.type === 'company' ? 'bg-blue-100 text-blue-800' :
                          selectedAuction.seller.type === 'third_party' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedAuction.seller.type === 'company' ? 'Company' : 
                           selectedAuction.seller.type === 'third_party' ? 'Third Party' : 'Individual'}
                        </span>
                      </div>
                      <div className="flex items-center mt-1">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < Math.floor(selectedAuction.seller.rating) ? 'fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 ml-2">{selectedAuction.seller.rating} rating</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={selectedAuction.seller.id ? `/seller/${selectedAuction.seller.id}` : '#'}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                  >
                    View Profile →
                  </Link>
                </div>
              </div>
            </div>

            {/* Bidding History */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Bidding History</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {bidHistory.map((bid, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      bid.isWinning ? 'bg-green-50 border border-green-200' : 'bg-gray-50 dark:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        bid.isWinning ? 'bg-green-500 text-white' : 'bg-gray-300'
                      }`}>
                        <span className="text-sm font-medium">
                          {bid.bidder === 'You' ? 'Y' : bid.bidder.slice(-1)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{bid.bidder}</p>
                        <p className="text-xs text-gray-500">{bid.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">₹{bid.amount.toLocaleString()}</p>
                      {bid.isWinning && (
                        <p className="text-xs text-green-600">Winning Bid</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Auction Features */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Auction Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  {selectedAuction.auto_extend ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium">Auto Extension</p>
                    <p className="text-sm text-gray-500">
                      {selectedAuction.auto_extend 
                        ? `Extends by ${selectedAuction.extension_time} minutes if bid placed in final minutes`
                        : 'Fixed end time - no extensions'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Verified Seller</p>
                    <p className="text-sm text-gray-500">Identity and business verified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bidding Section */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-red-600 font-medium">Auction Ends In</span>
                </div>
                <div className="text-3xl font-bold text-red-600">
                  {timeLeft[selectedAuction.id] || 'Calculating...'}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Bid</p>
                  <p className="text-3xl font-bold text-green-600">
                    ₹{selectedAuction.current_price.toLocaleString()}
                  </p>
                </div>
                
                {selectedAuction.reserve_price && (
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Reserve Price</p>
                    <p className="text-xl font-bold text-blue-600">
                      ₹{selectedAuction.reserve_price.toLocaleString()}
                    </p>
                    {selectedAuction.current_price >= selectedAuction.reserve_price && (
                      <p className="text-xs text-green-600 mt-1">Reserve Met ✓</p>
                    )}
                  </div>
                )}

                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedAuction.bid_count} bids • Min increment: ₹{selectedAuction.increment.toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowBidModal(true)}
                className="w-full bg-indigo-600 text-white py-4 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 text-lg font-semibold"
              >
                <Gavel className="h-5 w-5" />
                Place Bid
              </button>
            </div>

            {/* Auction Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Auction Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Opening Bid (minimum amount required to enter the auction):</span>
                  <span className="font-medium">₹{selectedAuction.starting_price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Increase:</span>
                  <span className="font-medium text-green-600">
                    +{(((selectedAuction.current_price - selectedAuction.starting_price) / selectedAuction.starting_price) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Bids:</span>
                  <span className="font-medium">{selectedAuction.bid_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Watchers:</span>
                  <span className="font-medium">{watchersCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Views:</span>
                  <span className="font-medium">{selectedAuction.views}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ends:</span>
                  <span className="font-medium">{new Date(selectedAuction.end_time).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => toggleWatchlist(selectedAuction?.productId)}
                  className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                    isWatching ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <Heart className="h-5 w-5" />
                  {isWatching ? 'Remove from Watchlist' : 'Add to Watchlist'}
                </button>
                <button className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium flex items-center justify-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Share Auction
                </button>
                <Link
                  to={selectedAuction.seller.id ? `/seller/${selectedAuction.seller.id}` : '#'}
                  className="w-full py-3 bg-indigo-100 text-indigo-700 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Users className="h-5 w-5" />
                  View Seller Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Bid Modal */}
          {showBidModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Place Your Bid</h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Current Bid: ₹{selectedAuction.current_price.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Minimum Bid: ₹{(selectedAuction.current_price + selectedAuction.increment).toLocaleString()}
                    </p>
                    {walletBalance !== null && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Wallet balance: ₹{walletBalance.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Bid Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Minimum: ₹${(selectedAuction.current_price + selectedAuction.increment).toLocaleString()}`}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[selectedAuction.increment, selectedAuction.increment * 2].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setBidAmount((selectedAuction.current_price + amount).toString())}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                      >
                        +₹{amount.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-1">
                      <strong>Note:</strong> A security deposit of 10% will be held from your wallet.
                    </p>
                    {selectedAuction && !Number.isNaN(effectiveBidAmount) && (
                      <div className="mt-1 text-xs text-yellow-900 dark:text-yellow-100 space-y-0.5">
                        <p>
                          Estimated deposit (10% of ₹{effectiveBidAmount.toLocaleString()}):{' '}
                          <span className="font-semibold">₹{estimatedSecurityDeposit.toLocaleString()}</span>
                        </p>
                        {walletBalance !== null && (
                          <p>
                            Total required in wallet (bid + deposit):{' '}
                            <span className="font-semibold">₹{estimatedTotalRequired.toLocaleString()}</span>
                            {walletBalance < estimatedTotalRequired && (
                              <span className="ml-1 text-[11px] text-red-700">
                                (You may need to add funds.)
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {bidError && (
                    <p className="text-sm text-red-600 mt-2">
                      {bidError}
                      {bidError.toLowerCase().includes('wallet') && (
                        <Link to="/wallet" className="ml-1 underline text-red-700">
                          Add funds
                        </Link>
                      )}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={() => setShowBidModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePlaceBid}
                    disabled={placingBid}
                    className={`bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 ${placingBid ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {placingBid ? 'Placing…' : 'Place Bid'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Timed Auctions</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
                Bid at your own pace with extended auction periods
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
              >
                <option value="all">All Auctions</option>
                <option value="ending_soon">Ending Soon (24h)</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
              >
                <option value="all">All Categories</option>
                <option value="art">Art & Paintings</option>
                <option value="antiques">Antiques</option>
                <option value="vehicles">Vehicles</option>
                <option value="handmade">Handmade</option>
                <option value="industrial">Industrial</option>
                <option value="electronics">Electronics</option>
              </select>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
              >
                <option value="">All Prices</option>
                <option value="0-100000">Under ₹1,00,000</option>
                <option value="100000-500000">₹1,00,000 - ₹5,00,000</option>
                <option value="500000-1000000">₹5,00,000 - ₹10,00,000</option>
                <option value="1000000">Above ₹10,00,000</option>
              </select>
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="Location"
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm md:text-base w-full md:w-40 lg:w-48"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
              >
                <option value="ending_soon">Ending Soon</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="most_bids">Most Bids</option>
                <option value="most_viewed">Most Viewed</option>
              </select>
              <Link
                to="/advanced-search"
                className="border border-indigo-300 text-indigo-700 px-3 md:px-4 py-2 rounded-lg hover:bg-indigo-50 flex items-center gap-2 text-xs md:text-sm"
              >
                <Search className="h-4 w-4" />
                Advanced Search
              </Link>
            </div>
          </div>

          {/* Featured Auctions Banner */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-8 mb-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Featured Timed Auctions</h2>
              <p className="text-xl mb-6">Discover rare and valuable items with extended bidding periods</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold">{auctions.length}</div>
                  <div className="text-sm">Active Auctions</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold">₹{(auctions.reduce((sum, a) => sum + a.current_price, 0) / 100000).toFixed(1)}L</div>
                  <div className="text-sm">Total Value</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold">{auctions.reduce((sum, a) => sum + a.bid_count, 0)}</div>
                  <div className="text-sm">Total Bids</div>
                </div>
              </div>
            </div>
          </div>

          {sortedAuctions.length === 0 ? (
            <div className="text-center py-12">
              <Timer className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No timed auctions available
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Check back later or browse all products currently on the platform.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-sm text-indigo-700 hover:text-indigo-900"
              >
                <Eye className="h-4 w-4" />
                No timed auctions? Browse all products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedAuctions.map((auction) => (
                <motion.div
                  key={auction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="transition-all duration-300"
                >
                  <AuctionCard
                    id={auction.id}
                    image={auction.image_url}
                    title={auction.title}
                    price={auction.starting_price}
                    currentBid={auction.current_price}
                    views={auction.views}
                    watchers={auction.watchers}
                    location={auction.location}
                    condition={auction.condition}
                    sellerName={auction.seller.name}
                    timeRemaining={timeLeft[auction.id] || 'Calculating...'}
                    isTimed={true}
                    variant="timed"
                    watched={false}
                    onWatchToggle={() => toggleWatchlist(auction.productId)}
                    onPrimaryAction={() => goToAuctionDetail(auction.id)}
                    onClick={() => goToAuctionDetail(auction.id)}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* Auction Tips */}
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center mb-8">Timed Auction Advantages</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-xl mb-4 inline-block">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Extended Bidding Time</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Multiple days to research, plan your strategy, and place thoughtful bids
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-xl mb-4 inline-block">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Better Price Discovery</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Extended time allows for more accurate market pricing and fair value discovery
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-xl mb-4 inline-block">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Flexible Participation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Bid when convenient without pressure of real-time competition
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimedAuctionPage;
