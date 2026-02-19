// Mobile Optimization System - Gaming Interactions + Touch Optimization + Performance
// Comprehensive mobile experience with gaming psychology, touch-first design, and performance

import React, { useState, useEffect, useCallback } from 'react';

// Mobile Detection & Device Utilities
export const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      setIsTouch(hasTouch);

      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return { deviceType, isTouch };
};

// Touch-Optimized Button (44px minimum touch target)
interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'gaming' | 'fintech' | 'saas';
  haptic?: boolean;
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  children,
  variant = 'gaming',
  haptic = true,
  className = '',
  ...props
}) => {
  const { isTouch } = useDeviceType();

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (haptic && isTouch && 'vibrate' in navigator) {
      navigator.vibrate(50); // Light haptic feedback
    }
    props.onClick?.(e);
  }, [haptic, isTouch, props.onClick]);

  const variants = {
    gaming: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg',
    fintech: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md',
    saas: 'bg-gray-900 hover:bg-gray-800 text-white shadow-sm'
  };

  return (
    <button
      className={`min-h-[44px] min-w-[44px] px-4 py-3 rounded-lg font-semibold transition-all duration-200 active:scale-95 ${variants[variant]} ${className}`}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

// Swipe Gestures for Mobile Gaming
export const useSwipeGesture = (onSwipeLeft?: () => void, onSwipeRight?: () => void) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-100, 0, 100], [-10, 0, 10]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 50;

    if (info.offset.x > swipeThreshold) {
      onSwipeRight?.();
      if ('vibrate' in navigator) navigator.vibrate([50, 50, 50]); // Success vibration
    } else if (info.offset.x < -swipeThreshold) {
      onSwipeLeft?.();
      if ('vibrate' in navigator) navigator.vibrate([100]); // Strong vibration
    }
  };

  return { x, rotate, handleDragEnd };
};

// Mobile-Optimized Modal with Swipe to Dismiss
interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  fullScreen?: boolean;
}

