"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AdvancedSearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedSearchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdvancedSearchService = AdvancedSearchService_1 = class AdvancedSearchService {
    constructor(prismaService) {
        this.prismaService = prismaService;
        this.logger = new common_1.Logger(AdvancedSearchService_1.name);
    }
    async searchAuctions(filters, options = {}) {
        const startTime = Date.now();
        const where = {};
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
            if (filters.priceMin !== undefined)
                where.startPrice.gte = filters.priceMin;
            if (filters.priceMax !== undefined)
                where.startPrice.lte = filters.priceMax;
        }
        if (filters.dateFrom || filters.dateTo) {
            where.createdAt = {};
            if (filters.dateFrom)
                where.createdAt.gte = filters.dateFrom;
            if (filters.dateTo)
                where.createdAt.lte = filters.dateTo;
        }
        const orderBy = {};
        const sortBy = filters.sortBy || 'createdAt';
        orderBy[sortBy] = filters.sortOrder === 'desc' ? 'desc' : 'asc';
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;
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
    async searchUsers(query, filters = {}) {
        const startTime = Date.now();
        const where = {};
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
    async getSuggestions(query, type = 'auction', limit = 10) {
        if (!query || query.length < 2) {
            return [];
        }
        try {
            switch (type) {
                case 'auction':
                    const auctions = await this.prismaService.auction.findMany({
                        where: {
                            title: { startsWith: query, mode: 'insensitive' },
                            status: { in: ['active', 'scheduled'] },
                        },
                        select: { title: true },
                        take: limit,
                        orderBy: { createdAt: 'desc' },
                    });
                    return auctions.map(a => a.title);
                case 'category':
                    return ['Electronics', 'Jewelry', 'Art', 'Vehicles', 'Fashion'].filter(cat => cat.toLowerCase().startsWith(query.toLowerCase())).slice(0, limit);
                case 'user':
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
        }
        catch (error) {
            this.logger.error('Error getting suggestions:', error);
            return [];
        }
    }
    async getTrendingSearches(limit = 10) {
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
    async getRelatedSearches(query, limit = 5) {
        const relatedTerms = {
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
        return ['popular', 'trending', 'new arrivals', 'ending soon', 'verified sellers'].slice(0, limit);
    }
    async getSearchAnalytics(startDate, endDate) {
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
            conversionRate: 23.5,
            averageResults: 42.7,
        };
    }
    async getSavedSearches(userId) {
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
    async getSearchRecommendations(userId) {
        const savedSearches = await this.getSavedSearches(userId);
        const categories = [...new Set(savedSearches.map(s => s.filters.category).filter(Boolean))];
        const recommendations = [];
        if (categories.includes('Electronics')) {
            recommendations.push('Latest smartphones', 'Gaming laptops', 'Smart watches');
        }
        if (categories.includes('Fashion')) {
            recommendations.push('Designer handbags', 'Luxury watches', 'Premium clothing');
        }
        return recommendations.slice(0, 5);
    }
};
exports.AdvancedSearchService = AdvancedSearchService;
exports.AdvancedSearchService = AdvancedSearchService = AdvancedSearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdvancedSearchService);
//# sourceMappingURL=advanced-search.service.js.map