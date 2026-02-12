import { Injectable } from '@nestjs/common';

export interface UserProfile {
  id: string;
  user_type: string;
  is_verified: boolean;
  verification_status: string;
}

export interface AuctionType {
  type: 'standard' | 'reserve' | 'dutch' | 'tender';
  reservePrice?: number;
  startingPrice: number;
  minimumBid?: number;
  buyNowPrice?: number;
  bidIncrement: number;
  duration: number; // in milliseconds
  dutchDecrement?: number; // for Dutch auctions, price decrease per time interval
  dutchInterval?: number; // time interval for Dutch auctions
}

export interface Wallet {
  userId: string;
  balance: number;
  currency: string;
}

export interface Bid {
  id: number;
  productId: number;
  amount: number;
  bidderId: string;
  bidderName: string;
  createdAt: Date;
}

@Injectable()
export class ProductsService {
  private products: any[] = [
    {
      id: 1,
      title: 'Vintage Watch Collection - Reserve Auction',
      description: 'A beautiful collection of vintage watches from 1960s',
      auctionType: {
        type: 'reserve',
        startingPrice: 10000,
        reservePrice: 18000,
        bidIncrement: 1000,
        duration: 24 * 60 * 60 * 1000, // 24 hours
      },
      currentBid: 15000,
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      images: ['https://picsum.photos/seed/watch1/400/300.jpg'],
      category: 'Watches',
      condition: 'Excellent',
      seller: { id: 'seller1', name: 'John Doe', email: 'john@example.com' },
      highestBid: { amount: 15000, bidder: { id: 'bidder1', name: 'Jane Smith' } },
      bidCount: 5,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      title: 'Rare Book Collection - Dutch Auction',
      description: 'First edition books from renowned authors - Dutch auction starting at ₹10,000',
      auctionType: {
        type: 'dutch',
        startingPrice: 10000,
        bidIncrement: 500,
        duration: 2 * 60 * 60 * 1000, // 2 hours
        dutchDecrement: 100, // decrease by ₹100 every interval
        dutchInterval: 5 * 60 * 1000, // 5 minutes
      },
      currentBid: 10000,
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      images: ['https://picsum.photos/seed/books1/400/300.jpg'],
      category: 'Books',
      condition: 'Good',
      seller: { id: 'seller2', name: 'Jane Smith', email: 'jane@example.com' },
      highestBid: null,
      bidCount: 0,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 3,
      title: 'Bulk Electronics Purchase - Tender Auction',
      description: 'Tender for bulk purchase of electronics - minimum order 50 units',
      auctionType: {
        type: 'tender',
        startingPrice: 50000,
        minimumBid: 45000,
        bidIncrement: 1000,
        duration: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
      currentBid: 50000,
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      images: ['https://picsum.photos/seed/electronics/400/300.jpg'],
      category: 'Electronics',
      condition: 'New',
      seller: { id: 'seller3', name: 'Tech Corp', email: 'sales@techcorp.com' },
      highestBid: null,
      bidCount: 0,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Mock user profiles for verification
  private userProfiles: UserProfile[] = [
    { id: 'seller1', user_type: 'seller', is_verified: true, verification_status: 'approved' },
    { id: 'seller2', user_type: 'seller', is_verified: false, verification_status: 'pending' },
    { id: 'buyer1', user_type: 'buyer', is_verified: true, verification_status: 'approved' },
  ];

  private bids: Bid[] = [
    { id: 1, productId: 1, amount: 15000, bidderId: 'bidder1', bidderName: 'Jane Smith', createdAt: new Date() },
    { id: 2, productId: 1, amount: 12000, bidderId: 'bidder2', bidderName: 'Bob Johnson', createdAt: new Date() },
    { id: 3, productId: 2, amount: 7500, bidderId: 'bidder2', bidderName: 'Bob Johnson', createdAt: new Date() }
  ];

  // In-memory wallet storage
  private wallets: Wallet[] = [
    { userId: 'buyer1', balance: 50000, currency: 'INR' },
    { userId: 'buyer2', balance: 25000, currency: 'INR' },
    { userId: 'seller1', balance: 100000, currency: 'INR' },
    { userId: 'seller2', balance: 75000, currency: 'INR' },
    { userId: 'bidder1', balance: 30000, currency: 'INR' },
    { userId: 'bidder2', balance: 20000, currency: 'INR' }
  ];

  async findAll() {
    return this.products.map(product => ({
      ...product,
      status: product.endTime > new Date() ? 'ACTIVE' : 'CLOSED'
    }));
  }

  async findOne(id: number) {
    const product = this.products.find(p => p.id === id);
    if (!product) {
      return null;
    }

    const productBids = this.bids
      .filter(bid => bid.productId === id)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    return {
      ...product,
      bids: productBids,
      status: product.endTime > new Date() ? 'ACTIVE' : 'CLOSED'
    };
  }

  async create(createProductDto: any, sellerId: string) {
    const newProduct = {
      id: this.products.length + 1,
      ...createProductDto,
      auctionType: createProductDto.auctionType || { type: 'standard', startingPrice: createProductDto.startingPrice, bidIncrement: 1000, duration: 7 * 24 * 60 * 60 * 1000 },
      sellerId,
      currentBid: createProductDto.startingPrice,
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'ACTIVE',
      seller: { id: sellerId, name: 'Demo Seller', email: 'seller@example.com' },
      bidCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.products.push(newProduct);
    return newProduct;
  }

  async placeBid(productId: number, bidAmount: number, bidderId: string, bidderName: string) {
    const product = this.products.find(p => p.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }

    if (product.endTime <= new Date()) {
      throw new Error('Auction has ended');
    }

    const auctionType = product.auctionType || { type: 'standard', startingPrice: product.currentBid || 0, bidIncrement: 1000 };

    // Handle different auction types
    switch (auctionType.type) {
      case 'reserve':
        // Reserve auction: bids below reserve price don't count as winning bids
        if ('reservePrice' in auctionType && auctionType.reservePrice && bidAmount < auctionType.reservePrice) {
          // Allow bidding below reserve, but don't update current bid until reserve is met
          // This is common in reserve auctions - bidders can bid below reserve but it doesn't change the display
          throw new Error(`Bid must be at least ₹${auctionType.reservePrice}. This is a reserve auction.`);
        }
        break;

      case 'dutch':
        // Dutch auction: price decreases over time, bidders can "buy" at current price
        // For Dutch auctions, the bid amount should match the current decreasing price
        const currentDutchPrice = this.calculateDutchPrice(product);
        if (bidAmount < currentDutchPrice) {
          throw new Error(`Dutch auction bid must be at least the current price of ₹${currentDutchPrice}`);
        }
        // Accept the bid at current Dutch price
        bidAmount = currentDutchPrice;
        break;

      case 'tender':
        // Tender auction: bids must be below starting price and meet minimum requirements
        if ('minimumBid' in auctionType && auctionType.minimumBid && bidAmount > auctionType.minimumBid) {
          throw new Error(`Tender bid must be ₹${auctionType.minimumBid} or lower`);
        }
        // For tenders, lower bids win (opposite of standard auctions)
        if (product.highestBid && bidAmount >= product.highestBid.amount) {
          throw new Error('Tender bid must be lower than current lowest bid');
        }
        break;

      case 'standard':
      default:
        // Standard auction: higher bids win
        if (bidAmount <= product.currentBid) {
          throw new Error('Bid must be higher than current bid');
        }
        break;
    }

    // Check wallet balance
    const wallet = this.wallets.find(w => w.userId === bidderId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }
    if (wallet.balance < bidAmount) {
      throw new Error('Insufficient wallet balance');
    }

    // For reserve auctions, only update display if reserve is met
    const shouldUpdateBid = auctionType.type !== 'reserve' || ('reservePrice' in auctionType && bidAmount >= (auctionType.reservePrice || 0));

    if (shouldUpdateBid) {
      // Deduct from wallet
      wallet.balance -= bidAmount;

      // Refund previous highest bidder if exists (except for tenders where lower wins)
      if (product.highestBid && product.highestBid.bidder.id !== bidderId) {
        const previousBidderWallet = this.wallets.find(w => w.userId === product.highestBid.bidder.id);
        if (previousBidderWallet) {
          previousBidderWallet.balance += product.currentBid;
        }
      }

      // Update product current bid
      product.currentBid = bidAmount;
      product.highestBid = { amount: bidAmount, bidder: { id: bidderId, name: bidderName } };
    }

    // Create new bid record
    const newBid = {
      id: this.bids.length + 1,
      productId,
      amount: bidAmount,
      bidderId,
      bidderName,
      createdAt: new Date()
    };

    this.bids.push(newBid);

    // Update product bid count
    product.bidCount = this.bids.filter(b => b.productId === productId).length;
    product.updatedAt = new Date();

    return newBid;
  }

  // Calculate current Dutch auction price
  private calculateDutchPrice(product: any): number {
    const auctionType = product.auctionType;
    if (auctionType.type !== 'dutch' || !auctionType.dutchDecrement || !auctionType.dutchInterval) return product.currentBid;

    const elapsed = Date.now() - product.createdAt.getTime();
    const intervalsPassed = Math.floor(elapsed / auctionType.dutchInterval);
    const priceDecrease = intervalsPassed * auctionType.dutchDecrement;

    const currentPrice = Math.max(
      auctionType.startingPrice - priceDecrease,
      1000 // Minimum price
    );

    return currentPrice;
  }

  // Wallet methods for integration
  async getWalletBalance(userId: string): Promise<number> {
    const wallet = this.wallets.find(w => w.userId === userId);
    return wallet ? wallet.balance : 0;
  }

  async addWalletFunds(userId: string, amount: number): Promise<{ success: boolean; newBalance?: number }> {
    const wallet = this.wallets.find(w => w.userId === userId);
    if (!wallet) {
      this.wallets.push({ userId, balance: amount, currency: 'INR' });
      return { success: true, newBalance: amount };
    }
    wallet.balance += amount;
    return { success: true, newBalance: wallet.balance };
  }

  // Bulk creation method
  async bulkCreate(bulkProductDto: any, sellerId: string) {
    const { quantity = 1, ...productData } = bulkProductDto;
    const createdProducts = [];

    for (let i = 0; i < quantity; i++) {
      const newProduct = {
        id: this.products.length + 1,
        title: `${productData.title} #${i + 1}`,
        description: productData.description,
        startingPrice: productData.startingBid || productData.startingPrice,
        currentBid: productData.startingBid || productData.startingPrice,
        buyNowPrice: productData.buyNowPrice,
        auctionType: { type: 'standard', startingPrice: productData.startingPrice, bidIncrement: 1000, duration: 7 * 24 * 60 * 60 * 1000 },
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        images: productData.images || ['https://picsum.photos/seed/product/400/300.jpg'],
        category: productData.category || 'Other',
        condition: productData.condition || 'Good',
        fuel: productData.fuel,
        transmission: productData.transmission,
        year: productData.year,
        mileage: productData.mileage,
        seller: { 
          id: sellerId, 
          name: 'Company Seller', 
          email: 'company@quickmela.com' 
        },
        highestBid: null,
        bidCount: 0,
        status: 'ACTIVE',
        isBulkListing: true,
        bulkQuantity: quantity,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.products.push(newProduct);
      createdProducts.push(newProduct);
    }

    return {
      message: `Successfully created ${quantity} products`,
      products: createdProducts
    };
  }

  // Get products by seller
  async getMyProducts(sellerId: string) {
    const sellerProducts = this.products.filter(product => product.seller.id === sellerId);
    
    return {
      products: sellerProducts,
      total: sellerProducts.length,
      active: sellerProducts.filter(p => p.status === 'ACTIVE').length,
      sold: sellerProducts.filter(p => p.status === 'SOLD').length
    };
  }

  // Verify seller authentication and verification status
  async verifySeller(sellerId: string): Promise<void> {
    // Find user profile
    const profile: UserProfile | undefined = this.userProfiles.find(p => p.id === sellerId);

    if (!profile) {
      throw new Error('User not found');
    }

    if (profile.user_type !== 'seller') {
      throw new Error('Only sellers can create product listings');
    }

    if (!profile.is_verified || profile.verification_status !== 'approved') {
      throw new Error('Seller account must be verified before creating products. Please complete the verification process.');
    }
  }
}