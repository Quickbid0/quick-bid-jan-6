import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Star,
  Clock,
  Gavel,
  Users,
  Shield,
  Truck,
  Camera,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus
} from 'lucide-react';

interface Product {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  current_price: number;
  starting_bid: number;
  bid_count: number;
  end_date: string;
  category: string;
  status: string;
  location?: string;
  seller_name?: string;
  seller_rating?: number;
  seller_id?: string;
  condition?: string;
  shipping?: string;
  returns?: string;
  images?: string[];
}

interface Bid {
  id: string;
  amount: number;
  bidder_name: string;
  timestamp: string;
}

export default function ProductDetailFixed() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  // Sample product data
  const sampleProduct: Product = {
    id: id || '1',
    title: 'iPhone 14 Pro Max - Excellent Condition',
    description: 'Like new iPhone 14 Pro Max, 256GB, Deep Purple. Includes original box, charger, and warranty. The phone is in excellent condition with no scratches or dents. Battery health is at 95%. All features work perfectly including the camera, Face ID, and all buttons. This phone was purchased in January 2023 and has been used with a screen protector and case since day one.',
    image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80',
    current_price: 65000,
    starting_bid: 45000,
    bid_count: 23,
    end_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    category: 'Electronics',
    status: 'active',
    location: 'Mumbai',
    seller_name: 'TechStore',
    seller_rating: 4.8,
    seller_id: 'seller1',
    condition: 'Excellent',
    shipping: 'Free shipping',
    returns: '7 days return policy',
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1595913449153-aae8cf10c32a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80'
    ]
  };

  const sampleBids: Bid[] = [
    { id: '1', amount: 65000, bidder_name: 'John D.', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
    { id: '2', amount: 62000, bidder_name: 'Sarah M.', timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString() },
    { id: '3', amount: 60000, bidder_name: 'Mike R.', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
    { id: '4', amount: 58000, bidder_name: 'Emma L.', timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
    { id: '5', amount: 55000, bidder_name: 'David K.', timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString() }
  ];

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        setBids(data.bids || []);
        setBidAmount((data.currentBid || data.current_price || data.current_bid + 1000).toString());
      } else {
        throw new Error('Failed to fetch product');
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      setError('Failed to load product');
      toast.error('Failed to load product');
      
      // Fallback to sample data
      setProduct(sampleProduct);
      setBids(sampleBids);
      setBidAmount((sampleProduct.current_price + 1000).toString());
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatTimeLeft = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff < 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  const handleBid = async () => {
    if (!bidAmount || Number(bidAmount) <= (product?.current_price || 0)) {
      toast.error('Bid must be higher than current price');
      return;
    }

    setIsPlacingBid(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ amount: Number(bidAmount) })
      });

      if (response.ok) {
        const newBid = await response.json();
        setBids(prev => [newBid, ...prev]);
        setProduct(prev => prev ? { 
          ...prev, 
          currentBid: Number(bidAmount), 
          current_price: Number(bidAmount),
          bid_count: (prev.bid_count || 0) + 1 
        } : null);
        
        toast.success('Bid placed successfully!');
        setBidAmount((Number(bidAmount) + 1000).toString());
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to place bid');
      }
    } catch (error) {
      console.error('Bid error:', error);
      toast.error('Failed to place bid');
    } finally {
      setIsPlacingBid(false);
    }
  };

  const toggleWatchlist = () => {
    setIsWatchlisted(!isWatchlisted);
    toast.success(isWatchlisted ? 'Removed from watchlist' : 'Added to watchlist');
  };

  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.title,
        text: product?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const nextImage = () => {
    if (product?.images && product.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images && product.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-600 mb-4">{error || 'Product not found'}</div>
        <button
          onClick={() => navigate('/buyer/auctions')}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Auctions
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Product Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
            <img
              src={product.images?.[currentImageIndex] || product.image_url}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            
            {/* Image Navigation */}
            {product.images && product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    currentImageIndex === index ? 'border-indigo-600' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title and Actions */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                  {product.category}
                </span>
                <h1 className="text-2xl font-bold text-gray-900 mt-2">{product.title}</h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleWatchlist}
                  className={`p-2 rounded-lg transition-colors ${
                    isWatchlisted ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWatchlisted ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={shareProduct}
                  className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Price and Bidding */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Bid</p>
                <p className="text-3xl font-bold text-gray-900">{formatPrice(product.current_price)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Ends in</p>
                <p className="text-lg font-medium text-orange-600">{formatTimeLeft(product.end_date)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Starting Bid: {formatPrice(product.starting_bid)}</span>
              <span>{product.bid_count} bids</span>
            </div>

            {/* Bid Input */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBidAmount(Math.max(0, Number(bidAmount) - 1000).toString())}
                  className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-center font-semibold"
                  min={product.current_price + 1}
                />
                <button
                  onClick={() => setBidAmount((Number(bidAmount) + 1000).toString())}
                  className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleBid}
                disabled={isPlacingBid || !bidAmount || Number(bidAmount) <= product.current_price}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPlacingBid ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Placing Bid...
                  </>
                ) : (
                  <>
                    <Gavel className="w-5 h-5" />
                    Place Bid
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Seller Info */}
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Seller</p>
                <p className="font-semibold text-gray-900">{product.seller_name}</p>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span>{product.seller_rating} rating</span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/profile/${product.seller_id}`)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View Profile
              </button>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Product Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{product.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Condition:</span>
                <span className="font-medium">{product.condition}</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Shipping:</span>
                <span className="font-medium">{product.shipping}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Returns:</span>
                <span className="font-medium">{product.returns}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>

      {/* Bid History */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Bid History</h3>
        <div className="space-y-3">
          {bids.map((bid, index) => (
            <div key={bid.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{bid.bidder_name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(bid.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="font-semibold text-gray-900">{formatPrice(bid.amount)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
