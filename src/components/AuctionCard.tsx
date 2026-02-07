import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { colors, spacing, typography, radii } from '@/design-system';
import { Heart, Eye, Zap, Shield, Star, Award, TrendingUp, Clock, MapPin, Users, Tag } from 'lucide-react';

export type AuctionCardVariant = 'timed' | 'live' | 'tender' | 'catalog' | 'dashboard' | 'compact';

const variantConfig: Record<AuctionCardVariant, {
  label: string;
  badgeVariant: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  buttonText: string;
  buttonVariant: 'primary' | 'secondary' | 'outline' | 'ghost';
}> = {
  timed: {
    label: 'Timed auction',
    badgeVariant: 'info',
    buttonText: 'Place bid',
    buttonVariant: 'primary',
  },
  live: {
    label: 'Live auction',
    badgeVariant: 'success',
    buttonText: 'Join live',
    buttonVariant: 'primary',
  },
  tender: {
    label: 'Tender lot',
    badgeVariant: 'warning',
    buttonText: 'Submit bid',
    buttonVariant: 'secondary',
  },
  catalog: {
    label: 'Listing',
    badgeVariant: 'neutral',
    buttonText: 'View Details',
    buttonVariant: 'primary',
  },
  compact: {
    label: 'Listing',
    badgeVariant: 'neutral',
    buttonText: 'View',
    buttonVariant: 'secondary',
  },
  dashboard: {
    label: 'Dashboard',
    badgeVariant: 'neutral',
    buttonText: 'View auction',
    buttonVariant: 'secondary',
  },
};

const formatCurrency = (value?: number | null) => {
  if (value === undefined || value === null) return 'Price on request';
  return `₹${value.toLocaleString('en-IN')}`;
};

export interface AuctionCardProps {
  id: string;
  image?: string;
  title?: string;
  description?: string;
  price?: number;
  currentBid?: number;
  bidCount?: number;
  buyersCount?: number;
  views?: number;
  watchers?: number;
  location?: string;
  condition?: string;
  sellerName?: string;
  seller?: {
    name: string;
    type: 'individual' | 'company' | 'third_party';
    verified: boolean;
    rating: number;
    avatar_url?: string;
  };
  timeRemaining?: string;
  isLive?: boolean;
  isUpcoming?: boolean;
  isEnded?: boolean;
  isTimed?: boolean;
  isTender?: boolean;
  isTrending?: boolean;
  isPremium?: boolean;
  isFeatured?: boolean;
  isCertified?: boolean;
  noReturns?: boolean;
  tags?: string[];
  onClick?: () => void;
  onWatchToggle?: () => void;
  watched?: boolean;
  onPrimaryAction?: () => void;
  variant?: AuctionCardVariant;
  className?: string;
}

