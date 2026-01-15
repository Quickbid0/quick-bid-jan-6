import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { 
  Clock, 
  Trophy, 
  TrendingDown, 
  Eye, 
  Calendar,
  DollarSign,
  Package,
  Filter,
  Download,
  Star,
  Shield,
  MapPin,
  Award,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

interface BidHistory {
  id: string;
  product: {
    id: string;
    title: string;
    image_url: string;
    category: string;
    seller_name: string;
    seller_verified: boolean;
  };
  bid_amount: number;
  status: 'active' | 'won' | 'lost' | 'outbid';
  placed_at: string;
  auction_end_time: string;
  final_price?: number;
  position: number;
  total_bids: number;
  auction_type: 'live' | 'timed' | 'tender';
  refund_amount?: number;
  commission_paid?: number;
}

const BiddingHistory = () => {
  const [bids, setBids] = useState<BidHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'won' | 'lost' | 'outbid'>('all');
  const [dateRange, setDateRange] = useState('30d');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { userProfile } = useSession();

  useEffect(() => {
    fetchBids();
  }, [userProfile]);

  const fetchBids = async () => {
    if (!userProfile?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bids')
        .select(`
          id,
          amount,
          status,
          created_at,
          auction:auction_id (
            id,
            status,
            end_date,
            type,
            product:product_id (
              id,
              title,
              image_url,
              category,
              seller:seller_id (
                name,
                verified
              )
            )
          )
        `)
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match UI interface
      const uniqueAuctionIds = [...new Set(data?.map((b: any) => b.auction_id))];
      
      // Fetch all relevant bids for stats calculation in one go to avoid N+1
      const { data: allAuctionBids, error: statsError } = await supabase
        .from('bids')
        .select('auction_id, amount')
        .in('auction_id', uniqueAuctionIds);

      if (statsError) console.error('Error fetching bid stats:', statsError);

      const bidsByAuction = (allAuctionBids || []).reduce((acc: any, curr: any) => {
        if (!acc[curr.auction_id]) acc[curr.auction_id] = [];
        acc[curr.auction_id].push(curr.amount);
        return acc;
      }, {});

      const transformedBids: BidHistory[] = data?.map((bid: any) => {
        const auctionBids = bidsByAuction[bid.auction_id] || [];
        const totalBids = auctionBids.length;
        // Position: count of bids higher than mine + 1
        const betterBidsCount = auctionBids.filter((amount: number) => amount > bid.amount).length;
        const position = betterBidsCount + 1;
        
        // Determine status dynamically if active
        let status = bid.status || 'active';
        const isEnded = bid.auction?.end_date && new Date(bid.auction.end_date) < new Date();

        if (status === 'active') {
           if (position > 1) {
               status = 'outbid';
           } else if (isEnded) {
               status = 'calculating';
           }
        }

        return {
          id: bid.id,
          product: {
            id: bid.auction?.product?.id,
            title: bid.auction?.product?.title || 'Unknown Product',
            image_url: bid.auction?.product?.image_url,
            category: bid.auction?.product?.category,
            seller_name: bid.auction?.product?.seller?.name || 'Unknown Seller',
            seller_verified: bid.auction?.product?.seller?.verified || false
          },
          bid_amount: bid.amount,
          status: status,
          placed_at: bid.created_at,
          auction_end_time: bid.auction?.end_date,
          auction_type: bid.auction?.type || 'live',
          position: position,
          total_bids: totalBids
        };
      }) || [];

      setBids(transformedBids);
    } catch (error) {
      console.error('Error fetching bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'won':
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'active':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'lost':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      case 'outbid':
        return <TrendingDown className="h-5 w-5 text-orange-500" />;
      case 'calculating':
        return <Clock className="h-5 w-5 text-indigo-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'lost':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'outbid':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'calculating':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredBids = bids.filter(bid => {
    if (filter !== 'all' && bid.status !== filter) return false;
    if (categoryFilter !== 'all' && !bid.product.category.toLowerCase().includes(categoryFilter.toLowerCase())) return false;
    return true;
  });

  const stats = {
    totalBids: bids.length,
    activeBids: bids.filter(b => b.status === 'active').length,
    wonAuctions: bids.filter(b => b.status === 'won').length,
    totalSpent: bids.filter(b => b.status === 'won').reduce((sum, b) => sum + (b.final_price || 0), 0),
    totalRefunds: bids.filter(b => b.refund_amount).reduce((sum, b) => sum + (b.refund_amount || 0), 0),
    successRate: bids.length > 0 ? (bids.filter(b => b.status === 'won').length / bids.length * 100) : 0
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Bidding History</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">Track your auction participation and results</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 3 Months</option>
            <option value="1y">Last Year</option>
          </select>
          
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-sm text-center">
          <Package className="h-6 w-6 md:h-8 md:w-8 text-blue-500 mx-auto mb-2" />
          <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate" title={stats.totalBids.toString()}>{stats.totalBids}</p>
          <p className="text-xs md:text-sm text-gray-500">Total Bids</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-sm text-center">
          <Clock className="h-6 w-6 md:h-8 md:w-8 text-orange-500 mx-auto mb-2" />
          <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate" title={stats.activeBids.toString()}>{stats.activeBids}</p>
          <p className="text-xs md:text-sm text-gray-500">Active Bids</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-sm text-center">
          <Trophy className="h-6 w-6 md:h-8 md:w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate" title={stats.wonAuctions.toString()}>{stats.wonAuctions}</p>
          <p className="text-xs md:text-sm text-gray-500">Won Auctions</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-sm text-center">
          <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-green-500 mx-auto mb-2" />
          <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate" title={`₹${(stats.totalSpent / 100000).toFixed(1)}L`}>₹{(stats.totalSpent / 100000).toFixed(1)}L</p>
          <p className="text-xs md:text-sm text-gray-500">Total Spent</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-sm text-center">
          <Star className="h-6 w-6 md:h-8 md:w-8 text-purple-500 mx-auto mb-2" />
          <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate" title={`${stats.successRate.toFixed(1)}%`}>{stats.successRate.toFixed(1)}%</p>
          <p className="text-xs md:text-sm text-gray-500">Success Rate</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-sm text-center">
          <TrendingDown className="h-6 w-6 md:h-8 md:w-8 text-red-500 mx-auto mb-2" />
          <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate" title={`₹${(stats.totalRefunds / 1000).toFixed(0)}K`}>₹{(stats.totalRefunds / 1000).toFixed(0)}K</p>
          <p className="text-xs md:text-sm text-gray-500">Refunds</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { id: 'all', label: 'All Bids', count: bids.length },
          { id: 'active', label: 'Active', count: stats.activeBids },
          { id: 'won', label: 'Won', count: stats.wonAuctions },
          { id: 'lost', label: 'Lost', count: bids.filter(b => b.status === 'lost').length },
          { id: 'outbid', label: 'Outbid', count: bids.filter(b => b.status === 'outbid').length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
              filter === tab.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bidding History List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredBids.map((bid) => (
            <motion.div
              key={bid.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:items-center">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <img
                    src={bid.product.image_url}
                    alt={bid.product.title}
                    className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg shadow-md flex-shrink-0"
                  />
                  
                  <div className="md:hidden flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                      {bid.product.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border flex items-center gap-1 w-fit ${getStatusColor(bid.status)}`}>
                        {bid.status.toUpperCase()}
                      </span>
                      <p className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {bid.product.seller_name}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 w-full">
                  <div className="hidden md:flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {bid.product.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(bid.status)}`}>
                      {getStatusIcon(bid.status)}
                      {bid.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="hidden md:flex mb-2 text-[11px] text-gray-500 dark:text-gray-400 items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {bid.product.seller_verified
                      ? `${bid.product.seller_name} · Seller verification complete`
                      : `${bid.product.seller_name} · Seller verification pending`}
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Your Bid:</span>
                      <p className="font-bold text-gray-900 dark:text-white">₹{bid.bid_amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Position:</span>
                      <p className="font-bold">{bid.position} of {bid.total_bids}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Placed:</span>
                      <p className="font-medium">{new Date(bid.placed_at).toLocaleDateString()}</p>
                    </div>
                    {bid.final_price && (
                      <div>
                        <span className="text-gray-500">Final Price:</span>
                        <p className="font-bold text-green-600">₹{bid.final_price.toLocaleString()}</p>
                      </div>
                    )}
                    {bid.commission_paid && (
                      <div>
                        <span className="text-gray-500">Commission:</span>
                        <p className="font-medium text-blue-600">₹{bid.commission_paid.toLocaleString()}</p>
                      </div>
                    )}
                    {bid.refund_amount && (
                      <div>
                        <span className="text-gray-500">Refund:</span>
                        <p className="font-medium text-green-600">₹{bid.refund_amount.toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Items for Different Statuses */}
                  {bid.status === 'won' && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-800 dark:text-green-200 flex items-center gap-1">
                          <Trophy className="h-4 w-4" />
                          Congratulations! You won this auction.
                        </span>
                        <div className="flex gap-2">
                          <Link
                            to={`/order-tracking/${bid.id}`}
                            className="text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700"
                          >
                            Track Order
                          </Link>
                          <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700">
                            Leave Review
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {bid.status === 'outbid' && (
                    <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-orange-800 dark:text-orange-200 flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          You've been outbid. Current auction is still active.
                        </span>
                        <Link
                          to={`/product/${bid.product.id}`}
                          className="text-xs bg-orange-600 text-white px-3 py-1 rounded-full hover:bg-orange-700"
                        >
                          Place New Bid
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <Link
                    to={`/product/${bid.product.id}`}
                    className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Link>
                  <p className="text-xs text-gray-500 mt-1">
                    Ends: {new Date(bid.auction_end_time).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bidding Insights */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Your Bidding Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Most Active Category</h3>
            <p className="text-blue-600 dark:text-blue-300">
              Jewelry & Watches
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">Average Bid Amount</h3>
            <p className="text-green-600 dark:text-green-300">
              ₹{(bids.reduce((sum, bid) => sum + bid.bid_amount, 0) / bids.length).toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h3 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Preferred Auction Type</h3>
            <p className="text-purple-600 dark:text-purple-300">
              {bids.filter(b => b.auction_type === 'live').length > bids.filter(b => b.auction_type === 'timed').length ? 'Live Auctions' : 'Timed Auctions'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiddingHistory;