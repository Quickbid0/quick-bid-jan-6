import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../config/supabaseClient';
import {
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Gavel,
  Users,
  MapPin,
  Shield,
  Award,
  Truck,
  CheckCircle,
  Camera,
  Star,
  Sparkles,
  TrendingUp,
  Zap,
  ThumbsUp,
  ArrowLeft,
  Plus,
  Minus,
  AlertCircle
} from 'lucide-react';
// import { designTokens } from '../design-system/tokens';

// =============================================================================
// ELITE PRODUCT LISTING PAGE - Series B Ready
// Large Gallery + Sticky CTA + AI Insights + Verified Trust
// =============================================================================

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
  grade?: string;
  inspection_report?: string;
  documents?: string[];
  ai_insights?: {
    market_value: number;
    confidence: number;
    trend: 'up' | 'down' | 'stable';
    similar_sales: Array<{price: number, date: string}>;
  };
}

interface Bid {
  id: string;
  amount: number;
  bidder_name: string;
  timestamp: string;
  is_ai?: boolean;
}

export default function EliteProductListing() {
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
  const [walletBalance, setWalletBalance] = useState(50000);
  const [activeTab, setActiveTab] = useState('overview');

  // Enhanced sample data with AI insights
  const sampleProduct: Product = {
    id: id || '1',
    title: 'BMW X5 2020 Premium Luxury SUV',
    description: 'Exceptional BMW X5 in pristine condition. This 2020 model features a 3.0L turbocharged engine, all-wheel drive, premium leather interior, and comprehensive BMW service history. Recently serviced with all maintenance records. Includes premium package with heated seats, panoramic sunroof, and advanced driver assistance systems.',
    image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
    current_price: 2850000,
    starting_bid: 2500000,
    bid_count: 47,
    end_date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    category: 'Vehicles',
    status: 'active',
    location: 'Mumbai, Maharashtra',
    seller_name: 'Premium Auto Traders',
    seller_rating: 4.9,
    seller_id: 'seller1',
    condition: 'Excellent',
    shipping: 'Free doorstep delivery',
    returns: '7-day inspection return',
    grade: 'A+',
    inspection_report: 'AI-powered inspection completed. All systems optimal. Minor cosmetic wear consistent with age.',
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1549399735-cef2e2c3f638?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544829099-b9a0e3421a1f?auto=format&fit=crop&w=800&q=80'
    ],
    documents: ['RC Book', 'Insurance', 'Service History', 'Owner Manual'],
    ai_insights: {
      market_value: 3200000,
      confidence: 94,
      trend: 'up',
      similar_sales: [
        { price: 3100000, date: '2024-01-15' },
        { price: 2950000, date: '2024-01-10' },
        { price: 2850000, date: '2024-01-08' }
      ]
    }
  };

  const sampleBids: Bid[] = [
    { id: '1', amount: 2850000, bidder_name: 'Rahul K.', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
    { id: '2', amount: 2800000, bidder_name: 'Priya M.', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
    { id: '3', amount: 2750000, bidder_name: 'Amit S.', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
    { id: '4', amount: 2700000, bidder_name: 'Sneha R.', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
    { id: '5', amount: 2650000, bidder_name: 'Vikram T.', timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString() }
  ];

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // Real-time bidding notifications
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`bids-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `auction_id=eq.${id}`
        },
        (payload) => {
          const newBid = payload.new as Bid;
          toast.success(`🚨 New bid placed: ₹${newBid.amount.toLocaleString('en-IN')} by ${newBid.bidder_name}!`, {
            duration: 6000,
            icon: '🔨',
            style: {
              background: '#10B981',
              color: '#FFFFFF',
              fontWeight: 'bold'
            }
          });

          // Update product with new bid
          setProduct(prev => prev ? {
            ...prev,
            current_price: Math.max(prev.current_price, newBid.amount),
            bid_count: (prev.bid_count || 0) + 1
          } : null);

          // Add to bids list
          setBids(prev => [newBid, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProduct(sampleProduct);
      setBids(sampleBids);
      setBidAmount((sampleProduct.current_price + 50000).toString());
    } catch (error) {
      console.error('Failed to fetch product:', error);
      setError('Failed to load product');
      toast.error('Failed to load product');
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newBid: Bid = {
        id: Date.now().toString(),
        amount: Number(bidAmount),
        bidder_name: 'You',
        timestamp: new Date().toISOString()
      };

      setBids(prev => [newBid, ...prev]);
      setProduct(prev => prev ? {
        ...prev,
        current_price: Number(bidAmount),
        bid_count: (prev.bid_count || 0) + 1
      } : null);

      toast.success('Bid placed successfully!');
      setBidAmount((Number(bidAmount) + 50000).toString());
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
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading premium auction...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <AlertCircle className="w-16 h-16 text-error-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Auction Not Found</h2>
          <p className="text-neutral-600">{error || 'The auction you\'re looking for doesn\'t exist'}</p>
        </div>
        <button
          onClick={() => navigate('/auctions')}
          className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all duration-250"
        >
          Browse Other Auctions
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'specs', label: 'Specifications', icon: Shield },
    { id: 'bids', label: 'Bid History', icon: Gavel },
    { id: 'ai', label: 'AI Insights', icon: Sparkles }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/auctions')}
              className="flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Auctions
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleWatchlist}
                className={`p-2 rounded-lg transition-all duration-250 ${
                  isWatchlisted
                    ? 'bg-error-50 text-error-600 hover:bg-error-100'
                    : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWatchlisted ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={shareProduct}
                className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-250"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Large Product Gallery */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-200">
              <div className="relative aspect-square bg-neutral-100">
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
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-250 flex items-center justify-center"
                    >
                      <ChevronLeft className="w-6 h-6 text-neutral-700" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-250 flex items-center justify-center"
                    >
                      <ChevronRight className="w-6 h-6 text-neutral-700" />
                    </button>
                  </>
                )}

                {/* Top Badges */}
                <div className="absolute top-6 left-6 flex flex-col gap-3">
                  <div className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg">
                    <CheckCircle className="w-4 h-4" />
                    AI Verified
                  </div>
                  {product.grade && (
                    <div className="bg-primary-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg">
                      Grade {product.grade}
                    </div>
                  )}
                </div>

                {/* Price Display */}
                <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-neutral-200">
                  <div className="text-sm text-neutral-600 mb-1">Current Bid</div>
                  <div className="text-2xl font-bold text-neutral-900">{formatPrice(product.current_price)}</div>
                </div>

                {/* Time Remaining */}
                <div className="absolute bottom-6 left-6 bg-black/80 text-white px-4 py-2 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold">{formatTimeLeft(product.end_date)}</span>
                  </div>
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {product.images && product.images.length > 1 && (
                <div className="p-6 bg-neutral-50">
                  <div className="flex gap-3 overflow-x-auto">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-250 ${
                          currentImageIndex === index
                            ? 'border-primary-600 shadow-lg scale-105'
                            : 'border-neutral-200 hover:border-neutral-300'
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
                </div>
              )}
            </div>

            {/* Product Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                      {product.category}
                    </span>
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {product.location}
                    </span>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 leading-tight">
                    {product.title}
                  </h1>
                  <div className="flex items-center gap-6 text-neutral-600">
                    <div className="flex items-center gap-2">
                      <Gavel className="w-5 h-5" />
                      <span className="font-medium">{product.bid_count} bids</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      <span className="font-medium">247 views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      <span className="font-medium">89 watching</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabbed Content */}
            <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden">
              {/* Tabs */}
              <div className="border-b border-neutral-200">
                <div className="flex">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-250 ${
                        activeTab === tab.id
                          ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                      }`}
                    >
                      <tab.icon className="w-5 h-5 mx-auto mb-1" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-bold text-neutral-900 mb-4">Description</h3>
                      <p className="text-neutral-600 leading-relaxed">{product.description}</p>
                    </div>

                    {/* Key Specs Grid */}
                    <div>
                      <h3 className="text-xl font-bold text-neutral-900 mb-6">Key Specifications</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {[
                          { label: 'Condition', value: product.condition, icon: Shield },
                          { label: 'Location', value: product.location, icon: MapPin },
                          { label: 'Shipping', value: product.shipping, icon: Truck },
                          { label: 'Returns', value: product.returns, icon: CheckCircle },
                          { label: 'Grade', value: product.grade, icon: Award },
                          { label: 'Category', value: product.category, icon: Star }
                        ].map((spec, index) => (
                          <div key={index} className="text-center p-4 bg-neutral-50 rounded-xl">
                            <spec.icon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                            <div className="text-sm text-neutral-600 mb-1">{spec.label}</div>
                            <div className="font-semibold text-neutral-900">{spec.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-neutral-900 mb-6">Detailed Specifications</h3>
                    {product.inspection_report && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                          <Camera className="w-6 h-6 text-emerald-600 mt-1" />
                          <div>
                            <h4 className="font-semibold text-emerald-800 mb-2">AI Inspection Report</h4>
                            <p className="text-emerald-700">{product.inspection_report}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-neutral-900">Vehicle Details</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-neutral-100">
                            <span className="text-neutral-600">Make & Model</span>
                            <span className="font-medium text-neutral-900">BMW X5</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-neutral-100">
                            <span className="text-neutral-600">Year</span>
                            <span className="font-medium text-neutral-900">2020</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-neutral-100">
                            <span className="text-neutral-600">Mileage</span>
                            <span className="font-medium text-neutral-900">45,000 km</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-neutral-100">
                            <span className="text-neutral-600">Fuel Type</span>
                            <span className="font-medium text-neutral-900">Diesel</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold text-neutral-900">Features</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                            <span className="text-neutral-700">All Wheel Drive</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                            <span className="text-neutral-700">Premium Leather Interior</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                            <span className="text-neutral-700">Advanced Driver Assistance</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                            <span className="text-neutral-700">Panoramic Sunroof</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'bids' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-neutral-900">Bid History</h3>
                      <div className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                        {bids.length} bids
                      </div>
                    </div>

                    <div className="space-y-4">
                      {bids.map((bid, index) => (
                        <div
                          key={bid.id}
}
}
}
                          className={`flex items-center justify-between p-4 rounded-xl border ${
                            index === 0
                              ? 'bg-emerald-50 border-emerald-200'
                              : 'bg-white border-neutral-200'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                              index === 0
                                ? 'bg-emerald-600 text-white'
                                : 'bg-primary-100 text-primary-700'
                            }`}>
                              {bid.bidder_name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-neutral-900">{bid.bidder_name}</div>
                              <div className="text-sm text-neutral-600">
                                {new Date(bid.timestamp).toLocaleString('en-IN')}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-neutral-900">{formatPrice(bid.amount)}</div>
                            {index === 0 && (
                              <div className="bg-emerald-600 text-white px-2 py-1 rounded-full text-xs font-medium mt-1">
                                Highest Bid
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'ai' && product.ai_insights && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full mb-4">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">AI-Powered Insights</span>
                      </div>
                      <h3 className="text-2xl font-bold text-neutral-900 mb-2">Market Intelligence</h3>
                      <p className="text-neutral-600">Data-driven insights to help you bid smarter</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-xl border border-primary-200">
                        <div className="flex items-center gap-3 mb-3">
                          <TrendingUp className="w-6 h-6 text-primary-600" />
                          <span className="font-semibold text-primary-800">Market Value</span>
                        </div>
                        <div className="text-2xl font-bold text-primary-900 mb-1">{formatPrice(product.ai_insights.market_value)}</div>
                        <div className="text-sm text-primary-700">Estimated fair market value</div>
                      </div>

                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
                        <div className="flex items-center gap-3 mb-3">
                          <ThumbsUp className="w-6 h-6 text-emerald-600" />
                          <span className="font-semibold text-emerald-800">AI Confidence</span>
                        </div>
                        <div className="text-2xl font-bold text-emerald-900 mb-1">{product.ai_insights.confidence}%</div>
                        <div className="text-sm text-emerald-700">Accuracy of valuation</div>
                      </div>

                      <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
                        <div className="flex items-center gap-3 mb-3">
                          <TrendingUp className={`w-6 h-6 ${product.ai_insights.trend === 'up' ? 'text-emerald-600' : 'text-amber-600'}`} />
                          <span className="font-semibold text-amber-800">Price Trend</span>
                        </div>
                        <div className={`text-2xl font-bold mb-1 ${
                          product.ai_insights.trend === 'up' ? 'text-emerald-900' :
                          product.ai_insights.trend === 'down' ? 'text-error-900' : 'text-amber-900'
                        }`}>
                          {product.ai_insights.trend === 'up' ? '↗️ Rising' :
                           product.ai_insights.trend === 'down' ? '↘️ Falling' : '➡️ Stable'}
                        </div>
                        <div className="text-sm text-amber-700">Market direction</div>
                      </div>
                    </div>

                    <div className="bg-neutral-50 rounded-xl p-6">
                      <h4 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary-600" />
                        Similar Sales in Your Area
                      </h4>
                      <div className="space-y-3">
                        {product.ai_insights.similar_sales.map((sale, index) => (
                          <div key={index} className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                              <span className="text-neutral-700">Similar BMW X5 sold</span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-neutral-900">{formatPrice(sale.price)}</div>
                              <div className="text-sm text-neutral-600">{new Date(sale.date).toLocaleDateString('en-IN')}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Emphasis Block */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-neutral-200 sticky top-24">
              <div className="text-center mb-6">
                <div className="text-sm text-neutral-600 mb-2">Current Highest Bid</div>
                <div className="text-4xl font-bold text-neutral-900 mb-2">{formatPrice(product.current_price)}</div>
                <div className="text-sm text-neutral-600">Starting: {formatPrice(product.starting_bid)}</div>
              </div>

              {/* Bid Input */}
              <div className="space-y-4 mb-6">
                <label className="block text-sm font-medium text-neutral-700">Place Your Bid</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBidAmount(Math.max(0, Number(bidAmount) - 50000).toString())}
                    className="p-3 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors duration-200"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl text-center font-semibold focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    min={product.current_price + 1}
                  />
                  <button
                    onClick={() => setBidAmount((Number(bidAmount) + 50000).toString())}
                    className="p-3 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Wallet Balance */}
              <div className="bg-neutral-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-700">Your Balance</span>
                  <span className="text-lg font-bold text-emerald-600">{formatPrice(walletBalance)}</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((walletBalance / (product.current_price * 2)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Sticky CTA Button */}
              <button
                onClick={handleBid}
                disabled={isPlacingBid || !bidAmount || Number(bidAmount) <= product.current_price}
                className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-250 hover:shadow-xl hover:shadow-primary-500/25 flex items-center justify-center gap-2"
              >
                {isPlacingBid ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
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

            {/* Verified Seller Badge */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-neutral-200">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="font-bold text-neutral-900 mb-1">{product.seller_name}</h3>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm text-neutral-600 ml-1">{product.seller_rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-700">Verified Seller</span>
                </div>
              </div>

              <button className="w-full border border-neutral-300 text-neutral-700 py-3 rounded-xl font-semibold hover:bg-neutral-50 transition-all duration-250">
                View Seller Profile
              </button>
            </div>

            {/* Trust Signals */}
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-emerald-600" />
                  <div>
                    <div className="font-semibold text-emerald-800">Escrow Protection</div>
                    <div className="text-sm text-emerald-700">Money held securely until delivery</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Truck className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-semibold text-blue-800">Free Delivery</div>
                    <div className="text-sm text-blue-700">Doorstep delivery across India</div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  <div>
                    <div className="font-semibold text-purple-800">AI Verified</div>
                    <div className="text-sm text-purple-700">Advanced authentication & validation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
