import { supabase } from '../config/supabaseClient';

export interface UserAnalytics {
  pageViews: number;
  sessionDuration: number;
  productsViewed: string[];
  searchesPerformed: string[];
  categoriesBrowsed: string[];
  totalBids: number;
  wonAuctions: number;
  averageBidAmount: number;
  preferredCategories: string[];
}

export interface PlatformAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  totalAuctions: number;
  conversionRate: number;
  averageSessionDuration: number;
  topCategories: { category: string; count: number }[];
  revenueByCategory: { category: string; revenue: number }[];
}

class AnalyticsService {
  private hasAnalyticsConsent(): boolean {
    try {
      const raw = localStorage.getItem('qm-consent-v1');
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return !!parsed.analytics;
    } catch {
      return false;
    }
  }
  // Track user page view
  async trackPageView(userId: string, page: string, productId?: string): Promise<void> {
    if (!this.hasAnalyticsConsent()) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Update or create user analytics for today
      const { data: existing } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (existing) {
        const updatedViews = [...(existing.products_viewed || [])];
        if (productId && !updatedViews.includes(productId)) {
          updatedViews.push(productId);
        }

        await supabase
          .from('user_analytics')
          .update({
            page_views: existing.page_views + 1,
            products_viewed: updatedViews,
            last_active: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('user_analytics')
          .insert([{
            user_id: userId,
            page_views: 1,
            products_viewed: productId ? [productId] : [],
            date: today,
            last_active: new Date().toISOString()
          }]);
      }

      // Update product view count if viewing a product
      if (productId) {
        await supabase.rpc('increment_view_count', { product_id: productId });
      }
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  // Track search query
  async trackSearch(userId: string, query: string, resultsCount: number): Promise<void> {
    if (!this.hasAnalyticsConsent()) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: existing } = await supabase
        .from('user_analytics')
        .select('searches_performed')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      const searches = existing?.searches_performed || [];
      searches.push(query);

      await supabase
        .from('user_analytics')
        .upsert({
          user_id: userId,
          date: today,
          searches_performed: searches
        });
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }

  // Get user analytics
  async getUserAnalytics(userId: string, days: number = 30): Promise<UserAnalytics> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: analytics } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0]);

      const { data: bids } = await supabase
        .from('bids')
        .select('amount, status')
        .eq('user_id', userId);

      const totalPageViews = (analytics ?? []).reduce((sum, a) => sum + (a.page_views || 0), 0);
      const allProductsViewed = (analytics ?? []).flatMap(a => a.products_viewed || []);
      const allSearches = (analytics ?? []).flatMap(a => a.searches_performed || []);
      
      const wonBids = (bids ?? []).filter(b => b.status === 'won');
      const totalBids = (bids ?? []).length;
      const avgBidAmount = totalBids > 0 ? (bids ?? []).reduce((sum, b) => sum + (b.amount || 0), 0) / totalBids : 0;

      return {
        pageViews: totalPageViews,
        sessionDuration: 0, // Calculate from session data
        productsViewed: [...new Set(allProductsViewed)],
        searchesPerformed: allSearches,
        categoriesBrowsed: [],
        totalBids,
        wonAuctions: wonBids.length,
        averageBidAmount: avgBidAmount,
        preferredCategories: []
      };
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      return {
        pageViews: 0,
        sessionDuration: 0,
        productsViewed: [],
        searchesPerformed: [],
        categoriesBrowsed: [],
        totalBids: 0,
        wonAuctions: 0,
        averageBidAmount: 0,
        preferredCategories: []
      };
    }
  }

  // Get platform analytics
  async getPlatformAnalytics(): Promise<PlatformAnalytics> {
    try {
      const [usersData, auctionsData, bidsData, revenueData] = await Promise.all([
        supabase.from('profiles').select('created_at', { count: 'exact' }),
        supabase.from('products').select('category', { count: 'exact' }),
        supabase.from('bids').select('id', { count: 'exact' }),
        supabase.from('products').select('final_price, category').not('final_price', 'is', null)
      ]);

      const totalUsers = usersData.count || 0;
      const totalAuctions = auctionsData.count || 0;
      const totalBids = bidsData.count || 0;
      const totalRevenue = revenueData.data?.reduce((sum, item) => sum + (item.final_price || 0), 0) || 0;

      // Calculate category statistics
      const categoryStats = new Map<string, number>();
      const categoryRevenue = new Map<string, number>();

      auctionsData.data?.forEach(auction => {
        const category = auction.category || 'Other';
        categoryStats.set(category, (categoryStats.get(category) || 0) + 1);
      });

      revenueData.data?.forEach(item => {
        const category = item.category || 'Other';
        categoryRevenue.set(category, (categoryRevenue.get(category) || 0) + (item.final_price || 0));
      });

      return {
        totalUsers,
        activeUsers: Math.floor(totalUsers * 0.3), // Estimate 30% active
        totalRevenue,
        totalAuctions,
        conversionRate: totalAuctions > 0 ? (totalBids / totalAuctions) * 100 : 0,
        averageSessionDuration: 24.5, // Mock data
        topCategories: Array.from(categoryStats.entries())
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
        revenueByCategory: Array.from(categoryRevenue.entries())
          .map(([category, revenue]) => ({ category, revenue }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)
      };
    } catch (error) {
      console.error('Error fetching platform analytics:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalRevenue: 0,
        totalAuctions: 0,
        conversionRate: 0,
        averageSessionDuration: 0,
        topCategories: [],
        revenueByCategory: []
      };
    }
  }

  // Track bid placement
  async trackBidPlacement(userId: string, productId: string, amount: number): Promise<void> {
    if (!this.hasAnalyticsConsent()) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      
      await supabase
        .from('user_analytics')
        .upsert({
          user_id: userId,
          date: today,
          total_bids: 1 // This would be incremented in a real implementation
        });
    } catch (error) {
      console.error('Error tracking bid placement:', error);
    }
  }

  // Generate analytics report
  async generateReport(type: 'daily' | 'weekly' | 'monthly', startDate: Date, endDate: Date): Promise<any> {
    try {
      const { data: reportData } = await supabase
        .from('user_analytics')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      return {
        period: type,
        startDate,
        endDate,
        totalPageViews: reportData?.reduce((sum, d) => sum + d.page_views, 0) || 0,
        uniqueUsers: new Set(reportData?.map(d => d.user_id)).size || 0,
        data: reportData
      };
    } catch (error) {
      console.error('Error generating report:', error);
      return null;
    }
  }
}

export const analyticsService = new AnalyticsService();