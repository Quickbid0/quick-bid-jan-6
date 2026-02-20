/**
 * Dashboard API Hooks
 * 
 * Custom hooks for fetching dashboard data from backend APIs
 * Replaces mock data with real API calls
 * 
 * Usage:
 * const { data, loading, error } = useBuyerDashboard(userId);
 */

import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface BuyerDashboardData {
  user: {
    id: string;
    name: string;
    walletBalance: number;
  };
  activeBids: Array<{
    id: string;
    title: string;
    currentBid: number;
    yourBid: number;
    status: 'winning' | 'outbid' | 'leading';
    timeRemaining: string;
    sellerRating: number;
    image: string;
  }>;
  wonAuctions: Array<{
    id: string;
    title: string;
    winAmount: number;
    paymentStatus: 'pending' | 'paid' | 'refunded';
    deliveryStatus: 'not_yet_shipped' | 'in_transit' | 'delivered';
    purchaseDate: string;
    image: string;
  }>;
  stats: {
    activeCount: number;
    wonCount: number;
    winRate: number;
  };
  recommendations: Array<{
    id: string;
    title: string;
    price: string;
    confidence: number;
    reason: string;
    image: string;
  }>;
  spending: {
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
    chartData: Array<{ day: string; amount: number }>;
  };
}

export interface SellerDashboardData {
  seller: {
    id: string;
    shopName: string;
    rating: number;
    responseTime: number;
    totalSales: number;
    goldBadge: boolean;
  };
  analytics: {
    monthlyRevenue: number;
    rating: number;
    responseTime: number;
    activeListings: number;
    newOrders: number;
    pendingShipments: number;
  };
  products: Array<{
    id: string;
    name: string;
    status: 'active' | 'draft' | 'archived';
    price: number;
    views: number;
    bids: number;
    endDate: string;
    image: string;
  }>;
  liveAuctions: Array<{
    id: string;
    title: string;
    currentBid: number;
    bids: number;
    views: number;
    timeRemaining: string;
    image: string;
  }>;
  feedback: Array<{
    id: string;
    rating: number;
    comment: string;
    customerName: string;
    product: string;
    date: string;
  }>;
  performance: {
    chartData: Array<{ day: string; revenue: number }>;
  };
}

export interface DealerDashboardData {
  dealer: {
    id: string;
    companyName: string;
    vehicleCount: number;
    monthlyRevenue: number;
    conversionRate: number;
  };
  inventory: {
    totalVehicles: number;
    activeAuctions: number;
    soldThisMonth: number;
    pendingApproval: number;
  };
  vehicles: Array<{
    id: string;
    year: number;
    make: string;
    model: string;
    mileage: number;
    price: number;
    location: string;
    bids: number;
    status: 'active' | 'sold' | 'pending';
    photos: string[];
    category: string;
  }>;
  commissions: {
    pending: number;
    pendingCount: number;
    paid: number;
    paidCount: number;
    chartData: Array<{ month: string; amount: number }>;
  };
  categoryPerformance: Array<{
    category: string;
    views: number;
    conversions: number;
    revenue: number;
  }>;
}

export interface AdminDashboardData {
  alerts: Array<{
    id: string;
    type: 'dispute' | 'fraud' | 'compliance';
    severity: 'critical' | 'high' | 'medium';
    title: string;
    description: string;
    timestamp: string;
    action: string;
  }>;
  systemHealth: {
    apiStatus: 'healthy' | 'degraded' | 'down';
    dbStatus: 'healthy' | 'degraded' | 'down';
    paymentStatus: 'healthy' | 'degraded' | 'down';
    storageStatus: 'healthy' | 'degraded' | 'down';
    lastChecked: string;
  };
  businessMetrics: {
    gmvToday: number;
    activeAuctions: number;
    completedToday: number;
    totalUsers: number;
    chartData: Array<{ time: string; gmv: number }>;
  };
  pendingApprovals: Array<{
    id: string;
    type: 'seller_signup' | 'product_listing' | 'store_verification';
    itemName: string;
    submittedBy: string;
    submittedDate: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  disputes: Array<{
    id: string;
    status: 'open' | 'resolved';
    buyerName: string;
    sellerName: string;
    amount: number;
    createdDate: string;
    resolvedDate?: string;
  }>;
}

export interface APIResponse<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void> | undefined;
}

