// src/utils/analytics.ts
// import { init, track, identify, reset } from '@amplitude/analytics-browser';

// Mock analytics functions for development
const mockInit = () => {};
const mockTrack = () => {};
const mockIdentify = () => {};
const mockReset = () => {};

// Initialize Amplitude Analytics
export const initAnalytics = () => {
  if (import.meta.env.PROD && import.meta.env.VITE_AMPLITUDE_API_KEY) {
    mockInit(import.meta.env.VITE_AMPLITUDE_API_KEY, {
      defaultTracking: {
        sessions: true,
        pageViews: true,
        formInteractions: true,
        fileDownloads: true,
      },
    });
  }
};

// Track custom events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (import.meta.env.PROD) {
    mockTrack(eventName, properties);
  }
};

// Identify user
export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  if (import.meta.env.PROD) {
    mockIdentify(userId, traits);
  }
};

// Reset user identity
export const resetUser = () => {
  if (import.meta.env.PROD) {
    mockReset();
  }
};

// Auction-specific tracking
export const trackAuctionView = (auctionId: string, auctionData: any) => {
  trackEvent('auction_view', {
    auction_id: auctionId,
    auction_type: auctionData.auction_type,
    category: auctionData.category,
    current_price: auctionData.current_price,
    time_left: auctionData.end_date ? new Date(auctionData.end_date).getTime() - Date.now() : null,
  });
};

export const trackBidPlaced = (auctionId: string, bidAmount: number, bidType: string) => {
  trackEvent('bid_placed', {
    auction_id: auctionId,
    bid_amount: bidAmount,
    bid_type: bidType,
  });
};

export const trackAuctionWon = (auctionId: string, finalPrice: number) => {
  trackEvent('auction_won', {
    auction_id: auctionId,
    final_price: finalPrice,
  });
};

export const trackPaymentCompleted = (auctionId: string, amount: number, method: string) => {
  trackEvent('payment_completed', {
    auction_id: auctionId,
    amount,
    payment_method: method,
  });
};

// User engagement tracking
export const trackUserRegistration = (userType: string, source?: string) => {
  trackEvent('user_registration', {
    user_type: userType,
    source: source || 'direct',
  });
};

export const trackUserLogin = (userType: string, method: string) => {
  trackEvent('user_login', {
    user_type: userType,
    login_method: method,
  });
};

// Search and navigation tracking
export const trackSearchPerformed = (query: string, category?: string, resultsCount?: number) => {
  trackEvent('search_performed', {
    query,
    category,
    results_count: resultsCount,
  });
};

export const trackFilterApplied = (filterType: string, filterValue: string) => {
  trackEvent('filter_applied', {
    filter_type: filterType,
    filter_value: filterValue,
  });
};

// Error tracking
export const trackError = (errorType: string, errorMessage: string, context?: Record<string, any>) => {
  trackEvent('error_occurred', {
    error_type: errorType,
    error_message: errorMessage,
    ...context,
  });
};

// Performance tracking
export const trackPerformanceMetric = (metricName: string, value: number, unit?: string) => {
  trackEvent('performance_metric', {
    metric_name: metricName,
    value,
    unit: unit || 'ms',
  });
};
