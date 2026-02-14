import { Auction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export interface SearchFilters {
    query?: string;
    auctionTypes: {
        value: string;
        count: number;
    }[];
    statuses: {
        value: string;
        count: number;
    }[];
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
        categories: {
            value: string;
            count: number;
        }[];
        auctionTypes: {
            value: string;
            count: number;
        }[];
        priceRanges: {
            range: string;
            count: number;
        }[];
        locations: {
            value: string;
            count: number;
        }[];
    };
}
export interface AdvancedSearchOptions {
    fuzzy?: boolean;
    boostRecent?: boolean;
    boostEndingSoon?: boolean;
    includeInactive?: boolean;
    searchIn?: ('title' | 'description' | 'category' | 'seller')[];
    excludeIds?: string[];
    mustHaveImage?: boolean;
    verifiedSellerOnly?: boolean;
}
export declare class AdvancedSearchService {
    private prismaService;
    private readonly logger;
    constructor(prismaService: PrismaService);
    searchAuctions(filters: SearchFilters, options?: AdvancedSearchOptions): Promise<SearchResult<Auction>>;
    searchUsers(query: string, filters?: {
        role?: string;
        status?: string;
        verified?: boolean;
        page?: number;
        limit?: number;
    }): Promise<SearchResult<any>>;
    getSuggestions(query: string, type?: 'auction' | 'user' | 'category', limit?: number): Promise<string[]>;
    getTrendingSearches(limit?: number): Promise<{
        query: string;
        count: number;
    }[]>;
    getRelatedSearches(query: string, limit?: number): Promise<string[]>;
    getSearchAnalytics(startDate: Date, endDate: Date): Promise<{
        totalSearches: number;
        popularQueries: {
            query: string;
            count: number;
        }[];
        searchTrends: {
            date: string;
            searches: number;
        }[];
        conversionRate: number;
        averageResults: number;
    }>;
    getSavedSearches(userId: string): Promise<Array<{
        id: string;
        query: string;
        filters: SearchFilters;
        createdAt: Date;
        resultsCount: number;
    }>>;
    getSearchRecommendations(userId: string): Promise<string[]>;
}
