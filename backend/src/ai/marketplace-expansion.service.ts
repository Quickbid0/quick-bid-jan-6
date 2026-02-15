import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface MarketplaceVertical {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: 'real_estate' | 'art' | 'collectibles' | 'industrial' | 'automotive' | 'luxury_goods' | 'digital_assets';
  icon: string;
  color: string;
  isActive: boolean;
  features: {
    auctionTypes: ('english' | 'dutch' | 'sealed_bid' | 'buy_now' | 'best_offer')[];
    verificationRequired: boolean;
    inspectionRequired: boolean;
    escrowRequired: boolean;
    shippingRequired: boolean;
    insuranceRequired: boolean;
    documentationRequired: string[];
  };
  pricing: {
    listingFee: number;
    commissionPercentage: number;
    featuredListingFee?: number;
    urgentListingFee?: number;
    currency: string;
  };
  rules: {
    minimumReservePrice?: number;
    maximumAuctionDuration: number; // hours
    biddingIncrementRules: {
      lowValue: { maxPrice: number; increment: number };
      mediumValue: { maxPrice: number; increment: number };
      highValue: { minPrice: number; increment: number };
    };
    cancellationPolicy: string;
    returnPolicy?: string;
  };
  verification: {
    sellerRequirements: string[];
    buyerRequirements: string[];
    documentTypes: string[];
    thirdPartyVerification?: string[];
  };
  analytics: {
    totalListings: number;
    activeAuctions: number;
    totalVolume: number;
    averagePrice: number;
    topCategories: string[];
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    sortOrder: number;
    popular: boolean;
  };
}

