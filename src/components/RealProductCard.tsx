// Real Product Card Component with Environment Indicators
import React from 'react';
import { RealProduct } from '../services/productService';
import { EnvironmentBadge } from './EnvironmentBadge';

interface RealProductCardProps {
  product: RealProduct;
  onBid?: (productId: string, amount: number) => void;
  className?: string;
}

export const RealProductCard: React.FC<RealProductCardProps> = ({
  product,
  onBid,
  className = ''
}) => {
  const isRealProduct = product.environment?.isRealProduct || false;
  const isVerified = product.seller?.verified || false;
  
  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ${className}`}>
      {/* Product Header with Environment Badge */}
      <div className="relative">
        {product.images && product.images.length > 0 && (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-48 object-cover rounded-t-lg"
            loading="lazy"
          />
        )}
        
        <div className="absolute top-2 right-2">
          <EnvironmentBadge 
            type="product" 
            environment={product.environment}
          />
        </div>
        
        {isVerified && (
          <div className="absolute top-2 left-2">
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              ✓ Verified
            </span>
          </div>
        )}
      </div>
      
      {/* Product Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {product.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        {/* Seller Info */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-500">
            Seller: {product.seller.name}
          </div>
          <div className="text-xs text-gray-400">
            {product.category}
          </div>
        </div>
        
        {/* Pricing */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              ${product.currentBid || product.startingPrice}
            </div>
            {product.currentBid > product.startingPrice && (
              <div className="text-sm text-green-600">
                +${product.currentBid - product.startingPrice} bid
              </div>
            )}
          </div>
          
          {/* Auction Timer */}
          <div className="text-sm text-gray-500">
            {product.auctionEnd && (
              <div>
                Ends: {new Date(product.auctionEnd).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
        
        {/* Action Button */}
        {onBid && (
          <button
            onClick={() => onBid(product.id, product.currentBid || product.startingPrice)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            aria-label={`Place bid on ${product.title}`}
          >
            {isRealProduct ? 'Place Bid' : 'Demo Bid'}
          </button>
        )}
      </div>
    </div>
  );
};
