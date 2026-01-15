// Modern Product Detail Page
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BetaUserService } from '../services/betaUserService';
import { EnvironmentBadge } from '../components/EnvironmentBadge';
import { BetaUserIndicator } from '../components/BetaUserIndicator';
import { SandboxWalletBanner } from '../components/SandboxWalletBanner';
import { BetaVersionBanner } from '../components/BetaVersionBanner';

interface Product {
  id: string;
  title: string;
  currentBid: number;
  startingPrice: number;
  timeLeft: string;
  imageUrl: string;
  category: string;
  seller: {
    name: string;
    rating: number;
    verified: boolean;
    joinedDate: string;
  };
  isRealProduct: boolean;
  bids: number;
  description: string;
  specifications: Record<string, string>;
  images: string[];
  auctionEnd: string;
}

interface Bid {
  id: string;
  amount: number;
  bidder: string;
  timestamp: string;
}

export const ModernProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [userRole, setUserRole] = useState<'guest' | 'beta_buyer' | 'beta_seller' | 'admin'>('guest');
  const [product, setProduct] = useState<Product | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [placingBid, setPlacingBid] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const loadProductData = async () => {
      if (!id) return;

      try {
        const userId = localStorage.getItem('sb-user-id') || 'guest';
        const role = await BetaUserService.getUserRole(userId);
        setUserRole(role);

        // Mock product data
        const mockProduct: Product = {
          id: id,
          title: 'Premium Wireless Headphones - Noise Cancelling Pro',
          currentBid: 3500,
          startingPrice: 2000,
          timeLeft: '2h 15m',
          imageUrl: '/api/placeholder/600/400',
          category: 'Electronics',
          seller: {
            name: 'Tech Store Pro',
            rating: 4.8,
            verified: true,
            joinedDate: 'January 2023'
          },
          isRealProduct: true,
          bids: 12,
          description: 'Experience premium sound quality with these professional-grade wireless headphones. Featuring advanced noise cancellation technology, 30-hour battery life, and superior comfort for extended listening sessions. Perfect for music lovers, professionals, and travelers.',
          specifications: {
            'Brand': 'AudioTech Pro',
            'Model': 'WH-1000XM5',
            'Connectivity': 'Bluetooth 5.2, 3.5mm jack',
            'Battery Life': '30 hours',
            'Noise Cancellation': 'Active Noise Cancelling',
            'Weight': '250g',
            'Warranty': '2 years manufacturer warranty'
          },
          images: [
            '/api/placeholder/600/400',
            '/api/placeholder/600/400',
            '/api/placeholder/600/400',
            '/api/placeholder/600/400'
          ],
          auctionEnd: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        };

        const mockBids: Bid[] = [
          { id: '1', amount: 3500, bidder: 'User123', timestamp: '2 minutes ago' },
          { id: '2', amount: 3200, bidder: 'User456', timestamp: '15 minutes ago' },
          { id: '3', amount: 3000, bidder: 'User789', timestamp: '1 hour ago' },
          { id: '4', amount: 2800, bidder: 'User321', timestamp: '2 hours ago' },
          { id: '5', amount: 2500, bidder: 'User654', timestamp: '3 hours ago' }
        ];

        setProduct(mockProduct);
        setBids(mockBids);
      } catch (err) {
        console.error('Error loading product:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [id]);

  const handlePlaceBid = async () => {
    if (!product || !bidAmount || userRole === 'guest') return;

    setPlacingBid(true);
    try {
      // Simulate bid placement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newBid: Bid = {
        id: Date.now().toString(),
        amount: parseInt(bidAmount),
        bidder: 'CurrentUser',
        timestamp: 'Just now'
      };

      setBids(prev => [newBid, ...prev]);
      setProduct(prev => prev ? { ...prev, currentBid: parseInt(bidAmount), bids: prev.bids + 1 } : null);
      setBidAmount('');
      alert('Bid placed successfully!');
    } catch (err) {
      alert('Failed to place bid: ' + (err as Error).message);
    } finally {
      setPlacingBid(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Beta Version Banner */}
      <BetaVersionBanner />
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                QuickMela
              </h1>
              <div className="hidden md:flex space-x-6">
                <a href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">Dashboard</a>
                <a href="/catalog" className="text-gray-700 hover:text-blue-600 transition-colors">Browse</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">How it Works</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <BetaUserIndicator userAccessLevel={userRole} />
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sandbox Wallet Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SandboxWalletBanner />
      </div>

      {/* Product Detail */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Images */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={product.images[selectedImage]}
                alt={product.title}
                className="w-full h-96 object-cover rounded-2xl"
              />
              {product.isRealProduct && (
                <div className="absolute top-4 right-4">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full font-medium">
                    Live Product
                  </span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
                  <p className="text-gray-600">{product.category}</p>
                </div>
              </div>

              {/* Seller Info */}
              <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {product.seller.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{product.seller.name}</h3>
                        {product.seller.verified && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        ⭐ {product.seller.rating} • Joined {product.seller.joinedDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bidding Section */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-600 mb-2">Current Bid</p>
                  <p className="text-4xl font-bold text-gray-900">₹{product.currentBid.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{product.bids} bids • {product.timeLeft} left</p>
                </div>

                {userRole !== 'guest' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Bid Amount
                      </label>
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        min={product.currentBid + 100}
                        step="100"
                        className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Enter amount above ₹${product.currentBid.toLocaleString()}`}
                      />
                    </div>
                    <button
                      onClick={handlePlaceBid}
                      disabled={placingBid || !bidAmount || parseInt(bidAmount) <= product.currentBid}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {placingBid ? 'Placing Bid...' : 'Place Bid'}
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">Sign up to place bids on this item</p>
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                      Request Beta Access
                    </button>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Product Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Starting Price</span>
                    <span className="font-medium">₹{product.startingPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Auction Ends</span>
                    <span className="font-medium">{new Date(product.auctionEnd).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description and Specifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Description</h2>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h2>
              <div className="space-y-3">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600">{key}</span>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bidding History */}
        <div className="mt-12">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Bidding History</h2>
            <div className="space-y-3">
              {bids.map((bid) => (
                <div key={bid.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {bid.bidder.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{bid.bidder}</p>
                      <p className="text-sm text-gray-500">{bid.timestamp}</p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900">₹{bid.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