export const AuctionCard = React.forwardRef<HTMLDivElement, AuctionCardProps>((props, ref) => {
  const {
    image,
    title,
    description,
    price,
    currentBid,
    bidCount,
    buyersCount,
    views,
    watchers,
    location,
    condition,
    sellerName,
    seller,
    timeRemaining,
    onClick,
    onWatchToggle,
    watched,
    onPrimaryAction,
    variant = 'catalog',
    className = '',
    isUpcoming,
    isEnded,
    isLive,
    isTimed,
    isTender,
    isTrending,
    isPremium,
    isFeatured,
    isCertified,
    noReturns,
    tags,
    ...rest
  } = props;

  const { label, badgeVariant, buttonText, buttonVariant } = variantConfig[variant];
  const priceLabel = currentBid ? 'Current bid' : 'Starting price';
  const priceValue = currentBid ?? price;
  const imageUrl = image || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80';

  if (variant === 'compact') {
    return (
      <Card
        ref={ref}
        padding="sm"
        variant="surface"
        className="flex flex-row gap-[${spacing.sm}px] items-center"
        {...rest}
      >
        <div className="h-20 w-28 shrink-0 rounded-[${radii.sm}] overflow-hidden bg-gray-100">
          {image ? (
            <img src={image} alt={title || 'Auction item'} data-testid="auction-card-image" className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full w-full text-gray-400 text-xs">No image</div>
          )}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{title || 'Untitled'}</div>
          {currentBid ? (
            <div className="text-xs text-gray-600">Current bid: {formatCurrency(currentBid)}</div>
          ) : price ? (
            <div className="text-xs text-gray-600">Price: {formatCurrency(price)}</div>
          ) : (
            <div className="text-xs text-gray-500">—</div>
          )}
          <div className="text-[11px] text-gray-500 truncate">{condition || location || ''}</div>
        </div>
        <div className="flex flex-col gap-[${spacing.xs}px] items-end">
          <Button size="sm" variant="secondary" onClick={onPrimaryAction}>
            View
          </Button>
          {onWatchToggle && (
            <button
              aria-label={watched ? 'Remove from watchlist' : 'Add to watchlist'}
              onClick={onWatchToggle}
              className="p-[${spacing.xs}px] rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Heart className={`h-4 w-4 ${watched ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
            </button>
          )}
        </div>
      </Card>
    );
  }

  // Render seller info safely
  const renderSellerInfo = () => {
    if (seller) {
      return (
        <div className="flex items-center gap-2 mt-2">
          {seller.avatar_url ? (
            <img src={seller.avatar_url} alt={seller.name} className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-500">{seller.name.charAt(0)}</span>
            </div>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-gray-700 truncate max-w-[120px]">{seller.name}</span>
              {seller.type === 'company' && (
                <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded">company</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-0.5 ml-auto">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold text-gray-700">{seller.rating}</span>
          </div>
        </div>
      );
    }
    
    if (sellerName) {
      return (
        <div className="flex items-center gap-2 mt-2">
           <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-500">{sellerName.charAt(0)}</span>
            </div>
           <span className="text-xs font-medium text-gray-700 truncate">{sellerName}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <Card
      ref={ref}
      padding="none"
      variant="surface"
      data-testid="product-card"
      className={`flex flex-col w-full overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 ${className}`.trim()}
      {...rest}
    >
      <div className="relative">
        <div className="w-full overflow-hidden aspect-[4/3] h-48 md:h-56">
          <img
            src={imageUrl}
            alt={title || 'Auction item'}
            data-testid="auction-card-image"
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
            onClick={onClick}
            role={onClick ? 'button' : undefined}
          />
        </div>
        
        {/* Top Left Badges Stack */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
           {isCertified && (
            <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium">
              <Shield className="h-3 w-3" /> QuickMela Certified
            </Badge>
          )}
          {isTrending && (
            <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium">
              <TrendingUp className="h-3 w-3" /> Trending
            </Badge>
          )}
          {isPremium && (
            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-0 flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium">
              <Award className="h-3 w-3" /> Premium
            </Badge>
          )}
           {isFeatured && (
            <Badge className="bg-purple-500 hover:bg-purple-600 text-white border-0 flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium">
              <Star className="h-3 w-3" /> Featured
            </Badge>
          )}
          {(isLive || isTimed) && (
             <Badge className="bg-white/90 text-red-600 border-0 flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold shadow-sm">
               {isLive ? <Zap className="h-3 w-3 fill-red-600" /> : <Clock className="h-3 w-3" />}
               {isLive ? 'LIVE' : 'TIMED'}
             </Badge>
          )}
        </div>

        {/* Top Right: Watcher Count (if any) or Time */}
        {timeRemaining && !isLive && (
          <div className="absolute top-3 right-3">
             {/* Can place time here or below */}
          </div>
        )}

        {/* Bottom Left: View Count */}
        <div className="absolute bottom-3 left-3">
           <div className="bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
             <Eye className="h-3 w-3" /> {views?.toLocaleString() || 0}
           </div>
        </div>

        {/* Bottom Right: Like Button */}
        <div className="absolute bottom-3 right-3">
          {onWatchToggle && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onWatchToggle();
              }}
              className="rounded-full bg-white p-1.5 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Heart className={`h-4 w-4 ${watched ? 'fill-gray-900 text-gray-900' : 'text-gray-900'}`} />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Title & Verify Badge */}
        <div className="flex justify-between items-start gap-2">
           <h3 data-testid="product-title" className="font-bold text-gray-900 text-lg leading-tight line-clamp-2" title={title}>
            {title || 'Untitled auction'}
          </h3>
          {isCertified && <Shield className="h-5 w-5 text-green-500 shrink-0" />}
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Rating & Returns */}
        <div className="flex items-center gap-2">
           <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-xs font-medium text-gray-700 border border-gray-100">
             <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
             {seller?.rating || '4.5'} / 5
           </div>
           {condition && (
             <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-xs font-medium text-gray-700 border border-gray-100">
               <Tag className="h-3 w-3" /> {condition}
             </div>
           )}
           {noReturns && (
             <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded text-xs font-medium text-gray-500 border border-gray-100">
               <Tag className="h-3 w-3" /> No Returns
             </div>
           )}
           {isCertified && (
              <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded text-xs font-medium text-green-700 border border-green-100">
               <Shield className="h-3 w-3" /> Authenticity
             </div>
           )}
        </div>

        {/* Seller Info */}
        {renderSellerInfo()}

        {/* Location & Time & Watchers Grid */}
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mt-1">
          {location && (
            <div className="flex flex-col gap-0.5">
               <MapPin className="h-3 w-3 text-gray-400" />
               <span className="truncate" title={location}>{location.split(',')[0]}</span>
               <span className="text-[10px] truncate text-gray-400">{location.split(',')[1]}</span>
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <Clock className="h-3 w-3 text-gray-400" />
            <span className="font-medium text-gray-700">{timeRemaining || 'Ended'}</span>
             <span className="text-[10px] text-gray-400">Time left</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <Users className="h-3 w-3 text-gray-400" />
            <span className="font-medium text-gray-700">{watchers || 0} watching</span>
            <span className="text-[10px] text-gray-400">
                {currentBid ? `${bidCount || 0} bids` : 'No bids'}
            </span>
          </div>
        </div>

        {/* Price Section */}
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-0.5">{priceLabel}</p>
          <div className="flex items-end gap-2">
             <p data-testid="current-bid" className="text-xl font-bold text-green-600">
              {formatCurrency(priceValue)}
             </p>
             {price && currentBid && price > currentBid && (
               <p className="text-sm text-gray-400 line-through mb-1">
                 {formatCurrency(price)}
               </p>
             )}
          </div>
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-2 pt-3 border-t border-gray-100">
          <Button 
            data-testid="place-bid-button"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm h-9 focus-visible focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={onPrimaryAction}
          >
            {buttonText}
          </Button>
          {onWatchToggle && (
            <Button
              variant="outline"
              className="h-9 px-3 border-indigo-200 text-indigo-600 hover:bg-indigo-50 flex items-center justify-center gap-1"
              onClick={(e) => {
                e.preventDefault();
                onWatchToggle();
              }}
            >
              Add to Watchlist <Heart className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
});

AuctionCard.displayName = 'AuctionCard';

export default AuctionCard;


/**
 * Usage examples:
 * <AuctionCard variant="timed" id="1" title="Vintage bike" price={125000} views={1200} timeRemaining="2h 30m" onPrimaryAction={() => {}} />
 * <AuctionCard variant="live" id="2" title="Live yard" currentBid={520000} buyersCount={54} onPrimaryAction={() => {}} />
 * <AuctionCard variant="catalog" id="3" title="Listing" price={340000} location="Delhi" onPrimaryAction={() => {}} />
 */
