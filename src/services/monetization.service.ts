// 💰 MONETIZATION SERVICE - CHOOSE ONE FIRST
// src/services/monetization.service.ts

export interface MonetizationConfig {
  type: 'subscription' | 'commission' | 'featured';
  enabled: boolean;
  settings: {
    subscription?: {
      basic: {
        price: number;
        features: string[];
      };
      professional: {
        price: number;
        features: string[];
      };
      enterprise: {
        price: number;
        features: string[];
      };
    };
    commission?: {
      buyerRate: number; // percentage
      sellerRate: number; // percentage
      platformFee: number; // percentage
      minimumFee: number;
    };
    featured?: {
      homepage: {
        price: number;
        duration: number; // days
        impressions: string;
      };
      category: {
        price: number;
        duration: number; // days
        impressions: string;
      };
      promoted: {
        price: number;
        duration: number; // days
        visibility: string;
      };
    };
  };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: 'basic' | 'professional' | 'enterprise';
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  isActive: boolean;
  userCount: number;
  revenue: number;
  createdAt: Date;
}

export interface CommissionTransaction {
  id: string;
  auctionId: string;
  sellerId: string;
  buyerId: string;
  finalPrice: number;
  buyerCommission: number;
  sellerCommission: number;
  platformFee: number;
  totalCommission: number;
  transactionDate: Date;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod?: string;
}

export interface FeaturedListing {
  id: string;
  listingId: string;
  sellerId: string;
  type: 'homepage' | 'category' | 'promoted';
  price: number;
  duration: number; // days
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  impressions: number;
  clicks: number;
  revenue: number;
}

export interface MonetizationMetrics {
  totalRevenue: number;
  revenueByType: {
    subscription: number;
    commission: number;
    featured: number;
  };
  activeSubscriptions: number;
  subscriptionRevenue: number;
  commissionRevenue: number;
  featuredRevenue: number;
  averageOrderValue: number;
  willingnessToPay: number;
  pricingDropOffRate: number;
}

export class MonetizationService {
  private config: MonetizationConfig;
  private subscriptions: Map<string, SubscriptionPlan> = new Map();
  private transactions: Map<string, CommissionTransaction> = new Map();
  private featuredListings: Map<string, FeaturedListing> = new Map();

  constructor() {
    this.config = {
      type: 'commission', // Start with commission
      enabled: true,
      settings: {
        commission: {
          buyerRate: 2.5, // 2.5%
          sellerRate: 5.0, // 5.0%
          platformFee: 1.5, // 1.5%
          minimumFee: 5.00
        }
      }
    };
    
    this.initializeMonetization();
  }

  // Initialize monetization system
  private initializeMonetization(): void {
    // Load from localStorage (will be replaced with backend API)
    const savedConfig = localStorage.getItem('monetizationConfig');
    if (savedConfig) {
      this.config = JSON.parse(savedConfig);
    }

    const savedSubscriptions = localStorage.getItem('subscriptions');
    if (savedSubscriptions) {
      const subs = JSON.parse(savedSubscriptions);
      subs.forEach((sub: SubscriptionPlan) => {
        this.subscriptions.set(sub.id, sub);
      });
    }

    const savedTransactions = localStorage.getItem('commissionTransactions');
    if (savedTransactions) {
      const txs = JSON.parse(savedTransactions);
      txs.forEach((tx: CommissionTransaction) => {
        this.transactions.set(tx.id, tx);
      });
    }

    const savedFeatured = localStorage.getItem('featuredListings');
    if (savedFeatured) {
      const featured = JSON.parse(savedFeatured);
      featured.forEach((f: FeaturedListing) => {
        this.featuredListings.set(f.id, f);
      });
    }
  }

  // Set monetization configuration
  setMonetizationConfig(config: MonetizationConfig): void {
    this.config = config;
    localStorage.setItem('monetizationConfig', JSON.stringify(config));
    console.log('💰 Monetization config updated:', config.type);
  }

  // Create subscription plan
  createSubscriptionPlan(plan: Omit<SubscriptionPlan, 'id' | 'revenue' | 'createdAt' | 'userCount'>): SubscriptionPlan {
    const subscription: SubscriptionPlan = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...plan,
      isActive: true,
      userCount: 0,
      revenue: 0,
      createdAt: new Date()
    };

    this.subscriptions.set(subscription.id, subscription);
    
    // Save to localStorage
    const allSubscriptions = Array.from(this.subscriptions.values());
    localStorage.setItem('subscriptions', JSON.stringify(allSubscriptions));

    console.log('💰 Subscription plan created:', subscription.id, subscription.name);
    
    return subscription;
  }

  // Get subscription plan
  getSubscriptionPlan(planId: string): SubscriptionPlan | null {
    return this.subscriptions.get(planId) || null;
  }

  // Get all subscription plans
  getSubscriptionPlans(): SubscriptionPlan[] {
    return Array.from(this.subscriptions.values()).sort((a, b) => {
      const priceA = a.type === 'enterprise' ? 3 : a.type === 'professional' ? 2 : 1;
      const priceB = b.type === 'enterprise' ? 3 : b.type === 'professional' ? 2 : 1;
      return priceA - priceB;
    });
  }

  // Subscribe user to plan
  async subscribeToPlan(userId: string, planId: string): Promise<SubscriptionPlan> {
    const plan = this.subscriptions.get(planId);
    if (!plan) {
      throw new Error(`Subscription plan not found: ${planId}`);
    }

    // Update user count
    plan.userCount++;
    plan.revenue += plan.price;

    // Update subscription
    this.subscriptions.set(planId, plan);
    
    // Save to localStorage
    const allSubscriptions = Array.from(this.subscriptions.values());
    localStorage.setItem('subscriptions', JSON.stringify(allSubscriptions));

    console.log('💰 User subscribed:', userId, 'to plan:', plan.name);
    
    // In production, this would handle payment processing
    return plan;
  }

  // Cancel subscription
  async cancelSubscription(userId: string, planId: string): Promise<void> {
    const plan = this.subscriptions.get(planId);
    if (!plan) {
      throw new Error(`Subscription plan not found: ${planId}`);
    }

    // Update user count
    plan.userCount--;
    plan.isActive = false;

    // Update subscription
    this.subscriptions.set(planId, plan);
    
    // Save to localStorage
    const allSubscriptions = Array.from(this.subscriptions.values());
    localStorage.setItem('subscriptions', JSON.stringify(allSubscriptions));

    console.log('💰 Subscription cancelled:', userId, 'from plan:', plan.name);
    
    // In production, this would handle refund processing
  }

  // Calculate commission
  calculateCommission(
    finalPrice: number,
    buyerId: string,
    sellerId: string,
    auctionId: string
  ): {
    buyerCommission: number;
    sellerCommission: number;
    platformFee: number;
    totalCommission: number;
  } {
    if (this.config.type !== 'commission' || !this.config.settings.commission) {
      return {
        buyerCommission: 0,
        sellerCommission: 0,
        platformFee: 0,
        totalCommission: 0
      };
    }

    const { buyerRate, sellerRate, platformFee, minimumFee } = this.config.settings.commission;

    // Calculate commissions
    const buyerCommissionAmount = Math.max(finalPrice * (buyerRate / 100), minimumFee);
    const sellerCommissionAmount = Math.max(finalPrice * (sellerRate / 100), minimumFee);
    const platformFeeAmount = Math.max(finalPrice * (platformFee / 100), minimumFee);

    return {
      buyerCommission: buyerCommissionAmount,
      sellerCommission: sellerCommissionAmount,
      platformFee: platformFeeAmount,
      totalCommission: buyerCommissionAmount + sellerCommissionAmount + platformFeeAmount
    };
  }

  // Record commission transaction
  recordCommissionTransaction(
    auctionId: string,
    sellerId: string,
    buyerId: string,
    finalPrice: number
  ): CommissionTransaction {
    const { buyerCommission, sellerCommission, platformFee, totalCommission } = this.calculateCommission(
      finalPrice,
      buyerId,
      sellerId,
      auctionId
    );

    const transaction: CommissionTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      auctionId,
      sellerId,
      buyerId,
      finalPrice,
      buyerCommission,
      sellerCommission,
      platformFee,
      totalCommission,
      transactionDate: new Date(),
      status: 'pending'
    };

    this.transactions.set(transaction.id, transaction);
    
    // Save to localStorage
    const allTransactions = Array.from(this.transactions.values());
    localStorage.setItem('commissionTransactions', JSON.stringify(allTransactions));

    console.log('💰 Commission recorded:', transaction.id, 'total:', totalCommission);
    
    return transaction;
  }

  // Update transaction status
  updateTransactionStatus(transactionId: string, status: 'completed' | 'failed'): void {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error(`Transaction not found: ${transactionId}`);
    }

    transaction.status = status;
    
    // Update transaction
    this.transactions.set(transactionId, transaction);
    
    // Save to localStorage
    const allTransactions = Array.from(this.transactions.values());
    localStorage.setItem('commissionTransactions', JSON.stringify(allTransactions));

    console.log('💰 Transaction status updated:', transactionId, status);
  }

  // Create featured listing
  createFeaturedListing(
    listingId: string,
    sellerId: string,
    type: 'homepage' | 'category' | 'promoted',
    duration: number,
    price: number
  ): FeaturedListing {
    const featured: FeaturedListing = {
      id: `featured-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      listingId,
      sellerId,
      type,
      price,
      duration,
      startDate: new Date(),
      endDate: new Date(Date.now() + (duration * 24 * 60 * 60 * 1000)),
      isActive: true,
      impressions: 0,
      clicks: 0,
      revenue: price
    };

    this.featuredListings.set(featured.id, featured);
    
    // Save to localStorage
    const allFeatured = Array.from(this.featuredListings.values());
    localStorage.setItem('featuredListings', JSON.stringify(allFeatured));

    console.log('💰 Featured listing created:', featured.id, 'type:', type);
    
    return featured;
  }

  // Get featured listing
  getFeaturedListing(listingId: string): FeaturedListing | null {
    return this.featuredListings.get(listingId) || null;
  }

  // Get all featured listings
  getFeaturedListings(): FeaturedListing[] {
    return Array.from(this.featuredListings.values()).filter(f => f.isActive);
  }

  // Update featured listing metrics
  updateFeaturedListingMetrics(listingId: string, impressions: number, clicks: number): void {
    const featured = this.featuredListings.get(listingId);
    if (!featured) return;

    featured.impressions = impressions;
    featured.clicks = clicks;
    
    // Update featured
    this.featuredListings.set(listingId, featured);
    
    // Save to localStorage
    const allFeatured = Array.from(this.featuredListings.values());
    localStorage.setItem('featuredListings', JSON.stringify(allFeatured));

    console.log('💰 Featured listing metrics updated:', listingId);
  }

  // Get monetization metrics
  getMonetizationMetrics(): MonetizationMetrics {
    const allSubscriptions = Array.from(this.subscriptions.values());
    const allTransactions = Array.from(this.transactions.values());
    const allFeatured = Array.from(this.featuredListings.values());

    const subscriptionRevenue = allSubscriptions
      .filter(s => s.isActive)
      .reduce((sum, s) => sum + s.revenue, 0);

    const commissionRevenue = allTransactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.totalCommission, 0);

    const featuredRevenue = allFeatured
      .filter(f => f.isActive)
      .reduce((sum, f) => sum + f.revenue, 0);

    const totalRevenue = subscriptionRevenue + commissionRevenue + featuredRevenue;

    return {
      totalRevenue,
      revenueByType: {
        subscription: subscriptionRevenue,
        commission: commissionRevenue,
        featured: featuredRevenue
      },
      activeSubscriptions: allSubscriptions.filter(s => s.isActive).length,
      subscriptionRevenue,
      commissionRevenue,
      featuredRevenue,
      averageOrderValue: allTransactions.length > 0 
        ? allTransactions.reduce((sum, t) => sum + t.finalPrice, 0) / allTransactions.length 
        : 0,
      willingnessToPay: 75, // Placeholder - would be calculated from user feedback
      pricingDropOffRate: 12 // Placeholder - would be calculated from user feedback
    };
  }

  // Test willingness to pay (placeholder)
  testWillingnessToPay(price: number, userId: string): {
    willing: boolean;
    maxPrice: number;
    confidence: number;
  } {
    // In production, this would be calculated from user behavior
    // For now, return a simple heuristic
    const maxPrice = price * 1.5; // Users typically willing to pay up to 50% more
    const confidence = price < 100 ? 0.8 : 0.6;
    
    return {
      willing: price <= maxPrice,
      maxPrice,
      confidence
    };
  }

  // Test pricing drop-off (placeholder)
  testPricingDropOff(originalPrice: number, newPrice: number): {
    dropOffRate: number;
    elasticity: number;
    recommendation: string;
  } {
    const priceIncrease = ((newPrice - originalPrice) / originalPrice) * 100;
    
    // Simple elasticity model
    const dropOffRate = Math.max(0, Math.min(priceIncrease * 0.8, 50)); // Max 50% drop-off
    const elasticity = dropOffRate / priceIncrease;
    
    let recommendation = 'Proceed';
    if (priceIncrease > 20) {
      recommendation = 'Consider smaller increase';
    } else if (priceIncrease > 10) {
      recommendation = 'Monitor closely';
    }

    return {
      dropOffRate,
      elasticity,
      recommendation
    };
  }

  // Get current monetization config
  getMonetizationConfig(): MonetizationConfig {
    return this.config;
  }

  // Enable/disable monetization type
  setMonetizationType(type: 'subscription' | 'commission' | 'featured'): void {
    this.config.type = type;
    this.config.enabled = true;
    
    // Update settings for the new type
    switch (type) {
      case 'subscription':
        this.config.settings = {
          subscription: {
            basic: {
              price: 29.99,
              features: ['Up to 10 listings', 'Basic analytics', 'Email support']
            },
            professional: {
              price: 99.99,
              features: ['Up to 50 listings', 'Advanced analytics', 'Priority support', 'Enhanced profile']
            },
            enterprise: {
              price: 299.99,
              features: ['Unlimited listings', 'Premium analytics', 'Dedicated support', 'Custom branding', 'API access']
            }
          }
        };
        break;
      case 'commission':
        this.config.settings = {
          commission: {
            buyerRate: 2.5,
            sellerRate: 5.0,
            platformFee: 1.5,
            minimumFee: 5.00
          }
        };
        break;
      case 'featured':
        this.config.settings = {
          featured: {
            homepage: {
              price: 50.00,
              duration: 7,
              impressions: '10,000+ views'
            },
            category: {
              price: 25.00,
              duration: 7,
              impressions: '5,000+ views'
            },
            promoted: {
              price: 15.00,
              duration: 3,
              visibility: 'Increased exposure'
            }
          }
        };
        break;
    }
    
    localStorage.setItem('monetizationConfig', JSON.stringify(this.config));
    console.log('💰 Monetization type set to:', type);
  }
}

export default MonetizationService;
