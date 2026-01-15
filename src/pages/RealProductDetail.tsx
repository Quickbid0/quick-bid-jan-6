// Real Product Detail Page with Environment Indicators
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { RealProduct, ProductService } from '../services/productService';
import { UserAccessService } from '../services/userAccessService';
import { WalletService } from '../services/walletService';
import { EnvironmentBadge } from '../components/EnvironmentBadge';
import { SandboxWalletBanner } from '../components/SandboxWalletBanner';
import { BetaUserIndicator } from '../components/BetaUserIndicator';

export const RealProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<RealProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAccessLevel, setUserAccessLevel] = useState<'internal' | 'beta' | 'public'>('public');
  const [canBid, setCanBid] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [placingBid, setPlacingBid] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError('Product ID is required');
        setLoading(false);
        return;
      }

      try {
        const productData = await ProductService.getProductById(id);
        if (!productData) {
          setError('Product not found');
          setLoading(false);
          return;
        }

        setProduct(productData);
        
        // Check user access level
        const userId = localStorage.getItem('sb-user-id') || 'guest';
        const accessLevel = await UserAccessService.getUserAccessLevel(userId);
        setUserAccessLevel(accessLevel);
        
        const canUserBid = await UserAccessService.canBid(userId);
        setCanBid(canUserBid);
        
      } catch (err) {
        setError('Failed to load product');
        console.error('Error loading product:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handlePlaceBid = async () => {
    if (!product || !bidAmount || !canBid) return;

    setPlacingBid(true);
    try {
      const userId = localStorage.getItem('sb-user-id') || 'guest';
      const amount = parseFloat(bidAmount);
      
      await WalletService.placeBid(userId, product.id, amount);
      
      // Refresh product data
      const updatedProduct = await ProductService.getProductById(product.id);
      setProduct(updatedProduct);
      
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

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Product not found'}
          </h1>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* User Access Indicator */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <BetaUserIndicator userAccessLevel={userAccessLevel} />
        </div>
      </div>

      {/* Sandbox Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SandboxWalletBanner />
      </div>

      {/* Product Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Product Header */}
          <div className="relative">
            {product.images && product.images.length > 0 && (
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-96 object-cover"
              />
            )}
            
            <div className="absolute top-4 right-4">
              <EnvironmentBadge 
                type="product" 
                environment={product.environment}
              />
            </div>
            
            {product.seller.verified && (
              <div className="absolute top-4 left-4">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  ✓ Verified Seller
                </span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {product.title}
                </h1>
                
                <p className="text-gray-600 mb-6">
                  {product.description}
                </p>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-500">Category:</span>
                    <span className="ml-2 text-gray-900">{product.category}</span>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500">Seller:</span>
                    <span className="ml-2 text-gray-900">{product.seller.name}</span>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500">Auction ends:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(product.auctionEnd).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-gray-900">
                      ${product.currentBid || product.startingPrice}
                    </div>
                    <div className="text-sm text-gray-500">
                      Current bid
                    </div>
                  </div>

                  {/* Bid Form */}
                  {canBid ? (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700">
                          Your bid amount
                        </label>
                        <input
                          type="number"
                          id="bidAmount"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          min={(product.currentBid || product.startingPrice) + 1}
                          step="1"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter bid amount"
                        />
                      </div>
                      
                      <button
                        onClick={handlePlaceBid}
                        disabled={placingBid || !bidAmount}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {placingBid ? 'Placing Bid...' : 'Place Bid'}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      {userAccessLevel === 'public' 
                        ? 'Sign up for beta access to place bids'
                        : 'You do not have permission to bid on this product'
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
