import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { Eye, Shield, Star, Clock, Heart, Gavel, MapPin, Trophy, CheckCircle, ArrowLeft, Share2, ChevronRight, Zap, Users, AlertCircle, Tag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../config/supabaseClient';
import { useCountdown } from '../hooks/useCountdown';
import BidModal from '../components/BidModal';
import PageFrame from '../components/layout/PageFrame';

interface AuctionType {
  type: 'standard' | 'reserve' | 'dutch' | 'tender';
  reservePrice?: number;
  startingPrice: number;
  minimumBid?: number;
  buyNowPrice?: number;
  bidIncrement: number;
  duration: number;
  dutchDecrement?: number;
  dutchInterval?: number;
}

interface Product {
  id: string;
  title: string;
  description: string;
  image_url: string;
  current_price: number;
  starting_price: number;
  category: string;
  location: string;
  end_date: string;
  auction_status?: 'live' | 'upcoming' | 'sold' | 'expired';
  seller: { name: string; verified: boolean; rating: number; avatar_url: string; };
  bid_count: number;
  watchers: number;
  is_trending: boolean;
  is_certified?: boolean;
  condition: string;
  auction_type: 'live' | 'timed' | 'tender' | 'reserve' | 'dutch';
  auctionType?: AuctionType;
  images?: string[];
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useSession();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showBidModal, setShowBidModal] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [bidAmount, setBidAmount] = useState('');

  const timeLeft = useCountdown(product?.end_date);

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadProduct(); }, [loadProduct]);

  if (loading) {
    return (
      <PageFrame title="Loading" description="Loading product...">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </PageFrame>
    );
  }

  if (!product) {
    return (
      <PageFrame title="Product unavailable" description="Product not found">
        <div className="text-center py-16">
          <Trophy className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Product Unavailable</h3>
          <button onClick={() => navigate('/catalog')} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Browse Other Auctions
          </button>
        </div>
      </PageFrame>
    );
  }

  const allImages = [product.image_url, ...(product.images || [])];
  const currentImage = allImages[selectedImageIndex];

  return (
    <PageFrame title={product.title} description={`${product.category} • ${product.location}`}>
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 py-6">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <Link to="/catalog" className="hover:text-indigo-600 transition-colors">Catalog</Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white font-medium">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-8">
          {/* Left: Enhanced Image Gallery */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="relative aspect-[4/3] overflow-hidden group">
                <img 
                  src={currentImage} 
                  alt={product.title} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Enhanced Status Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {product.is_certified && (
                      <div className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                        <Shield className="h-3 w-3" /> Certified
                      </div>
                    )}
                    {product.is_trending && (
                      <div className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                        <Zap className="h-3 w-3" /> Trending
                      </div>
                    )}
                    {/* Auction Type Badge */}
                    <div className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${
                      product.auctionType?.type === 'reserve' ? 'bg-purple-500 text-white' :
                      product.auctionType?.type === 'dutch' ? 'bg-orange-500 text-white' :
                      product.auctionType?.type === 'tender' ? 'bg-blue-500 text-white' :
                      'bg-indigo-600 text-white'
                    }`}>
                      {product.auctionType?.type === 'reserve' && '🏆 Reserve Auction'}
                      {product.auctionType?.type === 'dutch' && '📉 Dutch Auction'}
                      {product.auctionType?.type === 'tender' && '📋 Tender Auction'}
                      {(!product.auctionType || product.auctionType?.type === 'standard') && '⚡ Standard Auction'}
                    </div>
                    <div className="bg-indigo-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                      {product.category}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-colors">
                      <Heart className="h-4 w-4 text-gray-700" />
                    </button>
                    <button className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-colors">
                      <Share2 className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>
                </div>
                
                {/* Enhanced Live Badge */}
                {product.auction_status === 'live' && (
                  <div className="absolute bottom-4 left-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-2xl shadow-2xl">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Zap className="h-5 w-5 text-white" />
                        <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-30"></div>
                      </div>
                      <div>
                        <span className="text-sm font-bold uppercase tracking-wider">LIVE NOW</span>
                        <p className="text-xs text-red-100">
                          {timeLeft.hours > 0 ? `${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s` : 'Ending Soon'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Thumbnail Gallery */}
              {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto p-6 bg-gray-50 dark:bg-gray-900">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 h-20 w-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index 
                          ? 'border-indigo-500 ring-2 ring-indigo-500 shadow-lg' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information Tabs */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8">
                  <button className="py-4 px-1 border-b-2 border-indigo-500 text-indigo-600 font-medium">
                    Description
                  </button>
                  <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium">
                    Specifications
                  </button>
                  <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium">
                    Seller Info
                  </button>
                </nav>
              </div>
              <div className="py-6">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Enhanced Key Info & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Price & Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-3">
                    {product.title}
                  </h1>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-semibold">
                      {product.category}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-semibold">
                      {product.condition}
                    </span>
                  </div>
                </div>
              </div>

              {/* Enhanced Price Display */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      {product.auctionType?.type === 'tender' ? 'Current Lowest Bid' :
                       product.auctionType?.type === 'dutch' ? 'Current Dutch Price' :
                       'Current Bid'}
                    </h3>
                    <p className="text-3xl font-bold text-green-600">₹{product.current_price.toLocaleString()}</p>
                    {product.starting_price && product.starting_price < product.current_price && (
                      <p className="text-sm text-gray-500 line-through">₹{product.starting_price.toLocaleString()}</p>
                    )}
                    {/* Auction specific info */}
                    {product.auctionType?.type === 'reserve' && product.auctionType.reservePrice && (
                      <p className="text-xs text-purple-600 font-medium mt-1">
                        Reserve Price: ₹{product.auctionType.reservePrice.toLocaleString()}
                        {product.current_price < product.auctionType.reservePrice && ' (Not Met)'}
                      </p>
                    )}
                    {product.auctionType?.type === 'tender' && product.auctionType.minimumBid && (
                      <p className="text-xs text-blue-600 font-medium mt-1">
                        Maximum Bid: ₹{product.auctionType.minimumBid.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-1">{product.bid_count} bids</div>
                    <div className="text-sm text-gray-500">{product.watchers} watching</div>
                  </div>
                </div>

                {/* Auction Rules Display */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">Auction Rules</h4>
                  <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                    {product.auctionType?.type === 'reserve' && (
                      <>
                        <li>• Reserve auction: Item will not sell below ₹{product.auctionType.reservePrice?.toLocaleString()}</li>
                        <li>• Bid increment: ₹{product.auctionType.bidIncrement.toLocaleString()}</li>
                      </>
                    )}
                    {product.auctionType?.type === 'dutch' && (
                      <>
                        <li>• Dutch auction: Price decreases over time</li>
                        <li>• Current price updates every {Math.floor((product.auctionType.dutchInterval || 300000) / 60000)} minutes</li>
                        <li>• First bidder at current price wins</li>
                      </>
                    )}
                    {product.auctionType?.type === 'tender' && (
                      <>
                        <li>• Tender auction: Lowest bid wins</li>
                        <li>• Maximum bid limit: ₹{product.auctionType.minimumBid?.toLocaleString()}</li>
                        <li>• Bid increment: ₹{product.auctionType.bidIncrement.toLocaleString()}</li>
                      </>
                    )}
                    {(!product.auctionType || product.auctionType?.type === 'standard') && (
                      <>
                        <li>• Standard auction: Highest bid wins</li>
                        <li>• Bid increment: ₹1,000</li>
                      </>
                    )}
                  </ul>
                </div>
                
                {product.auction_status === 'live' && (
                  <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl">
                    <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-lg font-semibold text-orange-600">
                      {timeLeft.hours > 0 ? `${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s` : 'Ending Soon'}
                    </p>
                  </div>
                )}
              </div>

              {/* Enhanced Bid Actions */}
              {product.auction_status === 'live' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="Enter bid amount"
                      className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button 
                      onClick={() => setShowBidModal(true)}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg font-semibold"
                    >
                      <Gavel className="h-4 w-4 mr-2" />
                      Place Bid
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Seller Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Seller Information</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">{product.seller.name}</p>
                  {product.seller.verified && (
                    <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full text-xs font-semibold text-green-700">
                      <CheckCircle className="h-3 w-3" />
                      Verified Seller
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {product.location}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {product.bid_count} bids placed
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  {product.watchers} people watching
                </div>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="space-y-3">
              <button 
                onClick={() => setShowBidModal(true)}
                className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg font-semibold text-lg"
              >
                <Gavel className="h-5 w-5 mr-2" />
                {product.auction_status === 'live' ? 'Place Bid' : 'Join Auction'}
              </button>
              
              <Link
                to="/catalog"
                className="w-full px-6 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center font-semibold"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Catalog
              </Link>
            </div>
          </div>
        </div>

        {showBidModal && (
          <BidModal
            product={product}
            onClose={() => setShowBidModal(false)}
            onBidPlaced={() => {
              setShowBidModal(false);
              toast.success('Bid placed successfully!');
            }}
          />
        )}
      </div>
    </PageFrame>
  );
};

export default ProductDetail;
