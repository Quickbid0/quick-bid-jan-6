import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  TrendingUp, 
  Shield, 
  Truck,
  Calendar,
  Tag,
  Gavel,
  Eye,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Auction {
  id: string;
  title: string;
  description: string;
  starting_bid: number;
  current_bid?: number;
  end_date: string;
  status: string;
  auction_type: 'live' | 'timed' | 'tender';
  images?: string[];
  seller?: {
    name: string;
    rating: number;
    verified: boolean;
  };
  location?: string;
  category?: string;
  condition?: string;
}

const AuctionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);
  const [bidAmount, setBidAmount] = useState('');

  useEffect(() => {
    if (!id) {
      toast.error('Auction ID is required');
      navigate('/auctions');
      return;
    }

    fetchAuction();
  }, [id, navigate]);

  const fetchAuction = async () => {
    try {
      setLoading(true);
      
      const { data: auction, error } = await supabase
        .from('auctions')
        .select(`
          *,
          seller:sellers(name, rating, verified),
          images:auction_images(url)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (!auction) {
        toast.error('Auction not found');
        navigate('/auctions');
        return;
      }

      setAuction(auction);
    } catch (error) {
      console.error('Error fetching auction:', error);
      toast.error('Failed to load auction details');
      navigate('/auctions');
    } finally {
      setLoading(false);
    }
  };

  const handleBid = async () => {
    if (!bidAmount || parseFloat(bidAmount) <= (auction?.current_bid || auction?.starting_bid || 0)) {
      toast.error('Bid amount must be higher than current bid');
      return;
    }

    setBidding(true);
    
    try {
      // Mock bid placement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update current bid
      setAuction(prev => prev ? {
        ...prev,
        current_bid: parseFloat(bidAmount)
      } : null);
      
      toast.success('Bid placed successfully!');
      setBidAmount('');
    } catch (error) {
      console.error('Error placing bid:', error);
      toast.error('Failed to place bid. Please try again.');
    } finally {
      setBidding(false);
    }
  };

  const getAuctionTypeRoute = (type: string) => {
    switch (type) {
      case 'live':
        return `/live-auction/${id}`;
      case 'timed':
        return `/timed-auction/${id}`;
      case 'tender':
        return `/tender-auction/${id}`;
      default:
        return `/live-auction/${id}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Auction Not Found</h2>
          <button
            onClick={() => navigate('/auctions')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Auctions
          </button>
        </div>
      </div>
    );
  }

  const timeLeft = new Date(auction.end_date).getTime() - new Date().getTime();
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const daysLeft = Math.floor(hoursLeft / 24);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/auctions')}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{auction.title}</h1>
                <p className="text-sm text-gray-600">Auction ID: {auction.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                auction.status === 'active' 
                  ? 'bg-green-100 text-green-800'
                  : auction.status === 'ended'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                {auction.images && auction.images.length > 0 ? (
                  <img
                    src={auction.images[0]}
                    alt={auction.title}
                    className="w-full h-96 object-cover"
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <Eye className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No images available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">
                {auction.description || 'No description available for this auction.'}
              </p>
            </div>

            {/* Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Auction Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Tag className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium text-gray-900">{auction.category || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">{auction.location || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Condition</p>
                    <p className="font-medium text-gray-900">{auction.condition || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Gavel className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Auction Type</p>
                    <p className="font-medium text-gray-900 capitalize">{auction.auction_type}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Bidding Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Place Your Bid</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Current Bid</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{auction.current_bid || auction.starting_bid?.toLocaleString() || '0'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Starting Bid</p>
                  <p className="text-lg font-medium text-gray-900">
                    ₹{auction.starting_bid?.toLocaleString() || '0'}
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {daysLeft > 0 ? `${daysLeft} days left` : `${hoursLeft} hours left`}
                  </span>
                </div>

                {auction.status === 'active' && (
                  <div className="space-y-3">
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Enter bid amount (min: ₹${(auction.current_bid || auction.starting_bid || 0) + 1})`}
                      min={(auction.current_bid || auction.starting_bid || 0) + 1}
                    />
                    <button
                      onClick={handleBid}
                      disabled={!bidAmount || bidding}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {bidding ? 'Placing Bid...' : 'Place Bid'}
                    </button>
                  </div>
                )}

                <button
                  onClick={() => navigate(getAuctionTypeRoute(auction.auction_type))}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  View Full Auction Page
                </button>
              </div>
            </div>

            {/* Seller Info */}
            {auction.seller && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Seller Information</h2>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{auction.seller.name}</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-600 ml-1">{auction.seller.rating || 'N/A'}</span>
                      </div>
                      {auction.seller.verified && (
                        <Shield className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span>Watch this auction</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Add to calendar</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetailPage;
