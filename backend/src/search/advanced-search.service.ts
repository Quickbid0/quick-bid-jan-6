import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Brackets } from 'typeorm';
import { Auction, AuctionType, AuctionStatus } from '../auctions/auction.entity';
import { PrismaService } from '../prisma/prisma.service';

export interface SearchFilters {
  query?: string; // General search query
  auctionType?: AuctionType | AuctionType[];
  status?: AuctionStatus | AuctionStatus[];
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
    auctionTypes: { value: AuctionType; count: number }[];
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
    @InjectRepository(Auction)
    private auctionRepository: Repository<Auction>,
    private prismaService: PrismaService,
  ) {}

  async searchAuctions(
    filters: SearchFilters,
    options: AdvancedSearchOptions = {}
  ): Promise<SearchResult<Auction>> {
    const startTime = Date.now();

    const queryBuilder = this.auctionRepository.createQueryBuilder('auction');

    // Apply filters
    this.applyFilters(queryBuilder, filters, options);

    // Apply search options
    this.applySearchOptions(queryBuilder, options);

    // Get total count before pagination
    const total = await queryBuilder.getCount();

    // Apply sorting
    this.applySorting(queryBuilder, filters);

    // Apply pagination
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100); // Max 100 per page
    queryBuilder.skip((page - 1) * limit).take(limit);

    // Execute query
    const items = await queryBuilder.getMany();

    // Calculate search time
    const searchTime = Date.now() - startTime;

    // Generate facets
    const facets = await this.generateFacets(filters);

    const totalPages = Math.ceil(total / limit);

    this.logger.log(`Search completed in ${searchTime}ms. Found ${total} results.`);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
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
          const auctions = await this.auctionRepository
            .createQueryBuilder('auction')
            .select('DISTINCT auction.title', 'title')
            .where('auction.title ILIKE :query', { query: `${query}%` })
            .andWhere('auction.status IN (:...statuses)', { statuses: ['active', 'scheduled'] })
            .orderBy('auction.totalBids', 'DESC')
            .limit(limit)
            .getRawMany();

          return auctions.map(a => a.title);

        case 'category':
          // Get category suggestions
          const categories = await this.auctionRepository
            .createQueryBuilder('auction')
            .select('DISTINCT auction.category', 'category')
            .where('auction.category ILIKE :query', { query: `${query}%` })
            .andWhere('auction.category IS NOT NULL')
            .orderBy('COUNT(*)', 'DESC')
            .groupBy('auction.category')
            .limit(limit)
            .getRawMany();

          return categories.map(c => c.category);

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

  private applyFilters(
    queryBuilder: SelectQueryBuilder<Auction>,
    filters: SearchFilters,
    options: AdvancedSearchOptions
  ): void {
    // Status filter
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      queryBuilder.andWhere('auction.status IN (:...statuses)', { statuses });
    } else if (!options.includeInactive) {
      // Default to active auctions only
      queryBuilder.andWhere('auction.status IN (:...activeStatuses)', {
        activeStatuses: ['active', 'scheduled']
      });
    }

    // Auction type filter
    if (filters.auctionType) {
      const types = Array.isArray(filters.auctionType) ? filters.auctionType : [filters.auctionType];
      queryBuilder.andWhere('auction.auctionType IN (:...types)', { types });
    }

    // Category filter
    if (filters.category) {
      const categories = Array.isArray(filters.category) ? filters.category : [filters.category];
      queryBuilder.andWhere('auction.category IN (:...categories)', { categories });
    }

    // Seller filter
    if (filters.sellerId) {
      queryBuilder.andWhere('auction.sellerId = :sellerId', { sellerId: filters.sellerId });
    }

    // Price range filter
    if (filters.priceMin !== undefined) {
      queryBuilder.andWhere('auction.currentPrice >= :priceMin', { priceMin: filters.priceMin });
    }
    if (filters.priceMax !== undefined) {
      queryBuilder.andWhere('auction.currentPrice <= :priceMax', { priceMax: filters.priceMax });
    }

    // Location filter
    if (filters.location) {
      queryBuilder.andWhere('auction.location ILIKE :location', { location: `%${filters.location}%` });
    }

    // Date range filter
    if (filters.dateFrom) {
      queryBuilder.andWhere('auction.createdAt >= :dateFrom', { dateFrom: filters.dateFrom });
    }
    if (filters.dateTo) {
      queryBuilder.andWhere('auction.createdAt <= :dateTo', { dateTo: filters.dateTo });
    }

    // Exclude specific IDs
    if (options.excludeIds && options.excludeIds.length > 0) {
      queryBuilder.andWhere('auction.id NOT IN (:...excludeIds)', { excludeIds: options.excludeIds });
    }

    // Image requirement
    if (options.mustHaveImage) {
      queryBuilder.andWhere('auction.images IS NOT NULL AND JSON_ARRAY_LENGTH(auction.images) > 0');
    }

    // Verified seller only
    if (options.verifiedSellerOnly) {
      queryBuilder.andWhere('auction.sellerInfo->>\'verified\' = :verified', { verified: 'true' });
    }

    // Text search
    if (filters.query) {
      this.applyTextSearch(queryBuilder, filters.query, options);
    }
  }

  private applyTextSearch(
    queryBuilder: SelectQueryBuilder<Auction>,
    query: string,
    options: AdvancedSearchOptions
  ): void {
    const searchFields = options.searchIn || ['title', 'description', 'category'];
    const searchConditions: string[] = [];
    const parameters: any = {};

    searchFields.forEach((field, index) => {
      if (options.fuzzy) {
        // Fuzzy search using ILIKE with wildcards
        searchConditions.push(`auction.${field} ILIKE :query${index}`);
        parameters[`query${index}`] = `%${query}%`;
      } else {
        // Exact phrase search
        searchConditions.push(`auction.${field} ILIKE :query${index}`);
        parameters[`query${index}`] = `%${query}%`;
      }
    });

    if (searchConditions.length > 0) {
      queryBuilder.andWhere(`(${searchConditions.join(' OR ')})`, parameters);
    }
  }

  private applySearchOptions(
    queryBuilder: SelectQueryBuilder<Auction>,
    options: AdvancedSearchOptions
  ): void {
    // Boost recent auctions
    if (options.boostRecent) {
      // Add a scoring mechanism for recent auctions
      queryBuilder.addSelect(
        'CASE WHEN auction.createdAt > :recentThreshold THEN 1.2 ELSE 1.0 END',
        'relevance_score'
      );
      queryBuilder.setParameter('recentThreshold', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    }

    // Boost auctions ending soon
    if (options.boostEndingSoon) {
      queryBuilder.addSelect(
        'CASE WHEN auction.endTime < :endingSoonThreshold THEN 1.3 ELSE 1.0 END',
        'urgency_score'
      );
      queryBuilder.setParameter('endingSoonThreshold', new Date(Date.now() + 24 * 60 * 60 * 1000));
    }
  }

  private applySorting(
    queryBuilder: SelectQueryBuilder<Auction>,
    filters: SearchFilters
  ): void {
    const { sortBy = 'relevance', sortOrder = 'desc' } = filters;

    switch (sortBy) {
      case 'relevance':
        // Complex relevance scoring
        queryBuilder.addSelect(
          '(auction.totalBids * 0.3 + ' +
          'CASE WHEN auction.endTime < :soon THEN 0.4 ELSE 0.1 END + ' +
          'CASE WHEN auction.createdAt > :recent THEN 0.2 ELSE 0.0 END)',
          'relevance_score'
        );
        queryBuilder.setParameter('soon', new Date(Date.now() + 24 * 60 * 60 * 1000));
        queryBuilder.setParameter('recent', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
        queryBuilder.orderBy('relevance_score', sortOrder.toUpperCase() as 'ASC' | 'DESC');
        break;

      case 'price':
        queryBuilder.orderBy('auction.currentPrice', sortOrder.toUpperCase() as 'ASC' | 'DESC');
        break;

      case 'date':
        queryBuilder.orderBy('auction.createdAt', sortOrder.toUpperCase() as 'ASC' | 'DESC');
        break;

      case 'bids':
        queryBuilder.orderBy('auction.totalBids', sortOrder.toUpperCase() as 'ASC' | 'DESC');
        break;

      case 'ending_soon':
        queryBuilder.orderBy('auction.endTime', 'ASC');
        break;

      default:
        queryBuilder.orderBy('auction.createdAt', 'DESC');
    }
  }

  private async generateFacets(filters: SearchFilters): Promise<SearchResult<Auction>['facets']> {
    const baseQuery = this.auctionRepository.createQueryBuilder('auction');

    // Apply same filters as main query
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      baseQuery.andWhere('auction.status IN (:...statuses)', { statuses });
    } else {
      baseQuery.andWhere('auction.status IN (:...activeStatuses)', {
        activeStatuses: ['active', 'scheduled']
      });
    }

    // Category facets
    const categoryFacets = await baseQuery
      .select('auction.category', 'value')
      .addSelect('COUNT(*)', 'count')
      .where('auction.category IS NOT NULL')
      .groupBy('auction.category')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // Auction type facets
    const typeFacets = await baseQuery
      .select('auction.auctionType', 'value')
      .addSelect('COUNT(*)', 'count')
      .groupBy('auction.auctionType')
      .orderBy('count', 'DESC')
      .getRawMany();

    // Price range facets
    const priceFacets = await this.auctionRepository
      .createQueryBuilder('auction')
      .select(
        'CASE ' +
        'WHEN auction.currentPrice < 1000 THEN \'Under ₹1,000\' ' +
        'WHEN auction.currentPrice < 10000 THEN \'₹1,000 - ₹10,000\' ' +
        'WHEN auction.currentPrice < 50000 THEN \'₹10,000 - ₹50,000\' ' +
        'WHEN auction.currentPrice < 100000 THEN \'₹50,000 - ₹1,00,000\' ' +
        'ELSE \'Over ₹1,00,000\' END',
        'range'
      )
      .addSelect('COUNT(*)', 'count')
      .where('auction.status IN (:...statuses)', { statuses: ['active', 'scheduled'] })
      .groupBy('range')
      .orderBy('count', 'DESC')
      .getRawMany();

    // Location facets
    const locationFacets = await baseQuery
      .select('auction.location', 'value')
      .addSelect('COUNT(*)', 'count')
      .where('auction.location IS NOT NULL')
      .groupBy('auction.location')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      categories: categoryFacets.map(f => ({ value: f.value, count: parseInt(f.count) })),
      auctionTypes: typeFacets.map(f => ({ value: f.value as AuctionType, count: parseInt(f.count) })),
      priceRanges: priceFacets.map(f => ({ range: f.range, count: parseInt(f.count) })),
      locations: locationFacets.map(f => ({ value: f.value, count: parseInt(f.count) })),
    };
  }

  // Advanced filtering methods
  async filterByMultipleCriteria(criteria: {
    auctionTypes?: AuctionType[];
    categories?: string[];
    priceRange?: { min: number; max: number };
    locations?: string[];
    sellerRatings?: { min: number; max: number };
    auctionStatus?: AuctionStatus[];
    dateRange?: { start: Date; end: Date };
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<SearchResult<Auction>> {
    const queryBuilder = this.auctionRepository.createQueryBuilder('auction');

    // Apply multiple criteria
    if (criteria.auctionTypes?.length) {
      queryBuilder.andWhere('auction.auctionType IN (:...types)', { types: criteria.auctionTypes });
    }

    if (criteria.categories?.length) {
      queryBuilder.andWhere('auction.category IN (:...categories)', { categories: criteria.categories });
    }

    if (criteria.priceRange) {
      queryBuilder.andWhere('auction.currentPrice BETWEEN :minPrice AND :maxPrice', {
        minPrice: criteria.priceRange.min,
        maxPrice: criteria.priceRange.max,
      });
    }

    if (criteria.locations?.length) {
      queryBuilder.andWhere('auction.location IN (:...locations)', { locations: criteria.locations });
    }

    if (criteria.auctionStatus?.length) {
      queryBuilder.andWhere('auction.status IN (:...statuses)', { statuses: criteria.auctionStatus });
    }

    if (criteria.dateRange) {
      queryBuilder.andWhere('auction.createdAt BETWEEN :startDate AND :endDate', {
        startDate: criteria.dateRange.start,
        endDate: criteria.dateRange.end,
      });
    }

    // Apply sorting
    const sortBy = criteria.sortBy || 'createdAt';
    const sortOrder = criteria.sortOrder || 'desc';
    queryBuilder.orderBy(`auction.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const page = criteria.page || 1;
    const limit = criteria.limit || 20;
    queryBuilder.skip((page - 1) * limit).take(limit);

    // Execute query
    const items = await queryBuilder.getMany();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      searchTime: 0,
    };
  }

  async saveSearchQuery(
    userId: string,
    query: string,
    filters: SearchFilters,
    resultsCount: number
  ): Promise<void> {
    // In a real implementation, save search queries to database for analytics
    this.logger.log(`Saved search query for user ${userId}: "${query}" (${resultsCount} results)`);
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
        filters: { category: 'Electronics' },
        createdAt: new Date(Date.now() - 3600000),
        resultsCount: 25,
      },
      {
        id: 'search_002',
        query: 'laptop',
        filters: { priceMax: 50000 },
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
