import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Eye, 
  Clock, 
  Users, 
  MapPin, 
  Shield,
  Star,
  TrendingUp,
  Award
} from 'lucide-react';
import { colors } from './design-system';

interface AuctionCardProps {
  id: string;
  title: string;
  image: string;
  currentPrice: number;
  bidCount: number;
  endTime: string;
  location: string;
  category: string;
  isLive?: boolean;
  isTrending?: boolean;
  isFeatured?: boolean;
  isCertified?: boolean;
  seller: {
    name: string;
    verified: boolean;
    rating: number;
  };
  className?: string;
}

const AuctionCard: React.FC<AuctionCardProps> = ({
  id,
  title,
  image,
  currentPrice,
  bidCount,
  endTime,
  location,
  category,
  isLive = false,
  isTrending = false,
  isFeatured = false,
  isCertified = false,
  seller,
  className = '',
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatTimeLeft = (endTime: string) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <Link 
      to={`/product/${id}`}
      className={`group relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${className}`}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {isLive && (
            <div className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              LIVE
            </div>
          )}
          {isTrending && (
            <div className="px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
              <TrendingUp size={12} />
              Trending
            </div>
          )}
          {isFeatured && (
            <div className="px-2 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
              <Star size={12} />
              Featured
            </div>
          )}
          {isCertified && (
            <div className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
              <Shield size={12} />
              Certified
            </div>
          )}
        </div>

        {/* Wishlist Button */}
        <button className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-900/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Heart className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>

        {/* View Count */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 bg-black/50 text-white text-xs rounded-full">
          <Eye className="w-3 h-3" />
          <span className="text-xs">1.2k</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title and Location */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <MapPin className="w-3 h-3" />
            <span>{location}</span>
            <span>•</span>
            <span>{category}</span>
          </div>
        </div>

        {/* Price and Bids */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPrice(currentPrice)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {bidCount} bid{bidCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{formatTimeLeft(endTime)}</span>
            </div>
          </div>
        </div>

        {/* Seller Info */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                {seller.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{seller.name}</p>
              <div className="flex items-center gap-1">
                {seller.verified && (
                  <Shield className="w-3 h-3 text-green-500" />
                )}
                <div className="flex items-center">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {seller.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AuctionCard;