export const MobileModal: React.FC<MobileModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  fullScreen = false
}) => {
  const { x, rotate, handleDragEnd } = useSwipeGesture(undefined, onClose);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Prevent layout shift
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = 'unset';
    };
  }, [isOpen]);

  if (!isTouch) {
    // Desktop modal
    return (
      <Fragment>
        {isOpen && (
          <div
}
}
}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
          >
            <div
}
}
}
              className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {title && (
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                    ×
                  </button>
                </div>
              )}
              <div className="p-4 overflow-y-auto">{children}</div>
            </div>
          </div>
        )}
      </Fragment>
    );
  }

  // Mobile modal with swipe
  return (
    <Fragment>
      {isOpen && (
        <>
          <div
}
}
}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            style={{ x, rotate }}
            onDragEnd={handleDragEnd}
}
}
}
}
            className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl ${
              fullScreen ? 'top-0 rounded-t-none' : 'max-h-[90vh]'
            }`}
          >
            {/* Swipe indicator */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {title && (
              <div className="flex items-center justify-between px-6 py-2 border-b border-gray-100">
                <h3 className="text-lg font-semibold">{title}</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                  ×
                </button>
              </div>
            )}

            <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: fullScreen ? '100vh' : '70vh' }}>
              {children}
            </div>
          </div>
        </>
      )}
    </Fragment>
  );
};

// Mobile Gaming Interactions
interface MobileBidCardProps {
  itemName: string;
  currentBid: number;
  yourBid?: number;
  timeLeft: number;
  onBid: (amount: number) => void;
}

export const MobileBidCard: React.FC<MobileBidCardProps> = ({
  itemName,
  currentBid,
  yourBid,
  timeLeft,
  onBid
}) => {
  const [bidAmount, setBidAmount] = useState(currentBid + 25000);
  const { isTouch } = useDeviceType();

  const quickBidAmounts = [25000, 50000, 100000, 250000];

  return (
    <div
}
}
      className="bg-white rounded-2xl shadow-lg p-6 mx-4 mb-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">{itemName}</h3>
        <div className="text-right">
          <div className="text-sm text-gray-500">Current Bid</div>
          <div className="text-xl font-bold text-green-600">
            ₹{(currentBid / 100000).toFixed(1)}L
          </div>
        </div>
      </div>

      {/* Time left with mobile urgency */}
      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-red-700 font-medium">Time Left</span>
          <span
 : {}}
}
            className="text-red-700 font-bold text-lg"
          >
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Bid input for mobile */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Bid</label>
        <input
          type="number"
          value={bidAmount / 100000}
          onChange={(e) => setBidAmount(Number(e.target.value) * 100000)}
          className="w-full px-4 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter bid amount"
        />
        <div className="text-xs text-gray-500 mt-1">in Lakhs</div>
      </div>

      {/* Quick bid buttons for mobile */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {quickBidAmounts.map((amount) => (
          <TouchButton
            key={amount}
            variant="gaming"
            onClick={() => setBidAmount(currentBid + amount)}
            className="text-sm py-3"
          >
            +₹{(amount / 1000).toFixed(0)}K
          </TouchButton>
        ))}
      </div>

      {/* Place bid button */}
      <TouchButton
        variant="gaming"
        onClick={() => onBid(bidAmount)}
        className="w-full py-4 text-lg font-bold"
        haptic
      >
        🚀 Place Bid
      </TouchButton>

      {yourBid && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700">
            👑 Your current bid: ₹{(yourBid / 100000).toFixed(1)}L
          </div>
        </div>
      )}
    </div>
  );
};

// Mobile Performance Optimizations
export const useMobilePerformance = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Reduce motion for performance on mobile
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setIsVisible(false);
    }

    // Disable expensive animations on low-end devices
    const checkPerformance = () => {
      // Simple performance check
      const start = performance.now();
      for (let i = 0; i < 100000; i++) {
        // Simple loop to test performance
      }
      const end = performance.now();

      if (end - start > 50) { // If loop takes > 50ms, reduce animations
        setIsVisible(false);
      }
    };

    checkPerformance();
  }, []);

  return { reduceMotion: !isVisible };
};

// Mobile Layout Components
interface MobileStackProps {
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MobileStack: React.FC<MobileStackProps> = ({
  children,
  spacing = 'md',
  className = ''
}) => {
  const spacingClasses = {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6'
  };

  return (
    <div className={`px-4 py-4 ${spacingClasses[spacing]} ${className}`}>
      {children}
    </div>
  );
};

// Mobile Bottom Sheet
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  snapPoints?: number[];
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [0.5, 1]
}) => {
  const [currentSnap, setCurrentSnap] = useState(0);

  return (
    <MobileModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      fullScreen={false}
    >
      {children}
    </MobileModal>
  );
};

// Mobile Pull to Refresh
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  className = ''
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const handleDragEnd = async (event: any, info: PanInfo) => {
    if (info.offset.y > 80 && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  return (
    <div
      drag="y"
      dragConstraints={{ top: 0, bottom: 100 }}
      onDragEnd={handleDragEnd}
      className={className}
    >
      {/* Pull indicator */}
      <div
        className="flex justify-center py-4"
 : { rotate: 0 }}
      >
        <div
 : {}}
}
          className="text-gray-400"
        >
          {isRefreshing ? '⟳' : '↓'}
        </div>
      </div>

      {children}
    </div>
  );
};

// Mobile Gaming HUD (Heads-Up Display)
interface MobileHUDProps {
  balance: number;
  activeBids: number;
  notifications: number;
  onBalanceClick: () => void;
  onBidsClick: () => void;
  onNotificationsClick: () => void;
}

export const MobileHUD: React.FC<MobileHUDProps> = ({
  balance,
  activeBids,
  notifications,
  onBalanceClick,
  onBidsClick,
  onNotificationsClick
}) => {
  return (
    <div
}
}
      className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3"
    >
      <div className="flex items-center justify-between">
        {/* Balance */}
        <TouchButton
          variant="fintech"
          onClick={onBalanceClick}
          className="flex-1 mr-2"
        >
          <div className="text-left">
            <div className="text-xs text-white/80">Balance</div>
            <div className="font-bold">₹{(balance / 100000).toFixed(1)}L</div>
          </div>
        </TouchButton>

        {/* Active Bids */}
        <TouchButton
          variant="gaming"
          onClick={onBidsClick}
          className="mx-2"
        >
          <div className="text-center">
            <div className="text-xs text-white/80">Active</div>
            <div className="font-bold">{activeBids}</div>
          </div>
        </TouchButton>

        {/* Notifications */}
        <TouchButton
          variant="saas"
          onClick={onNotificationsClick}
          className="ml-2"
        >
          <div className="text-center relative">
            <div className="text-xs text-white/80">Alerts</div>
            <div className="font-bold">{notifications}</div>
            {notifications > 0 && (
              <div
}
}
                className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
              />
            )}
          </div>
        </TouchButton>
      </div>
    </div>
  );
};

// Mobile Auction Feed with Infinite Scroll
interface MobileAuctionFeedProps {
  auctions: Array<{
    id: string;
    title: string;
    currentBid: number;
    timeLeft: number;
    image: string;
    bidders: number;
  }>;
  onLoadMore: () => void;
  hasMore: boolean;
}

export const MobileAuctionFeed: React.FC<MobileAuctionFeedProps> = ({
  auctions,
  onLoadMore,
  hasMore
}) => {
  const [loading, setLoading] = useState(false);

  const handleLoadMore = async () => {
    if (!loading && hasMore) {
      setLoading(true);
      await onLoadMore();
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {auctions.map((auction, index) => (
        <div
          key={auction.id}
}
}
}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <img
            src={auction.image}
            alt={auction.title}
            className="w-full h-48 object-cover"
          />

          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">{auction.title}</h3>

            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm text-gray-500">Current Bid</div>
                <div className="text-xl font-bold text-green-600">
                  ₹{(auction.currentBid / 100000).toFixed(1)}L
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-500">Time Left</div>
                <div className="text-lg font-bold text-red-600">
                  {Math.floor(auction.timeLeft / 60)}:{(auction.timeLeft % 60).toString().padStart(2, '0')}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{auction.bidders} bidders</span>
              <TouchButton variant="gaming" className="text-sm px-4 py-2">
                Bid Now
              </TouchButton>
            </div>
          </div>
        </div>
      ))}

      {hasMore && (
        <div className="text-center py-8">
          <TouchButton
            variant="saas"
            onClick={handleLoadMore}
            loading={loading}
          >
            {loading ? 'Loading...' : 'Load More Auctions'}
          </TouchButton>
        </div>
      )}
    </div>
  );
};