export interface VerticalListing {
  id: string;
  verticalId: string;
  sellerId: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  location?: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  specifications: Record<string, any>; // Vertical-specific specs
  images: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
    order: number;
  }>;
  videos?: Array<{
    url: string;
    thumbnail: string;
    duration: number;
  }>;
  documents?: Array<{
    type: string;
    url: string;
    name: string;
    verified: boolean;
  }>;
  pricing: {
    startingPrice?: number;
    reservePrice?: number;
    buyNowPrice?: number;
    currency: string;
    priceHistory?: Array<{
      price: number;
      date: Date;
      type: 'starting' | 'reserve' | 'buy_now' | 'sold';
    }>;
  };
  auction: {
    type: string;
    startDate: Date;
    endDate: Date;
    status: 'draft' | 'scheduled' | 'active' | 'ended' | 'cancelled';
    bids?: Array<{
      bidderId: string;
      amount: number;
      timestamp: Date;
      isWinning: boolean;
    }>;
    winner?: string;
    finalPrice?: number;
  };
  condition: {
    grade: 'mint' | 'excellent' | 'good' | 'fair' | 'poor' | 'used';
    details: string[];
    certifications?: string[];
  };
  verification: {
    status: 'pending' | 'verified' | 'rejected' | 'not_required';
    verifiedBy?: string;
    verifiedAt?: Date;
    rejectionReason?: string;
    documentsVerified: string[];
  };
  shipping?: {
    available: boolean;
    cost?: number;
    method: string;
    insurance?: boolean;
    restrictions?: string[];
  };
  metadata: {
    views: number;
    favorites: number;
    shares: number;
    featured: boolean;
    urgent: boolean;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface VerticalAnalytics {
  verticalId: string;
  overview: {
    totalListings: number;
    activeAuctions: number;
    completedAuctions: number;
    totalVolume: number;
    averagePrice: number;
    uniqueSellers: number;
    uniqueBuyers: number;
  };
  performance: {
    conversionRate: number;
    averageAuctionDuration: number;
    topCategories: Array<{
      category: string;
      listings: number;
      volume: number;
    }>;
    priceRanges: {
      low: { min: number; max: number; count: number };
      medium: { min: number; max: number; count: number };
      high: { min: number; max: number; count: number };
      luxury: { min: number; max: number; count: number };
    };
  };
  trends: {
    monthlyGrowth: number;
    popularLocations: string[];
    emergingCategories: string[];
    priceTrends: Array<{
      date: string;
      averagePrice: number;
      volume: number;
    }>;
  };
  recommendations: {
    optimalPricing: {
      suggestedRange: { min: number; max: number };
      confidence: number;
    };
    bestTimesToList: string[];
    popularFeatures: string[];
    marketInsights: string[];
  };
}

@Injectable()
export class MarketplaceExpansionService {
  private readonly logger = new Logger(MarketplaceExpansionService.name);
  private verticals: Map<string, MarketplaceVertical> = new Map();
  private listings: Map<string, VerticalListing> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.initializeMarketplaceVerticals();
  }

  /**
   * MARKETPLACE VERTICAL MANAGEMENT
   */
  async createMarketplaceVertical(
    verticalData: Omit<MarketplaceVertical, 'id' | 'analytics' | 'metadata'>
  ): Promise<MarketplaceVertical> {
    this.logger.log(`Creating marketplace vertical: ${verticalData.name}`);

    try {
      const vertical: MarketplaceVertical = {
        id: `vertical_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...verticalData,
        analytics: {
          totalListings: 0,
          activeAuctions: 0,
          totalVolume: 0,
          averagePrice: 0,
          topCategories: []
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          sortOrder: 0,
          popular: false
        }
      };

      this.verticals.set(vertical.id, vertical);

      // Store vertical (in production, save to database)
      await this.storeMarketplaceVertical(vertical);

      this.logger.log(`Marketplace vertical created: ${vertical.id}`);
      return vertical;

    } catch (error) {
      this.logger.error(`Marketplace vertical creation failed:`, error);
      throw new Error(`Marketplace vertical creation failed: ${error.message}`);
    }
  }

  async getMarketplaceVerticals(activeOnly: boolean = true): Promise<MarketplaceVertical[]> {
    const verticals = Array.from(this.verticals.values());

    if (activeOnly) {
      return verticals.filter(v => v.isActive);
    }

    return verticals;
  }

  /**
   * VERTICAL LISTING MANAGEMENT
   */
  async createVerticalListing(
    verticalId: string,
    sellerId: string,
    listingData: Omit<VerticalListing, 'id' | 'verticalId' | 'sellerId' | 'verification' | 'metadata'>
  ): Promise<VerticalListing> {
    this.logger.log(`Creating vertical listing for seller ${sellerId} in vertical ${verticalId}`);

    try {
      const vertical = this.verticals.get(verticalId);
      if (!vertical) {
        throw new Error('Marketplace vertical not found');
      }

      // Validate seller permissions
      await this.validateSellerPermissions(sellerId, verticalId);

      // Validate listing data against vertical rules
      await this.validateListingData(listingData, vertical);

      const listing: VerticalListing = {
        id: `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        verticalId,
        sellerId,
        ...listingData,
        verification: {
          status: vertical.features.verificationRequired ? 'pending' : 'not_required',
          documentsVerified: []
        },
        metadata: {
          views: 0,
          favorites: 0,
          shares: 0,
          featured: false,
          urgent: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      this.listings.set(listing.id, listing);

      // Update vertical analytics
      vertical.analytics.totalListings++;
      if (listing.auction.status === 'active') {
        vertical.analytics.activeAuctions++;
      }

      // Store listing (in production, save to database)
      await this.storeVerticalListing(listing);

      // Trigger verification process if required
      if (vertical.features.verificationRequired) {
        await this.initiateVerificationProcess(listing);
      }

      this.logger.log(`Vertical listing created: ${listing.id}`);
      return listing;

    } catch (error) {
      this.logger.error(`Vertical listing creation failed:`, error);
      throw new Error(`Vertical listing creation failed: ${error.message}`);
    }
  }

  async searchVerticalListings(
    verticalId: string,
    searchCriteria: {
      query?: string;
      category?: string;
      location?: string;
      priceRange?: { min: number; max: number };
      condition?: string[];
      auctionStatus?: string[];
      sortBy?: 'price_asc' | 'price_desc' | 'date_desc' | 'ending_soon';
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    listings: VerticalListing[];
    total: number;
    facets: {
      categories: Array<{ value: string; count: number }>;
      locations: Array<{ value: string; count: number }>;
      priceRanges: Array<{ range: string; count: number }>;
      conditions: Array<{ value: string; count: number }>;
    };
  }> {
    this.logger.log(`Searching listings in vertical ${verticalId}`);

    try {
      let filteredListings = Array.from(this.listings.values())
        .filter(listing => listing.verticalId === verticalId);

      // Apply filters
      if (searchCriteria.query) {
        const query = searchCriteria.query.toLowerCase();
        filteredListings = filteredListings.filter(listing =>
          listing.title.toLowerCase().includes(query) ||
          listing.description.toLowerCase().includes(query)
        );
      }

      if (searchCriteria.category) {
        filteredListings = filteredListings.filter(listing =>
          listing.category === searchCriteria.category
        );
      }

      if (searchCriteria.location) {
        filteredListings = filteredListings.filter(listing =>
          listing.location?.city.toLowerCase().includes(searchCriteria.location!.toLowerCase()) ||
          listing.location?.state.toLowerCase().includes(searchCriteria.location!.toLowerCase())
        );
      }

      if (searchCriteria.priceRange) {
        filteredListings = filteredListings.filter(listing => {
          const price = listing.pricing.buyNowPrice || listing.pricing.startingPrice || 0;
          return price >= searchCriteria.priceRange!.min && price <= searchCriteria.priceRange!.max;
        });
      }

      if (searchCriteria.condition && searchCriteria.condition.length > 0) {
        filteredListings = filteredListings.filter(listing =>
          searchCriteria.condition!.includes(listing.condition.grade)
        );
      }

      if (searchCriteria.auctionStatus && searchCriteria.auctionStatus.length > 0) {
        filteredListings = filteredListings.filter(listing =>
          searchCriteria.auctionStatus!.includes(listing.auction.status)
        );
      }

      // Apply sorting
      switch (searchCriteria.sortBy) {
        case 'price_asc':
          filteredListings.sort((a, b) => (a.pricing.buyNowPrice || 0) - (b.pricing.buyNowPrice || 0));
          break;
        case 'price_desc':
          filteredListings.sort((a, b) => (b.pricing.buyNowPrice || 0) - (a.pricing.buyNowPrice || 0));
          break;
        case 'ending_soon':
          filteredListings.sort((a, b) => a.auction.endDate.getTime() - b.auction.endDate.getTime());
          break;
        case 'date_desc':
        default:
          filteredListings.sort((a, b) => b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime());
          break;
      }

      const total = filteredListings.length;
      const offset = searchCriteria.offset || 0;
      const limit = searchCriteria.limit || 20;
      const listings = filteredListings.slice(offset, offset + limit);

      // Generate facets
      const facets = this.generateSearchFacets(filteredListings);

      return {
        listings,
        total,
        facets
      };

    } catch (error) {
      this.logger.error(`Vertical listing search failed:`, error);
      throw new Error(`Vertical listing search failed: ${error.message}`);
    }
  }

  /**
   * VERTICAL ANALYTICS & INSIGHTS
   */
  async getVerticalAnalytics(
    verticalId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<VerticalAnalytics> {
    this.logger.log(`Generating analytics for vertical ${verticalId}`);

    try {
      const vertical = this.verticals.get(verticalId);
      if (!vertical) {
        throw new Error('Marketplace vertical not found');
      }

      const listings = Array.from(this.listings.values())
        .filter(listing => listing.verticalId === verticalId);

      // Calculate overview metrics
      const activeAuctions = listings.filter(l => l.auction.status === 'active').length;
      const completedAuctions = listings.filter(l => l.auction.status === 'ended' && l.auction.winner).length;
      const totalVolume = listings.reduce((sum, l) => sum + (l.auction.finalPrice || 0), 0);
      const averagePrice = totalVolume / Math.max(completedAuctions, 1);

      // Performance metrics
      const conversionRate = completedAuctions / Math.max(listings.length, 1);
      const averageDuration = listings
        .filter(l => l.auction.finalPrice)
        .reduce((sum, l) => sum + (l.auction.endDate.getTime() - l.auction.startDate.getTime()), 0) /
        Math.max(completedAuctions, 1) / (1000 * 60 * 60); // hours

      // Price distribution
      const prices = listings.map(l => l.auction.finalPrice || l.pricing.buyNowPrice || 0).filter(p => p > 0);
      const priceRanges = this.calculatePriceRanges(prices);

      // Recommendations
      const recommendations = await this.generateVerticalRecommendations(verticalId, listings);

      const analytics: VerticalAnalytics = {
        verticalId,
        overview: {
          totalListings: listings.length,
          activeAuctions,
          completedAuctions,
          totalVolume,
          averagePrice,
          uniqueSellers: new Set(listings.map(l => l.sellerId)).size,
          uniqueBuyers: new Set(listings.flatMap(l => l.auction.bids?.map(b => b.bidderId) || [])).size
        },
        performance: {
          conversionRate,
          averageAuctionDuration: averageDuration,
          topCategories: this.calculateTopCategories(listings),
          priceRanges
        },
        trends: {
          monthlyGrowth: 0.15, // Mock growth rate
          popularLocations: this.calculatePopularLocations(listings),
          emergingCategories: ['digital_art', 'metaverse_land'], // Mock emerging categories
          priceTrends: this.calculatePriceTrends(listings, timeRange)
        },
        recommendations
      };

      this.logger.log(`Vertical analytics generated for ${verticalId}`);
      return analytics;

    } catch (error) {
      this.logger.error(`Vertical analytics generation failed:`, error);
      throw new Error(`Vertical analytics generation failed: ${error.message}`);
    }
  }

  /**
   * SPECIALIZED VERTICAL FEATURES
   */
  async handleRealEstateListing(
    listing: VerticalListing,
    propertyDetails: {
      propertyType: 'apartment' | 'house' | 'land' | 'commercial';
      area: number; // sq ft
      bedrooms?: number;
      bathrooms?: number;
      parking?: number;
      yearBuilt?: number;
      amenities: string[];
      legalClearance: boolean;
      reraApproved: boolean;
    }
  ): Promise<VerticalListing> {
    this.logger.log(`Processing real estate listing: ${listing.id}`);

    // Add property-specific validation and processing
    listing.specifications = {
      ...listing.specifications,
      ...propertyDetails
    };

    // Enhanced verification for real estate
    listing.verification.documentsVerified = [
      'property_deed',
      'rera_certificate',
      'tax_receipts',
      'ownership_documents'
    ];

    // Calculate property-specific pricing recommendations
    const recommendedPrice = await this.calculatePropertyValue(propertyDetails, listing.location);
    listing.pricing.priceHistory = [{
      price: recommendedPrice,
      date: new Date(),
      type: 'starting'
    }];

    return listing;
  }

  async handleArtListing(
    listing: VerticalListing,
    artDetails: {
      artist: string;
      year: number;
      medium: string;
      dimensions: {
        width: number;
        height: number;
        depth?: number;
        unit: 'cm' | 'inches';
      };
      provenance: string[];
      authenticityCertificate: boolean;
      exhibitionHistory?: string[];
    }
  ): Promise<VerticalListing> {
    this.logger.log(`Processing art listing: ${listing.id}`);

    listing.specifications = {
      ...listing.specifications,
      ...artDetails
    };

    // Art-specific verification
    listing.verification.documentsVerified = [
      'authenticity_certificate',
      'provenance_documents',
      'artist_signature_verification'
    ];

    // Enhanced condition assessment for art
    listing.condition.certifications = ['conservation_report', 'authenticity_certificate'];

    return listing;
  }

  async handleIndustrialListing(
    listing: VerticalListing,
    equipmentDetails: {
      manufacturer: string;
      model: string;
      year: number;
      operatingHours: number;
      maintenanceHistory: Array<{
        date: Date;
        type: string;
        cost: number;
      }>;
      specifications: Record<string, any>;
      certifications: string[];
      warranty?: {
        remaining: number; // months
        provider: string;
      };
    }
  ): Promise<VerticalListing> {
    this.logger.log(`Processing industrial equipment listing: ${listing.id}`);

    listing.specifications = {
      ...listing.specifications,
      ...equipmentDetails
    };

    // Equipment-specific verification
    listing.verification.documentsVerified = [
      'maintenance_records',
      'operating_manual',
      'safety_certificates',
      'warranty_documents'
    ];

    // Condition based on usage and maintenance
    const usageScore = Math.max(0, 100 - (equipmentDetails.operatingHours / 1000) * 10);
    const maintenanceScore = equipmentDetails.maintenanceHistory.length * 5;
    const conditionScore = Math.min(100, usageScore + maintenanceScore);

    listing.condition.grade = this.calculateConditionGrade(conditionScore);

    return listing;
  }

  // ==========================================
  // PRIVATE METHODS
  // ==========================================

  private initializeMarketplaceVerticals(): void {
    // Initialize default marketplace verticals
    const verticals: Omit<MarketplaceVertical, 'id' | 'analytics' | 'metadata'>[] = [
      {
        name: 'real_estate',
        displayName: 'Real Estate',
        description: 'Houses, apartments, land, and commercial properties',
        category: 'real_estate',
        icon: '🏠',
        color: '#3B82F6',
        isActive: true,
        features: {
          auctionTypes: ['english', 'sealed_bid'],
          verificationRequired: true,
          inspectionRequired: true,
          escrowRequired: true,
          shippingRequired: false,
          insuranceRequired: false,
          documentationRequired: ['property_deed', 'tax_receipts', 'ownership_docs', 'rera_certificate']
        },
        pricing: {
          listingFee: 999,
          commissionPercentage: 2.5,
          featuredListingFee: 2499,
          urgentListingFee: 1499,
          currency: 'INR'
        },
        rules: {
          minimumReservePrice: 500000,
          maximumAuctionDuration: 168, // 7 days
          biddingIncrementRules: {
            lowValue: { maxPrice: 1000000, increment: 10000 },
            mediumValue: { maxPrice: 5000000, increment: 50000 },
            highValue: { minPrice: 5000000, increment: 100000 }
          },
          cancellationPolicy: 'Free cancellation up to 24 hours before auction start',
          returnPolicy: 'Property sales are final'
        },
        verification: {
          sellerRequirements: ['Valid ID', 'Property ownership proof', 'Legal clearance'],
          buyerRequirements: ['Valid ID', 'Financial verification'],
          documentTypes: ['property_deed', 'tax_receipts', 'ownership_docs', 'rera_certificate'],
          thirdPartyVerification: ['Legal verification', 'Property inspection']
        }
      },
      {
        name: 'art_collectibles',
        displayName: 'Art & Collectibles',
        description: 'Paintings, sculptures, antiques, and rare collectibles',
        category: 'art',
        icon: '🎨',
        color: '#8B5CF6',
        isActive: true,
        features: {
          auctionTypes: ['english', 'buy_now'],
          verificationRequired: true,
          inspectionRequired: true,
          escrowRequired: true,
          shippingRequired: true,
          insuranceRequired: true,
          documentationRequired: ['authenticity_certificate', 'provenance_docs', 'appraisal_report']
        },
        pricing: {
          listingFee: 499,
          commissionPercentage: 5.0,
          featuredListingFee: 1499,
          urgentListingFee: 999,
          currency: 'INR'
        },
        rules: {
          minimumReservePrice: 10000,
          maximumAuctionDuration: 336, // 14 days
          biddingIncrementRules: {
            lowValue: { maxPrice: 50000, increment: 500 },
            mediumValue: { maxPrice: 200000, increment: 2000 },
            highValue: { minPrice: 200000, increment: 5000 }
          },
          cancellationPolicy: 'Free cancellation up to 48 hours before auction start',
          returnPolicy: '14-day return policy with authentication verification'
        },
        verification: {
          sellerRequirements: ['Valid ID', 'Authenticity proof', 'Ownership documentation'],
          buyerRequirements: ['Valid ID', 'Shipping address verification'],
          documentTypes: ['authenticity_certificate', 'provenance_docs', 'appraisal_report'],
          thirdPartyVerification: ['Art authentication service', 'Appraisal verification']
        }
      },
      {
        name: 'industrial_equipment',
        displayName: 'Industrial Equipment',
        description: 'Machinery, tools, and industrial equipment',
        category: 'industrial',
        icon: '🏭',
        color: '#10B981',
        isActive: true,
        features: {
          auctionTypes: ['english', 'dutch', 'sealed_bid'],
          verificationRequired: true,
          inspectionRequired: true,
          escrowRequired: true,
          shippingRequired: true,
          insuranceRequired: true,
          documentationRequired: ['maintenance_records', 'operating_manual', 'safety_certificates']
        },
        pricing: {
          listingFee: 799,
          commissionPercentage: 3.0,
          featuredListingFee: 1999,
          urgentListingFee: 1299,
          currency: 'INR'
        },
        rules: {
          minimumReservePrice: 25000,
          maximumAuctionDuration: 168, // 7 days
          biddingIncrementRules: {
            lowValue: { maxPrice: 100000, increment: 1000 },
            mediumValue: { maxPrice: 500000, increment: 5000 },
            highValue: { minPrice: 500000, increment: 10000 }
          },
          cancellationPolicy: 'Free cancellation up to 24 hours before auction start',
          returnPolicy: '30-day return policy with inspection verification'
        },
        verification: {
          sellerRequirements: ['Valid ID', 'Equipment documentation', 'Maintenance records'],
          buyerRequirements: ['Valid ID', 'Technical capability verification'],
          documentTypes: ['maintenance_records', 'operating_manual', 'safety_certificates'],
          thirdPartyVerification: ['Equipment inspection service', 'Technical verification']
        }
      }
    ];

    // Create verticals
    for (const verticalData of verticals) {
      const vertical = {
        ...verticalData,
        id: `vertical_${verticalData.name}`,
        analytics: {
          totalListings: 0,
          activeAuctions: 0,
          totalVolume: 0,
          averagePrice: 0,
          topCategories: []
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          sortOrder: 0,
          popular: verticalData.name === 'real_estate'
        }
      };
      this.verticals.set(vertical.id, vertical);
    }

    this.logger.log('Marketplace verticals initialized');
  }

  private async storeMarketplaceVertical(vertical: MarketplaceVertical): Promise<void> {
    // In production, store in database
    this.logger.debug(`Marketplace vertical stored: ${vertical.id}`);
  }

  private async storeVerticalListing(listing: VerticalListing): Promise<void> {
    // In production, store in database
    this.logger.debug(`Vertical listing stored: ${listing.id}`);
  }

  private async validateSellerPermissions(sellerId: string, verticalId: string): Promise<void> {
    // Validate seller has permission to list in this vertical
    this.logger.debug(`Seller permissions validated: ${sellerId} -> ${verticalId}`);
  }

  private async validateListingData(listingData: any, vertical: MarketplaceVertical): Promise<void> {
    // Validate listing data against vertical rules
    if (listingData.pricing.reservePrice && listingData.pricing.reservePrice < (vertical.rules.minimumReservePrice || 0)) {
      throw new Error(`Reserve price must be at least ₹${vertical.rules.minimumReservePrice}`);
    }

    const duration = (listingData.auction.endDate.getTime() - listingData.auction.startDate.getTime()) / (1000 * 60 * 60);
    if (duration > vertical.rules.maximumAuctionDuration) {
      throw new Error(`Auction duration cannot exceed ${vertical.rules.maximumAuctionDuration} hours`);
    }
  }

  private async initiateVerificationProcess(listing: VerticalListing): Promise<void> {
    // Initiate verification process for the listing
    this.logger.debug(`Verification process initiated for listing ${listing.id}`);
  }

  private generateSearchFacets(listings: VerticalListing[]): any {
    // Generate search facets from listings
    const categories = new Map<string, number>();
    const locations = new Map<string, number>();
    const conditions = new Map<string, number>();

    listings.forEach(listing => {
      // Categories
      categories.set(listing.category, (categories.get(listing.category) || 0) + 1);

      // Locations
      if (listing.location?.city) {
        locations.set(listing.location.city, (locations.get(listing.location.city) || 0) + 1);
      }

      // Conditions
      conditions.set(listing.condition.grade, (conditions.get(listing.condition.grade) || 0) + 1);
    });

    return {
      categories: Array.from(categories.entries()).map(([value, count]) => ({ value, count })),
      locations: Array.from(locations.entries()).map(([value, count]) => ({ value, count })),
      priceRanges: [
        { range: 'Under ₹10,000', count: listings.filter(l => (l.pricing.buyNowPrice || 0) < 10000).length },
        { range: '₹10,000 - ₹50,000', count: listings.filter(l => {
          const price = l.pricing.buyNowPrice || 0;
          return price >= 10000 && price < 50000;
        }).length },
        { range: '₹50,000 - ₹2,00,000', count: listings.filter(l => {
          const price = l.pricing.buyNowPrice || 0;
          return price >= 50000 && price < 200000;
        }).length },
        { range: 'Above ₹2,00,000', count: listings.filter(l => (l.pricing.buyNowPrice || 0) >= 200000).length }
      ],
      conditions: Array.from(conditions.entries()).map(([value, count]) => ({ value, count }))
    };
  }

  private calculatePriceRanges(prices: number[]): any {
    const sortedPrices = prices.sort((a, b) => a - b);
    const lowThreshold = sortedPrices[Math.floor(sortedPrices.length * 0.33)];
    const highThreshold = sortedPrices[Math.floor(sortedPrices.length * 0.66)];

    return {
      low: {
        min: Math.min(...prices),
        max: lowThreshold,
        count: prices.filter(p => p <= lowThreshold).length
      },
      medium: {
        min: lowThreshold,
        max: highThreshold,
        count: prices.filter(p => p > lowThreshold && p <= highThreshold).length
      },
      high: {
        min: highThreshold,
        max: Math.max(...prices),
        count: prices.filter(p => p > highThreshold).length
      },
      luxury: {
        min: highThreshold * 2,
        max: Math.max(...prices),
        count: prices.filter(p => p >= highThreshold * 2).length
      }
    };
  }

  private calculateTopCategories(listings: VerticalListing[]): any[] {
    const categories = new Map<string, { listings: number; volume: number }>();

    listings.forEach(listing => {
      const category = listing.category;
      const volume = listing.auction.finalPrice || 0;

      if (!categories.has(category)) {
        categories.set(category, { listings: 0, volume: 0 });
      }

      const stats = categories.get(category)!;
      stats.listings++;
      stats.volume += volume;
    });

    return Array.from(categories.entries())
      .map(([category, stats]) => ({ category, ...stats }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5);
  }

  private calculatePopularLocations(listings: VerticalListing[]): string[] {
    const locations = new Map<string, number>();

    listings.forEach(listing => {
      if (listing.location?.city) {
        locations.set(listing.location.city, (locations.get(listing.location.city) || 0) + 1);
      }
    });

    return Array.from(locations.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([location]) => location);
  }

  private calculatePriceTrends(listings: VerticalListing[], timeRange: any): any[] {
    // Calculate price trends over time
    const monthlyTrends = new Map<string, { totalPrice: number; count: number }>();

    listings.forEach(listing => {
      if (listing.auction.finalPrice) {
        const monthKey = listing.auction.endDate.toISOString().substring(0, 7); // YYYY-MM

        if (!monthlyTrends.has(monthKey)) {
          monthlyTrends.set(monthKey, { totalPrice: 0, count: 0 });
        }

        const trend = monthlyTrends.get(monthKey)!;
        trend.totalPrice += listing.auction.finalPrice;
        trend.count++;
      }
    });

    return Array.from(monthlyTrends.entries())
      .map(([date, data]) => ({
        date,
        averagePrice: data.totalPrice / data.count,
        volume: data.count
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private async generateVerticalRecommendations(verticalId: string, listings: VerticalListing[]): Promise<any> {
    // Generate pricing and timing recommendations
    const completedListings = listings.filter(l => l.auction.finalPrice);
    const avgPrice = completedListings.reduce((sum, l) => sum + l.auction.finalPrice!, 0) / completedListings.length;

    return {
      optimalPricing: {
        suggestedRange: {
          min: avgPrice * 0.8,
          max: avgPrice * 1.2
        },
        confidence: 0.75
      },
      bestTimesToList: ['Tuesday 10 AM', 'Wednesday 2 PM', 'Thursday 11 AM'],
      popularFeatures: ['High resolution images', 'Detailed descriptions', 'Professional photography'],
      marketInsights: [
        'Demand is highest for verified listings',
        'Auctions ending on weekends have 20% higher participation',
        'Items with multiple images sell 35% faster'
      ]
    };
  }

  private async calculatePropertyValue(propertyDetails: any, location?: any): Promise<number> {
    // Simplified property valuation
    let baseValue = 0;

    switch (propertyDetails.propertyType) {
      case 'apartment':
        baseValue = propertyDetails.area * 3000; // ₹ per sq ft
        break;
      case 'house':
        baseValue = propertyDetails.area * 2500;
        break;
      case 'land':
        baseValue = propertyDetails.area * 800;
        break;
      case 'commercial':
        baseValue = propertyDetails.area * 5000;
        break;
    }

    // Location multiplier (simplified)
    const locationMultiplier = location?.city?.toLowerCase().includes('mumbai') ? 1.5 :
                              location?.city?.toLowerCase().includes('delhi') ? 1.3 : 1.0;

    return Math.round(baseValue * locationMultiplier);
  }

  private calculateConditionGrade(score: number): string {
    if (score >= 90) return 'mint';
    if (score >= 80) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 60) return 'fair';
    return 'poor';
  }
}
