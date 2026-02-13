import { Injectable, Logger } from '@nestjs/common';
import { Auction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface SearchFilters {
  query?: string; // General search query
  auctionTypes: { value: string; count: number }[];
  statuses: { value: string; count: number }[];
  category?: string | string[];
  sellerId?: string;
  priceMin?: number;
  priceMax?: number;
  location?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'relevance' | 'price' | 'date' | 'bids' | 'ending_soon';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  searchTime: number;
  facets?: {
    categories: { value: string; count: number }[];
    auctionTypes: { value: string; count: number }[];
    priceRanges: { range: string; count: number }[];
    locations: { value: string; count: number }[];
  };
}

export interface AdvancedSearchOptions {
  fuzzy?: boolean; // Fuzzy text matching
  boostRecent?: boolean; // Boost recent auctions
  boostEndingSoon?: boolean; // Boost auctions ending soon
  includeInactive?: boolean; // Include inactive auctions
  searchIn?: ('title' | 'description' | 'category' | 'seller')[]; // Fields to search in
  excludeIds?: string[]; // Exclude specific auction IDs
  mustHaveImage?: boolean; // Only auctions with images
  verifiedSellerOnly?: boolean; // Only verified sellers
}

@Injectable()
export class AdvancedSearchService {
  private readonly logger = new Logger(AdvancedSearchService.name);

  constructor(
    private prismaService: PrismaService,
  ) {}

  async searchAuctions(
    filters: SearchFilters,
    options: AdvancedSearchOptions = {}
  ): Promise<SearchResult<Auction>> {
    const startTime = Date.now();

    // Build where condition for Prisma
    const where: any = {};

    if (filters.query) {
      where.title = { contains: filters.query, mode: 'insensitive' };
    }

    if (filters.statuses?.length) {
      where.status = { in: filters.statuses.map(s => s.value) };
    }

    if (filters.sellerId) {
      where.sellerId = filters.sellerId;
    }

    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      where.startPrice = {};
      if (filters.priceMin !== undefined) where.startPrice.gte = filters.priceMin;
      if (filters.priceMax !== undefined) where.startPrice.lte = filters.priceMax;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    // Build orderBy for Prisma
    const orderBy: any = {};
    const sortBy = filters.sortBy || 'createdAt';
    orderBy[sortBy] = filters.sortOrder === 'desc' ? 'desc' : 'asc';

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    // Execute query with Prisma
    const [items, total] = await Promise.all([
      this.prismaService.auction.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prismaService.auction.count({ where }),
    ]);

    const searchTime = Date.now() - startTime;

    // Generate basic facets (simplified)
    const facets = {
      categories: [
        { value: 'Electronics', count: 25 },
        { value: 'Jewelry', count: 18 },
        { value: 'Art', count: 12 },
      ],
      auctionTypes: [
        { value: 'active', count: 15 },
        { value: 'scheduled', count: 10 },
      ],
      priceRanges: [
        { range: 'Under ₹1,000', count: 15 },
        { range: '₹1,000 - ₹10,000', count: 30 },
      ],
      locations: [
        { value: 'Mumbai', count: 20 },
        { value: 'Delhi', count: 18 },
      ],
    };

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      searchTime,
      facets,
    };
  }

  async searchUsers(
    query: string,
    filters: {
      role?: string;
      status?: string;
      verified?: boolean;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<SearchResult<any>> {
    const startTime = Date.now();

    // Build where clause
    const where: any = {};

    if (query) {
      where.OR = [
        { email: { contains: query, mode: 'insensitive' } },
        { name: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    // Execute search
    const [users, total] = await Promise.all([
      this.prismaService.user.findMany({
        where,
        skip: ((filters.page || 1) - 1) * (filters.limit || 20),
        take: filters.limit || 20,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          emailVerified: true,
          createdAt: true,
        },
      }),
      this.prismaService.user.count({ where }),
    ]);

    const searchTime = Date.now() - startTime;

    return {
      items: users,
      total,
      page: filters.page || 1,
      limit: filters.limit || 20,
      totalPages: Math.ceil(total / (filters.limit || 20)),
      searchTime,
    };
  }

  async getSuggestions(
    query: string,
    type: 'auction' | 'user' | 'category' = 'auction',
    limit: number = 10
  ): Promise<string[]> {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      switch (type) {
        case 'auction':
          // Get title suggestions
          const auctions = await this.prismaService.auction.findMany({
            where: {
              title: { startsWith: query, mode: 'insensitive' },
              status: { in: ['active', 'scheduled'] },
            },
            select: { title: true },
            take: limit,
            orderBy: { createdAt: 'desc' }, // Since we don't have totalBids, use createdAt
          });

          return auctions.map(a => a.title);

        case 'category':
          // Since Prisma doesn't have category field, return mock categories
          return ['Electronics', 'Jewelry', 'Art', 'Vehicles', 'Fashion'].filter(
            cat => cat.toLowerCase().startsWith(query.toLowerCase())
          ).slice(0, limit);

        case 'user':
          // Get user name suggestions
          const users = await this.prismaService.user.findMany({
            where: {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
              ],
            },
            select: { name: true, email: true },
            take: limit,
          });

          return users.map(u => u.name || u.email);

        default:
          return [];
      }
    } catch (error) {
      this.logger.error('Error getting suggestions:', error);
      return [];
    }
  }

  async getTrendingSearches(limit: number = 10): Promise<{ query: string; count: number }[]> {
    // In a real implementation, this would track search queries in a database
    // For now, return mock trending searches
    return [
      { query: 'iPhone', count: 1250 },
      { query: 'laptop', count: 890 },
      { query: 'watch', count: 650 },
      { query: 'camera', count: 430 },
      { query: 'jewelry', count: 380 },
      { query: 'car', count: 290 },
      { query: 'furniture', count: 240 },
      { query: 'art', count: 180 },
      { query: 'electronics', count: 150 },
      { query: 'antiques', count: 120 },
    ].slice(0, limit);
  }

  async getRelatedSearches(query: string, limit: number = 5): Promise<string[]> {
    // Simple implementation - in production, use ML/AI for better recommendations
    const relatedTerms: Record<string, string[]> = {
      'phone': ['mobile', 'iPhone', 'Samsung', 'Android', 'smartphone'],
      'laptop': ['computer', 'notebook', 'MacBook', 'Dell', 'HP'],
      'watch': ['timepiece', 'Rolex', 'Omega', 'Seiko', 'wristwatch'],
      'car': ['automobile', 'vehicle', 'BMW', 'Mercedes', 'Toyota'],
      'jewelry': ['necklace', 'ring', 'bracelet', 'earrings', 'diamond'],
    };

    const lowerQuery = query.toLowerCase();

    for (const [key, terms] of Object.entries(relatedTerms)) {
      if (lowerQuery.includes(key) || terms.some(term => lowerQuery.includes(term))) {
        return terms.filter(term => !lowerQuery.includes(term)).slice(0, limit);
      }
    }

    // Fallback to general related searches
    return ['popular', 'trending', 'new arrivals', 'ending soon', 'verified sellers'].slice(0, limit);
  }

  async getSearchAnalytics(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalSearches: number;
    popularQueries: { query: string; count: number }[];
    searchTrends: { date: string; searches: number }[];
    conversionRate: number;
    averageResults: number;
  }> {
    // Mock analytics data
    return {
      totalSearches: 15420,
      popularQueries: [
        { query: 'iPhone', count: 1250 },
        { query: 'laptop', count: 890 },
        { query: 'watch', count: 650 },
        { query: 'camera', count: 430 },
        { query: 'jewelry', count: 380 },
      ],
      searchTrends: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        searches: Math.floor(Math.random() * 500) + 200,
      })),
      conversionRate: 23.5, // percentage
      averageResults: 42.7,
    };
  }

  async getSavedSearches(userId: string): Promise<Array<{
    id: string;
    query: string;
    filters: SearchFilters;
    createdAt: Date;
    resultsCount: number;
  }>> {
    // Mock saved searches
    return [
      {
        id: 'search_001',
        query: 'iPhone',
        filters: {
          auctionTypes: [],
          statuses: [],
          category: 'Electronics'
        },
        createdAt: new Date(Date.now() - 3600000),
        resultsCount: 25,
      },
      {
        id: 'search_002',
        query: 'laptop',
        filters: {
          auctionTypes: [],
          statuses: [],
          priceMax: 50000
        },
        createdAt: new Date(Date.now() - 7200000),
        resultsCount: 18,
      },
    ];
  }

  async getSearchRecommendations(userId: string): Promise<string[]> {
    // Get user's search history and recommend similar searches
    const savedSearches = await this.getSavedSearches(userId);
    const categories = [...new Set(savedSearches.map(s => s.filters.category).filter(Boolean))];

    // Generate recommendations based on user's interests
    const recommendations: string[] = [];
    if (categories.includes('Electronics')) {
      recommendations.push('Latest smartphones', 'Gaming laptops', 'Smart watches');
    }
    if (categories.includes('Fashion')) {
      recommendations.push('Designer handbags', 'Luxury watches', 'Premium clothing');
    }

    return recommendations.slice(0, 5);
  }
}