// ============================================================================
// API CLIENT
// ============================================================================

class APIClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = (typeof process !== 'undefined' ? process.env.REACT_APP_API_URL : undefined) || 'http://localhost:3001/api', timeout: number = 10000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: object): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
}

const apiClient = new APIClient();

// ============================================================================
// BUYER DASHBOARD HOOK
// ============================================================================

export function useBuyerDashboard(userId: string): APIResponse<BuyerDashboardData> {
  const [data, setData] = useState<BuyerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const dashboardData = await apiClient.get<BuyerDashboardData>(
        `/buyers/${userId}/dashboard`
      );

      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      console.error('Error fetching buyer dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// ============================================================================
// SELLER DASHBOARD HOOK
// ============================================================================

export function useSellerDashboard(userId: string): APIResponse<SellerDashboardData> {
  const [data, setData] = useState<SellerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const dashboardData = await apiClient.get<SellerDashboardData>(
        `/sellers/${userId}/dashboard`
      );

      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      console.error('Error fetching seller dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// ============================================================================
// DEALER DASHBOARD HOOK
// ============================================================================

export function useDealerDashboard(userId: string): APIResponse<DealerDashboardData> {
  const [data, setData] = useState<DealerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const dashboardData = await apiClient.get<DealerDashboardData>(
        `/dealers/${userId}/dashboard`
      );

      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      console.error('Error fetching dealer dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// ============================================================================
// ADMIN DASHBOARD HOOK
// ============================================================================

export function useAdminDashboard(adminId: string): APIResponse<AdminDashboardData> {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const dashboardData = await apiClient.get<AdminDashboardData>(
        `/admin/${adminId}/dashboard`
      );

      setData(dashboardData);

      // Poll every 30 seconds for alerts
      const interval = setInterval(() => {
        apiClient.get<AdminDashboardData>(`/admin/${adminId}/dashboard`)
          .then(updated => setData(updated))
          .catch(err => console.error('Error polling admin dashboard:', err));
      }, 30000);

      return () => clearInterval(interval);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      console.error('Error fetching admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [adminId]);

  useEffect(() => {
    if (adminId) {
      const cleanup = fetchData() as any;
      return cleanup;
    }
  }, [adminId, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// ============================================================================
// GENERIC MUTATION HOOKS
// ============================================================================

export function useMutation<TData, TError = Error>(
  fn: () => Promise<TData>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<TError | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      return await fn();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error as TError);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fn]);

  return { execute, loading, error };
}

// ============================================================================
// SPECIFIC ACTION MUTATIONS
// ============================================================================

// Buyer actions
export function usePlaceBid(bidderId: string, auctionId: string) {
  return useMutation(() =>
    apiClient.post(`/auctions/${auctionId}/bids`, {
      bidderId,
      amount: 0, // Set by component
    })
  );
}

// Seller actions
export function useAddProduct(sellerId: string) {
  return useMutation(() =>
    apiClient.post(`/sellers/${sellerId}/products`, {
      // Product data provided by component
    })
  );
}

// Dealer actions
export function useAddVehicle(dealerId: string) {
  return useMutation(() =>
    apiClient.post(`/dealers/${dealerId}/vehicles`, {
      // Vehicle data provided by component
    })
  );
}

// Admin actions
export function useResolveAlert(adminId: string, alertId: string) {
  return useMutation(() =>
    apiClient.post(`/admin/${adminId}/alerts/${alertId}/resolve`, {})
  );
}

export function useApproveItem(adminId: string, itemId: string) {
  return useMutation(() =>
    apiClient.post(`/admin/${adminId}/approvals/${itemId}/approve`, {})
  );
}

// ============================================================================
// EXPORT API CLIENT FOR DIRECT USE
// ============================================================================

export { apiClient };
export default apiClient;
